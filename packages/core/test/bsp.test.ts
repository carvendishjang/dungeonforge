import { describe, it, expect } from 'vitest';
import { createRng } from '../src/rng';
import { splitRect, buildTree, type BspNode } from '../src/bsp';

describe('splitRect', () => {
  it('returns null when too small to cut either way', () => {
    expect(splitRect(createRng(1), { x: 0, y: 0, width: 10, height: 10 }, 6)).toBeNull();
  });

  it('cuts a wide rect side by side, covering it exactly', () => {
    const parts = splitRect(createRng(1), { x: 5, y: 3, width: 40, height: 10 }, 6);
    if (parts === null) throw new Error('expected a split'); // narrows the type
    const [a, b] = parts;
    expect(a.height).toBe(10);
    expect(b.height).toBe(10);
    expect(a.x).toBe(5);
    expect(b.x).toBe(a.x + a.width);   // no gap, no overlap
    expect(a.width + b.width).toBe(40);
  });

  it('cuts a tall rect one above the other', () => {
    const parts = splitRect(createRng(1), { x: 0, y: 0, width: 10, height: 40 }, 6);
    if (parts === null) throw new Error('expected a split');
    const [a, b] = parts;
    expect(a.width).toBe(10);
    expect(b.y).toBe(a.y + a.height);
    expect(a.height + b.height).toBe(40);
  });

  it('both halves always respect minLeafSize', () => {
    for (let seed = 0; seed < 100; seed++) {
      const parts = splitRect(createRng(seed), { x: 0, y: 0, width: 20, height: 20 }, 6);
      if (parts === null) throw new Error('expected a split');
      for (const p of parts) {
        expect(Math.min(p.width, p.height)).toBeGreaterThanOrEqual(6);
      }
    }
  });

  it('uses the only possible direction', () => {
    // too narrow to cut side by side (11 < 12), tall enough to cut horizontally
    for (let seed = 0; seed < 100; seed++) {
        const parts = splitRect(createRng(seed), { x: 0, y: 0, width: 11, height: 13 }, 6);
        if (parts === null) throw new Error('expected a split');
        expect(parts[0].width).toBe(11);
    }
  });
});

// Test helpers: also recursive!
function countLeaves(n: BspNode): number {
  if (!n.left || !n.right) return 1;
  return countLeaves(n.left) + countLeaves(n.right);
}

function depthOf(n: BspNode): number {
  if (!n.left || !n.right) return 0;
  return 1 + Math.max(depthOf(n.left), depthOf(n.right));
}

describe('buildTree', () => {
  const map = { x: 0, y: 0, width: 60, height: 30 };

  it('maxDepth 0 returns a single leaf covering the map', () => {
    const tree = buildTree(createRng(1), map, 6, 0);
    expect(tree.left).toBeUndefined();
    expect(tree.right).toBeUndefined();
    expect(tree.rect).toEqual(map);
  });

  it('never goes deeper than maxDepth, never more than 2^maxDepth leaves', () => {
    for (let seed = 0; seed < 50; seed++) {
      const tree = buildTree(createRng(seed), map, 6, 4);
      expect(depthOf(tree)).toBeLessThanOrEqual(4);
      expect(countLeaves(tree)).toBeLessThanOrEqual(16);
      expect(countLeaves(tree)).toBeGreaterThan(1);
    }
  });

  it('stops when the rect is too small to split', () => {
    const tree = buildTree(createRng(1), { x: 0, y: 0, width: 10, height: 10 }, 6, 10);
    expect(countLeaves(tree)).toBe(1);
  });

  it('children exactly cover their parent (areas add up)', () => {
    const area = (r: { width: number; height: number }) => r.width * r.height;
    const check = (n: BspNode): void => {
      if (!n.left || !n.right) return;
      expect(area(n.left.rect) + area(n.right.rect)).toBe(area(n.rect));
      check(n.left);
      check(n.right);
    };
    check(buildTree(createRng(3), map, 6, 5));
  });

  it('is deterministic', () => {
    expect(buildTree(createRng(42), map, 6, 4)).toEqual(buildTree(createRng(42), map, 6, 4));
  });
});