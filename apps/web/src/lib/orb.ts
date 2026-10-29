export interface OrbSettings {
  hue: number;
  wobble: number;
  speed: number;
  lobes: number;
}

export interface Preset {
  id: number;
  name: string;
  settings: OrbSettings;
}

export const DEFAULT_ORB_SETTINGS: OrbSettings = { hue: 190, wobble: 0.35, speed: 1, lobes: 5 };

export const ORB_CONTROLS: {
  key: keyof OrbSettings;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: 'hue', label: 'Hue', min: 0, max: 360, step: 1 },
  { key: 'wobble', label: 'Wobble', min: 0, max: 1, step: 0.01 },
  { key: 'speed', label: 'Speed', min: 0.1, max: 3, step: 0.1 },
  { key: 'lobes', label: 'Lobes', min: 3, max: 8, step: 1 },
];

const SEGMENTS = 180;

// Radius of the blob outline at angle theta. Two sine waves with different
// lobe counts and directions make the surface slosh instead of pulse.
export function orbRadius(theta: number, time: number, settings: OrbSettings, base: number): number {
  const t = time * settings.speed;
  const slosh =
    0.22 * Math.sin(settings.lobes * theta + t * 2) +
    0.1 * Math.sin((settings.lobes + 3) * theta - t * 1.3);
  return base * (1 + settings.wobble * slosh);
}

export function drawOrb(
  ctx: CanvasRenderingContext2D,
  size: number,
  time: number,
  settings: OrbSettings,
) {
  const cx = size / 2;
  const cy = size / 2;
  const base = size * 0.34;

  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  for (let i = 0; i <= SEGMENTS; i++) {
    const theta = (i / SEGMENTS) * Math.PI * 2;
    const r = orbRadius(theta, time, settings, base);
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const body = ctx.createRadialGradient(cx - base * 0.3, cy - base * 0.35, base * 0.1, cx, cy, base * 1.3);
  body.addColorStop(0, `hsl(${settings.hue} 90% 85%)`);
  body.addColorStop(0.55, `hsl(${settings.hue} 80% 55%)`);
  body.addColorStop(1, `hsl(${(settings.hue + 40) % 360} 75% 30%)`);
  ctx.fillStyle = body;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx - base * 0.35, cy - base * 0.4, base * 0.25, base * 0.14, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fill();
}
