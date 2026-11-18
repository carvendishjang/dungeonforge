import type { Rng } from './rng';
import type { Rect } from './types';

/**
 * Cut `rect` into two smaller rects that exactly cover it.
 * Each half must be at least `minLeafSize` in the direction we cut.
 * Returns null if the rect is too small to cut either way.
 */
export function splitRect(rng: Rng, rect: Rect, minLeafSize: number): [Rect, Rect] | null {
    const canCutVertically = rect.width >= 2 * minLeafSize;   // a | b  (side by side)
    const canCutHorizontally = rect.height >= 2 * minLeafSize; // a over b

    if (!(canCutHorizontally || canCutVertically)) return null;

    //   - if only one direction is possible, use that one
    //   - if both: prefer cutting the LONG side
    //       width  > height * 1.25  → vertical
    //       height > width  * 1.25  → horizontal
    //       otherwise               → rng.chance(0.5)
    let vertical: boolean;

    if (!canCutHorizontally) vertical = true;         // only vertical possible
    else if (!canCutVertically) vertical = false;     // only horizontal possible
    else if (rect.width > rect.height * 1.25) vertical = true;
    else if (rect.height > rect.width * 1.25) vertical = false;
    else vertical = rng.chance(0.5);

    if (vertical) {
        // left half:  same y and height, width = cut
        // right half: x shifted by cut, width = rect.width - cut
        const cut: number = rng.int(minLeafSize, rect.width - minLeafSize);
        const rect_l: Rect = { x: rect.x, y: rect.y, width: cut, height: rect.height };
        const rect_r: Rect = { x: rect.x + cut, y: rect.y, width: rect.width - cut, height: rect.height};
        return [rect_l, rect_r];
    } else {
        const cut: number = rng.int(minLeafSize, rect.height - minLeafSize);
        const rect_d: Rect = { x: rect.x, y: rect.y, width: rect.width, height: cut};
        const rect_u: Rect = { x: rect.x, y: rect.y + cut, width: rect.width, height: rect.height - cut};
        return [rect_d, rect_u]; 
    }
}

// A node owns a rect. A leaf has no children; an inner node has BOTH.
export interface BspNode {
    readonly rect: Rect;
    readonly left?: BspNode;   // a type that refers to itself = a recursive type
    readonly right?: BspNode;
}

export function buildTree(
    rng: Rng,
    rect: Rect,
    minLeafSize: number,
    maxDepth: number,
    depth = 0,          // default parameter: callers can leave it out
    ): BspNode {
    if (depth >= maxDepth) return { rect };

    // if parts is null (too small)
    const parts = splitRect(rng, rect, minLeafSize);
    if (parts === null) return { rect };

    // buildTree(...) on each half,
    const [a, b] = parts;
    return {
        rect,
        left: buildTree(rng, a, minLeafSize, maxDepth, depth + 1 ),
        right: buildTree(rng, b, minLeafSize, maxDepth, depth + 1),
    } 
}

/** All leaves of the tree, left to right. */
export function leaves(node: BspNode): BspNode[] {
    // TODO base case: no children → an array with just this node
    if (!node.left || !node.right) return [node];
    // TODO recursive case: leaves of left, followed by leaves of right
    // (spread both into one array: [...a, ...b])
    return [...leaves(node.left), ...leaves(node.right)];
}

/**
 * A random room inside `leaf`, keeping a 1-tile wall margin on every side.
 * Returns null if the leaf is too small for a room of minRoomSize.
 */
export function roomInLeaf(rng: Rng, leaf: Rect, minRoomSize: number): Rect | null {
    const maxW = leaf.width - 2;   // -2 = one wall tile on each side
    const maxH = leaf.height - 2;
    // TODO 1: return null if maxW or maxH is smaller than minRoomSize
    if (maxW < minRoomSize || maxH < minRoomSize) return null;
    // TODO 2: w = random between minRoomSize and maxW; same for h
    const w: number = rng.int(minRoomSize, maxW);
    const h: number = rng.int(minRoomSize, maxH);
    // TODO 3: x = random so the room starts at least 1 tile inside the leaf
    // and ends at least 1 tile before the leaf's right edge
    // same for y
    const x = rng.int(leaf.x + 1, leaf.x + leaf.width - w - 1);
    const y = rng.int(leaf.y + 1, leaf.y + leaf.height - h - 1);
    return { x, y, width: w, height: h };
}