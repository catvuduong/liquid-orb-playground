'use client';

import { useEffect, useRef } from 'react';
import { drawOrb, type OrbSettings } from '@/lib/orb';

const SIZE = 320;

export function LiquidOrb({ settings }: { settings: OrbSettings }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let time = 0;
    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      if (!still) time += (now - last) / 1000;
      last = now;
      drawOrb(ctx, SIZE, time, settingsRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Liquid orb"
      data-testid="orb"
      style={{ width: SIZE, height: SIZE, maxWidth: '100%' }}
    />
  );
}
