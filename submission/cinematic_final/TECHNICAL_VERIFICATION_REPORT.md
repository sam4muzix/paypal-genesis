# Technical Verification Report — PayPal GENESIS Cinematic Commercial (02:13.000)

## 1. Master Media Specifications (FFprobe Verified)

| Deliverable | Format / Codec | Resolution / Rate | Exact Duration | Frames / Sample Rate | Size (Bytes) |
|---|---|---|---|---|---|
| `PayPal_GENESIS_Cinematic_PICTURE_ONLY.mp4` | MP4 / H.264 (video only, no audio stream) | 1920×1080 @ 30 fps | `133.000000s` | `3,990` frames | `100,737,381` |
| `PayPal_GENESIS_NARRATION.wav` | WAV / `pcm_s16le` (dialogue only) | 48,000 Hz stereo | `133.000000s` | 6,384,000 samples | `25,536,044` |
| `PayPal_GENESIS_SFX.wav` | WAV / `pcm_s16le` (UI & transition SFX only) | 48,000 Hz stereo | `133.000000s` | 6,384,000 samples | `25,536,044` |
| `PayPal_GENESIS_Cinematic_PREVIEW.mp4` | MP4 / H.264 + AAC (picture + narration + SFX, no music) | 1920×1080 @ 30 fps, 48 kHz stereo | `133.000000s` | `3,990` frames | `103,149,108` |

## 2. Verification Checklist
- **Exact Runtime & Frame Count:** `133.000000s` (`02:13.000`) / `3,990` frames at `30/1` fps across both video deliverables.
- **No Background Music:** Zero music beds mixed in any stem or preview render; `PayPal_GENESIS_NARRATION.wav` contains dialogue only (`peak=0.706`), `PayPal_GENESIS_SFX.wav` contains original UI/transition/logo SFX only (`peak=0.240`).
- **No Audio in Picture-Only Master:** FFprobe confirms `PayPal_GENESIS_Cinematic_PICTURE_ONLY.mp4` contains only `codec_type=video` (no audio stream).
- **Synchronization:** All 10 scenes (`ch1`–`ch10`) and stems start at `t=0.000s` derived from `chapter-manifest.json`.
- **Visual QA:** Extracted frames inspected at `4s`, `13s` (Consumer/Manufacturer click zoom), `74s` (AG Grid & AG Studio), `112s` (PayPal Sandbox Orders v2), `124s` (The Complete Journey), and `131s` (GENESIS End Card) — zero black frames, zero old UI, zero caption overlap.
- **Publishing Guardrail:** No YouTube uploads or Devpost link changes were executed.

