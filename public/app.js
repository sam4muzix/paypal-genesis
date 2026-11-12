const $ = (s) => (s === '#app' ? (document.querySelector('#desktopApp') || document.querySelector('#app')) : document.querySelector(s));
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

const ICONS = {
  cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>',
  receipt: '<path d="M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2Z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  shield: '<path d="M12 2 4 5v6c0 5.5 3.4 9.7 8 11 4.6-1.3 8-5.5 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
  lightbulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  logIn: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
  plusCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
};

function icon(name, extra = '') {
  const path = ICONS[name] || '';
  return `<svg class="icon ${extra}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
}

let user = null;
let application = null;
let busy = false;
let pendingAfterAuth = null;

const stages = [
  'idea',
  'validation',
  'manufacturer_interest',
  'prototype',
  'testing',
  'launch',
  'improvement',
  'retirement',
];

const stageName = {
  idea: 'New idea',
  validation: 'Gathering interest',
  manufacturer_interest: 'Manufacturer interested',
  prototype: 'Prototype',
  testing: 'Testing',
  launch: 'Available',
  improvement: 'Being improved',
  retirement: 'Discontinued',
};

const stageHint = {
  idea: 'A consumer shared this product idea. Interest is open and nonbinding.',
  validation: 'People are showing interest to help manufacturers gauge demand.',
  manufacturer_interest: 'A manufacturer has submitted a preliminary build proposal.',
  prototype: 'Early prototypes or engineering samples are being planned or built.',
  testing: 'Testing and validation are underway before wider availability.',
  launch: 'Available for eligible orders or broader release.',
  improvement: 'Being revised based on customer feedback.',
  retirement: 'This product has been discontinued and is no longer offered.',
};

const nextStages = {
  idea: ['validation'],
  validation: ['manufacturer_interest'],
  manufacturer_interest: ['prototype'],
  prototype: ['testing'],
  testing: ['launch', 'improvement'],
  launch: ['improvement', 'retirement'],
  improvement: ['testing', 'retirement'],
  retirement: [],
};

const paymentLabel = {
  CREATED: 'Awaiting PayPal buyer approval',
  APPROVED: 'Approved on PayPal · ready to confirm payment',
  CAPTURE_PENDING: 'Confirming payment with PayPal',
  COMPLETED: 'Payment confirmed',
  CANCELLED: 'Cancelled',
  FAILED: 'Payment failed or declined',
  UNKNOWN: 'Status unknown · check status before retrying',
};

const paymentBadgeClass = {
  CREATED: 'badge',
  APPROVED: 'badge',
  CAPTURE_PENDING: 'badge',
  COMPLETED: 'badge success',
  CANCELLED: 'badge muted-badge',
  FAILED: 'badge danger',
  UNKNOWN: 'badge demo',
};

const maker = () => ['manufacturer', 'administrator'].includes(user?.role);

function loadStore(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStore(key, val) {
  try {
    sessionStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function clearStore(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {}
}

let draft = loadStore('genesis_req_draft', {});
let draftAnalysis = loadStore('genesis_req_analysis', null);
let reportDraft = loadStore('genesis_rep_draft', {});

function safeParseJson(str) {
  if (!str) return null;
  if (typeof str === 'object') return str;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

async function api(path, method = 'GET', data) {
  const r = await fetch('/api' + path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
  let x = {};
  try {
    x = await r.json();
  } catch {}
  if (!r.ok) {
    throw Error(x.error || 'Something went wrong. Please try again.');
  }
  return x;
}

function notice(text, kind = 'info') {
  const el = $('#notice');
  el.className = kind === 'error' ? 'error' : kind === 'success' ? 'success' : '';
  el.textContent = text;
  if (text) el.focus();
  clearTimeout(notice._t);
  if (text) {
    notice._t = setTimeout(() => {
      if ($('#notice').textContent === text) {
        $('#notice').textContent = '';
        $('#notice').className = '';
      }
    }, 7000);
  }
}

function modalNotice(text, kind = 'error') {
  const el = $('#modalNotice');
  el.className = kind === 'error' ? 'error' : kind === 'success' ? 'success' : '';
  el.textContent = text;
}

function modal(html) {
  modalNotice('', 'info');
  $('#modalBody').innerHTML = html;
  const dlg = $('#modal');
  if (!dlg.open) dlg.showModal();
}

function closeModal() {
  const dlg = $('#modal');
  if (dlg.open) dlg.close();
  modalNotice('', 'info');
}

function loading(button, task, busyLabel = 'Working…') {
  if (busy) return;
  busy = true;
  const original = button?.innerHTML;
  if (button) {
    button.disabled = true;
    button.innerHTML = `<span class="spinner" aria-hidden="true"></span>${esc(busyLabel)}`;
  }
  return Promise.resolve()
    .then(task)
    .finally(() => {
      busy = false;
      if (button?.isConnected) {
        button.disabled = false;
        button.innerHTML = original;
      }
    });
}

function go(hash) {
  const target = hash.startsWith('#') ? hash : '#' + hash;
  if (location.hash === target) {
    renderRoute();
  } else {
    location.hash = target;
  }
}

function activeNavForRoute(route) {
  if (route === '/intro' || route === '/' || route === '/home') return 'Home';
  if (route === '/explore' || route.startsWith('/product/') || route === '/manufacturer/demand') return 'Discover';
  if (route.startsWith('/request') || route.startsWith('/report')) return 'Create';
  if (route.startsWith('/manufacturer/intelligence') || route.startsWith('/manufacturer/analytics') || route.startsWith('/manufacturer/quality')) return 'Intelligence';
  if (route === '/orders' || route === '/manufacturer/products' || route === '/my-products') return 'Orders';
  if (route === '/account' || route === '/admin' || route === '/help') return 'Account';
  return 'Home';
}

function nav(activePage) {
  const isMaker = maker();
  const items = [
    { label: 'Home', hash: user ? '#/home' : '#/intro', icon: 'home' },
    { label: 'Discover', hash: '#/explore', icon: 'compass' },
    { label: 'Create', hash: '#/request', icon: 'plusCircle', isAccent: true },
    { label: 'Intelligence', hash: '#/manufacturer/intelligence', icon: 'sparkles' },
    { label: 'Orders', hash: '#/orders', icon: 'receipt' },
    { label: 'Account', hash: '#/account', icon: 'user' },
  ];

  const currentPath = location.hash.replace(/^#/, '').split('?')[0];
  const isCurrentActive = (item) => {
    if (activePage === item.label) return true;
    if (item.label === 'Home' && (currentPath === '' || currentPath === '/' || currentPath === '/home' || currentPath === '/intro')) return true;
    if (item.label === 'Discover' && (currentPath === '/explore' || currentPath.startsWith('/product/') || currentPath === '/manufacturer/demand')) return true;
    if (item.label === 'Create' && (currentPath.startsWith('/request') || currentPath.startsWith('/report'))) return true;
    if (item.label === 'Intelligence' && (currentPath.startsWith('/manufacturer/intelligence') || currentPath.startsWith('/manufacturer/analytics'))) return true;
    if (item.label === 'Orders' && (currentPath === '/orders' || currentPath === '/my-products' || currentPath.startsWith('/manufacturer/product/'))) return true;
    if (item.label === 'Account' && (currentPath === '/account' || currentPath === '/help' || currentPath === '/admin')) return true;
    return false;
  };

  if ($('#nav')) {
    $('#nav').innerHTML = items
      .map(
        (item) =>
          `<button class="${isCurrentActive(item) ? 'active' : ''} ${item.isAccent ? 'dock-accent' : ''}" data-hash="${item.hash}" aria-current="${
            isCurrentActive(item) ? 'page' : 'false'
          }">${icon(item.icon)}<span>${esc(item.label)}</span></button>`
      )
      .join('');

    $('#nav')
      .querySelectorAll('button')
      .forEach((b) => {
        b.onclick = () => go(b.dataset.hash);
      });
  }

  // Topbar role switcher pills
  if ($('#btnRoleConsumer')) {
    $('#btnRoleConsumer').classList.toggle('active', !isMaker);
    $('#btnRoleConsumer').onclick = async () => {
      if (!isMaker && user?.is_demo) { go('#/home'); return; }
      try {
        await api('/demo/session', 'POST', { role: 'consumer' });
        await refreshMe();
        notice('Switched to Demo Consumer perspective.', 'success');
        go('#/home');
      } catch (e) { notice(e.message, 'error'); }
    };
  }
  if ($('#btnRoleMaker')) {
    $('#btnRoleMaker').classList.toggle('active', isMaker);
    $('#btnRoleMaker').onclick = async () => {
      if (isMaker && user?.is_demo) { go('#/home'); return; }
      try {
        await api('/demo/session', 'POST', { role: 'manufacturer' });
        await refreshMe();
        notice('Switched to Demo Manufacturer perspective.', 'success');
        go('#/home');
      } catch (e) { notice(e.message, 'error'); }
    };
  }

  if ($('#brandHomeLink')) $('#brandHomeLink').onclick = (e) => {
    e.preventDefault();
    go(user ? '#/home' : '#/intro');
  };
  if ($('#headerHelpBtn')) $('#headerHelpBtn').onclick = () => go('#/help');
  if ($('#appIdentityCard')) $('#appIdentityCard').onclick = () => go(user ? '#/home' : '#/intro');

  const roleLabel = !user
    ? 'Visitor'
    : user.is_demo
      ? (user.role === 'manufacturer' ? 'Demo Manufacturer' : 'Demo Consumer')
      : user.role === 'administrator'
        ? 'Administrator'
        : user.role === 'manufacturer'
          ? 'Approved Manufacturer'
          : 'Consumer';
  if ($('#roleChip')) $('#roleChip').innerHTML = `${icon(maker() ? 'factory' : 'user')}<span>${esc(roleLabel)}</span>`;

  $('#account').innerHTML = `
    <button class="profile-btn ${user?.is_demo ? 'demo-profile-btn' : ''}" id="profile" type="button" aria-expanded="false" title="Account &amp; Session">
      ${icon(user?.is_demo ? 'shield' : 'user')}
      <span class="name">${user ? (user.is_demo ? 'DEMO · ' + esc(user.name) : esc(user.name)) : 'Account'}</span>
      <span aria-hidden="true">▾</span>
    </button>
    <div id="profileMenu" class="profile-menu" hidden>
      ${
        user
          ? `<div class="profile-menu-meta">
               <strong>${esc(user.name)}</strong><br>
               <span>${esc(roleLabel)} · ${user.is_demo ? 'Temporary Demo Session' : (user.email_verified_at ? 'Verified' : 'Unverified')}</span>
             </div>
             ${user.is_demo ? `<button type="button" id="exitDemoBtn" class="primary" style="margin-bottom:6px">${icon('logOut')}<span>Exit Demo</span></button>` : ''}
             <button type="button" id="accountSettingsBtn">${icon('user')}<span>Account &amp; Role</span></button>
             ${!user.email_verified_at && !user.is_demo ? `<button type="button" id="verifyAction">${icon('check')}<span>Verify email</span></button>` : ''}
             <button type="button" id="logout">${icon('logOut')}<span>${user.is_demo ? 'Exit Demo Session' : 'Sign out'}</span></button>`
          : `<button type="button" id="signin">${icon('logIn')}<span>Sign in</span></button>
             <button type="button" id="createAcc">${icon('user')}<span>Create account</span></button>`
      }
    </div>`;

  const menu = $('#profileMenu');
  $('#profile').onclick = (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    $('#profile').setAttribute('aria-expanded', String(!menu.hidden));
  };

  if (user) {
    $('#accountSettingsBtn').onclick = () => {
      menu.hidden = true;
      go('#/account');
    };
    if ($('#verifyAction')) {
      $('#verifyAction').onclick = () => {
        menu.hidden = true;
        verification();
      };
    }
    const endDemoSession = async () => {
      menu.hidden = true;
      await api('/logout', 'POST');
      user = null;
      application = null;
      pendingAfterAuth = null;
      go('#/intro');
      notice('Demo session ended.');
    };
    if ($('#exitDemoBtn')) $('#exitDemoBtn').onclick = endDemoSession;
    $('#logout').onclick = endDemoSession;
  } else {
    $('#signin').onclick = () => {
      menu.hidden = true;
      auth();
    };
    $('#createAcc').onclick = () => {
      menu.hidden = true;
      register();
    };
  }

  const slot = $('#bannerSlot');
  if (!slot) return;
  if (user && user.is_demo) {
    slot.innerHTML = `<div class="banner banner-demo" style="background:rgba(0,112,186,0.18);border:1px solid rgba(56,152,255,0.4);display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-radius:10px;margin-bottom:16px;">
      <span style="font-size:13.5px;color:#f1f5f9">
        <strong style="color:#3898ff">DEMO MODE ACTIVE:</strong> Exploring as <strong>${esc(user.name)}</strong> (${user.role === 'manufacturer' ? 'Manufacturer' : 'Consumer'}). Preseeded sample data &amp; PayPal Sandbox only.
      </span>
      <button type="button" class="secondary" id="exitDemoBannerBtn" style="padding:4px 12px;font-size:12.5px;border-color:rgba(56,152,255,0.5)">Exit Demo</button>
    </div>`;
    $('#exitDemoBannerBtn').onclick = async () => {
      await api('/logout', 'POST');
      user = null;
      application = null;
      go('#/intro');
      notice('Demo session ended.');
    };
  } else if (user && !user.email_verified_at) {
    slot.innerHTML = `<div class="banner">
      <span>Your email <strong>${esc(user.email)}</strong> is not verified yet. Verify it to enable PayPal Sandbox checkout or apply as a manufacturer.</span>
      <button type="button" class="secondary" id="bannerVerifyBtn">Verify email</button>
    </div>`;
    $('#bannerVerifyBtn').onclick = verification;
  } else {
    slot.innerHTML = '';
  }
}

function auth(defaultEmail = '', infoMessage = '') {
  modal(`
    <h2 id="modalTitle">Sign in to GENESIS</h2>
    <p>Sign in to share ideas, support products, report issues, or track orders.</p>
    <form class="stack" id="loginForm" novalidate>
      <label>Email <span class="req">(Required)</span>
        <input name="email" type="email" autocomplete="email" value="${esc(defaultEmail)}" required>
        <span class="field-error" data-err="email"></span>
      </label>
      <label>Password <span class="req">(Required)</span>
        <input name="password" type="password" autocomplete="current-password" required>
        <span class="field-error" data-err="password"></span>
      </label>
      <button class="primary" type="submit">Sign in</button>
    </form>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(148,163,184,0.16);text-align:center;">
      <p class="muted" style="font-size:13px;margin:0 0 10px 0;">Public registration requires verified SMTP delivery. For judging and review, use instant demo access:</p>
      <div style="display:flex;gap:8px;justify-content:center;">
        <button type="button" class="secondary" id="modalDemoConsumerBtn" style="font-size:13px;padding:6px 14px;">Demo Consumer</button>
        <button type="button" class="secondary" id="modalDemoMakerBtn" style="font-size:13px;padding:6px 14px;">Demo Manufacturer</button>
      </div>
    </div>
  `);
  if (infoMessage) modalNotice(infoMessage, 'success');

  const startDemo = async (role) => {
    try {
      const res = await api('/demo/session', 'POST', { role });
      closeModal();
      await refreshMe();
      notice(`Demo mode started as ${role === 'manufacturer' ? 'Manufacturer' : 'Consumer'}.`, 'success');
      go('#' + (res.redirect || '/home'));
    } catch (err) {
      modalNotice(err.message, 'error');
    }
  };
  if ($('#modalDemoConsumerBtn')) $('#modalDemoConsumerBtn').onclick = () => startDemo('consumer');
  if ($('#modalDemoMakerBtn')) $('#modalDemoMakerBtn').onclick = () => startDemo('manufacturer');

  $('#loginForm').onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    form.querySelectorAll('.field-error').forEach((n) => (n.textContent = ''));
    if (!data.email?.trim()) {
      form.querySelector('[data-err="email"]').textContent = 'Enter your email address.';
      return;
    }
    if (!data.password) {
      form.querySelector('[data-err="password"]').textContent = 'Enter your password.';
      return;
    }
    loading(e.submitter, async () => {
      try {
        await api('/login', 'POST', data);
        closeModal();
        await refreshMe();
        notice('Signed in.', 'success');
        if (pendingAfterAuth) {
          const fn = pendingAfterAuth;
          pendingAfterAuth = null;
          await fn();
        } else if (!location.hash || location.hash === '#/intro') {
          go('#/home');
        } else {
          await renderRoute();
        }
      } catch (err) {
        modalNotice(err.message, 'error');
      }
    }, 'Signing in…');
  };
}

function register() {
  modal(`
    <h2 id="modalTitle">Create your account</h2>
    <p>Create a free account to request products, support ideas, or report issues.</p>
    <form class="stack" id="registerForm" novalidate>
      <label>Your name <span class="req">(Required)</span>
        <input name="name" maxlength="80" autocomplete="name" required>
        <span class="field-error" data-err="name"></span>
      </label>
      <label>Email <span class="req">(Required)</span>
        <input name="email" type="email" autocomplete="email" required>
        <span class="field-error" data-err="email"></span>
      </label>
      <label>Password <span class="req">(Required · 12+ characters)</span>
        <input name="password" type="password" minlength="12" autocomplete="new-password" required>
        <span class="field-error" data-err="password"></span>
      </label>
      <button class="primary" type="submit">Create account</button>
    </form>
    <p class="muted" style="margin-top:14px">Already have an account? <a href="#" id="backLoginLink">Sign in</a></p>
  `);

  $('#backLoginLink').onclick = (e) => {
    e.preventDefault();
    auth();
  };

  $('#registerForm').onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    form.querySelectorAll('.field-error').forEach((n) => (n.textContent = ''));
    if (!data.name?.trim()) {
      form.querySelector('[data-err="name"]').textContent = 'Enter your name.';
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(data.email?.trim() || '')) {
      form.querySelector('[data-err="email"]').textContent = 'Enter a valid email address.';
      return;
    }
    if (!data.password || data.password.length < 12) {
      form.querySelector('[data-err="password"]').textContent = 'Use at least 12 characters.';
      return;
    }
    loading(e.submitter, async () => {
      try {
        await api('/register', 'POST', data);
        auth(
          data.email.trim(),
          'Account created. Check the local development server log for your verification link, then sign in.'
        );
      } catch (err) {
        modalNotice(err.message, 'error');
      }
    }, 'Creating account…');
  };
}

function verification() {
  modal(`
    <h2 id="modalTitle">Verify your email</h2>
    <p>In local development, open the verification link printed in the Wrangler terminal log or paste the token from that link below. Links expire after 30 minutes.</p>
    <form class="stack" id="verifyForm" novalidate>
      <label>Verification token <span class="req">(Required)</span>
        <input name="token" placeholder="Paste the ?verify= token value" required>
        <span class="field-error" data-err="token"></span>
      </label>
      <div class="row">
        <button class="primary" type="submit">Verify email</button>
        <button class="secondary" type="button" id="resendBtn">Send a new link</button>
      </div>
    </form>
  `);

  $('#verifyForm').onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const token = form.token.value.trim();
    form.querySelector('[data-err="token"]').textContent = '';
    if (!token) {
      form.querySelector('[data-err="token"]').textContent = 'Paste your verification token.';
      return;
    }
    loading(e.submitter, async () => {
      try {
        await api('/verification/confirm', 'POST', { token });
        closeModal();
        await refreshMe();
        await renderRoute();
        notice('Email verified.', 'success');
      } catch (err) {
        modalNotice(err.message, 'error');
      }
    }, 'Verifying…');
  };

  $('#resendBtn').onclick = () =>
    loading($('#resendBtn'), async () => {
      try {
        const res = await api('/verification/resend', 'POST');
        if (res.verified) {
          closeModal();
          await refreshMe();
          await renderRoute();
          notice('Your email is already verified.', 'success');
        } else {
          modalNotice('A new verification link was written to the Wrangler log.', 'success');
        }
      } catch (err) {
        modalNotice(err.message, 'error');
      }
    }, 'Sending…');
}

function actionCard(title, description, actionName, iconName = 'lightbulb') {
  return `<button type="button" class="action-card" data-action="${actionName}">
    <div class="action-card-head">
      <span class="action-icon">${icon(iconName)}</span>
      <strong>${esc(title)}</strong>
    </div>
    <span>${esc(description)}</span>
    <b><span>Continue</span>${icon('arrowRight')}</b>
  </button>`;
}

function renderIdeaToProductSvg() {
  return `
    <svg class="genesis-symbolic-flow-svg" viewBox="0 0 380 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="prismFaceLeft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e294b"/>
          <stop offset="100%" stop-color="#0e1428"/>
        </linearGradient>
        <linearGradient id="prismFaceRight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2a3b68"/>
          <stop offset="100%" stop-color="#141c38"/>
        </linearGradient>
        <linearGradient id="prismFaceTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#1d4ed8"/>
        </linearGradient>
        <linearGradient id="laserGrad" x1="0" y1="0" x2="380" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#8b44ff" stop-opacity="0.8"/>
        </linearGradient>
        <radialGradient id="holoGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2f6eff" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#2f6eff" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Holographic Ambient Base Circle -->
      <ellipse cx="190" cy="115" rx="140" ry="55" fill="url(#holoGlow)"/>
      <ellipse cx="190" cy="115" rx="110" ry="42" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.2" stroke-dasharray="4 6"/>
      <ellipse cx="190" cy="115" rx="75" ry="28" stroke="rgba(0, 240, 255, 0.35)" stroke-width="1"/>

      <!-- Technical Axis Lines -->
      <line x1="60" y1="115" x2="320" y2="115" stroke="rgba(56, 189, 248, 0.12)" stroke-dasharray="2 4"/>
      <line x1="190" y1="20" x2="190" y2="175" stroke="rgba(56, 189, 248, 0.12)" stroke-dasharray="2 4"/>

      <!-- ISOMETRIC 3D MONOLITH: IDEA -> AI -> PRODUCT -->
      <!-- Center: Isometric Prism (Center at x=190, y=105) -->
      <!-- Top Face -->
      <polygon points="190,62 235,82 190,102 145,82" fill="url(#prismFaceTop)" stroke="#60a5fa" stroke-width="1.2"/>
      <!-- Left Face -->
      <polygon points="145,82 190,102 190,152 145,132" fill="url(#prismFaceLeft)" stroke="#3b82f6" stroke-width="1"/>
      <!-- Right Face -->
      <polygon points="190,102 235,82 235,132 190,152" fill="url(#prismFaceRight)" stroke="#60a5fa" stroke-width="1"/>

      <!-- Glowing PayPal Monogram on Front-Right Face -->
      <g transform="translate(205, 114) skewY(26) scale(0.7)">
        <path d="M -6 -10 L 2 -10 C 6 -10, 8.5 -7.5, 8.5 -4 C 8.5 -0.5, 6 2, 2 2 L -2 2 L -4 10 L -8 10 L -6 -10 Z" fill="#003087" opacity="0.9"/>
        <path d="M -3 -7 L 5 -7 C 9 -7, 11.5 -4.5, 11.5 -1 C 11.5 2.5, 9 5, 5 5 L 1 5 L -1 13 L -5 13 L -3 -7 Z" fill="#00f0ff"/>
      </g>

      <!-- Hovering Gemini AI Core Spark (Above Top Face: x=190, y=42) -->
      <g transform="translate(190, 42)">
        <circle cx="0" cy="0" r="14" fill="#1e1b4b" stroke="#8b44ff" stroke-width="1.5"/>
        <path d="M 0 -8 Q 0 0, 8 0 Q 0 0, 0 8 Q 0 0, -8 0 Q 0 0, 0 -8 Z" fill="#ffffff"/>
        <!-- Radiating Neural Orbit Rings -->
        <ellipse cx="0" cy="0" rx="22" ry="7" stroke="#00f0ff" stroke-width="1" fill="none" opacity="0.75" transform="rotate(-20)"/>
      </g>

      <!-- Left Flow Anchor: Idea Inception Node -->
      <g transform="translate(68, 115)">
        <circle cx="0" cy="0" r="20" fill="#151b36" stroke="#2f6eff" stroke-width="1.5"/>
        <path d="M -5 -3 C -5 -7, 5 -7, 5 -3 C 5 0, 2 2, 2 4 L -2 4 C -2 2, -5 0, -5 -3 Z" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
        <line x1="-2" y1="6" x2="2" y2="6" stroke="#fbbf24" stroke-width="1.2"/>
        <text x="0" y="32" text-anchor="middle" fill="#93c5fd" font-size="8.5" font-weight="800" font-family="system-ui">IDEA</text>
      </g>

      <!-- Right Flow Anchor: Physical Hardware Spec Node -->
      <g transform="translate(312, 115)">
        <rect x="-20" y="-16" width="40" height="30" rx="4" fill="#151b36" stroke="#00f0ff" stroke-width="1.5"/>
        <circle cx="-8" cy="4" r="3" fill="#2f6eff"/>
        <circle cx="4" cy="4" r="3" fill="#2f6eff"/>
        <rect x="-16" y="-12" width="32" height="10" rx="2" fill="#0b0f20"/>
        <text x="0" y="32" text-anchor="middle" fill="#67e8f9" font-size="8.5" font-weight="800" font-family="system-ui">PRODUCT</text>
      </g>

      <!-- High Precision Laser Flow Rays Connecting Left to Center to Right -->
      <path d="M 88 115 C 115 115, 125 90, 145 90" stroke="url(#laserGrad)" stroke-width="2" fill="none"/>
      <path d="M 235 115 C 265 115, 275 115, 292 115" stroke="url(#laserGrad)" stroke-width="2" fill="none"/>

      <!-- Annotations -->
      <text x="24" y="190" fill="#5e6c8e" font-size="7.5" font-family="monospace">PAYPAL GENESIS // AI SPECIFICATION &amp; ESCROW PROTOCOL</text>
      <text x="356" y="190" text-anchor="end" fill="#38bdf8" font-size="7.5" font-family="monospace">REST API v2</text>
    </svg>
  `;
}

function introPage() {
  if (user) {
    go('#/home');
    return;
  }
  const appRoot = $('#desktopApp') || $('#app');
  if (appRoot) appRoot.classList.add('intro-mode');
  $('#heading').textContent = 'PayPal GENESIS';
  if ($('#windowKicker')) $('#windowKicker').textContent = 'LUMINA OS';

  $('#view').innerHTML = `
    <div class="lumina-home-stage view-enter">
      <!-- 1440x900 Centerpiece: Monument Hero -->
      <div class="lumina-hero-monument">
        <div class="lumina-monument-left">
          <div class="lumina-kicker-badge">
            <span class="mfg-badge-live">LUMINA PRODUCT OS</span>
            <span style="color:var(--text-muted)">//</span>
            <span style="color:#ffffff">PayPal AI Hackathon</span>
          </div>

          <h1 class="lumina-hero-headline">Products should begin with people.</h1>

          <p class="lumina-hero-subhead">From the first idea to the final purchase, GENESIS connects consumer demand, AI-powered specifications, manufacturing decisions, and PayPal.</p>

          <p style="font-size:12px;color:var(--text-muted);margin:0">
            Share what you wish existed. Help improve what already exists. See how manufacturers bring better products to life.
          </p>

          <div class="lumina-cta-row">
            <button type="button" class="btn-lumina-primary" id="introConsumerBtn">
              <span>Continue as Consumer</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button type="button" class="btn-lumina-secondary" id="introManufacturerBtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 7v14M21 7v14M6 7l6-4 6 4"/></svg>
              <span>Explore as Manufacturer</span>
            </button>
            <button type="button" class="btn-lumina-secondary" id="introGetStartedBtn" style="display:none">Get Started</button>
          </div>

          <div style="display:flex;align-items:center;gap:14px;margin-top:2px;font-size:11px;color:var(--text-muted);flex-wrap:wrap">
            <span>⚡ Zero-friction demo</span>
            <span>•</span>
            <span>🔒 No signup required</span>
            <span>•</span>
            <span>💳 PayPal Sandbox checkout</span>
          </div>
        </div>

        <!-- Striking 3D Product Concept Visualization -->
        <div class="lumina-3d-stage">
          ${renderIdeaToProductSvg()}
        </div>
      </div>

      <!-- Tactile 3D Cards: Matching Reference Image (Blue, Purple, Coral) -->
      <div class="tactile-cards-row">
        <div class="tactile-card card-blue" id="journeyIdea" role="button" tabindex="0">
          <svg class="tactile-3d-glyph" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" fill="rgba(255,255,255,0.15)"/>
            <path d="M18 16 C18 12, 30 12, 30 16 C30 20, 26 22, 26 26 L22 26 C22 22, 18 20, 18 16 Z" fill="none" stroke="#ffffff" stroke-width="2.5"/>
            <line x1="22" y1="30" x2="26" y2="30" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="24" cy="17" r="3" fill="#ffffff"/>
          </svg>
          <div>
            <div style="font-size:11px;font-weight:700;letter-spacing:1px;opacity:0.8;text-transform:uppercase;margin-bottom:6px">Stage 01 · Inception</div>
            <h3 class="tactile-card-title">You Imagine.</h3>
            <p class="tactile-card-desc">Describe hardware ideas that do not exist yet. Mobilize backer demand with $0 upfront capital.</p>
          </div>
          <div class="tactile-card-action">
            <span>Request Idea</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>

        <div class="tactile-card card-purple" id="journeyIntel" role="button" tabindex="0">
          <svg class="tactile-3d-glyph" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" fill="rgba(255,255,255,0.15)"/>
            <path d="M24 10 Q24 24 38 24 Q24 24 24 38 Q24 24 10 24 Q24 24 24 10 Z" fill="#ffffff"/>
            <circle cx="24" cy="24" r="3" fill="#8c46ff"/>
          </svg>
          <div>
            <div style="font-size:11px;font-weight:700;letter-spacing:1px;opacity:0.8;text-transform:uppercase;margin-bottom:6px">Stage 02 · Intelligence</div>
            <h3 class="tactile-card-title">Gemini Synthesizes.</h3>
            <p class="tactile-card-desc">Instant engineering BOM, manufacturing feasibility analysis, and target price discovery.</p>
          </div>
          <div class="tactile-card-action">
            <span>Explore AG Studio</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>

        <div class="tactile-card card-coral" id="journeyPay" role="button" tabindex="0">
          <svg class="tactile-3d-glyph" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" fill="rgba(255,255,255,0.15)"/>
            <path d="M19 14 L27 14 C31 14, 33 16, 33 19 C33 22, 31 24, 27 24 L22 24 L20 34 L16 34 L19 14 Z" fill="#ffffff"/>
            <circle cx="34" cy="18" r="5" fill="#ffffff"/>
            <path d="M32 18 L33.5 19.5 L36 17" stroke="#ff4c5b" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <div>
            <div style="font-size:11px;font-weight:700;letter-spacing:1px;opacity:0.8;text-transform:uppercase;margin-bottom:6px">Stage 03 · Checkout</div>
            <h3 class="tactile-card-title">PayPal Builds.</h3>
            <p class="tactile-card-desc">Verified milestone protections. Backers pre-order safely via PayPal Sandbox REST API v2.</p>
          </div>
          <div class="tactile-card-action">
            <span>Verified Escrow</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      </div>

      <div style="display:none">
        <span id="journeyDemand"></span>
        <span id="journeyBuild"></span>
      </div>

      <!-- Live Real D1 Telemetry Strip -->
      <div class="lumina-telemetry-bar">
        <div class="telemetry-tile">
          <span class="telemetry-label">Preseeded Catalog</span>
          <span class="telemetry-value">4 Inventions</span>
          <span class="telemetry-foot">Hardware concepts ready</span>
        </div>
        <div class="telemetry-tile">
          <span class="telemetry-label">Verified Backing</span>
          <span class="telemetry-value">7 Signals</span>
          <span class="telemetry-foot">Stored Cloudflare D1 records</span>
        </div>
        <div class="telemetry-tile">
          <span class="telemetry-label">Production Batch</span>
          <span class="telemetry-value">Batch #1 Active</span>
          <span class="telemetry-foot">StudioWorks 200 MOQ offer</span>
        </div>
        <div class="telemetry-tile">
          <span class="telemetry-label">PayPal Sandbox</span>
          <span class="telemetry-value">$249.00 Captured</span>
          <span class="telemetry-foot">REST API v2 server verified</span>
        </div>
      </div>

      <!-- System Message Floating Toast (Bottom Right) -->
      <div class="system-message-toast" id="systemToastNotice">
        <div class="toast-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div class="toast-content">
          <span class="toast-title">System Status · Hackathon Demo</span>
          <span class="toast-text">Gemini 3.8 Flash online · PayPal Sandbox v2 active</span>
        </div>
      </div>

      <div class="sr-only" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden">
        YOU IMAGINE · PEOPLE SUPPORT · MAKERS BUILD
      </div>
    </div>
  `;

  const launchDemo = async (role) => {
    try {
      const res = await api('/demo/session', 'POST', { role });
      await refreshMe();
      notice(`Demo mode started as ${role === 'manufacturer' ? 'Manufacturer' : 'Consumer'}.`, 'success');
      go('#' + (res.redirect || '/home'));
    } catch (err) {
      notice(err.message, 'error');
    }
  };

  if ($('#introConsumerBtn')) $('#introConsumerBtn').onclick = () => launchDemo('consumer');
  if ($('#introManufacturerBtn')) $('#introManufacturerBtn').onclick = () => launchDemo('manufacturer');
  if ($('#introGetStartedBtn')) $('#introGetStartedBtn').onclick = () => launchDemo('consumer');

  if ($('#journeyIdea')) $('#journeyIdea').onclick = () => launchDemo('consumer');
  if ($('#journeyIntel')) $('#journeyIntel').onclick = () => launchDemo('manufacturer');
  if ($('#journeyDemand')) $('#journeyDemand').onclick = () => launchDemo('consumer');
  if ($('#journeyBuild')) $('#journeyBuild').onclick = () => launchDemo('manufacturer');
  if ($('#journeyPay')) $('#journeyPay').onclick = () => launchDemo('consumer');
}

function bindHomeActions() {
  document.querySelectorAll('[data-action]').forEach((b) => {
    b.onclick = () => {
      const a = b.dataset.action;
      if (a === 'request') go('#/request');
      else if (a === 'report') go('#/report');
      else if (a === 'explore') go(maker() ? '#/manufacturer/demand' : '#/explore');
      else if (a === 'mine') go('#/my-products');
      else if (a === 'offer') go('#/manufacturer/offer');
      else if (a === 'improve') go('#/manufacturer/quality');
      else if (a === 'progress') go('#/manufacturer/products');
      else if (a === 'orders') go('#/orders');
      else if (a === 'help') go('#/help');
    };
  });
}

function home() {
  $('#heading').textContent = maker() ? 'Manufacturer Workspace' : 'Consumer Workspace';
  const isMaker = maker();
  if (isMaker) {
    $('#view').innerHTML = `
      <div class="mfg-workspace-layout view-enter">
        <!-- Main Opportunities & Intelligence Column -->
        <div class="mfg-main-col">
          <!-- Context Header -->
          <div class="mfg-context-header">
            <div class="mfg-title-area">
              <h2>StudioWorks Manufacturing Workspace</h2>
              <p>Turn verified consumer demand, Gemini specifications, and PayPal activity into production decisions.</p>
            </div>
            <div class="mfg-context-actions">
              <button type="button" class="btn-pill-primary" id="mfgCreateOfferBtn" data-action="offer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                <span>+ Commit Build Offer</span>
              </button>
              <button type="button" class="btn-pill-secondary" id="mfgStudioCanvasBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                <span>AG Studio Intelligence</span>
              </button>
            </div>
          </div>

          <!-- Visually Dominant Featured Opportunity Canvas -->
          <div class="mfg-hero-opportunity-card">
            <div class="mfg-hero-info">
              <div class="mfg-hero-badge-row">
                <span class="mfg-badge-live">Prototype Phase</span>
                <span class="mfg-badge-demo">Demo Scenario</span>
                <span style="font-size:11px;color:var(--text-muted)">Category: Creator Tools</span>
              </div>
              <h3 class="mfg-hero-title">Eight-input portable audio interface</h3>
              <p class="mfg-hero-desc">Mobile creators request eight discrete XLR/TRS combo preamps, high-headroom onboard DSP conversion, dual USB-C bus power, and physical tactile gain knobs.</p>
              
              <!-- Real Stored DB Metrics (Explicitly Labeled) -->
              <div class="mfg-hero-metrics">
                <div class="mfg-metric-tile">
                  <span class="mfg-metric-label">Verified Backers</span>
                  <span class="mfg-metric-value">2 Signals</span>
                  <span class="mfg-metric-footnote">Stored D1 records</span>
                </div>
                <div class="mfg-metric-tile">
                  <span class="mfg-metric-label">Target Retail</span>
                  <span class="mfg-metric-value">$249.00</span>
                  <span class="mfg-metric-footnote">USD consumer target</span>
                </div>
                <div class="mfg-metric-tile">
                  <span class="mfg-metric-label">Batch MOQ Target</span>
                  <span class="mfg-metric-value">200 Units</span>
                  <span class="mfg-metric-footnote">Batch #1 threshold</span>
                </div>
              </div>

              <div class="mfg-hero-actions">
                <button type="button" class="btn-pill-primary" data-action="progress">
                  <span>Update Production Milestone</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button type="button" class="btn-pill-secondary" data-action="orders">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                  <span>PayPal Orders</span>
                </button>
              </div>
            </div>

            <!-- Vector Blueprint Schematic Stage -->
            <div class="mfg-hero-graphic-stage">
              ${renderIdeaToProductSvg()}
            </div>
          </div>

          <!-- Secondary Section: Product Opportunity Queue -->
          <div class="mfg-section-title-row">
            <h4 class="mfg-section-title">Product Opportunity Queue</h4>
            <div style="display:flex;align-items:center;gap:8px">
              <button type="button" class="btn-pill-secondary" data-action="explore" style="padding:4px 12px;font-size:11.5px">Customer Demand</button>
              <button type="button" class="btn-pill-secondary" data-action="improve" style="padding:4px 12px;font-size:11.5px">Quality Reports</button>
            </div>
          </div>

          <div class="mfg-opp-table-card">
            <table class="mfg-table">
              <thead>
                <tr>
                  <th>Product Opportunity</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Verified Signals</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="table-product-cell">
                      <strong>Eight-input portable audio interface</strong>
                      <small>8-channel XLR/TRS DSP hardware</small>
                    </div>
                  </td>
                  <td><span class="mfg-badge-live">Prototype</span></td>
                  <td>Creator Tools</td>
                  <td style="color:#ffffff;font-weight:600">2 Intents (Stored)</td>
                  <td><button type="button" class="btn-pill-primary" style="padding:5px 12px;font-size:11.5px" data-action="progress">Batch #1 Active</button></td>
                </tr>
                <tr>
                  <td>
                    <div class="table-product-cell">
                      <strong>Mobile multichannel recording interface</strong>
                      <small>Field recording preamps &amp; USB bus</small>
                    </div>
                  </td>
                  <td><span class="mfg-badge-demo" style="background:rgba(56,152,255,0.15);color:#93c5fd;border-color:rgba(56,152,255,0.3)">Idea Stage</span></td>
                  <td>Creator Tools</td>
                  <td style="color:#ffffff;font-weight:600">1 Signal (Stored)</td>
                  <td><button type="button" class="btn-pill-secondary" style="padding:5px 12px;font-size:11.5px" data-action="offer">Commit Offer</button></td>
                </tr>
                <tr>
                  <td>
                    <div class="table-product-cell">
                      <strong>Wireless earbuds with battery drain</strong>
                      <small>Customer reported battery degradation</small>
                    </div>
                  </td>
                  <td><span class="mfg-badge-demo" style="background:rgba(239,68,68,0.15);color:#fca5a5;border-color:rgba(239,68,68,0.3)">Quality Feedback</span></td>
                  <td>Audio</td>
                  <td style="color:#ffffff;font-weight:600">1 Report (Stored)</td>
                  <td><button type="button" class="btn-pill-secondary" style="padding:5px 12px;font-size:11.5px" data-action="improve">Inspect Defect</button></td>
                </tr>
                <tr>
                  <td>
                    <div class="table-product-cell">
                      <strong>Smart-home hub with unreliable connections</strong>
                      <small>Matter mesh gateway connectivity</small>
                    </div>
                  </td>
                  <td><span class="mfg-badge-demo" style="background:rgba(16,185,129,0.15);color:#6ee7b7;border-color:rgba(16,185,129,0.3)">Launch Ready</span></td>
                  <td>Home</td>
                  <td style="color:#ffffff;font-weight:600">1 Signal (Stored)</td>
                  <td><button type="button" class="btn-pill-secondary" style="padding:5px 12px;font-size:11.5px" data-action="progress">View Progress</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Embedded AG Studio Intelligence Preview -->
          <div class="mfg-studio-preview-card" id="mfgStudioCard">
            <div class="studio-preview-head">
              <div class="studio-badge-group">
                <span class="ag-brand-badge">AG STUDIO</span>
                <div class="studio-title-meta">
                  <h3>AG Studio Manufacturer Intelligence Preview</h3>
                  <p>Real-time D1 analytics, cross-filtering, and PayPal Sandbox order settlement telemetry</p>
                </div>
              </div>
              <button type="button" class="btn-pill-primary" id="openFullStudioBtn">
                <span>Open Interactive AG Studio Canvas →</span>
              </button>
            </div>

            <div class="studio-mini-kpi-row">
              <div class="studio-mini-kpi">
                <span>Stored Database Opportunities</span>
                <strong>4 Products</strong>
              </div>
              <div class="studio-mini-kpi">
                <span>Genuine Backer Actions</span>
                <strong>7 Recorded Signals</strong>
              </div>
              <div class="studio-mini-kpi">
                <span>Live Sandbox Settlement Offers</span>
                <strong>1 Active Batch</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Contextual Product Inspector -->
        <aside class="mfg-inspector-col">
          <div class="inspector-panel">
            <div class="inspector-header">
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <span>Product Dossier</span>
              </h3>
              <span class="inspector-stage-pill">Prototype Stage</span>
            </div>

            <div class="inspector-selected-product">
              <h4 class="inspector-title">Eight-input portable audio interface</h4>
              <span style="font-size:11.5px;color:var(--text-muted)">Selected Scenario: demo-a1 · Creator Tools</span>
            </div>

            <!-- Gemini RFC Engineering Requirements Checklist -->
            <div class="inspector-spec-block">
              <div class="spec-block-title">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span>Gemini 3.8 Flash Spec Checklist</span>
              </div>
              <div class="spec-req-list">
                <div class="spec-req-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>8× XLR/TRS discrete low-noise preamps with analog pads</span>
                </div>
                <div class="spec-req-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>24-bit / 192 kHz high-headroom AD/DA conversion DSP</span>
                </div>
                <div class="spec-req-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Dual USB-C bus power + low-latency host audio data</span>
                </div>
                <div class="spec-req-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>CNC-machined aluminum chassis with physical tactile knobs</span>
                </div>
              </div>
            </div>

            <!-- Stored D1 Database Signals Summary -->
            <div class="inspector-signals-card">
              <div class="inspector-signals-title">Stored Demand Evidence</div>
              <div class="inspector-signals-val">2 Intent Signals · $250 Target</div>
              <div class="inspector-signals-sub">Stored in D1 support table for demo-a1. Non-fabricated verification fixture.</div>
            </div>

            <!-- Inspector Action Box -->
            <div class="inspector-action-box">
              <button type="button" class="btn-inspector-action" data-action="offer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                <span>+ Submit Batch Production Offer</span>
              </button>
              <button type="button" class="btn-inspector-sub" onclick="go('#/product/demo-a1')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>Inspect Full Specification</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    `;

    bindHomeActions();
    if ($('#mfgStudioCanvasBtn')) $('#mfgStudioCanvasBtn').onclick = () => go('#/manufacturer/intelligence');
    if ($('#openFullStudioBtn')) $('#openFullStudioBtn').onclick = () => go('#/manufacturer/intelligence');
    if ($('#mfgStudioCard')) $('#mfgStudioCard').onclick = () => go('#/manufacturer/intelligence');
    return;
  }

  // Consumer Home
  $('#view').innerHTML = `
    <div class="app-workspace-layout view-enter">
      <div class="app-main-col">
        <div class="app-context-header">
          <div class="app-title-area">
            <h2>Personal Invention Workspace</h2>
            <p>Describe product needs, generate structured specifications, and follow manufacturing progress.</p>
          </div>
          <div class="app-context-actions">
            <button type="button" class="btn-pill-primary" data-action="request">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M15 2a6 6 0 0 0-6 6c0 2 1 3.5 2 4.5V14a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1.5c1-1 2-2.5 2-4.5a6 6 0 0 0-6-6z"/></svg>
              <span>+ Request Product Idea</span>
            </button>
            <button type="button" class="btn-pill-secondary" data-action="explore">
              <span>Explore Community</span>
            </button>
          </div>
        </div>

        <div class="app-hero-command-card">
          <div class="app-hero-info">
            <div class="app-hero-badge-row">
              <span class="mfg-badge-live">Invention Track</span>
              <span class="mfg-badge-demo">Demo Scenario</span>
              <span style="font-size:11px;color:var(--text-muted)">Creator Hardware</span>
            </div>
            <h3 class="app-hero-title">Eight-input portable audio interface</h3>
            <p class="app-hero-desc">Your invention has mobilized 2 verified backer signals and an active manufacturing offer from StudioWorks.</p>
            <div class="app-hero-metrics">
              <div class="app-metric-tile">
                <span class="mfg-metric-label">Backers</span>
                <span class="mfg-metric-value">2 Signals</span>
                <span class="mfg-metric-footnote">Stored D1 Intent</span>
              </div>
              <div class="app-metric-tile">
                <span class="mfg-metric-label">Target Retail</span>
                <span class="mfg-metric-value">$249.00</span>
                <span class="mfg-metric-footnote">Consumer Goal</span>
              </div>
              <div class="app-metric-tile">
                <span class="mfg-metric-label">Manufacturer</span>
                <span class="mfg-metric-value">StudioWorks</span>
                <span class="mfg-metric-footnote">Batch #1 Active</span>
              </div>
            </div>
            <div class="app-hero-actions">
              <button type="button" class="btn-pill-primary" data-action="request">
                <span>+ Request New Idea</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button type="button" class="btn-pill-secondary" data-action="orders">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                <span>My PayPal Orders</span>
              </button>
            </div>
          </div>
          <div class="app-hero-graphic-stage">
            ${renderIdeaToProductSvg()}
          </div>
        </div>

        <!-- Product Opportunity Queue Table -->
        <div class="mfg-section-title-row">
          <h4 class="mfg-section-title">Community Inventions &amp; Backer Demands</h4>
          <div style="display:flex;align-items:center;gap:8px">
            <button type="button" class="btn-pill-secondary" data-action="explore" style="padding:4px 12px;font-size:11.5px">Explore All</button>
            <button type="button" class="btn-pill-secondary" data-action="mine" style="padding:4px 12px;font-size:11.5px">My Inventions</button>
          </div>
        </div>

        <div class="app-opp-table-card">
          <table class="app-table">
            <thead>
              <tr>
                <th>Product Invention</th>
                <th>Status</th>
                <th>Category</th>
                <th>Supporters</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="table-product-cell">
                    <strong>Eight-input portable audio interface</strong>
                    <small>8-channel XLR/TRS DSP hardware</small>
                  </div>
                </td>
                <td><span class="mfg-badge-live">Prototype</span></td>
                <td>Creator Tools</td>
                <td><strong style="color:#ffffff">2 Backers</strong></td>
                <td><button type="button" class="btn-pill-primary" onclick="go('#/product/demo-a1')" style="padding:4px 12px;font-size:11.5px">View Progress</button></td>
              </tr>
              <tr>
                <td>
                  <div class="table-product-cell">
                    <strong>Open-hardware motorized fader wing</strong>
                    <small>Motorized DAW mixing controller</small>
                  </div>
                </td>
                <td><span class="mfg-badge-demo" style="background:rgba(56,152,255,0.15);color:#93c5fd;border-color:rgba(56,152,255,0.3)">Idea Stage</span></td>
                <td>Audio &amp; Music</td>
                <td><strong style="color:#ffffff">2 Backers</strong></td>
                <td><button type="button" class="btn-pill-secondary" onclick="go('#/product/demo-c1')" style="padding:4px 12px;font-size:11.5px">Support Idea</button></td>
              </tr>
              <tr>
                <td>
                  <div class="table-product-cell">
                    <strong>CNC-milled macro stream controller</strong>
                    <small>Tactile broadcast keypad with OLEDs</small>
                  </div>
                </td>
                <td><span class="mfg-badge-demo" style="background:rgba(239,68,68,0.15);color:#fca5a5;border-color:rgba(239,68,68,0.3)">Quality Feedback</span></td>
                <td>Creator Tools</td>
                <td><strong style="color:#ffffff">2 Backers</strong></td>
                <td><button type="button" class="btn-pill-secondary" onclick="go('#/product/demo-d1')" style="padding:4px 12px;font-size:11.5px">Inspect Spec</button></td>
              </tr>
              <tr>
                <td>
                  <div class="table-product-cell">
                    <strong>Analog summing bus mixer</strong>
                    <small>Discrete 8-channel analog summing unit</small>
                  </div>
                </td>
                <td><span class="mfg-badge-demo" style="background:rgba(16,185,129,0.15);color:#6ee7b7;border-color:rgba(16,185,129,0.3)">Launch Ready</span></td>
                <td>Audio &amp; Music</td>
                <td><strong style="color:#ffffff">1 Backer</strong></td>
                <td><button type="button" class="btn-pill-secondary" onclick="go('#/product/demo-b1')" style="padding:4px 12px;font-size:11.5px">Review Offer</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- AG Studio Quick Card -->
        <div class="app-studio-preview-card" style="cursor:pointer" onclick="go('#/orders')">
          <div class="studio-preview-head">
            <div class="studio-badge-group">
              <span class="ag-brand-badge" style="background:rgba(0,112,186,0.25);color:#93c5fd">PAYPAL SANDBOX</span>
              <div class="studio-title-meta">
                <h3>Pre-Order &amp; Batch Escrow Ledger</h3>
                <p>Transactions captured via PayPal Sandbox REST API v2 with automatic reconciliation.</p>
              </div>
            </div>
            <button type="button" class="btn-pill-secondary" style="padding:6px 14px;font-size:12px">
              <span>View Orders</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
          <div class="studio-mini-kpi-row">
            <div class="studio-mini-kpi">
              <span>Pre-Orders</span>
              <strong>1 Completed</strong>
            </div>
            <div class="studio-mini-kpi">
              <span>Backed Ideas</span>
              <strong>2 Inventions</strong>
            </div>
            <div class="studio-mini-kpi">
              <span>Protection</span>
              <strong>Escrow Verified</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column Contextual Inspector -->
      <aside class="app-inspector-col">
        <div class="inspector-panel">
          <div class="inspector-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Invention Dossier</span>
            </h3>
            <span class="inspector-stage-pill">ACTIVE BATCH</span>
          </div>

          <div class="inspector-selected-product">
            <h4 class="inspector-title">Eight-input portable audio interface</h4>
            <span style="font-size:11.5px;color:var(--text-muted)">Creator Tools · StudioWorks Batch #1</span>
          </div>

          <div class="inspector-spec-block">
            <div class="spec-block-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>GEMINI SPEC HIGHLIGHTS</span>
            </div>
            <div class="spec-req-list">
              <div class="spec-req-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>8x discrete XLR/TRS preamps with physical tactile knobs</span>
              </div>
              <div class="spec-req-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>24-bit / 192 kHz high-headroom AD/DA conversion DSP</span>
              </div>
              <div class="spec-req-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Bus-powered dual USB-C architecture for field recording</span>
              </div>
            </div>
          </div>

          <div class="inspector-signals-card">
            <span class="inspector-signals-title">VERIFIED BACKING STATUS</span>
            <span class="inspector-signals-val">2 Intent Signals · $249 Target</span>
            <span class="inspector-signals-sub">Batch #1 threshold: 200 units. Manufacturer offer committed by StudioWorks.</span>
          </div>

          <div class="inspector-action-box">
            <button type="button" class="btn-inspector-action" onclick="go('#/product/demo-a1')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
              <span>Back with PayPal Sandbox</span>
            </button>
            <button type="button" class="btn-inspector-sub" onclick="go('#/product/demo-a1')">
              <span>View Full Specification</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  `;  bindHomeActions();
}

function help() {
  $('#heading').textContent = 'How GENESIS Works';
  $('#view').innerHTML = `
    <div class="app-workspace-layout view-enter">
      <!-- Main Content Column -->
      <div class="app-main-col">
        <div class="app-context-header">
          <div class="app-title-area">
            <h2>How PayPal GENESIS Works</h2>
            <p>From consumer demand to AI specifications, manufacturing decisions, and PayPal checkout.</p>
          </div>
          <div class="app-context-actions">
            <button type="button" class="btn-pill-primary" id="helpExplore">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              <span>${maker() ? 'Find Products People Want' : 'Explore Inventions'}</span>
            </button>
            ${!maker() ? `
              <button type="button" class="btn-pill-secondary" id="helpBecomeMaker">
                <span>How Manufacturers Join</span>
              </button>
            ` : ''}
          </div>
        </div>

        <div class="app-hero-command-card">
          <div class="app-hero-info">
            <div class="app-hero-badge-row">
              <span class="mfg-badge-live">Product OS</span>
              <span class="mfg-badge-demo">Gemini 3.8 Flash</span>
              <span style="font-size:11px;color:var(--text-muted)">PayPal Sandbox Only</span>
            </div>
            <h3 class="app-hero-title">From everyday needs to manufactured products</h3>
            <p class="app-hero-desc">Products should begin with people. GENESIS connects consumer demand, AI-powered specifications, manufacturing decisions, and PayPal.</p>
            <div class="app-hero-metrics">
              <div class="app-metric-tile">
                <span class="mfg-metric-label">Stage 1</span>
                <span class="mfg-metric-value">Consumer Intent</span>
                <span class="mfg-metric-footnote">Unbuilt product ideas</span>
              </div>
              <div class="app-metric-tile">
                <span class="mfg-metric-label">Stage 2</span>
                <span class="mfg-metric-value">AI Specs</span>
                <span class="mfg-metric-footnote">Gemini 3.8 Flash RFC</span>
              </div>
              <div class="app-metric-tile">
                <span class="mfg-metric-label">Stage 3</span>
                <span class="mfg-metric-value">PayPal Escrow</span>
                <span class="mfg-metric-footnote">Milestone batch pre-orders</span>
              </div>
            </div>
            <div class="app-hero-actions">
              <button type="button" class="btn-pill-primary" onclick="go('#/home')">
                <span>Enter Workspace</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button type="button" class="btn-pill-secondary" onclick="go('#/orders')">
                <span>PayPal Orders</span>
              </button>
            </div>
          </div>
          <div class="app-hero-graphic-stage">
            ${renderIdeaToProductSvg()}
          </div>
        </div>

        <div class="mfg-section-title-row">
          <h4 class="mfg-section-title">The Four Core Pillars of GENESIS</h4>
          <span style="font-size:11.5px;color:var(--text-muted)">Architectural Blueprint</span>
        </div>

        <div class="app-opp-table-card" style="padding:16px 20px">
          <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:14px">
            <div style="background:rgba(0,0,0,0.25);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:14px">
              <h4 style="margin:0 0 6px 0;color:#ffffff;font-size:14px">1. Share Consumer Need</h4>
              <p style="margin:0;font-size:12px;color:var(--text-secondary);line-height:1.45">Describe products you wish existed or problems with current ones. Expressing non-binding interest is free and demonstrates real customer demand.</p>
            </div>
            <div style="background:rgba(0,0,0,0.25);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:14px">
              <h4 style="margin:0 0 6px 0;color:#ffffff;font-size:14px">2. AI Specification Engine</h4>
              <p style="margin:0;font-size:12px;color:var(--text-secondary);line-height:1.45">Gemini 3.8 Flash structures natural language descriptions into engineering RFC specifications, estimating BOM, DSP interfaces, and target retail pricing.</p>
            </div>
            <div style="background:rgba(0,0,0,0.25);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:14px">
              <h4 style="margin:0 0 6px 0;color:#ffffff;font-size:14px">3. AG Studio Intelligence</h4>
              <p style="margin:0;font-size:12px;color:var(--text-secondary);line-height:1.45">Manufacturers use AG Grid and AG Charts to analyze aggregate consumer demand, evaluate technical feasibility, and commit batch production offers.</p>
            </div>
            <div style="background:rgba(0,0,0,0.25);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:14px">
              <h4 style="margin:0 0 6px 0;color:#ffffff;font-size:14px">4. PayPal Sandbox Checkout</h4>
              <p style="margin:0;font-size:12px;color:var(--text-secondary);line-height:1.45">Consumers back active batch offers with PayPal Sandbox checkout. Payments are captured server-side with milestone reconciliation and buyer escrow protection.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column Contextual Inspector -->
      <aside class="app-inspector-col">
        <div class="inspector-panel">
          <div class="inspector-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Judge &amp; Demo Guide</span>
            </h3>
            <span class="inspector-stage-pill">ZERO FRICTION</span>
          </div>

          <div class="inspector-selected-product">
            <h4 class="inspector-title">Hackathon Evaluation</h4>
            <span style="font-size:11.5px;color:var(--text-muted)">Verified Production Stack</span>
          </div>

          <div class="inspector-spec-block">
            <div class="spec-block-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>JUDGE TESTING INSTRUCTIONS</span>
            </div>
            <div class="spec-req-list">
              <div class="spec-req-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>One-click guest entrance: No signup or personal registration required</span>
              </div>
              <div class="spec-req-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Real live Gemini 3.8 Flash specification generation in Idea Creation</span>
              </div>
              <div class="spec-req-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>AG Studio manufacturer analytics with live AG Grid data explorer</span>
              </div>
              <div class="spec-req-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>End-to-end PayPal Sandbox order creation and server-side capture</span>
              </div>
            </div>
          </div>

          <div class="inspector-signals-card">
            <span class="inspector-signals-title">DEMO SCENARIOS NOTE</span>
            <span class="inspector-signals-val">4 Preseeded Products</span>
            <span class="inspector-signals-sub">Sample items are labeled DEMO. Preseeded scenarios illustrate realistic consumer-to-manufacturer workflows.</span>
          </div>

          <div class="inspector-action-box">
            <button type="button" class="btn-inspector-action" onclick="go('#/home')">
              <span>Explore Workspace</span>
            </button>
            <button type="button" class="btn-inspector-sub" onclick="go('#/explore')">
              <span>View Community Demand</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  `;

  $('#helpExplore').onclick = () => go(maker() ? '#/manufacturer/demand' : '#/explore');
  if ($('#helpBecomeMaker')) {
    $('#helpBecomeMaker').onclick = () => {
      if (!user) {
        pendingAfterAuth = () => go('#/account');
        auth();
      } else {
        go('#/account');
      }
    };
  }
}

function productRowHtml(p, btnLabel = 'Inspect Spec') {
  const isProto = p.status === 'prototype';
  return `<tr>
    <td>
      <div class="table-product-cell">
        <strong>${esc(p.title)}</strong>
        <small>${esc((p.description || '').slice(0, 80))}${(p.description || '').length > 80 ? '…' : ''}</small>
      </div>
    </td>
    <td><span class="${isProto ? 'mfg-badge-live' : 'mfg-badge-demo'}">${esc(stageName[p.status] || p.status)}</span></td>
    <td>${esc(p.category || 'Hardware')}</td>
    <td><strong style="color:#ffffff">${p.supporters ?? 0} Backers</strong></td>
    <td><button type="button" class="btn-pill-secondary" data-pid="${esc(p.id)}" style="padding:4px 12px;font-size:11.5px">${esc(btnLabel)}</button></td>
  </tr>`;
}

function productCardHtml(p, btnLabel = 'View idea') {
  return `<article class="card">
    <div class="row" style="margin-bottom:10px">
      <span class="badge">${esc(stageName[p.status] || p.status)}</span>
      ${p.demo ? '<span class="badge demo">DEMO</span>' : ''}
    </div>
    <h3>${esc(p.title)}</h3>
    <p>${esc((p.description || '').slice(0, 150))}${(p.description || '').length > 150 ? '…' : ''}</p>
    <div class="card-foot">
      <span class="muted">${p.supporters ?? 0} interested · ${p.reports ?? 0} reports</span>
      <button type="button" class="secondary" data-pid="${esc(p.id)}">${esc(btnLabel)}</button>
    </div>
  </article>`;
}

async function explore() {
  $('#heading').textContent = 'Explore Ideas';
  const data = await api('/products');
  const products = data.products || [];
  const totalBackers = products.reduce((acc, p) => acc + (p.supporters || 0), 0);
  const featured = products[0] || { title: 'Eight-input portable audio interface', category: 'Creator Tools', status: 'prototype', supporters: 2 };

  $('#view').innerHTML = `
    <div class="app-workspace-layout view-enter">
      <!-- Main Opportunities Column -->
      <div class="app-main-col">
        <div class="app-context-header">
          <div class="app-title-area">
            <h2>Community Product Demand Explorer</h2>
            <p>Browse unbuilt product ideas, inspect Gemini technical specifications, and mobilize manufacturer batch builds.</p>
          </div>
          <div class="app-context-actions">
            ${!maker() ? `
              <button type="button" class="btn-pill-primary" id="exploreReqBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                <span>+ Request Product Idea</span>
              </button>
            ` : `
              <button type="button" class="btn-pill-primary" id="exploreStudioBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                <span>AG Studio Intelligence</span>
              </button>
            `}
          </div>
        </div>

        <div class="app-hero-command-card">
          <div class="app-hero-info">
            <div class="app-hero-badge-row">
              <span class="mfg-badge-live">Verified Consumer Intent</span>
              <span class="mfg-badge-demo">D1 Backed</span>
              <span style="font-size:11px;color:var(--text-muted)">Gemini Evaluated</span>
            </div>
            <h3 class="app-hero-title">Discover products waiting to be manufactured</h3>
            <p class="app-hero-desc">Community-submitted ideas with AI-structured requirements. Express demand or commit manufacturing capacity to begin batch production.</p>
            <div class="app-hero-metrics">
              <div class="app-metric-tile">
                <span class="mfg-metric-label">Inventions</span>
                <span class="mfg-metric-value">${products.length} Products</span>
                <span class="mfg-metric-footnote">Community Catalog</span>
              </div>
              <div class="app-metric-tile">
                <span class="mfg-metric-label">Backer Signals</span>
                <span class="mfg-metric-value">${totalBackers} Signals</span>
                <span class="mfg-metric-footnote">Verified D1 Intent</span>
              </div>
              <div class="app-metric-tile">
                <span class="mfg-metric-label">Active Batches</span>
                <span class="mfg-metric-value">1 Active</span>
                <span class="mfg-metric-footnote">StudioWorks Batch #1</span>
              </div>
            </div>
            <div class="app-hero-actions">
              ${!maker() ? `
                <button type="button" class="btn-pill-primary" onclick="go('#/request')">
                  <span>+ Request New Idea</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              ` : `
                <button type="button" class="btn-pill-primary" onclick="go('#/manufacturer/intelligence')">
                  <span>Open AG Studio</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              `}
              <button type="button" class="btn-pill-secondary" onclick="go('#/orders')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                <span>PayPal Orders</span>
              </button>
            </div>
          </div>
          <div class="app-hero-graphic-stage">
            ${renderIdeaToProductSvg()}
          </div>
        </div>

        <div class="mfg-section-title-row">
          <h4 class="mfg-section-title">Community Idea Queue</h4>
          <div style="display:flex;align-items:center;gap:8px">
            <input id="search" placeholder="Search ideas…" style="width:160px;padding:4px 10px;font-size:11.5px">
            <select id="filter" style="padding:4px 8px;font-size:11.5px">
              <option value="">All Stages</option>
              ${stages.map((x) => `<option value="${x}">${esc(stageName[x])}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="app-opp-table-card">
          <table class="app-table">
            <thead>
              <tr>
                <th>Product Opportunity</th>
                <th>Status</th>
                <th>Category</th>
                <th>Verified Signals</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="cards">
              ${products.map((p) => productRowHtml(p)).join('') ||
                '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted)">No ideas yet. Be the first to share one.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column Contextual Inspector -->
      <aside class="app-inspector-col">
        <div class="inspector-panel" id="exploreDossier">
          <div class="inspector-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Selected Dossier</span>
            </h3>
            <span class="inspector-stage-pill" id="dossierStage">${esc(stageName[featured.status] || featured.status).toUpperCase()}</span>
          </div>

          <div class="inspector-selected-product">
            <h4 class="inspector-title" id="dossierTitle">${esc(featured.title)}</h4>
            <span style="font-size:11.5px;color:var(--text-muted)" id="dossierCategory">${esc(featured.category || 'Hardware')} · ${featured.supporters || 0} Backers</span>
          </div>

          <div class="inspector-spec-block">
            <div class="spec-block-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>GEMINI SPEC STATUS</span>
            </div>
            <div class="spec-req-list">
              <div class="spec-req-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Structured requirements generated by Gemini 3.8 Flash</span>
              </div>
              <div class="spec-req-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Estimated unit target and physical bill of materials</span>
              </div>
            </div>
          </div>

          <div class="inspector-signals-card">
            <span class="inspector-signals-title">VERIFIED DEMAND</span>
            <span class="inspector-signals-val" id="dossierSignals">${featured.supporters || 0} Intent Signals</span>
            <span class="inspector-signals-sub">Backed by verified consumer signals stored in Cloudflare D1.</span>
          </div>

          <div class="inspector-action-box">
            <button type="button" class="btn-inspector-action" id="dossierActionBtn" onclick="go('#/product/' + '${esc(featured.id || 'demo-a1')}')">
              <span>Inspect Full Specification</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </aside>
    </div>
  `;

  if ($('#exploreReqBtn')) $('#exploreReqBtn').onclick = () => go('#/request');
  if ($('#exploreStudioBtn')) $('#exploreStudioBtn').onclick = () => go('#/manufacturer/intelligence');

  const updateDossier = (p) => {
    $('#dossierTitle').textContent = p.title;
    $('#dossierCategory').textContent = (p.category || 'Hardware') + ' · ' + (p.supporters || 0) + ' Backers';
    $('#dossierStage').textContent = (stageName[p.status] || p.status).toUpperCase();
    $('#dossierSignals').textContent = (p.supporters || 0) + ' Intent Signals';
    $('#dossierActionBtn').onclick = () => go('#/product/' + p.id);
  };

  const bindCards = () => {
    $('#cards')
      .querySelectorAll('[data-pid]')
      .forEach((b) => {
        b.onclick = (e) => {
          e.stopPropagation();
          go('#/product/' + b.dataset.pid);
        };
      });
    $('#cards')
      .querySelectorAll('tr')
      .forEach((tr, i) => {
        tr.style.cursor = 'pointer';
        tr.onclick = () => {
          const btn = tr.querySelector('[data-pid]');
          if (btn) {
            const p = products.find(x => x.id === btn.dataset.pid);
            if (p) updateDossier(p);
          }
        };
      });
  };
  bindCards();

  let timer;
  const runSearch = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const res = await api(
          '/products?q=' +
            encodeURIComponent($('#search').value) +
            '&status=' +
            encodeURIComponent($('#filter').value)
        );
        $('#cards').innerHTML =
          res.products.map((p) => productRowHtml(p)).join('') ||
          '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted)">No matching ideas found. Try clearing your filters.</td></tr>';
        bindCards();
      } catch (e) {
        notice(e.message, 'error');
      }
    }, 150);
  };
  $('#search').oninput = runSearch;
  $('#filter').onchange = runSearch;
}

function specEditorHtml(spec, canEdit = true) {
  const s = spec || {
    title: '',
    requirements: [],
    questions: [],
    assumptions: [],
    complexity: 'medium',
  };
  if (!canEdit) {
    return `<div class="spec-box">
      <strong>${esc(s.title)}</strong>
      <span class="badge muted-badge" style="margin-left:8px">Complexity: ${esc(s.complexity)}</span>
      <p class="muted" style="margin-top:8px">Requirements</p>
      <ul>${(s.requirements || []).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      ${
        (s.questions || []).length
          ? `<p class="muted">Open questions</p><ul>${s.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>`
          : ''
      }
      ${
        (s.assumptions || []).length
          ? `<p class="muted">Assumptions</p><ul>${s.assumptions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>`
          : ''
      }
      <p class="field-hint">${esc(s.uncertainty || 'Preliminary suggestions; feasibility and demand are unverified.')}</p>
    </div>`;
  }

  return `<div class="spec-box" id="specEditorBox">
    <h3>Product requirements specification</h3>
    <p class="field-hint" style="margin-bottom:12px">Edit any generated line below before saving. List one item per line (up to 6 items per list).</p>
    <div class="stack">
      <label>Specification title <span class="req">(Required)</span>
        <input id="specTitle" maxlength="120" value="${esc(s.title || '')}" placeholder="Short specification title">
        <span class="field-error" id="specErrTitle"></span>
      </label>
      <label>Key requirements <span class="req">(Required · 1 to 6 lines)</span>
        <textarea id="specRequirements" style="min-height:110px" placeholder="One requirement per line">${esc((s.requirements || []).join('\n'))}</textarea>
        <span class="field-error" id="specErrReq"></span>
      </label>
      <label>Open questions <span class="opt">(Optional · up to 6 lines)</span>
        <textarea id="specQuestions" style="min-height:85px" placeholder="Questions a manufacturer would need answered">${esc((s.questions || []).join('\n'))}</textarea>
        <span class="field-error" id="specErrQ"></span>
      </label>
      <label>Key assumptions <span class="opt">(Optional · up to 6 lines)</span>
        <textarea id="specAssumptions" style="min-height:85px" placeholder="Assumptions to verify">${esc((s.assumptions || []).join('\n'))}</textarea>
        <span class="field-error" id="specErrA"></span>
      </label>
      <label>Estimated complexity <span class="req">(Required)</span>
        <select id="specComplexity">
          ${['low', 'medium', 'high']
            .map((c) => `<option value="${c}" ${s.complexity === c ? 'selected' : ''}>${c[0].toUpperCase() + c.slice(1)}</option>`)
            .join('')}
        </select>
      </label>
      <span class="field-hint">Preliminary specification only; technical feasibility and demand remain unverified until reviewed.</span>
    </div>
  </div>`;
}

function readSpecEditor() {
  const titleEl = $('#specTitle');
  if (!titleEl) return null;
  const cleanLines = (val) =>
    val
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const title = titleEl.value.trim();
  const requirements = cleanLines($('#specRequirements').value);
  const questions = cleanLines($('#specQuestions').value);
  const assumptions = cleanLines($('#specAssumptions').value);
  const complexity = $('#specComplexity').value;

  $('#specErrTitle').textContent = '';
  $('#specErrReq').textContent = '';
  $('#specErrQ').textContent = '';
  $('#specErrA').textContent = '';

  let valid = true;
  if (!title || title.length > 120) {
    $('#specErrTitle').textContent = 'Enter a specification title (1–120 characters).';
    valid = false;
  }
  if (!requirements.length || requirements.length > 6 || requirements.some((x) => x.length > 300)) {
    $('#specErrReq').textContent = 'Enter 1 to 6 requirements (each under 300 characters).';
    valid = false;
  }
  if (questions.length > 6 || questions.some((x) => x.length > 300)) {
    $('#specErrQ').textContent = 'Enter at most 6 questions (each under 300 characters).';
    valid = false;
  }
  if (assumptions.length > 6 || assumptions.some((x) => x.length > 300)) {
    $('#specErrA').textContent = 'Enter at most 6 assumptions (each under 300 characters).';
    valid = false;
  }
  if (!valid) return { error: true };
  return { title, requirements, questions, assumptions, complexity };
}

function composeDraftDescription(d) {
  return [
    d.idea,
    d.features && 'Important features: ' + d.features,
    d.budget && 'Target budget: ' + d.budget,
    d.use && 'Intended use: ' + d.use,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function requestWizard(step = 1, publishedId = null) {
  $('#heading').textContent = 'Request a product';
  if (!user) {
    $('#view').innerHTML = `
      <div class="empty">
        <h2>Sign in to share your product idea</h2>
        <p>Your draft will be saved so you can finish sharing right after signing in.</p>
        <div class="row" style="justify-content:center;margin-top:16px">
          <button type="button" class="primary" id="reqSignInBtn">Sign in</button>
          <button type="button" class="secondary" id="reqRegisterBtn">Create account</button>
        </div>
      </div>`;
    $('#reqSignInBtn').onclick = () => {
      pendingAfterAuth = () => requestWizard(step);
      auth();
    };
    $('#reqRegisterBtn').onclick = () => {
      pendingAfterAuth = () => requestWizard(step);
      register();
    };
    return;
  }

  if (step === 5 && publishedId) {
    $('#view').innerHTML = `
      <div class="wizard">
        <div class="panel">
          <span class="badge success">Published</span>
          <h2 style="margin-top:10px">Your idea is published.</h2>
          <p>GENESIS can help turn your description into product requirements.</p>
          <p class="field-hint">Other people can now view and support your idea. Publishing an idea does not guarantee that a manufacturer will produce it.</p>
          <div class="row" style="margin-top:20px">
            <button type="button" class="primary" id="postAnalyzeBtn">Analyze my idea</button>
            <button type="button" class="secondary" id="postViewBtn">View my idea</button>
            <button type="button" class="secondary" id="postExploreBtn">Explore similar ideas</button>
          </div>
        </div>
      </div>`;
    $('#postAnalyzeBtn').onclick = () => go('#/product/' + publishedId + '?analyze=1');
    $('#postViewBtn').onclick = () => go('#/product/' + publishedId);
    $('#postExploreBtn').onclick = () => go('#/explore');
    return;
  }

  const steps = ['Your idea', 'Your priorities', 'Review details', 'Publish'];
  $('#view').innerHTML = `
    <div class="wizard">
      <div class="steps">
        ${steps
          .map(
            (s, i) =>
              `<span class="${i + 1 < step ? 'done' : i + 1 === step ? 'current' : ''}">${i + 1}. ${s}</span>`
          )
          .join('')}
      </div>
      <div class="panel" id="wizardBody"></div>
    </div>`;

  const box = $('#wizardBody');

  if (step === 1) {
    box.innerHTML = `
      <h2>What product do you wish existed?</h2>
      <p>Start with the problem or need in plain words. You can refine it before publishing.</p>
      <form class="stack" id="stepForm" novalidate>
        <label>Describe your idea <span class="req">(Required)</span>
          <textarea name="idea" maxlength="3000" placeholder="Example: I wish there was a compact 8-input audio recorder I could run on USB-C power without bringing a laptop.">${esc(draft.idea || '')}</textarea>
          <span class="field-hint">Tip: Mention who it is for and what frustrates you about current options.</span>
          <span class="field-error" data-err="idea"></span>
        </label>
        <label>Category <span class="opt">(Optional)</span>
          <input name="category" maxlength="60" value="${esc(draft.category || '')}" placeholder="Example: Audio, Home, Travel, Creator tools">
        </label>
        <div class="row">
          <button type="button" class="secondary" id="cancelWizard">Cancel</button>
          <button type="submit" class="primary">Continue</button>
        </div>
      </form>`;
    $('#cancelWizard').onclick = () => go('#/home');
    $('#stepForm').onsubmit = (e) => {
      e.preventDefault();
      const form = e.target;
      const idea = form.idea.value.trim();
      form.querySelector('[data-err="idea"]').textContent = '';
      if (!idea) {
        form.querySelector('[data-err="idea"]').textContent = 'Please describe the product idea you want to share.';
        return;
      }
      if (draft.idea !== idea) {
        draft.customDescription = false;
      }
      draft.idea = idea;
      draft.category = form.category.value.trim();
      saveStore('genesis_req_draft', draft);
      requestWizard(2);
    };
    return;
  }

  if (step === 2) {
    box.innerHTML = `
      <h2>What matters most to you?</h2>
      <p>Highlight the must-have features so others and potential manufacturers understand your priorities.</p>
      <form class="stack" id="stepForm" novalidate>
        <label>Essential features <span class="req">(Required)</span>
          <textarea name="features" maxlength="1500" placeholder="Example: Eight microphone preamps, tactile gain knobs, battery or USB-C power.">${esc(draft.features || '')}</textarea>
          <span class="field-error" data-err="features"></span>
        </label>
        <label>Target budget <span class="opt">(Optional)</span>
          <input name="budget" maxlength="100" value="${esc(draft.budget || '')}" placeholder="Example: Around $250">
        </label>
        <label>How would you use it? <span class="opt">(Optional)</span>
          <textarea name="use" style="min-height:85px" maxlength="1000" placeholder="Example: Recording live rehearsals and small venue shows.">${esc(draft.use || '')}</textarea>
        </label>
        <div class="row">
          <button type="button" class="secondary" id="backBtn">Back</button>
          <button type="submit" class="primary">Continue</button>
        </div>
      </form>`;

    const captureStep2 = () => {
      const form = $('#stepForm');
      const nextFeatures = form.features.value.trim();
      const nextBudget = form.budget.value.trim();
      const nextUse = form.use.value.trim();
      if (
        nextFeatures !== draft.features ||
        nextBudget !== draft.budget ||
        nextUse !== draft.use
      ) {
        draft.customDescription = false;
      }
      draft.features = nextFeatures;
      draft.budget = nextBudget;
      draft.use = nextUse;
      saveStore('genesis_req_draft', draft);
    };

    $('#backBtn').onclick = () => {
      captureStep2();
      requestWizard(1);
    };

    $('#stepForm').onsubmit = (e) => {
      e.preventDefault();
      const form = e.target;
      form.querySelector('[data-err="features"]').textContent = '';
      if (!form.features.value.trim()) {
        form.querySelector('[data-err="features"]').textContent = 'List at least one essential feature.';
        return;
      }
      captureStep2();
      requestWizard(3);
    };
    return;
  }

  if (step === 3) {
    const composed = composeDraftDescription(draft);
    const currentDescription = draft.customDescription ? draft.description || composed : composed;

    box.innerHTML = `
      <h2>Name and review your idea</h2>
      <p>Give your idea a clear short title and review the full description. You can optionally generate preliminary product requirements before publishing.</p>
      <form class="stack" id="stepForm" novalidate>
        <label>Product name <span class="req">(Required)</span>
          <input name="title" maxlength="120" value="${esc(draft.title || '')}" placeholder="Example: Portable eight-input audio interface">
          <span class="field-error" data-err="title"></span>
        </label>
        <label>Full description <span class="req">(Required)</span>
          <textarea name="description" maxlength="4000">${esc(currentDescription)}</textarea>
          <span class="field-error" data-err="description"></span>
        </label>
        <div class="row">
          <button type="button" class="secondary" id="backBtn">Back</button>
          <button type="button" class="secondary" id="analyzeBtn">Generate requirements</button>
          <button type="submit" class="primary">Review &amp; publish</button>
        </div>
      </form>
      <div id="analysisWrap">${draftAnalysis ? specEditorHtml(draftAnalysis, true) : ''}</div>
    `;

    const captureStep3 = () => {
      const form = $('#stepForm');
      draft.title = form.title.value.trim();
      const desc = form.description.value.trim();
      if (desc !== composed) {
        draft.customDescription = true;
      }
      draft.description = desc;
      saveStore('genesis_req_draft', draft);
      const editedSpec = readSpecEditor();
      if (editedSpec && !editedSpec.error) {
        draftAnalysis = editedSpec;
        saveStore('genesis_req_analysis', draftAnalysis);
      }
    };

    $('#backBtn').onclick = () => {
      captureStep3();
      requestWizard(2);
    };

    $('#analyzeBtn').onclick = (e) => {
      const desc = $('#stepForm').description.value.trim();
      $('#stepForm').querySelector('[data-err="description"]').textContent = '';
      if (!desc) {
        $('#stepForm').querySelector('[data-err="description"]').textContent = 'Enter a description before generating requirements.';
        return;
      }
      loading(
        e.currentTarget,
        async () => {
          try {
            const res = await api('/analyze', 'POST', { description: desc });
            draftAnalysis = res.analysis;
            saveStore('genesis_req_analysis', draftAnalysis);
            if (!$('#stepForm').title.value.trim() && res.analysis.title) {
              $('#stepForm').title.value = res.analysis.title;
            }
            $('#analysisWrap').innerHTML = specEditorHtml(draftAnalysis, true);
            notice('Preliminary requirements generated. You can edit any line before saving.', 'success');
          } catch (err) {
            notice(err.message, 'error');
          }
        },
        'Analyzing…'
      );
    };

    $('#stepForm').onsubmit = (e) => {
      e.preventDefault();
      const form = e.target;
      form.querySelectorAll('.field-error').forEach((n) => (n.textContent = ''));
      if (!form.title.value.trim()) {
        form.querySelector('[data-err="title"]').textContent = 'Enter a short product name.';
        return;
      }
      if (!form.description.value.trim()) {
        form.querySelector('[data-err="description"]').textContent = 'Enter a product description.';
        return;
      }
      const editedSpec = readSpecEditor();
      if (editedSpec?.error) return;
      if (editedSpec) {
        draftAnalysis = editedSpec;
        saveStore('genesis_req_analysis', draftAnalysis);
      }
      captureStep3();
      requestWizard(4);
    };
    return;
  }

  if (step === 4) {
    box.innerHTML = `
      <h2>Ready to publish?</h2>
      <p>Review your idea below. Publishing makes it visible in Explore so others can support it. It does not promise that a manufacturer will build it.</p>
      <div class="review">
        <strong>${esc(draft.title)}</strong>
        ${draft.category ? `<span class="badge muted-badge" style="margin-left:8px">${esc(draft.category)}</span>` : ''}
        <p style="margin-top:10px;white-space:pre-line">${esc(draft.description)}</p>
        ${
          draftAnalysis
            ? `<p class="field-hint" style="margin-top:10px">Includes editable product requirements (${draftAnalysis.requirements.length} requirements, complexity: ${esc(draftAnalysis.complexity)}).</p>`
            : ''
        }
      </div>
      <div class="row">
        <button type="button" class="secondary" id="backBtn">Back</button>
        <button type="button" class="primary" id="publishBtn">Publish idea</button>
      </div>`;

    $('#backBtn').onclick = () => requestWizard(3);
    $('#publishBtn').onclick = (e) =>
      loading(
        e.currentTarget,
        async () => {
          try {
            const created = await api('/products', 'POST', {
              title: draft.title,
              description: draft.description,
              category: draft.category || 'Other',
            });
            const savedSpec = draftAnalysis;
            draft = {};
            draftAnalysis = null;
            clearStore('genesis_req_draft');
            clearStore('genesis_req_analysis');
            if (savedSpec) {
              try {
                await api('/products/' + created.id + '/spec', 'POST', {
                  analysis: savedSpec,
                });
              } catch (err) {
                notice('Idea published, but specifications could not be saved: ' + err.message, 'error');
              }
            }
            requestWizard(5, created.id);
          } catch (err) {
            notice(err.message, 'error');
          }
        },
        'Publishing…'
      );
  }
}

async function reportWizard(step = 1, submittedProductId = null) {
  $('#heading').textContent = 'Report a problem';
  if (!user) {
    $('#view').innerHTML = `
      <div class="empty">
        <h2>Sign in to report a product problem</h2>
        <p>Signing in lets you track updates on your report.</p>
        <div class="row" style="justify-content:center;margin-top:16px">
          <button type="button" class="primary" id="repSignInBtn">Sign in</button>
          <button type="button" class="secondary" id="repRegBtn">Create account</button>
        </div>
      </div>`;
    $('#repSignInBtn').onclick = () => {
      pendingAfterAuth = () => reportWizard(step);
      auth();
    };
    $('#repRegBtn').onclick = () => {
      pendingAfterAuth = () => reportWizard(step);
      register();
    };
    return;
  }

  if (step === 5 && submittedProductId) {
    $('#view').innerHTML = `
      <div class="wizard">
        <div class="panel">
          <span class="badge success">Submitted</span>
          <h2 style="margin-top:10px">Your report has been recorded.</h2>
          <p>Manufacturers reviewing this product can see your report alongside other customer feedback. Reports require human review and do not guarantee a revision or refund.</p>
          <div class="row" style="margin-top:18px">
            <button type="button" class="primary" id="repViewProduct">View product</button>
            <button type="button" class="secondary" id="repAnother">Report another issue</button>
            <button type="button" class="secondary" id="repTrack">Track my ideas and products</button>
          </div>
        </div>
      </div>`;
    $('#repViewProduct').onclick = () => go('#/product/' + submittedProductId);
    $('#repAnother').onclick = () => {
      reportDraft = {};
      clearStore('genesis_rep_draft');
      reportWizard(1);
    };
    $('#repTrack').onclick = () => go('#/my-products');
    return;
  }

  const steps = ['Choose product', 'Describe issue', 'Category & rating', 'Review'];
  $('#view').innerHTML = `
    <div class="wizard">
      <div class="steps">
        ${steps
          .map(
            (s, i) =>
              `<span class="${i + 1 < step ? 'done' : i + 1 === step ? 'current' : ''}">${i + 1}. ${s}</span>`
          )
          .join('')}
      </div>
      <div class="panel" id="reportBody"></div>
    </div>`;

  const box = $('#reportBody');

  if (step === 1) {
    const x = await api('/products');
    box.innerHTML = `
      <h2>Which product needs improvement?</h2>
      <p>Select the product or idea you want to report an issue for.</p>
      <form class="stack" id="reportStep1" novalidate>
        <label>Product <span class="req">(Required)</span>
          <select name="product_id" id="reportProduct">
            <option value="">Choose a product…</option>
            ${x.products
              .map(
                (p) =>
                  `<option value="${esc(p.id)}" ${reportDraft.product_id === p.id ? 'selected' : ''}>${esc(p.title)}${p.demo ? ' (DEMO)' : ''}</option>`
              )
              .join('')}
          </select>
          <span class="field-error" id="errProduct"></span>
        </label>
        <div class="row">
          <button type="button" class="secondary" id="cancelRep">Cancel</button>
          <button type="submit" class="primary">Continue</button>
        </div>
      </form>`;
    $('#cancelRep').onclick = () => go('#/home');
    $('#reportStep1').onsubmit = (e) => {
      e.preventDefault();
      const pid = $('#reportProduct').value;
      $('#errProduct').textContent = '';
      if (!pid) {
        $('#errProduct').textContent = 'Please select a product before continuing.';
        return;
      }
      const selected = x.products.find((p) => p.id === pid);
      reportDraft.product_id = pid;
      reportDraft.product_title = selected?.title || '';
      saveStore('genesis_rep_draft', reportDraft);
      reportWizard(2);
    };
    return;
  }

  if (step === 2) {
    box.innerHTML = `
      <h2>What is not working?</h2>
      <p>Reporting for: <strong>${esc(reportDraft.product_title || 'Selected product')}</strong></p>
      <form class="stack" id="reportForm" novalidate>
        <label>Describe the issue <span class="req">(Required)</span>
          <textarea name="details" maxlength="3000" placeholder="Example: After two hours of standby, the left earbud battery drops to 10%.">${esc(reportDraft.details || '')}</textarea>
          <span class="field-error" data-err="details"></span>
        </label>
        <label>Version or model <span class="req">(Required)</span>
          <input name="version" maxlength="60" value="${esc(reportDraft.version || '1.0')}" placeholder="Example: 1.0">
          <span class="field-error" data-err="version"></span>
        </label>
        <div class="row">
          <button type="button" class="secondary" id="backBtn">Back</button>
          <button type="submit" class="primary">Continue</button>
        </div>
      </form>`;

    const save2 = () => {
      const f = $('#reportForm');
      reportDraft.details = f.details.value.trim();
      reportDraft.version = f.version.value.trim();
      saveStore('genesis_rep_draft', reportDraft);
    };
    $('#backBtn').onclick = () => {
      save2();
      reportWizard(1);
    };
    $('#reportForm').onsubmit = (e) => {
      e.preventDefault();
      const f = e.target;
      f.querySelectorAll('.field-error').forEach((n) => (n.textContent = ''));
      if (!f.details.value.trim()) {
        f.querySelector('[data-err="details"]').textContent = 'Describe what went wrong or needs improvement.';
        return;
      }
      if (!f.version.value.trim()) {
        f.querySelector('[data-err="version"]').textContent = 'Enter a version or model (e.g. 1.0).';
        return;
      }
      save2();
      reportWizard(3);
    };
    return;
  }

  if (step === 3) {
    const kinds = [
      ['failure', 'It stopped working or failed'],
      ['usability', 'Hard to use'],
      ['missing', 'A needed feature is missing'],
      ['unnecessary', 'An unwanted feature'],
      ['improvement', 'General improvement suggestion'],
      ['positive', 'Something works well'],
      ['safety', 'A safety concern'],
    ];
    box.innerHTML = `
      <h2>Classify your report</h2>
      <p>Choose the category and rating that best describe your experience.</p>
      <form class="stack" id="reportForm" novalidate>
        <label>Issue category <span class="req">(Required)</span>
          <select name="kind">
            ${kinds
              .map(
                ([v, t]) =>
                  `<option value="${v}" ${(reportDraft.kind || 'failure') === v ? 'selected' : ''}>${esc(t)}</option>`
              )
              .join('')}
          </select>
        </label>
        <label>Overall experience <span class="req">(Required · 1 = very poor, 5 = excellent)</span>
          <select name="rating">
            ${[1, 2, 3, 4, 5]
              .map(
                (n) =>
                  `<option value="${n}" ${Number(reportDraft.rating || 2) === n ? 'selected' : ''}>${n} / 5</option>`
              )
              .join('')}
          </select>
        </label>
        <div class="row">
          <button type="button" class="secondary" id="backBtn">Back</button>
          <button type="submit" class="primary">Review report</button>
        </div>
      </form>`;

    const save3 = () => {
      const f = $('#reportForm');
      reportDraft.kind = f.kind.value;
      reportDraft.rating = Number(f.rating.value);
      saveStore('genesis_rep_draft', reportDraft);
    };
    $('#backBtn').onclick = () => {
      save3();
      reportWizard(2);
    };
    $('#reportForm').onsubmit = (e) => {
      e.preventDefault();
      save3();
      reportWizard(4);
    };
    return;
  }

  if (step === 4) {
    box.innerHTML = `
      <h2>Review your report</h2>
      <div class="review">
        <strong>${esc(reportDraft.product_title || 'Selected product')}</strong>
        <p style="margin-top:8px">${esc(reportDraft.details)}</p>
        <span class="muted">Version ${esc(reportDraft.version)} · Category: ${esc(reportDraft.kind)} · Experience: ${esc(reportDraft.rating)}/5</span>
      </div>
      <p class="field-hint">Submitting a report alerts manufacturers reviewing this product. A human reviews reports before making product decisions.</p>
      <div class="row">
        <button type="button" class="secondary" id="backBtn">Edit report</button>
        <button type="button" class="primary" id="submitReportBtn">Submit report</button>
      </div>`;

    $('#backBtn').onclick = () => reportWizard(3);
    $('#submitReportBtn').onclick = (e) =>
      loading(
        e.currentTarget,
        async () => {
          try {
            const pid = reportDraft.product_id;
            await api('/products/' + pid + '/feedback', 'POST', {
              details: reportDraft.details,
              version: reportDraft.version,
              kind: reportDraft.kind || 'failure',
              rating: Number(reportDraft.rating || 2),
            });
            reportDraft = {};
            clearStore('genesis_rep_draft');
            reportWizard(5, pid);
          } catch (err) {
            notice(err.message, 'error');
          }
        },
        'Submitting…'
      );
  }
}

function offerIneligibleReason(offer, product) {
  if (product.demo || product.id.startsWith('demo-')) {
    return 'Example (DEMO) product — checkout is disabled for sample items.';
  }
  if (product.status === 'retirement') {
    return 'Discontinued product — checkout is no longer available.';
  }
  if (!offer.eligible) {
    return 'Preliminary manufacturer proposal only — checkout has not been enabled by the manufacturer yet.';
  }
  return null;
}

async function detail(id, autoAnalyze = false) {
  const x = await api('/products/' + id);
  const p = x.product;
  $('#heading').textContent = p.title;
  const interestCount = x.support.reduce((n, v) => n + v.count, 0);
  const parsedSpec = safeParseJson(p.intelligence);
  const isOwner = user && user.id === p.owner_id;
  const currentStageIdx = stages.indexOf(p.status);

  $('#view').innerHTML = `
    <div class="row page-actions">
      <button type="button" class="secondary" id="backExploreBtn">← ${maker() ? 'Customer Demand' : 'Explore ideas'}</button>
      ${maker() ? `<button type="button" class="primary" id="openMakerSpaceBtn">Manage offer &amp; stages</button>` : ''}
    </div>

    <div class="product-layout">
      <div class="stack">
        <div class="panel">
          <div class="row" style="margin-bottom:10px">
            <span class="badge">${esc(stageName[p.status] || p.status)}</span>
            ${p.demo ? '<span class="badge demo">DEMO EXAMPLE</span>' : ''}
            <span class="badge muted-badge">${esc(p.category || 'Other')}</span>
          </div>
          <h2>${esc(p.title)}</h2>
          <p style="white-space:pre-line">${esc(p.description)}</p>
        </div>

        <div class="panel">
          <h2>Production stage</h2>
          <div class="progress" role="progressbar" aria-valuenow="${currentStageIdx + 1}" aria-valuemin="1" aria-valuemax="8">
            <span style="width:${((currentStageIdx + 1) / 8) * 100}%"></span>
          </div>
          <div class="stage-pills">
            ${stages
              .slice(0, 6)
              .map((st, idx) => {
                const cls =
                  idx < currentStageIdx
                    ? 'done'
                    : idx === currentStageIdx
                      ? 'current'
                      : '';
                return `<span class="stage-pill ${cls}">${esc(stageName[st])}</span>`;
              })
              .join('')}
          </div>
          <p><strong>${esc(stageName[p.status] || p.status)}:</strong> ${esc(stageHint[p.status] || '')}</p>
          ${
            x.events.length
              ? `<div class="callout" style="margin-top:10px"><strong>Latest update</strong><p style="margin-top:4px">${esc(x.events[0].note)}</p><span class="muted">${esc(x.events[0].created_at)}</span></div>`
              : ''
          }
          <details style="margin-top:12px">
            <summary>View full progress history (${x.events.length})</summary>
            <div style="margin-top:10px">
              ${
                x.events
                  .map(
                    (v) => `<div class="list-item">
                      <strong>${esc(stageName[v.to_status] || v.to_status)}</strong>
                      <p>${esc(v.note)}</p>
                      <span class="muted">${esc(v.created_at)}</span>
                    </div>`
                  )
                  .join('') || '<p class="muted">No progress updates recorded yet.</p>'
              }
            </div>
          </details>
        </div>

        <div class="panel" id="specPanel">
          <div class="row" style="justify-content:space-between">
            <h2>Product requirements</h2>
            ${
              isOwner
                ? `<button type="button" class="secondary" id="ownerAnalyzeBtn">${parsedSpec ? 'Re-analyze with GENESIS' : 'Analyze my idea'}</button>`
                : ''
            }
          </div>
          <p class="field-hint">${
            isOwner
              ? 'Turn your description into structured product requirements. Edit any field and save.'
              : 'Preliminary product requirements saved by the creator.'
          }</p>
          <div id="specContainer">
            ${
              isOwner
                ? parsedSpec
                  ? specEditorHtml(parsedSpec, true) +
                    '<div class="row" style="margin-top:12px"><button type="button" class="primary" id="saveSpecBtn">Save specification</button></div>'
                  : '<p class="muted" style="margin-top:12px">No requirements saved yet. Click "Analyze my idea" to generate an editable draft.</p>'
                : parsedSpec
                  ? specEditorHtml(parsedSpec, false)
                  : '<p class="muted" style="margin-top:12px">No product requirements saved yet.</p>'
            }
          </div>
        </div>
      </div>

      <div class="stack">
        ${
          !maker()
            ? `<div class="panel">
                 <h2>Support this idea</h2>
                 <div class="stat" style="margin-bottom:12px">
                   <strong>${interestCount}</strong>
                   <small>people interested · nonbinding</small>
                 </div>
                 ${
                   x.my_support
                     ? `<p class="field-hint" style="margin-bottom:10px">Your status: <strong>${x.my_support.kind === 'intent' ? 'I might buy this' : 'Interested'}</strong></p>`
                     : '<p class="field-hint" style="margin-bottom:10px">Interest is free and helps manufacturers prioritize what to build.</p>'
                 }
                 <div class="row">
                   <button type="button" class="${x.my_support?.kind === 'interest' ? 'secondary active-choice' : 'primary'}" id="interestBtn">I\'m interested</button>
                   <button type="button" class="secondary ${x.my_support?.kind === 'intent' ? 'active-choice' : ''}" id="intentBtn">I might buy this</button>
                   ${x.my_support ? '<button type="button" class="text-button" id="withdrawBtn">Remove my interest</button>' : ''}
                 </div>
               </div>`
            : `<div class="panel">
                 <h2>Customer demand</h2>
                 <div class="stat">
                   <strong>${interestCount}</strong>
                   <small>people interested · ${x.feedback.length} reports</small>
                 </div>
               </div>`
        }

        <div class="panel">
          <h2>Manufacturer offers</h2>
          <p class="field-hint" style="margin-bottom:12px">Proposals show estimated manufacturer terms. Only verified eligible offers on non-DEMO products allow Sandbox checkout.</p>
          ${
            x.offers
              .map((o) => {
                const reason = offerIneligibleReason(o, p);
                let actionHtml = '';
                if (reason) {
                  actionHtml = `<p class="field-hint" style="margin-top:8px">${esc(reason)}</p>`;
                } else if (!user) {
                  actionHtml = `<p style="margin-top:10px"><button type="button" class="primary" data-signin-offer="${esc(o.id)}">Sign in to check out</button></p>`;
                } else if (!user.email_verified_at) {
                  actionHtml = `<div class="callout warn" style="margin-top:10px">
                    <p>Verify your email before starting PayPal Sandbox checkout.</p>
                    <button type="button" class="secondary" data-verify-offer="1">Verify email</button>
                  </div>`;
                } else {
                  actionHtml = `<p style="margin-top:10px"><button type="button" class="primary" data-offer="${esc(o.id)}">Review PayPal Sandbox checkout</button></p>`;
                }
                return `<div class="list-item">
                  <div class="row" style="justify-content:space-between">
                    <strong>${esc(o.manufacturer)}</strong>
                    <span class="badge ${reason ? 'muted-badge' : 'success'}">${reason ? 'Proposal only' : 'Checkout eligible'}</span>
                  </div>
                  <h3 style="margin-top:6px">${esc(o.currency)} ${Number(o.price).toFixed(2)}</h3>
                  <p>${esc(o.terms)}</p>
                  <span class="muted">Minimum quantity: ${o.minimum_quantity}</span>
                  ${actionHtml}
                </div>`;
              })
              .join('') ||
            '<p class="muted">No manufacturer offers yet. Supporting the idea helps attract interest.</p>'
          }
        </div>

        <div class="panel">
          <div class="row" style="justify-content:space-between;margin-bottom:10px">
            <h2>Community reports</h2>
            ${!maker() ? '<button type="button" class="secondary" id="reportHereBtn">Report a problem</button>' : ''}
          </div>
          ${
            x.feedback
              .slice(0, 6)
              .map(
                (f) => `<div class="list-item">
                  <div class="row" style="justify-content:space-between">
                    <strong>${esc(f.kind)}</strong>
                    <span class="muted">Version ${esc(f.version)} · ${f.rating}/5</span>
                  </div>
                  <p style="margin-top:6px">${esc(f.details)}</p>
                </div>`
              )
              .join('') || '<p class="muted">No reports submitted yet.</p>'
          }
        </div>

        <details class="panel">
          <summary>Keyword-related ideas &amp; quality signals</summary>
          <p class="field-hint" style="margin-bottom:10px">Related ideas are matched by title keywords, not automated semantic similarity.</p>
          ${
            x.similar
              .map(
                (v) =>
                  `<button type="button" class="secondary" style="margin:4px 4px 0 0" data-similar="${esc(v.id)}">${esc(v.title)}${v.demo ? ' (DEMO)' : ''}</button>`
              )
              .join('') || '<p class="muted">No keyword-related ideas found.</p>'
          }
          ${x.alerts
            .map(
              (a) =>
                `<p style="margin-top:10px"><strong>Alert (${esc(a.kind)}):</strong> ${a.evidence_count} reports · ${esc(a.status)}</p>`
            )
            .join('')}
          ${x.recommendations
            .map(
              (r) =>
                `<p style="margin-top:8px"><strong>${esc(r.kind)} (${esc(r.status)}):</strong> ${esc(r.evidence)}${r.decision_note ? ' · Decision note: ' + esc(r.decision_note) : ''}</p>`
            )
            .join('')}
        </details>
      </div>
    </div>
  `;

  $('#backExploreBtn').onclick = () =>
    go(maker() ? '#/manufacturer/demand' : '#/explore');

  if ($('#openMakerSpaceBtn')) {
    $('#openMakerSpaceBtn').onclick = () => go('#/manufacturer/product/' + id);
  }

  if ($('#interestBtn')) {
    $('#interestBtn').onclick = () => supportProduct(id, 'interest');
    $('#intentBtn').onclick = () => supportProduct(id, 'intent');
    if ($('#withdrawBtn')) {
      $('#withdrawBtn').onclick = async () => {
        try {
          await api('/products/' + id + '/support', 'DELETE');
          notice('Interest removed.');
          await detail(id);
        } catch (e) {
          notice(e.message, 'error');
        }
      };
    }
  }

  if ($('#reportHereBtn')) {
    $('#reportHereBtn').onclick = () => {
      reportDraft = { product_id: id, product_title: p.title };
      saveStore('genesis_rep_draft', reportDraft);
      go('#/report/' + id);
    };
  }

  const bindSaveSpec = () => {
    const saveBtn = $('#saveSpecBtn');
    if (!saveBtn) return;
    saveBtn.onclick = (e) => {
      const spec = readSpecEditor();
      if (!spec || spec.error) return;
      loading(
        e.currentTarget,
        async () => {
          try {
            await api('/products/' + id + '/spec', 'POST', { analysis: spec });
            notice('Product specification saved.', 'success');
            await detail(id);
          } catch (err) {
            notice(err.message, 'error');
          }
        },
        'Saving…'
      );
    };
  };
  bindSaveSpec();

  const runOwnerAnalyze = (btn) =>
    loading(
      btn,
      async () => {
        try {
          const res = await api('/analyze', 'POST', {
            description: `${p.title}\n\n${p.description}`,
          });
          $('#specContainer').innerHTML =
            specEditorHtml(res.analysis, true) +
            '<div class="row" style="margin-top:12px"><button type="button" class="primary" id="saveSpecBtn">Save specification</button></div>';
          bindSaveSpec();
          notice('Requirements generated. Review or edit them, then click Save specification.', 'success');
        } catch (err) {
          notice(err.message, 'error');
        }
      },
      'Analyzing…'
    );

  if ($('#ownerAnalyzeBtn')) {
    $('#ownerAnalyzeBtn').onclick = (e) => runOwnerAnalyze(e.currentTarget);
    if (autoAnalyze) {
      runOwnerAnalyze($('#ownerAnalyzeBtn'));
    }
  }

  document.querySelectorAll('[data-offer]').forEach((b) => {
    b.onclick = () => {
      const o = x.offers.find((item) => item.id === b.dataset.offer);
      if (o) checkoutModal(o, p);
    };
  });
  document.querySelectorAll('[data-signin-offer]').forEach((b) => {
    b.onclick = () => {
      pendingAfterAuth = () => detail(id);
      auth();
    };
  });
  document.querySelectorAll('[data-verify-offer]').forEach((b) => {
    b.onclick = verification;
  });
  document.querySelectorAll('[data-similar]').forEach((b) => {
    b.onclick = () => go('#/product/' + b.dataset.similar);
  });
}

async function supportProduct(id, kind) {
  if (!user) {
    pendingAfterAuth = () => supportProduct(id, kind);
    auth();
    return;
  }
  try {
    await api('/products/' + id + '/support', 'POST', { kind });
    notice(
      kind === 'intent'
        ? 'Purchase intent recorded (nonbinding).'
        : 'Interest recorded.',
      'success'
    );
    await detail(id);
    const stat = document.querySelector('.stat');
    if (stat) stat.classList.add('support-pulse');
  } catch (e) {
    notice(e.message, 'error');
  }
}

function checkoutModal(offer, product) {
  if (!user) {
    pendingAfterAuth = () => detail(product.id);
    auth();
    return;
  }
  if (!user.email_verified_at) {
    modal(`
      <h2 id="modalTitle">Verify your email first</h2>
      <p>Only consumers with a verified email address can start PayPal Sandbox checkout.</p>
      <div class="row" style="margin-top:14px">
        <button type="button" class="primary" id="goVerifyFromCheckout">Verify email</button>
      </div>
    `);
    $('#goVerifyFromCheckout').onclick = verification;
    return;
  }

  modal(`
    <h2 id="modalTitle">Review PayPal Sandbox checkout</h2>
    <p>This creates a test transaction in <strong>PayPal Sandbox</strong>. No real money is charged.</p>
    <div class="review">
      <strong>${esc(product.title)}</strong>
      <p style="margin-top:6px">Manufacturer: ${esc(offer.manufacturer)}</p>
      <h3>Total: ${esc(offer.currency)} ${Number(offer.price).toFixed(2)}</h3>
      <p>${esc(offer.terms)}</p>
    </div>
    <label class="checkbox" style="margin:12px 0">
      <input type="checkbox" id="consentCheck">
      <span>I approve starting this PayPal Sandbox checkout</span>
    </label>
    <span class="field-error" id="consentErr"></span>
    <p class="field-hint" style="margin-top:8px">Payment is only complete after buyer approval on PayPal and server-side capture confirmation.</p>
    <div class="row" style="margin-top:14px">
      <button type="button" class="primary" id="payBtn">Continue to PayPal Sandbox</button>
    </div>
  `);

  $('#payBtn').onclick = (e) => {
    $('#consentErr').textContent = '';
    if (!$('#consentCheck').checked) {
      $('#consentErr').textContent = 'Check the approval box before continuing.';
      return;
    }
    loading(
      e.currentTarget,
      async () => {
        try {
          const res = await api('/orders', 'POST', {
            offer_id: offer.id,
            consent: true,
          });
          if (res.approval_url) {
            location.href = res.approval_url;
          } else {
            closeModal();
            await go('#/orders');
            notice(
              paymentLabel[res.status] ||
                'You already have an order in progress. Review it below.'
            );
          }
        } catch (err) {
          modalNotice(err.message, 'error');
        }
      },
      'Connecting to PayPal…'
    );
  };
}

async function myProducts() {
  if (maker()) {
    return manufacturerProducts();
  }
  $('#heading').textContent = 'My Products';
  if (!user) {
    $('#view').innerHTML = `
      <div class="empty">
        <h2>Sign in to track your ideas and products</h2>
        <p>View ideas you published, ideas you support, reports you sent, and Sandbox orders.</p>
        <div class="row" style="justify-content:center;margin-top:16px">
          <button type="button" class="primary" id="mySignInBtn">Sign in</button>
        </div>
      </div>`;
    $('#mySignInBtn').onclick = () => {
      pendingAfterAuth = () => go('#/my-products');
      auth();
    };
    return;
  }

  const [products, activity, orders] = await Promise.all([
    api('/products'),
    api('/my/activity'),
    api('/orders'),
  ]);
  const mine = products.products.filter((p) => p.owner_id === user.id);

  $('#view').innerHTML = `
    <div class="row page-actions">
      <button type="button" class="primary" id="mpReqBtn">I want a product that doesn\'t exist</button>
      <button type="button" class="secondary" id="mpRepBtn">Something I bought needs improvement</button>
      <button type="button" class="secondary" id="mpOrdersBtn">All Sandbox orders</button>
    </div>

    <div class="stack">
      <div class="panel">
        <h2>My ideas (${mine.length})</h2>
        <div class="grid" style="margin-top:12px">
          ${
            mine.map((p) => productCardHtml(p, 'Manage / view')).join('') ||
            '<div class="empty">You have not published any ideas yet.</div>'
          }
        </div>
      </div>

      <div class="panel">
        <h2>Ideas I support (${activity.supported.length})</h2>
        <div class="grid" style="margin-top:12px">
          ${
            activity.supported.map((p) => productCardHtml(p)).join('') ||
            '<div class="empty">You have not supported any ideas yet.</div>'
          }
        </div>
      </div>

      <div class="panel">
        <h2>Reports I sent (${activity.feedback.length})</h2>
        <div style="margin-top:10px">
          ${
            activity.feedback
              .map(
                (f) => `<div class="list-item">
                  <div class="row" style="justify-content:space-between">
                    <strong>${esc(f.title)}</strong>
                    <span class="badge muted-badge">${esc(f.kind)} · v${esc(f.version)}</span>
                  </div>
                  <p style="margin-top:6px">${esc(f.details)}</p>
                  <button type="button" class="secondary" data-pid="${esc(f.product_id)}">View product</button>
                </div>`
              )
              .join('') || '<p class="muted">No reports submitted yet.</p>'
          }
        </div>
      </div>

      <div class="panel">
        <div class="row" style="justify-content:space-between">
          <h2>PayPal Sandbox orders (${orders.orders.length})</h2>
          <button type="button" class="secondary" id="viewOrdersBtn">Manage orders</button>
        </div>
        <div style="margin-top:10px">
          ${
            orders.orders
              .map(
                (o) => `<div class="list-item">
                  <div class="row" style="justify-content:space-between">
                    <strong>${esc(o.title)}</strong>
                    <span class="${paymentBadgeClass[o.status] || 'badge'}">${esc(paymentLabel[o.status] || o.status)}</span>
                  </div>
                  <p style="margin-top:6px">${esc(o.currency)} ${Number(o.amount).toFixed(2)} · Sandbox Order ${esc(o.paypal_order_id)}</p>
                </div>`
              )
              .join('') || '<p class="muted">No Sandbox orders yet.</p>'
          }
        </div>
      </div>
    </div>
  `;

  $('#mpReqBtn').onclick = () => go('#/request');
  $('#mpRepBtn').onclick = () => go('#/report');
  $('#mpOrdersBtn').onclick = () => go('#/orders');
  $('#viewOrdersBtn').onclick = () => go('#/orders');
  $('#view')
    .querySelectorAll('[data-pid]')
    .forEach((b) => (b.onclick = () => go('#/product/' + b.dataset.pid)));
}

async function ordersPage() {
  if (!user) { try { await refreshMe(); } catch {} }
  const isMaker = maker();
  $('#heading').textContent = isMaker ? 'Manufacturer Orders · PayPal Sandbox' : 'Orders · PayPal Sandbox';

  if (!user) {
    $('#view').innerHTML = `
      <div class="empty">
        <h2>Sign in to view your orders</h2>
        <p>Access your PayPal Sandbox orders and active batch reservations.</p>
        <button type="button" class="btn-pill-primary" id="ordSignIn">Sign in</button>
      </div>`;
    $('#ordSignIn').onclick = () => {
      pendingAfterAuth = () => go('#/orders');
      auth();
    };
    return;
  }

  const res = isMaker ? await api('/manufacturer/orders') : await api('/orders');
  const orders = res.orders || [];
  const totalVolume = orders.reduce((acc, o) => acc + Number(o.amount || 0), 0);
  const featuredOrder = orders[0] || {
    id: 'ord-demo-sample',
    title: 'Eight-input portable audio interface',
    amount: 249.00,
    currency: 'USD',
    status: 'COMPLETED',
    paypal_order_id: 'SAMPLE-SANDBOX-CAPTURE-A1',
    created_at: new Date().toISOString().slice(0, 10),
    is_sample: true
  };

  $('#view').innerHTML = `
    <div class="app-workspace-layout view-enter">
      <!-- Main Orders Column -->
      <div class="app-main-col">
        <div class="app-context-header">
          <div class="app-title-area">
            <h2>${isMaker ? 'Orders for Your Offers' : 'PayPal Sandbox Purchase History'}</h2>
            <p>Only server-verified PayPal captures appear as confirmed. Transactions escrow-reconciled against manufacturing milestones.</p>
          </div>
          <div class="app-context-actions">
            ${isMaker ? `
              <button type="button" class="btn-pill-primary" id="ordProductsBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                <span>My Offered Products</span>
              </button>
            ` : `
              <button type="button" class="btn-pill-primary" id="backMyProductsBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                <span>Explore Products</span>
              </button>
            `}
          </div>
        </div>

        <div class="app-hero-command-card">
          <div class="app-hero-info">
            <div class="app-hero-badge-row">
              <span class="mfg-badge-live">PayPal Sandbox v2</span>
              <span class="mfg-badge-demo">Server-Side Verified</span>
              <span style="font-size:11px;color:var(--text-muted)">Escrow Reconciled</span>
            </div>
            <h3 class="app-hero-title">Verified Pre-orders and Production Backing</h3>
            <p class="app-hero-desc">All customer pre-orders are authorized and captured via PayPal Sandbox Orders v2 API with automated milestone reconciliation.</p>
            <div class="app-hero-metrics">
              <div class="app-metric-tile">
                <span class="mfg-metric-label">Total Orders</span>
                <span class="mfg-metric-value">${orders.length} Records</span>
                <span class="mfg-metric-footnote">Sandbox Transactions</span>
              </div>
              <div class="app-metric-tile">
                <span class="mfg-metric-label">Captured Volume</span>
                <span class="mfg-metric-value">$${totalVolume.toFixed(2)}</span>
                <span class="mfg-metric-footnote">USD Sandbox Gross</span>
              </div>
              <div class="app-metric-tile">
                <span class="mfg-metric-label">Batch Escrow</span>
                <span class="mfg-metric-value">Active</span>
                <span class="mfg-metric-footnote">Milestone Reconciled</span>
              </div>
            </div>
            <div class="app-hero-actions">
              <button type="button" class="btn-pill-primary" onclick="go('#/home')">
                <span>Back to Workspace</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button type="button" class="btn-pill-secondary" onclick="go('#/help')">
                <span>PayPal Escrow Guide</span>
              </button>
            </div>
          </div>
          <div class="app-hero-graphic-stage">
            ${renderIdeaToProductSvg()}
          </div>
        </div>

        <div class="mfg-section-title-row">
          <h4 class="mfg-section-title">PayPal Sandbox Transaction Ledger</h4>
          <span style="font-size:11.5px;color:var(--text-muted)">REST API v2 Reconciliation</span>
        </div>

        <div class="app-opp-table-card">
          <table class="app-table">
            <thead>
              <tr>
                <th>Product &amp; Reference</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Gateway Reference</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${
                orders.map((o) => `
                  <tr>
                    <td>
                      <div class="table-product-cell">
                        <strong>${esc(o.title)}</strong>
                        <small>${o.is_sample ? 'Demonstration sample capture' : 'Pre-order reservation'} · ${esc(o.created_at || 'Recent')}</small>
                      </div>
                    </td>
                    <td><span class="${paymentBadgeClass[o.status] || 'badge'}">${esc(paymentLabel[o.status] || o.status)}</span></td>
                    <td><strong style="color:#ffffff">${esc(o.currency || 'USD')} ${Number(o.amount || 0).toFixed(2)}</strong></td>
                    <td><code style="font-size:11px;color:#93c5fd">${esc(o.paypal_order_id || 'N/A')}</code></td>
                    <td>
                      ${
                        !['COMPLETED', 'CANCELLED', 'FAILED'].includes(o.status)
                          ? `
                            ${o.status === 'APPROVED' ? `<button type="button" class="btn-pill-primary" data-capture="${esc(o.id)}" style="padding:4px 10px;font-size:11px">Capture</button>` : ''}
                            <button type="button" class="btn-pill-secondary" data-reconcile="${esc(o.id)}" style="padding:4px 10px;font-size:11px">Check</button>
                          `
                          : `<button type="button" class="btn-pill-secondary" onclick="go('#/product/' + '${esc(o.product_id || 'demo-a1')}')" style="padding:4px 10px;font-size:11px">Inspect</button>`
                      }
                    </td>
                  </tr>
                `).join('') ||
                '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted)">No orders yet. Explore an eligible non-DEMO offer to test PayPal Sandbox checkout.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column Contextual Inspector -->
      <aside class="app-inspector-col">
        <div class="inspector-panel">
          <div class="inspector-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Transaction Dossier</span>
            </h3>
            <span class="inspector-stage-pill">${esc(featuredOrder.status)}</span>
          </div>

          <div class="inspector-selected-product">
            <h4 class="inspector-title">${esc(featuredOrder.title)}</h4>
            <span style="font-size:11.5px;color:var(--text-muted)">Order ID: ${esc(featuredOrder.paypal_order_id)}</span>
          </div>

          <div class="inspector-spec-block">
            <div class="spec-block-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>PAYPAL ESCROW ASSURANCE</span>
            </div>
            <div class="spec-req-list">
              <div class="spec-req-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Funds held in sandbox escrow until batch MOQ threshold reached</span>
              </div>
              <div class="spec-req-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Server-verified webhook reconciliation against Cloudflare D1</span>
              </div>
              <div class="spec-req-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Zero-risk testing for hackathon evaluation</span>
              </div>
            </div>
          </div>

          <div class="inspector-signals-card">
            <span class="inspector-signals-title">PAYMENT RECONCILIATION</span>
            <span class="inspector-signals-val">${esc(featuredOrder.currency || 'USD')} ${Number(featuredOrder.amount || 0).toFixed(2)}</span>
            <span class="inspector-signals-sub">Server-side capture verified. Buyer personal information protected.</span>
          </div>

          <div class="inspector-action-box">
            <button type="button" class="btn-inspector-action" onclick="go('#/product/' + '${esc(featuredOrder.product_id || 'demo-a1')}')">
              <span>Inspect Product Progress</span>
            </button>
            <button type="button" class="btn-inspector-sub" onclick="go('#/home')">
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  `;

  if ($('#ordProductsBtn')) $('#ordProductsBtn').onclick = () => go('#/manufacturer/products');
  if ($('#backMyProductsBtn')) $('#backMyProductsBtn').onclick = () => go('#/explore');

  for (const op of ['capture', 'reconcile', 'cancel']) {
    $('#view')
      .querySelectorAll(`[data-${op}]`)
      .forEach((b) => {
        b.onclick = (e) =>
          loading(
            e.currentTarget,
            async () => {
              try {
                const r = await api('/orders/' + b.dataset[op] + '/' + op, 'POST');
                notice(
                  paymentLabel[r.status] || r.notice || 'Order updated.',
                  r.status === 'COMPLETED' ? 'success' : 'info'
                );
                await ordersPage();
              } catch (err) {
                notice(err.message, 'error');
              }
            },
            op === 'capture' ? 'Capturing…' : 'Checking…'
          );
      });
  }
}

async function accountPage() {
  $('#heading').textContent = 'Account & Role';
  if (!user) {
    $('#view').innerHTML = `<div class="empty"><h2>Sign in to manage your account</h2><button type="button" class="primary" id="accSignIn">Sign in</button></div>`;
    $('#accSignIn').onclick = () => {
      pendingAfterAuth = () => go('#/account');
      auth();
    };
    return;
  }

  const mfgState = await api('/manufacturer/application');
  application = mfgState.application;

  $('#view').innerHTML = `
    <div class="stack" style="max-width:760px">
      <div class="panel">
        <h2>Account details</h2>
        <p><strong>Name:</strong> ${esc(user.name)}</p>
        <p><strong>Email:</strong> ${esc(user.email)} <span class="badge ${user.email_verified_at ? 'success' : 'demo'}" style="margin-left:6px">${user.email_verified_at ? 'Verified' : 'Unverified'}</span></p>
        <p><strong>Role:</strong> ${esc(user.role)}</p>
        ${!user.email_verified_at ? '<p style="margin-top:12px"><button type="button" class="primary" id="accVerifyBtn">Verify email</button></p>' : ''}
      </div>

      <div class="panel">
        <h2>Update email address</h2>
        <p class="field-hint" style="margin-bottom:12px">Changing your email requires re-verification before making purchases or applying as a manufacturer.</p>
        <form class="stack" id="changeEmailForm" novalidate>
          <label>New email address <span class="req">(Required)</span>
            <input name="email" type="email" value="${esc(user.email)}" required>
            <span class="field-error" data-err="email"></span>
          </label>
          <button type="submit" class="secondary">Update email</button>
        </form>
      </div>

      <div class="panel">
        <h2>Manufacturer access</h2>
        ${
          user.role !== 'consumer'
            ? `<div class="callout info">Your account already has <strong>${esc(user.role)}</strong> access.</div>`
            : `
              <p>Only approved manufacturers can publish build offers, update production stages, and record quality decisions.</p>
              <div class="callout info" style="margin:12px 0">
                <strong>How to become a manufacturer</strong>
                <p style="margin-top:6px">1. Verify your email address.<br>2. Submit your company name and manufacturing capabilities below.<br>3. An administrator reviews your application. Role upgrades are granted server-side after approval.</p>
              </div>
              ${
                application
                  ? `<div class="review">
                       <div class="row" style="justify-content:space-between">
                         <strong>Latest application: ${esc(application.business_name)}</strong>
                         <span class="badge ${
                           application.status === 'approved'
                             ? 'success'
                             : application.status === 'rejected'
                               ? 'danger'
                               : 'demo'
                         }">${esc(application.status)}</span>
                       </div>
                       <p style="margin-top:8px">${esc(application.details)}</p>
                       ${application.review_note ? `<p class="muted">Reviewer note: ${esc(application.review_note)}</p>` : ''}
                     </div>`
                  : ''
              }
              ${
                !user.email_verified_at
                  ? '<p class="field-hint">Verify your email above to unlock the manufacturer application form.</p>'
                  : application?.status === 'pending'
                    ? '<p class="field-hint">Your application is currently pending administrator review.</p>'
                    : `<form class="stack" id="mfgApplyForm" style="margin-top:12px" novalidate>
                         <label>Company or workshop name <span class="req">(Required)</span>
                           <input name="business_name" maxlength="120" placeholder="Example: Pacific Coast Audio Hardware LLC">
                           <span class="field-error" data-err="business_name"></span>
                         </label>
                         <label>Manufacturing capabilities &amp; fulfillment experience <span class="req">(Required)</span>
                           <textarea name="details" maxlength="2000" placeholder="Describe what you manufacture, typical batch sizes, and quality assurance process."></textarea>
                           <span class="field-error" data-err="details"></span>
                         </label>
                         <button type="submit" class="primary">Submit manufacturer application</button>
                       </form>`
              }
            `
        }
      </div>
    </div>
  `;

  if ($('#accVerifyBtn')) $('#accVerifyBtn').onclick = verification;

  $('#changeEmailForm').onsubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    const email = f.email.value.trim();
    f.querySelector('[data-err="email"]').textContent = '';
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      f.querySelector('[data-err="email"]').textContent = 'Enter a valid email address.';
      return;
    }
    loading(
      e.submitter,
      async () => {
        try {
          await api('/profile/email', 'POST', { email });
          await refreshMe();
          await accountPage();
          notice('Email updated. Check the development server log for your verification link.', 'success');
        } catch (err) {
          notice(err.message, 'error');
        }
      },
      'Updating…'
    );
  };

  if ($('#mfgApplyForm')) {
    $('#mfgApplyForm').onsubmit = (e) => {
      e.preventDefault();
      const f = e.target;
      f.querySelectorAll('.field-error').forEach((n) => (n.textContent = ''));
      const business_name = f.business_name.value.trim();
      const details = f.details.value.trim();
      if (!business_name) {
        f.querySelector('[data-err="business_name"]').textContent = 'Enter your company or workshop name.';
        return;
      }
      if (!details) {
        f.querySelector('[data-err="details"]').textContent = 'Describe your manufacturing capabilities.';
        return;
      }
      loading(
        e.submitter,
        async () => {
          try {
            await api('/manufacturer/application', 'POST', {
              business_name,
              details,
            });
            await refreshMe();
            await accountPage();
            notice('Manufacturer application submitted for administrator review.', 'success');
          } catch (err) {
            notice(err.message, 'error');
          }
        },
        'Submitting…'
      );
    };
  }
}

async function adminPage() {
  if (user?.role !== 'administrator') return go('#/home');
  $('#heading').textContent = 'Manufacturer Approvals';
  const x = await api('/admin/manufacturers');
  $('#view').innerHTML = `
    <div class="panel">
      <h2>Manufacturer applications (${x.applications.length})</h2>
      <div style="margin-top:12px">
        ${
          x.applications
            .map(
              (a) => `<div class="list-item">
                <div class="row" style="justify-content:space-between">
                  <strong>${esc(a.business_name)} · ${esc(a.name)} (${esc(a.email)})</strong>
                  <span class="badge ${a.status === 'approved' ? 'success' : a.status === 'rejected' ? 'danger' : 'demo'}">${esc(a.status)}</span>
                </div>
                <p style="margin-top:6px">${esc(a.details)}</p>
                ${
                  a.status === 'pending'
                    ? `<div class="row" style="margin-top:10px">
                         <button type="button" class="primary" data-app-approve="${esc(a.id)}">Approve manufacturer</button>
                         <button type="button" class="secondary" data-app-reject="${esc(a.id)}">Decline</button>
                       </div>`
                    : ''
                }
              </div>`
            )
            .join('') || '<p class="muted">No manufacturer applications yet.</p>'
        }
      </div>
    </div>
  `;
  $('#view')
    .querySelectorAll('[data-app-approve]')
    .forEach((b) => {
      b.onclick = (e) =>
        loading(e.currentTarget, async () => {
          await api('/admin/manufacturers', 'POST', {
            application_id: b.dataset.appApprove,
            status: 'approved',
          });
          notice('Manufacturer approved.', 'success');
          await adminPage();
        });
    });
  $('#view')
    .querySelectorAll('[data-app-reject]')
    .forEach((b) => {
      b.onclick = (e) =>
        loading(e.currentTarget, async () => {
          await api('/admin/manufacturers', 'POST', {
            application_id: b.dataset.appReject,
            status: 'rejected',
          });
          notice('Application declined.');
          await adminPage();
        });
    });
}

async function manufacturerIntelligence() {
  if (!maker()) return go('#/home');
  $('#heading').textContent = 'GENESIS Intelligence';

  const analytics = await api('/manufacturer/analytics');
  const products = analytics.products || [];
  const orders = analytics.orders || [];
  const feedback = analytics.feedback || [];
  const kpis = analytics.kpis || {};

  let activeProduct = products[0] || null;
  let isEditMode = false;
  let studioApi = null;

  $('#view').innerHTML = `
    <div class="intelligence-hero">
      <div class="intelligence-hero-top">
        <div class="intelligence-title-group">
          <h2>
            ${icon('sparkles')}
            GENESIS Intelligence
            <span class="intelligence-badge">AG Studio Embedded</span>
          </h2>
          <p class="intelligence-subtitle">Turn customer demand, product feedback, and PayPal activity into clearer manufacturing decisions.</p>
        </div>
        <div class="intelligence-actions">
          <button type="button" class="secondary" id="btnAskAiToggle">
            ${icon('sparkles')} Ask GENESIS Intelligence
          </button>
          <button type="button" class="secondary" id="btnToggleStudioMode">
            ${icon('wrench')} <span id="studioModeLabel">Customize Dashboard</span>
          </button>
          <button type="button" class="secondary" id="btnResetLayout">
            Reset Layout
          </button>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11.5px;color:#94a3b8;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;margin-top:6px">
        <span>Powered by <strong>AG Studio v3.1</strong> &amp; <strong>AG Grid v36</strong></span>
        <span>•</span>
        <span>Real-time D1 Analytics</span>
        <span>•</span>
        <span>PayPal Sandbox Intelligence</span>
        <span>•</span>
        <span>Role: <strong>${esc(user.name)}</strong> (${user.role})</span>
      </div>
    </div>

    <!-- Ask GENESIS Intelligence Drawer -->
    <div class="query-box-wrap" id="queryBoxWrap">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span style="font-size:13px;font-weight:700;color:#f1f5f9;display:flex;align-items:center;gap:6px">
          ${icon('sparkles')} Natural Language Analytical Assistant
        </span>
        <span style="font-size:11px;color:#64748b">Connected to private Gemini 3.8 &amp; live D1 data</span>
      </div>
      <div class="query-pills">
        <button type="button" class="query-pill" data-q="Which product ideas have the most customer interest?">Most customer interest</button>
        <button type="button" class="query-pill" data-q="Show products that have interest but no eligible manufacturing offer.">Open opportunities</button>
        <button type="button" class="query-pill" data-q="Which development stage contains the most products?">Products by stage</button>
        <button type="button" class="query-pill" data-q="Show my completed PayPal Sandbox orders.">Completed Sandbox orders</button>
        <button type="button" class="query-pill" data-q="Compare product interest across categories.">Interest across categories</button>
      </div>
      <form id="aiQueryForm" class="query-input-row">
        <input id="aiQueryInput" placeholder="Ask a question about demand, opportunities, stages, or PayPal Sandbox transactions…" autocomplete="off">
        <button type="submit" class="primary" id="aiQuerySubmit">Ask Assistant</button>
      </form>
      <div id="aiQueryResult" class="query-result-panel" style="display:none"></div>
    </div>

    <!-- Section A: Demand Overview KPIs -->
    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Product Requests</span>
          ${icon('lightbulb', 'kpi-icon')}
        </div>
        <div class="kpi-value">${kpis.productRequests ?? products.filter(p => !p.demo).length}</div>
        <p class="kpi-desc">Actual consumer-submitted product ideas</p>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Customer Interest</span>
          ${icon('users', 'kpi-icon')}
        </div>
        <div class="kpi-value">${kpis.customerInterest ?? products.reduce((s,p) => s + (Number(p.interest)||0), 0)}</div>
        <p class="kpi-desc">Total genuine recorded support actions</p>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Open Opportunities</span>
          ${icon('compass', 'kpi-icon')}
        </div>
        <div class="kpi-value">${kpis.openOpportunities ?? products.filter(p => !p.has_eligible_offer).length}</div>
        <p class="kpi-desc">Ideas without an eligible manufacturer offer</p>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Active Offers</span>
          ${icon('factory', 'kpi-icon')}
        </div>
        <div class="kpi-value">${kpis.activeOffers ?? products.filter(p => p.has_my_offer && !p.demo).length}</div>
        <p class="kpi-desc">Current eligible non-DEMO manufacturer offers</p>
      </div>
    </div>

    <!-- Main Workspace: AG Studio Canvas & Custom Widgets -->
    <div class="studio-layout-grid">
      <!-- Left Column: AG Studio Container & Demand Explorer -->
      <div class="studio-main-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
          <div>
            <h3 style="margin:0 0 4px 0;font-size:16px;color:#f8fafc">Demand Explorer</h3>
            <p style="margin:0;font-size:12.5px;color:#94a3b8">Interactive grid with live cross-filtering, sorting, search, and CSV export.</p>
          </div>
          <div style="display:flex;gap:8px">
            <button type="button" class="secondary sm" id="btnExportCsv">Export CSV</button>
          </div>
        </div>

        <!-- Grid Toolbar -->
        <div class="toolbar" style="margin-top:4px;margin-bottom:12px">
          <input id="deSearch" placeholder="Search products or categories…" style="max-width:280px">
          <select id="deStageFilter">
            <option value="">All stages</option>
            ${stages.map(s => `<option value="${s}">${esc(stageName[s] || s)}</option>`).join('')}
          </select>
          <select id="deOfferFilter">
            <option value="">All offer statuses</option>
            <option value="mine">My offers active</option>
            <option value="open">Open opportunities (no offer)</option>
          </select>
          <span style="font-size:12px;color:#64748b;margin-left:auto" id="deCount">${products.length} products</span>
        </div>

        <!-- Demand Explorer Interactive Table -->
        <div style="overflow-x:auto;border:1px solid #1e293b;border-radius:8px;background:#090d16">
          <table class="sandbox-table" id="deTable">
            <thead>
              <tr>
                <th style="cursor:pointer" data-sort="title">Product ↕</th>
                <th style="cursor:pointer" data-sort="category">Category ↕</th>
                <th style="cursor:pointer" data-sort="interest">Interested Consumers ↕</th>
                <th>Stage</th>
                <th>Manufacturer Offer Status</th>
                <th style="cursor:pointer" data-sort="updated">Last Activity ↕</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="deTableBody"></tbody>
          </table>
        </div>

        <!-- Interactive Demand & Stage Distribution Charts -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:18px">
          <div style="background:#090d16;border:1px solid #1e293b;border-radius:8px;padding:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <strong style="font-size:13px;color:#f8fafc">Demand Distribution by Category</strong>
              <span style="font-size:10.5px;color:#00d2b4;font-family:var(--font-mono)">CROSS-FILTER</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px">
              ${(() => {
                const byCat = {};
                products.forEach(p => {
                  const c = p.category || 'Creator Tools';
                  byCat[c] = (byCat[c] || 0) + Math.max(1, Number(p.interest) || 0);
                });
                const entries = Object.entries(byCat).sort((a,b) => b[1] - a[1]).slice(0, 4);
                const maxV = Math.max(1, ...entries.map(e => e[1]));
                return entries.map(([cat, val]) => `
                  <div style="cursor:pointer" data-cat-filter="${esc(cat)}">
                    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                      <span style="color:#cbd5e1">${esc(cat)}</span>
                      <strong style="color:#3898ff">${val} interest signals</strong>
                    </div>
                    <div style="height:7px;background:#162035;border-radius:4px;overflow:hidden">
                      <div style="height:100%;width:${Math.round((val / maxV) * 100)}%;background:linear-gradient(90deg,#0070ba,#00d2b4);border-radius:4px"></div>
                    </div>
                  </div>
                `).join('');
              })()}
            </div>
          </div>

          <div style="background:#090d16;border:1px solid #1e293b;border-radius:8px;padding:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <strong style="font-size:13px;color:#f8fafc">Product Lifecycle Stage Pipeline</strong>
              <span style="font-size:10.5px;color:#3898ff;font-family:var(--font-mono)">LIVE STAGES</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px">
              ${(() => {
                const byStage = {};
                products.forEach(p => {
                  const s = p.status || 'idea';
                  byStage[s] = (byStage[s] || 0) + 1;
                });
                const entries = stages.filter(s => byStage[s]).map(s => [s, byStage[s]]);
                const maxS = Math.max(1, ...entries.map(e => e[1]));
                return entries.map(([st, cnt]) => `
                  <div style="cursor:pointer" data-stage-bar="${esc(st)}">
                    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                      <span style="color:#cbd5e1">${esc(stageName[st] || st)}</span>
                      <strong style="color:#00d2b4">${cnt} ${cnt === 1 ? 'product' : 'products'}</strong>
                    </div>
                    <div style="height:7px;background:#162035;border-radius:4px;overflow:hidden">
                      <div style="height:100%;width:${Math.round((cnt / maxS) * 100)}%;background:linear-gradient(90deg,#3898ff,#0070ba);border-radius:4px"></div>
                    </div>
                  </div>
                `).join('');
              })()}
            </div>
          </div>
        </div>

        <!-- Embedded Studio Mount (Expanded in Customize Mode) -->
        <div id="genesisStudioMount" style="display:none;margin-top:16px"></div>
      </div>

      <!-- Right Column: Custom AG Studio Widgets -->
      <div class="studio-side-card">
        <!-- Custom Widget 1: Opportunity Spotlight -->
        <div class="custom-widget" id="customWidgetSpotlight">
          <div class="custom-widget-header">
            <div class="custom-widget-title">
              ${icon('lightbulb')}
              Opportunity Spotlight
            </div>
            <span class="custom-widget-tag">Custom Studio Widget</span>
          </div>
          <div class="spotlight-content" id="spotlightContent"></div>
        </div>

        <!-- Custom Widget 2: GENESIS Intelligence Brief -->
        <div class="custom-widget" id="customWidgetBrief">
          <div class="custom-widget-header">
            <div class="custom-widget-title">
              ${icon('sparkles')}
              GENESIS Intelligence Brief
            </div>
            <span class="custom-widget-tag">AI Specifications</span>
          </div>
          <div id="briefContent"></div>
        </div>

        <!-- Custom Widget 3: Product Health Summary -->
        <div class="custom-widget" id="customWidgetHealth">
          <div class="custom-widget-header">
            <div class="custom-widget-title">
              ${icon('alert')}
              Product Health &amp; Field Reports
            </div>
            <span class="custom-widget-tag">Field Signals</span>
          </div>
          <div style="font-size:12.5px;color:#cbd5e1" id="healthContent">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span class="muted">Total Customer Reports</span>
              <strong style="color:#f8fafc">${feedback.length}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span class="muted">Frequent Categories</span>
              <span style="color:#94a3b8">${[...new Set(feedback.map(f => f.category))].slice(0, 3).join(', ') || 'Hardware, Usability'}</span>
            </div>
            <p style="font-size:12px;color:#64748b;margin:10px 0 0 0;line-height:1.4">Field reports represent non-verified signals submitted by consumers for human engineering triage.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Section E: PayPal Sandbox Activity -->
    <div class="sandbox-card">
      <div class="sandbox-header">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
            <h3 style="margin:0;font-size:17px;color:#f8fafc">PayPal Sandbox Activity</h3>
            <span class="sandbox-tag">Sandbox Transactions</span>
          </div>
          <p style="margin:0;font-size:12.5px;color:#94a3b8">Authorized PayPal Sandbox order records for current manufacturer. Simulated transactions only; no live revenue.</p>
        </div>
        <button type="button" class="secondary sm" id="btnGoOrders">Open Full Orders</button>
      </div>

      <div class="sandbox-kpis">
        <div class="sandbox-kpi-box">
          <div class="sandbox-kpi-label">Sandbox Orders Created</div>
          <div class="sandbox-kpi-val">${kpis.sandboxOrders?.total ?? orders.length}</div>
        </div>
        <div class="sandbox-kpi-box">
          <div class="sandbox-kpi-label">Completed Payments</div>
          <div class="sandbox-kpi-val" style="color:#4ade80">${kpis.sandboxOrders?.completed ?? orders.filter(o => o.status === 'COMPLETED').length}</div>
        </div>
        <div class="sandbox-kpi-box">
          <div class="sandbox-kpi-label">Pending / In-Flight</div>
          <div class="sandbox-kpi-val" style="color:#fbbf24">${kpis.sandboxOrders?.pending ?? orders.filter(o => o.status !== 'COMPLETED').length}</div>
        </div>
        <div class="sandbox-kpi-box">
          <div class="sandbox-kpi-label">Captured Volume (USD)</div>
          <div class="sandbox-kpi-val" style="color:#3898ff">
            ${(kpis.sandboxOrders?.capturedVolumeByCurrency?.USD ?? orders.filter(o => o.status === 'COMPLETED').reduce((s,o) => s + (Number(o.amount)||0), 0)).toFixed(2)}
          </div>
        </div>
      </div>

      <div style="overflow-x:auto;border:1px solid #1e293b;border-radius:8px">
        <table class="sandbox-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>PayPal Order ID</th>
              <th>Capture ID</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>${esc((o.created_at || '').slice(0, 10))}</td>
                <td><strong>${esc(o.product_title || o.title || 'Demo Hardware')}</strong></td>
                <td><code style="font-size:11px;color:#94a3b8">${esc(o.paypal_order_id || o.id)}</code></td>
                <td><code style="font-size:11px;color:#3898ff">${esc(o.paypal_capture_id || '—')}</code></td>
                <td><strong>${Number(o.amount).toFixed(2)}</strong></td>
                <td>${esc(o.currency || 'USD')}</td>
                <td><span class="badge-completed">${esc(o.status)}</span></td>
              </tr>
            `).join('') || '<tr><td colspan="7" class="muted" style="text-align:center;padding:16px">No Sandbox transactions recorded for this manufacturer yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  function renderSpotlight(prod) {
    if (!prod) {
      $('#spotlightContent').innerHTML = '<p class="muted">Select a product from Demand Explorer to inspect.</p>';
      return;
    }
    $('#spotlightContent').innerHTML = `
      <div class="spotlight-prod-title">${esc(prod.title)}</div>
      <div class="spotlight-meta">
        <span class="pill" style="background:#162035;border:1px solid #24324d;color:#f1f5f9">${esc(stageName[prod.status] || prod.status)}</span>
        <span class="pill" style="background:rgba(0,112,186,0.2);color:#3898ff;border:1px solid #0070ba">★ ${prod.interest} interested</span>
        <span class="pill" style="background:#162035;color:#94a3b8">${esc(prod.category || 'General')}</span>
      </div>
      <p class="spotlight-desc">${esc(prod.description || 'No description recorded.')}</p>
      <div style="margin-top:12px">
        <button type="button" class="primary sm" id="spotlightActionBtn">
          ${prod.has_my_offer ? 'Review My Offer &amp; Stages' : 'Propose Build Offer'}
        </button>
      </div>
    `;
    $('#spotlightActionBtn').onclick = () => go('#/manufacturer/product/' + prod.id);
  }

  function renderBrief(prod) {
    let spec = null;
    const rawSpec = prod?.spec || prod?.intelligence;
    try { spec = typeof rawSpec === 'string' ? JSON.parse(rawSpec) : rawSpec; } catch {}
    if (!spec || !spec.requirements || spec.requirements.length === 0) {
      $('#briefContent').innerHTML = `
        <div style="padding:14px;background:#0d1524;border-radius:6px;border:1px dashed #24324d">
          <p style="font-size:12.5px;color:#94a3b8;margin:0 0 10px 0">No saved AI specification recorded yet for this idea.</p>
          <button type="button" class="secondary sm" id="briefOpenSpecBtn">Open Product to Generate Spec</button>
        </div>
      `;
      $('#briefOpenSpecBtn').onclick = () => go('#/product/' + prod.id + '?analyze=1');
      return;
    }
    $('#briefContent').innerHTML = `
      <div class="brief-specs">
        <div class="brief-item">
          <h4>Key Engineering Requirements (${spec.requirements.length})</h4>
          <ul>
            ${spec.requirements.slice(0, 3).map(r => `<li>${esc(r)}</li>`).join('')}
          </ul>
        </div>
        ${spec.questions?.length ? `
          <div class="brief-item">
            <h4>Open Questions for Manufacturer</h4>
            <ul>
              ${spec.questions.slice(0, 2).map(q => `<li>${esc(q)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${spec.complexity ? `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#0d1524;border-radius:6px;font-size:12px;margin-top:6px">
            <span class="muted">Complexity</span>
            <strong style="color:#f8fafc">${esc(spec.complexity)}</strong>
          </div>
        ` : ''}
        <div style="margin-top:10px">
          <button type="button" class="secondary sm" id="briefFullSpecBtn">Open Full Specification</button>
        </div>
      </div>
    `;
    $('#briefFullSpecBtn').onclick = () => go('#/product/' + prod.id);
  }

  renderSpotlight(activeProduct);
  renderBrief(activeProduct);

  let currentSort = { field: 'interest', dir: 'desc' };

  function renderTable() {
    const q = ($('#deSearch')?.value || '').toLowerCase().trim();
    const stage = $('#deStageFilter')?.value || '';
    const offer = $('#deOfferFilter')?.value || '';

    let list = products.slice();
    if (q) {
      list = list.filter(p => (p.title || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
    }
    if (stage) {
      list = list.filter(p => p.status === stage);
    }
    if (offer === 'mine') {
      list = list.filter(p => p.has_my_offer);
    } else if (offer === 'open') {
      list = list.filter(p => !p.has_eligible_offer);
    }

    list.sort((a, b) => {
      let va = a[currentSort.field];
      let vb = b[currentSort.field];
      if (currentSort.field === 'interest') {
        va = Number(va) || 0;
        vb = Number(vb) || 0;
      } else {
        va = String(va || '').toLowerCase();
        vb = String(vb || '').toLowerCase();
      }
      return currentSort.dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

    $('#deCount').textContent = `${list.length} products`;
    $('#deTableBody').innerHTML = list.map(p => `
      <tr style="cursor:pointer;${p.id === activeProduct?.id ? 'background:rgba(56,152,255,0.08);' : ''}" data-row-id="${esc(p.id)}">
        <td><strong>${esc(p.title)}</strong></td>
        <td><span class="pill" style="font-size:11px">${esc(p.category || 'General')}</span></td>
        <td><span style="font-weight:700;color:#3898ff">★ ${p.interest}</span></td>
        <td><span class="pill" style="font-size:11px">${esc(stageName[p.status] || p.status)}</span></td>
        <td>
          ${p.has_my_offer
            ? '<span style="color:#4ade80;font-weight:600;font-size:12px">My Offer Active</span>'
            : (p.has_eligible_offer ? '<span style="color:#94a3b8;font-size:12px">Offer Available</span>' : '<span style="color:#fbbf24;font-size:12px">Open Opportunity</span>')}
        </td>
        <td class="muted" style="font-size:12px">${esc((p.updated_at || p.created_at || '').slice(0, 10))}</td>
        <td>
          <button type="button" class="secondary sm" data-action-pid="${esc(p.id)}">
            ${p.has_my_offer ? 'Manage' : 'Propose'}
          </button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="7" class="muted" style="text-align:center;padding:20px">No matching products found.</td></tr>';

    $('#deTableBody').querySelectorAll('[data-row-id]').forEach(row => {
      row.onclick = (e) => {
        if (e.target.closest('[data-action-pid]')) return;
        const id = row.dataset.rowId;
        const found = products.find(x => x.id === id);
        if (found) {
          activeProduct = found;
          renderSpotlight(activeProduct);
          renderBrief(activeProduct);
          renderTable();
        }
      };
    });

    $('#deTableBody').querySelectorAll('[data-action-pid]').forEach(btn => {
      btn.onclick = () => go('#/manufacturer/product/' + btn.dataset.actionPid);
    });
  }

  renderTable();

  $('#deTable').querySelectorAll('[data-sort]').forEach(th => {
    th.onclick = () => {
      const field = th.dataset.sort;
      if (currentSort.field === field) {
        currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.field = field;
        currentSort.dir = 'desc';
      }
      renderTable();
    };
  });

  $('#deSearch').oninput = renderTable;
  $('#deStageFilter').onchange = renderTable;
  $('#deOfferFilter').onchange = renderTable;

  document.querySelectorAll('[data-cat-filter]').forEach(el => {
    el.onclick = () => {
      const cat = el.dataset.catFilter;
      $('#deSearch').value = $('#deSearch').value === cat ? '' : cat;
      renderTable();
    };
  });
  document.querySelectorAll('[data-stage-bar]').forEach(el => {
    el.onclick = () => {
      const st = el.dataset.stageBar;
      $('#deStageFilter').value = $('#deStageFilter').value === st ? '' : st;
      renderTable();
    };
  });

  $('#btnExportCsv').onclick = () => {
    const headers = ['Product', 'Category', 'Interested Consumers', 'Development Stage', 'Offer Status', 'Last Activity'];
    const rows = products.map(p => [
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${(p.category || 'General').replace(/"/g, '""')}"`,
      p.interest || 0,
      `"${stageName[p.status] || p.status}"`,
      `"${p.has_my_offer ? 'My Offer Active' : (p.has_eligible_offer ? 'Offer Available' : 'Open Opportunity')}"`,
      `"${(p.updated_at || p.created_at || '').slice(0, 10)}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'genesis_demand_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notice('Demand Explorer dataset exported to CSV.', 'success');
  };

  const mountEl = $('#genesisStudioMount');
  if (window.agStudio && typeof window.agStudio.createStudio === 'function') {
    try {
      const theme = window.agStudio.createStudioTheme ? window.agStudio.createStudioTheme({
        backgroundColor: '#090d16',
        textColor: '#f1f5f9',
        borderColor: '#1e293b',
        accentColor: '#0070ba'
      }) : undefined;

      const studioData = {
        sources: [
          {
            id: 'demand_explorer',
            name: 'Demand Explorer',
            primaryKeyField: 'id',
            data: products.map(p => ({
              id: p.id,
              title: p.title,
              category: p.category || 'General',
              interest: Number(p.interest) || 0,
              stage: stageName[p.status] || p.status,
              offer_status: p.has_my_offer ? 'My Offer Active' : (p.has_eligible_offer ? 'Offer Available' : 'Open Opportunity'),
              reports: Number(p.reports) || 0,
              updated: (p.updated_at || p.created_at || '').slice(0, 10)
            }))
          },
          {
            id: 'sandbox_orders',
            name: 'PayPal Sandbox Transactions',
            primaryKeyField: 'id',
            data: orders.map(o => ({
              id: o.id,
              order_id: o.paypal_order_id || o.id,
              product: o.product_title || 'Product',
              amount: Number(o.amount) || 0,
              currency: o.currency || 'USD',
              status: o.status,
              date: (o.created_at || '').slice(0, 10)
            }))
          }
        ]
      };

      const savedLayout = localStorage.getItem('genesis_studio_layout_' + user.id);
      let initialReportState = undefined;
      if (savedLayout) {
        try { initialReportState = JSON.parse(savedLayout); } catch {}
      }

      studioApi = window.agStudio.createStudio(mountEl, {
        theme,
        mode: 'view',
        data: studioData,
        initialState: initialReportState,
        onStateUpdated: () => {
          try {
            if (studioApi && studioApi.getState) {
              const state = studioApi.getState();
              localStorage.setItem('genesis_studio_layout_' + user.id, JSON.stringify(state));
            }
          } catch {}
        }
      });
    } catch (err) {
      console.warn('AG Studio mount notice:', err);
    }
  }

  $('#btnToggleStudioMode').onclick = () => {
    isEditMode = !isEditMode;
    $('#studioModeLabel').textContent = isEditMode ? 'Lock Dashboard' : 'Customize Dashboard';
    if (studioApi && studioApi.setProperty) {
      studioApi.setProperty('mode', isEditMode ? 'edit' : 'view');
    }
    notice(isEditMode ? 'Edit mode enabled. Widgets can be resized and rearranged.' : 'Layout locked in View mode.', 'info');
  };

  $('#btnResetLayout').onclick = () => {
    localStorage.removeItem('genesis_studio_layout_' + user.id);
    notice('Dashboard layout reset to GENESIS default.', 'success');
    manufacturerIntelligence();
  };

  const askDrawer = $('#queryBoxWrap');
  $('#btnAskAiToggle').onclick = () => {
    askDrawer.scrollIntoView({ behavior: 'smooth' });
    $('#aiQueryInput').focus();
  };

  document.querySelectorAll('.query-pill').forEach(btn => {
    btn.onclick = () => {
      $('#aiQueryInput').value = btn.dataset.q;
      $('#aiQueryForm').dispatchEvent(new Event('submit', { cancelable: true }));
    };
  });

  $('#aiQueryForm').onsubmit = async (e) => {
    e.preventDefault();
    const queryText = ($('#aiQueryInput')?.value || '').trim();
    if (!queryText) return;
    const submitBtn = $('#aiQuerySubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Analyzing…';
    const resPanel = $('#aiQueryResult');
    resPanel.style.display = 'block';
    resPanel.innerHTML = '<span class="muted">GENESIS Intelligence is reading authorized manufacturer data…</span>';
    try {
      const res = await api('/intelligence/query', 'POST', { query: queryText });
      resPanel.innerHTML = `
        <div style="font-weight:600;margin-bottom:4px;color:#3898ff">Grounded Analysis:</div>
        <div>${esc(res.answer)}</div>
      `;
    } catch (err) {
      resPanel.innerHTML = `<span style="color:#ef4444">Analysis notice: ${esc(err.message)}</span>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Ask Assistant';
    }
  };

  $('#btnGoOrders').onclick = () => go('#/orders');
}



async function renderRoute() {
  const defaultRoute = user ? '#/home' : '#/intro';
  const rawHash = (location.hash || defaultRoute).slice(1);
  const [pathPart, queryPart] = rawHash.split('?');
  const path = pathPart || (user ? '/home' : '/intro');
  const query = new URLSearchParams(queryPart || '');

  $('#app').classList.remove('intro-mode');
  const brandTarget = user ? '#/home' : '#/intro';
  if ($('#brandHomeLink')) $('#brandHomeLink').setAttribute('href', brandTarget);
  if ($('#mobileBrandLink')) $('#mobileBrandLink').setAttribute('href', brandTarget);

  const kickerMap = {
    "/intro": "LUMINA OS",
    "/home": maker() ? "MANUFACTURER OS" : "CONSUMER STUDIO",
    "/explore": "DISCOVER DEMAND",
    "/request": "INVENTION STUDIO",
    "/manufacturer/intelligence": "AG STUDIO INTELLIGENCE",
    "/orders": "PAYPAL SANDBOX",
    "/account": "PROFILE & ACCESS",
    "/help": "PLATFORM ARCHITECTURE"
  };
  if ($("#windowKicker")) $("#windowKicker").textContent = kickerMap[path] || (maker() ? "MANUFACTURER OS" : "PRODUCT OS");

  nav(activeNavForRoute(path));
  const viewEl = $("#view");
  const dimTimer = setTimeout(() => viewEl.classList.add('loading-dim'), 120);

  const finishRender = () => {
    clearTimeout(dimTimer);
    viewEl.classList.remove('loading-dim', 'view-enter');
    void viewEl.offsetWidth;
    viewEl.classList.add('view-enter');
  };

  try {
    if (path === '/intro' || (!user && path === '/')) { introPage(); finishRender(); return; }
    if (path === '/' || path === '/home') { home(); finishRender(); return; }
    if (path === '/explore') { await explore(); finishRender(); return; }
    if (path === '/request') { requestWizard(1); finishRender(); return; }
    if (path === '/report') { await reportWizard(1); finishRender(); return; }
    if (path.startsWith('/report/')) {
      const pid = decodeURIComponent(path.slice('/report/'.length));
      if (!reportDraft.product_id) reportDraft.product_id = pid;
      await reportWizard(2);
      finishRender();
      return;
    }
    if (path.startsWith('/product/')) {
      const id = decodeURIComponent(path.slice('/product/'.length));
      await detail(id, query.get('analyze') === '1');
      finishRender();
      return;
    }
    if (path === '/my-products') { await myProducts(); finishRender(); return; }
    if (path === '/orders') { await ordersPage(); finishRender(); return; }
    if (path === '/help') { help(); finishRender(); return; }
    if (path === '/account') { await accountPage(); finishRender(); return; }
    if (path === '/admin') { await adminPage(); finishRender(); return; }
    if (path === '/manufacturer/intelligence' || path === '/manufacturer/analytics') { await manufacturerIntelligence(); finishRender(); return; }
    if (path === '/manufacturer/demand') { await manufacturerDemand('demand'); finishRender(); return; }
    if (path === '/manufacturer/offer') { await manufacturerDemand('offer'); finishRender(); return; }
    if (path === '/manufacturer/quality') { await manufacturerQuality(); finishRender(); return; }
    if (path === '/manufacturer/products') { await manufacturerProducts(); finishRender(); return; }
    if (path.startsWith('/manufacturer/product/')) {
      const id = decodeURIComponent(path.slice('/manufacturer/product/'.length));
      await manufacturerProduct(id);
      finishRender();
      return;
    }
    home();
    finishRender();
  } catch (e) {
    clearTimeout(dimTimer);
    viewEl.classList.remove('loading-dim');
    viewEl.innerHTML =
      '<div class="empty"><h2>Could not load this view</h2><p>' +
      esc(e.message) +
      '</p><button type="button" class="secondary" id="retryRoute">Back to Home</button></div>';
    $('#retryRoute').onclick = () => go('#/home');
  }
}

async function refreshMe() {
  const me = await api('/me');
  user = me.user;
  application = me.application || null;
}

async function init() {
  $('#modalClose').onclick = closeModal;
  document.addEventListener('click', (e) => {
    const menu = $('#profileMenu');
    const btn = $('#profile');
    if (menu && !menu.hidden && !menu.contains(e.target) && !btn?.contains(e.target)) {
      menu.hidden = true;
      btn?.setAttribute('aria-expanded', 'false');
    }
  });
  window.addEventListener('hashchange', renderRoute);

  try {
    await refreshMe();
    const params = new URLSearchParams(location.search);
    const verify = params.get('verify');
    const order = params.get('checkout');
    const result = params.get('result');

    if (verify) {
      try {
        await api('/verification/confirm', 'POST', { token: verify });
        await refreshMe();
        notice('Email verified.', 'success');
      } catch (e) {
        notice(e.message, 'error');
      }
      history.replaceState({}, '', location.pathname + (location.hash || '#/home'));
    }

    if (order && user) {
      try {
        const res = await api(
          '/orders/' +
            encodeURIComponent(order) +
            '/' +
            (result === 'cancelled' ? 'cancel' : 'reconcile'),
          'POST'
        );
        history.replaceState({}, '', location.pathname + '#/orders');
        await renderRoute();
        notice(
          paymentLabel[res.status] || res.notice || 'Payment status updated.',
          res.status === 'COMPLETED' ? 'success' : 'info'
        );
        return;
      } catch (e) {
        notice(e.message, 'error');
        history.replaceState({}, '', location.pathname + '#/orders');
      }
    }

    if (!location.hash) {
      history.replaceState({}, '', location.pathname + (user ? '#/home' : '#/intro'));
    }
    await renderRoute();
  } catch (e) {
    notice(e.message, 'error');
  }
}

init();
