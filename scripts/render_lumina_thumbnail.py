import base64
import subprocess
from pathlib import Path

def b64(path: str, mime: str) -> str:
    data = Path(path).read_bytes()
    return f"data:{mime};base64,{base64.b64encode(data).decode('ascii')}"

hero_uri = b64("/Users/shyamlraj/Downloads/PPGEN/paypal-genesis/public/assets/genesis-hero-3d.jpg", "image/jpeg")
intel_uri = b64("/Users/shyamlraj/.gemini/antigravity/brain/68204c86-6885-4fc1-a900-d8ab8902aee5/scratch/v2_56.png", "image/png")
orders_uri = b64("/Users/shyamlraj/.gemini/antigravity/brain/68204c86-6885-4fc1-a900-d8ab8902aee5/scratch/v2_85.png", "image/png")

html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: 1280px;
    height: 720px;
    background: radial-gradient(circle at 72% 48%, #0d2448 0%, #071022 48%, #040710 100%);
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", sans-serif;
    overflow: hidden;
    position: relative;
  }}
  .grid-bg {{
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(56, 152, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 152, 255, 0.05) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.85), transparent 82%);
  }}
  .glow-left {{
    position: absolute;
    left: -120px;
    top: 80px;
    width: 680px;
    height: 680px;
    background: radial-gradient(circle, rgba(0, 112, 186, 0.36) 0%, transparent 68%);
  }}
  .glow-right {{
    position: absolute;
    right: -40px;
    top: 40px;
    width: 720px;
    height: 720px;
    background: radial-gradient(circle, rgba(56, 152, 255, 0.34) 0%, transparent 66%);
  }}
  .left {{
    position: absolute;
    left: 64px;
    top: 84px;
    width: 620px;
    z-index: 10;
  }}
  .paypal-pill {{
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 12px 24px;
    border-radius: 18px;
    background: rgba(0, 112, 186, 0.24);
    border: 2px solid rgba(56, 152, 255, 0.65);
    box-shadow: 0 12px 34px rgba(0, 112, 186, 0.32);
    margin-bottom: 26px;
  }}
  .pp-mark {{
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0070ba, #009cde);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 900;
    color: #fff;
    box-shadow: 0 6px 18px rgba(0, 156, 222, 0.5);
  }}
  .pp-word {{
    font-size: 40px;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #ffffff;
  }}
  .pp-word span {{
    color: #38bdf8;
  }}
  .genesis-title {{
    font-size: 112px;
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 0.94;
    background: linear-gradient(180deg, #ffffff 15%, #7dd3fc 65%, #3898ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 12px 32px rgba(56, 152, 255, 0.35));
    margin-bottom: 22px;
  }}
  .sub-headline {{
    font-size: 34px;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #e2e8f0;
    margin-bottom: 28px;
    text-transform: uppercase;
  }}
  .sub-headline strong {{
    color: #38bdf8;
  }}
  .accent-bar {{
    width: 260px;
    height: 5px;
    border-radius: 99px;
    background: linear-gradient(90deg, #0070ba, #38bdf8, #00d2b4);
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.7);
    margin-bottom: 26px;
  }}
  .tags {{
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }}
  .tag {{
    padding: 10px 18px;
    border-radius: 999px;
    background: rgba(12, 22, 42, 0.88);
    border: 1.5px solid rgba(56, 152, 255, 0.45);
    color: #bae6fd;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    box-shadow: 0 8px 20px rgba(0,0,0,0.4);
  }}
  .tag.paypal {{
    background: rgba(0, 112, 186, 0.35);
    border-color: #38bdf8;
    color: #ffffff;
  }}
  .right {{
    position: absolute;
    right: 36px;
    top: 40px;
    width: 580px;
    height: 640px;
    z-index: 5;
  }}
  .hero-3d {{
    position: absolute;
    right: 18px;
    top: 96px;
    width: 510px;
    height: 510px;
    object-fit: contain;
    mix-blend-mode: lighten;
    -webkit-mask-image: radial-gradient(circle at 50% 50%, black 50%, transparent 74%);
    mask-image: radial-gradient(circle at 50% 50%, black 50%, transparent 74%);
  }}
  .ui-card {{
    position: absolute;
    border-radius: 16px;
    overflow: hidden;
    border: 2px solid rgba(56, 152, 255, 0.55);
    box-shadow: 0 22px 48px rgba(0, 0, 0, 0.72), 0 0 24px rgba(0, 112, 186, 0.3);
    background: #060913;
  }}
  .ui-card img {{
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }}
  .card-intel {{
    width: 268px;
    height: 152px;
    right: 14px;
    top: 22px;
    transform: rotate(3deg);
  }}
  .card-orders {{
    width: 274px;
    height: 156px;
    left: 16px;
    bottom: 20px;
    transform: rotate(-3deg);
  }}
</style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="glow-left"></div>
  <div class="glow-right"></div>

  <div class="left">
    <div class="paypal-pill">
      <div class="pp-mark">P</div>
      <div class="pp-word">Pay<span>Pal</span></div>
    </div>
    <div class="genesis-title">GENESIS</div>
    <div class="sub-headline">From <strong>Idea</strong> to <strong>Reality</strong></div>
    <div class="accent-bar"></div>
    <div class="tags">
      <div class="tag paypal">PayPal Orders v2</div>
      <div class="tag">AG Grid &amp; AG Studio</div>
      <div class="tag">Manufacturing</div>
    </div>
  </div>

  <div class="right">
    <img class="hero-3d" src="{hero_uri}" />
    <div class="ui-card card-intel"><img src="{intel_uri}" /></div>
    <div class="ui-card card-orders"><img src="{orders_uri}" /></div>
  </div>
</body>
</html>
"""

out_path = "/Users/shyamlraj/Downloads/PPGEN/paypal-genesis/submission/PayPal_GENESIS_Official_Thumbnail.png"
html_path = "/Users/shyamlraj/.gemini/antigravity/brain/68204c86-6885-4fc1-a900-d8ab8902aee5/scratch/thumb.html"
Path(html_path).write_text(html, encoding="utf-8")
subprocess.run([
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1280,720",
    f"--screenshot={out_path}",
    f"file://{html_path}",
], check=True)

print("Saved:", out_path, Path(out_path).stat().st_size, "bytes")
