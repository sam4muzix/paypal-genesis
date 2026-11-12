import { spawn } from "node:child_process";
import fs from "node:fs";

async function main() {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1280px;
    height: 720px;
    background: #090d16;
    color: #f1f5f9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    overflow: hidden;
  }
  .wrapper {
    width: 1280px;
    height: 720px;
    position: relative;
    padding: 50px 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #090d16;
  }
  .glow-1 {
    position: absolute;
    top: -100px;
    left: -100px;
    width: 650px;
    height: 650px;
    background: radial-gradient(circle, rgba(0, 112, 186, 0.4) 0%, transparent 70%);
  }
  .glow-2 {
    position: absolute;
    bottom: -120px;
    right: 200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(56, 152, 255, 0.25) 0%, transparent 70%);
  }
  .header-badge {
    position: relative;
    z-index: 5;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: #121a2b;
    border: 2px solid #3898ff;
    border-radius: 999px;
    padding: 10px 24px;
    width: fit-content;
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  }
  .dot {
    width: 12px;
    height: 12px;
    background: #3898ff;
    border-radius: 50%;
    box-shadow: 0 0 12px #3898ff;
  }
  .badge-label {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #f1f5f9;
    text-transform: uppercase;
  }
  .grid {
    position: relative;
    z-index: 5;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 40px;
    align-items: center;
  }
  .brand-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 14px;
  }
  .brand-mark {
    width: 48px;
    height: 48px;
    background: #0070ba;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    font-weight: 900;
    color: #fff;
    box-shadow: 0 8px 20px rgba(0,112,186,0.6);
  }
  .brand-name {
    font-size: 32px;
    font-weight: 800;
    color: #fff;
  }
  .brand-name span { color: #3898ff; }
  h1 {
    font-size: 56px;
    line-height: 1.08;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #ffffff;
    margin-bottom: 14px;
  }
  .cyan-text { color: #3898ff; }
  .tagline {
    font-size: 20px;
    color: #94a3b8;
    font-weight: 500;
    line-height: 1.35;
  }
  .card {
    background: #121a2b;
    border: 2px solid rgba(56, 152, 255, 0.6);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 35px rgba(0,112,186,0.3);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .card-tag {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #3898ff;
  }
  .card-pill {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid #10b981;
    color: #6ee7b7;
    font-size: 12px;
    font-weight: 800;
    padding: 4px 12px;
    border-radius: 999px;
  }
  .card-title {
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    line-height: 1.25;
  }
  .specs {
    background: #162035;
    border-radius: 12px;
    padding: 14px 18px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .spec {
    font-size: 14px;
    color: #cbd5e1;
    font-weight: 600;
  }
  .spec span {
    color: #3898ff;
    margin-right: 6px;
  }
  .card-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    padding-top: 14px;
  }
  .price {
    font-size: 26px;
    font-weight: 900;
    color: #fff;
  }
  .btn-paypal {
    background: #0070ba;
    color: #fff;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 800;
    box-shadow: 0 4px 16px rgba(0, 112, 186, 0.6);
  }
  .footer {
    position: relative;
    z-index: 5;
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    color: #64748b;
    font-weight: 600;
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    padding-top: 16px;
  }
  .footer b { color: #f1f5f9; }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="glow-1"></div>
    <div class="glow-2"></div>

    <div class="header-badge">
      <div class="dot"></div>
      <div class="badge-label">PayPal AI Hackathon · Official Demo</div>
    </div>

    <div class="grid">
      <div>
        <div class="brand-row">
          <div class="brand-mark">G</div>
          <div class="brand-name">PayPal <span>GENESIS</span></div>
        </div>
        <h1>From Product Ideas<br><span class="cyan-text">To Reality</span></h1>
        <p class="tagline">Customer-Led Manufacturing Powered by GENESIS Intelligence &amp; PayPal</p>
      </div>

      <div class="card">
        <div class="card-top">
          <span class="card-tag">GENESIS INTELLIGENCE</span>
          <span class="card-pill">● SANDBOX VERIFIED</span>
        </div>
        <div class="card-title">Compact 8-Mic Field Audio Interface</div>
        <div class="specs">
          <div class="spec"><span>✓</span> 8 XLR/TRS low-noise microphone preamps</div>
          <div class="spec"><span>✓</span> Dual USB-C 32-bit float streaming</div>
          <div class="spec"><span>✓</span> Hardware build proposal by StudioWorks</div>
        </div>
        <div class="card-foot">
          <div class="price">$249.00 <span style="font-size:13px;color:#94a3b8;font-weight:500">USD</span></div>
          <div class="btn-paypal">PayPal Checkout</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>Created by <b>Sam</b></div>
      <div>Live Application: <b>genesis.greenmixlabs.com</b></div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync("/tmp/yt_rendered_page.html", html);

  const chromePath = "/Users/shyamlraj/Library/Caches/ms-playwright/chromium-1248/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--window-size=1280,720",
    "--remote-debugging-port=9241",
    "--no-sandbox",
    "--disable-gpu",
    "--user-data-dir=/tmp/chrome-th-inspect"
  ]);

  let tabs;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch("http://127.0.0.1:9241/json/list");
      tabs = await res.json();
      if (tabs && tabs.length) break;
    } catch {}
  }

  const WebSocket = (await import("ws")).default;
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  await new Promise(r => ws.on("open", r));

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const msgId = id++;
    const handler = (data) => {
      const parsed = JSON.parse(data.toString());
      if (parsed.id === msgId) {
        ws.off("message", handler);
        resolve(parsed.result);
      }
    };
    ws.on("message", handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send("Page.navigate", { url: "file:///tmp/yt_rendered_page.html" });
  await new Promise(r => setTimeout(r, 2000));

  const shot = await send("Page.captureScreenshot", { format: "png" });
  const thumbPath = "/Users/shyamlraj/Downloads/PPGEN/paypal-genesis/submission/PayPal_GENESIS_Official_Thumbnail.png";
  fs.writeFileSync(thumbPath, Buffer.from(shot.data, "base64"));
  console.log("Screenshot written, size:", fs.statSync(thumbPath).size);

  ws.close();
  proc.kill();

  // Push to YouTube
  const secret = JSON.parse(fs.readFileSync("/Users/shyamlraj/Downloads/PPGEN/client_secret_840030834648-ih22fndcl9g5qt9ihnoiavgdn7var7sr.apps.googleusercontent.com.json", "utf8")).installed;
  const tokens = JSON.parse(fs.readFileSync("/Users/shyamlraj/Downloads/PPGEN/youtube_tokens.json", "utf8"));

  let token = tokens.access_token;
  if (tokens.refresh_token) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: secret.client_id,
        client_secret: secret.client_secret,
        refresh_token: tokens.refresh_token,
        grant_type: "refresh_token"
      })
    });
    const refreshed = await res.json();
    if (refreshed.access_token) token = refreshed.access_token;
  }

  const thumbRes = await fetch("https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=D4zczmATPa8", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "image/png"
    },
    body: fs.readFileSync(thumbPath)
  });
  console.log("YouTube update status:", thumbRes.status);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

