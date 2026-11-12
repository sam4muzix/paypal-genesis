import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FILM_DIR, anchors } from './lib.mjs';

const CHROME = '/Users/shyamlraj/Library/Caches/ms-playwright/chromium-1248/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'https://genesis.greenmixlabs.com';
const PORT = 9243;
const RAW = join(FILM_DIR, 'raw', 'frames');
const CLIPS = join(FILM_DIR, 'public', 'clips');
const PROFILE = join(FILM_DIR, 'raw', 'chrome-profile');

for (const d of [RAW, PROFILE]) rmSync(d, { recursive: true, force: true });
for (const d of [RAW, CLIPS, PROFILE]) mkdirSync(d, { recursive: true });

const manifest = JSON.parse(readFileSync(join(FILM_DIR, 'chapter-manifest.json'), 'utf8'));
const CH = Object.fromEntries(manifest.chapters.map((c) => [c.id, c]));
const A = (id) => anchors(CH[id]);

const HELPER = `
(() => {
  if (window.__film) return;
  window.__film = true;
  const ensure = () => {
    if (!document.body || document.getElementById('__cur')) return;
    const st = document.createElement('style');
    st.textContent = \`
      #__cur{position:fixed;left:960px;top:540px;width:24px;height:24px;margin:-3px 0 0 -3px;pointer-events:none;z-index:2147483647;opacity:0;transition:opacity 180ms ease,transform 80ms ease}
      #__pulse{position:fixed;left:0;top:0;width:32px;height:32px;margin:-16px 0 0 -16px;border-radius:50%;border:2px solid #38bdf8;background:rgba(56,189,248,.24);pointer-events:none;z-index:2147483646;opacity:0}
      #__pulse.pop{animation:__pp 340ms ease-out forwards}
      @keyframes __pp{0%{opacity:.95;transform:scale(.45)}100%{opacity:0;transform:scale(1.75)}}\`;
    document.head.appendChild(st);
    const c = document.createElement('div'); c.id='__cur';
    c.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 3L19 11L12.5 13L10 20L4 3Z" fill="#38bdf8" stroke="#06080e" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    const p = document.createElement('div'); p.id='__pulse';
    document.body.appendChild(c); document.body.appendChild(p);
    window.__pos = window.__pos || {x:960,y:540};
  };
  if (document.body) ensure(); else addEventListener('DOMContentLoaded', ensure);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  window.__hide = () => { const c=document.getElementById('__cur'); if(c) c.style.opacity='0'; };
  window.__show = () => { ensure(); const c=document.getElementById('__cur'); if(c) c.style.opacity='1'; };
  window.__scroll = async (top) => { scrollTo({top, behavior:'smooth'}); await sleep(550); };
  window.__visible = async (el) => {
    const r = el.getBoundingClientRect();
    if (r.top < 80 || r.bottom > innerHeight - 100) { el.scrollIntoView({behavior:'smooth', block:'center'}); await sleep(500); }
  };
  window.__glide = async (sel, ms = 320) => {
    ensure(); window.__show();
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) throw new Error('Missing element: ' + sel);
    await window.__visible(el);
    const r = el.getBoundingClientRect();
    const tx = r.left + Math.min(r.width * 0.5, 160), ty = r.top + r.height * 0.5;
    const c = document.getElementById('__cur');
    const sx = window.__pos.x, sy = window.__pos.y, t0 = performance.now();
    await new Promise((res) => {
      const step = (now) => {
        const p = Math.min(1, (now - t0) / ms);
        const e = p < .5 ? 4*p*p*p : 1 - Math.pow(-2*p+2, 3)/2;
        const x = sx + (tx-sx)*e, y = sy + (ty-sy)*e;
        c.style.left = x+'px'; c.style.top = y+'px'; window.__pos = {x,y};
        p < 1 ? requestAnimationFrame(step) : res();
      };
      requestAnimationFrame(step);
    });
    return { tx, ty, el };
  };
  window.__tap = async (sel, dry = false) => {
    const { tx, ty, el } = await window.__glide(sel, 280);
    const pu = document.getElementById('__pulse');
    pu.style.left = tx+'px'; pu.style.top = ty+'px'; pu.classList.remove('pop'); void pu.offsetWidth; pu.classList.add('pop');
    const c = document.getElementById('__cur'); c.style.transform = 'scale(.86)';
    await sleep(110); c.style.transform = 'scale(1)';
    if (!dry) el.click();
  };
  window.__fill = async (sel, text, append = false, step = 10) => {
    await window.__tap(sel);
    const el = document.querySelector(sel);
    el.focus();
    if (!append) el.value = '';
    for (let i = 0; i < text.length; i += 4) {
      el.value += text.slice(i, i + 4);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(step);
    }
  };
})();
`;

class CDP {
  constructor(url) { this.ws = new WebSocket(url); this.id = 0; this.pending = new Map(); this.rec = null; }
  connect() {
    return new Promise((res, rej) => {
      this.ws.onopen = res; this.ws.onerror = rej;
      this.ws.onmessage = (ev) => {
        const m = JSON.parse(ev.data);
        if (m.id && this.pending.has(m.id)) {
          const { resolve, reject } = this.pending.get(m.id); this.pending.delete(m.id);
          m.error ? reject(new Error(m.error.message)) : resolve(m.result);
        } else if (m.method === 'Page.screencastFrame') {
          this.send('Page.screencastFrameAck', { sessionId: m.params.sessionId }).catch(() => {});
          const r = this.rec;
          if (r && !r.paused) {
            const buf = Buffer.from(m.params.data, 'base64');
            if (buf.length < 4096) return;
            const file = join(r.dir, `f_${String(r.frames.length).padStart(5, '0')}.png`);
            writeFileSync(file, buf);
            const ts = m.params.metadata?.timestamp || Date.now() / 1000;
            const prev = r.frames.at(-1).ts;
            r.frames.push({ file, ts: Math.max(prev + 0.008, ts) });
          }
        }
      };
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400));
    return r.result?.value;
  }
  async waitFor(expr, ms = 35000) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      try { if (await this.eval(`Boolean(${expr})`)) return; } catch {}
      await pause(120);
    }
    throw new Error('Timeout waiting for: ' + expr);
  }
  async start(id) {
    const dir = join(RAW, id); mkdirSync(dir, { recursive: true });
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    const initFile = join(dir, 'f_init.png'); writeFileSync(initFile, Buffer.from(data, 'base64'));
    this.rec = { id, dir, frames: [{ file: initFile, ts: Date.now() / 1000 }], paused: false };
    await this.send('Page.startScreencast', { format: 'png', quality: 100, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  }
  async stop(target) {
    if (this.rec) this.rec.paused = true;
    await this.send('Page.stopScreencast').catch(() => {});
    const rec = this.rec; this.rec = null;
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    const endFile = join(rec.dir, 'f_end.png'); writeFileSync(endFile, Buffer.from(data, 'base64'));
    rec.frames.push({ file: endFile, ts: Math.max(rec.frames.at(-1).ts + 0.05, Date.now() / 1000) });
    const span = Math.max(0.4, rec.frames.at(-1).ts - rec.frames[0].ts);
    const scale = target / span;
    const lines = [];
    rec.frames.forEach((f, i) => {
      const next = i + 1 < rec.frames.length ? rec.frames[i + 1].ts : f.ts + 0.1;
      lines.push(`file '${f.file.replace(/'/g, "'\\''")}'`, `duration ${Math.max(1 / 30, (next - f.ts) * scale).toFixed(4)}`);
    });
    lines.push(`file '${rec.frames.at(-1).file.replace(/'/g, "'\\''")}'`);
    const concat = join(rec.dir, 'concat.txt'); writeFileSync(concat, lines.join('\n'));
    const out = join(CLIPS, `${rec.id}.mp4`);
    execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', concat, '-vf', 'fps=30,scale=1920:1080:flags=lanczos,tpad=stop_mode=clone:stop_duration=1,format=yuv420p',
      '-t', target.toFixed(3), '-fps_mode', 'cfr', '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-g', '15', '-keyint_min', '15', '-movflags', '+faststart', out], { stdio: 'pipe' });
    const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', out], { encoding: 'utf8' }).trim());
    console.log(`  clip ${rec.id}: ${rec.frames.length} raw frames, span ${span.toFixed(2)}s -> ${dur.toFixed(2)}s (target ${target.toFixed(2)}s)`);
    return { id: rec.id, frames: rec.frames.length, rawSpanSec: Number(span.toFixed(3)), durationSec: dur };
  }
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
let cdp;

async function segment(chapterId, fn) {
  const ch = CH[chapterId];
  const s = ch.segments[0];
  const a = A(chapterId);
  await cdp.start(s.id);
  const t0 = Date.now();
  const until = async (t) => {
    const wait = (t - s.fromSec) * 1000 - (Date.now() - t0);
    if (wait > 0) await pause(wait);
  };
  let overrun = null;
  const work = fn({ until, a, seg: s }).catch((e) => { overrun = e; });
  const timer = pause(s.recordSec * 1000);
  await Promise.race([work, timer]);
  await timer;
  const rec = await cdp.stop(s.recordSec);
  await work;
  if (overrun) throw overrun;
  results.push({ chapter: chapterId, ...rec });
}

const gotoHash = async (hash) => { await cdp.eval(`location.hash=${JSON.stringify(hash)}`); };

const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, '--no-first-run', '--no-default-browser-check', '--disable-notifications', '--hide-scrollbars', '--window-size=1920,1080', 'about:blank'], { stdio: 'ignore' });

const ONLY = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1] || null;
const shouldRun = (id) => !ONLY || ONLY === id;

try {
  let targets;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/list`); if (r.ok) { targets = await r.json(); break; } } catch {}
    await pause(200);
  }
  cdp = new CDP(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await cdp.connect();
  for (const m of ['Page.enable', 'Runtime.enable', 'Network.enable']) await cdp.send(m);
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: HELPER });

  if (shouldRun('ch1')) {
  // CH1: THE IDEA (Elevated Public Home)
  console.log('Recording CH1: Elevated Home Reveal');
  await cdp.send('Page.navigate', { url: BASE + '/#/intro' });
  await cdp.waitFor(`document.querySelector('.genesis-home-hero') && document.fonts.status==='loaded'`);
  await pause(500);
  await segment('ch1', async ({ until, a }) => {
    await until(a.total * 0.35);
    await cdp.eval(`window.__glide('.hero-3d-pedestal', 600)`);
    await until(a.total * 0.7);
    await cdp.eval(`window.__glide('.genesis-journey-strip', 500)`);
    await cdp.eval(`window.__hide()`);
  });
  }

  if (shouldRun('ch2')) {
  // CH2: INTRODUCING GENESIS (Consumer & Manufacturer roles -> Consumer Workspace)
  console.log('Recording CH2: Introducing GENESIS');
  await segment('ch2', async ({ until, a }) => {
    await until(a.total * 0.25);
    await cdp.eval(`window.__glide('#introManufacturerBtn', 420)`);
    await until(a.total * 0.55);
    await cdp.eval(`window.__tap('#introConsumerBtn')`);
    await cdp.waitFor(`document.querySelector('.consumer-hero-grid')`);
    await pause(700);
    await cdp.eval(`window.__hide()`);
  });
  }

  if (shouldRun('ch3')) {
  // CH3: CONSUMER CREATION
  console.log('Recording CH3: Consumer Creation');
  await gotoHash('#/request');
  await cdp.waitFor(`document.querySelector('#ideaTextarea')`);
  await segment('ch3', async ({ until, a }) => {
    await until(a.total * 0.12);
    await cdp.eval(`window.__fill('#ideaTextarea','Compact 4K OLED camera field monitor with dual 12G-SDI, false color, and USB-C PD pass-through')`);
    await cdp.eval(`document.querySelector('#catSelect').value='Video & Imaging'; document.querySelector('#catSelect').dispatchEvent(new Event('change',{bubbles:true}))`);
    await cdp.eval(`window.__fill('#budgetInput','$249')`);
    await cdp.eval(`window.__fill('#useTextarea','Independent filmmakers need a daylight-readable monitor with reliable exposure tools and battery longevity.')`);
    await until(a.total * 0.65);
    await cdp.eval(`window.__tap('#continueFromPreviewBtn')`);
    await cdp.waitFor(`document.querySelector('textarea[name="features"]')`);
    await cdp.eval(`window.__fill('textarea[name="features"]','2000-nit OLED screen, dual 12G-SDI & HDMI 2.1, waveform monitor, NP-F & USB-C PD')`);
    await cdp.eval(`window.__tap('#stepForm button[type="submit"]')`);
    await cdp.waitFor(`document.querySelector('#analyzeBtn')`);
    await pause(500);
    await cdp.eval(`window.__hide()`);
  });
  }

  if (shouldRun('ch4')) {
  // CH4: GENESIS INTELLIGENCE (Live Gemini AI specification generation)
  console.log('Recording CH4: Live Gemini Specification');
  await segment('ch4', async ({ until, a }) => {
    await until(0.5);
    await cdp.eval(`window.__tap('#analyzeBtn')`);
    await cdp.waitFor(`document.querySelector('#specPreview, [name="summary"], #specRequirements')`, 30000);
    await until(a.total * 0.65);
    await cdp.eval(`window.__scroll(220)`);
    await pause(900);
    await cdp.eval(`window.__hide()`);
  });
  }

  if (shouldRun('ch5')) {
  // CH5: COMMUNITY DEMAND
  console.log('Recording CH5: Community Demand');
  await gotoHash('#/explore');
  await cdp.waitFor(`document.querySelector('#cards [data-pid]')`);
  await pause(400);
  await segment('ch5', async ({ until, a }) => {
    await until(a.total * 0.2);
    await cdp.eval(`window.__tap('#cards tr:nth-child(2)')`);
    await pause(700);
    await cdp.eval(`window.__tap('#dossierActionBtn')`);
    await cdp.waitFor(`document.querySelector('#interestBtn')`);
    await until(a.total * 0.62);
    await cdp.eval(`window.__tap('#interestBtn')`);
    await pause(800);
    await cdp.eval(`window.__scroll(220)`);
    await pause(600);
    await cdp.eval(`window.__hide()`);
  });
  }

  if (shouldRun('ch6')) {
  // CH6: AG STUDIO INTELLIGENCE (Main Sponsor Demo)
  console.log('Recording CH6: AG Studio Intelligence');
  await cdp.eval(`document.querySelector('#btnRoleMaker').click()`);
  await cdp.waitFor(`document.querySelector('.mfg-stage-layout')`);
  await gotoHash('#/manufacturer/intelligence');
  await cdp.waitFor(`document.querySelector('#genesisStudioMount .ag-root-wrapper')`, 30000);
  await pause(1200);
  await segment('ch6', async ({ until, a }) => {
    await until(a.total * 0.14);
    await cdp.eval(`window.__scroll(360)`);
    await until(a.total * 0.34);
    await cdp.eval(`window.__glide('#genesisStudioMount', 500)`);
    await until(a.total * 0.56);
    await cdp.eval(`window.__tap('#btnToggleStudioMode')`);
    await pause(1200);
    await cdp.eval(`window.__tap('#btnToggleStudioMode')`);
    await until(a.total * 0.8);
    await cdp.eval(`window.__scroll(980)`);
    await pause(1000);
    await cdp.eval(`window.__hide()`);
  });
  }

  if (shouldRun('ch7')) {
  // CH7: MANUFACTURING DECISIONS
  console.log('Recording CH7: Manufacturing Decisions');
  await gotoHash('#/home');
  await cdp.waitFor(`document.querySelector('.mfg-stage-layout')`);
  await pause(500);
  await segment('ch7', async ({ until, a }) => {
    await until(a.total * 0.18);
    await cdp.eval(`window.__tap('.mfg-opp-chip:nth-child(2)')`);
    await pause(700);
    await cdp.eval(`window.__tap('[data-dossier-tab="specifications"]')`);
    await until(a.total * 0.58);
    await cdp.eval(`window.__tap('.mfg-dossier-panel .btn-inspector-action')`);
    await cdp.waitFor(`document.querySelector('#backDemandBtn')`);
    await pause(900);
    await cdp.eval(`window.__hide()`);
  });
  }

  if (shouldRun('ch8')) {
  // CH8: PAYPAL CHECKOUT (Orders API v2 Sandbox)
  console.log('Recording CH8: PayPal Sandbox Orders');
  await cdp.send('Page.navigate', { url: BASE + '/#/intro' });
  await cdp.waitFor(`document.querySelector('#introConsumerBtn')`);
  await cdp.eval(`document.querySelector('#introConsumerBtn').click()`);
  await cdp.waitFor(`document.querySelector('.consumer-hero-grid')`);
  await gotoHash('#/orders');
  await cdp.waitFor(`document.querySelector('.orders-featured-card')`);
  await pause(500);
  await segment('ch8', async ({ until, a }) => {
    await until(a.total * 0.28);
    await cdp.eval(`window.__glide('.paypal-sandbox-box', 450)`);
    await until(a.total * 0.62);
    await cdp.eval(`window.__tap('.orders-featured-card .btn-luminous-primary')`);
    await cdp.waitFor(`document.querySelector('#backExploreBtn')`);
    await cdp.eval(`window.__scroll(260)`);
    await pause(900);
    await cdp.eval(`window.__hide()`);
  });
  }

  console.log('ALL CLIPS RECORDED:', JSON.stringify(results, null, 2));
} finally {
  proc.kill();
}

