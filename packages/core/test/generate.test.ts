import { describe, it, expect } from 'vitest';
import { createConfig, generate, generateBspDungeon, isMode, type DungeonConfig, type GenerateOptions } from '../src/generate';
import { checkConnectivity } from '../src/validate';

const opts: GenerateOptions = {
  seed: 42, width: 60, height: 30, minLeafSize: 6, maxDepth: 4, minRoomSize: 3,
};

describe('generateBspDungeon', () => {
  it('is deterministic for the same seed', () => {
    expect(generateBspDungeon(opts)).toEqual(generateBspDungeon(opts));
  });

  it('different seeds give different maps', () => {
    expect(generateBspDungeon(opts).tiles).not.toEqual(generateBspDungeon({ ...opts, seed: 43 }).tiles);
  });

  it('has the right dimensions and echoes its seed', () => {
    const map = generateBspDungeon(opts);
    expect(map.tiles).toHaveLength(opts.height);
    for (const row of map.tiles) expect(row).toHaveLength(opts.width);
    expect(map.seed).toBe(42);
  });

  it('keeps the outer border solid wall', () => {
    for (let seed = 0; seed < 20; seed++) {
      const { tiles, width, height } = generateBspDungeon({ ...opts, seed });
      for (let x = 0; x < width; x++) {
        expect(tiles[0][x]).toBe('wall');
        expect(tiles[height - 1][x]).toBe('wall');
      }
      for (let y = 0; y < height; y++) {
        expect(tiles[y][0]).toBe('wall');
        expect(tiles[y][width - 1]).toBe('wall');
      }
    }
  });

  it('every room tile is floor, and corridors exist', () => {
    const map = generateBspDungeon(opts);
    for (const r of map.rooms) {
      for (let y = r.y; y < r.y + r.height; y++) {
        for (let x = r.x; x < r.x + r.width; x++) {
          expect(map.tiles[y][x]).toBe('floor');
        }
      }
    }
    expect(map.tiles.flat()).toContain('corridor');
  });
});

describe('generate (discriminated union)', () => {
  const caves: DungeonConfig = { mode: 'caves', seed: 36, width: 60, height: 30, fillChance: 0.45, iterations: 5 };

  it("mode 'bsp' gives exactly what generateBspDungeon gives", () => {
    expect(generate({ mode: 'bsp', ...opts })).toEqual(generateBspDungeon(opts));
  });

  it("mode 'caves' returns a connected map with no rooms", () => {
    const map = generate(caves);
    expect(map.width).toBe(60);
    expect(map.height).toBe(30);
    expect(map.rooms).toEqual([]);
    expect(checkConnectivity(map.tiles).walkable).toBeGreaterThan(0);
    expect(checkConnectivity(map.tiles).connected).toBe(true);
  });

  it("mode 'caves' is deterministic", () => {
    expect(generate(caves)).toEqual(generate(caves));
  });

  it('throws on an unknown mode at runtime (e.g. bad JSON from the API)', () => {
    const bad = { mode: 'lava', seed: 1 } as unknown as DungeonConfig;
    expect(() => generate(bad)).toThrow(/Unknown mode/);
  });

  it('rejects mixed-up options at compile time', () => {
    // @ts-expect-error: caves mode needs fillChance/iterations, not BSP options
    const wrong: DungeonConfig = { mode: 'caves', seed: 1, width: 10, height: 10, minLeafSize: 6, maxDepth: 4, minRoomSize: 3 };
    expect(wrong.mode).toBe('caves');
  });
});

describe('createConfig / isMode', () => {
  it('fills in the default tuning for each mode', () => {
    expect(createConfig('bsp', 1, 60, 30)).toEqual(
      { mode: 'bsp', seed: 1, width: 60, height: 30, minLeafSize: 6, maxDepth: 4, minRoomSize: 3 });
    expect(createConfig('caves', 1, 60, 30)).toEqual(
      { mode: 'caves', seed: 1, width: 60, height: 30, fillChance: 0.45, iterations: 5 });
  });

  it('isMode accepts only known modes', () => {
    expect(isMode('bsp')).toBe(true);
    expect(isMode('caves')).toBe(true);
    expect(isMode('lava')).toBe(false);
    expect(isMode('BSP')).toBe(false);   // case-sensitive
  });
});