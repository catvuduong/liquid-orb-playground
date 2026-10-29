import { BadRequestException } from '@nestjs/common';
import { parseOrbSettings } from './orb-settings.js';

const valid = { hue: 190, wobble: 0.35, speed: 1, lobes: 5 };

describe('parseOrbSettings', () => {
  it('accepts settings within range', () => {
    expect(parseOrbSettings(valid)).toEqual(valid);
  });

  it('accepts the range edges', () => {
    expect(
      parseOrbSettings({ hue: 360, wobble: 0, speed: 0.1, lobes: 8 }),
    ).toEqual({
      hue: 360,
      wobble: 0,
      speed: 0.1,
      lobes: 8,
    });
  });

  it('drops unknown keys', () => {
    expect(parseOrbSettings({ ...valid, extra: 'x' })).toEqual(valid);
  });

  it('rejects a non-object', () => {
    expect(() => parseOrbSettings(null)).toThrow(BadRequestException);
    expect(() => parseOrbSettings('hue')).toThrow(BadRequestException);
  });

  it('rejects a missing or non-numeric field', () => {
    expect(() => parseOrbSettings({ ...valid, hue: undefined })).toThrow(
      BadRequestException,
    );
    expect(() => parseOrbSettings({ ...valid, wobble: '0.5' })).toThrow(
      BadRequestException,
    );
    expect(() => parseOrbSettings({ ...valid, speed: NaN })).toThrow(
      BadRequestException,
    );
  });

  it('rejects values outside the range', () => {
    expect(() => parseOrbSettings({ ...valid, hue: 361 })).toThrow(
      BadRequestException,
    );
    expect(() => parseOrbSettings({ ...valid, wobble: -0.1 })).toThrow(
      BadRequestException,
    );
    expect(() => parseOrbSettings({ ...valid, speed: 3.5 })).toThrow(
      BadRequestException,
    );
  });

  it('requires lobes to be a whole number', () => {
    expect(() => parseOrbSettings({ ...valid, lobes: 5.5 })).toThrow(
      BadRequestException,
    );
    expect(() => parseOrbSettings({ ...valid, lobes: 2 })).toThrow(
      BadRequestException,
    );
  });
});
