import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createConfig, generate } from '@dungeonforge/core';
import { createApp } from '../src/app';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let server: Server;
let baseUrl: string;

// Port 0 = "the OS picks any free port", so tests never clash with a running dev server
beforeAll(async () => {
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://localhost:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const postRaw = (body: string) =>
  fetch(`${baseUrl}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
const post = (body: unknown) => postRaw(JSON.stringify(body));

describe('GET /api/health', () => {
  it('says ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

describe('POST /api/generate', () => {
  it('returns exactly what core generates', async () => {
    const res = await post({ mode: 'caves', seed: 36, width: 60, height: 30 });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(generate(createConfig('caves', 36, 60, 30)));
  });

  it('fills in defaults for missing fields', async () => {
    const map = await (await post({})).json();
    expect(map.seed).toBe(42);
    expect(map.width).toBe(60);
    expect(map.height).toBe(30);
  });

  it('rejects bad values with 400 and lists every problem', async () => {
    const res = await post({ mode: 'lava', width: 5 });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.issues.map((i: { path: string }) => i.path)).toEqual(['mode', 'width']);
  });

  it.each([
    ['a string seed', { seed: '42' }],
    ['a decimal seed', { seed: 1.5 }],
    ['a negative seed', { seed: -1 }],
    ['an unknown field (typo)', { seeds: 42 }],
  ])('rejects %s', async (_name, body) => {
    expect((await post(body)).status).toBe(400);
  });

  it('answers malformed JSON with a JSON 400, not an HTML stack trace', async () => {
    const res = await postRaw('{bad');
    expect(res.status).toBe(400);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
    expect(await res.json()).toEqual({ error: expect.any(String) });
  });

  it('rejects bodies over 10 kB with 413', async () => {
    expect((await post({ pad: 'x'.repeat(20_000) })).status).toBe(413);
  });
});

describe('serving the web build', () => {
  it('serves index.html at / and still answers the API', async () => {
    // a throwaway folder with a fake index.html: the test doesn't depend on a real build
    const dir = mkdtempSync(join(tmpdir(), 'df-web-'));
    writeFileSync(join(dir, 'index.html'), '<!doctype html><title>DungeonForge</title>');

    const s = createApp({ staticDir: dir }).listen(0);
    await new Promise<void>((resolve) => s.once('listening', () => resolve()));
    const url = `http://localhost:${(s.address() as AddressInfo).port}`;

    try {
      const page = await fetch(`${url}/`);
      expect(page.status).toBe(200);
      expect(page.headers.get('content-type')).toMatch(/text\/html/);
      expect(await page.text()).toContain('DungeonForge');
      expect((await fetch(`${url}/api/health`)).status).toBe(200);
    } finally {
      await new Promise<void>((resolve) => s.close(() => resolve()));
    }
  });
});