import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const FPS = 30;
export const LEAD_SEC = 5 / FPS; // narration starts 5 frames into each chapter
export const BEAT_GAP_SEC = 0.25;

const __dirname = dirname(fileURLToPath(import.meta.url));
export const FILM_DIR = join(__dirname, '..');
export const ROOT_DIR = join(FILM_DIR, '..', '..');

export function loadEnv() {
  const env = {};
  try {
    for (const line of readFileSync(join(ROOT_DIR, '.dev.vars'), 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  } catch {}
  return env;
}

// Chapter-relative anchors. `chapter.beats` entries hold chapter-relative startSec/endSec.
export function anchors(chapter) {
  const find = (phrase) => {
    const p = phrase.toLowerCase();
    for (const b of chapter.beats) {
      const i = b.text.toLowerCase().indexOf(p);
      if (i >= 0) return { b, i };
    }
    throw new Error(`Phrase not found in ${chapter.id}: "${phrase}"`);
  };
  return {
    total: chapter.frames / FPS,
    at(phrase, edge = 'start') {
      const { b, i } = find(phrase);
      const k = (edge === 'end' ? i + phrase.length : i) / b.text.length;
      return Number((b.startSec + k * (b.endSec - b.startSec)).toFixed(3));
    },
    beatStart: (n) => chapter.beats[n].startSec,
    beatEnd: (n) => chapter.beats[n].endSec,
  };
}

