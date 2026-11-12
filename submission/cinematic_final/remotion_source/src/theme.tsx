import React from 'react';
import { Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';

export const COLORS = {
  bg: '#06080e',
  elevated: '#0a0f1a',
  surface: '#0f1624',
  blue: '#0070ba',
  electric: '#3898ff',
  teal: '#00d2b4',
  soft: '#93c5fd',
  silver: '#c8d4e6',
  emerald: '#34d399',
  ink: '#f0f4f8',
  muted: '#8899ac',
};

export const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", system-ui, sans-serif';

export interface Beat { text: string; startSec: number; endSec: number }
export interface Segment { id: string; clip: string; fromFrame: number; toFrame: number; fadeInFrames: number; note: string | null }
export interface FilmEvent { text: string; atSec: number; side?: 'consumer' | 'maker'; kind?: string }
export interface Zoom { t: number; s: number; x: number; y: number }
export interface ClickMarker { atSec: number; x: number; y: number; label?: string }
export interface FocusBox { atSec: number; durSec: number; x: number; y: number; w: number; h: number; label?: string }
export interface Caption { startSec: number; endSec: number; text: string }
export interface ChapterData {
  id: string;
  title: string;
  narrationFile: string;
  narrationDurationSec: number;
  audioStartFrame: number;
  startFrame: number;
  endFrame: number;
  frames: number;
  beats: Beat[];
  segments: Segment[];
  events: FilmEvent[];
  zooms: Zoom[];
  clicks: ClickMarker[];
  focuses: FocusBox[];
  captions: Caption[];
  transition: { fadeInFrames: number };
}
export interface FilmManifest {
  fps: number;
  totalFrames: number;
  music: { enabled: boolean; src: string | null };
  chapters: ChapterData[];
}

export const MusicLayer: React.FC<{ manifest: FilmManifest }> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const { enabled, src } = manifest.music;
  if (!enabled || !src) return null;

  const { fps, totalFrames, chapters } = manifest;
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [Math.max(0, totalFrames - 54), totalFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const RAMP = 9;
  let speaking = 0;
  for (const ch of chapters) {
    const aStart = ch.startFrame + ch.audioStartFrame;
    const aEnd = aStart + Math.round(ch.narrationDurationSec * fps);
    if (frame >= aStart - RAMP && frame <= aEnd + RAMP) {
      const up = interpolate(frame, [aStart - RAMP, aStart], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      const down = interpolate(frame, [aEnd, aEnd + RAMP], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      speaking = Math.max(speaking, Math.min(up, down));
    }
  }

  const baseVol = 0.25 - 0.14 * speaking;
  const vol = baseVol * fadeIn * fadeOut;

  return <Audio src={staticFile(src)} volume={() => vol} loop />;
};
