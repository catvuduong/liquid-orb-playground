import { BadRequestException } from '@nestjs/common';

export interface OrbSettings {
  hue: number;
  wobble: number;
  speed: number;
  lobes: number;
}

const RANGES: Record<
  keyof OrbSettings,
  { min: number; max: number; integer?: boolean }
> = {
  hue: { min: 0, max: 360 },
  wobble: { min: 0, max: 1 },
  speed: { min: 0.1, max: 3 },
  lobes: { min: 3, max: 8, integer: true },
};

export function parseOrbSettings(input: unknown): OrbSettings {
  if (typeof input !== 'object' || input === null) {
    throw new BadRequestException('settings must be an object');
  }
  const values = input as Record<string, unknown>;
  const settings = {} as OrbSettings;
  for (const key of Object.keys(RANGES) as (keyof OrbSettings)[]) {
    const { min, max, integer } = RANGES[key];
    const value = values[key];
    const valid =
      typeof value === 'number' &&
      value >= min &&
      value <= max &&
      (!integer || Number.isInteger(value));
    if (!valid) {
      throw new BadRequestException(
        `${key} must be ${integer ? 'an integer' : 'a number'} between ${min} and ${max}`,
      );
    }
    settings[key] = value;
  }
  return settings;
}
