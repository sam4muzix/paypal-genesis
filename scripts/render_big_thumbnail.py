import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
img = Image.new("RGBA", (W, H), (9, 13, 22, 255))
draw = ImageDraw.Draw(img)

# Deep ambient glow background
for r in range(500, 0, -8):
    alpha = int(55 * (1 - r / 500.0))
    draw.ellipse((640 - r, 360 - r, 640 + r, 360 + r), fill=(0, 112, 186, alpha))
    draw.ellipse((1100 - r, 150 - r, 1100 + r, 150 + r), fill=(56, 152, 255, int(alpha * 0.6)))
    draw.ellipse((150 - r, 550 - r, 150 + r, 550 + r), fill=(0, 48, 135, int(alpha * 0.8)))

def get_font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNS.ttf"
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

font_badge_hackathon = get_font(24, bold=True)
font_badge_sub = get_font(24, bold=True)
font_logo_g = get_font(84, bold=True)
font_brand_pp = get_font(42, bold=True)
font_brand_genesis = get_font(88, bold=True)
font_headline = get_font(60, bold=True)
font_sub = get_font(24)
font_pill = get_font(20, bold=True)
font_foot = get_font(20)

# 1. TOP BADGE: PAYPAL AI HACKATHON + OFFICIAL SUBMISSION (Large, bold, high-contrast)
# Left Badge: PayPal AI Hackathon
draw.rounded_rectangle((70, 45, 520, 105), radius=30, fill=(18, 26, 43, 245), outline=(56, 152, 255, 255), width=3)
draw.ellipse((95, 65, 115, 85), fill=(56, 152, 255, 255))
draw.text((130, 60), "PayPal AI Hackathon", fill=(255, 255, 255), font=font_badge_hackathon)

# Right Badge: OFFICIAL SUBMISSION
draw.rounded_rectangle((540, 45, 930, 105), radius=30, fill=(0, 112, 186, 230), outline=(56, 152, 255, 255), width=3)
draw.text((570, 60), "★ OFFICIAL SUBMISSION", fill=(255, 255, 255), font=font_badge_sub)

# Creator pill on top right
draw.rounded_rectangle((960, 45, 1210, 105), radius=30, fill=(18, 26, 43, 220), outline=(148, 163, 184, 180), width=2)
draw.text((995, 61), "Created by Sam", fill=(203, 213, 225), font=font_badge_sub)

# 2. APP LOGO & NAME (Huge, crystal clear)
# Large PayPal Blue 'G' App Icon
draw.rounded_rectangle((70, 150, 200, 280), radius=28, fill=(0, 112, 186, 255), outline=(56, 152, 255, 255), width=3)
draw.text((105, 166), "G", fill=(255, 255, 255), font=font_logo_g)

# Brand Typography
draw.text((225, 150), "PayPal", fill=(147, 197, 253), font=font_brand_pp)
draw.text((225, 192), "GENESIS", fill=(255, 255, 255), font=font_brand_genesis)

# 3. CORE STORY / HEADLINE (Bold, high readability)
draw.text((70, 315), "Customer-Led Manufacturing", fill=(255, 255, 255), font=font_headline)
draw.text((70, 395), "Powered by AI & PayPal Checkout", fill=(56, 152, 255), font=font_headline)

# 4. THREE STEP PILL WORKFLOW
steps = [
    ("1. Consumer Idea", 70, 340),
    ("2. AI Specification", 370, 680),
    ("3. PayPal Sandbox Order", 710, 1090)
]
for label, x1, x2 in steps:
    draw.rounded_rectangle((x1, 510, x2, 575), radius=16, fill=(18, 26, 43, 240), outline=(56, 152, 255, 200), width=2)
    draw.text((x1 + 25, 528), label, fill=(241, 245, 249), font=font_pill)

# Verification Tag
draw.rounded_rectangle((1115, 510, 1210, 575), radius=16, fill=(16, 185, 129, 45), outline=(52, 211, 153, 220), width=2)
draw.text((1130, 528), "LIVE", fill=(110, 231, 183), font=font_pill)

# 5. BOTTOM BAR: LIVE URL & SANDBOX NOTICE
draw.line((70, 630, 1210, 630), fill=(148, 163, 184, 80), width=2)
draw.text((70, 655), "Live Production App: genesis.greenmixlabs.com", fill=(56, 152, 255), font=font_foot)
draw.text((800, 655), "PayPal Sandbox Integration · Full Video Walkthrough", fill=(148, 163, 184), font=font_foot)

out_path = "/Users/shyamlraj/Downloads/PPGEN/paypal-genesis/submission/PayPal_GENESIS_Official_Thumbnail.png"
rgb_img = img.convert("RGB")
rgb_img.save(out_path, "PNG", quality=98)
print("Big clear thumbnail rendered:", os.path.getsize(out_path), "bytes")

