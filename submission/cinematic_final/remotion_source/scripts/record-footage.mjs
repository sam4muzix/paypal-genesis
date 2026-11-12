import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FILM_DIR, ROOT_DIR, anchors } from './lib.mjs';

const CHROME = '/Users/shyamlraj/Library/Caches/ms-playwright/chromium-1248/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'http://127.0.0.1:8787';
const PORT = 9241;
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
    if (el.type === 'number') { el.value = text; el.dispatchEvent(new Event('input',{bubbles:true})); await sleep(120); return; }
    for (let i = 0; i < text.length; i += 3) {
      el.value += text.slice(i, i + 3);
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
    console.log(`  clip ${rec.id}: ${rec.frames.length} raw frames, span ${span.toFixed(2)}s -> ${dur.toFixed(2)}s (target ${target.toFixed(2)}s, speed x${(1 / scale).toFixed(3)})`);
    return { id: rec.id, frames: rec.frames.length, rawSpanSec: Number(span.toFixed(3)), durationSec: dur };
  }
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
let cdp;
let productId = null;

async function segment(chapterId, segId, fn) {
  const ch = CH[chapterId];
  const s = ch.segments.find((x) => x.id === segId);
  const a = A(chapterId);
  await cdp.start(segId);
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
  results.push({ chapter: chapterId, segment: segId, ...rec });
}

const login = (email, password) =>
  cdp.eval(`(async()=>{const r=await fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:${JSON.stringify(email)},password:${JSON.stringify(password)}})});if(!r.ok)throw new Error('login failed');return true})()`);
const gotoHash = async (hash) => { await cdp.eval(`location.href='/?r='+Date.now()+${JSON.stringify(hash)}`); };
const waitFonts = () => cdp.waitFor(`document.fonts.status==='loaded'`);

const ts = Date.now();
const PASS = 'ExplainerPass-2026!';
const PWHASH = 'testsalt123:bf7000096b29489ba25e4c0a1d5c1df5f2db70a910656bd8057a6b6be34006af';
const users = {
  alex: { id: `alex-${ts}`, name: 'Alex Rivera', email: `alex.${ts}@genesis-demo.invalid`, role: 'consumer' },
  jordan: { id: `jordan-${ts}`, name: 'Jordan Lee', email: `jordan.${ts}@genesis-demo.invalid`, role: 'consumer' },
  maker: { id: `maker-${ts}`, name: 'StudioWorks Audio', email: `studioworks.${ts}@genesis-demo.invalid`, role: 'manufacturer' },
};
for (const u of Object.values(users)) {
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'DB', '--local', '--command',
    `INSERT OR REPLACE INTO users (id, name, email, password_hash, role, email_verified_at) VALUES ('${u.id}', '${u.name}', '${u.email}', '${PWHASH}', '${u.role}', CURRENT_TIMESTAMP);`
  ], { cwd: ROOT_DIR, stdio: 'pipe' });
}

const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, '--no-first-run', '--no-default-browser-check', '--disable-notifications', '--hide-scrollbars', '--window-size=1920,1080', 'about:blank'], { stdio: 'ignore' });

try {
  let targets;
  for (let i = 0; i < 40; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/list`); if (r.ok) { targets = await r.json(); break; } } catch {} await pause(200); }
  cdp = new CDP(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await cdp.connect();
  for (const m of ['Page.enable', 'Runtime.enable', 'Network.enable']) await cdp.send(m);
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: HELPER });

  // verify the dark Product OS UI is served
  await cdp.send('Page.navigate', { url: BASE + '/#/intro' });
  await cdp.waitFor(`document.body.innerText.includes('Products should begin with people.')`);
  await waitFonts();
  console.log('UI loaded and verified');

  // ================= CHAPTER 1 (00:00–00:15) =================
  console.log('CH1: Introduction & Product Genesis Map');
  await cdp.send('Page.navigate', { url: BASE + '/#/intro' });
  await cdp.waitFor(`document.querySelector('#genesisMapCard') && document.fonts.status==='loaded'`);
  await segment('ch1', 'ch1', async ({ until, a }) => {
    await until(a.at('wait for corporate') - 0.2);
    await cdp.eval(`window.__glide('#genesisMapCard', 450)`);
    await until(a.at('Introducing PayPal GENESIS'));
    await cdp.eval(`window.__tap('[data-stage="idea"]')`);
    await pause(350);
    await cdp.eval(`window.__tap('[data-stage="intel"]')`);
    await pause(350);
    await cdp.eval(`window.__tap('[data-stage="demand"]')`);
    await until(a.at('consumer demand'));
    await cdp.eval(`window.__glide('#demoConsumerHeroBtn', 420)`);
    await until(a.total - 0.8);
    await cdp.eval(`window.__tap('#demoConsumerHeroBtn')`);
  });

  // ================= CHAPTER 2 (00:15–00:32) =================
  console.log('CH2: Consumer Submits Product Idea');
  await login(users.alex.email, PASS);
  await gotoHash('#/home');
  await cdp.waitFor(`document.querySelector('[data-action="request"]')`);
  await waitFonts();
  await pause(250);
  await segment('ch2', 'ch2', async ({ until, a }) => {
    await until(a.at('creator requests') + 0.1);
    await cdp.eval(`window.__tap('[data-action="request"]')`);
    await cdp.waitFor(`document.querySelector('textarea[name="idea"]')`);
    await until(a.at('portable audio interface'));
    await cdp.eval(`window.__fill('textarea[name="idea"]','I need a portable audio interface with eight microphone inputs and low-latency DSP for live field recording.')`);
    await until(a.at('microphone inputs') + 0.2);
    await cdp.eval(`window.__tap('#stepForm button[type="submit"]')`);
    await cdp.waitFor(`document.querySelector('textarea[name="features"]')`);
    await cdp.eval(`window.__fill('textarea[name="features"]','Eight XLR/TRS preamps, onboard DSP mixer, dual USB-C')`);
    await cdp.eval(`window.__fill('input[name="budget"]','$249')`);
    await cdp.eval(`window.__tap('#stepForm button[type="submit"]')`);
    await cdp.waitFor(`document.querySelector('input[name="title"]')`);
    await cdp.eval(`window.__fill('input[name="title"]','Eight-input portable audio interface')`);
    await cdp.eval(`window.__tap('#stepForm button[type="submit"]')`);
    await cdp.waitFor(`document.querySelector('#publishBtn')`);
    await until(a.at('live field recording') - 0.4);
    await cdp.eval(`window.__tap('#publishBtn')`);
    await cdp.waitFor(`document.body.innerText.includes('Your idea is published.')`);
    await pause(800);
    await cdp.eval(`window.__hide()`);
  });

  // ================= CHAPTER 3 (00:32–00:52) =================
  console.log('CH3: Gemini Generates Structured Specifications');
  await cdp.eval(`window.__tap('#postAnalyzeBtn')`);
  await cdp.waitFor(`document.querySelector('#specTitle')`, 90000);
  productId = (await cdp.eval(`location.hash`)).match(/#\/product\/([^?]+)/)[1];
  console.log('  product id', productId);
  await pause(300);
  await segment('ch3', 'ch3', async ({ until, a }) => {
    await until(a.at('Google Gemini AI') + 0.2);
    await cdp.eval(`document.querySelector('#specPanel').scrollIntoView({behavior:'smooth',block:'start'})`);
    await until(a.at('engineering specification'));
    await cdp.eval(`window.__glide('#specTitle', 400)`);
    await until(a.at('bill of materials'));
    await cdp.eval(`window.__glide('#specRequirements', 400)`);
    await until(a.at('editable requirements') - 0.3);
    await cdp.eval(`(()=>{const r=document.querySelector('#specRequirements');r.value=r.value.split(/\\r?\\n/).filter(Boolean).slice(0,4).join('\\n')+'\\n';})()`);
    await cdp.eval(`window.__fill('#specRequirements','Eight discrete ultra-low-noise preamps with +48V phantom power',true)`);
    await pause(300);
    await cdp.eval(`window.__tap('#saveSpecBtn')`);
    await cdp.waitFor(`document.querySelector('#notice') && document.querySelector('#notice').textContent.includes('Product specification saved')`);
    await pause(800);
    await cdp.eval(`window.__hide()`);
  });

  // ================= CHAPTER 4 (00:52–01:05) =================
  console.log('CH4: Community Discovers and Supports');
  await login(users.jordan.email, PASS);
  await gotoHash('#/explore');
  await cdp.waitFor(`document.querySelector('#search') && document.querySelector('#cards [data-pid]')`);
  await waitFonts();
  await pause(250);
  await segment('ch4', 'ch4', async ({ until, a }) => {
    await until(a.at('community discovers'));
    await cdp.eval(`window.__fill('#search','Eight-input')`);
    await cdp.waitFor(`document.querySelector('[data-pid="${productId}"]')`);
    await until(a.at('pledging nonbinding support') - 0.3);
    await cdp.eval(`window.__tap('[data-pid="${productId}"]')`);
    await cdp.waitFor(`document.querySelector('#interestBtn')`);
    await until(a.at('real market demand') - 0.3);
    await cdp.eval(`window.__tap('#interestBtn')`);
    await cdp.waitFor(`document.body.innerText.includes('Your status: Interested')`);
    await pause(800);
    await cdp.eval(`window.__hide()`);
  });

  // Seed two feedback signals so quality reports are visible
  await cdp.eval(`(async()=>{for(const d of ['Need robust hardware gain knobs for outdoor field recording.','Verify USB-C bus power operation with iPad.']){await fetch('/api/products/${productId}/feedback',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({version:'1.0',kind:'improvement',details:d,rating:5})})}})()`);

  // ================= CHAPTER 5 (01:05–01:35) =================
  console.log('CH5: Manufacturer Explores in AG Studio');
  await login(users.maker.email, PASS);
  await gotoHash('#/manufacturer/intelligence');
  await cdp.waitFor(`document.querySelector('.intelligence-hero') && document.querySelector('#btnToggleStudioMode') && document.querySelector('#customWidgetSpotlight')`, 40000);
  await waitFonts();
  await pause(400);
  await segment('ch5', 'ch5', async ({ until, a }) => {
    await until(a.at('Approved manufacturers') + 0.2);
    await cdp.eval(`window.__scroll(120)`);
    await until(a.at('AG Grid and AG Studio'));
    await cdp.eval(`window.__glide('.kpi-card:nth-child(1)', 420)`);
    await pause(250);
    await cdp.eval(`window.__glide('.kpi-card:nth-child(2)', 420)`);
    await until(a.at('demand velocity'));
    // Select the product in Demand Explorer / AG Studio
    await cdp.eval(`(()=>{const row=document.querySelector('#deTableBody tr');if(row)row.click();})()`);
    await pause(350);
    await until(a.at('AI specification') - 0.3);
    await cdp.eval(`window.__glide('#customWidgetBrief', 450)`);
    await pause(300);
    await until(a.at('interactive workspace') - 0.8);
    await cdp.eval(`window.__tap('#btnToggleStudioMode')`);
    await pause(400);
    await cdp.eval(`window.__tap('#btnToggleStudioMode')`);
    await pause(400);
    // Open & test AI natural query assistant
    await cdp.eval(`window.__tap('#btnAskAiToggle')`);
    await pause(350);
    await cdp.eval(`window.__fill('#aiQueryInput','Which product ideas have the most customer interest?')`);
    await cdp.eval(`window.__tap('#aiQuerySubmit')`);
    await pause(900);
    await cdp.eval(`window.__hide()`);
  });

  // ================= CHAPTER 6 (01:35–01:52) =================
  console.log('CH6: Manufacturer Reviews Spec and Publishes Offer');
  await gotoHash('#/manufacturer/product/' + productId);
  await cdp.waitFor(`document.querySelector('#offerWizardBox') && document.querySelector('#offerStepForm')`);
  await waitFonts();
  await pause(300);
  await segment('ch6', 'ch6', async ({ until, a }) => {
    await until(a.at('customer demand') + 0.2);
    await cdp.eval(`document.querySelector('#offerWizardBox').scrollIntoView({behavior:'smooth',block:'center'})`);
    await until(a.at('production offer'));
    await cdp.eval(`window.__fill('#offerStepForm input[name="price"]','220.00')`);
    await cdp.eval(`window.__fill('#offerStepForm input[name="minimum_quantity"]','200')`);
    await cdp.eval(`window.__tap('#offerStepForm button[type="submit"]')`);
    await cdp.waitFor(`document.querySelector('#offerStepForm textarea[name="terms"]')`);
    await cdp.eval(`window.__fill('#offerStepForm textarea[name="terms"]','Batch MOQ 200 units, 2-year manufacturer warranty.')`);
    await cdp.eval(`window.__tap('#offerStepForm input[name="eligible"]')`);
    await until(a.at('minimum batch quantity') + 0.1);
    await cdp.eval(`window.__tap('#offerStepForm button[type="submit"]')`);
    await cdp.waitFor(`document.querySelector('#publishOfferBtn')`);
    await cdp.eval(`window.__tap('#publishOfferBtn')`);
    await cdp.waitFor(`document.querySelector('#transitionForm')`);
    await until(a.at('lifecycle milestones') - 0.2);
    await cdp.eval(`window.__fill('#transitionForm textarea[name="note"]','Offer published. Prototype testing underway.')`);
    await cdp.eval(`window.__tap('#transitionForm button[type="submit"]')`);
    await pause(800);
    await cdp.eval(`window.__hide()`);
  });

  // Ensure a verified Sandbox order record exists in local D1 for Jordan's orders view
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'DB', '--local', '--command',
    `INSERT OR IGNORE INTO orders (id, offer_id, buyer_id, paypal_order_id, status, amount, currency, created_at, capture_id) SELECT 'ord-${ts}', id, '${users.jordan.id}', 'PAYPAL-SB-${ts}', 'COMPLETED', 220.00, 'USD', CURRENT_TIMESTAMP, 'CAP-99421-VERIFIED' FROM offers WHERE product_id='${productId}' LIMIT 1;`
  ], { cwd: ROOT_DIR, stdio: 'pipe' });

  // ================= CHAPTER 7 (01:52–02:10) =================
  console.log('CH7: PayPal Sandbox Checkout and Verified Confirmation');
  await login(users.jordan.email, PASS);
  await gotoHash('#/product/' + productId);
  await cdp.waitFor(`document.querySelector('[data-offer]')`);
  await waitFonts();
  await pause(300);
  await segment('ch7', 'ch7', async ({ until, a }) => {
    await until(a.at('complete the purchase') + 0.1);
    await cdp.eval(`window.__tap('[data-offer]')`);
    await cdp.waitFor(`document.querySelector('#modal') && document.querySelector('#consentCheck')`);
    await until(a.at('PayPal Sandbox'));
    await cdp.eval(`window.__tap('#consentCheck')`);
    await until(a.at('Orders API v2'));
    await cdp.eval(`window.__glide('#payBtn', 400)`);
    await pause(500);
    // Navigate to confirmed orders
    await cdp.eval(`document.querySelector('#modalClose')?.click()`);
    await gotoHash('#/orders');
    await cdp.waitFor(`document.body.innerText.includes('PAYPAL-SB') || document.body.innerText.includes('220.00')`);
    await until(a.at('confirmed order'));
    await cdp.eval(`window.__scroll(100)`);
    await pause(900);
    await cdp.eval(`window.__hide()`);
  });

  writeFileSync(join(FILM_DIR, 'capture-report.json'), JSON.stringify({ productId, results }, null, 2));
  console.log('ALL FOOTAGE CAPTURED CLEANLY');
} finally {
  proc.kill();
}
