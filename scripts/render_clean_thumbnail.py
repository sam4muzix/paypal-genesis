import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
img = Image.new("RGBA", (W, H), (9, 13, 22, 255))
draw = ImageDraw.Draw(img)

# Deep vibrant background glow
for r in range(600, 0, -8):
    alpha = int(70 * (1 - r / 600.0))
    # Big glow on the left for main title
    draw.ellipse((300 - r, 360 - r, 300 + r, 360 + r), fill=(0, 112, 186, alpha))
    # Electric cyan glow on the right for app badge
    draw.ellipse((980 - r, 360 - r, 980 + r, 360 + r), fill=(56, 152, 255, int(alpha * 0.7)))

def get_font(size, bold=True):
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

font_sub_pill = get_font(28, bold=True)
font_huge_paypal = get_font(108, bold=True)
font_huge_ai = get_font(124, bold=True)
font_huge_hack = get_font(92, bold=True)

font_app_logo_g = get_font(80, bold=True)
font_app_paypal = get_font(34, bold=True)
font_app_genesis = get_font(64, bold=True)
font_app_tag = get_font(22, bold=True)

# 1. TOP SUBMISSION PILL
draw.rounded_rectangle((80, 50, 480, 110), radius=30, fill=(0, 112, 186, 240), outline=(56, 152, 255, 255), width=3)
draw.text((115, 62), "★ OFFICIAL SUBMISSION", fill=(255, 255, 255), font=font_sub_pill)

# 2. LEFT SIDE: BIGGEST, BOLD, EYE-CATCHING MAIN TITLE
# "PayPal"
draw.text((80, 140), "PayPal", fill=(255, 255, 255), font=font_huge_paypal)

# "AI" (Vibrant Electric Cyan)
draw.text((80, 260), "AI", fill=(56, 152, 255), font=font_huge_ai)

# "HACKATHON" (Bold White)
draw.text((80, 400), "HACKATHON", fill=(241, 245, 249), font=font_huge_hack)

# Supporting Creator & Live Indicator Under Main Title
draw.rounded_rectangle((80, 560, 450, 620), radius=20, fill=(18, 26, 43, 230), outline=(56, 152, 255, 180), width=2)
draw.text((105, 574), "Created by Sam  ·  Live Demo", fill=(203, 213, 225), font=get_font(22, bold=True))


# 3. RIGHT SIDE: APP NAME & LOGO CARD (Bit smaller, ultra-clean, floating card)
card_x1, card_y1, card_x2, card_y2 = 720, 140, 1200, 580

# Outer card glow border
draw.rounded_rectangle((card_x1, card_y1, card_x2, card_y2), radius=28, fill=(18, 26, 43, 250), outline=(56, 152, 255, 240), width=3)

# App Logo Icon: Blue rounded square with bold white 'G'
icon_x1, icon_y1, icon_x2, icon_y2 = 890, 185, 1030, 325
draw.rounded_rectangle((icon_x1, icon_y1, icon_x2, icon_y2), radius=26, fill=(0, 112, 186, 255), outline=(56, 152, 255, 255), width=3)
draw.text((932, 202), "G", fill=(255, 255, 255), font=font_app_logo_g)

# App Name centered in the card
# "PayPal"
draw.text((905, 345), "PayPal", fill=(147, 197, 253), font=font_app_paypal)

# "GENESIS"
draw.text((810, 395), "GENESIS", fill=(255, 255, 255), font=font_app_genesis)

# Sub-badge inside card
draw.rounded_rectangle((790, 485, 1130, 540), radius=16, fill=(16, 185, 129, 35), outline=(52, 211, 153, 220), width=2)
draw.text((818, 499), "● CUSTOMER-LED COMMERCE", fill=(110, 231, 183), font=font_app_tag)


out_path = "/Users/shyamlraj/Downloads/PPGEN/paypal-genesis/submission/PayPal_GENESIS_Official_Thumbnail.png"
rgb_img = img.convert("RGB")
rgb_img.save(out_path, "PNG", quality=98)
print("Minimal high-impact thumbnail rendered successfully:", os.path.getsize(out_path), "bytes")

