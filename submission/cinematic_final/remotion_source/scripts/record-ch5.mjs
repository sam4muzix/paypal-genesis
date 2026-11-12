import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FILM_DIR, ROOT_DIR, anchors } from './lib.mjs';

const CHROME = '/Users/shyamlraj/Library/Caches/ms-playwright/chromium-1248/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'http://127.0.0.1:8787';
const PORT = 9242;
const RAW = join(FILM_DIR, 'raw', 'frames-ch5');
const CLIPS = join(FILM_DIR, 'public', 'clips');
const PROFILE = join(FILM_DIR, 'raw', 'chrome-profile-ch5');

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
      #__cur{position:fixed;left:960px;top:540px;width:24px;height:24px;margin:-3px 0 0 -3px;pointer-events:none;z-index:2147483647;opacity:0;transition:opacity 160ms ease,transform 80ms ease}
      #__pulse{position:fixed;left:0;top:0;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;border:2px solid #00d2b4;background:rgba(0,210,180,.22);pointer-events:none;z-index:2147483646;opacity:0}
      #__pulse.pop{animation:__pp 340ms ease-out forwards}
      @keyframes __pp{0%{opacity:.95;transform:scale(.45)}100%{opacity:0;transform:scale(1.7)}}\`;
    document.head.appendChild(st);
    const c = document.createElement('div'); c.id='__cur';
    c.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 3L19 11L12.5 13L10 20L4 3Z" fill="#00d2b4" stroke="#06080e" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    const p = document.createElement('div'); p.id='__pulse';
    document.body.appendChild(c); document.body.appendChild(p);
    window.__pos = window.__pos || {x:960,y:540};
  };
  if (document.body) ensure(); else addEventListener('DOMContentLoaded', ensure);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  window.__hide = () => { const c=document.getElementById('__cur'); if(c) c.style.opacity='0'; };
  window.__show = () => { ensure(); const c=document.getElementById('__cur'); if(c) c.style.opacity='1'; };
  window.__scroll = async (top) => { scrollTo({top, behavior:'smooth'}); await sleep(650); };
  window.__visible = async (el) => {
    const r = el.getBoundingClientRect();
    if (r.top < 90 || r.bottom > innerHeight - 110) { el.scrollIntoView({behavior:'smooth', block:'center'}); await sleep(600); }
  };
  window.__glide = async (sel, ms = 260) => {
    ensure(); window.__show();
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) throw new Error('Missing element: ' + sel);
    await window.__visible(el);
    const r = el.getBoundingClientRect();
    const tx = r.left + Math.min(r.width * 0.5, 140), ty = r.top + r.height * 0.5;
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
    const { tx, ty, el } = await window.__glide(sel, 260);
    const pu = document.getElementById('__pulse');
    pu.style.left = tx+'px'; pu.style.top = ty+'px'; pu.classList.remove('pop'); void pu.offsetWidth; pu.classList.add('pop');
    const c = document.getElementById('__cur'); c.style.transform = 'scale(.86)';
    await sleep(110); c.style.transform = 'scale(1)';
    if (!dry) el.click();
  };
  window.__fill = async (sel, text, append = false, step = 12) => {
    await window.__tap(sel);
    const el = document.querySelector(sel);
    el.focus();
    if (!append) el.value = '';
    for (let i = 0; i < text.length; i += 3) {
      el.value += text.slice(i, i + 3);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(step);
    }
  };
})();
`;

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
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
  async waitFor(expr, ms = 30000) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      try { if (await this.eval(`Boolean(${expr})`)) return; } catch {}
      await pause(100);
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
    execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', concat, '-vf', `fps=30,scale=1920:1080:flags=lanczos,tpad=stop_mode=clone:stop_duration=1,format=yuv420p`,
      '-t', target.toFixed(3), '-fps_mode', 'cfr', '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-g', '15', '-keyint_min', '15', '-movflags', '+faststart', out], { stdio: 'pipe' });
    const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', out], { encoding: 'utf8' }).trim());
    console.log(`  clip ${rec.id}: ${rec.frames.length} raw frames, span ${span.toFixed(2)}s -> ${dur.toFixed(2)}s (target ${target.toFixed(2)}s)`);
    return { id: rec.id, frames: rec.frames.length, rawSpanSec: Number(span.toFixed(3)), durationSec: dur };
  }
}

const ts = Date.now();
const PASS = 'ExplainerPass-2026!';
const PWHASH = 'testsalt123:bf7000096b29489ba25e4c0a1d5c1df5f2db70a910656bd8057a6b6be34006af';
const maker = { id: `maker-${ts}`, name: 'StudioWorks Audio', email: `studioworks.${ts}@genesis-demo.invalid`, role: 'manufacturer' };
execFileSync('npx', ['wrangler', 'd1', 'execute', 'DB', '--local', '--command',
  `INSERT OR REPLACE INTO users (id, name, email, password_hash, role, email_verified_at) VALUES ('${maker.id}', '${maker.name}', '${maker.email}', '${PWHASH}', '${maker.role}', CURRENT_TIMESTAMP);`
], { cwd: ROOT_DIR, stdio: 'pipe' });

const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, '--no-first-run', '--no-default-browser-check', '--disable-notifications', '--hide-scrollbars', '--window-size=1920,1080', 'about:blank'], { stdio: 'ignore' });

try {
  let targets;
  for (let i = 0; i < 40; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/list`); if (r.ok) { targets = await r.json(); break; } } catch {} await pause(200); }
  const cdp = new CDP(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await cdp.connect();
  for (const m of ['Page.enable', 'Runtime.enable', 'Network.enable']) await cdp.send(m);
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: HELPER });

  await cdp.send('Page.navigate', { url: BASE + '/#/intro' });
  await cdp.waitFor(`document.fonts.status==='loaded'`);
  await cdp.eval(`(async()=>{const r=await fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:${JSON.stringify(maker.email)},password:${JSON.stringify(PASS)}})});if(!r.ok)throw new Error('login failed');return true})()`);
  await cdp.eval(`location.href='/?r='+Date.now()+'#/manufacturer/intelligence'`);
  await cdp.waitFor(`document.querySelector('#deTableBody tr') && document.querySelector('#customWidgetBrief') && document.fonts.status==='loaded'`, 40000);
  await pause(400);

  console.log('Recording CH5 with dark Demand Explorer, Category/Stage Charts & AI Specification Brief...');
  const ch = CH['ch5'];
  const s = ch.segments[0];
  const a = A('ch5');
  await cdp.start('ch5');
  const t0 = Date.now();
  const until = async (t) => {
    const wait = (t - s.fromSec) * 1000 - (Date.now() - t0);
    if (wait > 0) await pause(wait);
  };

  const work = (async () => {
    await until(a.at('Approved manufacturers') + 0.2);
    await cdp.eval(`window.__scroll(160)`);
    await until(a.at('AG Grid and AG Studio'));
    await cdp.eval(`window.__glide('.kpi-card:nth-child(1)', 420)`);
    await pause(250);
    await cdp.eval(`window.__glide('.kpi-card:nth-child(2)', 420)`);
    await until(a.at('demand velocity'));
    await cdp.eval(`window.__tap('#deTableBody tr:first-child')`);
    await pause(350);
    await until(a.at('filter by stage'));
    await cdp.eval(`window.__glide('[data-cat-filter]', 400)`);
    await pause(350);
    await until(a.at('AI specification') - 0.3);
    await cdp.eval(`window.__glide('#customWidgetBrief', 450)`);
    await pause(400);
    await until(a.at('interactive workspace') - 0.8);
    await cdp.eval(`window.__tap('#btnAskAiToggle')`);
    await pause(350);
    await cdp.eval(`window.__fill('#aiQueryInput','Which product ideas have the most customer interest?')`);
    await cdp.eval(`window.__tap('#aiQuerySubmit')`);
    await pause(1200);
    await cdp.eval(`window.__hide()`);
  })();

  const timer = pause(s.recordSec * 1000);
  await Promise.race([work, timer]);
  await timer;
  await cdp.stop(s.recordSec);
  await work;
  console.log('CH5 updated cleanly!');
} finally {
  proc.kill();
}

