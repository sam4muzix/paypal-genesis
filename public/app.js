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
  return `<svg class="icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
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

function getProductVisual(prod = {}) {
  const hay = `${prod.id || ''} ${prod.title || ''} ${prod.category || ''} ${prod.description || ''}`.toLowerCase();
  const title = prod.title || 'GENESIS Hardware Concept';
  if (hay.includes('audio interface') || hay.includes('recording interface') || hay.includes('demo-a1') || hay.includes('demo-a2') || (hay.includes('creator') && hay.includes('interface'))) {
    return { src: '/assets/products/audio-interface-3d.jpg', isSvg: false, alt: title };
  }
  if (hay.includes('monitor') || hay.includes('display') || hay.includes('screen') || hay.includes('4k') || hay.includes('video')) {
    return { src: '/assets/products/field-monitor.svg', isSvg: true, alt: title };
  }
  if (hay.includes('keyboard') || hay.includes('keycap') || hay.includes('typing')) {
    return { src: '/assets/products/creator-keyboard.svg', isSvg: true, alt: title };
  }
  if (hay.includes('earbud') || hay.includes('headphone') || hay.includes('audio')) {
    return { src: '/assets/products/studio-headphones.svg', isSvg: true, alt: title };
  }
  if (hay.includes('camera') || hay.includes('lens') || hay.includes('photo')) {
    return { src: '/assets/products/camera.svg', isSvg: true, alt: title };
  }
  if (hay.includes('watch') || hay.includes('wearable') || hay.includes('fitness')) {
    return { src: '/assets/products/smartwatch.svg', isSvg: true, alt: title };
  }
  if (hay.includes('laptop') || hay.includes('notebook') || hay.includes('workstation')) {
    return { src: '/assets/products/laptop.svg', isSvg: true, alt: title };
  }
  if (hay.includes('home') || hay.includes('hub') || hay.includes('matter') || hay.includes('appliance')) {
    return { src: '/assets/products/appliance.svg', isSvg: true, alt: title };
  }
  return { src: '/assets/products/hardware-chassis.svg', isSvg: true, alt: title };
}

function renderProductThumb(prod, cls = 'idea-card-thumb') {
  const vis = getProductVisual(prod);
  return `<div class="${cls} ${vis.isSvg ? 'is-svg' : ''}"><img src="${vis.src}" alt="${esc(vis.alt)}" loading="lazy"></div>`;
}

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
    ...(isMaker ? [{ label: 'Manufacturing', hash: '#/manufacturer/demand', icon: 'factory' }] : []),
    { label: 'Intelligence', hash: '#/manufacturer/intelligence', icon: 'sparkles' },
    { label: 'Orders', hash: '#/orders', icon: 'receipt' },
    { label: 'Account', hash: '#/account', icon: 'user' },
  ];

  const currentPath = location.hash.replace(/^#/, '').split('?')[0];
  const isCurrentActive = (item) => {
    if (activePage === item.label) return true;
    if (item.label === 'Home' && (currentPath === '' || currentPath === '/' || currentPath === '/home' || currentPath === '/intro')) return true;
    if (item.label === 'Discover' && (currentPath === '/explore' || currentPath.startsWith('/product/'))) return true;
    if (item.label === 'Create' && (currentPath.startsWith('/request') || currentPath.startsWith('/report'))) return true;
    if (item.label === 'Manufacturing' && (currentPath.startsWith('/manufacturer/demand') || currentPath.startsWith('/manufacturer/offer') || currentPath.startsWith('/manufacturer/products') || currentPath.startsWith('/manufacturer/product/'))) return true;
    if (item.label === 'Intelligence' && (currentPath.startsWith('/manufacturer/intelligence') || currentPath.startsWith('/manufacturer/analytics') || currentPath.startsWith('/manufacturer/quality'))) return true;
    if (item.label === 'Orders' && (currentPath === '/orders' || currentPath === '/my-products')) return true;
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

  const ji = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const arrow = '<svg class="journey-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M14 7l5 5-5 5"/></svg>';
  $('#view').innerHTML = `
    <div class="view-enter">
      <div class="genesis-home-hero">
        <div class="genesis-home-left">
          <span class="stage-kicker">IDEAS &middot; INTELLIGENCE &middot; REAL PRODUCTS</span>
          <h1 class="genesis-hero-title">Products should<br>begin with <span class="cyan-glow">people.</span></h1>
          <p class="genesis-hero-subhead">GENESIS turns product ideas into real products — connecting consumer demand, intelligent specifications, manufacturing, and PayPal-powered checkout.</p>
          <p class="genesis-hero-note">Share what you wish existed. Help improve what already exists. See how manufacturers bring better products to life.</p>
          <div class="genesis-cta-row">
            <button type="button" class="btn-luminous-primary" id="introConsumerBtn">${icon('users')}<span>Continue as Consumer</span>${icon('arrowRight')}</button>
            <button type="button" class="btn-luminous-secondary" id="introManufacturerBtn">${icon('factory')}<span>Explore as Manufacturer</span>${icon('arrowRight')}</button>
            <button type="button" class="btn-luminous-secondary" id="introGetStartedBtn" style="display:none">Get Started</button>
          </div>
          <div class="genesis-entry-meta">
            <span>Hackathon Demo</span>
            <span>&middot;</span>
            <span>No signup required</span>
            <span>&middot;</span>
            <span>PayPal Sandbox only</span>
          </div>
        </div>
        <div class="genesis-home-right">
          <div class="hero-3d-pedestal">
            <img class="genesis-hero-3d-img" src="/assets/genesis-hero-3d.jpg" alt="GENESIS 3D Product Creation Platform: Idea, Intelligence, Demand, Manufacturing, PayPal">
          </div>
        </div>
      </div>
      <div class="genesis-journey-strip">
        <div class="journey-node" id="journeyIdea">
          <div class="journey-circle">${ji('<path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 2Z"/>')}</div>
          <div class="journey-text"><span class="journey-label">Idea</span><span class="journey-sub">Share what you wish existed</span></div>
        </div>${arrow}
        <div class="journey-node" id="journeyIntel">
          <div class="journey-circle">${ji('<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>')}</div>
          <div class="journey-text"><span class="journey-label">Intelligence</span><span class="journey-sub">AI-structured specs</span></div>
        </div>${arrow}
        <div class="journey-node" id="journeyDemand">
          <div class="journey-circle">${ji('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 3-6 6-6s6 2.5 6 6M15 14c3 0 6 2 6 5"/>')}</div>
          <div class="journey-text"><span class="journey-label">Demand</span><span class="journey-sub">Validate consumer intent</span></div>
        </div>${arrow}
        <div class="journey-node" id="journeyBuild">
          <div class="journey-circle">${ji('<path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"/><path d="m3 7 9 5 9-5M12 12v10"/>')}</div>
          <div class="journey-text"><span class="journey-label">Build</span><span class="journey-sub">Manufacturing offers</span></div>
        </div>${arrow}
        <div class="journey-node" id="journeyPay">
          <div class="journey-circle"><svg viewBox="0 0 28 32" width="22" height="24"><path d="M4 2h12c5 0 8 2.5 8 6s-3 6-8 6h-6L7 28H3L4 2Z" fill="#e0f2fe"/><path d="M8 5h11c4 0 7 2.5 7 6s-3 6-8 6h-5l-3 13H6L8 5Z" fill="#2589ff"/></svg></div>
          <div class="journey-text"><span class="journey-label">PayPal</span><span class="journey-sub">Sandbox checkout</span></div>
        </div>
      </div>
      <div class="sr-only">YOU IMAGINE · PEOPLE SUPPORT · MAKERS BUILD</div>
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

async function home() {
  $('#heading').textContent = maker() ? 'Manufacturer Workspace' : 'Consumer Workspace';
  const isMaker = maker();

  let products = [];
  let analytics = null;
  try {
    if (isMaker) {
      analytics = await api('/manufacturer/analytics');
      products = analytics.products || [];
    }
    if (!products.length) {
      const res = await api('/products');
      products = res.products || [];
    }
  } catch {
    products = [];
  }

  if (!products.length) {
    products = [
      { id: 'demo-a1', title: 'Eight-input portable audio interface', category: 'Creator Tools', status: 'prototype', supporters: 2, interest: 2, description: 'Mobile creators request eight discrete XLR/TRS combo preamps, 24-bit/192 kHz conversion DSP, and dual USB-C bus power.', demo: 1 }
    ];
  }

  let selectedId = products[0].id;
  let activeTab = 'overview';

  const seenTitles = new Set();
  const distinctProducts = [];
  for (const p of products) {
    const key = (p.title || '').trim().toLowerCase();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      distinctProducts.push(p);
    }
  }
  const showcaseProducts = distinctProducts.length >= 3 ? distinctProducts : products;

  if (isMaker) {
    const renderMaker = () => {
      const active = products.find((p) => p.id === selectedId) || products[0];
      const vis = getProductVisual(active);
      const specObj = safeParseJson(active.spec || active.intelligence);
      const reqs = specObj?.requirements || [
        '8 × XLR/TRS discrete low-noise combo preamps with tactile gain knobs',
        '24-bit / 192 kHz high-headroom AD/DA conversion DSP',
        'Dual USB-C bus power architecture with ultra-low host latency',
        'CNC-machined matte aluminum chassis ($249 consumer target retail)'
      ];
      const stIdx = ['idea', 'clarifying', 'demand'].includes(active.status) ? 0
        : ['prototype', 'tooling'].includes(active.status) ? 1
        : active.has_my_offer || active.has_eligible_offer ? 2 : 1;
      const sigCount = Number(active.interest ?? active.supporters ?? 0);
      const repCount = Number(active.reports || 0);
      const offerState = active.has_my_offer ? 'My Offer' : (active.has_eligible_offer ? 'Active Offer' : 'Open');
      const maxBarSig = Math.max(1, ...showcaseProducts.slice(0, 6).map((x) => Number(x.interest ?? x.supporters ?? 0)));

      $('#view').innerHTML = `
        <div class="mfg-stage-layout view-enter">
          <div class="mfg-main-col">
            <div class="mfg-hero-panel">
              <div class="mfg-context-header">
                <div>
                  <span class="stage-kicker">GENESIS MANUFACTURING</span>
                  <h2 style="margin:0;font-size:clamp(26px,2.8vw,34px);font-weight:800;color:#fff">Product Opportunity</h2>
                  <p style="margin:4px 0 0;font-size:13.5px;color:var(--text-secondary)">Turn verified consumer demand into a real product.</p>
                </div>
                <div class="mfg-switcher-pills">
                  ${showcaseProducts.slice(0, 4).map((p) => `
                    <button type="button" class="mfg-opp-chip ${p.id === active.id ? 'active' : ''}" data-pick-opp="${esc(p.id)}">${esc((p.title || '').slice(0, 24))}${(p.title || '').length > 24 ? '…' : ''}</button>
                  `).join('')}
                </div>
              </div>

              <div class="mfg-hero-split">
                <div>
                  <h3 class="mfg-product-title">${esc(active.title)}</h3>
                  <p class="mfg-product-desc">${esc((active.description || 'Verified consumer demand signal ready for engineering specification and production offer.').slice(0, 190))}</p>
                  <div class="mfg-tag-row">
                    <span class="mfg-tag-pill">${esc(active.category || 'Creator Tools')}</span>
                    <span class="mfg-tag-pill">${esc(stageName[active.status] || active.status || 'Prototype')}</span>
                    <span class="mfg-tag-pill">${active.demo ? 'Demo Record' : 'Live D1 Signal'}</span>
                  </div>
                </div>
                <div class="visual-halo ${vis.isSvg ? 'is-svg' : ''}" style="min-height:200px">
                  <img src="${vis.src}" alt="${esc(vis.alt)}">
                </div>
              </div>

              <div class="milestone-steps-row" style="padding:6px 0">
                ${[
                  ['Interest', 'Validated demand'],
                  ['Requirements', 'AI-structured specs'],
                  ['Offer', 'Manufacturing offer'],
                  ['Build', 'Move to production']
                ].map(([lbl, sub], i) => `
                  <div class="milestone-step ${i < stIdx ? 'done' : i === stIdx ? 'current' : ''}">
                    <div class="milestone-dot">${i < stIdx ? '✓' : i + 1}</div>
                    <span>${lbl}</span>
                    <small style="font-size:10.5px;color:var(--text-muted)">${sub}</small>
                  </div>
                `).join('')}
              </div>

              <div class="mfg-metrics-strip">
                <div class="mfg-metric-cell">
                  <strong>${sigCount}</strong>
                  <span>Interested consumers (D1)</span>
                </div>
                <div class="mfg-metric-cell">
                  <strong>${repCount}</strong>
                  <span>Quality reports (D1)</span>
                </div>
                <div class="mfg-metric-cell">
                  <strong>${esc(offerState)}</strong>
                  <span>Manufacturing offer</span>
                </div>
                <div class="mini-bars" aria-hidden="true">
                  ${showcaseProducts.slice(0, 6).map((x) => {
                    const h = Math.max(18, Math.round((Number(x.interest ?? x.supporters ?? 0) / maxBarSig) * 100));
                    return `<i style="height:${h}%"></i>`;
                  }).join('')}
                </div>
              </div>

              <div class="mfg-hero-actions">
                <button type="button" class="btn-luminous-primary" onclick="go('#/manufacturer/product/${esc(active.id)}')">
                  <span>Create offer</span>${icon('arrowRight')}
                </button>
                <button type="button" class="btn-luminous-secondary" id="mfgStudioCanvasBtn">
                  ${icon('chart')}<span>View intelligence</span>
                </button>
                <button type="button" class="btn-luminous-secondary" data-action="improve">
                  <span>Quality reports</span>
                </button>
              </div>
            </div>
          </div>

          <aside class="mfg-dossier-panel">
            <div class="inspector-header">
              <h3>${icon('document')}<span>Product requirements</span></h3>
              <span class="inspector-stage-pill">${esc(stageName[active.status] || 'Prototype')}</span>
            </div>

            <div class="dossier-tabs">
              ${['overview', 'specifications', 'demand', 'notes'].map((t) => `
                <button type="button" class="dossier-tab ${activeTab === t ? 'active' : ''}" data-dossier-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</button>
              `).join('')}
            </div>

            <div class="dossier-spec-rows">
              ${activeTab === 'overview' ? `
                <div class="dossier-spec-row"><span class="spec-key">Category</span><span class="spec-val">${esc(active.category || 'Creator Tools')}</span></div>
                <div class="dossier-spec-row"><span class="spec-key">Architecture</span><span class="spec-val">${esc(reqs[0] || 'Modular low-noise chassis')}</span></div>
                <div class="dossier-spec-row"><span class="spec-key">Performance</span><span class="spec-val">${esc(reqs[1] || 'High-efficiency conversion & thermal control')}</span></div>
                <div class="dossier-spec-row"><span class="spec-key">Connectivity</span><span class="spec-val">${esc(reqs[2] || 'Dual USB-C & wireless control')}</span></div>
                <div class="dossier-spec-row"><span class="spec-key">Target price</span><span class="spec-val">$${Number(active.target_price || 249)} (consumer retail)</span></div>
              ` : activeTab === 'specifications' ? reqs.slice(0, 5).map((r, idx) => `
                <div class="dossier-spec-row"><span class="spec-key">Spec #${idx + 1}</span><span class="spec-val">${esc(r)}</span></div>
              `).join('') : activeTab === 'demand' ? `
                <div class="dossier-spec-row"><span class="spec-key">Stored Signals</span><span class="spec-val">${sigCount} database-backed consumer intents</span></div>
                <div class="dossier-spec-row"><span class="spec-key">Quality Reports</span><span class="spec-val">${Number(active.reports || 0)} field feedback items</span></div>
                <div class="dossier-spec-row"><span class="spec-key">Offer Status</span><span class="spec-val">${active.has_my_offer ? 'Your offer active' : (active.has_eligible_offer ? 'Eligible offer exists' : 'Open opportunity')}</span></div>
              ` : `
                <div class="dossier-spec-row"><span class="spec-key">Scenario</span><span class="spec-val">${active.demo ? 'Preseeded demo fixture (' + esc(active.id) + ')' : 'Live community submission'}</span></div>
                <div class="dossier-spec-row"><span class="spec-key">Settlement</span><span class="spec-val">PayPal Sandbox REST API v2 escrow milestones</span></div>
              `}
            </div>

            <div class="ai-studio-banner-box" id="mfgStudioCard">
              ${icon('sparkles')}
              <div>
                <strong style="display:block;color:#fff;font-size:13.5px">AI Specification Studio</strong>
                <span style="font-size:12px;color:var(--text-secondary)">Editable, structured product specification &amp; AG Studio demand intelligence.</span>
              </div>
            </div>

            <div class="inspector-action-box">
              <button type="button" class="btn-inspector-action" onclick="go('#/manufacturer/product/${esc(active.id)}')">
                <span>+ Submit Batch Production Offer</span>
              </button>
              <button type="button" class="btn-inspector-sub" onclick="go('#/product/${esc(active.id)}')">
                <span>Inspect Full Specification</span>
              </button>
            </div>
          </aside>
        </div>
      `;

      document.querySelectorAll('[data-pick-opp]').forEach((b) => {
        b.onclick = () => { selectedId = b.dataset.pickOpp; renderMaker(); };
      });
      document.querySelectorAll('[data-dossier-tab]').forEach((b) => {
        b.onclick = () => { activeTab = b.dataset.dossierTab; renderMaker(); };
      });
      if ($('#mfgStudioCanvasBtn')) $('#mfgStudioCanvasBtn').onclick = () => go('#/manufacturer/intelligence');
      if ($('#mfgStudioCard')) $('#mfgStudioCard').onclick = () => go('#/manufacturer/intelligence');
      bindHomeActions();
    };
    renderMaker();
    return;
  }

  // Consumer Home (02-consumer-home.png)
  const renderConsumer = () => {
    const featured = products.find((p) => p.id === selectedId) || products[0];
    const vis = getProductVisual(featured);
    const stepMap = { idea: 0, clarifying: 1, demand: 2, tooling: 2, prototype: 3, active: 3, funded: 4 };
    const jStep = stepMap[featured.status] ?? 2;
    const ji = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const arrow = '<svg class="journey-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M14 7l5 5-5 5"/></svg>';

    $('#view').innerHTML = `
      <div class="consumer-stage view-enter">
        <div class="consumer-hero-grid">
          <div>
            <span class="stage-kicker">GENESIS INVENTION STUDIO</span>
            <h2 class="consumer-hero-title">Turn <span class="cyan-glow">your ideas</span><br>into real products.</h2>
            <p class="consumer-hero-sub">A consumer-led innovation platform that turns real needs into manufacturable products, with AI specifications, community demand, and PayPal checkout.</p>
            <div class="genesis-cta-row">
              <button type="button" class="btn-luminous-primary" data-action="request">
                ${icon('lightbulb')}<span>Create an idea</span>${icon('arrowRight')}
              </button>
              <button type="button" class="btn-luminous-secondary" data-action="help">
                <span>How it works</span>
              </button>
            </div>
          </div>

          <div class="consumer-hero-visual">
            <div class="visual-halo ${vis.isSvg ? 'is-svg' : ''}">
              <img src="${vis.src}" alt="${esc(vis.alt)}">
            </div>
          </div>

          <div class="featured-idea-card">
            <span class="featured-pill">Featured Idea</span>
            <h3>${esc(featured.title)}</h3>
            <p>${esc((featured.description || 'Compact community-requested product concept backed by structured engineering requirements.').slice(0, 145))}</p>
            <div class="featured-card-foot">
              <span class="supporter-chip">${icon('users')}<span>${featured.supporters ?? 0} ${Number(featured.supporters) === 1 ? 'supporter' : 'supporters'}</span></span>
              <button type="button" class="circle-arrow-btn" onclick="go('#/product/${esc(featured.id)}')" aria-label="View featured product">${icon('arrowRight')}</button>
            </div>
          </div>
        </div>

        <div class="genesis-journey-strip" style="margin-top:0">
          <div class="journey-node" data-action="request"><div class="journey-circle">${ji('<path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 2Z"/>')}</div><div class="journey-text"><span class="journey-label">Idea</span><span class="journey-sub">Your need or idea</span></div></div>${arrow}
          <div class="journey-node" onclick="go('#/product/${esc(featured.id)}')"><div class="journey-circle">${ji('<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>')}</div><div class="journey-text"><span class="journey-label">Intelligence</span><span class="journey-sub">Structured specifications</span></div></div>${arrow}
          <div class="journey-node" data-action="explore"><div class="journey-circle">${ji('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 3-6 6-6s6 2.5 6 6M15 14c3 0 6 2 6 5"/>')}</div><div class="journey-text"><span class="journey-label">Demand</span><span class="journey-sub">Community interest</span></div></div>${arrow}
          <div class="journey-node" onclick="go('#/product/${esc(featured.id)}')"><div class="journey-circle">${ji('<path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"/><path d="m3 7 9 5 9-5M12 12v10"/>')}</div><div class="journey-text"><span class="journey-label">Build</span><span class="journey-sub">Manufacturing &amp; offers</span></div></div>${arrow}
          <div class="journey-node" data-action="orders"><div class="journey-circle"><svg viewBox="0 0 28 32" width="22" height="24"><path d="M4 2h12c5 0 8 2.5 8 6s-3 6-8 6h-6L7 28H3L4 2Z" fill="#e0f2fe"/><path d="M8 5h11c4 0 7 2.5 7 6s-3 6-8 6h-5l-3 13H6L8 5Z" fill="#2589ff"/></svg></div><div class="journey-text"><span class="journey-label">PayPal</span><span class="journey-sub">Purchase with confidence</span></div></div>
        </div>

        <div class="section-header-row">
          <div>
            <h2>Discover Product Ideas</h2>
            <p>Explore what the community is creating and supporting.</p>
          </div>
          <button type="button" class="btn-luminous-secondary sm" data-action="explore">View all ideas ${icon('arrowRight')}</button>
        </div>

        <div class="discover-cards-grid">
          ${showcaseProducts.slice(0, 3).map((p) => {
            const stLbl = stageName[p.status] || p.status || 'Idea';
            return `
              <div class="idea-glass-card ${p.id === featured.id ? 'is-highlighted' : ''}" data-select-card="${esc(p.id)}">
                ${renderProductThumb(p)}
                <div class="idea-card-body">
                  <div class="idea-card-top">
                    <h4>${esc(p.title)}</h4>
                    <button type="button" class="heart-btn ${p.supported ? 'supported' : ''}" data-open-pid="${esc(p.id)}" title="Open product">♥</button>
                  </div>
                  <div class="idea-card-sub">${esc(p.category || 'Hardware')} · ${p.supporters ?? 0} ${Number(p.supporters) === 1 ? 'supporter' : 'supporters'}</div>
                  <div class="row" style="gap:6px;margin-top:6px">
                    <span class="pill" style="font-size:11px;padding:3px 9px">${esc(stLbl)}</span>
                    ${p.demo ? '<span class="badge muted-badge" style="font-size:10.5px;padding:3px 8px">Demo</span>' : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="section-header-row">
          <div>
            <h2>Your Idea Journey</h2>
            <p>Track the progress of product ideas from concept to purchase.</p>
          </div>
          <button type="button" class="btn-luminous-secondary sm" data-action="mine">My Products</button>
        </div>

        <div class="journey-tracker-card">
          <div class="tracker-product-mini">
            ${renderProductThumb(featured)}
            <div>
              <strong>${esc(featured.title)}</strong>
              <small>${esc(stageName[featured.status] || featured.status || 'Prototype')} · ${featured.demo ? 'Demo Record' : 'Live Database'}</small>
            </div>
          </div>

          <div class="milestone-steps-row">
            ${['Idea Submitted', 'Specifications', 'Community', 'Manufacturing', 'Purchase'].map((lbl, i) => `
              <div class="milestone-step ${i < jStep ? 'done' : i === jStep ? 'current' : ''}">
                <div class="milestone-dot">${i < jStep ? '✓' : (i === jStep ? '●' : '')}</div>
                <span>${lbl}</span>
              </div>
            `).join('')}
          </div>

          <button type="button" class="btn-luminous-secondary sm" onclick="go('#/product/${esc(featured.id)}')">View Details ${icon('arrowRight')}</button>
        </div>
      </div>
    `;

    document.querySelectorAll('[data-select-card]').forEach((card) => {
      card.onclick = (e) => {
        if (e.target.closest('[data-open-pid]')) {
          go('#/product/' + e.target.closest('[data-open-pid]').dataset.openPid);
          return;
        }
        selectedId = card.dataset.selectCard;
        renderConsumer();
      };
    });
    bindHomeActions();
  };
  renderConsumer();
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
            ${renderProductThumb(featured, 'visual-halo')}
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
  const shortId = (p.id || '').slice(-6);
  const datePart = (p.created_at || '').slice(0, 10) || (p.demo ? 'Demo fixture' : 'Live');
  return `<tr>
    <td>
      <div class="row" style="gap:12px;flex-wrap:nowrap">
        ${renderProductThumb(p)}
        <div class="table-product-cell">
          <strong>${esc(p.title)}</strong>
          <small>#${esc(shortId)} · ${esc(datePart)}${p.demo ? ' · Demo' : ''} — ${esc((p.description || '').slice(0, 68))}${(p.description || '').length > 68 ? '…' : ''}</small>
        </div>
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
            ${renderProductThumb(featured, 'visual-halo')}
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

          <div class="inspector-selected-product" style="display:flex;gap:12px;align-items:center">
            <div id="dossierThumb">${renderProductThumb(featured)}</div>
            <div style="min-width:0">
              <h4 class="inspector-title" id="dossierTitle">${esc(featured.title)}</h4>
              <span style="font-size:11.5px;color:var(--text-muted)" id="dossierCategory">${esc(featured.category || 'Hardware')} · ${featured.supporters || 0} Backers · #${esc((featured.id || '').slice(-6))}</span>
            </div>
          </div>
          <p id="dossierDesc" style="margin:0 0 12px;font-size:12px;color:var(--text-secondary);line-height:1.45">${esc((featured.description || '').slice(0, 140))}</p>

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
    $('#dossierThumb').innerHTML = renderProductThumb(p);
    $('#dossierTitle').textContent = p.title;
    $('#dossierCategory').textContent = (p.category || 'Hardware') + ' · ' + (p.supporters || 0) + ' Backers · #' + (p.id || '').slice(-6);
    if ($('#dossierDesc')) $('#dossierDesc').textContent = (p.description || '').slice(0, 140);
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

  const steps = ['Idea', 'Requirements', 'Review', 'Publish'];
  const previewIdea = draft.title || draft.idea || 'Describe a portable hardware tool, smart home device, or creator product';
  const initVis = getProductVisual({ title: draft.title || draft.idea || '', category: draft.category || '' });

  $('#view').innerHTML = `
    <div class="create-stage-wrap view-enter">
      <div class="create-header">
        <span class="stage-kicker">CREATE PRODUCT</span>
        <h2>Bring your product idea to life.</h2>
        <p>Describe what you need. GENESIS turns your idea into a structured, manufacturable product with community demand and PayPal.</p>
      </div>

      <div class="create-stepper">
        ${steps.map((s, i) => `
          <div class="step-node ${i + 1 < step ? 'done' : i + 1 === step ? 'current' : ''}">
            <div class="step-bubble">${i + 1 < step ? '✓' : i + 1}</div>
            <span>${s}</span>
          </div>
        `).join('')}
      </div>

      <div class="create-stage-layout">
        <div class="create-form-card" id="wizardBody"></div>

        <div class="create-preview-col">
          <div class="create-preview-stage" id="createPreviewStage">
            <img id="createPreviewImg" src="${initVis.src}" alt="${esc(initVis.alt)}">
          </div>

          <div class="concept-preview-bar">
            <div class="concept-bar-left">
              <div class="concept-icon-box">${icon('sparkles')}</div>
              <div style="min-width:0">
                <strong>Product Concept Preview</strong>
                <span id="createPreviewCaption">${esc(previewIdea.slice(0, 56))}</span>
              </div>
            </div>
            <span class="concept-pill" id="createPreviewCat">${esc(draft.category || 'Concept')}</span>
          </div>

          ${step === 1 ? `
            <div class="create-actions-row">
              <button type="button" class="btn-luminous-secondary" id="saveDraftBtn">${icon('document')}<span>Save draft</span></button>
              <button type="button" class="btn-cyan-continue" id="continueFromPreviewBtn"><span>Continue</span>${icon('arrowRight')}</button>
            </div>
          ` : ''}
        </div>
      </div>
    </div>`;

  const box = $('#wizardBody');

  if (step === 1) {
    const audienceChoices = ['Content Creators', 'Musicians', 'Podcasters', 'Small Studios', 'Everyday Users'];
    const selectedAudience = draft.audience || 'Content Creators';
    const catList = ['Creator Tools', 'Audio & Music', 'Video & Imaging', 'Home & Smart IoT', 'Wearables', 'Computing', 'Other'];

    box.innerHTML = `
      <form class="stack" id="stepForm" novalidate>
        <div class="form-field-block">
          <div class="form-field-head">
            <span class="head-left">${icon('lightbulb')}<span>Your Product Idea <span class="req">*</span></span></span>
            <span class="char-counter" id="ideaCounter">${(draft.idea || '').length} / 3000</span>
          </div>
          <textarea name="idea" id="ideaTextarea" maxlength="3000" placeholder="Example: A portable hardware audio interface, 4K field monitor, or modular travel charger...">${esc(draft.idea || '')}</textarea>
          <span class="field-error" data-err="idea"></span>
        </div>

        <div class="form-two-col">
          <div class="form-field-block" style="margin-bottom:0">
            <div class="form-field-head"><span class="head-left">${icon('compass')}<span>Category</span></span></div>
            <select name="category" id="catSelect">
              <option value="">Select category…</option>
              ${catList.map((c) => `<option value="${esc(c)}" ${draft.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            </select>
          </div>
          <div class="form-field-block" style="margin-bottom:0">
            <div class="form-field-head"><span class="head-left"><span>Target Price (USD)</span></span></div>
            <input name="budget" id="budgetInput" maxlength="100" value="${esc(draft.budget || '')}" placeholder="$249">
          </div>
        </div>

        <div class="form-field-block" style="margin-top:6px">
          <div class="form-field-head"><span class="head-left">${icon('users')}<span>Who is it for?</span></span></div>
          <div class="audience-pills" id="audiencePills">
            ${audienceChoices.map((a) => `<button type="button" class="audience-pill ${selectedAudience === a ? 'active' : ''}" data-aud="${esc(a)}">${esc(a)}</button>`).join('')}
          </div>
        </div>

        <div class="form-field-block" style="margin-bottom:6px">
          <div class="form-field-head">
            <span class="head-left"><span>What problem does it solve?</span></span>
            <span class="char-counter" id="useCounter">${(draft.use || '').length} / 1000</span>
          </div>
          <textarea name="use" id="useTextarea" style="min-height:86px" maxlength="1000" placeholder="Explain what frustrates users today and how this product solves it.">${esc(draft.use || '')}</textarea>
        </div>

        <div class="row" style="justify-content:space-between;margin-top:4px">
          <button type="button" class="secondary" id="cancelWizard">Cancel</button>
          <button type="submit" class="sr-only" id="step1SubmitBtn">Continue</button>
        </div>
      </form>`;

    const updatePreview = () => {
      const ideaVal = ($('#ideaTextarea')?.value || '').trim();
      const catVal = $('#catSelect')?.value || '';
      const useVal = ($('#useTextarea')?.value || '').trim();
      if ($('#ideaCounter')) $('#ideaCounter').textContent = `${($('#ideaTextarea')?.value || '').length} / 3000`;
      if ($('#useCounter')) $('#useCounter').textContent = `${($('#useTextarea')?.value || '').length} / 1000`;
      const vis = getProductVisual({ title: ideaVal || draft.title || '', category: catVal });
      if ($('#createPreviewImg')) {
        $('#createPreviewImg').src = vis.src;
        $('#createPreviewImg').alt = vis.alt;
      }
      if ($('#createPreviewCaption')) $('#createPreviewCaption').textContent = (ideaVal || useVal || 'Describe your hardware concept').slice(0, 56);
      if ($('#createPreviewCat')) $('#createPreviewCat').textContent = catVal || 'Concept';
    };

    $('#ideaTextarea').oninput = updatePreview;
    $('#catSelect').onchange = updatePreview;
    $('#useTextarea').oninput = updatePreview;
    $('#audiencePills').querySelectorAll('[data-aud]').forEach((b) => {
      b.onclick = () => {
        draft.audience = b.dataset.aud;
        $('#audiencePills').querySelectorAll('[data-aud]').forEach((x) => x.classList.toggle('active', x === b));
      };
    });

    const persistStep1 = () => {
      const form = $('#stepForm');
      const idea = form.idea.value.trim();
      if (draft.idea !== idea) draft.customDescription = false;
      draft.idea = idea;
      draft.category = form.category.value.trim();
      draft.budget = form.budget.value.trim();
      draft.use = form.use.value.trim();
      saveStore('genesis_req_draft', draft);
      return idea;
    };

    $('#cancelWizard').onclick = () => go('#/home');
    if ($('#saveDraftBtn')) {
      $('#saveDraftBtn').onclick = () => {
        persistStep1();
        notice('Product idea draft saved locally.', 'success');
      };
    }
    if ($('#continueFromPreviewBtn')) {
      $('#continueFromPreviewBtn').onclick = () => $('#stepForm').requestSubmit();
    }
    $('#stepForm').onsubmit = (e) => {
      e.preventDefault();
      const idea = persistStep1();
      e.target.querySelector('[data-err="idea"]').textContent = '';
      if (!idea) {
        e.target.querySelector('[data-err="idea"]').textContent = 'Please describe the product idea you want to share.';
        return;
      }
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
        <button type="button" class="btn-luminous-primary" id="ordSignIn">Sign in</button>
      </div>`;
    $('#ordSignIn').onclick = () => {
      pendingAfterAuth = () => go('#/orders');
      auth();
    };
    return;
  }

  const res = isMaker ? await api('/manufacturer/orders') : await api('/orders');
  const orders = res.orders || [];
  let statusFilter = '';

  const renderOrders = () => {
    const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;
    const featuredOrder = orders[0] || null;
    const fTitle = featuredOrder ? (featuredOrder.product_title || featuredOrder.title || 'Hardware Order') : 'Eight-input portable audio interface';
    const fVis = getProductVisual(featuredOrder ? { id: featuredOrder.product_id, title: fTitle, category: featuredOrder.category } : { id: 'demo-a1', title: fTitle, category: 'Audio Hardware' });
    const fAmount = featuredOrder ? Number(featuredOrder.amount || 0).toFixed(2) : '—';
    const fCurr = featuredOrder ? (featuredOrder.currency || 'USD') : 'USD';
    const isCompleted = featuredOrder ? featuredOrder.status === 'COMPLETED' : false;
    const stepIdx = featuredOrder ? (isCompleted ? 2 : (featuredOrder.status === 'APPROVED' ? 1 : 0)) : 0;

    $('#view').innerHTML = `
      <div class="orders-stage-layout view-enter">
        <div class="section-header-row">
          <div>
            <h2 style="font-size:clamp(28px,3vw,36px);margin-bottom:4px">Orders</h2>
            <p>Track your D1 PayPal Sandbox ledger, payment capture status, and manufacturing progress.</p>
          </div>
          <div class="row">
            ${isMaker ? `
              <button type="button" class="btn-luminous-primary sm" id="ordProductsBtn">My Offered Products</button>
            ` : `
              <button type="button" class="btn-luminous-primary sm" id="backMyProductsBtn">Explore Products</button>
            `}
          </div>
        </div>

        ${featuredOrder ? `
        <div class="orders-featured-card">
          <div class="orders-featured-top">
            <div class="visual-halo ${fVis.isSvg ? 'is-svg' : ''}" style="min-height:175px">
              <img src="${fVis.src}" alt="${esc(fVis.alt)}">
            </div>

            <div>
              <span class="featured-pill">Order #${esc((featuredOrder.paypal_order_id || featuredOrder.id).slice(-8))}</span>
              <h3 style="margin:10px 0 6px;font-size:24px;font-weight:800;color:#fff">${esc(fTitle)}</h3>
              <p style="margin:0;font-size:13px;color:var(--text-secondary)">
                Server-verified PayPal Sandbox checkout · Recorded in D1 ledger
              </p>

              <div class="orders-meta-grid">
                <div class="orders-meta-item">
                  <small>Qty</small>
                  <strong>1</strong>
                </div>
                <div class="orders-meta-item">
                  <small>Unit Price</small>
                  <strong>$${fAmount} ${esc(fCurr)}</strong>
                </div>
                <div class="orders-meta-item">
                  <small>Total Paid</small>
                  <strong>$${fAmount}</strong>
                </div>
              </div>
            </div>

            <div class="paypal-sandbox-box">
              <div class="row" style="justify-content:space-between">
                <span style="display:inline-flex;align-items:center;gap:8px;font-weight:700;color:#fff">
                  <svg viewBox="0 0 28 32" width="18" height="20"><path d="M4 2h12c5 0 8 2.5 8 6s-3 6-8 6h-6L7 28H3L4 2Z" fill="#e0f2fe"/><path d="M8 5h11c4 0 7 2.5 7 6s-3 6-8 6h-5l-3 13H6L8 5Z" fill="#2589ff"/></svg>
                  PayPal
                </span>
                <span class="sandbox-pill">Sandbox Verified</span>
              </div>
              <div style="font-size:14px;font-weight:700;color:#67e8f9;margin-top:4px">${esc(paymentLabel[featuredOrder.status] || featuredOrder.status)}</div>
              <div style="font-size:12px;color:var(--text-muted)">
                Ref: ${esc(featuredOrder.paypal_order_id || featuredOrder.id)}
              </div>
            </div>
          </div>

          <div class="milestone-steps-row" style="padding:8px 24px">
            ${[
              ['Order placed', (featuredOrder.created_at || 'Recent').slice(0, 10)],
              ['Payment confirmed', isCompleted ? 'Captured via Orders v2' : 'Awaiting approval/capture'],
              ['In production', isCompleted ? 'Batch milestone active' : 'Queued on completion']
            ].map(([lbl, sub], i) => `
              <div class="milestone-step ${i < stepIdx ? 'done' : i === stepIdx ? 'current' : ''}">
                <div class="milestone-dot">${i <= stepIdx ? '✓' : i + 1}</div>
                <span>${lbl}</span>
                <small style="font-size:11px;color:var(--text-muted)">${esc(sub)}</small>
              </div>
            `).join('')}
          </div>

          <div class="row" style="justify-content:center">
            <button type="button" class="btn-luminous-primary" onclick="go('#/product/${esc(featuredOrder.product_id || 'demo-a1')}')">
              <span>View details</span>${icon('arrowRight')}
            </button>
          </div>
        </div>
        ` : `
        <div class="orders-featured-card">
          <div class="orders-featured-top">
            <div class="visual-halo ${fVis.isSvg ? 'is-svg' : ''}" style="min-height:175px">
              <img src="${fVis.src}" alt="${esc(fVis.alt)}">
            </div>

            <div>
              <span class="sandbox-pill">Sample Workflow Preview · Not a Ledger Record</span>
              <h3 style="margin:10px 0 6px;font-size:24px;font-weight:800;color:#fff">No PayPal Sandbox Orders Recorded Yet</h3>
              <p style="margin:0;font-size:13px;color:var(--text-secondary)">
                This account currently has <strong>0</strong> PayPal Sandbox transactions stored in Cloudflare D1. Explore an eligible non-DEMO manufacturing offer to test real PayPal Orders v2 checkout.
              </p>

              <div class="orders-meta-grid">
                <div class="orders-meta-item">
                  <small>D1 Orders</small>
                  <strong>0</strong>
                </div>
                <div class="orders-meta-item">
                  <small>Checkout Flow</small>
                  <strong>Orders v2</strong>
                </div>
                <div class="orders-meta-item">
                  <small>Ledger Status</small>
                  <strong>Empty</strong>
                </div>
              </div>
            </div>

            <div class="paypal-sandbox-box">
              <div class="row" style="justify-content:space-between">
                <span style="display:inline-flex;align-items:center;gap:8px;font-weight:700;color:#fff">
                  <svg viewBox="0 0 28 32" width="18" height="20"><path d="M4 2h12c5 0 8 2.5 8 6s-3 6-8 6h-6L7 28H3L4 2Z" fill="#e0f2fe"/><path d="M8 5h11c4 0 7 2.5 7 6s-3 6-8 6h-5l-3 13H6L8 5Z" fill="#2589ff"/></svg>
                  PayPal
                </span>
                <span class="sandbox-pill">Sandbox Idle</span>
              </div>
              <div style="font-size:14px;font-weight:700;color:var(--text-secondary);margin-top:4px">Awaiting first checkout</div>
              <div style="font-size:12px;color:var(--text-muted)">
                No simulated or unverified captures shown.
              </div>
            </div>
          </div>

          <div class="row" style="justify-content:center;padding-top:6px">
            <button type="button" class="btn-luminous-primary" onclick="go('#/explore')">
              <span>Browse Manufacturing Offers</span>${icon('arrowRight')}
            </button>
          </div>
        </div>
        `}

        <div class="section-header-row">
          <div>
            <h2>Your Orders</h2>
            <p>${orders.length} ${orders.length === 1 ? 'record' : 'records'} stored in D1 PayPal Sandbox ledger</p>
          </div>
          <select id="ordersStatusFilter" style="width:auto;min-width:170px">
            <option value="">All Orders</option>
            <option value="COMPLETED" ${statusFilter === 'COMPLETED' ? 'selected' : ''}>Completed</option>
            <option value="APPROVED" ${statusFilter === 'APPROVED' ? 'selected' : ''}>Approved</option>
            <option value="CREATED" ${statusFilter === 'CREATED' ? 'selected' : ''}>Created</option>
          </select>
        </div>

        <div class="list">
          ${filtered.map((o) => {
            const title = o.product_title || o.title || 'Hardware Order';
            return `
              <div class="order-row-card">
                <div class="row" style="gap:14px">
                  ${renderProductThumb({ id: o.product_id, title })}
                  <div>
                    <strong style="display:block;color:#fff;font-size:14.5px">${esc(title)}</strong>
                    <small style="color:var(--text-muted)">Ref: ${esc(o.paypal_order_id || o.id)} · ${esc((o.created_at || '').slice(0, 10))}</small>
                  </div>
                </div>
                <span class="${paymentBadgeClass[o.status] || 'badge'}">${esc(paymentLabel[o.status] || o.status)}</span>
                <strong style="color:#fff;font-size:15px">$${Number(o.amount || 0).toFixed(2)} ${esc(o.currency || 'USD')}</strong>
                <div class="row">
                  ${!['COMPLETED', 'CANCELLED', 'FAILED'].includes(o.status) ? `
                    ${o.status === 'APPROVED' ? `<button type="button" class="btn-luminous-primary sm" data-capture="${esc(o.id)}">Capture</button>` : ''}
                    <button type="button" class="btn-luminous-secondary sm" data-reconcile="${esc(o.id)}">Check</button>
                  ` : `<button type="button" class="circle-arrow-btn" onclick="go('#/product/${esc(o.product_id || 'demo-a1')}')" aria-label="View order">${icon('arrowRight')}</button>`}
                </div>
              </div>
            `;
          }).join('') || `
            <div class="order-row-card">
              <div class="row" style="gap:14px">
                ${renderProductThumb({ id: 'demo-a1', title: 'Eight-input portable audio interface' })}
                <div>
                  <strong style="display:block;color:#fff;font-size:14.5px">Empty PayPal Sandbox Ledger</strong>
                  <small style="color:var(--text-muted)">Real Orders v2 transactions completed via an eligible product offer will appear here with captured amounts and refs.</small>
                </div>
              </div>
              <span class="sandbox-pill">0 Recorded</span>
              <span style="color:var(--text-muted);font-size:13px">—</span>
              <button type="button" class="circle-arrow-btn" onclick="go('#/explore')" aria-label="Explore">${icon('arrowRight')}</button>
            </div>
          `}
        </div>
      </div>
    `;

    if ($('#ordProductsBtn')) $('#ordProductsBtn').onclick = () => go('#/manufacturer/products');
    if ($('#backMyProductsBtn')) $('#backMyProductsBtn').onclick = () => go('#/explore');
    if ($('#ordersStatusFilter')) {
      $('#ordersStatusFilter').onchange = (e) => {
        statusFilter = e.target.value;
        renderOrders();
      };
    }

    for (const op of ['capture', 'reconcile', 'cancel']) {
      $('#view').querySelectorAll(`[data-${op}]`).forEach((b) => {
        b.onclick = (e) =>
          loading(
            e.currentTarget,
            async () => {
              try {
                const r = await api('/orders/' + b.dataset[op] + '/' + op, 'POST');
                notice(paymentLabel[r.status] || r.notice || 'Order updated.', r.status === 'COMPLETED' ? 'success' : 'info');
                await ordersPage();
              } catch (err) {
                notice(err.message, 'error');
              }
            },
            op === 'capture' ? 'Capturing…' : 'Checking…'
          );
      });
    }
  };
  renderOrders();
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
  const isMaker = maker();
  $('#heading').textContent = 'Market intelligence';

  let products = [];
  let orders = [];
  let feedback = [];
  let kpis = {};

  if (isMaker) {
    const analytics = await api('/manufacturer/analytics');
    products = (analytics.products || []).map((p) => ({ ...p, interest: Number(p.interest ?? p.supporters ?? 0) }));
    orders = analytics.orders || [];
    feedback = analytics.feedback || [];
    kpis = analytics.kpis || {};
  } else {
    const pub = await api('/products');
    products = (pub.products || []).map((p) => ({ ...p, interest: Number(p.supporters || 0) }));
  }

  let activeProduct = products[0] || { id: 'demo-a1', title: 'Eight-input portable audio interface', category: 'Creator Tools', interest: 2, status: 'prototype' };
  let chartMode = 'interest';
  let catFilter = '';
  let stageFilter = '';
  let demandFilter = '';
  let searchQ = '';
  let isEditMode = false;
  let studioApi = null;
  let showStudio = isMaker;

  const categories = [...new Set(products.map((p) => p.category || 'Creator Tools'))];

  const getFiltered = () =>
    products.filter((p) => {
      if (catFilter && (p.category || 'Creator Tools') !== catFilter) return false;
      if (stageFilter && p.status !== stageFilter) return false;
      if (demandFilter === 'high' && p.interest < 2) return false;
      if (demandFilter === 'open' && p.has_eligible_offer) return false;
      if (searchQ && !(`${p.title || ''} ${p.category || ''}`).toLowerCase().includes(searchQ)) return false;
      return true;
    });

  const renderDonut = (list) => {
    const byCat = {};
    list.forEach((p) => {
      const c = p.category || 'Creator Tools';
      byCat[c] = (byCat[c] || 0) + Math.max(1, Number(p.interest) || 0);
    });
    const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const total = Math.max(1, entries.reduce((s, e) => s + e[1], 0));
    const colors = ['#22d3ee', '#2589ff', '#6366f1', '#94a3b8'];
    let acc = 0;
    const r = 46;
    const circ = 2 * Math.PI * r;
    const segs = entries.map(([cat, val], idx) => {
      const frac = val / total;
      const dash = frac * circ;
      const offset = -acc * circ;
      acc += frac;
      return `<circle cx="64" cy="64" r="${r}" fill="none" stroke="${colors[idx % colors.length]}" stroke-width="18" stroke-dasharray="${dash.toFixed(1)} ${(circ - dash).toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"/>`;
    });
    return {
      svg: `<svg viewBox="0 0 128 128" width="132" height="132" style="transform:rotate(-90deg);flex-shrink:0">${segs.join('')}</svg>`,
      legend: entries.map(([cat, val], idx) => `
        <div class="donut-legend-row" style="cursor:pointer" data-cat-filter="${esc(cat)}">
          <span><i class="donut-dot" style="background:${colors[idx % colors.length]}"></i>${esc(cat)}</span>
          <strong style="color:#fff">${Math.round((val / total) * 100)}%</strong>
        </div>
      `).join('')
    };
  };

  const renderTrendSvg = (list) => {
    const byDate = {};
    list.forEach((p) => {
      const dt = (p.created_at || p.updated_at || 'Undated').slice(0, 10);
      if (!byDate[dt]) byDate[dt] = { date: dt, interest: 0, ideas: 0 };
      byDate[dt].interest += Number(p.interest) || 0;
      byDate[dt].ideas += 1;
    });
    const series = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-6);
    if (!series.length) {
      return '<div style="height:175px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:13px">No dated records in D1.</div>';
    }
    const vals = series.map((d) => (chartMode === 'interest' ? d.interest : d.ideas));
    const maxV = Math.max(1, ...vals);
    const pts = vals.map((v, i) => {
      const x = vals.length === 1 ? 300 : Math.round(36 + (i / (vals.length - 1)) * 528);
      const y = Math.round(138 - (v / maxV) * 102);
      return [x, y, v, series[i].date];
    });
    const dLine = pts.length === 1
      ? `M60,${pts[0][1]} L540,${pts[0][1]}`
      : pts.map((pt, i) => (i === 0 ? `M${pt[0]},${pt[1]}` : `L${pt[0]},${pt[1]}`)).join(' ');
    const dArea = pts.length === 1
      ? `M60,${pts[0][1]} L540,${pts[0][1]} L540,152 L60,152 Z`
      : `${dLine} L${pts[pts.length - 1][0]},152 L${pts[0][0]},152 Z`;
    const last = pts[pts.length - 1];
    return `
      <svg viewBox="0 0 600 176" style="width:100%;height:175px;display:block">
        <defs>
          <linearGradient id="trendAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.34"/>
            <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.0"/>
          </linearGradient>
          <filter id="cyanCurveGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <path d="${dArea}" fill="url(#trendAreaFill)"/>
        <path d="${dLine}" fill="none" stroke="#22d3ee" stroke-width="3" filter="url(#cyanCurveGlow)"/>
        ${pts.map(([x, y, v]) => `
          <circle cx="${x}" cy="${y}" r="4.5" fill="#090d16" stroke="#22d3ee" stroke-width="2.5"/>
          <text x="${x}" y="${Math.max(14, y - 10)}" text-anchor="middle" fill="#cbd5e1" font-size="10.5" font-weight="600" font-family="Inter,sans-serif">${v}</text>
        `).join('')}
        <circle cx="${last[0]}" cy="${last[1]}" r="6" fill="#ffffff" stroke="#22d3ee" stroke-width="3"/>
        ${pts.map(([x, , , dt]) => `<text x="${x}" y="170" text-anchor="middle" fill="#64748b" font-size="11" font-family="Inter,sans-serif">${esc(dt.length === 10 ? dt.slice(5) : dt)}</text>`).join('')}
      </svg>
    `;
  };

  const draw = () => {
    if (studioApi && typeof studioApi.destroy === 'function') {
      try { studioApi.destroy(); } catch {}
      studioApi = null;
    }

    const filtered = getFiltered();
    const donut = renderDonut(filtered.length ? filtered : products);
    const vis = getProductVisual(activeProduct);
    const maxSig = Math.max(1, ...products.map((p) => Number(p.interest) || 0));

    $('#view').innerHTML = `
      <div class="intel-stage-layout view-enter">
        <div class="intel-hero-bar">
          <div class="intel-hero-left">
            <span class="stage-kicker">GENESIS ANALYTICS</span>
            <h2>Market intelligence</h2>
            <p>Turn real consumer demand into clearer manufacturing decisions. Powered by live D1 signals &amp; AG Studio.</p>
            <div class="row" style="margin-top:14px">
              ${isMaker ? `
                <button type="button" class="btn-luminous-primary sm" id="btnAskAiToggle">${icon('sparkles')}<span>Ask GENESIS</span></button>
                <button type="button" class="btn-luminous-secondary sm" id="btnToggleStudioCanvas">${icon('wrench')}<span>${showStudio ? 'Hide AG Studio' : 'Open AG Studio v3.1'}</span></button>
                <button type="button" class="btn-luminous-secondary sm" id="btnExportCsv">Export CSV</button>
              ` : `
                <button type="button" class="btn-luminous-primary sm" id="btnSwitchMakerDemo">${icon('factory')}<span>Switch to Manufacturer Demo for AG Studio</span></button>
              `}
            </div>
          </div>
          <div class="visual-halo ${vis.isSvg ? 'is-svg' : ''}" style="max-width:250px;min-height:150px">
            <img src="${vis.src}" alt="${esc(vis.alt)}">
          </div>
        </div>

        <div class="query-box-wrap" id="queryBoxWrap" style="display:none">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <span style="font-size:13px;font-weight:700;color:#fff;display:flex;align-items:center;gap:6px">${icon('sparkles')} GENESIS Intelligence Assistant</span>
            <span style="font-size:11px;color:var(--text-muted)">Gemini 3.8 Flash · Live D1 Grounded</span>
          </div>
          <div class="query-pills">
            <button type="button" class="query-pill" data-q="Which product ideas have the most customer interest?">Most customer interest</button>
            <button type="button" class="query-pill" data-q="Show products that have interest but no eligible manufacturing offer.">Open opportunities</button>
            <button type="button" class="query-pill" data-q="Show my completed PayPal Sandbox orders.">Completed Sandbox orders</button>
          </div>
          <form id="aiQueryForm" class="query-input-row">
            <input id="aiQueryInput" placeholder="Ask about demand, opportunities, stages, or PayPal Sandbox transactions…" autocomplete="off">
            <button type="submit" class="btn-luminous-primary sm" id="aiQuerySubmit">Ask Assistant</button>
          </form>
          <div id="aiQueryResult" class="query-result-panel" style="display:none"></div>
        </div>

        <div id="studioSectionWrap" style="display:${showStudio && isMaker ? 'block' : 'none'}">
          <div class="intel-card" style="padding:18px">
            <div class="row" style="justify-content:space-between;margin-bottom:14px">
              <div>
                <strong style="font-size:16px;color:#fff">AG Studio v3.1 Embedded Intelligence</strong>
                <p style="margin:2px 0 0;font-size:12px;color:var(--text-muted)">Interactive AG Grid, category charts, cross-filters &amp; PayPal Sandbox ledger</p>
              </div>
              <div class="row">
                <button type="button" class="btn-luminous-secondary sm" id="btnToggleStudioMode"><span id="studioModeLabel">${isEditMode ? 'Lock Dashboard' : 'Customize Dashboard'}</span></button>
                <button type="button" class="btn-luminous-secondary sm" id="btnResetLayout">Reset Layout</button>
                <button type="button" class="btn-luminous-primary sm" id="btnGoOrders">PayPal Orders (${orders.length})</button>
              </div>
            </div>
            <div id="genesisStudioMount" class="studio-embed-shell ag-theme-mode" data-ag-theme-mode="dark-blue"></div>
          </div>
        </div>

        <div class="intel-filter-bar">
          <div class="intel-filter-left">
            <select id="deCatFilter" style="width:auto;min-width:155px">
              <option value="">All Categories</option>
              ${categories.map((c) => `<option value="${esc(c)}" ${catFilter === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            </select>
            <select id="deDemandFilter" style="width:auto;min-width:140px">
              <option value="">Demand: All</option>
              <option value="high" ${demandFilter === 'high' ? 'selected' : ''}>High Intent (2+)</option>
              <option value="open" ${demandFilter === 'open' ? 'selected' : ''}>Open Opportunities</option>
            </select>
            <select id="deStageFilter" style="width:auto;min-width:140px">
              <option value="">Stage: All</option>
              ${stages.map((s) => `<option value="${s}" ${stageFilter === s ? 'selected' : ''}>${esc(stageName[s] || s)}</option>`).join('')}
            </select>
          </div>
          <input id="deSearch" value="${esc(searchQ)}" placeholder="Search product ideas…" style="max-width:260px">
        </div>

        <div class="intel-grid-top">
          <div class="intel-card">
            <div class="row" style="justify-content:space-between;margin-bottom:8px">
              <div>
                <strong style="font-size:15.5px;color:#fff;display:block">Demand trend</strong>
                <span style="font-size:12px;color:var(--text-muted)">Grouped chronologically by verified D1 record dates</span>
              </div>
              <div class="lumina-role-pill">
                <button type="button" class="role-btn ${chartMode === 'interest' ? 'active' : ''}" data-cmode="interest">Interest</button>
                <button type="button" class="role-btn ${chartMode === 'ideas' ? 'active' : ''}" data-cmode="ideas">Ideas</button>
              </div>
            </div>
            ${renderTrendSvg(filtered.length ? filtered : products)}
          </div>

          <div class="key-insight-card">
            <div class="row" style="justify-content:space-between">
              <span style="display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:#67e8f9">${icon('sparkles')} Key insight</span>
              <button type="button" class="circle-arrow-btn" onclick="go('#/product/${esc(activeProduct.id)}')" aria-label="Open product">${icon('arrowRight')}</button>
            </div>
            <div>
              <h3 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#fff;line-height:1.25">Strongest demand: ${esc(activeProduct.title)}</h3>
              <p style="margin:0;font-size:13px;color:#cbd5e1;line-height:1.5">
                Recorded ${activeProduct.interest ?? activeProduct.supporters ?? 0} verified consumer signals in ${esc(activeProduct.category || 'Creator Tools')} (${esc(stageName[activeProduct.status] || activeProduct.status)}).
              </p>
            </div>
            <div style="font-size:11.5px;color:#99f6e4">Database KPIs · ${kpis.customerInterest ?? products.reduce((s, p) => s + (Number(p.interest) || 0), 0)} total signals across ${products.length} products</div>
          </div>
        </div>

        <div class="intel-grid-bottom">
          <div class="intel-card">
            <div class="row" style="justify-content:space-between;margin-bottom:12px">
              <strong style="font-size:15.5px;color:#fff">Product opportunities</strong>
              <span style="font-size:12px;color:var(--text-muted)">${filtered.length} matching records</span>
            </div>
            <table class="lumina-table">
              <thead>
                <tr>
                  <th>Product idea</th>
                  <th>Category</th>
                  <th>Interest</th>
                  <th>Stage</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map((p) => {
                  const pct = Math.min(100, Math.max(14, Math.round(((Number(p.interest) || 1) / maxSig) * 100)));
                  const levelCls = p.interest >= 2 ? 'badge success' : 'badge muted-badge';
                  return `
                    <tr style="cursor:pointer;${p.id === activeProduct.id ? 'background:rgba(37,137,255,0.08)' : ''}" data-row-id="${esc(p.id)}">
                      <td>
                        <div class="row" style="gap:10px;flex-wrap:nowrap">
                          ${renderProductThumb(p, 'idea-card-thumb')}
                          <div>
                            <strong style="color:#fff;display:block">${esc(p.title)}</strong>
                            <small style="color:var(--text-muted);font-size:11px">#${esc((p.id || '').slice(-6))} · ${esc((p.created_at || '').slice(0, 10) || 'D1 record')}</small>
                          </div>
                        </div>
                      </td>
                      <td><span class="pill">${esc(p.category || 'Creator Tools')}</span></td>
                      <td style="min-width:125px">
                        <div class="progress-row">
                          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
                          <span class="progress-pct">${p.interest}</span>
                        </div>
                      </td>
                      <td><span class="${levelCls}">${esc(stageName[p.status] || p.status)}</span></td>
                      <td><button type="button" class="circle-arrow-btn" data-open-id="${esc(p.id)}" aria-label="Open">${icon('arrowRight')}</button></td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="5" style="text-align:center;padding:18px">No matching opportunities.</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="intel-card">
            <strong style="font-size:15.5px;color:#fff;display:block;margin-bottom:4px">Demand by category</strong>
            <span style="font-size:12px;color:var(--text-muted)">Click a slice to cross-filter</span>
            <div class="donut-wrap">
              ${donut.svg}
              <div class="donut-legend">${donut.legend}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event bindings
    if ($('#btnSwitchMakerDemo')) {
      $('#btnSwitchMakerDemo').onclick = async () => {
        try {
          await api('/demo/session', 'POST', { role: 'manufacturer' });
          await refreshMe();
          notice('Switched to Demo Manufacturer perspective.', 'success');
          manufacturerIntelligence();
        } catch (err) { notice(err.message, 'error'); }
      };
    }
    $('#deCatFilter').onchange = (e) => { catFilter = e.target.value; draw(); };
    $('#deDemandFilter').onchange = (e) => { demandFilter = e.target.value; draw(); };
    $('#deStageFilter').onchange = (e) => { stageFilter = e.target.value; draw(); };
    $('#deSearch').oninput = (e) => { searchQ = e.target.value.toLowerCase().trim(); draw(); };

    document.querySelectorAll('[data-cmode]').forEach((b) => {
      b.onclick = () => { chartMode = b.dataset.cmode; draw(); };
    });
    document.querySelectorAll('[data-cat-filter]').forEach((el) => {
      el.onclick = () => { catFilter = catFilter === el.dataset.catFilter ? '' : el.dataset.catFilter; draw(); };
    });
    document.querySelectorAll('[data-row-id]').forEach((row) => {
      row.onclick = (e) => {
        if (e.target.closest('[data-open-id]')) {
          const pid = e.target.closest('[data-open-id]').dataset.openId;
          go(isMaker ? '#/manufacturer/product/' + pid : '#/product/' + pid);
          return;
        }
        const found = products.find((p) => p.id === row.dataset.rowId);
        if (found) { activeProduct = found; draw(); }
      };
    });

    if ($('#btnAskAiToggle')) {
      $('#btnAskAiToggle').onclick = () => {
        const w = $('#queryBoxWrap');
        w.style.display = w.style.display === 'none' ? 'block' : 'none';
        if (w.style.display === 'block') $('#aiQueryInput').focus();
      };
    }

    document.querySelectorAll('.query-pill').forEach((btn) => {
      btn.onclick = () => {
        $('#aiQueryInput').value = btn.dataset.q;
        $('#aiQueryForm').dispatchEvent(new Event('submit', { cancelable: true }));
      };
    });

    if ($('#aiQueryForm')) {
      $('#aiQueryForm').onsubmit = async (e) => {
        e.preventDefault();
        const q = ($('#aiQueryInput')?.value || '').trim();
        if (!q) return;
        const submitBtn = $('#aiQuerySubmit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Analyzing…';
        const resPanel = $('#aiQueryResult');
        resPanel.style.display = 'block';
        resPanel.innerHTML = '<span class="muted">GENESIS Intelligence is reading authorized data…</span>';
        try {
          const res = await api('/intelligence/query', 'POST', { query: q });
          resPanel.innerHTML = `<strong style="color:#67e8f9">Grounded Analysis:</strong><div style="margin-top:4px">${esc(res.answer)}</div>`;
        } catch (err) {
          resPanel.innerHTML = `<span style="color:#fda4af">Analysis notice: ${esc(err.message)}</span>`;
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Ask Assistant';
        }
      };
    }

    if ($('#btnExportCsv')) {
      $('#btnExportCsv').onclick = () => {
        const headers = ['Product', 'Category', 'Interested Consumers', 'Development Stage'];
        const rows = products.map((p) => [
          `"${(p.title || '').replace(/"/g, '""')}"`,
          `"${(p.category || 'General').replace(/"/g, '""')}"`,
          p.interest || 0,
          `"${stageName[p.status] || p.status}"`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', 'genesis_demand_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        notice('Demand Explorer dataset exported to CSV.', 'success');
      };
    }

    const studioLayoutKey = user ? 'genesis_studio_layout_v4_' + user.id : null;

    const extractSavedSpecSummary = (p) => {
      if (!p) return 'No product selected.';
      let raw = p.intelligence || p.spec;
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw); } catch { raw = null; }
      }
      if (!raw || typeof raw !== 'object') {
        return `${p.title} — ${p.description || 'Pending Gemini specification generation.'}`;
      }
      const parts = [];
      if (raw.summary) parts.push(raw.summary);
      if (Array.isArray(raw.capabilities) && raw.capabilities.length) {
        parts.push('Key capabilities: ' + raw.capabilities.slice(0, 3).join(' · '));
      }
      if (Array.isArray(raw.considerations) && raw.considerations.length) {
        parts.push('Build notes: ' + raw.considerations.slice(0, 2).join(' · '));
      }
      return parts.join('\n') || (p.description || p.title);
    };

    const isValidSavedReportState = (st) => {
      if (!st || !Array.isArray(st.pages) || !st.pages.length) return false;
      const pg = st.pages.find((pgItem) => pgItem.id === st.selectedPageId) || st.pages[0];
      return Boolean(pg && pg.widgets && Object.keys(pg.widgets).length > 0);
    };

    const createDefaultReportState = () => ({
      version: '3.1.0',
      selectedPageId: 'genesis-intelligence',
      panels: {
        filters: { collapsed: false, width: 225 },
        edit: { collapsed: false, width: 215 },
        data: { collapsed: true, width: 215 }
      },
      pages: [
        {
          id: 'genesis-intelligence',
          layout: {
            type: 'widget',
            columns: 24,
            rowHeight: 18,
            pagePadding: 12,
            backgroundColor: '#050b16',
            widgetPadding: 10,
            widgetBackgroundColor: '#0b1528',
            widgetBorderEnabled: true,
            widgetBorderRadius: 12,
            widgetBorderColor: '#1e293b',
            widgetBorderWidth: 1
          },
          widgets: {
            kpi_summary: {
              type: 'multi-kpi',
              format: {
                title: { text: 'Customer Demand Totals', enabled: true },
                subtitle: { text: 'Authorized Cloudflare D1 records', enabled: true },
                style: {
                  columns: 3,
                  verticalAlign: 'center',
                  color: '#ffffff',
                  typography: { fontSize: 24, fontWeight: 'bold' },
                  label: { enabled: true, position: 'below', color: '#94a3b8', typography: { fontSize: 11 } }
                }
              },
              dataMapping: {
                values: [
                  { id: 'demand_explorer.title', aggregation: 'count' },
                  { id: 'demand_explorer.interest', aggregation: 'sum' },
                  { id: 'demand_explorer.reports', aggregation: 'sum' }
                ]
              }
            },
            text_requirements: {
              type: 'text',
              format: {
                title: { text: 'Product Requirements (Saved AI Specs)', enabled: true },
                subtitle: { text: 'Updates dynamically from filtered selection', enabled: true },
                style: {
                  padding: true,
                  verticalAlign: 'top',
                  textAlign: 'left',
                  color: '#cbd5e1',
                  typography: { fontSize: 12.5 }
                }
              },
              dataMapping: {
                value: [{ id: 'demand_explorer.spec_summary', aggregation: 'first' }]
              }
            },
            chart_category: {
              type: 'donut-chart',
              format: {
                title: { text: 'Demand by Category', enabled: true },
                subtitle: { text: 'Click a slice to cross-filter', enabled: true },
                style: { theme: { common: { legend: { enabled: true, position: 'bottom' } } } }
              },
              dataMapping: {
                categoryKey: [{ id: 'demand_explorer.category' }],
                valueKey: [{ id: 'demand_explorer.interest', aggregation: 'sum' }]
              }
            },
            chart_opportunities: {
              type: 'column-chart-grouped',
              format: {
                title: { text: 'Product Opportunities', enabled: true },
                subtitle: { text: 'Consumer interest across D1 concepts', enabled: true },
                style: { theme: { common: { legend: { enabled: true, position: 'bottom' } } } }
              },
              dataMapping: {
                categoryKey: [{ id: 'demand_explorer.short_title' }],
                valueKey: [{ id: 'demand_explorer.interest', aggregation: 'sum' }],
                legendKey: [{ id: 'demand_explorer.offer_status' }]
              }
            },
            chart_sandbox_orders: {
              type: 'column-chart-grouped',
              format: {
                title: { text: 'PayPal Sandbox Orders', enabled: true },
                subtitle: { text: 'Captured & active order volume by status', enabled: true },
                style: { theme: { common: { legend: { enabled: false } } } }
              },
              dataMapping: {
                categoryKey: [{ id: 'sandbox_orders.status' }],
                valueKey: [{ id: 'sandbox_orders.amount', aggregation: 'sum' }]
              }
            },
            grid_customer_demand: {
              type: 'grid',
              format: {
                title: { text: 'Customer Demand', enabled: true },
                subtitle: { text: 'Select a row to inspect AI specs or click Action to manage offers', enabled: true },
                style: { columnAutoSize: true, headerRow: { wrapText: false } }
              },
              dataMapping: {
                cols: [
                  { id: 'demand_explorer.title' },
                  { id: 'demand_explorer.category' },
                  { id: 'demand_explorer.interest', aggregation: 'sum' },
                  { id: 'demand_explorer.stage' },
                  { id: 'demand_explorer.action' }
                ]
              }
            },
            grid_sandbox_orders: {
              type: 'grid',
              format: {
                title: { text: 'PayPal Sandbox Ledger', enabled: true },
                subtitle: { text: 'Verified Sandbox Orders v2 records', enabled: true },
                style: { columnAutoSize: true, headerRow: { wrapText: false } }
              },
              dataMapping: {
                cols: [
                  { id: 'sandbox_orders.order_id' },
                  { id: 'sandbox_orders.amount', aggregation: 'sum' },
                  { id: 'sandbox_orders.status' }
                ]
              }
            }
          },
          widgetLayout: {
            kpi_summary: { xTrack: 0, yTrack: 0, xSpan: 10, ySpan: 7 },
            text_requirements: { xTrack: 10, yTrack: 0, xSpan: 14, ySpan: 7 },
            chart_category: { xTrack: 0, yTrack: 7, xSpan: 7, ySpan: 11 },
            chart_opportunities: { xTrack: 7, yTrack: 7, xSpan: 10, ySpan: 11 },
            chart_sandbox_orders: { xTrack: 17, yTrack: 7, xSpan: 7, ySpan: 11 },
            grid_customer_demand: { xTrack: 0, yTrack: 18, xSpan: 16, ySpan: 13 },
            grid_sandbox_orders: { xTrack: 16, yTrack: 18, xSpan: 8, ySpan: 13 }
          },
          filter: {
            page: [
              { field: { id: 'demand_explorer.category' }, view: { expanded: true, viewTypeId: 'selection' } },
              { field: { id: 'demand_explorer.stage' }, view: { expanded: true, viewTypeId: 'selection' } },
              { field: { id: 'demand_explorer.offer_status' }, view: { expanded: false, viewTypeId: 'selection' } }
            ]
          }
        }
      ]
    });

    const renderStudioError = (mountEl, message) => {
      mountEl.innerHTML = `
        <div class="studio-error-panel">
          <strong style="color:#fda4af;font-size:15px">AG Studio v3.1 Initialization Error</strong>
          <p style="margin:0;color:var(--text-secondary);max-width:480px;font-size:13px">${esc(message)}</p>
          <button type="button" class="btn-luminous-primary sm" id="btnRetryStudio">Retry AG Studio</button>
        </div>
      `;
      if ($('#btnRetryStudio')) {
        $('#btnRetryStudio').onclick = () => {
          if (studioLayoutKey) localStorage.removeItem(studioLayoutKey);
          mountStudio();
        };
      }
    };

    const mountStudio = () => {
      if (!(showStudio && isMaker)) return;
      const mountEl = $('#genesisStudioMount');
      if (!mountEl) return;

      if (!window.agStudio || typeof window.agStudio.createStudio !== 'function') {
        renderStudioError(mountEl, 'AG Studio bundle (/ag-studio.min.js) failed to load.');
        return;
      }

      if (studioApi && typeof studioApi.destroy === 'function') {
        try { studioApi.destroy(); } catch {}
        studioApi = null;
      }
      mountEl.innerHTML = '';

      try {
        const baseTheme = window.agStudio.studioTheme || (window.agStudio.createStudioTheme ? window.agStudio.createStudioTheme() : null);
        const theme = baseTheme && typeof baseTheme.withParams === 'function'
          ? baseTheme.withParams({
              browserColorScheme: 'dark',
              backgroundColor: '#07101f',
              foregroundColor: '#f1f5f9',
              textColor: '#f1f5f9',
              subtleTextColor: '#94a3b8',
              accentColor: '#2589ff',
              borderColor: 'rgba(148, 163, 184, 0.18)',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              studioWrapperBackgroundColor: '#050b16',
              studioCanvasBackgroundColor: '#050b16',
              studioWidgetBackgroundColor: '#0b1528',
              studioWidgetBorder: { width: 1, color: '#1e293b' },
              studioWidgetBorderRadius: 12,
              studioWidgetTitleTextColor: '#ffffff',
              studioWidgetTitleFontSize: 15,
              studioWidgetTitleFontWeight: '700',
              studioWidgetSubtitleTextColor: '#94a3b8',
              studioWidgetSubtitleFontSize: 11,
              studioPanelContainerBackgroundColor: '#081122',
              studioPanelDividerColor: '#1e293b',
              studioPanelWidth: 235,
              studioMinWidth: 320,
              studioMinHeight: 780,
              studioCanvasMinWidth: 640,
              chartTextColor: '#e2e8f0',
              chartSubtleTextColor: '#94a3b8',
              chartAxisLabelColor: '#cbd5e1',
              chartAxisTitleColor: '#94a3b8',
              chartAxisLineColor: 'rgba(148, 163, 184, 0.25)',
              chartGridLineColor: 'rgba(148, 163, 184, 0.10)',
              chartTooltipBackgroundColor: '#0b1528',
              chartTooltipTextColor: '#f8fafc',
              chartPaletteFills1Color: '#22d3ee',
              chartPaletteFills2Color: '#2589ff',
              chartPaletteFills3Color: '#38bdf8',
              chartPaletteFills4Color: '#6366f1',
              chartPaletteFills5Color: '#0ea5e9',
              chartPaletteFills6Color: '#94a3b8',
              chartPaletteStrokes1Color: '#22d3ee',
              chartPaletteStrokes2Color: '#2589ff',
              chartPaletteStrokes3Color: '#38bdf8',
              chartPaletteStrokes4Color: '#6366f1',
              chartPaletteStrokes5Color: '#0ea5e9',
              chartPaletteStrokes6Color: '#94a3b8'
            })
          : undefined;

        let initialState = createDefaultReportState();
        if (studioLayoutKey) {
          const rawSaved = localStorage.getItem(studioLayoutKey);
          if (rawSaved) {
            try {
              const parsed = JSON.parse(rawSaved);
              if (isValidSavedReportState(parsed)) initialState = parsed;
              else localStorage.removeItem(studioLayoutKey);
            } catch {
              localStorage.removeItem(studioLayoutKey);
            }
          }
        }

        const studioData = {
          sources: [
            {
              id: 'demand_explorer',
              name: 'Customer Demand',
              primaryKeyField: 'id',
              fields: [
                { id: 'id', name: 'Record ID', format: 'textFormat', hide: true },
                { id: 'title', name: 'Products', format: 'textFormat' },
                { id: 'short_title', name: 'Concept', format: 'textFormat' },
                { id: 'category', name: 'Category', format: 'textFormat' },
                { id: 'interest', name: 'Signals', format: 'integerFormat' },
                { id: 'reports', name: 'Quality Reports', format: 'integerFormat' },
                { id: 'stage', name: 'Stage', format: 'textFormat' },
                { id: 'offer_status', name: 'Manufacturing Status', format: 'textFormat' },
                { id: 'spec_summary', name: 'Saved AI Spec', format: 'textFormat' },
                { id: 'action', name: 'Action', format: 'textFormat', context: { isAction: true } },
                { id: 'created_at', name: 'Submitted', format: 'textFormat' }
              ],
              data: products.map((p) => {
                const rawTitle = String(p.title || 'Untitled');
                return {
                  id: p.id,
                  title: rawTitle,
                  short_title: rawTitle.length > 20 ? rawTitle.slice(0, 18) + '…' : rawTitle,
                  category: p.category || 'Creator tools',
                  interest: Number(p.interest) || 0,
                  reports: Number(p.reports) || 0,
                  stage: stageName[p.status] || p.status,
                  offer_status: p.has_my_offer ? 'My Offer Active' : (p.has_eligible_offer ? 'Offer Available' : 'Open Opportunity'),
                  spec_summary: extractSavedSpecSummary(p),
                  action: p.id,
                  created_at: (p.created_at || '').slice(0, 10) || '—'
                };
              })
            },
            {
              id: 'sandbox_orders',
              name: 'PayPal Sandbox Orders',
              primaryKeyField: 'id',
              fields: [
                { id: 'id', name: 'Internal ID', format: 'textFormat', hide: true },
                { id: 'order_id', name: 'PayPal Order ID', format: 'textFormat' },
                { id: 'product', name: 'Product', format: 'textFormat' },
                { id: 'amount', name: 'Amount', format: 'currencyFormat', formatOptions: { format: '$#,##0.00' } },
                { id: 'currency', name: 'Currency', format: 'textFormat' },
                { id: 'status', name: 'PayPal Status', format: 'textFormat' },
                { id: 'date', name: 'Recorded', format: 'textFormat' }
              ],
              data: orders.map((o) => ({
                id: o.id,
                order_id: o.paypal_order_id || o.id,
                product: o.product_title || 'Hardware Order',
                amount: Number(o.amount) || 0,
                currency: o.currency || 'USD',
                status: o.status || 'CREATED',
                date: (o.created_at || '').slice(0, 10) || '—'
              }))
            }
          ]
        };

        studioApi = window.agStudio.createStudio(mountEl, {
          theme,
          mode: isEditMode ? 'edit' : 'view',
          enableFilterEditingInViewMode: true,
          data: studioData,
          initialState,
          panels: {
            view: { right: ['filters'] },
            edit: { right: ['filters', 'edit', 'data'] },
            options: { filters: { applyOnChange: true } }
          },
          widgets: window.agStudio.createWidgets
            ? window.agStudio.createWidgets({
                overrides: [
                  {
                    id: 'grid',
                    options: {
                      createCellRenderer: (field) => {
                        if (!(field?.fieldId === 'demand_explorer.action' || field?.id === 'demand_explorer.action' || field?.context?.isAction)) return undefined;
                        return (params) => {
                          const pid = params.value;
                          if (!pid) return '';
                          const btn = document.createElement('button');
                          btn.type = 'button';
                          btn.textContent = 'Manage →';
                          btn.className = 'btn-luminous-secondary sm';
                          btn.style.cssText = 'padding:3px 10px;font-size:11px;line-height:1.3;cursor:pointer;';
                          btn.onclick = (ev) => {
                            ev.stopPropagation();
                            go('#/manufacturer/product/' + pid);
                          };
                          return btn;
                        };
                      }
                    }
                  }
                ]
              })
            : undefined,
          onStateUpdated: (ev) => {
            try {
              if (ev && ev.state && studioLayoutKey && isValidSavedReportState(ev.state)) {
                localStorage.setItem(studioLayoutKey, JSON.stringify(ev.state));
              }
            } catch {}
          },
          onErrorRaised: (ev) => {
            if (ev && ev.fatal) {
              renderStudioError(mountEl, (ev.errorDetails || []).join(' ') || 'Studio failed to validate dashboard state.');
            }
          }
        });
      } catch (err) {
        renderStudioError(mountEl, err?.message || 'Unexpected error initializing AG Studio.');
      }
    };

    if ($('#btnToggleStudioCanvas')) {
      $('#btnToggleStudioCanvas').onclick = () => {
        showStudio = !showStudio;
        draw();
      };
    }

    mountStudio();

    if ($('#btnToggleStudioMode')) {
      $('#btnToggleStudioMode').onclick = () => {
        isEditMode = !isEditMode;
        if ($('#studioModeLabel')) $('#studioModeLabel').textContent = isEditMode ? 'Lock Dashboard' : 'Customize Dashboard';
        if (studioApi && studioApi.setProperty) studioApi.setProperty('mode', isEditMode ? 'edit' : 'view');
        notice(isEditMode ? 'AG Studio Edit Mode enabled: drag, resize, or configure widgets.' : 'Dashboard locked in View Mode.', 'info');
      };
    }
    if ($('#btnResetLayout')) {
      $('#btnResetLayout').onclick = () => {
        if (studioLayoutKey) localStorage.removeItem(studioLayoutKey);
        if (user) localStorage.removeItem('genesis_studio_layout_' + user.id);
        isEditMode = false;
        if ($('#studioModeLabel')) $('#studioModeLabel').textContent = 'Customize Dashboard';
        if (studioApi && typeof studioApi.setProperty === 'function' && typeof studioApi.setState === 'function') {
          studioApi.setProperty('mode', 'view');
          studioApi.setState(createDefaultReportState());
        } else {
          draw();
        }
        notice('AG Studio reset to default GENESIS Intelligence dashboard.', 'success');
      };
    }
    if ($('#btnGoOrders')) $('#btnGoOrders').onclick = () => go('#/orders');
  };

  draw();
}



async function renderRoute() {
  const defaultRoute = user ? '#/home' : '#/intro';
  const rawHash = (location.hash || defaultRoute).slice(1);
  const [pathPart, queryPart] = rawHash.split('?');
  const path = pathPart || (user ? '/home' : '/intro');
  const query = new URLSearchParams(queryPart || '');

  ($('#desktopApp') || $('#app'))?.classList.remove('intro-mode');
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
    if (path === '/' || path === '/home') { await home(); finishRender(); return; }
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
