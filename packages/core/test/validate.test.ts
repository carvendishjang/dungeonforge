import { describe, it, expect } from 'vitest';
import { floodFill, checkConnectivity } from '../src/validate';
import { generateBspDungeon } from '../src/generate';
import type { Tile } from '../src/types';

// Build tiles from ASCII art: '#' wall, '.' floor, ',' corridor
const parse = (art: string): Tile[][] =>
  art.trim().split('\n').map((line) =>
    [...line.trim()].map((c): Tile => (c === '#' ? 'wall' : c === ',' ? 'corridor' : 'floor')),
  );

describe('floodFill', () => {
  it('counts steps along a corridor', () => {
    const dist = floodFill(parse(`
      #####
      #...#
      #####`), { x: 1, y: 1 });
    expect(dist.get(1, 1)).toBe(0);
    expect(dist.get(2, 1)).toBe(1);
    expect(dist.get(3, 1)).toBe(2);
    expect(dist.get(0, 0)).toBe(-1); // wall never reached
  });

  it('finds the SHORTEST distance around a loop', () => {
    const dist = floodFill(parse(`
      #####
      #...#
      #.#.#
      #...#
      #####`), { x: 1, y: 1 });
    expect(dist.get(3, 3)).toBe(4); // either way round is 4 steps
  });

  it('does not move diagonally', () => {
    const dist = floodFill(parse(`
      ####
      #.##
      ##.#
      ####`), { x: 1, y: 1 });
    expect(dist.get(2, 2)).toBe(-1);
  });

  it('walks through corridors too', () => {
    const dist = floodFill(parse(`
      #######
      #.,,,.#
      #######`), { x: 1, y: 1 });
    expect(dist.get(5, 1)).toBe(4);
  });

  it('starting on a wall reaches nothing', () => {
    const dist = floodFill(parse(`
      ###
      #.#
      ###`), { x: 0, y: 0 });
    expect(dist.get(1, 1)).toBe(-1);
  });
});

describe('checkConnectivity', () => {
  it('detects two separate regions', () => {
    expect(checkConnectivity(parse(`
      #######
      #..#..#
      #######`))).toEqual({ walkable: 4, reached: 2, connected: false });
  });

  it('a single region is connected', () => {
    expect(checkConnectivity(parse(`
      #####
      #.,.#
      #####`))).toEqual({ walkable: 3, reached: 3, connected: true });
  });

  it('an all-wall map counts as connected', () => {
    expect(checkConnectivity(parse(`
      ###
      ###`))).toEqual({ walkable: 0, reached: 0, connected: true });
  });

  it('every generated BSP dungeon is fully connected (200 seeds)', () => {
    for (let seed = 0; seed < 200; seed++) {
      const map = generateBspDungeon({
        seed, width: 60, height: 30, minLeafSize: 6, maxDepth: 4, minRoomSize: 3,
      });
      const report = checkConnectivity(map.tiles);
      expect(report.connected, `seed ${seed}: ${JSON.stringify(report)}`).toBe(true);
    }
  });
});