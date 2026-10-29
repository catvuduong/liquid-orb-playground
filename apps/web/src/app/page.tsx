'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { LiquidOrb } from '@/components/LiquidOrb';
import { DEFAULT_ORB_SETTINGS, ORB_CONTROLS, type OrbSettings, type Preset } from '@/lib/orb';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) throw new Error(`${path} responded ${res.status}`);
  return res.json();
}

export default function Home() {
  const [health, setHealth] = useState<string>('checking...');
  const [settings, setSettings] = useState<OrbSettings>(DEFAULT_ORB_SETTINGS);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => r.json())
      .then((d) => setHealth(`api ${d.status} / db ${d.db}`))
      .catch(() => setHealth('api unreachable'));

    request<Preset[]>('/presets')
      .then(setPresets)
      .catch(() => setStatus('presets unavailable'));
  }, []);

  async function savePreset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const saved = await request<Preset>('/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, settings }),
      });
      setPresets((list) => [saved, ...list]);
      setName('');
      setStatus(`saved "${saved.name}"`);
    } catch {
      setStatus('could not save preset');
    }
  }

  function loadPreset(preset: Preset) {
    setSettings(preset.settings);
    setStatus(`loaded "${preset.name}"`);
  }

  return (
    <main style={{ padding: '32px 16px', fontFamily: 'system-ui', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <h1>liquid-orb-playground</h1>
        <p data-testid="health">{health}</p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
        <LiquidOrb settings={settings} />

        <section style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 240, flex: '1 1 240px' }}>
          {ORB_CONTROLS.map(({ key, label, min, max, step }) => (
            <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>
                {label} <output data-testid={`value-${key}`}>{settings[key]}</output>
              </span>
              <input
                type="range"
                name={key}
                aria-label={label}
                min={min}
                max={max}
                step={step}
                value={settings[key]}
                onChange={(e) => setSettings((s) => ({ ...s, [key]: Number(e.target.value) }))}
              />
            </label>
          ))}

          <form onSubmit={savePreset} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              aria-label="Preset name"
              placeholder="Preset name"
              value={name}
              maxLength={60}
              required
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit">Save preset</button>
          </form>
          <p data-testid="status" aria-live="polite">{status}</p>
        </section>
      </div>

      <section>
        <h2>Presets</h2>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, listStyle: 'none' }}>
          {presets.map((preset) => (
            <li key={preset.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span data-testid="preset-name">{preset.name}</span>
              <button type="button" onClick={() => loadPreset(preset)}>
                Load
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
