import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
img = Image.new("RGBA", (W, H), (9, 13, 22, 255))
draw = ImageDraw.Draw(img)

# Ambient radial glows
for r in range(400, 0, -5):
    alpha = int(45 * (1 - r / 400.0))
    draw.ellipse((-100 - r, -100 - r, -100 + r, -100 + r), fill=(0, 112, 186, alpha))
    draw.ellipse((850 - r, 350 - r, 850 + r, 350 + r), fill=(56, 152, 255, int(alpha * 0.7)))

# Helper for finding standard system fonts
def get_font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf"
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

font_badge = get_font(18, bold=True)
font_brand = get_font(34, bold=True)
font_h1 = get_font(60, bold=True)
font_sub = get_font(21)
font_card_head = get_font(14, bold=True)
font_card_title = get_font(23, bold=True)
font_card_spec = get_font(15)
font_card_price = get_font(28, bold=True)
font_btn = get_font(15, bold=True)
font_foot = get_font(17)

# Top Badge
draw.rounded_rectangle((60, 48, 480, 92), radius=22, fill=(18, 26, 43, 240), outline=(56, 152, 255, 255), width=2)
draw.ellipse((82, 63, 96, 77), fill=(56, 152, 255, 255))
draw.text((110, 58), "PAYPAL AI HACKATHON · OFFICIAL DEMO", fill=(241, 245, 249), font=font_badge)

# Brand Mark
draw.rounded_rectangle((60, 130, 110, 180), radius=12, fill=(0, 112, 186, 255))
draw.text((75, 134), "G", fill=(255, 255, 255), font=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 36))
draw.text((126, 137), "PayPal GENESIS", fill=(255, 255, 255), font=font_brand)

# Main Titles
draw.text((60, 230), "From Product Ideas", fill=(255, 255, 255), font=font_h1)
draw.text((60, 304), "To Reality", fill=(56, 152, 255), font=font_h1)
draw.text((60, 396), "Customer-Led Manufacturing Powered by AI & PayPal", fill=(148, 163, 184), font=font_sub)

# Right Preview Card
card_box = (720, 120, 1220, 570)
draw.rounded_rectangle(card_box, radius=20, fill=(18, 26, 43, 245), outline=(56, 152, 255, 200), width=2)

draw.text((750, 150), "GENESIS INTELLIGENCE", fill=(56, 152, 255), font=font_card_head)
draw.rounded_rectangle((1040, 142, 1190, 172), radius=15, fill=(16, 185, 129, 45), outline=(52, 211, 153, 180), width=1)
draw.text((1055, 149), "SANDBOX VERIFIED", fill=(110, 231, 183), font=font_badge)

draw.text((750, 200), "Compact 8-Mic Field Interface", fill=(248, 250, 252), font=font_card_title)

# Specs Box
draw.rounded_rectangle((750, 255, 1190, 420), radius=14, fill=(22, 32, 53, 255), outline=(148, 163, 184, 50), width=1)
specs = [
    "✓ 8 XLR/TRS low-noise mic preamps",
    "✓ Dual USB-C 32-bit float streaming",
    "✓ Hardware build proposal: StudioWorks"
]
for i, spec in enumerate(specs):
    draw.text((770, 275 + i * 45), spec, fill=(203, 213, 225), font=font_card_spec)

# Card Footer
draw.line((750, 450, 1190, 450), fill=(148, 163, 184, 50), width=1)
draw.text((750, 485), "$249.00 USD", fill=(255, 255, 255), font=font_card_price)
draw.rounded_rectangle((990, 475, 1190, 525), radius=10, fill=(0, 112, 186, 255))
draw.text((1015, 489), "PayPal Checkout", fill=(255, 255, 255), font=font_btn)

# Bottom Footer
draw.line((60, 640, 1220, 640), fill=(148, 163, 184, 50), width=1)
draw.text((60, 660), "Created by Sam", fill=(148, 163, 184), font=font_foot)
draw.text((850, 660), "Live at: genesis.greenmixlabs.com", fill=(56, 152, 255), font=font_foot)

out_path = "/Users/shyamlraj/Downloads/PPGEN/paypal-genesis/submission/PayPal_GENESIS_Official_Thumbnail.png"
rgb_img = img.convert("RGB")
rgb_img.save(out_path, "PNG", quality=95)
print("Pillow rendered thumbnail size:", os.path.getsize(out_path))

