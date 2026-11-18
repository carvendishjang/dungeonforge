import { describe, it, expect } from 'vitest';
import { createRng } from '../src/rng';
import { splitRect, buildTree, leaves, roomInLeaf, placeRoomsBsp, type BspNode } from '../src/bsp';
import { rectsOverlap } from '../src/rect';

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

describe('leaves', () => {
  it('returns every leaf, none of which has children', () => {
    const tree = buildTree(createRng(5), { x: 0, y: 0, width: 60, height: 30 }, 6, 4);
    const ls = leaves(tree);
    expect(ls.length).toBe(countLeaves(tree));
    for (const l of ls) {
      expect(l.left).toBeUndefined();
      expect(l.right).toBeUndefined();
    }
  });

  it('a single leaf returns itself', () => {
    const tree = buildTree(createRng(1), { x: 0, y: 0, width: 10, height: 10 }, 6, 0);
    expect(leaves(tree)).toEqual([tree]);
  });
});

describe('roomInLeaf', () => {
    const leaf = { x: 10, y: 5, width: 12, height: 8 };

    it('stays inside the leaf with a 1-tile margin', () => {
        for (let seed = 0; seed < 100; seed++) {
        const r = roomInLeaf(createRng(seed), leaf, 3);
        if (r === null) throw new Error('expected a room');
        expect(r.x).toBeGreaterThanOrEqual(leaf.x + 1);
        expect(r.y).toBeGreaterThanOrEqual(leaf.y + 1);
        expect(r.x + r.width).toBeLessThanOrEqual(leaf.x + leaf.width - 1);
        expect(r.y + r.height).toBeLessThanOrEqual(leaf.y + leaf.height - 1);
        expect(r.width).toBeGreaterThanOrEqual(3);
        expect(r.height).toBeGreaterThanOrEqual(3);
        }
    });

    it('returns null when the leaf is too small', () => {
        expect(roomInLeaf(createRng(1), { x: 0, y: 0, width: 5, height: 5 }, 4)).toBeNull();
    });

   it('varies room size and position across seeds', () => {
    const shapes = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const r = roomInLeaf(createRng(seed), leaf, 3);
      if (r) shapes.add(`${r.x},${r.y},${r.width},${r.height}`);
    }
    expect(shapes.size).toBeGreaterThan(10);
  });

  it('does not always place the room in the top-left corner', () => {
    const xs = new Set<number>();
    for (let seed = 0; seed < 50; seed++) {
      const r = roomInLeaf(createRng(seed), leaf, 3);
      if (r) xs.add(r.x);
    }
    expect(xs.size).toBeGreaterThan(1);
  });
});

describe('BSP rooms', () => {
  it('rooms from different leaves never overlap (50 seeds)', () => {
    for (let seed = 0; seed < 50; seed++) {
      const rng = createRng(seed);
      const tree = buildTree(rng, { x: 0, y: 0, width: 60, height: 30 }, 8, 4);
      const rooms = leaves(tree)
        .map((l) => roomInLeaf(rng, l.rect, 3))
        .filter((r): r is NonNullable<typeof r> => r !== null);
      for (let i = 0; i < rooms.length; i++) {
        for (let j = i + 1; j < rooms.length; j++) {
          expect(rectsOverlap(rooms[i], rooms[j], 1)).toBe(false);
        }
      }
    }
  });
});

describe('placeRoomsBsp', () => {
  const opts = { width: 60, height: 30, minLeafSize: 8, maxDepth: 4, minRoomSize: 3 };

  it('is deterministic', () => {
    expect(placeRoomsBsp(createRng(42), opts)).toEqual(placeRoomsBsp(createRng(42), opts));
  });

  it('gives every leaf a room when leaves are big enough', () => {
    // minLeafSize 8 leaves room for a 3-tile room plus margins, so no leaf is skipped
    for (let seed = 0; seed < 20; seed++) {
      const { tree, rooms } = placeRoomsBsp(createRng(seed), opts);
      expect(rooms.length).toBe(leaves(tree).length);
    }
  });

  it('keeps rooms inside the map border, never overlapping', () => {
    for (let seed = 0; seed < 20; seed++) {
      const { rooms } = placeRoomsBsp(createRng(seed), opts);
      for (const r of rooms) {
        expect(r.x).toBeGreaterThanOrEqual(1);
        expect(r.y).toBeGreaterThanOrEqual(1);
        expect(r.x + r.width).toBeLessThanOrEqual(opts.width - 1);
        expect(r.y + r.height).toBeLessThanOrEqual(opts.height - 1);
      }
      for (let i = 0; i < rooms.length; i++) {
        for (let j = i + 1; j < rooms.length; j++) {
          expect(rectsOverlap(rooms[i], rooms[j], 1)).toBe(false);
        }
      }
    }
  });

  it('gives rooms ids 0..n-1', () => {
    const { rooms } = placeRoomsBsp(createRng(3), opts);
    expect(rooms.map((r) => r.id)).toEqual(rooms.map((_, i) => i));
  });
});