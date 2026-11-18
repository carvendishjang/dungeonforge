import { describe, it, expect } from 'vitest';
import { Grid } from '../src/grid';
import { toAscii } from '../src/ascii';
import type { Tile } from '../src/types';

describe('Grid', () => {
  it('starts filled with the fill value', () => {
    const g = new Grid<Tile>(3, 2, 'wall');
    expect(g.toRows()).toEqual([
      ['wall', 'wall', 'wall'],
      ['wall', 'wall', 'wall'],
    ]);
  });

  it('get returns what set stored (x and y not swapped)', () => {
    const g = new Grid<number>(4, 4, 0);
    g.set(3, 1, 7);
    expect(g.get(3, 1)).toBe(7);
    expect(g.get(1, 3)).toBe(0);
  });

  it('inBounds checks all four edges', () => {
    const g = new Grid<number>(4, 3, 0);
    expect(g.inBounds(0, 0)).toBe(true);
    expect(g.inBounds(3, 2)).toBe(true);
    expect(g.inBounds(4, 0)).toBe(false);
    expect(g.inBounds(0, 3)).toBe(false);
    expect(g.inBounds(-1, 0)).toBe(false);
  });

  it('get throws outside the grid', () => {
    const g = new Grid<number>(2, 2, 0);
    expect(() => g.get(2, 0)).toThrow();
  });

  it('fillRect fills exactly the rect', () => {
    const g = new Grid<Tile>(5, 5, 'wall');
    g.fillRect({ x: 1, y: 1, width: 3, height: 2 }, 'floor');
    const floors = g.toRows().flat().filter((t) => t === 'floor');
    expect(floors).toHaveLength(6);
    expect(g.get(0, 0)).toBe('wall');
    expect(g.get(3, 2)).toBe('floor');
    expect(g.get(4, 3)).toBe('wall');
  });
});

describe('toAscii', () => {
  it('draws one character per tile, one line per row', () => {
    const g = new Grid<Tile>(4, 3, 'wall');
    g.fillRect({ x: 1, y: 1, width: 2, height: 1 }, 'floor');
    expect(toAscii(g)).toBe('####\n#..#\n####');
  });
});