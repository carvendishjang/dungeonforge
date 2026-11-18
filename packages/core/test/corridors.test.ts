import { describe, it, expect } from 'vitest';
import { Grid } from '../src/grid';
import { toAscii } from '../src/ascii';
import { carveH, carveV, carveL } from '../src/corridors';
import type { Tile } from '../src/types';

const blank = () => new Grid<Tile>(7, 5, 'wall');

describe('carveH', () => {
  it('carves inclusive on both ends, in either direction', () => {
    const a = blank();
    carveH(a, 1, 4, 2);
    expect(toAscii(a)).toBe(
      '#######\n' +
      '#######\n' +
      '#,,,,##\n' +
      '#######\n' +
      '#######',
    );
    const b = blank();
    carveH(b, 4, 1, 2); // reversed
    expect(toAscii(b)).toBe(toAscii(a));
  });

  it('never overwrites floor', () => {
    const g = blank();
    g.set(2, 2, 'floor');
    carveH(g, 1, 4, 2);
    expect(g.get(2, 2)).toBe('floor');
    expect(g.get(3, 2)).toBe('corridor');
  });
});

describe('carveV', () => {
  it('carves inclusive on both ends, in either direction', () => {
    const g = blank();
    carveV(g, 3, 1, 5); // reversed: from y 3 up to y 1, at x 5
    expect(g.get(5, 0)).toBe('wall');
    expect(g.get(5, 1)).toBe('corridor');
    expect(g.get(5, 2)).toBe('corridor');
    expect(g.get(5, 3)).toBe('corridor');
    expect(g.get(5, 4)).toBe('wall');
  });
});

describe('carveL', () => {
  it('horizontal first bends at (b.x, a.y)', () => {
    const g = blank();
    carveL(g, { x: 1, y: 1 }, { x: 5, y: 3 }, true);
    expect(toAscii(g)).toBe(
      '#######\n' +
      '#,,,,,#\n' +
      '#####,#\n' +
      '#####,#\n' +
      '#######',
    );
  });

  it('vertical first bends at (a.x, b.y)', () => {
    const g = blank();
    carveL(g, { x: 1, y: 1 }, { x: 5, y: 3 }, false);
    expect(toAscii(g)).toBe(
      '#######\n' +
      '#,#####\n' +
      '#,#####\n' +
      '#,,,,,#\n' +
      '#######',
    );
  });
});