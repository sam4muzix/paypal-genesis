import React from 'react';
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, ClickMarker, ChapterData, FONT, FocusBox, Zoom } from './theme';

export const Captions: React.FC<{ c: ChapterData }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cap = c.captions.find((x) => t >= x.startSec && t < x.endSec);
  if (!cap) return null;
  const k = Math.min(1, (t - cap.startSec) / 0.12);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center', fontFamily: FONT, opacity: k, zIndex: 40 }}>
      <div
        style={{
          maxWidth: 1360,
          textAlign: 'center',
          background: 'rgba(6,10,19,0.92)',
          border: '1px solid rgba(56,152,255,0.32)',
          color: COLORS.ink,
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: 26,
          fontWeight: 500,
          lineHeight: 1.3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        }}
      >
        {cap.text}
      </div>
    </div>
  );
};

export const EventChip: React.FC<{ c: ChapterData }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const evs = c.events.filter((e) => e.atSec <= t);
  const ev = evs[evs.length - 1];
  if (!ev) return null;
  const rel = Math.round((t - ev.atSec) * fps);
  const s = spring({ frame: rel, fps, config: { damping: 16, stiffness: 260, mass: 0.65 } });
  return (
    <div style={{ position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', fontFamily: FONT, zIndex: 40 }}>
      <div
        key={ev.atSec}
        style={{
          padding: '8px 22px',
          borderRadius: 999,
          background: 'rgba(6,10,19,0.94)',
          border: '1px solid rgba(56,152,255,0.6)',
          color: COLORS.ink,
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: '0.1em',
          boxShadow: '0 10px 28px rgba(0,0,0,0.55), 0 0 18px rgba(56,152,255,0.24)',
          opacity: s,
          transform: `translateY(${(1 - s) * -12}px) scale(${0.96 + 0.04 * s})`,
        }}
      >
        {ev.text}
      </div>
    </div>
  );
};

export const TitleLowerThird: React.FC<{ c: ChapterData; index: number }> = ({ c, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const k = Math.min(interpolate(t, [0.05, 0.35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), interpolate(t, [2.3, 2.75], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  if (k <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 56, bottom: 138, fontFamily: FONT, opacity: k, transform: `translateX(${(1 - k) * -28}px)`, zIndex: 40 }}>
      <div style={{ borderLeft: `4px solid ${COLORS.electric}`, padding: '8px 20px', background: 'rgba(6,10,19,0.92)', borderRadius: '0 12px 12px 0', boxShadow: '0 12px 32px rgba(0,0,0,0.55)', borderTop: '1px solid rgba(56,152,255,0.25)', borderRight: '1px solid rgba(56,152,255,0.25)', borderBottom: '1px solid rgba(56,152,255,0.25)' }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.18em', color: COLORS.electric }}>0{index + 1} · CHAPTER</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.ink, letterSpacing: '-0.01em' }}>{c.title}</div>
      </div>
    </div>
  );
};

const FocusOverlay: React.FC<{ boxes: FocusBox[] }> = ({ boxes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <>
      {boxes.map((b, i) => {
        if (t < b.atSec || t > b.atSec + b.durSec) return null;
        const enter = spring({ frame: Math.round((t - b.atSec) * fps), fps, config: { damping: 18, stiffness: 220, mass: 0.7 } });
        const exit = interpolate(t, [b.atSec + b.durSec - 0.3, b.atSec + b.durSec], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const alpha = enter * exit;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.w}%`,
              height: `${b.h}%`,
              borderRadius: 16,
              border: '2px solid rgba(56, 189, 248, 0.9)',
              boxShadow: '0 0 32px rgba(56, 152, 255, 0.45), inset 0 0 22px rgba(56, 152, 255, 0.14)',
              opacity: alpha,
              transform: `scale(${0.97 + 0.03 * enter})`,
              pointerEvents: 'none',
            }}
          >
            {b.label && (
              <div
                style={{
                  position: 'absolute',
                  top: -15,
                  left: 16,
                  padding: '3px 12px',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #0070ba, #0ea5e9)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  boxShadow: '0 4px 14px rgba(0, 112, 186, 0.5)',
                  whiteSpace: 'nowrap',
                }}
              >
                {b.label}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

const ClickOverlay: React.FC<{ clicks: ClickMarker[] }> = ({ clicks }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <>
      {clicks.map((ck, i) => {
        const startApproach = ck.atSec - 0.6;
        const endFade = ck.atSec + 1.1;
        if (t < startApproach || t > endFade) return null;

        const approach = interpolate(t, [startApproach, ck.atSec - 0.08], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
        const press = t >= ck.atSec - 0.08 && t <= ck.atSec + 0.14 ? 0.82 : 1;
        const cursorOpacity = Math.min(
          interpolate(t, [startApproach, startApproach + 0.18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          interpolate(t, [endFade - 0.25, endFade], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        );

        const rippleT = Math.max(0, t - ck.atSec);
        const ripple1 = rippleT > 0 ? interpolate(rippleT, [0, 0.55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
        const ripple2 = rippleT > 0.1 ? interpolate(rippleT - 0.1, [0, 0.55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;

        const dx = (1 - approach) * 56;
        const dy = (1 - approach) * 44;

        return (
          <div key={i} style={{ position: 'absolute', left: `${ck.x}%`, top: `${ck.y}%`, pointerEvents: 'none', opacity: cursorOpacity }}>
            {rippleT > 0 && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: -(14 + 44 * ripple1),
                    top: -(14 + 44 * ripple1),
                    width: 28 + 88 * ripple1,
                    height: 28 + 88 * ripple1,
                    borderRadius: '50%',
                    border: '3px solid rgba(56, 189, 248, 0.95)',
                    boxShadow: '0 0 18px rgba(56, 189, 248, 0.65)',
                    opacity: 1 - ripple1,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: -(10 + 34 * ripple2),
                    top: -(10 + 34 * ripple2),
                    width: 20 + 68 * ripple2,
                    height: 20 + 68 * ripple2,
                    borderRadius: '50%',
                    border: '2px solid rgba(52, 211, 153, 0.85)',
                    opacity: 1 - ripple2,
                  }}
                />
              </>
            )}

            <div style={{ transform: `translate(${dx}px, ${dy}px) scale(${press})` }}>
              <svg width="34" height="34" viewBox="0 0 28 28" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.65))' }}>
                <path d="M4 3L23 14.5L14.5 16.5L10.5 24.5L4 3Z" fill="#ffffff" stroke="#0070ba" strokeWidth="2.2" strokeLinejoin="round" />
              </svg>
            </div>

            {ck.label && rippleT > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: 22,
                  top: -26,
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: 'rgba(6, 12, 24, 0.94)',
                  border: '1px solid rgba(56, 189, 248, 0.75)',
                  color: '#e0f2fe',
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.55)',
                  opacity: interpolate(rippleT, [0, 0.12, 0.85, 1.05], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                }}
              >
                {ck.label}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

const zoomAt = (zooms: Zoom[], t: number): Zoom => {
  if (!zooms.length) return { t, s: 1, x: 50, y: 50 };
  const z = [...zooms].sort((p, q) => p.t - q.t);
  if (t <= z[0].t) return z[0];
  for (let i = 0; i < z.length - 1; i++) {
    if (t < z[i + 1].t) {
      const u = Easing.inOut(Easing.cubic)((t - z[i].t) / (z[i + 1].t - z[i].t));
      return { t, s: z[i].s + (z[i + 1].s - z[i].s) * u, x: z[i].x + (z[i + 1].x - z[i].x) * u, y: z[i].y + (z[i + 1].y - z[i].y) * u };
    }
  }
  return z[z.length - 1];
};

const SegmentVideo: React.FC<{ clip: string; fadeInFrames: number }> = ({ clip, fadeInFrames }) => {
  const frame = useCurrentFrame();
  const o = fadeInFrames > 0 ? interpolate(frame, [0, fadeInFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <OffthreadVideo src={staticFile(clip)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </AbsoluteFill>
  );
};

export const Chapter: React.FC<{ c: ChapterData; index: number }> = ({ c, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Elevation cut: 3D lifted entrance + subtle drop before next cut
  const enterSpring = spring({ frame, fps, config: { damping: 18, stiffness: 210, mass: 0.78 } });
  const exitDip = interpolate(frame, [Math.max(0, c.frames - 8), c.frames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fade = Math.min(
    interpolate(frame, [0, c.transition.fadeInFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    interpolate(frame, [Math.max(0, c.frames - 6), c.frames], [1, 0.35], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  );
  const elevY = (1 - enterSpring) * 28 - exitDip * 16;
  const elevScale = (0.96 + 0.04 * enterSpring) * (1 - 0.025 * exitDip);
  const z = zoomAt(c.zooms, t);
  const seg = c.segments.find((s) => frame >= s.fromFrame && frame < s.toFrame);
  const noteOpacity = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: FONT }}>
      <AbsoluteFill
        style={{
          opacity: fade,
          transform: `perspective(1400px) translateY(${elevY.toFixed(2)}px) scale(${elevScale.toFixed(4)})`,
          boxShadow: '0 28px 80px rgba(0, 112, 186, 0.25)',
        }}
      >
        <AbsoluteFill style={{ transform: `scale(${z.s.toFixed(4)})`, transformOrigin: `${z.x}% ${z.y}%` }}>
          {c.segments.map((s) => (
            <Sequence key={s.id} from={s.fromFrame} durationInFrames={s.toFrame - s.fromFrame}>
              <SegmentVideo clip={s.clip} fadeInFrames={s.fadeInFrames} />
            </Sequence>
          ))}
          <FocusOverlay boxes={c.focuses || []} />
          <ClickOverlay clicks={c.clicks || []} />
        </AbsoluteFill>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, transparent 62%, rgba(4,7,14,0.42) 100%)',
        }}
      />

      <EventChip c={c} />
      {seg?.note && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 64, display: 'flex', justifyContent: 'center', opacity: noteOpacity, zIndex: 40 }}>
          <div style={{ padding: '5px 16px', borderRadius: 999, background: 'rgba(6,78,59,0.92)', border: '1px solid rgba(52,211,153,0.55)', color: '#d1fae5', fontSize: 13, fontWeight: 800, letterSpacing: '0.09em', boxShadow: '0 8px 22px rgba(0,0,0,0.45)' }}>
            {seg.note}
          </div>
        </div>
      )}
      <TitleLowerThird c={c} index={index} />
      <Captions c={c} />
    </AbsoluteFill>
  );
};
