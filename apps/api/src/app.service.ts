import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DbService } from './db.service.js';
import type { OrbSettings } from './orb-settings.js';

export interface Item {
  id: number;
  title: string;
}

export interface Preset {
  id: number;
  name: string;
  settings: OrbSettings;
}

@Injectable()
export class AppService {
  constructor(private readonly db: DbService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async health(): Promise<{ status: 'ok'; db: 'up' | 'down' | 'disabled' }> {
    if (!this.db.enabled) return { status: 'ok', db: 'disabled' };
    try {
      await this.db.query('SELECT 1');
      return { status: 'ok', db: 'up' };
    } catch {
      return { status: 'ok', db: 'down' };
    }
  }

  listItems(): Promise<Item[]> {
    return this.db.query<Item>('SELECT id, title FROM items ORDER BY id DESC LIMIT 50');
  }

  async addItem(title: string): Promise<Item> {
    const rows = await this.db.query<Item>(
      'INSERT INTO items (title) VALUES ($1) RETURNING id, title',
      [title],
    );
    return rows[0];
  }

  async listPresets(): Promise<Preset[]> {
    this.requireDb();
    return this.db.query<Preset>(
      'SELECT id, name, settings FROM presets ORDER BY id DESC LIMIT 50',
    );
  }

  async addPreset(name: string, settings: OrbSettings): Promise<Preset> {
    this.requireDb();
    const rows = await this.db.query<Preset>(
      'INSERT INTO presets (name, settings) VALUES ($1, $2) RETURNING id, name, settings',
      [name, settings],
    );
    return rows[0];
  }

  private requireDb() {
    if (!this.db.enabled)
      throw new ServiceUnavailableException('presets need DATABASE_URL');
  }
}
