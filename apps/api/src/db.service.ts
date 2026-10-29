import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS items (id SERIAL PRIMARY KEY, title TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())',
  'CREATE TABLE IF NOT EXISTS presets (id SERIAL PRIMARY KEY, name TEXT NOT NULL, settings JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT now())',
];

@Injectable()
export class DbService implements OnModuleDestroy {
  private readonly pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, max: 3 })
    : null;
  private ready: Promise<void> | null = null;

  get enabled(): boolean {
    return this.pool !== null;
  }

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    const pool = this.pool;
    if (!pool) throw new Error('DATABASE_URL is not set');
    this.ready ??= this.createSchema(pool);
    await this.ready;
    const res = await pool.query(sql, params);
    return res.rows as T[];
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  private async createSchema(pool: Pool): Promise<void> {
    for (const statement of SCHEMA) {
      await pool.query(statement);
    }
  }
}
