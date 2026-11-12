# PAYPAL GENESIS: VIDEO QUALITY ASSURANCE REPORT

## 1. FILE & STREAM SPECIFICATIONS

- **File Path:** `submission/PayPal_GENESIS_Explainer_Final.mp4`
- **File Size:** `22,452,621 bytes` (21.41 MB)
- **Container:** MP4 (ISO Base Media file with faststart moov atom at beginning)
- **Duration:** `133.30 seconds` (02:13.30) — well under the 2:59 hard limit
- **Video Stream:**
  - Codec: H.264 / AVC (High profile)
  - Resolution: 1920 × 1080 (16:9 widescreen)
  - Framerate: 30.000 fps constant
  - Bitrate: ~1,174 kb/s
  - Color range / Pixel format: yuvj420p progressive
- **Audio Stream:**
  - Codec: AAC (LC)
  - Sample Rate: 48,000 Hz
  - Channels: 2 (Stereo)
  - Bitrate: 192 kb/s constant
  - Loudness Standard: Broadcast normalized (`-16.0 LUFS`, `-1.5 dBFS` true peak, LRA `7.0 LU`)
  - Mean Volume: `-19.9 dB`
  - Max Volume: `-2.6 dB`
  - Background Music: NONE (Voice narration only, 0 music tracks)

---

## 2. CHAPTER BREAKDOWN & STORY SYNCHRONIZATION

| Chapter | Title | Spoken Narration | Visual Tail | Total Duration | Start Timestamp | Topic Answered |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CH 1** | Genesis Overview | 18.97s | 1.80s | 20.80s | 00:00.00 | What does GENESIS do? Who can use it? |
| **CH 2** | Consumer Product Request | 13.32s | 1.80s | 15.13s | 00:20.80 | How does a consumer use it? |
| **CH 3** | GENESIS Intelligence | 17.09s | 1.80s | 18.90s | 00:35.93 | What does GENESIS Intelligence do? |
| **CH 4** | Demand & Validation | 12.18s | 1.80s | 14.00s | 00:54.83 | How is customer demand validated? |
| **CH 5** | Manufacturer Workspace | 19.74s | 1.80s | 21.57s | 01:08.83 | How does a manufacturer use it? |
| **CH 6** | PayPal Checkout & Payment | 14.55s | 1.80s | 16.37s | 01:30.40 | How does PayPal fit into the workflow? |
| **CH 7** | Why GENESIS Matters | 15.20s | 2.00s | 17.23s | 01:46.77 | What real-world problem does it solve? |
| **CH 8** | Closing Card | 3.67s | 5.53s | 9.20s | 02:04.00 | Closing credits & hackathon submission |

---

## 3. STORY CONSISTENCY & INTEGRITY AUDIT

- **Single Product Lineage:** Alex Rivera posts `Compact 8-Mic Field Audio Interface`, runs GENESIS Intelligence, saves structured requirements to D1, Jordan Lee shows interest + reports gain knob feedback, StudioWorks Audio proposes $249 offer + advances manufacturing stage + accepts quality decision, Jordan Lee completes checkout on PayPal Sandbox, and existing verified Sandbox payment (`PAYMENT CONFIRMED`, USD 115.00) is shown.
- **Forbidden Terminology Audit:**
  - `Gemini`: 0 occurrences in video, captions, audio narration, subtitles, and metadata.
  - `LLM / backend / D1 / API / server`: 0 occurrences in spoken narration.
- **Creator Credit:** Sam is credited in Chapter 8 and metadata.
- **Decoder & Playback Verification:**
  - `ffmpeg -v error -i PayPal_GENESIS_Explainer_Final.mp4 -f null -`: Passed with exit code 0 (zero decoding errors).
  - Web startability: Verified with `-movflags +faststart`.

