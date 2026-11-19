import { describe, it, expect } from 'vitest';
import { Grid } from '../src/grid';
import { toAscii } from '../src/ascii';
import { createRng } from '../src/rng';
import { countWallNeighbours, smoothStep, generateCaves, keepLargestRegion, type CaveOptions } from '../src/caves';
import { checkConnectivity } from '../src/validate';
import type { Tile } from '../src/types';

// ASCII art → Grid: '#' wall, '.' floor
function parseGrid(art: string): Grid<Tile> {
  const lines = art.trim().split('\n').map((l) => l.trim());
  const grid = new Grid<Tile>(lines[0].length, lines.length, 'wall');
  lines.forEach((line, y) => [...line].forEach((c, x) => grid.set(x, y, c === '#' ? 'wall' : 'floor')));
  return grid;
}

describe('countWallNeighbours', () => {
  const open = parseGrid(`
    ...
    ...
    ...`);

  it('counts 0 in the middle of open floor', () => {
    expect(countWallNeighbours(open, 1, 1)).toBe(0);
  });

  it('counts off-map tiles as walls (corner = 5 off-map)', () => {
    expect(countWallNeighbours(open, 0, 0)).toBe(5);
  });

  it('does not count the tile itself', () => {
    const solid = new Grid<Tile>(3, 3, 'wall');
    expect(countWallNeighbours(solid, 1, 1)).toBe(8);
  });
});

describe('smoothStep', () => {
  it('applies the 4-5 rule', () => {
    const before = parseGrid(`
      #####
      #...#
      #.#.#
      #...#
      #####`);
    // corners of the ring have 6 wall neighbours → wall
    // edges have 4 → unchanged (floor); centre has 0 → floor
    expect(toAscii(smoothStep(before))).toBe(
      '#####\n' +
      '##.##\n' +
      '#...#\n' +
      '##.##\n' +
      '#####',
    );
  });

  it('does not change its input (double buffering)', () => {
    const before = parseGrid(`
      #####
      #...#
      #.#.#
      #...#
      #####`);
    const snapshot = toAscii(before);
    smoothStep(before);
    expect(toAscii(before)).toBe(snapshot);
  });

  it('keeps the border solid', () => {
    const open = new Grid<Tile>(6, 4, 'floor');
    const after = smoothStep(open);
    for (let x = 0; x < 6; x++) {
      expect(after.get(x, 0)).toBe('wall');
      expect(after.get(x, 3)).toBe('wall');
    }
  });
});

describe('generateCaves', () => {
  const opts: CaveOptions = { width: 60, height: 30, fillChance: 0.45, iterations: 5 };

  it('is deterministic', () => {
    expect(toAscii(generateCaves(createRng(42), opts))).toBe(toAscii(generateCaves(createRng(42), opts)));
  });

  it('has both walls and floor, and a solid border', () => {
    const tiles = generateCaves(createRng(42), opts).toRows();
    expect(tiles.flat()).toContain('wall');
    expect(tiles.flat()).toContain('floor');
    expect(tiles[0].every((t) => t === 'wall')).toBe(true);
    expect(tiles[29].every((t) => t === 'wall')).toBe(true);
    expect(tiles.every((row) => row[0] === 'wall' && row[59] === 'wall')).toBe(true);
  });

   it('smoothing reduces noise (fewer isolated single tiles)', () => {
    // a "speck" = a floor tile boxed in by 8 walls, or a wall tile with 0 wall neighbours
    const specks = (g: Grid<Tile>) => {
      let n = 0;
      for (let y = 1; y < g.height - 1; y++)
        for (let x = 1; x < g.width - 1; x++) {
          const walls = countWallNeighbours(g, x, y);
          if (g.get(x, y) === 'floor' && walls === 8) n++;
          if (g.get(x, y) === 'wall' && walls === 0) n++;
        }
      return n;
    };
    const raw = generateCaves(createRng(7), { ...opts, iterations: 0 });
    const smooth = generateCaves(createRng(7), opts);
    expect(specks(raw)).toBeGreaterThan(0);              // guard: the test means something
    expect(specks(smooth)).toBeLessThan(specks(raw));
  });
});

describe('keepLargestRegion', () => {
  it('keeps the big region and fills the small one', () => {
    const before = parseGrid(`
      #########
      #...#..##
      #...#####
      #...#.###
      #########`);
    // left room = 9 tiles, top-right = 2 tiles, middle-right = 1 tile
    expect(toAscii(keepLargestRegion(before))).toBe(
      '#########\n' +
      '#...#####\n' +
      '#...#####\n' +
      '#...#####\n' +
      '#########',
    );
  });

  it('does not change its input', () => {
    const before = parseGrid(`
      #####
      #.#.#
      #####`);
    const snapshot = toAscii(before);
    keepLargestRegion(before);
    expect(toAscii(before)).toBe(snapshot);
  });

  it('on a tie, keeps the first region (top-left)', () => {
    const before = parseGrid(`
      #####
      #.#.#
      #####`);
    expect(toAscii(keepLargestRegion(before))).toBe('#####\n#.###\n#####');
  });

  it('returns all wall when there is no floor', () => {
    const solid = new Grid<Tile>(4, 3, 'wall');
    expect(toAscii(keepLargestRegion(solid))).toBe(toAscii(solid));
  });

  it('makes generated caves fully connected (100 seeds)', () => {
    const opts: CaveOptions = { width: 60, height: 30, fillChance: 0.45, iterations: 5 };
    for (let seed = 1; seed <= 100; seed++) {
      const cave = keepLargestRegion(generateCaves(createRng(seed), opts));
      const report = checkConnectivity(cave.toRows());
      expect(report.walkable, `seed ${seed} has no floor`).toBeGreaterThan(0);
      expect(report.connected, `seed ${seed}`).toBe(true);
    }
  });
});