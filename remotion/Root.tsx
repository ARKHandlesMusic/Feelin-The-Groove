'use client';

import React from 'react';
import {Composition, REMOTION_CONFIG} from 'remotion';
import {
  FindItsGrooveComposition,
  FindItsGrooveCompositionProps,
} from './FindItsGrooveComposition';

/**
 * Remotion Root registering the 4K 60fps Three.js Music Video Composition
 */
export const RemotionRoot: React.FC<FindItsGrooveCompositionProps> = (props) => {
  return (
    <Composition
      id={REMOTION_CONFIG.id}
      component={FindItsGrooveComposition}
      durationInFrames={REMOTION_CONFIG.durationInFrames}
      fps={REMOTION_CONFIG.fps}
      width={REMOTION_CONFIG.width}
      height={REMOTION_CONFIG.height}
      defaultProps={props}
    />
  );
};

export default RemotionRoot;
