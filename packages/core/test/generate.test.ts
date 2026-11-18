import { describe, it, expect } from 'vitest';
import { generateBspDungeon, type GenerateOptions } from '../src/generate';

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