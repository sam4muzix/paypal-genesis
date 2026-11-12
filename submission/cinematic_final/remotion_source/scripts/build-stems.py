import json
import subprocess
import wave
import struct
from pathlib import Path

FILM_DIR = Path("/Users/shyamlraj/Downloads/PPGEN/paypal-genesis/video/genesis-explainer")
OUT_DIR = Path("/Users/shyamlraj/Downloads/PPGEN/paypal-genesis/submission/cinematic_final")
OUT_DIR.mkdir(parents=True, exist_ok=True)

manifest = json.loads((FILM_DIR / "chapter-manifest.json").read_text())
FPS = manifest["fps"]
TOTAL_SEC = manifest["totalDurationSec"]
SR = 48000
TOTAL_SAMPLES = round(TOTAL_SEC * SR)
assert TOTAL_SAMPLES == 133 * 48000, f"Unexpected samples: {TOTAL_SAMPLES}"

def load_wav_48k_stereo(src_path: Path):
    tmp = OUT_DIR / f".tmp_{src_path.stem}.wav"
    subprocess.run([
        "ffmpeg", "-y", "-i", str(src_path),
        "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(tmp)
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with wave.open(str(tmp), "rb") as wf:
        raw = wf.readframes(wf.getnframes())
    tmp.unlink(missing_ok=True)
    samples = struct.unpack(f"<{len(raw)//2}h", raw)
    return [samples[i] / 32768.0 for i in range(0, len(samples), 2)], [samples[i+1] / 32768.0 for i in range(0, len(samples), 2)]

def mix_into(buf_l, buf_r, src_l, src_r, start_sec, gain=1.0):
    idx0 = round(start_sec * SR)
    for i in range(len(src_l)):
        p = idx0 + i
        if 0 <= p < TOTAL_SAMPLES:
            buf_l[p] += src_l[i] * gain
            buf_r[p] += src_r[i] * gain

def save_stem(path: Path, buf_l, buf_r):
    peak = max(1e-9, max(max(abs(x) for x in buf_l), max(abs(x) for x in buf_r)))
    scale = min(1.0, 0.94 / peak)
    out = bytearray()
    for l, r in zip(buf_l, buf_r):
        li = max(-32767, min(32767, int(l * scale * 32767)))
        ri = max(-32767, min(32767, int(r * scale * 32767)))
        out += struct.pack("<hh", li, ri)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(bytes(out))
    print(f"Wrote {path.name}: {TOTAL_SAMPLES/SR:.3f}s (peak={peak:.3f}, scale={scale:.3f})")

# 1. Build Narration Stem
narr_l = [0.0] * TOTAL_SAMPLES
narr_r = [0.0] * TOTAL_SAMPLES
for ch in manifest["chapters"]:
    t0 = (ch["startFrame"] + ch["audioStartFrame"]) / FPS
    sl, sr = load_wav_48k_stereo(FILM_DIR / "public" / ch["narrationFile"])
    mix_into(narr_l, narr_r, sl, sr, t0, gain=0.95)
save_stem(OUT_DIR / "PayPal_GENESIS_NARRATION.wav", narr_l, narr_r)

# 2. Build SFX Stem
sfx_l = [0.0] * TOTAL_SAMPLES
sfx_r = [0.0] * TOTAL_SAMPLES
whoosh = load_wav_48k_stereo(FILM_DIR / "public/audio/sfx_whoosh.wav")
click = load_wav_48k_stereo(FILM_DIR / "public/audio/sfx_click.wav")
focus = load_wav_48k_stereo(FILM_DIR / "public/audio/sfx_focus.wav")
logo = load_wav_48k_stereo(FILM_DIR / "public/audio/sfx_logo.wav")
paypal = load_wav_48k_stereo(FILM_DIR / "public/audio/sfx_paypal.wav")

for i, ch in enumerate(manifest["chapters"]):
    ch_start = ch["startFrame"] / FPS
    if i > 0:
        mix_into(sfx_l, sfx_r, whoosh[0], whoosh[1], ch_start, gain=0.28)
    if ch["id"] in ("ch2", "ch10"):
        mix_into(sfx_l, sfx_r, logo[0], logo[1], ch_start + 0.12, gain=0.52)
    if ch["id"] == "ch8":
        mix_into(sfx_l, sfx_r, paypal[0], paypal[1], ch_start + 1.6, gain=0.55)
    for fbox in ch.get("focuses", []):
        mix_into(sfx_l, sfx_r, focus[0], focus[1], ch_start + fbox["atSec"], gain=0.35)
    for ck in ch.get("clicks", []):
        mix_into(sfx_l, sfx_r, click[0], click[1], ch_start + ck["atSec"], gain=0.65)

save_stem(OUT_DIR / "PayPal_GENESIS_SFX.wav", sfx_l, sfx_r)

