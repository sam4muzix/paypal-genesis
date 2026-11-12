import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, ChapterData, FONT } from './theme';

const STEPS = ['IDEA', 'INTELLIGENCE', 'DEMAND', 'MANUFACTURING', 'PAYPAL'];
const HIGHLIGHTS = [
  'AG GRID v36 · AG STUDIO v3.1',
  'PAYPAL ORDERS API v2 SANDBOX',
  'ONE-CLICK JUDGE DEMO',
  'CLOUDFLARE D1 · MIT OPEN SOURCE',
];

export const EndCard: React.FC<{ c: ChapterData }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const journeyFade = interpolate(frame, [2, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pop = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 18, stiffness: 200, mass: 0.7 } });
  const line = interpolate(frame, [10, 34], [0, 620], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const tag = interpolate(frame, [14, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pills = interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const credit = interpolate(frame, [30, 46], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 42%, #0d1c38 0%, #060913 74%)', fontFamily: FONT, justifyContent: 'center', alignItems: 'center', opacity: fade }}>
      <div style={{ textAlign: 'center', maxWidth: 1520, padding: '0 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 38, opacity: journeyFade }}>
          {STEPS.map((s, idx) => (
            <React.Fragment key={s}>
              <div style={{
                padding: '9px 20px',
                borderRadius: 999,
                background: 'rgba(13, 28, 56, 0.85)',
                border: '1px solid rgba(56, 152, 255, 0.45)',
                color: '#e0f2fe',
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '0.14em',
                boxShadow: '0 10px 28px rgba(0, 0, 0, 0.4)',
              }}>
                {s}
              </div>
              {idx < STEPS.length - 1 && (
                <span style={{ color: COLORS.electric, fontSize: 18, fontWeight: 700 }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ transform: `scale(${0.95 + 0.05 * pop})` }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <div style={{ width: 76, height: 76, borderRadius: 20, background: 'linear-gradient(135deg, #2589ff, #0ea5e9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, fontWeight: 850, boxShadow: '0 16px 44px rgba(0,112,186,0.48)' }}>G</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 18, letterSpacing: '0.2em', fontWeight: 800, color: COLORS.electric }}>PAYPAL</div>
              <div style={{ fontSize: 46, fontWeight: 850, letterSpacing: '-0.02em', color: COLORS.ink, lineHeight: 1 }}>GENESIS</div>
            </div>
          </div>
          <div style={{ opacity: tag }}>
            <div style={{ fontSize: 60, fontWeight: 850, letterSpacing: '-0.03em', color: COLORS.ink }}>Products should begin with people.</div>
          </div>
          <div style={{ width: line, height: 3, margin: '24px auto 24px', borderRadius: 99, background: 'linear-gradient(90deg, transparent, #3898ff, transparent)' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 28, opacity: pills }}>
            {HIGHLIGHTS.map((h) => (
              <div key={h} style={{
                padding: '8px 18px',
                borderRadius: 999,
                background: 'rgba(6, 78, 59, 0.72)',
                border: '1px solid rgba(52, 211, 153, 0.45)',
                color: '#d1fae5',
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: '0.1em',
              }}>
                {h}
              </div>
            ))}
          </div>
          <div style={{ opacity: credit }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.soft, marginBottom: 8 }}>Created by Sam</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.electric, letterSpacing: '0.05em' }}>genesis.greenmixlabs.com</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
