import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DbService } from './db.service.js';

describe('AppController', () => {
  let appController: AppController;
  const db = { enabled: false, query: vi.fn() };
  const settings = { hue: 190, wobble: 0.35, speed: 1, lobes: 5 };

  beforeEach(async () => {
    db.enabled = false;
    db.query.mockReset();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: DbService, useValue: db }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should return "Hello World!"', () => {
    expect(appController.getHello()).toBe('Hello World!');
  });

  it('health reports db disabled without DATABASE_URL', async () => {
    expect(await appController.health()).toEqual({ status: 'ok', db: 'disabled' });
  });

  it('rejects an empty item title', () => {
    expect(() => appController.addItem({ title: '  ' })).toThrow(
      BadRequestException,
    );
  });

  it('rejects a preset without a name', () => {
    expect(() => appController.addPreset({ name: '  ', settings })).toThrow(
      BadRequestException,
    );
    expect(() => appController.addPreset({ name: 42, settings })).toThrow(
      BadRequestException,
    );
  });

  it('rejects a preset name longer than 60 characters', () => {
    expect(() =>
      appController.addPreset({ name: 'x'.repeat(61), settings }),
    ).toThrow(BadRequestException);
  });

  it('rejects a preset with invalid settings', () => {
    expect(() =>
      appController.addPreset({ name: 'Calm', settings: { hue: 400 } }),
    ).toThrow(BadRequestException);
  });

  it('saves a valid preset with a trimmed name', async () => {
    db.enabled = true;
    const row = { id: 1, name: 'Calm', settings };
    db.query.mockResolvedValue([row]);

    expect(await appController.addPreset({ name: ' Calm ', settings })).toEqual(
      row,
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO presets'),
      ['Calm', settings],
    );
  });

  it('lists presets when the database is enabled', async () => {
    db.enabled = true;
    const rows = [{ id: 1, name: 'Calm', settings }];
    db.query.mockResolvedValue(rows);

    expect(await appController.listPresets()).toEqual(rows);
  });

  it('returns 503 for presets without DATABASE_URL', async () => {
    await expect(appController.listPresets()).rejects.toThrow(
      ServiceUnavailableException,
    );
    await expect(
      appController.addPreset({ name: 'Calm', settings }),
    ).rejects.toThrow(ServiceUnavailableException);
    expect(db.query).not.toHaveBeenCalled();
  });
});
