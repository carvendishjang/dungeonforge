import { describe, it, expect } from 'vitest';
import { rectCenter, rectsOverlap, rectContains } from '../src/rect';
import type { Rect } from '../src/types';

const a: Rect = { x: 0, y: 0, width: 4, height: 4 };

describe('rectCenter', () => {
    it('returns the whole-tile centre', () => {
        expect(rectCenter(a)).toEqual({ x: 2, y: 2});
        expect(rectCenter({ x: 1, y: 1, width: 3, height: 5})).toEqual({ x: 2, y: 3});
    });
});

describe('rectsOverlap', () => {
    it('detects overlap', () => {
        expect(rectsOverlap(a, { x: 2, y: 2, width: 4, height: 4})).toBe(true);
    })
    it('treats touching edges as not overlapping', () => {
        expect(rectsOverlap(a, { x: 4, y: 0, width: 2, height: 2})).toBe(false);
    });
    it('uses padding to keep a gap', () => {
        expect(rectsOverlap(a, { x: 4, y: 0, width: 2, height: 2}, 1)).toBe(true);
    });
    it('returns false when far apart', () => {
        expect(rectsOverlap(a, { x: 10, y: 10, width: 2, height: 2}, 1)).toBe(false);
    });
});

describe('rectContains', () => {
    it('includes the last tile, excludes the one past the edge', () => {
        expect(rectContains(a, { x: 3, y: 3 })).toBe(true);
        expect(rectContains(a, { x: 4, y: 0 })).toBe(false);
    });
});