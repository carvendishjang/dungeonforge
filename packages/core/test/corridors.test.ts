import { describe, it, expect } from 'vitest';
import { Grid } from '../src/grid';
import { toAscii } from '../src/ascii';
import { carveH, carveV, carveL, connectBsp, roomsUnder } from '../src/corridors';
import { placeRoomsBsp } from '../src/bsp';
import { createRng } from '../src/rng';
import { rectCenter } from '../src/rect';
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

const opts = { width: 60, height: 30, minLeafSize: 8, maxDepth: 4, minRoomSize: 3 };

describe('roomsUnder', () => {
  it('the root holds every room', () => {
    const { tree, rooms } = placeRoomsBsp(createRng(1), opts);
    expect(roomsUnder(tree, rooms)).toEqual(rooms);
  });

  it('the two children split the rooms, none shared or lost', () => {
    const { tree, rooms } = placeRoomsBsp(createRng(2), opts);
    if (!tree.left || !tree.right) throw new Error('expected a split root');
    const l = roomsUnder(tree.left, rooms);
    const r = roomsUnder(tree.right, rooms);
    expect(l.length + r.length).toBe(rooms.length);
    expect(l.some((room) => r.includes(room))).toBe(false);
  });
});

describe('connectBsp', () => {
  it('a single leaf needs no corridors', () => {
    const leaf = { rect: { x: 0, y: 0, width: 10, height: 10 } };
    expect(connectBsp(createRng(1), leaf, [])).toEqual([]);
  });

  it('makes exactly rooms - 1 connections (the minimum to link them all)', () => {
    for (let seed = 0; seed < 20; seed++) {
      const { tree, rooms } = placeRoomsBsp(createRng(seed), opts);
      expect(connectBsp(createRng(seed), tree, rooms)).toHaveLength(rooms.length - 1);
    }
  });

  it('every endpoint is the centre of a real room', () => {
    const { tree, rooms } = placeRoomsBsp(createRng(5), opts);
    const centres = rooms.map((r) => JSON.stringify(rectCenter(r)));
    for (const [a, b] of connectBsp(createRng(5), tree, rooms)) {
      expect(centres).toContain(JSON.stringify(a));
      expect(centres).toContain(JSON.stringify(b));
    }
  });

  it('is deterministic', () => {
    const { tree, rooms } = placeRoomsBsp(createRng(9), opts);
    expect(connectBsp(createRng(9), tree, rooms)).toEqual(connectBsp(createRng(9), tree, rooms));
  });
});