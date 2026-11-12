import React from 'react';
import { Composition } from 'remotion';
import { Film } from './Film';
import manifest from '../chapter-manifest.json';
import type { FilmManifest } from './theme';

const m = manifest as unknown as FilmManifest;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GenesisExplainer"
    component={Film}
    width={1920}
    height={1080}
    fps={m.fps}
    durationInFrames={m.totalFrames}
    defaultProps={{ manifest: m }}
  />
);

