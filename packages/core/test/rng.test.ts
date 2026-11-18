import { describe, it, expect } from 'vitest';
import { createRng } from '../src/rng';

const draw = (seed: number, n: number) => {
  const rng = createRng(seed);
  return Array.from({ length: n }, () => rng.next());
};

describe('createRng', () => {
  it('is deterministic: same seed, same sequence', () => {
    expect(draw(42, 5)).toEqual(draw(42, 5));
  });

  it('different seeds give different sequences', () => {
    expect(draw(42, 5)).not.toEqual(draw(43, 5));
  });

  it('next() stays in [0, 1)', () => {
    for (const x of draw(7, 1000)) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('int() is inclusive on both ends', () => {
    const rng = createRng(1);
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) seen.add(rng.int(1, 3));
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });

  it('chance() respects 0 and 1', () => {
    const rng = createRng(5);
    for (let i = 0; i < 100; i++) {
      expect(rng.chance(0)).toBe(false);
      expect(rng.chance(1)).toBe(true);
    }
  });

  it('pick() returns an element, and throws on empty', () => {
    const rng = createRng(9);
    const items = ['goblin', 'orc', 'slime'];
    expect(items).toContain(rng.pick(items));
    expect(() => rng.pick([])).toThrow();
  });
});