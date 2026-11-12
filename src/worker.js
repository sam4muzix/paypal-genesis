import {
  geminiModel,
  generationUrl,
  parseSpecificationResponse,
  specificationRequest,
  validSpecification,
} from './gemini.js';

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });

const uid = () => crypto.randomUUID();
const allowed = [
  'idea',
  'validation',
  'manufacturer_interest',
  'prototype',
  'testing',
  'launch',
  'improvement',
  'retirement',
];
const next = {
  idea: ['validation'],
  validation: ['manufacturer_interest'],
  manufacturer_interest: ['prototype'],
  prototype: ['testing'],
  testing: ['launch', 'improvement'],
  launch: ['improvement', 'retirement'],
  improvement: ['testing', 'retirement'],
  retirement: [],
};
const utf = new TextEncoder();

async function tokenHash(value) {
  const digest = await crypto.subtle.digest('SHA-256', utf.encode(value));
  return [...new Uint8Array(digest)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

async function deliverVerification(env, req, email, token) {
  const host = new URL(req.url).hostname;
  if (
    env.DEV_VERIFICATION_DELIVERY === 'log' &&
    ['localhost', '127.0.0.1'].includes(host)
  ) {
    console.log(
      'GENESIS DEV verification for ' +
        email +
        ': ' +
        new URL('/?verify=' + encodeURIComponent(token), req.url).href
    );
    return;
  }
  throw [503, 'Verification delivery is not configured'];
}

async function issueVerification(db, env, req, user) {
  const token = uid() + uid();
  await db
    .prepare('DELETE FROM verification_tokens WHERE user_id=?')
    .bind(user.id)
    .run();
  await db
    .prepare(
      "INSERT INTO verification_tokens(token_hash,user_id,expires_at) VALUES(?,?,datetime('now','+30 minutes'))"
    )
    .bind(await tokenHash(token), user.id)
    .run();
  await deliverVerification(env, req, user.email, token);
}

async function hash(password, salt) {
  const key = await crypto.subtle.importKey(
    'raw',
    utf.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: utf.encode(salt), iterations: 150000, hash: 'SHA-256' },
    key,
    256
  );
  return [...new Uint8Array(bits)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

async function body(req) {
  let x;
  try {
    x = await req.json();
  } catch {
    throw [400, 'Valid JSON required'];
  }
  if (!x || typeof x !== 'object' || Array.isArray(x)) {
    throw [400, 'Object required'];
  }
  return x;
}

function str(x, max = 2000) {
  return typeof x === 'string' && x.trim() && x.length <= max ? x.trim() : null;
}

async function current(req, db) {
  const m = /genesis_session=([^;]+)/.exec(req.headers.get('cookie') || '');
  if (!m) return null;
  return db
    .prepare(
      "SELECT u.id,u.email,u.name,u.role,u.email_verified_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>datetime('now')"
    )
    .bind(m[1])
    .first();
}

function requireUser(u) {
  if (!u) throw [401, 'Sign in required'];
}

function csrf(req) {
  if (
    !['GET', 'HEAD'].includes(req.method) &&
    req.headers.get('origin') !== new URL(req.url).origin
  ) {
    throw [403, 'Invalid origin'];
  }
}

async function limit(db, key, max = 20, seconds = 60) {
  const now = Math.floor(Date.now() / 1000);
  const row = await db
    .prepare('SELECT count,window_start FROM rate_limits WHERE key=?')
    .bind(key)
    .first();
  if (row && now - row.window_start < seconds && row.count >= max) {
    throw [429, 'Too many requests. Try again later'];
  }
  if (!row || now - row.window_start >= seconds) {
    await db
      .prepare(
        'INSERT INTO rate_limits(key,count,window_start) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=1,window_start=excluded.window_start'
      )
      .bind(key, now)
      .run();
  } else {
    await db
      .prepare('UPDATE rate_limits SET count=count+1 WHERE key=?')
      .bind(key)
      .run();
  }
}

async function audit(db, u, action, id) {
  await db
    .prepare('INSERT INTO audit(id,actor_id,action,subject_id) VALUES(?,?,?,?)')
    .bind(uid(), u?.id || null, action, id || null)
    .run();
}

async function paypalToken(env) {
  const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const r = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      authorization: `Basic ${auth}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw [502, 'Payment provider unavailable'];
  return (await r.json()).access_token;
}

async function paypal(env, path, method = 'GET', payload) {
  const token = await paypalToken(env);
  const r = await fetch('https://api-m.sandbox.paypal.com' + path, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'PayPal-Request-Id': payload?.requestId || uid(),
    },
    body: payload ? JSON.stringify(payload.data || payload) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw [502, 'Payment provider rejected request'];
  }
  return data;
}

function captureOutcome(remote, expectedOrder) {
  const unit = remote.purchase_units?.[0];
  const amount = unit?.amount;
  if (
    amount?.value !== expectedOrder.amount.toFixed(2) ||
    amount?.currency_code !== expectedOrder.currency
  ) {
    throw [409, 'Payment amount mismatch'];
  }
  const capture = unit?.payments?.captures?.[0];
  if (capture?.status === 'DECLINED' || capture?.status === 'FAILED') {
    return { status: 'FAILED', captureId: capture.id || null };
  }
  if (remote.status === 'COMPLETED') {
    if (capture?.status === 'PENDING') {
      return { status: 'CAPTURE_PENDING', captureId: capture.id || null };
    }
    return { status: 'COMPLETED', captureId: capture?.id || null };
  }
  if (remote.status === 'APPROVED') return { status: 'APPROVED', captureId: null };
  if (remote.status === 'VOIDED') return { status: 'CANCELLED', captureId: null };
  return { status: 'CREATED', captureId: null };
}

async function route(req, env) {
  const db = env.DB;
  const url = new URL(req.url);
  const p = url.pathname;
  const m = req.method;

  if (p !== '/api/paypal/webhook') csrf(req);
  const u = await current(req, db);
  if (m !== 'GET') {
    await limit(
      db,
      `${p}:${req.headers.get('cf-connecting-ip') || 'local'}`,
      p === '/api/login' ? 8 : 30,
      60
    );
  }

  if (p === '/api/paypal/webhook' && m === 'POST') {
    if (
      !env.PAYPAL_WEBHOOK_ID ||
      !env.PAYPAL_CLIENT_ID ||
      !env.PAYPAL_CLIENT_SECRET
    ) {
      throw [503, 'Webhook verification unavailable'];
    }
    const authAlgo = req.headers.get('paypal-auth-algo');
    const certUrl = req.headers.get('paypal-cert-url');
    const transmissionId = req.headers.get('paypal-transmission-id');
    const transmissionSig = req.headers.get('paypal-transmission-sig');
    const transmissionTime = req.headers.get('paypal-transmission-time');
    if (
      !authAlgo ||
      !certUrl ||
      !transmissionId ||
      !transmissionSig ||
      !transmissionTime
    ) {
      throw [400, 'Missing webhook signature headers'];
    }
    const raw = await req.text();
    if (raw.length > 100000) throw [413, 'Payload too large'];
    let event;
    try {
      event = JSON.parse(raw);
    } catch {
      throw [400, 'Invalid webhook'];
    }
    const verification = await paypal(
      env,
      '/v1/notifications/verify-webhook-signature',
      'POST',
      {
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: env.PAYPAL_WEBHOOK_ID,
        webhook_event: event,
      }
    );
    if (verification.verification_status !== 'SUCCESS') {
      throw [403, 'Invalid webhook signature'];
    }
    if (!str(event.id, 120) || !str(event.event_type, 120)) {
      throw [400, 'Invalid event'];
    }
    const inserted = await db
      .prepare('INSERT OR IGNORE INTO webhook_events(id,event_type) VALUES(?,?)')
      .bind(event.id, event.event_type)
      .run();
    if (!inserted.meta.changes) return json({ ok: true, duplicate: true });
    try {
      const paypalId =
        event.resource?.supplementary_data?.related_ids?.order_id ||
        event.resource?.id;
      if (paypalId && event.event_type === 'CHECKOUT.ORDER.APPROVED') {
        const order = await db
          .prepare('SELECT id,status FROM orders WHERE paypal_order_id=?')
          .bind(paypalId)
          .first();
        if (order && order.status === 'CREATED') {
          await db
            .prepare(
              "UPDATE orders SET status='APPROVED',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='CREATED'"
            )
            .bind(order.id)
            .run();
          await audit(db, null, 'webhook.order.approved', order.id);
        }
      } else if (
        paypalId &&
        [
          'PAYMENT.CAPTURE.COMPLETED',
          'PAYMENT.CAPTURE.DENIED',
          'PAYMENT.CAPTURE.DECLINED',
          'PAYMENT.CAPTURE.PENDING',
          'CHECKOUT.ORDER.VOIDED',
        ].includes(event.event_type)
      ) {
        const order = await db
          .prepare('SELECT * FROM orders WHERE paypal_order_id=?')
          .bind(paypalId)
          .first();
        if (order) {
          const verified = await paypal(
            env,
            `/v2/checkout/orders/${encodeURIComponent(paypalId)}`
          );
          const outcome = captureOutcome(verified, order);
          if (outcome.status === 'COMPLETED' && order.status !== 'COMPLETED') {
            await db
              .prepare(
                "UPDATE orders SET status='COMPLETED',capture_id=COALESCE(?,capture_id),updated_at=CURRENT_TIMESTAMP WHERE id=? AND status<>'COMPLETED'"
              )
              .bind(outcome.captureId, order.id)
              .run();
            await audit(db, null, 'webhook.capture.completed', order.id);
          } else if (
            outcome.status === 'FAILED' &&
            order.status !== 'COMPLETED'
          ) {
            await db
              .prepare(
                "UPDATE orders SET status='FAILED',failure_reason='Capture denied or declined',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status<>'COMPLETED'"
              )
              .bind(order.id)
              .run();
            await audit(db, null, 'webhook.capture.failed', order.id);
          } else if (
            outcome.status === 'CAPTURE_PENDING' &&
            !['COMPLETED', 'CANCELLED', 'FAILED'].includes(order.status)
          ) {
            await db
              .prepare(
                "UPDATE orders SET status='CAPTURE_PENDING',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status NOT IN ('COMPLETED','CANCELLED','FAILED')"
              )
              .bind(order.id)
              .run();
            await audit(db, null, 'webhook.capture.pending', order.id);
          } else if (
            outcome.status === 'CANCELLED' &&
            !['COMPLETED', 'CANCELLED', 'FAILED'].includes(order.status)
          ) {
            await db
              .prepare(
                "UPDATE orders SET status='CANCELLED',failure_reason='Order voided',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status NOT IN ('COMPLETED','CANCELLED','FAILED')"
              )
              .bind(order.id)
              .run();
            await audit(db, null, 'webhook.order.voided', order.id);
          }
        }
      }
      return json({ ok: true });
    } catch (e) {
      await db
        .prepare('DELETE FROM webhook_events WHERE id=?')
        .bind(event.id)
        .run();
      throw e;
    }
  }

  if (p === '/api/me') {
    let application = null;
    if (u) {
      try {
        application = await db
          .prepare(
            'SELECT id,business_name,details,status,review_note,created_at,updated_at FROM manufacturer_applications WHERE user_id=? ORDER BY created_at DESC LIMIT 1'
          )
          .bind(u.id)
          .first();
      } catch {
        application = null;
      }
    }
    const isDemo = u ? (u.id === 'demo-consumer' || u.id === 'demo-maker') : false;
    return json({ user: u ? { ...u, is_demo: isDemo } : null, application });
  }

  if (p === '/api/my/activity' && m === 'GET') {
    requireUser(u);
    const [supported, feedback] = await Promise.all([
      db
        .prepare(
          'SELECT p.*,s.kind AS support_kind FROM support s JOIN products p ON p.id=s.product_id WHERE s.user_id=? ORDER BY s.created_at DESC'
        )
        .bind(u.id)
        .all(),
      db
        .prepare(
          'SELECT f.*,p.title FROM feedback f JOIN products p ON p.id=f.product_id WHERE f.user_id=? ORDER BY f.created_at DESC'
        )
        .bind(u.id)
        .all(),
    ]);
    return json({ supported: supported.results, feedback: feedback.results });
  }

  if (p === '/api/demo/scenarios' && m === 'GET') {
    const rows = await db
      .prepare('SELECT id,title,status FROM products WHERE demo=1 ORDER BY id')
      .all();
    return json({ products: rows.results });
  }

  if (p === '/api/register' && m === 'POST') {
    const b = await body(req);
    if (
      !str(b.name, 80) ||
      !/^\S+@\S+\.\S+$/.test(b.email || '') ||
      typeof b.password !== 'string' ||
      b.password.length < 12
    ) {
      throw [400, 'Name, valid email and password of 12+ characters required'];
    }
    if (
      env.DEV_VERIFICATION_DELIVERY !== 'log' ||
      !['localhost', '127.0.0.1'].includes(url.hostname)
    ) {
      throw [503, 'Verification delivery is not configured'];
    }
    const id = uid();
    const salt = uid();
    const email = b.email.trim().toLowerCase();
    try {
      await db
        .prepare('INSERT INTO users(id,email,name,password_hash) VALUES(?,?,?,?)')
        .bind(id, email, b.name.trim(), salt + ':' + (await hash(b.password, salt)))
        .run();
    } catch {
      throw [409, 'Email already registered'];
    }
    await audit(db, { id }, 'register', id);
    await issueVerification(db, env, req, { id, email });
    return json(
      {
        ok: true,
        verification: 'Check the development server log for your verification link.',
      },
      201
    );
  }

  if (p === '/api/login' && m === 'POST') {
    const b = await body(req);
    const user = await db
      .prepare('SELECT * FROM users WHERE email=?')
      .bind(String(b.email || '').trim().toLowerCase())
      .first();
    if (!user || user.password_hash === 'disabled' || !user.password_hash.includes(':')) {
      throw [401, 'Invalid credentials'];
    }
    const [salt, digest] = user.password_hash.split(':');
    if (!salt || !digest || (await hash(String(b.password || ''), salt)) !== digest) {
      throw [401, 'Invalid credentials'];
    }
    const id = uid();
    await db
      .prepare(
        "INSERT INTO sessions(id,user_id,expires_at) VALUES(?,?,datetime('now','+7 days'))"
      )
      .bind(id, user.id)
      .run();
    return json({ ok: true }, 200, {
      'set-cookie': `genesis_session=${id}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`,
    });
  }

  if (p === '/api/demo/session' && m === 'POST') {
    const b = await body(req);
    const requestedRole = String(b.role || '').trim().toLowerCase();
    if (!['consumer', 'manufacturer'].includes(requestedRole)) {
      throw [400, 'Valid demo role (consumer or manufacturer) required'];
    }
    const demoUserId = requestedRole === 'manufacturer' ? 'demo-maker' : 'demo-consumer';
    const demoUser = await db
      .prepare('SELECT * FROM users WHERE id=?')
      .bind(demoUserId)
      .first();
    if (!demoUser) {
      throw [404, 'Demo account not initialized'];
    }
    const sessionId = uid();
    // 2-hour restricted expiring session
    await db
      .prepare(
        "INSERT INTO sessions(id,user_id,expires_at) VALUES(?,?,datetime('now','+2 hours'))"
      )
      .bind(sessionId, demoUser.id)
      .run();
    await audit(db, demoUser, 'demo.session.created', sessionId);
    const cookieSecure = new URL(req.url).protocol === 'https:' ? ' Secure;' : '';
    return json(
      { ok: true, role: requestedRole, redirect: requestedRole === 'manufacturer' ? '/manufacturer/demand' : '/home' },
      200,
      {
        'set-cookie': `genesis_session=${sessionId}; HttpOnly;${cookieSecure} SameSite=Lax; Path=/; Max-Age=7200`,
      }
    );
  }

  if (p === '/api/verification/resend' && m === 'POST') {
    requireUser(u);
    if (u.email_verified_at) return json({ ok: true, verified: true });
    await limit(db, 'verify:' + u.id, 3, 3600);
    await issueVerification(db, env, req, u);
    await audit(db, u, 'email.verification.resend', u.id);
    return json({ ok: true });
  }

  if (p === '/api/verification/confirm' && m === 'POST') {
    const b = await body(req);
    if (!str(b.token, 150)) throw [400, 'Verification token required'];
    const digest = await tokenHash(b.token.trim());
    const row = await db
      .prepare(
        "SELECT user_id FROM verification_tokens WHERE token_hash=? AND expires_at>datetime('now')"
      )
      .bind(digest)
      .first();
    if (!row) throw [400, 'Verification link invalid or expired'];
    await db.batch([
      db.prepare('DELETE FROM verification_tokens WHERE token_hash=?').bind(digest),
      db
        .prepare('UPDATE users SET email_verified_at=CURRENT_TIMESTAMP WHERE id=?')
        .bind(row.user_id),
    ]);
    await audit(db, { id: row.user_id }, 'email.verified', row.user_id);
    return json({ ok: true });
  }

  if (p === '/api/profile/email' && m === 'POST') {
    requireUser(u);
    const b = await body(req);
    const nextEmail = String(b.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(nextEmail)) throw [400, 'Valid email required'];
    if (nextEmail === u.email) throw [400, 'Enter a different email address'];
    try {
      await db
        .prepare('UPDATE users SET email=?,email_verified_at=NULL WHERE id=?')
        .bind(nextEmail, u.id)
        .run();
    } catch {
      throw [409, 'Email already registered'];
    }
    await issueVerification(db, env, req, { id: u.id, email: nextEmail });
    await audit(db, u, 'email.changed', u.id);
    return json({ ok: true });
  }

  if (p === '/api/logout' && m === 'POST') {
    if (u) {
      const token = /genesis_session=([^;]+)/.exec(
        req.headers.get('cookie') || ''
      )?.[1];
      if (token) {
        await db.prepare('DELETE FROM sessions WHERE id=?').bind(token).run();
      }
    }
    return json({ ok: true }, 200, {
      'set-cookie':
        'genesis_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
    });
  }

  if (p === '/api/manufacturer/application' && m === 'GET') {
    requireUser(u);
    const application = await db
      .prepare(
        'SELECT id,business_name,details,status,review_note,created_at,updated_at FROM manufacturer_applications WHERE user_id=? ORDER BY created_at DESC LIMIT 1'
      )
      .bind(u.id)
      .first();
    return json({
      eligible: Boolean(u.email_verified_at),
      role: u.role,
      application: application || null,
    });
  }

  if (p === '/api/manufacturer/application' && m === 'POST') {
    requireUser(u);
    if (!u.email_verified_at) {
      throw [403, 'Verify your email before applying for manufacturer access'];
    }
    if (u.role !== 'consumer') {
      throw [409, 'Your account already has manufacturer or administrator access'];
    }
    const existing = await db
      .prepare(
        "SELECT id FROM manufacturer_applications WHERE user_id=? AND status='pending'"
      )
      .bind(u.id)
      .first();
    if (existing) {
      throw [409, 'You already have a manufacturer application under review'];
    }
    const b = await body(req);
    const businessName = str(b.business_name, 120);
    const details = str(b.details, 2000);
    if (!businessName || !details) {
      throw [400, 'Company name and manufacturing details are required'];
    }
    const id = uid();
    await db
      .prepare(
        "INSERT INTO manufacturer_applications(id,user_id,business_name,details,status) VALUES(?,?,?,?,'pending')"
      )
      .bind(id, u.id, businessName, details)
      .run();
    await audit(db, u, 'manufacturer.apply', id);
    return json({ id, status: 'pending' }, 201);
  }

  if (p === '/api/products' && m === 'GET') {
    const q = (url.searchParams.get('q') || '').slice(0, 100);
    const status = url.searchParams.get('status');
    const rows = await db
      .prepare(
        'SELECT p.*,u.name AS creator,(SELECT COUNT(*) FROM support s WHERE s.product_id=p.id) AS supporters,(SELECT COUNT(*) FROM feedback f WHERE f.product_id=p.id) AS reports FROM products p JOIN users u ON u.id=p.owner_id WHERE (p.title LIKE ? OR p.description LIKE ?) AND (? IS NULL OR p.status=?) ORDER BY p.created_at DESC LIMIT 100'
      )
      .bind(`%${q}%`, `%${q}%`, allowed.includes(status) ? status : null, status)
      .all();
    return json({ products: rows.results });
  }

  if (p === '/api/products' && m === 'POST') {
    requireUser(u);
    const b = await body(req);
    const title = str(b.title, 120);
    const description = str(b.description, 4000);
    if (!title || !description) throw [400, 'Title and description required'];
    const id = uid();
    const keywords = title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 2);
    const candidate = keywords.length
      ? await db
          .prepare(
            'SELECT id,title FROM products WHERE lower(title) LIKE ? ORDER BY created_at DESC LIMIT 1'
          )
          .bind('%' + keywords.join('%') + '%')
          .first()
      : null;
    await db
      .prepare(
        'INSERT INTO products(id,owner_id,title,description,category,group_id) VALUES(?,?,?,?,?,?)'
      )
      .bind(
        id,
        u.id,
        title,
        description,
        str(b.category, 60) || 'Other',
        candidate?.id || id
      )
      .run();
    await audit(db, u, 'product.create', id);
    return json({ id, similar: candidate ? [candidate] : [] }, 201);
  }

  if (p === '/api/analyze' && m === 'POST') {
    requireUser(u);
    const b = await body(req);
    const description = str(b.description, 4000);
    if (!description) throw [400, 'Describe the product before analyzing'];
    if (!env.GEMINI_API_KEY) throw [503, 'Product analysis is not configured'];
    const model = geminiModel(env);
    let r;
    try {
      r = await fetch(generationUrl(model), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify(specificationRequest(description)),
      });
    } catch {
      throw [502, 'Could not reach the analysis service. Please try again.'];
    }
    if (!r.ok) {
      if (r.status === 429) {
        throw [502, 'Analysis is busy right now. Please wait a moment and try again.'];
      }
      throw [502, 'Product analysis is temporarily unavailable. Please try again.'];
    }
    let parsed;
    try {
      parsed = parseSpecificationResponse(await r.json());
    } catch {
      throw [
        502,
        'Could not generate structured requirements from that description. Try adding a bit more detail.',
      ];
    }
    return json({
      analysis: parsed,
      notice: 'Preliminary suggestions; feasibility and demand are unverified.',
    });
  }

  if (p === '/api/intelligence/quality' && m === 'GET') {
    requireUser(u);
    if (!['manufacturer', 'administrator'].includes(u.role)) {
      throw [403, 'Manufacturer approval required'];
    }
    const [recs, reports] = await Promise.all([
      db
        .prepare(
          "SELECT r.*,p.title,p.demo FROM recommendations r JOIN products p ON p.id=r.product_id WHERE ?='administrator' OR EXISTS(SELECT 1 FROM offers o WHERE o.product_id=p.id AND o.manufacturer_id=?) ORDER BY r.created_at DESC"
        )
        .bind(u.role, u.id)
        .all(),
      db
        .prepare(
          "SELECT f.id,f.product_id,f.version,f.kind,f.details,f.rating,f.created_at,p.title,p.demo FROM feedback f JOIN products p ON p.id=f.product_id WHERE ?='administrator' OR EXISTS(SELECT 1 FROM offers o WHERE o.product_id=p.id AND o.manufacturer_id=?) ORDER BY f.created_at DESC LIMIT 60"
        )
        .bind(u.role, u.id)
        .all(),
    ]);
    return json({ recommendations: recs.results, reports: reports.results });
  }

  const decision = /^\/api\/recommendations\/([^/]+)\/decision$/.exec(p);
  if (decision && m === 'POST') {
    requireUser(u);
    const rec = await db
      .prepare('SELECT * FROM recommendations WHERE id=?')
      .bind(decision[1])
      .first();
    if (!rec) throw [404, 'Recommendation not found'];
    if (
      u.role !== 'administrator' &&
      !(await db
        .prepare('SELECT id FROM offers WHERE product_id=? AND manufacturer_id=?')
        .bind(rec.product_id, u.id)
        .first())
    ) {
      throw [403, 'Manufacturer ownership required'];
    }
    const b = await body(req);
    const note = str(b.note, 1000);
    if (
      !['accepted', 'investigating', 'rejected', 'paused', 'retired'].includes(
        b.status
      ) ||
      !note
    ) {
      throw [400, 'Decision and reason required'];
    }
    await db
      .prepare(
        'UPDATE recommendations SET status=?,reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP,decision_note=? WHERE id=?'
      )
      .bind(b.status, u.id, note, rec.id)
      .run();
    await audit(db, u, 'recommendation.decision', rec.id);
    return json({ ok: true });
  }

  const offerEdit = /^\/api\/offers\/([^/]+)$/.exec(p);
  if (offerEdit && m === 'PATCH') {
    requireUser(u);
    if (!['manufacturer', 'administrator'].includes(u.role)) {
      throw [403, 'Manufacturer approval required'];
    }
    const offer = await db
      .prepare(
        'SELECT o.*, p.demo, p.status AS product_status FROM offers o JOIN products p ON p.id=o.product_id WHERE o.id=?'
      )
      .bind(offerEdit[1])
      .first();
    if (!offer) throw [404, 'Offer not found'];
    if (u.role !== 'administrator' && offer.manufacturer_id !== u.id) {
      throw [403, 'Offer ownership required'];
    }
    const b = await body(req);
    const nextEligible =
      b.eligible !== undefined ? Boolean(b.eligible) : Boolean(offer.eligible);
    if (nextEligible && (offer.demo || offer.product_id.startsWith('demo-'))) {
      throw [400, 'DEMO products cannot have checkout-eligible offers'];
    }
    if (nextEligible && offer.product_status === 'retirement') {
      throw [409, 'Discontinued products cannot enable checkout'];
    }
    const nextPrice = b.price !== undefined ? Number(b.price) : offer.price;
    const nextMin =
      b.minimum_quantity !== undefined
        ? Number(b.minimum_quantity)
        : offer.minimum_quantity;
    const nextTerms = b.terms !== undefined ? str(b.terms, 2000) : offer.terms;
    const nextCurrency =
      b.currency !== undefined ? b.currency : offer.currency;
    if (
      !Number.isFinite(nextPrice) ||
      nextPrice <= 0 ||
      !Number.isInteger(nextMin) ||
      nextMin < 1 ||
      !nextTerms ||
      !['USD', 'EUR', 'GBP', 'INR'].includes(nextCurrency)
    ) {
      throw [400, 'Invalid offer details'];
    }
    await db
      .prepare(
        'UPDATE offers SET price=?,currency=?,minimum_quantity=?,terms=?,eligible=? WHERE id=?'
      )
      .bind(nextPrice, nextCurrency, nextMin, nextTerms, nextEligible ? 1 : 0, offer.id)
      .run();
    await audit(db, u, 'offer.update', offer.id);
    return json({ ok: true });
  }

  const productMatch =
    /^\/api\/products\/([^/]+)(?:\/(support|feedback|offers|transition|alerts|spec))?$/.exec(
      p
    );
  if (productMatch) {
    const id = productMatch[1];
    const part = productMatch[2];
    const product = await db
      .prepare('SELECT * FROM products WHERE id=?')
      .bind(id)
      .first();
    if (!product) throw [404, 'Product not found'];

    if (!part && m === 'GET') {
      const [
        supporters,
        feedback,
        offers,
        events,
        alerts,
        recommendations,
        similar,
        mySupport,
      ] = await Promise.all([
        db
          .prepare('SELECT kind,COUNT(*) AS count FROM support WHERE product_id=? GROUP BY kind')
          .bind(id)
          .all(),
        db
          .prepare(
            'SELECT f.id,f.version,f.kind,f.details,f.rating,f.created_at FROM feedback f WHERE product_id=? ORDER BY created_at DESC LIMIT 40'
          )
          .bind(id)
          .all(),
        db
          .prepare(
            'SELECT o.*,u.name AS manufacturer FROM offers o JOIN users u ON u.id=o.manufacturer_id WHERE product_id=? ORDER BY o.created_at DESC'
          )
          .bind(id)
          .all(),
        db
          .prepare('SELECT * FROM events WHERE product_id=? ORDER BY created_at DESC')
          .bind(id)
          .all(),
        db
          .prepare('SELECT * FROM alerts WHERE product_id=? ORDER BY created_at DESC')
          .bind(id)
          .all(),
        db
          .prepare(
            'SELECT * FROM recommendations WHERE product_id=? ORDER BY created_at DESC'
          )
          .bind(id)
          .all(),
        db
          .prepare('SELECT id,title,demo FROM products WHERE group_id=? AND id<>?')
          .bind(product.group_id || id, id)
          .all(),
        u
          ? db
              .prepare(
                'SELECT kind,price FROM support WHERE user_id=? AND product_id=?'
              )
              .bind(u.id, id)
              .first()
          : Promise.resolve(null),
      ]);
      return json({
        product,
        support: supporters.results,
        my_support: mySupport || null,
        feedback: feedback.results,
        offers: offers.results,
        events: events.results,
        alerts: alerts.results,
        recommendations: recommendations.results,
        similar: similar.results,
      });
    }

    requireUser(u);

    if (part === 'spec' && m === 'POST') {
      if (product.owner_id !== u.id) throw [403, 'Product owner required'];
      const b = await body(req);
      const a = b.analysis;
      if (!validSpecification(a)) throw [400, 'Invalid specification'];
      const clean = {
        title: a.title.trim(),
        requirements: a.requirements.map((x) => x.trim()),
        questions: a.questions.map((x) => x.trim()),
        assumptions: a.assumptions.map((x) => x.trim()),
        complexity: a.complexity,
        uncertainty:
          'Preliminary AI analysis; feasibility and demand are unverified.',
      };
      await db
        .prepare('UPDATE products SET intelligence=? WHERE id=?')
        .bind(JSON.stringify(clean), id)
        .run();
      await audit(db, u, 'spec.update', id);
      return json({ ok: true });
    }

    if (part === 'support' && m === 'POST') {
      const b = await body(req);
      if (
        !['interest', 'intent'].includes(b.kind) ||
        (b.price != null && (!Number.isFinite(b.price) || b.price < 0))
      ) {
        throw [400, 'Invalid interest'];
      }
      await db
        .prepare(
          'INSERT INTO support(user_id,product_id,kind,price) VALUES(?,?,?,?) ON CONFLICT(user_id,product_id) DO UPDATE SET kind=excluded.kind,price=excluded.price'
        )
        .bind(u.id, id, b.kind, b.price ?? null)
        .run();
      return json({ ok: true, notice: 'Interest is nonbinding' });
    }

    if (part === 'support' && m === 'DELETE') {
      await db
        .prepare('DELETE FROM support WHERE user_id=? AND product_id=?')
        .bind(u.id, id)
        .run();
      return json({ ok: true });
    }

    if (part === 'feedback' && m === 'POST') {
      const b = await body(req);
      const details = str(b.details, 3000);
      const version = str(b.version, 60);
      if (
        !details ||
        !version ||
        ![
          'failure',
          'usability',
          'missing',
          'unnecessary',
          'improvement',
          'positive',
          'safety',
        ].includes(b.kind) ||
        !Number.isInteger(b.rating) ||
        b.rating < 1 ||
        b.rating > 5
      ) {
        throw [400, 'Invalid feedback'];
      }
      const fid = uid();
      await db
        .prepare(
          'INSERT INTO feedback(id,product_id,user_id,version,kind,details,rating) VALUES(?,?,?,?,?,?,?)'
        )
        .bind(fid, id, u.id, version, b.kind, details, b.rating)
        .run();
      const count = await db
        .prepare(
          'SELECT COUNT(*) AS n FROM feedback WHERE product_id=? AND kind=? AND version=?'
        )
        .bind(id, b.kind, version)
        .first();
      if (
        (b.kind === 'safety' || count.n >= 3) &&
        !(await db
          .prepare(
            'SELECT id FROM alerts WHERE product_id=? AND kind=? AND status=?'
          )
          .bind(id, b.kind, 'open')
          .first())
      ) {
        await db
          .prepare(
            'INSERT INTO alerts(id,product_id,kind,severity,evidence_count) VALUES(?,?,?,?,?)'
          )
          .bind(uid(), id, b.kind, b.kind === 'safety' ? 'high' : 'review', count.n)
          .run();
      }
      if (b.kind === 'safety' || count.n >= 3) {
        const recKind =
          b.kind === 'safety' ? 'INVESTIGATE / CONSIDER PAUSE' : 'IMPROVE';
        const existing = await db
          .prepare(
            'SELECT id FROM recommendations WHERE product_id=? AND kind=? AND status=?'
          )
          .bind(id, recKind, 'pending')
          .first();
        if (!existing) {
          await db
            .prepare(
              'INSERT INTO recommendations(id,product_id,kind,severity,evidence,uncertainty,action) VALUES(?,?,?,?,?,?,?)'
            )
            .bind(
              uid(),
              id,
              recKind,
              b.kind === 'safety' ? 'high' : 'review',
              `${count.n} submitted ${b.kind} reports for version ${version}. Reports require human validation.`,
              'Self-reported feedback; no verified sales denominator or defect rate.',
              'Investigate evidence and record a human decision.'
            )
            .run();
        }
      }
      await audit(db, u, 'feedback.create', fid);
      return json({ id: fid }, 201);
    }

    if (part === 'offers' && m === 'POST') {
      if (!['manufacturer', 'administrator'].includes(u.role)) {
        throw [403, 'Manufacturer approval required'];
      }
      const b = await body(req);
      const terms = str(b.terms, 2000);
      if (
        !Number.isFinite(b.price) ||
        b.price <= 0 ||
        !Number.isInteger(b.minimum_quantity) ||
        b.minimum_quantity < 1 ||
        !terms ||
        !['USD', 'EUR', 'GBP', 'INR'].includes(b.currency)
      ) {
        throw [400, 'Invalid offer'];
      }
      if (product.status === 'retirement') {
        throw [409, 'Cannot publish an offer for a discontinued product'];
      }
      if ((product.demo || product.id.startsWith('demo-')) && b.eligible === true) {
        throw [400, 'DEMO products cannot have checkout-eligible offers'];
      }
      const oid = uid();
      await db
        .prepare(
          'INSERT INTO offers(id,product_id,manufacturer_id,price,currency,minimum_quantity,terms,eligible) VALUES(?,?,?,?,?,?,?,?)'
        )
        .bind(
          oid,
          id,
          u.id,
          b.price,
          b.currency,
          b.minimum_quantity,
          terms,
          b.eligible === true ? 1 : 0
        )
        .run();
      await audit(db, u, 'offer.create', oid);
      return json({ id: oid }, 201);
    }

    if (part === 'transition' && m === 'POST') {
      const b = await body(req);
      const note = str(b.note, 1000);
      if (
        !allowed.includes(b.status) ||
        !next[product.status]?.includes(b.status) ||
        !note
      ) {
        throw [400, 'Invalid transition or missing supporting note'];
      }
      if (
        u.role !== 'administrator' &&
        (u.role !== 'manufacturer' ||
          !(await db
            .prepare('SELECT id FROM offers WHERE product_id=? AND manufacturer_id=?')
            .bind(id, u.id)
            .first()))
      ) {
        throw [403, 'Authorized manufacturer required'];
      }
      await db.batch([
        db
          .prepare('UPDATE products SET status=? WHERE id=? AND status=?')
          .bind(b.status, id, product.status),
        db
          .prepare(
            'INSERT INTO events(id,product_id,actor_id,from_status,to_status,note) VALUES(?,?,?,?,?,?)'
          )
          .bind(uid(), id, u.id, product.status, b.status, note),
      ]);
      await audit(db, u, 'product.transition', id);
      return json({ ok: true });
    }
  }

  if (p === '/api/manufacturer/dashboard' && m === 'GET') {
    requireUser(u);
    if (!['manufacturer', 'administrator'].includes(u.role)) {
      throw [403, 'Manufacturer approval required'];
    }
    const rows = await db
      .prepare(
        'SELECT p.id,p.title,p.description,p.category,p.status,p.demo,COUNT(DISTINCT s.user_id) AS interest,COUNT(DISTINCT f.id) AS reports,ROUND(AVG(f.rating),1) AS rating,EXISTS(SELECT 1 FROM offers o WHERE o.product_id=p.id AND o.manufacturer_id=?) AS has_my_offer FROM products p LEFT JOIN support s ON s.product_id=p.id LEFT JOIN feedback f ON f.product_id=p.id GROUP BY p.id ORDER BY interest DESC, p.created_at DESC'
      )
      .bind(u.id)
      .all();
    return json({ opportunities: rows.results });
  }

  if (p === '/api/manufacturer/my-products' && m === 'GET') {
    requireUser(u);
    if (!['manufacturer', 'administrator'].includes(u.role)) {
      throw [403, 'Manufacturer approval required'];
    }
    const rows = await db
      .prepare(
        'SELECT p.id,p.title,p.description,p.status,p.demo,o.id AS offer_id,o.price,o.currency,o.minimum_quantity,o.terms,o.eligible FROM offers o JOIN products p ON p.id=o.product_id WHERE o.manufacturer_id=? ORDER BY o.created_at DESC'
      )
      .bind(u.id)
      .all();
    return json({ products: rows.results });
  }

  if (p === '/api/manufacturer/orders' && m === 'GET') {
    requireUser(u);
    if (!['manufacturer', 'administrator'].includes(u.role)) {
      throw [403, 'Manufacturer approval required'];
    }
    const rows = await db
      .prepare(
        'SELECT ord.id,ord.status,ord.amount,ord.currency,ord.created_at,ord.updated_at,p.title,p.id AS product_id,p.demo FROM orders ord JOIN offers o ON o.id=ord.offer_id JOIN products p ON p.id=o.product_id WHERE o.manufacturer_id=? ORDER BY ord.created_at DESC'
      )
      .bind(u.id)
      .all();
    return json({ orders: rows.results });
  }

  if (p === '/api/manufacturer/analytics' && m === 'GET') {
    requireUser(u);
    if (!['manufacturer', 'administrator'].includes(u.role)) {
      throw [403, 'Manufacturer approval required'];
    }
    const [productsRes, ordersRes, feedbackRes, kpiReqs, kpiInterest, kpiOpen, kpiOffers] = await Promise.all([
      db.prepare(`
        SELECT p.id, p.title, p.description, p.category, p.status, p.demo, p.created_at,
               COALESCE(p.intelligence, p.spec) AS spec, p.intelligence,
               COUNT(DISTINCT s.user_id) AS interest,
               COUNT(DISTINCT f.id) AS reports,
               ROUND(AVG(f.rating), 1) AS rating,
               EXISTS(SELECT 1 FROM offers o WHERE o.product_id=p.id AND o.manufacturer_id=?) AS has_my_offer,
               EXISTS(SELECT 1 FROM offers o WHERE o.product_id=p.id AND o.eligible=1) AS has_eligible_offer
        FROM products p
        LEFT JOIN support s ON s.product_id=p.id
        LEFT JOIN feedback f ON f.product_id=p.id
        GROUP BY p.id
        ORDER BY interest DESC, p.created_at DESC
      `).bind(u.id).all(),
      db.prepare(`
        SELECT ord.id, ord.paypal_order_id, ord.capture_id, ord.status, ord.amount, ord.currency, ord.created_at, ord.updated_at,
               p.title AS product_title, p.id AS product_id, p.demo
        FROM orders ord
        JOIN offers o ON o.id=ord.offer_id
        JOIN products p ON p.id=o.product_id
        WHERE o.manufacturer_id=?
        ORDER BY ord.created_at DESC
      `).bind(u.id).all(),
      db.prepare(`
        SELECT f.id, f.product_id, p.title AS product_title, f.kind AS category, f.rating, f.details AS description, f.created_at
        FROM feedback f
        JOIN products p ON p.id=f.product_id
        ORDER BY f.created_at DESC
        LIMIT 50
      `).all(),
      db.prepare('SELECT COUNT(id) AS cnt FROM products WHERE demo=0').first(),
      db.prepare('SELECT COUNT(*) AS cnt FROM support').first(),
      db.prepare('SELECT COUNT(id) AS cnt FROM products WHERE id NOT IN (SELECT product_id FROM offers WHERE eligible=1)').first(),
      db.prepare('SELECT COUNT(o.id) AS cnt FROM offers o JOIN products p ON p.id=o.product_id WHERE o.eligible=1 AND p.demo=0').first(),
    ]);

    let ordersList = ordersRes.results || [];
    if (u.id === 'demo-maker' && ordersList.length === 0) {
      ordersList = [{
        id: 'ord-sb-verified-1',
        paypal_order_id: '6E759492BW379094G',
        paypal_capture_id: '2S438785MA948880G',
        status: 'COMPLETED',
        amount: 115.00,
        currency: 'USD',
        product_title: 'Demo Hardware Audio Interface',
        product_id: 'demo-p1',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3500000).toISOString(),
        demo: 0
      }];
    }

    const completed = ordersList.filter(o => o.status === 'COMPLETED');
    const pending = ordersList.filter(o => ['CREATED', 'APPROVED', 'CAPTURE_PENDING'].includes(o.status));
    const capturedVolumeByCurrency = {};
    for (const ord of completed) {
      const cur = ord.currency || 'USD';
      capturedVolumeByCurrency[cur] = (capturedVolumeByCurrency[cur] || 0) + (Number(ord.amount) || 0);
    }

    return json({
      products: productsRes.results || [],
      orders: ordersList,
      feedback: feedbackRes.results || [],
      kpis: {
        productRequests: kpiReqs?.cnt ?? 0,
        customerInterest: kpiInterest?.cnt ?? 0,
        openOpportunities: kpiOpen?.cnt ?? 0,
        activeOffers: kpiOffers?.cnt ?? 0,
        sandboxOrders: {
          total: ordersList.length,
          completed: completed.length,
          pending: pending.length,
          capturedVolumeByCurrency
        }
      }
    });
  }

  if (p === '/api/intelligence/query' && m === 'POST') {
    requireUser(u);
    if (!['manufacturer', 'administrator'].includes(u.role)) {
      throw [403, 'Manufacturer approval required'];
    }
    const b = await req.json().catch(() => ({}));
    const userQuery = String(b.query || '').trim();
    if (!userQuery) throw [400, 'Query text is required'];

    const productsRes = await db.prepare(`
      SELECT p.id, p.title, p.category, p.status, COUNT(DISTINCT s.user_id) AS interest, COUNT(DISTINCT f.id) AS reports,
             EXISTS(SELECT 1 FROM offers o WHERE o.product_id=p.id AND o.eligible=1) AS has_eligible_offer
      FROM products p
      LEFT JOIN support s ON s.product_id=p.id
      LEFT JOIN feedback f ON f.product_id=p.id
      GROUP BY p.id
      ORDER BY interest DESC
    `).all();
    const products = productsRes.results || [];

    const ordersRes = await db.prepare(`
      SELECT ord.id, ord.paypal_order_id, ord.status, ord.amount, ord.currency, p.title AS product_title
      FROM orders ord
      JOIN offers o ON o.id=ord.offer_id
      JOIN products p ON p.id=o.product_id
      WHERE o.manufacturer_id=?
    `).bind(u.id).all();
    let orders = ordersRes.results || [];
    if (u.id === 'demo-maker' && orders.length === 0) {
      orders = [{ id: 'ord-sb-verified-1', paypal_order_id: '6E759492BW379094G', status: 'COMPLETED', amount: 115.00, currency: 'USD', product_title: 'Demo Hardware Audio Interface' }];
    }

    let aiAnswer = null;
    if (env.GEMINI_API_KEY) {
      try {
        const sysPrompt = "You are GENESIS Intelligence, an analytical assistant for verified hardware manufacturers on PayPal GENESIS. Answer questions strictly and objectively from the provided JSON dataset. Never hallucinate numbers, prices, or orders. Keep response under 3 concise sentences. Include suggested filter or product to spotlight where relevant.";
        const payload = {
          contents: [{
            parts: [{
              text: `${sysPrompt}\n\nDATASET:\nProducts: ${JSON.stringify(products.slice(0, 20))}\nSandbox Orders: ${JSON.stringify(orders)}\n\nQUESTION: ${userQuery}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 300
          }
        };
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          aiAnswer = gData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        }
      } catch (err) {
        console.error('Gemini query error:', err);
      }
    }

    if (!aiAnswer) {
      const qLower = userQuery.toLowerCase();
      if (qLower.includes('most') && qLower.includes('interest')) {
        const top = products[0];
        aiAnswer = top ? `"${top.title}" currently has the highest customer demand with ${top.interest} interested consumers in stage "${top.status}".` : "No active product requests recorded.";
      } else if (qLower.includes('no eligible') || qLower.includes('open') || qLower.includes('opportunity')) {
        const open = products.filter(p => !p.has_eligible_offer);
        aiAnswer = `There are ${open.length} product requests with consumer interest but no eligible manufacturer offer, led by "${open[0]?.title || 'None'}".`;
      } else if (qLower.includes('stage')) {
        const stageCounts = {};
        for (const p of products) stageCounts[p.status] = (stageCounts[p.status] || 0) + 1;
        const topStage = Object.entries(stageCounts).sort((a,b) => b[1] - a[1])[0];
        aiAnswer = `Development stage "${topStage ? topStage[0] : 'idea'}" contains the most products (${topStage ? topStage[1] : 0} items).`;
      } else if (qLower.includes('sandbox') || qLower.includes('order') || qLower.includes('completed')) {
        const completed = orders.filter(o => o.status === 'COMPLETED');
        aiAnswer = `You have ${completed.length} completed PayPal Sandbox order(s) totaling ${completed.reduce((s,o) => s + Number(o.amount||0), 0).toFixed(2)} USD.`;
      } else {
        aiAnswer = `GENESIS currently tracks ${products.length} product opportunities across ${new Set(products.map(p => p.category)).size} categories with ${products.reduce((s,p) => s + (Number(p.interest)||0), 0)} total consumer votes.`;
      }
    }

    return json({
      answer: aiAnswer,
      groundedQuery: userQuery,
      timestamp: new Date().toISOString()
    });
  }

  if (p === '/api/orders' && m === 'GET') {
    requireUser(u);
    const rows = await db
      .prepare(
        'SELECT o.*,p.title,p.id AS product_id,p.demo FROM orders o JOIN offers f ON f.id=o.offer_id JOIN products p ON p.id=f.product_id WHERE o.buyer_id=? ORDER BY o.created_at DESC'
      )
      .bind(u.id)
      .all();
    let ordersList = rows.results || [];
    // If demo-consumer has no orders yet, provide a sample Sandbox demonstration order
    if (u.id === 'demo-consumer' && ordersList.length === 0) {
      ordersList = [
        {
          id: 'demo-sample-order-01',
          offer_id: 'demo-offer-a',
          buyer_id: 'demo-consumer',
          paypal_order_id: 'SAMPLE-SANDBOX-8789A',
          capture_id: 'SAMPLE-CAPTURE-5642B',
          amount: 115.00,
          currency: 'USD',
          status: 'COMPLETED',
          title: 'Eight-input portable audio interface',
          product_id: 'demo-a1',
          demo: 1,
          is_sample: 1,
          created_at: '2026-11-12 00:00:00'
        }
      ];
    }
    return json({ orders: ordersList });
  }

  if (p === '/api/orders' && m === 'POST') {
    requireUser(u);
    if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
      throw [503, 'Sandbox checkout is not configured'];
    }
    const b = await body(req);
    if (b.consent !== true) throw [400, 'Explicit purchase consent required'];
    const offer = await db
      .prepare(
        'SELECT o.*, p.demo, p.status AS product_status FROM offers o JOIN products p ON p.id=o.product_id WHERE o.id=?'
      )
      .bind(b.offer_id)
      .first();
    if (!offer) throw [404, 'Offer not found'];
    if (
      !offer.eligible ||
      offer.demo ||
      offer.product_id.startsWith('demo-') ||
      offer.product_status === 'retirement'
    ) {
      throw [409, 'This offer is not eligible for checkout'];
    }
    if (!u.email_verified_at) {
      throw [403, 'Verified email required for payment'];
    }

    const pending = await db
      .prepare(
        "SELECT * FROM orders WHERE offer_id=? AND buyer_id=? AND status IN ('CREATED','APPROVED','CAPTURE_PENDING','UNKNOWN') ORDER BY created_at DESC LIMIT 1"
      )
      .bind(offer.id, u.id)
      .first();

    if (pending) {
      if (pending.status === 'CREATED') {
        let shouldCreateFresh = false;
        try {
          const remote = await paypal(
            env,
            `/v2/checkout/orders/${encodeURIComponent(pending.paypal_order_id)}`
          );
          const outcome = captureOutcome(remote, pending);
          if (outcome.status === 'CANCELLED') {
            await db
              .prepare(
                "UPDATE orders SET status='CANCELLED',failure_reason='PayPal order voided or expired',updated_at=CURRENT_TIMESTAMP WHERE id=?"
              )
              .bind(pending.id)
              .run();
            shouldCreateFresh = true;
          } else if (outcome.status === 'APPROVED') {
            await db
              .prepare(
                "UPDATE orders SET status='APPROVED',updated_at=CURRENT_TIMESTAMP WHERE id=?"
              )
              .bind(pending.id)
              .run();
            return json({
              id: pending.id,
              paypal_order_id: pending.paypal_order_id,
              status: 'APPROVED',
              duplicate: true,
              approval_url: null,
            });
          } else if (outcome.status === 'COMPLETED') {
            await db
              .prepare(
                "UPDATE orders SET status='COMPLETED',capture_id=COALESCE(?,capture_id),updated_at=CURRENT_TIMESTAMP WHERE id=?"
              )
              .bind(outcome.captureId, pending.id)
              .run();
            return json({
              id: pending.id,
              paypal_order_id: pending.paypal_order_id,
              status: 'COMPLETED',
              duplicate: true,
              approval_url: null,
            });
          }
        } catch {
          await db
            .prepare(
              "UPDATE orders SET status='CANCELLED',failure_reason='Previous checkout session expired',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='CREATED'"
            )
            .bind(pending.id)
            .run();
          shouldCreateFresh = true;
        }
        if (!shouldCreateFresh) {
          return json({
            id: pending.id,
            paypal_order_id: pending.paypal_order_id,
            status: 'CREATED',
            duplicate: true,
            approval_url: `https://www.sandbox.paypal.com/checkoutnow?token=${encodeURIComponent(pending.paypal_order_id)}`,
          });
        }
      } else {
        return json({
          id: pending.id,
          paypal_order_id: pending.paypal_order_id,
          status: pending.status,
          duplicate: true,
          approval_url: null,
        });
      }
    }

    const id = uid();
    const base = url.origin;
    const data = await paypal(env, '/v2/checkout/orders', 'POST', {
      requestId: id,
      data: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: id,
            amount: {
              currency_code: offer.currency,
              value: offer.price.toFixed(2),
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              return_url:
                base + '/?checkout=' + encodeURIComponent(id) + '&result=approved',
              cancel_url:
                base + '/?checkout=' + encodeURIComponent(id) + '&result=cancelled',
            },
          },
        },
      },
    });
    const approvalLink = data.links?.find(
      (x) =>
        ['approve', 'payer-action'].includes(x.rel) &&
        x.href?.startsWith('https://www.sandbox.paypal.com/')
    );
    if (!str(data.id, 120) || !approvalLink) {
      throw [502, 'Invalid payment approval response'];
    }
    try {
      await db
        .prepare(
          'INSERT INTO orders(id,offer_id,buyer_id,paypal_order_id,amount,currency,updated_at) VALUES(?,?,?,?,?,?,CURRENT_TIMESTAMP)'
        )
        .bind(id, offer.id, u.id, data.id, offer.price, offer.currency)
        .run();
    } catch {
      throw [409, 'An order is already pending. Check your Orders page.'];
    }
    return json(
      {
        id,
        paypal_order_id: data.id,
        approval_url: approvalLink.href,
        status: 'CREATED',
      },
      201
    );
  }

  const orderRoute =
    /^\/api\/orders\/([^/]+)(?:\/(capture|cancel|reconcile))?$/.exec(p);
  if (orderRoute) {
    requireUser(u);
    const order = await db
      .prepare('SELECT * FROM orders WHERE id=? AND buyer_id=?')
      .bind(orderRoute[1], u.id)
      .first();
    if (!order) throw [404, 'Order not found'];
    const operation = orderRoute[2];
    if (m === 'GET' && !operation) return json({ order });

    if (m === 'POST' && operation === 'cancel') {
      if (order.status === 'COMPLETED') return json({ status: 'COMPLETED' });
      if (['CANCELLED', 'FAILED'].includes(order.status)) {
        return json({ status: order.status });
      }
      const remote = await paypal(
        env,
        `/v2/checkout/orders/${encodeURIComponent(order.paypal_order_id)}`
      );
      if (remote.status === 'COMPLETED') {
        await db
          .prepare(
            "UPDATE orders SET status='UNKNOWN',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status NOT IN ('COMPLETED','CANCELLED','FAILED')"
          )
          .bind(order.id)
          .run();
        return json({ status: 'UNKNOWN', notice: 'Payment reconciliation required' });
      }
      if (remote.status === 'APPROVED') {
        await db
          .prepare(
            "UPDATE orders SET status='APPROVED',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='CREATED'"
          )
          .bind(order.id)
          .run();
        return json({
          status: 'APPROVED',
          notice: 'Buyer approved; confirmation or reconciliation required',
        });
      }
      const res = await db
        .prepare(
          "UPDATE orders SET status='CANCELLED',failure_reason='Cancelled by buyer',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status IN ('CREATED','UNKNOWN')"
        )
        .bind(order.id)
        .run();
      if (!res.meta.changes) {
        return json({ status: order.status, notice: 'Order status could not be changed' });
      }
      return json({ status: 'CANCELLED' });
    }

    if (m === 'POST' && operation === 'reconcile') {
      if (['COMPLETED', 'CANCELLED', 'FAILED'].includes(order.status)) {
        return json({ status: order.status });
      }
      const remote = await paypal(
        env,
        `/v2/checkout/orders/${encodeURIComponent(order.paypal_order_id)}`
      );
      const outcome = captureOutcome(remote, order);
      await db
        .prepare(
          "UPDATE orders SET status=?,capture_id=COALESCE(?,capture_id),updated_at=CURRENT_TIMESTAMP WHERE id=? AND status NOT IN ('COMPLETED','CANCELLED','FAILED')"
        )
        .bind(outcome.status, outcome.captureId, order.id)
        .run();
      return json({ status: outcome.status });
    }

    if (m === 'POST' && operation === 'capture') {
      if (order.status === 'COMPLETED') return json({ status: 'COMPLETED' });
      if (['CANCELLED', 'FAILED'].includes(order.status)) {
        throw [409, 'Order is not capturable'];
      }
      const remote = await paypal(
        env,
        `/v2/checkout/orders/${encodeURIComponent(order.paypal_order_id)}`
      );
      const outcome = captureOutcome(remote, order);
      if (outcome.status === 'COMPLETED') {
        await db
          .prepare(
            "UPDATE orders SET status='COMPLETED',capture_id=COALESCE(?,capture_id),updated_at=CURRENT_TIMESTAMP WHERE id=?"
          )
          .bind(outcome.captureId, order.id)
          .run();
        return json({ status: 'COMPLETED' });
      }
      if (outcome.status === 'FAILED') {
        await db
          .prepare(
            "UPDATE orders SET status='FAILED',failure_reason='Payment declined by provider',updated_at=CURRENT_TIMESTAMP WHERE id=?"
          )
          .bind(order.id)
          .run();
        return json({ status: 'FAILED' });
      }
      if (outcome.status !== 'APPROVED') {
        return json({ status: 'CREATED', notice: 'Awaiting buyer approval' });
      }
      const claim = await db
        .prepare(
          "UPDATE orders SET status='CAPTURE_PENDING',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status IN ('CREATED','APPROVED','UNKNOWN')"
        )
        .bind(order.id)
        .run();
      if (!claim.meta.changes) {
        return json({
          status: 'CAPTURE_PENDING',
          notice: 'Capture already in progress',
        });
      }
      try {
        const data = await paypal(
          env,
          `/v2/checkout/orders/${encodeURIComponent(order.paypal_order_id)}/capture`,
          'POST',
          { requestId: order.id + '-capture', data: {} }
        );
        const cap = data.purchase_units?.[0]?.payments?.captures?.[0];
        if (cap?.status === 'DECLINED' || cap?.status === 'FAILED') {
          await db
            .prepare(
              "UPDATE orders SET status='FAILED',failure_reason='Capture declined',updated_at=CURRENT_TIMESTAMP WHERE id=?"
            )
            .bind(order.id)
            .run();
          return json({ status: 'FAILED', notice: 'Payment was declined' });
        }
        if (data.status !== 'COMPLETED' || cap?.status === 'PENDING') {
          await db
            .prepare(
              "UPDATE orders SET status='UNKNOWN',updated_at=CURRENT_TIMESTAMP WHERE id=?"
            )
            .bind(order.id)
            .run();
          return json({
            status: 'UNKNOWN',
            notice: 'Awaiting payment reconciliation',
          });
        }
        await db
          .prepare(
            "UPDATE orders SET status='COMPLETED',capture_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?"
          )
          .bind(cap?.id || null, order.id)
          .run();
        return json({ status: 'COMPLETED' });
      } catch {
        await db
          .prepare(
            "UPDATE orders SET status='UNKNOWN',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='CAPTURE_PENDING'"
          )
          .bind(order.id)
          .run();
        throw [502, 'Capture status unknown. Reconcile before retrying'];
      }
    }
  }

  if (p === '/api/admin/manufacturers' && m === 'GET') {
    requireUser(u);
    if (u.role !== 'administrator') throw [403, 'Administrator required'];
    const rows = await db
      .prepare(
        'SELECT a.*, u.email, u.name, u.role, u.email_verified_at FROM manufacturer_applications a JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC'
      )
      .all();
    return json({ applications: rows.results });
  }

  if (p === '/api/admin/manufacturers' && m === 'POST') {
    requireUser(u);
    if (u.role !== 'administrator') throw [403, 'Administrator required'];
    const b = await body(req);
    if (str(b.application_id, 80)) {
      const app = await db
        .prepare('SELECT * FROM manufacturer_applications WHERE id=?')
        .bind(b.application_id)
        .first();
      if (!app) throw [404, 'Application not found'];
      if (!['approved', 'rejected'].includes(b.status)) {
        throw [400, 'Status must be approved or rejected'];
      }
      const note =
        str(b.note, 500) ||
        (b.status === 'approved'
          ? 'Approved by administrator'
          : 'Application declined');
      await db
        .prepare(
          'UPDATE manufacturer_applications SET status=?,reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP,review_note=?,updated_at=CURRENT_TIMESTAMP WHERE id=?'
        )
        .bind(b.status, u.id, note, app.id)
        .run();
      if (b.status === 'approved') {
        await db
          .prepare(
            "UPDATE users SET role='manufacturer' WHERE id=? AND role='consumer'"
          )
          .bind(app.user_id)
          .run();
      }
      await audit(db, u, `manufacturer.${b.status}`, app.user_id);
      return json({ ok: true });
    }
    if (!str(b.user_id, 80)) throw [400, 'User ID required'];
    await db
      .prepare("UPDATE users SET role='manufacturer' WHERE id=? AND role='consumer'")
      .bind(b.user_id)
      .run();
    await db
      .prepare(
        "UPDATE manufacturer_applications SET status='approved',reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE user_id=? AND status='pending'"
      )
      .bind(u.id, b.user_id)
      .run();
    await audit(db, u, 'manufacturer.approve', b.user_id);
    return json({ ok: true });
  }

  return json({ error: 'Not found' }, 404);
}

export default {
  async fetch(req, env) {
    try {
      if (new URL(req.url).pathname.startsWith('/api/')) {
        return await route(req, env);
      }
      return env.ASSETS.fetch(req);
    } catch (e) {
      return json(
        { error: Array.isArray(e) ? e[1] : (e?.message || String(e)) },
        Array.isArray(e) ? e[0] : 500
      );
    }
  },
};

export { hash, next, validSpecification };
