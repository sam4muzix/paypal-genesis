import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1280, 720

# 1. Base Image with dark tech background + screenshot blend
base_img_path = "/Users/shyamlraj/Downloads/PPGEN/paypal-genesis/submission/qa_frames/frame_ch1.png"
if os.path.exists(base_img_path):
    bg_raw = Image.open(base_img_path).convert("RGBA").resize((W, H))
    # Soft blur on background screenshot for depth
    bg = bg_raw.filter(ImageFilter.GaussianBlur(radius=8))
else:
    bg = Image.new("RGBA", (W, H), (9, 13, 22, 255))

# Dark gradient overlay for contrast and vibrant color punch
overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ov_draw = ImageDraw.Draw(overlay)

# Dark left vignette so text is 100% crisp and readable
for x in range(W):
    factor = 1.0 - (x / float(W))
    alpha = int(140 + 100 * factor)
    ov_draw.line((x, 0, x, H), fill=(9, 13, 22, alpha))

# Radial electric neon lighting effects
for r in range(550, 0, -10):
    a1 = int(75 * (1 - r / 550.0))
    a2 = int(90 * (1 - r / 550.0))
    ov_draw.ellipse((-80 - r, 300 - r, -80 + r, 300 + r), fill=(0, 112, 186, a1))
    ov_draw.ellipse((1050 - r, 360 - r, 1050 + r, 360 + r), fill=(56, 152, 255, a2))

img = Image.alpha_composite(bg, overlay)
draw = ImageDraw.Draw(img)

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

font_sub_pill = get_font(22, bold=True)
font_huge_paypal = get_font(92, bold=True)
font_huge_ai = get_font(108, bold=True)
font_huge_hack = get_font(84, bold=True)

font_logo_g = get_font(88, bold=True)
font_app_pp = get_font(34, bold=True)
font_app_genesis = get_font(68, bold=True)
font_app_sub = get_font(19, bold=True)
font_spec = get_font(18, bold=True)
font_pill_btn = get_font(18, bold=True)
font_foot = get_font(20, bold=True)

# ----------------- LEFT SIDE: PAYPAL AI HACKATHON -----------------
# 1. Top Ribbon Badge
draw.rounded_rectangle((70, 45, 490, 100), radius=25, fill=(0, 112, 186, 255), outline=(56, 152, 255, 255), width=3)
draw.text((95, 58), "★ PAYPAL AI HACKATHON", fill=(255, 255, 255), font=font_sub_pill)

# 2. Main Title - Strict Y-coordinates to NEVER overlap:
# Line 1: "PayPal" (Y: 125 to 220)
draw.text((70, 125), "PayPal", fill=(255, 255, 255), font=font_huge_paypal)

# Line 2: "AI" with neon glow accent (Y: 235 to 345)
draw.text((70, 235), "AI", fill=(56, 152, 255), font=font_huge_ai)

# Line 3: "HACKATHON" (Y: 360 to 455)
draw.text((70, 360), "HACKATHON", fill=(241, 245, 249), font=font_huge_hack)

# Line 4: "SUBMISSION" High-Voltage Pill Badge (Y: 480 to 555)
draw.rounded_rectangle((70, 485, 470, 555), radius=20, fill=(234, 88, 12, 245), outline=(251, 146, 60, 255), width=3)
draw.text((105, 502), "OFFICIAL SUBMISSION", fill=(255, 255, 255), font=font_sub_pill)

# Author Credit under Left Side (Y: 590)
draw.rounded_rectangle((70, 585, 340, 635), radius=16, fill=(18, 26, 43, 220), outline=(148, 163, 184, 150), width=2)
draw.text((92, 598), "Created by Sam", fill=(203, 213, 225), font=font_pill_btn)


# ----------------- RIGHT SIDE: APP NAME & LOGO CARD -----------------
# 3. High-Depth Glass Card (Y: 70 to 630, X: 710 to 1210)
cx1, cy1, cx2, cy2 = 710, 70, 1210, 630

# Multi-layer card shadow and border glow
draw.rounded_rectangle((cx1, cy1, cx2, cy2), radius=28, fill=(14, 20, 34, 245), outline=(56, 152, 255, 220), width=3)

# App Logo Header Inside Card
# Blue Box with Bold 'G'
gx1, gy1, gx2, gy2 = 750, 105, 870, 225
draw.rounded_rectangle((gx1, gy1, gx2, gy2), radius=24, fill=(0, 112, 186, 255), outline=(56, 152, 255, 255), width=3)
draw.text((788, 118), "G", fill=(255, 255, 255), font=font_logo_g)

# App Name next to Logo Icon
draw.text((895, 115), "PayPal", fill=(147, 197, 253), font=font_app_pp)
draw.text((895, 150), "GENESIS", fill=(255, 255, 255), font=font_app_genesis)

# Subtitle Pill inside card
draw.rounded_rectangle((750, 250, 1170, 305), radius=16, fill=(16, 185, 129, 35), outline=(52, 211, 153, 200), width=2)
draw.text((775, 266), "● CUSTOMER-LED COMMERCE", fill=(110, 231, 183), font=font_app_sub)

# Inner Product Spec Showcase Panel
px1, py1, px2, py2 = 750, 325, 1170, 495
draw.rounded_rectangle((px1, py1, px2, py2), radius=18, fill=(22, 32, 53, 240), outline=(148, 163, 184, 80), width=2)

draw.text((775, 345), "AI Technical Requirements", fill=(56, 152, 255), font=font_spec)
draw.text((775, 385), "• 8-Channel Field Microphone Interface", fill=(241, 245, 249), font=font_spec)
draw.text((775, 420), "• Dual USB-C 32-Bit Float Audio", fill=(203, 213, 225), font=font_spec)
draw.text((775, 455), "• Manufacturer Build Offer: $249", fill=(110, 231, 183), font=font_spec)

# Bottom Card Action Bar
draw.rounded_rectangle((750, 520, 1170, 595), radius=16, fill=(0, 112, 186, 255), outline=(56, 152, 255, 255), width=2)
draw.text((810, 543), "PayPal Sandbox Checkout Verified", fill=(255, 255, 255), font=font_sub_pill)


# ----------------- FOOTER STRIP -----------------
draw.text((70, 670), "Live Production App: genesis.greenmixlabs.com", fill=(56, 152, 255), font=font_foot)
draw.text((930, 670), "Watch Full Walkthrough →", fill=(203, 213, 225), font=font_foot)

out_path = "/Users/shyamlraj/Downloads/PPGEN/paypal-genesis/submission/PayPal_GENESIS_Official_Thumbnail.png"
rgb_img = img.convert("RGB")
rgb_img.save(out_path, "PNG", quality=98)
print("Rich, non-overlapping thumbnail created:", os.path.getsize(out_path), "bytes")

