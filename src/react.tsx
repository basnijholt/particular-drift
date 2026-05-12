import React, { CSSProperties, useEffect, useRef } from 'react';

import {
  ParticularDriftInstance,
  ParticularDriftUserOptions,
  createParticularDrift,
} from './index';

export type ParticularDriftCanvasProps = Omit<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  'children'
> & {
  imageUrl: string;
  options?: ParticularDriftUserOptions;
};

const fullSizeCanvasStyle: CSSProperties = {
  display: 'block',
  height: '100%',
  width: '100%',
};

export const ParticularDriftCanvas = ({
  imageUrl,
  options,
  style,
  ...props
}: ParticularDriftCanvasProps): React.JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<ParticularDriftInstance>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let disposed = false;

    createParticularDrift(canvas, { ...options, imageUrl }).then((instance) => {
      if (disposed) {
        instance.destroy();
        return;
      }
      instanceRef.current = instance;
    });

    return () => {
      disposed = true;
      instanceRef.current?.destroy();
      instanceRef.current = undefined;
    };
  }, [imageUrl, options]);

  return (
    <canvas
      aria-hidden="true"
      {...props}
      ref={canvasRef}
      style={{ ...fullSizeCanvasStyle, ...style }}
    />
  );
};
