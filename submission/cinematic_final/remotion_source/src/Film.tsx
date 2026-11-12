import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { COLORS, FilmManifest } from './theme';
import { Chapter } from './Chapter';
import { EndCard } from './EndCard';

const ProgressRail: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  const pct = Math.min(100, Math.max(0, (frame / Math.max(1, totalFrames)) * 100));
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(148,163,184,0.12)', zIndex: 50 }}>
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #0070ba, #3898ff, #00d2b4)',
          boxShadow: '0 0 12px rgba(56,152,255,0.8)',
        }}
      />
    </div>
  );
};

export const Film: React.FC<{ manifest: FilmManifest }> = ({ manifest }) => (
  <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
    {manifest.chapters.map((c, i) => (
      <Sequence key={c.id} from={c.startFrame} durationInFrames={c.frames}>
        {c.id === 'ch10' ? <EndCard c={c} /> : <Chapter c={c} index={i} />}
      </Sequence>
    ))}
    <ProgressRail totalFrames={manifest.totalFrames} />
  </AbsoluteFill>
);
