import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FPS, LEAD_SEC, FILM_DIR, ROOT_DIR, anchors } from './lib.mjs';
import { storyboard } from './storyboard.mjs';

const measured = JSON.parse(readFileSync(join(FILM_DIR, 'narration-measured.json'), 'utf8'));
const scriptRaw = JSON.parse(readFileSync(join(FILM_DIR, 'narration-script.json'), 'utf8'));
const fixedMap = Object.fromEntries(scriptRaw.map((x) => [x.id, x.fixedSec]));

const OUT_DIR = join(ROOT_DIR, 'submission', 'cinematic_final');
mkdirSync(OUT_DIR, { recursive: true });
const audioStartFrame = Math.round(LEAD_SEC * FPS);

const srtTime = (sec) => {
  const ms = Math.round(sec * 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor((ms % 3600000) / 60000))}:${p(Math.floor((ms % 60000) / 1000))},${p(ms % 1000, 3)}`;
};

const tc = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

let cursor = 0;
const chapters = [];
const srt = [];
let srtIndex = 1;

for (const m of measured.chapters) {
  const fixedSec = fixedMap[m.id];
  if (!fixedSec) throw new Error(`Missing fixedSec for ${m.id}`);
  const frames = Math.round(fixedSec * FPS);
  if (LEAD_SEC + m.durationSec > fixedSec) {
    throw new Error(`${m.id} narration (${LEAD_SEC} + ${m.durationSec.toFixed(2)}s) exceeds fixedSec (${fixedSec}s)`);
  }

  const beats = m.beats.map((b) => ({
    text: b.text,
    startSec: Number((b.startSec + LEAD_SEC).toFixed(3)),
    endSec: Number((b.endSec + LEAD_SEC).toFixed(3)),
  }));
  const chapter = { id: m.id, title: m.title, beats, frames };
  const a = anchors(chapter);
  const sb = storyboard[m.id](a);

  const segments = sb.segments.map((s) => {
    const fromFrame = Math.round(s.from * FPS);
    const toFrame = Math.min(frames, Math.round(s.to * FPS));
    if (toFrame - fromFrame < 15) throw new Error(`Segment ${s.id} too short`);
    return {
      id: s.id,
      clip: `clips/${s.id}.mp4`,
      fromSec: Number((fromFrame / FPS).toFixed(3)),
      toSec: Number((toFrame / FPS).toFixed(3)),
      fromFrame,
      toFrame,
      recordSec: Number(((toFrame - fromFrame) / FPS + 0.6).toFixed(3)),
      fadeInFrames: s.fadeInFrames ?? 0,
      note: s.note ?? null,
    };
  });

  const events = sb.events.map((e) => ({ ...e, atSec: Number(e.at.toFixed(3)), atFrame: Math.round(e.at * FPS) })).map(({ at, ...rest }) => rest);
  const captions = beats.map((b) => ({ startSec: b.startSec, endSec: Number(Math.min(fixedSec - 0.1, b.endSec + 0.15).toFixed(3)), text: b.text }));

  chapters.push({
    id: m.id,
    title: m.title,
    narrationText: beats.map((b) => b.text).join(' '),
    narrationFile: m.audioFile,
    narrationDurationSec: m.durationSec,
    visualTailSec: Number((fixedSec - LEAD_SEC - m.durationSec).toFixed(3)),
    audioStartFrame,
    startFrame: cursor,
    endFrame: cursor + frames,
    frames,
    beats,
    segments,
    events,
    zooms: sb.zooms.map((z) => ({ ...z, t: Number(z.t.toFixed(3)) })),
    clicks: sb.clicks || [],
    focuses: sb.focuses || [],
    captions,
    transition: { fadeInFrames: 6 },
  });

  for (const c of captions) {
    srt.push(`${srtIndex++}\n${srtTime(cursor / FPS + c.startSec)} --> ${srtTime(cursor / FPS + c.endSec)}\n${c.text}\n`);
  }
  cursor += frames;
}

if (cursor !== 3990) throw new Error(`Expected 3990 frames (133s), got ${cursor}`);

const manifest = {
  fps: FPS,
  width: 1920,
  height: 1080,
  voice: measured.voice,
  music: { enabled: false, src: null },
  totalFrames: cursor,
  totalDurationSec: Number((cursor / FPS).toFixed(3)),
  chapters,
};

writeFileSync(join(FILM_DIR, 'chapter-manifest.json'), JSON.stringify(manifest, null, 2));
writeFileSync(join(OUT_DIR, 'PayPal_GENESIS_Cinematic.srt'), srt.join('\n'));

const md = ['# Final Timed Narration Script — PayPal GENESIS (02:13.000)', '', 'Voice: English AI voice (Leda). Stems separated (no background music).', ''];
const sheet = ['# Scene Timecode Sheet — PayPal GENESIS (02:13.000 / 3,990 Frames @ 30fps)', '', '| # | Scene | Timecode | Duration | Frames | Frame Range | Audio Cue / Music Hit |', '|---|---|---|---|---|---|---|'];
chapters.forEach((c, i) => {
  const sSec = c.startFrame / FPS;
  const eSec = c.endFrame / FPS;
  const dur = c.frames / FPS;
  md.push(`## Scene ${i + 1}: ${c.title} (${tc(sSec)}–${tc(eSec)})`, '', c.narrationText, '',
    `_Narration: ${c.narrationDurationSec.toFixed(2)}s (starts +${LEAD_SEC}s) · Scene: ${dur.toFixed(2)}s (frames ${c.startFrame}–${c.endFrame})_`, '');
  sheet.push(`| ${i + 1} | ${c.title} | ${tc(sSec)}–${tc(eSec)} | ${dur}s | ${c.frames} | ${c.startFrame}–${c.endFrame} | ${c.id === 'ch1' ? 'Intro atmosphere' : c.id === 'ch2' ? 'First logo impact' : c.id === 'ch6' ? 'AG Studio reveal' : c.id === 'ch8' ? 'PayPal confirmation accent' : c.id === 'ch10' ? 'Final cinematic resolution' : 'Rhythmic transition'} |`);
});

writeFileSync(join(OUT_DIR, 'FINAL_TIMED_NARRATION_SCRIPT.md'), md.join('\n'));
writeFileSync(join(OUT_DIR, 'SCENE_TIMECODE_SHEET.md'), sheet.join('\n'));

console.log(`Manifest: ${cursor} frames = ${manifest.totalDurationSec.toFixed(3)}s`);
chapters.forEach((c) => console.log(`${c.id}: narr ${c.narrationDurationSec.toFixed(2)}s / ${(c.frames / FPS).toFixed(0)}s (${c.frames}f)`));
