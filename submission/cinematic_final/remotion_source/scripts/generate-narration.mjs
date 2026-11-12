import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { FILM_DIR, BEAT_GAP_SEC, loadEnv } from './lib.mjs';

const env = loadEnv();
const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ttsModel = env.GEMINI_TTS_MODEL || 'gemini-3.8-flash-tts';
const checkModel = env.GEMINI_MODEL;
if (!apiKey) throw new Error('Missing API key configuration');

const BEAT_DIR = join(FILM_DIR, 'raw', 'beats');
const AUDIO_DIR = join(FILM_DIR, 'public', 'audio');
mkdirSync(BEAT_DIR, { recursive: true });
mkdirSync(AUDIO_DIR, { recursive: true });

const script = JSON.parse(readFileSync(join(FILM_DIR, 'narration-script.json'), 'utf8'));
// Gemini AI explicitly allowed per screenplay requirements

const norm = (s) =>
  s.toLowerCase().replace(/\b8\b/g, 'eight').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

function similarity(a, b) {
  const x = norm(a), y = norm(b);
  const dp = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
  for (let i = 1; i <= x.length; i++)
    for (let j = 1; j <= y.length; j++)
      dp[i][j] = x[i - 1] === y[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[x.length][y.length] / Math.max(x.length, y.length, 1);
}

async function synth(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(ttsModel)}:generateContent`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Leda' } } },
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part) throw new Error('TTS returned no audio');
  const mime = part.inlineData.mimeType || '';
  return { buf: Buffer.from(part.inlineData.data, 'base64'), rate: /rate=(\d+)/.exec(mime)?.[1] || '24000', pcm: /L16|pcm/.test(mime) };
}

async function transcribe(wavPath) {
  if (!checkModel) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(checkModel)}:generateContent`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: 'Transcribe this audio verbatim. Return only the spoken words, nothing else.' },
            { inlineData: { mimeType: 'audio/wav', data: readFileSync(wavPath).toString('base64') } },
          ] }],
        }),
      }
    );
    if (!res.ok) return null;
    const j = await res.json();
    return j.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join(' ').trim() || null;
  } catch {
    return null;
  }
}

const trimFilter =
  'silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB,areverse,highpass=f=80';

const probeDur = (f) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f], { encoding: 'utf8' }).trim());

execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', String(BEAT_GAP_SEC), '-c:a', 'pcm_s16le', join(BEAT_DIR, 'gap.wav')], { stdio: 'pipe' });

const measured = [];
const verification = [];

for (const ch of script) {
  const beatFiles = [];
  const beatDurs = [];
  for (let bi = 0; bi < ch.beats.length; bi++) {
    const text = ch.beats[bi];
    const outWav = join(BEAT_DIR, `${ch.id}_b${bi}.wav`);
    let best = null;
    const textFile = outWav + '.txt';
    let cached = null;
    try { cached = readFileSync(textFile, 'utf8'); } catch {}
    if (cached) {
      const c = JSON.parse(cached);
      if (c.text === text) best = { heard: c.heard, sim: c.sim, dur: probeDur(outWav), cached: true };
    }
    for (let attempt = 1; attempt <= 6 && !best; attempt++) {
      try {
        if (attempt > 1) await new Promise(r => setTimeout(r, 8000 * attempt));
        const { buf, rate, pcm } = await synth(text);
        const raw = join(BEAT_DIR, `${ch.id}_b${bi}.${pcm ? 'pcm' : 'bin'}`);
        writeFileSync(raw, buf);
        const args = pcm ? ['-f', 's16le', '-ar', rate, '-ac', '1', '-i', raw] : ['-i', raw];
        execFileSync('ffmpeg', ['-y', ...args, '-af', trimFilter, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', outWav], { stdio: 'pipe' });
        const heard = await transcribe(outWav);
        const sim = heard ? similarity(text, heard) : null;
        const cand = { heard, sim, dur: probeDur(outWav) };
        if (!best || (sim ?? 1) > (best.sim ?? 1)) { best = cand; execFileSync('cp', [outWav, outWav + '.best']); }
        if (sim === null || sim >= 0.9) break;
        console.warn(`  retry ${ch.id}_b${bi} (similarity ${sim.toFixed(2)})`);
      } catch (e) {
        console.warn(`  retry ${ch.id}_b${bi} (attempt ${attempt}/6): ${e.message}`);
        await new Promise(r => setTimeout(r, 8000));
      }
    }
    if (!best) throw new Error(`Failed to synthesize ${ch.id}_b${bi}`);
    if (!best.cached) {
      execFileSync('cp', [outWav + '.best', outWav]);
      writeFileSync(textFile, JSON.stringify({ text, heard: best.heard, sim: best.sim }));
    }
    await new Promise(r => setTimeout(r, 2000));
    beatFiles.push(outWav);
    beatDurs.push(probeDur(outWav));
    verification.push({ chapter: ch.id, beat: bi, expected: text, heard: best.heard, similarity: best.sim });
    console.log(`${ch.id}_b${bi}: ${probeDur(outWav).toFixed(2)}s sim=${best.sim === null ? 'n/a' : best.sim.toFixed(2)}`);
  }

  const list = [];
  beatFiles.forEach((f, i) => { list.push(`file '${f}'`); if (i < beatFiles.length - 1) list.push(`file '${join(BEAT_DIR, 'gap.wav')}'`); });
  const listPath = join(BEAT_DIR, `${ch.id}_list.txt`);
  writeFileSync(listPath, list.join('\n'));
  const joined = join(BEAT_DIR, `${ch.id}_joined.wav`);
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c:a', 'pcm_s16le', joined], { stdio: 'pipe' });
  const finalWav = join(AUDIO_DIR, `${ch.id}.wav`);
  execFileSync('ffmpeg', ['-y', '-i', joined, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=7,alimiter=limit=0.89', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', finalWav], { stdio: 'pipe' });
  const joinedDur = probeDur(joined);
  const finalDur = probeDur(finalWav);

  let cursor = 0;
  const beats = ch.beats.map((text, i) => {
    const start = cursor;
    const end = start + beatDurs[i];
    cursor = end + BEAT_GAP_SEC;
    return { text, startSec: Number(start.toFixed(3)), endSec: Number(end.toFixed(3)) };
  });
  console.log(`${ch.id}: joined=${joinedDur.toFixed(3)}s final=${finalDur.toFixed(3)}s`);
  const tailSec = ch.targetSec ? Math.max(1.2, Number((ch.targetSec - finalDur).toFixed(3))) : ch.tailSec;
  measured.push({ id: ch.id, title: ch.title, tailSec, audioFile: `audio/${ch.id}.wav`, durationSec: Number(finalDur.toFixed(3)), beats });
}

writeFileSync(join(FILM_DIR, 'narration-measured.json'), JSON.stringify({ voice: 'Leda', chapters: measured }, null, 2));
writeFileSync(join(FILM_DIR, 'raw', 'narration-verification.json'), JSON.stringify(verification, null, 2));
console.log('NARRATION COMPLETE');
