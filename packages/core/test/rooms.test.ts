import { describe, it, expect } from 'vitest';
import { placeRoomsNaive, type RoomOptions } from '../src/rooms';
import { createRng } from '../src/rng';
import { rectsOverlap } from '../src/rect';

const opts: RoomOptions = { width: 60, height: 30, maxRooms: 10, minSize: 4, maxSize: 9 };

describe('placeRoomsNaive', () => {
  it('is deterministic', () => {
    expect(placeRoomsNaive(createRng(42), opts)).toEqual(placeRoomsNaive(createRng(42), opts));
  });

  it('places between 1 and maxRooms rooms', () => {
    const rooms = placeRoomsNaive(createRng(42), opts);
    expect(rooms.length).toBeGreaterThan(0);
    expect(rooms.length).toBeLessThanOrEqual(opts.maxRooms);
  });

  it('never overlaps, with a 1-tile wall between rooms', () => {
    for (let seed = 0; seed < 50; seed++) {
      const rooms = placeRoomsNaive(createRng(seed), opts);
      for (let i = 0; i < rooms.length; i++) {
        for (let j = i + 1; j < rooms.length; j++) {
          expect(rectsOverlap(rooms[i], rooms[j], 1)).toBe(false);
        }
      }
    }
  });

  it('keeps every room inside the border and within size limits', () => {
    for (const r of placeRoomsNaive(createRng(7), opts)) {
      expect(r.x).toBeGreaterThanOrEqual(1);
      expect(r.y).toBeGreaterThanOrEqual(1);
      expect(r.x + r.width).toBeLessThanOrEqual(opts.width - 1);
      expect(r.y + r.height).toBeLessThanOrEqual(opts.height - 1);
      expect(r.width).toBeGreaterThanOrEqual(opts.minSize);
      expect(r.width).toBeLessThanOrEqual(opts.maxSize);
    }
  });

  it('gives rooms ids 0..n-1', () => {
    const rooms = placeRoomsNaive(createRng(3), opts);
    expect(rooms.map((r) => r.id)).toEqual(rooms.map((_, i) => i));
  });
});