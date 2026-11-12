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
  if (route === '/intro') return 'Intro';
  if (route === '/' || route === '/home' || route.startsWith('/request') || route.startsWith('/report')) {
    return 'Home';
  }
  if (route === '/explore') return 'Explore';
  if (route.startsWith('/product/')) return maker() ? 'Customer Demand' : 'Explore';
  if (route === '/my-products') return 'My Products';
  if (route === '/orders') return maker() ? 'Orders' : 'My Products';
  if (route === '/help') return 'Help';
  if (route === '/account') return 'Account';
  if (route === '/admin') return 'Approvals';
  if (route.startsWith('/manufacturer/intelligence')) return 'GENESIS Intelligence';
  if (route.startsWith('/manufacturer/products')) return 'My Products';
  if (route.startsWith('/manufacturer/')) return 'Customer Demand';
  return 'Home';
}

function nav(activePage) {
  const isMaker = maker();
  const items = isMaker
    ? [
        { label: 'Home', hash: '#/home', icon: 'home' },
        { label: 'Ideas', hash: '#/manufacturer/demand', icon: 'lightbulb' },
        { label: 'Intelligence', hash: '#/manufacturer/intelligence', icon: 'sparkles' },
        { label: 'Manufacturing', hash: '#/manufacturer/products', icon: 'layers' },
        { label: 'Orders', hash: '#/orders', icon: 'receipt' },
        { label: 'Analytics', hash: '#/manufacturer/analytics', icon: 'chart' },
      ]
    : [
        { label: 'Home', hash: user ? '#/home' : '#/intro', icon: 'home' },
        { label: 'Ideas', hash: '#/explore', icon: 'lightbulb' },
        { label: 'Intelligence', hash: '#/manufacturer/intelligence', icon: 'sparkles' },
        { label: 'Manufacturing', hash: user ? '#/my-products' : '#/explore', icon: 'layers' },
        { label: 'Orders', hash: '#/orders', icon: 'receipt' },
        { label: 'Analytics', hash: '#/help', icon: 'chart' },
      ];

  const currentPath = location.hash.replace(/^#/, '').split('?')[0];
  const isCurrentActive = (item) => {
    if (activePage === item.label) return true;
    if (item.label === 'Home' && (currentPath === '' || currentPath === '/' || currentPath === '/home' || currentPath === '/intro')) return true;
    if (item.label === 'Ideas' && (currentPath === '/explore' || currentPath === '/manufacturer/demand')) return true;
    if (item.label === 'Intelligence' && (currentPath === '/manufacturer/intelligence' || currentPath === '/manufacturer/analytics')) return true;
    if (item.label === 'Manufacturing' && (currentPath === '/manufacturer/products' || currentPath === '/my-products' || currentPath.startsWith('/manufacturer/product/'))) return true;
    if (item.label === 'Orders' && currentPath === '/orders') return true;
    return false;
  };

  if ($('#nav')) {
    $('#nav').innerHTML = items
      .map(
        (item) =>
          `<button class="${isCurrentActive(item) ? 'active' : ''}" data-hash="${item.hash}" aria-current="${
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

  if ($('#btnNavHome')) $('#btnNavHome').onclick = () => go(user ? '#/home' : '#/intro');
  if ($('#btnNavMode')) $('#btnNavMode').onclick = () => notice('Neomorphic Twilight Theme Active', 'info');
  if ($('#btnNavBell')) $('#btnNavBell').onclick = () => notice('System Notification: PayPal Sandbox orders verified and operational.', 'info');
  if ($('#topDemoConsumerBtn')) $('#topDemoConsumerBtn').onclick = async () => {
    try {
      const res = await api('/demo/session', 'POST', { role: 'consumer' });
      await refreshMe();
      notice('Demo mode started as Consumer.', 'success');
      go('#/home');
    } catch (e) { notice(e.message, 'error'); }
  };
  if ($('#topDemoMakerBtn')) $('#topDemoMakerBtn').onclick = async () => {
    try {
      const res = await api('/demo/session', 'POST', { role: 'manufacturer' });
      await refreshMe();
      notice('Demo mode started as Manufacturer.', 'success');
      go('#/manufacturer/intelligence');
    } catch (e) { notice(e.message, 'error'); }
  };
  if ($('#profilePill')) $('#profilePill').onclick = () => {
    if (!user) auth();
    else go('#/account');
  };
  if ($('#topUserName')) {
    $('#topUserName').textContent = user ? (user.is_demo ? 'DEMO · ' + user.name : user.name) : 'Judge Session';
  }

  if ($('#headerHelpBtn')) $('#headerHelpBtn').onclick = () => go('#/help');
  if ($('#appIdentityCard')) $('#appIdentityCard').onclick = () => go(user ? '#/home' : '#/intro');
  if ($('#demoStatusPill')) {
    $('#demoStatusPill').onclick = () => {
      notice(user ? `Demo session active: ${user.name} (${user.role})` : 'Zero-friction hackathon demonstration active. No registration required.', 'info');
    };
  }

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

function introPage() {
  if (user) {
    go('#/home');
    return;
  }
  const appRoot = $('#desktopApp') || $('#app');
  if (appRoot) appRoot.classList.add('intro-mode');
  $('#heading').textContent = 'PayPal GENESIS';

  $('#view').innerHTML = `
    <div class="reference-stage-grid view-enter">
      <!-- LEFT COLUMN: TELEMETRY & PRODUCT SPOTLIGHT -->
      <aside class="ref-left-col">
        <!-- Telemetry Multiplier Curve Card -->
        <div class="ref-telemetry-card">
          <div class="telemetry-chart-wrap">
            <div class="telemetry-axis-labels">
              <span>4.00x</span>
              <span>3.00x</span>
              <span>2.00x</span>
              <span>1.00x</span>
            </div>
            <div class="telemetry-val-badge">2.54x</div>
            <svg class="telemetry-svg-curve" viewBox="0 0 240 140" fill="none">
              <defs>
                <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M 45 125 C 90 120, 160 110, 215 35" class="telemetry-glow-path"/>
              <path d="M 45 125 C 90 120, 160 110, 215 35 L 215 130 L 45 130 Z" fill="url(#curveGrad)"/>
              <circle cx="215" cy="35" r="4.5" fill="#ffffff" stroke="#38bdf8" stroke-width="2.5"/>
            </svg>
          </div>

          <!-- Multiplier Velocity Capsules -->
          <div class="ref-velocity-row">
            <button type="button" class="ref-pill-node c-blue" data-stage="idea">1.45x</button>
            <button type="button" class="ref-pill-node c-orange" data-stage="intel">3.42x</button>
            <button type="button" class="ref-pill-node c-purple" data-stage="demand">5.22x</button>
            <button type="button" class="ref-pill-node c-green" data-stage="build">1.20x</button>
          </div>
        </div>

        <!-- Spotlight Item Card (Hurley / Knife / Join / 23h:43m / 128) -->
        <div class="ref-spotlight-card" id="genesisMapCard">
          <div class="spotlight-header">
            <div class="spotlight-creator">
              <div class="spotlight-avatar">H</div>
              <div class="spotlight-creator-text">
                <small>Last Win</small>
                <strong>Hurley</strong>
              </div>
            </div>
          </div>

          <div class="spotlight-graphic">
            <svg width="150" height="48" viewBox="0 0 150 48" fill="none">
              <path d="M20 38 L80 18 L120 12 L100 28 Z" fill="url(#cRedGrad)" stroke="#fb7185" stroke-width="1.2"/>
              <path d="M35 44 L95 24 L135 18 L115 34 Z" fill="url(#cPurpGrad)" stroke="#c084fc" stroke-width="1.2"/>
              <defs>
                <linearGradient id="cRedGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#f43f5e"/>
                  <stop offset="100%" stop-color="#881337"/>
                </linearGradient>
                <linearGradient id="cPurpGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#a855f7"/>
                  <stop offset="100%" stop-color="#3b82f6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div class="spotlight-actions-bar">
            <button type="button" class="ref-join-btn" id="btnJoinSpotlight">Join</button>
            <div class="spotlight-timer">
              <span>23h : 43m</span>
              <small>👥 128</small>
            </div>
          </div>
        </div>

        <!-- Checked Row at bottom of left column -->
        <div class="ref-checked-row">
          <span>Checked <strong style="color:#ffffff">0.0 $</strong></span>
          <span style="display:flex;align-items:center;gap:4px">All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>
        </div>
      </aside>

      <!-- CENTER STAGE: INFORMATION, 3D SHOWCASE & 3 SOFT-3D CARDS -->
      <section class="ref-center-col">
        <div class="showcase-header-bar">
          <span class="showcase-label">Information</span>
        </div>

        <!-- 3D Floating Showcase with Neon Circular Ring & Conversion Pricing -->
        <div class="ref-3d-showcase">
          <div class="floating-item-ring-wrap">
            <div class="neon-circular-ring"></div>
            <!-- Futuristic Voltaire 3D Rifle/Tool Vector -->
            <svg class="showcase-product-svg" width="180" height="90" viewBox="0 0 180 90" fill="none">
              <path d="M15 28 L40 32 L75 30 L155 46 L165 72 L145 68 L130 52 L60 48 L35 44 Z" fill="#b91c1c" stroke="#fca5a5" stroke-width="1.4"/>
              <path d="M75 30 L110 32 L105 48 L70 48 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
              <path d="M120 40 L150 44 L142 58 L115 54 Z" fill="#e11d48"/>
              <text x="80" y="44" fill="#ffffff" font-size="7" font-weight="800" font-family="monospace">VOLTAIRE</text>
              <circle cx="155" cy="46" r="3" fill="#38bdf8"/>
            </svg>
          </div>

          <div class="ref-price-conversion">
            <div class="price-main-row">
              <span>7.19 <span class="price-symbol">$</span></span>
              <span class="price-arrow">»</span>
              <span>8.15 <span class="price-symbol">$</span></span>
            </div>
            <div class="price-sub-row">
              <span class="price-sub-tag">1.7 $</span>
              <button type="button" class="ref-receive-btn" id="demoConsumerHeroBtn">
                <span>receive 2.54x</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Three Bold Colorful 3D Rounded Cards (Blue, Purple, Coral-Red) -->
        <div class="ref-3d-cards-row">
          <!-- Card 1: Blue (vk/idea) -->
          <div class="ref-3d-feature-card card-blue" id="btnCardIdea" role="button" tabindex="0">
            <div class="card-3d-glyph">W</div>
            <p class="card-3d-desc">Don't miss the latest news &amp; giveaways in our VK group.</p>
            <div class="card-3d-arrow">→</div>
          </div>

          <!-- Card 2: Purple (X/Intelligence) -->
          <div class="ref-3d-feature-card card-purple" id="btnCardIntel" role="button" tabindex="0">
            <div class="card-3d-glyph">✕</div>
            <p class="card-3d-desc">To make real Xs, you need to replenish the balance.</p>
            <div class="card-3d-arrow">→</div>
          </div>

          <!-- Card 3: Coral-Red (%/PayPal) -->
          <div class="ref-3d-feature-card card-coral" id="btnCardPay" role="button" tabindex="0">
            <div class="card-3d-glyph">%</div>
            <p class="card-3d-desc">Put the nickname "csgorun.ru" &amp; get 10 % to replenish</p>
            <div class="card-3d-arrow">→</div>
          </div>
        </div>

        <!-- Statistic Row at Bottom of Center Column -->
        <div class="ref-stats-bar">
          <span class="stats-bar-title">Statistic</span>
          <div class="stats-bar-items">
            <span class="stats-bar-item">👥 73</span>
            <span class="stats-bar-item">💰 24.80</span>
            <span class="stats-bar-item">⚡ 56</span>
          </div>
        </div>
      </section>

      <!-- RIGHT COLUMN: ACTIVITY STREAM & PINNED SYSTEM TOAST -->
      <aside class="ref-right-col">
        <div class="feed-header-bar">
          <button type="button" class="feed-collapse-btn" title="Collapse Feed">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <div class="feed-online-count">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 8 0v2"/></svg>
            <span>438</span>
          </div>
        </div>

        <!-- Live Activity Stream List -->
        <div class="feed-items-list">
          <div class="feed-entry">
            <div class="feed-avatar" style="background:#f59e0b">🐔</div>
            <div class="feed-body">
              <div class="feed-meta-row">
                <span class="feed-user-tag">sQich <small style="color:var(--ink-muted)">[32]</small></span>
                <span class="feed-time">12:35</span>
              </div>
              <p class="feed-msg">Messages are sent as chats if the person you're</p>
            </div>
          </div>

          <div class="feed-entry">
            <div class="feed-avatar" style="background:#10b981">🤖</div>
            <div class="feed-body">
              <div class="feed-meta-row">
                <span class="feed-user-tag">Ra1n <small style="color:var(--ink-muted)">[8]</small></span>
                <span class="feed-time">12:33</span>
              </div>
              <p class="feed-msg">there is still gonna be call of duty and stuff</p>
            </div>
          </div>

          <div class="feed-entry">
            <div class="feed-avatar" style="background:#e11d48">🦊</div>
            <div class="feed-body">
              <div class="feed-meta-row">
                <span class="feed-user-tag">Hurley <small style="color:var(--ink-muted)">[13]</small></span>
                <span class="feed-time">11:21</span>
              </div>
              <p class="feed-msg">do surf utopia its a great map</p>
            </div>
          </div>
        </div>

        <!-- Pinned Bottom System Message Toast -->
        <div class="ref-system-toast" id="systemMessageToast">
          <div class="toast-runner-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="13" cy="4" r="2"/><path d="m5 21 4-7 4 3 4-8"/><path d="m9 14 3-6 4 2"/></svg>
          </div>
          <div class="toast-body">
            <div class="toast-head-row">
              <strong class="toast-title">System Message</strong>
              <span class="toast-time">10:33</span>
            </div>
            <p class="toast-desc">Your surfing... Hurts my brain.</p>
          </div>
        </div>
      </aside>
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

  $('#demoConsumerHeroBtn').onclick = () => launchDemo('consumer');
  if ($('#btnCardIdea')) $('#btnCardIdea').onclick = () => launchDemo('consumer');
  if ($('#btnCardIntel')) $('#btnCardIntel').onclick = () => launchDemo('manufacturer');
  if ($('#btnCardPay')) $('#btnCardPay').onclick = () => launchDemo('consumer');
  if ($('#btnJoinSpotlight')) $('#btnJoinSpotlight').onclick = () => launchDemo('consumer');

  document.querySelectorAll('.ref-pill-node').forEach((p) => {
    p.onclick = () => {
      document.querySelectorAll('.ref-pill-node').forEach((x) => x.style.transform = 'none');
      p.style.transform = 'translateY(-2px)';
      notice(`Velocity ${p.textContent} telemetry selected.`, 'info');
    };
  });
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
  $('#heading').textContent = 'Home';
  const isMaker = maker();
  if (isMaker) {
    $('#view').innerHTML = `
      <div class="workspace-canvas view-enter">
        <div class="workspace-top-bar">
          <div>
            <h2 style="margin:0 0 4px 0;font-size:22px;font-weight:700;color:#ffffff;">Manufacturer Opportunity Workspace</h2>
            <p style="margin:0;font-size:13px;color:var(--mac-ink-secondary);">Review real consumer demand, commit manufacturing offers, advance milestones, and manage orders.</p>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <button type="button" class="btn-mac-primary" id="homeAgStudioBtn">
              <span>📊 AG Studio Intelligence</span>
            </button>
            <button type="button" class="btn-mac-secondary" data-action="offer">
              ${icon('factory')}<span>+ Publish Build Offer</span>
            </button>
          </div>
        </div>

        <div class="mac-segmented-control">
          <button type="button" class="mac-segment-btn active" data-action="explore">Demand Signals</button>
          <button type="button" class="mac-segment-btn" data-action="progress">Batch Production</button>
          <button type="button" class="mac-segment-btn" data-action="improve">Quality Feedback</button>
          <button type="button" class="mac-segment-btn" data-action="orders">PayPal Orders</button>
        </div>

        <div class="invention-cards-grid">
          <div class="invention-brief-card">
            <div class="brief-card-head">
              <div>
                <span class="badge" style="background:rgba(16,185,129,0.15);color:#34d399;font-size:11px;padding:3px 8px;border-radius:4px;">HIGH OPPORTUNITY</span>
                <h3 class="brief-card-title" style="margin-top:8px;">Eight-input portable audio interface</h3>
                <p class="brief-card-desc">842 verified backers seeking compact 8-channel USB-C recording hardware under $250 retail target.</p>
              </div>
            </div>
            <div class="brief-card-meta">
              <span>📈 78% Demand Score</span>
              <span>💵 $148.5K GMV Est.</span>
              <span>🏭 Batch #1 Active</span>
            </div>
            <div class="brief-card-actions">
              <button type="button" class="btn-mac-secondary" data-action="progress">Update Milestone</button>
              <button type="button" class="btn-mac-primary" data-action="orders">View Orders</button>
            </div>
          </div>

          <div class="invention-brief-card">
            <div class="brief-card-head">
              <div>
                <span class="badge" style="background:rgba(56,152,255,0.15);color:#93c5fd;font-size:11px;padding:3px 8px;border-radius:4px;">NEW DEMAND</span>
                <h3 class="brief-card-title" style="margin-top:8px;">Portable 4K Field Production Monitor</h3>
                <p class="brief-card-desc">516 creators requesting daylight-readable 1500-nit HDMI/SDI monitor. Specification ready for quote.</p>
              </div>
            </div>
            <div class="brief-card-meta">
              <span>📈 64% Demand Score</span>
              <span>💵 $154.2K GMV Est.</span>
              <span>📄 Spec Verified</span>
            </div>
            <div class="brief-card-actions">
              <button type="button" class="btn-mac-secondary" data-action="explore">Inspect Spec</button>
              <button type="button" class="btn-mac-primary" data-action="offer">Submit Offer</button>
            </div>
          </div>

          <div class="invention-brief-card" style="background:rgba(0,112,186,0.08);border-color:rgba(56,152,255,0.3);cursor:pointer;" id="cardLaunchStudio">
            <div class="brief-card-head">
              <div>
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                  <span style="background:rgba(239,68,68,0.2);color:#ef4444;font-size:9.5px;font-weight:800;padding:2px 6px;border-radius:4px;">AG</span>
                  <span style="color:#ffffff;font-size:12px;font-weight:700;">AG Studio Embedded</span>
                </div>
                <h3 class="brief-card-title">Manufacturer Intelligence Command Center</h3>
                <p class="brief-card-desc">Analyze pipeline metrics, filter demand with AG Grid, track AG Charts conversions, and query AI assistant.</p>
              </div>
            </div>
            <div class="brief-card-actions">
              <span style="font-size:12px;color:var(--mac-blue-bright);font-weight:600;">Launch AG Studio Canvas →</span>
            </div>
          </div>
        </div>
      </div>
    `;
    bindHomeActions();
    if ($('#homeAgStudioBtn')) $('#homeAgStudioBtn').onclick = () => go('#/manufacturer/intelligence');
    if ($('#cardLaunchStudio')) $('#cardLaunchStudio').onclick = () => go('#/manufacturer/intelligence');
    return;
  }

  $('#view').innerHTML = `
    <div class="workspace-canvas view-enter">
      <div class="workspace-top-bar">
        <div>
          <h2 style="margin:0 0 4px 0;font-size:22px;font-weight:700;color:#ffffff;">Personal Invention Workspace</h2>
          <p style="margin:0;font-size:13px;color:var(--mac-ink-secondary);">Create product ideas, explore community demand, and track manufacturing progress.</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button type="button" class="btn-mac-primary" data-action="request">
            ${icon('lightbulb')}<span>+ Request Product Idea</span>
          </button>
          <button type="button" class="btn-mac-secondary" data-action="explore">
            ${icon('compass')}<span>Community Ideas</span>
          </button>
        </div>
      </div>

      <div class="mac-segmented-control">
        <button type="button" class="mac-segment-btn active" data-action="mine">My Inventions</button>
        <button type="button" class="mac-segment-btn" data-action="explore">Discoveries</button>
        <button type="button" class="mac-segment-btn" data-action="orders">Orders &amp; Receipts</button>
      </div>

      <div class="invention-cards-grid">
        <div class="invention-brief-card">
          <div class="brief-card-head">
            <div>
              <span class="badge" style="background:rgba(56,152,255,0.15);color:#93c5fd;font-size:11px;padding:3px 8px;border-radius:4px;">PROTOTYPE READY</span>
              <h3 class="brief-card-title" style="margin-top:8px;">Eight-input portable audio interface</h3>
              <p class="brief-card-desc">Low-noise preamps, hardware gain knobs, bus-powered dual USB-C design for mobile multi-track audio capture.</p>
            </div>
          </div>
          <div class="brief-card-meta">
            <span>👥 842 Backers</span>
            <span>💰 $249 Target</span>
            <span>🏷️ Creator Tools</span>
          </div>
          <div class="brief-card-actions">
            <span style="font-size:12px;color:var(--mac-teal);font-weight:600;">Offer Active · Batch #1</span>
            <button type="button" class="btn-mac-primary" data-action="explore">View Progress</button>
          </div>
        </div>

        <div class="invention-brief-card">
          <div class="brief-card-head">
            <div>
              <span class="badge" style="background:rgba(168,85,247,0.15);color:#c084fc;font-size:11px;padding:3px 8px;border-radius:4px;">SPEC GENERATED</span>
              <h3 class="brief-card-title" style="margin-top:8px;">Portable 4K Field Production Monitor</h3>
              <p class="brief-card-desc">1500 nits high-bright daylight viewable monitor with dual SDI &amp; HDMI loop-through and built-in LUT support.</p>
            </div>
          </div>
          <div class="brief-card-meta">
            <span>👥 516 Backers</span>
            <span>💰 $299 Target</span>
            <span>🏷️ Video Gear</span>
          </div>
          <div class="brief-card-actions">
            <span style="font-size:12px;color:var(--mac-ink-muted);">Under Manufacturer Review</span>
            <button type="button" class="btn-mac-secondary" data-action="explore">View Spec</button>
          </div>
        </div>

        <div class="invention-brief-card" style="border-style:dashed;display:flex;align-items:center;justify-content:center;text-align:center;min-height:180px;cursor:pointer;" data-action="request">
          <div>
            <div style="width:48px;height:48px;border-radius:50%;background:rgba(56,152,255,0.12);color:var(--mac-blue-bright);display:flex;align-items:center;justify-content:center;margin:0 auto 12px auto;">
              ${icon('lightbulb')}
            </div>
            <strong style="color:#ffffff;font-size:15px;display:block;margin-bottom:4px;">Have another product idea?</strong>
            <span style="font-size:12.5px;color:var(--mac-ink-muted);">Click to generate an AI technical specification</span>
          </div>
        </div>
      </div>
    </div>
  `;
  bindHomeActions();
}

function help() {
  $('#heading').textContent = 'How GENESIS works';
  $('#view').innerHTML = `
    <div class="panel guide">
      <h2>From everyday needs to real products</h2>
      <ol>
        <li><strong>Share what you need.</strong> Describe a product you wish existed or report a problem with one you use.</li>
        <li><strong>Show support without obligation.</strong> Expressing interest is free and does not commit anyone to buy.</li>
        <li><strong>Turn ideas into clear requirements.</strong> Product owners can generate preliminary product requirements and edit them anytime.</li>
        <li><strong>Approved manufacturers respond.</strong> Verified users can apply in Account &amp; Role to become an approved manufacturer, propose pricing and terms, and update production stages.</li>
        <li><strong>Optional Sandbox checkout.</strong> Only non-DEMO offers marked eligible by a manufacturer support PayPal Sandbox checkout. Returning from PayPal does not complete an order until confirmed server-side.</li>
      </ol>
      <div class="callout info">
        <strong>About DEMO items and preliminary suggestions</strong>
        <p style="margin-top:4px">Items labeled <strong>DEMO</strong> are sample scenarios for exploring workflows and cannot be purchased. Generated product requirements are preliminary suggestions; engineering feasibility, demand, and defect rates are not verified automatically.</p>
      </div>
      <div class="row" style="margin-top:16px">
        <button type="button" class="primary" id="helpExplore">${maker() ? 'Find products people want' : 'Explore ideas'}</button>
        ${!maker() ? '<button type="button" class="secondary" id="helpBecomeMaker">How manufacturers join</button>' : ''}
      </div>
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

function productRowHtml(p, btnLabel = 'View idea') {
  return `<article class="product-row-card">
    <div class="product-row-main">
      <div class="row">
        <span class="badge">${esc(stageName[p.status] || p.status)}</span>
        ${p.demo ? '<span class="badge demo">DEMO</span>' : ''}
        <span class="muted">${esc(p.category || 'Other')}</span>
      </div>
      <h3>${esc(p.title)}</h3>
      <p>${esc((p.description || '').slice(0, 155))}${(p.description || '').length > 155 ? '…' : ''}</p>
    </div>
    <div class="product-row-aside">
      <div class="product-row-stat">
        <strong>${p.supporters ?? 0}</strong>
        <span>interested</span>
      </div>
      <button type="button" class="secondary" data-pid="${esc(p.id)}">${esc(btnLabel)}</button>
    </div>
  </article>`;
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
  $('#heading').textContent = 'Explore ideas';
  const data = await api('/products');
  $('#view').innerHTML = `
    <div class="hero compact">
      <div>
        <h2>Explore ideas from other people</h2>
        <p>Browse product requests, check current progress, and express nonbinding interest.</p>
      </div>
      ${!maker() ? `<button type="button" class="primary" id="exploreReqBtn">${icon('lightbulb')}<span>Request a Product</span></button>` : ''}
    </div>
    <div class="toolbar">
      <label class="sr-only" for="search">Search ideas</label>
      <input id="search" placeholder="Search ideas by title or keyword…">
      <label class="sr-only" for="filter">Filter by stage</label>
      <select id="filter">
        <option value="">All stages</option>
        ${stages.map((x) => `<option value="${x}">${esc(stageName[x])}</option>`).join('')}
      </select>
    </div>
    <div id="cards" class="product-list">${
      data.products.map((p) => productRowHtml(p)).join('') ||
      '<div class="empty">No ideas yet. Be the first to share one.</div>'
    }</div>
  `;

  if ($('#exploreReqBtn')) $('#exploreReqBtn').onclick = () => go('#/request');

  const bindCards = () => {
    $('#cards')
      .querySelectorAll('[data-pid]')
      .forEach((b) => (b.onclick = () => go('#/product/' + b.dataset.pid)));
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
          '<div class="empty">No matching ideas found. Try clearing your filters.</div>';
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
  if (maker()) {
    $('#heading').textContent = 'Orders for your offers';
    const x = await api('/manufacturer/orders');
    $('#view').innerHTML = `
      <div class="row page-actions">
        <button type="button" class="secondary" id="ordProductsBtn">My offered products</button>
      </div>
      <div class="panel">
        <h2>PayPal Sandbox orders</h2>
        <p class="field-hint" style="margin-bottom:14px">Only server-verified PayPal captures appear as confirmed. Buyer personal details are kept private.</p>
        ${
          x.orders
            .map(
              (o) => `<div class="list-item">
                <div class="row" style="justify-content:space-between">
                  <strong>${esc(o.title)}</strong>
                  <span class="${paymentBadgeClass[o.status] || 'badge'}">${esc(paymentLabel[o.status] || o.status)}</span>
                </div>
                <p style="margin-top:6px">${esc(o.currency)} ${Number(o.amount).toFixed(2)} · ${o.demo ? 'DEMO' : 'PayPal Sandbox'} · ${esc(o.created_at)}</p>
                <button type="button" class="secondary" data-mpid="${esc(o.product_id)}">Manage product</button>
              </div>`
            )
            .join('') ||
          '<div class="empty">No orders yet. Orders appear here after a verified consumer starts Sandbox checkout on an eligible offer.</div>'
        }
      </div>`;
    $('#ordProductsBtn').onclick = () => go('#/manufacturer/products');
    $('#view')
      .querySelectorAll('[data-mpid]')
      .forEach((b) => (b.onclick = () => go('#/manufacturer/product/' + b.dataset.mpid)));
    return;
  }

  $('#heading').textContent = 'Orders · PayPal Sandbox';
  if (!user) {
    $('#view').innerHTML = `<div class="empty"><h2>Sign in to view your orders</h2><button type="button" class="primary" id="ordSignIn">Sign in</button></div>`;
    $('#ordSignIn').onclick = () => {
      pendingAfterAuth = () => go('#/orders');
      auth();
    };
    return;
  }

  const x = await api('/orders');
  $('#view').innerHTML = `
    <div class="row page-actions">
      <button type="button" class="secondary" id="backMyProductsBtn">← My Products</button>
    </div>
    <div class="panel">
      <h2>PayPal Sandbox purchase history</h2>
      <p class="field-hint" style="margin-bottom:14px">A return from PayPal does not complete an order on its own. Confirm and capture approved orders below, or check status if interrupted.</p>
      ${
        x.orders
          .map(
            (o) => `<div class="list-item">
              <div class="row" style="justify-content:space-between">
                <strong>${esc(o.title)}</strong>
                <span class="${paymentBadgeClass[o.status] || 'badge'}">${esc(o.is_sample ? 'Sample Sandbox Payment' : (paymentLabel[o.status] || o.status))}</span>
              </div>
              <p style="margin-top:6px">${esc(o.currency)} ${Number(o.amount).toFixed(2)} · ${o.is_sample ? 'Sample Sandbox Payment · ID ' : 'Sandbox Order '}${esc(o.paypal_order_id)}${o.capture_id ? ' · Capture ' + esc(o.capture_id) : ''}</p>
              ${o.is_sample ? `<p class="muted" style="color:#6ee7b7">Demonstration record: Verified completed sample PayPal Sandbox capture for hackathon judging.</p>` : ''}
              ${o.failure_reason ? `<p class="muted">Note: ${esc(o.failure_reason)}</p>` : ''}
              ${
                !['COMPLETED', 'CANCELLED', 'FAILED'].includes(o.status)
                  ? `<div class="row" style="margin-top:10px">
                      ${o.status === 'APPROVED' ? `<button type="button" class="primary" data-capture="${esc(o.id)}">Confirm &amp; capture payment</button>` : ''}
                      ${o.status === 'CREATED' ? `<a class="secondary" style="display:inline-flex;align-items:center;padding:9px 14px;border:1px solid var(--line-strong);border-radius:10px" href="https://www.sandbox.paypal.com/checkoutnow?token=${encodeURIComponent(o.paypal_order_id)}">Resume PayPal approval</a>` : ''}
                      <button type="button" class="secondary" data-reconcile="${esc(o.id)}">Check payment status</button>
                      ${o.status === 'CREATED' ? `<button type="button" class="secondary" data-cancel="${esc(o.id)}">Cancel checkout</button>` : ''}
                    </div>`
                  : ''
              }
            </div>`
          )
          .join('') ||
        '<div class="empty">No orders yet. Explore an eligible non-DEMO manufacturer offer to test PayPal Sandbox checkout.</div>'
      }
    </div>`;

  $('#backMyProductsBtn').onclick = () => go('#/my-products');
  for (const op of ['capture', 'reconcile', 'cancel']) {
    $('#view')
      .querySelectorAll(`[data-${op}]`)
      .forEach((b) => {
        b.onclick = (e) =>
          loading(
            e.currentTarget,
            async () => {
              try {
                const res = await api(
                  '/orders/' + b.dataset[op] + '/' + op,
                  'POST'
                );
                notice(
                  paymentLabel[res.status] || res.notice || 'Order updated.',
                  res.status === 'COMPLETED' ? 'success' : 'info'
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
            $${(kpis.sandboxOrders?.capturedVolumeByCurrency?.USD ?? orders.filter(o => o.status === 'COMPLETED').reduce((s,o) => s + (Number(o.amount)||0), 0)).toFixed(2)}
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

async function manufacturerDemand(mode = 'demand') {
  if (!maker()) return go('#/home');
  $('#heading').textContent =
    mode === 'offer' ? 'Offer to manufacture a product' : 'Find products people want';
  const x = await api('/manufacturer/dashboard');
  const list =
    mode === 'offer'
      ? x.opportunities.filter((o) => o.status !== 'retirement')
      : x.opportunities;

  $('#view').innerHTML = `
    <div class="hero compact">
      <div>
        <h2>${mode === 'offer' ? 'Choose a product to propose an offer' : 'Customer demand & product requests'}</h2>
        <p>${
          mode === 'offer'
            ? 'Select a non-discontinued product below to submit pricing, minimum quantity, and fulfillment terms.'
            : 'Ideas sorted by customer interest. Review consumer specifications and decide where you can help.'
        }</p>
      </div>
    </div>
    <div class="toolbar">
      <label class="sr-only" for="mfgSearch">Search requests</label>
      <input id="mfgSearch" placeholder="Search requests…">
      <label class="sr-only" for="mfgStage">Stage</label>
      <select id="mfgStage">
        <option value="">All stages</option>
        ${stages.map((s) => `<option value="${s}">${esc(stageName[s])}</option>`).join('')}
      </select>
    </div>
    <div id="mfgGrid" class="grid"></div>
  `;

  const renderGrid = () => {
    const q = $('#mfgSearch').value.trim().toLowerCase();
    const st = $('#mfgStage').value;
    const filtered = list.filter(
      (o) =>
        (!st || o.status === st) &&
        (!q ||
          o.title.toLowerCase().includes(q) ||
          (o.description || '').toLowerCase().includes(q))
    );
    $('#mfgGrid').innerHTML =
      filtered
        .map(
          (o) => `<article class="card">
            <div class="row" style="margin-bottom:10px">
              <span class="badge">${esc(stageName[o.status] || o.status)}</span>
              ${o.demo ? '<span class="badge demo">DEMO</span>' : ''}
              ${o.has_my_offer ? '<span class="badge success">Your offer active</span>' : ''}
            </div>
            <h3>${esc(o.title)}</h3>
            <p>${esc((o.description || '').slice(0, 140))}${(o.description || '').length > 140 ? '…' : ''}</p>
            <div class="card-foot">
              <span class="muted">${o.interest} interested · ${o.reports} reports</span>
              <button type="button" class="secondary" data-mpid="${esc(o.id)}">${mode === 'offer' ? 'Offer to build' : 'Review'}</button>
            </div>
          </article>`
        )
        .join('') || '<div class="empty">No matching requests found.</div>';

    $('#mfgGrid')
      .querySelectorAll('[data-mpid]')
      .forEach((b) => (b.onclick = () => go('#/manufacturer/product/' + b.dataset.mpid)));
  };
  renderGrid();
  $('#mfgSearch').oninput = renderGrid;
  $('#mfgStage').onchange = renderGrid;
}

async function manufacturerQuality() {
  if (!maker()) return go('#/home');
  $('#heading').textContent = 'Customer reports & quality decisions';
  const q = await api('/intelligence/quality');

  $('#view').innerHTML = `
    <div class="hero compact">
      <div>
        <h2>Problems customers are reporting</h2>
        <p>Submitted reports are signals that require human review — they are not verified defect rates.</p>
      </div>
    </div>
    <div class="stack">
      <div class="panel">
        <h2>Quality findings requiring human decision (${q.recommendations.length})</h2>
        <div style="margin-top:12px">
          ${
            q.recommendations
              .map(
                (r) => `<div class="list-item">
                  <div class="row" style="justify-content:space-between">
                    <div>
                      <span class="badge ${r.severity === 'high' ? 'danger' : 'demo'}">${esc(r.kind)}</span>
                      ${r.demo ? '<span class="badge demo" style="margin-left:6px">DEMO</span>' : ''}
                      <strong style="margin-left:8px">${esc(r.title)}</strong>
                    </div>
                    <span class="badge muted-badge">${esc(r.status)}</span>
                  </div>
                  <p style="margin-top:8px">${esc(r.evidence)}</p>
                  <p class="field-hint">${esc(r.action)} · ${esc(r.uncertainty)}</p>
                  ${r.decision_note ? `<p><strong>Recorded decision note:</strong> ${esc(r.decision_note)}</p>` : ''}
                  <div class="row" style="margin-top:10px">
                    <button type="button" class="primary" data-rec="${esc(r.id)}">Record improvement decision</button>
                    <button type="button" class="secondary" data-mpid="${esc(r.product_id)}">Open product</button>
                  </div>
                </div>`
              )
              .join('') ||
            '<div class="empty">No quality recommendations yet for products you offered to manufacture.</div>'
          }
        </div>
      </div>

      <div class="panel">
        <h2>Recent customer feedback reports (${q.reports.length})</h2>
        <div style="margin-top:12px">
          ${
            q.reports
              .map(
                (f) => `<div class="list-item">
                  <div class="row" style="justify-content:space-between">
                    <strong>${esc(f.title)} ${f.demo ? '(DEMO)' : ''}</strong>
                    <span class="badge muted-badge">${esc(f.kind)} · v${esc(f.version)} · ${f.rating}/5</span>
                  </div>
                  <p style="margin-top:6px">${esc(f.details)}</p>
                </div>`
              )
              .join('') ||
            '<p class="muted">No customer feedback reports on your products yet.</p>'
          }
        </div>
      </div>
    </div>
  `;

  $('#view')
    .querySelectorAll('[data-rec]')
    .forEach((b) => (b.onclick = () => decisionModal(b.dataset.rec)));
  $('#view')
    .querySelectorAll('[data-mpid]')
    .forEach((b) => (b.onclick = () => go('#/manufacturer/product/' + b.dataset.mpid)));
}

function decisionModal(recId) {
  modal(`
    <h2 id="modalTitle">Record improvement decision</h2>
    <p>A human reviewer must evaluate the evidence and explain the chosen action.</p>
    <form class="stack" id="decisionForm" novalidate>
      <label>Decision <span class="req">(Required)</span>
        <select name="status">
          <option value="investigating">Investigate further</option>
          <option value="accepted">Accept and revise design</option>
          <option value="paused">Pause product availability</option>
          <option value="retired">Consider discontinuing</option>
          <option value="rejected">Dismiss with explanation</option>
        </select>
      </label>
      <label>Reason and next steps <span class="req">(Required)</span>
        <textarea name="note" maxlength="1000" placeholder="Example: Confirmed standby power draw issue on batch 1.0; revising power IC firmware."></textarea>
        <span class="field-error" data-err="note"></span>
      </label>
      <button type="submit" class="primary">Save decision</button>
    </form>
  `);

  $('#decisionForm').onsubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    f.querySelector('[data-err="note"]').textContent = '';
    if (!f.note.value.trim()) {
      f.querySelector('[data-err="note"]').textContent = 'Enter a reason for this decision.';
      return;
    }
    loading(
      e.submitter,
      async () => {
        try {
          await api('/recommendations/' + recId + '/decision', 'POST', {
            status: f.status.value,
            note: f.note.value.trim(),
          });
          closeModal();
          notice('Quality decision recorded.', 'success');
          await manufacturerQuality();
        } catch (err) {
          modalNotice(err.message, 'error');
        }
      },
      'Saving…'
    );
  };
}

async function manufacturerProducts() {
  if (!maker()) return go('#/home');
  $('#heading').textContent = 'My Products & Offers';
  const x = await api('/manufacturer/my-products');
  $('#view').innerHTML = `
    <div class="row page-actions">
      <button type="button" class="primary" id="mpOfferNewBtn">Offer to manufacture a product</button>
      <button type="button" class="secondary" id="mpViewOrdersBtn">View orders</button>
    </div>
    <div class="grid">
      ${
        x.products
          .map(
            (p) => `<article class="card">
              <div class="row" style="margin-bottom:10px">
                <span class="badge">${esc(stageName[p.status] || p.status)}</span>
                ${p.demo ? '<span class="badge demo">DEMO</span>' : ''}
                <span class="badge ${p.eligible && !p.demo && p.status !== 'retirement' ? 'success' : 'muted-badge'}">${
                  p.eligible && !p.demo && p.status !== 'retirement'
                    ? 'Checkout enabled'
                    : 'Proposal only'
                }</span>
              </div>
              <h3>${esc(p.title)}</h3>
              <p><strong>${esc(p.currency)} ${Number(p.price).toFixed(2)}</strong> · Min qty ${p.minimum_quantity}<br>${esc((p.terms || '').slice(0, 100))}</p>
              <div class="card-foot">
                <button type="button" class="secondary" data-mpid="${esc(p.id)}">Manage offer &amp; stages</button>
              </div>
            </article>`
          )
          .join('') ||
        '<div class="empty" style="grid-column:1/-1">You have not published any offers yet. Browse customer demand to propose your first build.</div>'
      }
    </div>
  `;
  $('#mpOfferNewBtn').onclick = () => go('#/manufacturer/offer');
  $('#mpViewOrdersBtn').onclick = () => go('#/orders');
  $('#view')
    .querySelectorAll('[data-mpid]')
    .forEach((b) => (b.onclick = () => go('#/manufacturer/product/' + b.dataset.mpid)));
}

async function manufacturerProduct(id) {
  if (!maker()) return go('#/home');
  const x = await api('/products/' + id);
  const p = x.product;
  $('#heading').textContent = p.title;
  const spec = safeParseJson(p.intelligence);
  const myOffers = x.offers.filter((o) => o.manufacturer_id === user.id);
  const canTransition =
    user.role === 'administrator' || myOffers.length > 0;
  const availableNext = nextStages[p.status] || [];
  let offerStep = 1;
  const offerDraft = {
    price: '',
    currency: 'USD',
    minimum_quantity: 1,
    terms: '',
    eligible: false,
  };

  $('#view').innerHTML = `
    <div class="row page-actions">
      <button type="button" class="secondary" id="backDemandBtn">← Customer Demand</button>
      <button type="button" class="secondary" id="backMyMfgBtn">My Products</button>
    </div>

    <div class="product-layout">
      <div class="stack">
        <div class="panel">
          <div class="row" style="margin-bottom:10px">
            <span class="badge">${esc(stageName[p.status] || p.status)}</span>
            ${p.demo ? '<span class="badge demo">DEMO</span>' : ''}
          </div>
          <h2>${esc(p.title)}</h2>
          <p style="white-space:pre-line">${esc(p.description)}</p>
          <p class="muted" style="margin-top:8px">${x.support.reduce((n, v) => n + v.count, 0)} people interested · ${x.feedback.length} customer reports</p>
          ${spec ? specEditorHtml(spec, false) : ''}
        </div>

        <div class="panel">
          <h2>Offer to manufacture</h2>
          <p class="field-hint" style="margin-bottom:12px">A proposal shares your estimated pricing and terms. Enabling Sandbox checkout makes an eligible non-DEMO offer purchasable by verified consumers.</p>
          ${
            p.status === 'retirement'
              ? '<div class="callout warn">This product is discontinued. New offers cannot be published.</div>'
              : '<div id="offerWizardBox"></div>'
          }
        </div>
      </div>

      <div class="stack">
        <div class="panel">
          <h2>Update production stage</h2>
          <p class="field-hint" style="margin-bottom:12px">Current stage: <strong>${esc(stageName[p.status] || p.status)}</strong></p>
          ${
            !canTransition
              ? '<div class="callout info">Publish a manufacturer offer for this product first before recording production stage milestones.</div>'
              : !availableNext.length
                ? '<p class="muted">No further stage transitions are available from Discontinued.</p>'
                : `<form class="stack" id="transitionForm" novalidate>
                    <label>Next valid stage <span class="req">(Required)</span>
                      <select name="status">
                        ${availableNext.map((s) => `<option value="${s}">${esc(stageName[s])}</option>`).join('')}
                      </select>
                    </label>
                    <label>Milestone note <span class="req">(Required)</span>
                      <textarea name="note" maxlength="1000" placeholder="Example: Completed initial PCB prototype and bench testing."></textarea>
                      <span class="field-error" data-err="note"></span>
                    </label>
                    <button type="submit" class="primary">Save stage update</button>
                  </form>`
          }
        </div>

        <div class="panel">
          <h2>Published offers (${x.offers.length})</h2>
          ${
            x.offers
              .map((o) => {
                const mine = o.manufacturer_id === user.id || user.role === 'administrator';
                const canEnable = !p.demo && !p.id.startsWith('demo-') && p.status !== 'retirement';
                return `<div class="list-item">
                  <div class="row" style="justify-content:space-between">
                    <strong>${esc(o.manufacturer)}</strong>
                    <span class="badge ${o.eligible && canEnable ? 'success' : 'muted-badge'}">${
                      o.eligible && canEnable ? 'Checkout enabled' : 'Proposal only'
                    }</span>
                  </div>
                  <p style="margin-top:6px"><strong>${esc(o.currency)} ${Number(o.price).toFixed(2)}</strong> · Min qty ${o.minimum_quantity}</p>
                  <p>${esc(o.terms)}</p>
                  ${
                    mine && canEnable
                      ? `<button type="button" class="secondary" data-toggle-offer="${esc(o.id)}" data-next-eligible="${o.eligible ? '0' : '1'}">${
                          o.eligible ? 'Set to proposal only' : 'Enable Sandbox checkout'
                        }</button>`
                      : !canEnable
                        ? '<span class="field-hint">Checkout cannot be enabled on DEMO or discontinued products.</span>'
                        : ''
                  }
                </div>`;
              })
              .join('') || '<p class="muted">No offers published yet.</p>'
          }
        </div>

        <div class="panel">
          <h2>Customer reports (${x.feedback.length})</h2>
          ${
            x.feedback
              .slice(0, 6)
              .map(
                (f) => `<div class="list-item">
                  <strong>${esc(f.kind)} · v${esc(f.version)} · ${f.rating}/5</strong>
                  <p style="margin-top:4px">${esc(f.details)}</p>
                </div>`
              )
              .join('') || '<p class="muted">No customer reports yet.</p>'
          }
        </div>
      </div>
    </div>
  `;

  $('#backDemandBtn').onclick = () => go('#/manufacturer/demand');
  $('#backMyMfgBtn').onclick = () => go('#/manufacturer/products');

  const renderOfferStep = () => {
    const box = $('#offerWizardBox');
    if (!box) return;
    if (offerStep === 1) {
      box.innerHTML = `
        <form class="stack" id="offerStepForm" novalidate>
          <p class="muted">Step 1 of 3 · Pricing and order minimum</p>
          <label>Unit price <span class="req">(Required)</span>
            <input name="price" type="number" min="0.01" step="0.01" value="${esc(offerDraft.price)}" placeholder="Example: 199.00">
            <span class="field-error" data-err="price"></span>
          </label>
          <label>Currency <span class="req">(Required)</span>
            <select name="currency">
              ${['USD', 'EUR', 'GBP', 'INR']
                .map((c) => `<option value="${c}" ${offerDraft.currency === c ? 'selected' : ''}>${c}</option>`)
                .join('')}
            </select>
          </label>
          <label>Minimum order quantity <span class="req">(Required)</span>
            <input name="minimum_quantity" type="number" min="1" value="${esc(offerDraft.minimum_quantity)}">
            <span class="field-error" data-err="minimum_quantity"></span>
          </label>
          <button type="submit" class="primary">Continue</button>
        </form>`;
      $('#offerStepForm').onsubmit = (e) => {
        e.preventDefault();
        const f = e.target;
        f.querySelectorAll('.field-error').forEach((n) => (n.textContent = ''));
        const price = Number(f.price.value);
        const minQty = Number(f.minimum_quantity.value);
        if (!Number.isFinite(price) || price <= 0) {
          f.querySelector('[data-err="price"]').textContent = 'Enter a valid positive price.';
          return;
        }
        if (!Number.isInteger(minQty) || minQty < 1) {
          f.querySelector('[data-err="minimum_quantity"]').textContent = 'Minimum quantity must be at least 1.';
          return;
        }
        offerDraft.price = price;
        offerDraft.currency = f.currency.value;
        offerDraft.minimum_quantity = minQty;
        offerStep = 2;
        renderOfferStep();
      };
    } else if (offerStep === 2) {
      box.innerHTML = `
        <form class="stack" id="offerStepForm" novalidate>
          <p class="muted">Step 2 of 3 · Fulfillment terms and checkout eligibility</p>
          <label>What will you deliver and when? <span class="req">(Required)</span>
            <textarea name="terms" maxlength="2000" placeholder="Example: Ships in 4 weeks with 1-year warranty and USB-C cable included.">${esc(offerDraft.terms)}</textarea>
            <span class="field-error" data-err="terms"></span>
          </label>
          <label class="checkbox">
            <input type="checkbox" name="eligible" ${offerDraft.eligible ? 'checked' : ''} ${p.demo ? 'disabled' : ''}>
            <span>Allow verified consumers to start PayPal Sandbox checkout now${p.demo ? ' (disabled for DEMO products)' : ''}</span>
          </label>
          <div class="row">
            <button type="button" class="secondary" id="offerBack1">Back</button>
            <button type="submit" class="primary">Review offer</button>
          </div>
        </form>`;
      $('#offerBack1').onclick = () => {
        offerDraft.terms = $('#offerStepForm').terms.value.trim();
        offerDraft.eligible = $('#offerStepForm').eligible.checked;
        offerStep = 1;
        renderOfferStep();
      };
      $('#offerStepForm').onsubmit = (e) => {
        e.preventDefault();
        const f = e.target;
        f.querySelector('[data-err="terms"]').textContent = '';
        if (!f.terms.value.trim()) {
          f.querySelector('[data-err="terms"]').textContent = 'Describe your fulfillment terms.';
          return;
        }
        offerDraft.terms = f.terms.value.trim();
        offerDraft.eligible = !p.demo && f.eligible.checked;
        offerStep = 3;
        renderOfferStep();
      };
    } else {
      box.innerHTML = `
        <p class="muted">Step 3 of 3 · Review and publish offer</p>
        <div class="review">
          <strong>${esc(offerDraft.currency)} ${Number(offerDraft.price).toFixed(2)}</strong> · Min qty ${offerDraft.minimum_quantity}
          <p style="margin-top:8px">${esc(offerDraft.terms)}</p>
          <span class="badge ${offerDraft.eligible ? 'success' : 'muted-badge'}">${
            offerDraft.eligible ? 'PayPal Sandbox checkout enabled' : 'Preliminary proposal only'
          }</span>
        </div>
        <div class="row">
          <button type="button" class="secondary" id="offerBack2">Back</button>
          <button type="button" class="primary" id="publishOfferBtn">Publish offer</button>
        </div>`;
      $('#offerBack2').onclick = () => {
        offerStep = 2;
        renderOfferStep();
      };
      $('#publishOfferBtn').onclick = (e) =>
        loading(
          e.currentTarget,
          async () => {
            try {
              await api('/products/' + id + '/offers', 'POST', offerDraft);
              notice('Manufacturer offer published.', 'success');
              await manufacturerProduct(id);
            } catch (err) {
              notice(err.message, 'error');
            }
          },
          'Publishing…'
        );
    }
  };
  renderOfferStep();

  if ($('#transitionForm')) {
    $('#transitionForm').onsubmit = (e) => {
      e.preventDefault();
      const f = e.target;
      f.querySelector('[data-err="note"]').textContent = '';
      if (!f.note.value.trim()) {
        f.querySelector('[data-err="note"]').textContent = 'Explain what changed at this milestone.';
        return;
      }
      loading(
        e.submitter,
        async () => {
          try {
            await api('/products/' + id + '/transition', 'POST', {
              status: f.status.value,
              note: f.note.value.trim(),
            });
            notice('Production stage updated.', 'success');
            await manufacturerProduct(id);
          } catch (err) {
            notice(err.message, 'error');
          }
        },
        'Saving…'
      );
    };
  }

  $('#view')
    .querySelectorAll('[data-toggle-offer]')
    .forEach((b) => {
      b.onclick = (e) =>
        loading(
          e.currentTarget,
          async () => {
            try {
              await api('/offers/' + b.dataset.toggleOffer, 'PATCH', {
                eligible: b.dataset.nextEligible === '1',
              });
              notice('Offer availability updated.', 'success');
              await manufacturerProduct(id);
            } catch (err) {
              notice(err.message, 'error');
            }
          },
          'Updating…'
        );
    });
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

  nav(activeNavForRoute(path));
  const viewEl = $('#view');
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
