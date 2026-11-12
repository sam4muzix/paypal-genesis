import React from 'react';
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, ChapterData, FONT } from './theme';
import { Captions } from './Chapter';

const Check: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="rgba(56,152,255,0.16)" stroke="#3898ff" strokeWidth="1.6" />
    <path d="M7.5 12.4l3 3 6-6.6" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Panel: React.FC<{ title: string; sub: string; clip: string; startFrom: number; side: 'consumer' | 'maker'; c: ChapterData; delay: number; fallbackBullets: string[] }> = ({ title, sub, clip, startFrom, side, c, delay, fallbackBullets }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const enter = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 150, mass: 0.9 } });
  const eventBullets = c.events.filter((e) => e.side === side).map(e => e.text);
  const bullets = eventBullets.length > 0 ? eventBullets : fallbackBullets;

  return (
    <div
      style={{
        width: 860,
        borderRadius: 20,
        background: COLORS.surface,
        border: '1px solid rgba(56,152,255,0.28)',
        padding: 26,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 30}px)`,
        boxShadow: '0 20px 56px rgba(0,0,0,0.45)',
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.18em', color: COLORS.electric }}>{sub}</div>
      <div style={{ fontSize: 36, fontWeight: 850, letterSpacing: '-0.02em', color: COLORS.ink, margin: '4px 0 16px' }}>{title}</div>
      <div style={{ width: '100%', height: 380, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(148,163,184,0.2)', background: COLORS.bg }}>
        <OffthreadVideo src={staticFile(clip)} startFrom={startFrom} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 140 }}>
        {bullets.map((bText, idx) => {
          const k = interpolate(t, [0.8 + idx * 0.4, 1.2 + idx * 0.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          return (
            <div key={bText} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: k, transform: `translateX(${(1 - k) * -18}px)` }}>
              <Check />
              <span style={{ fontSize: 26, fontWeight: 600, color: COLORS.ink }}>{bText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const JOURNEY = ['IDEA', 'AI SPEC', 'COMMUNITY DEMAND', 'AG STUDIO INTEL', 'PAYPAL CHECKOUT'];

export const WhyItMatters: React.FC<{ c: ChapterData }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fade = interpolate(frame, [0, 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const jStart = 1.8;

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 30%, #0f1c36 0%, #090d16 70%)', fontFamily: FONT, opacity: fade }}>
      <Sequence from={c.audioStartFrame}>
        <Audio src={staticFile(c.narrationFile)} />
      </Sequence>
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.2em', color: COLORS.electric }}>THE COMPLETE PLATFORM</div>
        <div style={{ fontSize: 44, fontWeight: 850, letterSpacing: '-0.03em', color: COLORS.ink }}>One synchronized lifecycle from concept to delivery.</div>
      </div>
      <div style={{ position: 'absolute', top: 150, left: 70, right: 70, display: 'flex', gap: 50, justifyContent: 'center' }}>
        <Panel
          title="For Consumers"
          sub="IDEAS &amp; AI REQUIREMENTS"
          clip="clips/ch3.mp4"
          startFrom={10}
          side="consumer"
          c={c}
          delay={4}
          fallbackBullets={[
            'Natural language product requests',
            'AI structured engineering specifications',
            'Transparent milestone & sandbox progress'
          ]}
        />
        <Panel
          title="For Manufacturers"
          sub="AG STUDIO &amp; PRODUCTION"
          clip="clips/ch6.mp4"
          startFrom={20}
          side="maker"
          c={c}
          delay={10}
          fallbackBullets={[
            'AG Studio live demand discovery & KPIs',
            'Automated feasibility & margin modeling',
            'PayPal Sandbox escrow & verified checkout'
          ]}
        />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
        {JOURNEY.map((j, i) => {
          const k = interpolate(t, [jStart + i * 0.3, jStart + i * 0.3 + 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <React.Fragment key={j}>
              <div style={{ padding: '8px 18px', borderRadius: 999, background: COLORS.surface, border: '1px solid rgba(56,152,255,0.4)', color: COLORS.ink, fontSize: 16, fontWeight: 800, letterSpacing: '0.07em', opacity: k }}>{j}</div>
              {i < JOURNEY.length - 1 && <div style={{ width: 36, height: 3, borderRadius: 99, background: COLORS.electric, opacity: k }} />}
            </React.Fragment>
          );
        })}
      </div>
      <Captions c={c} />
    </AbsoluteFill>
  );
};
