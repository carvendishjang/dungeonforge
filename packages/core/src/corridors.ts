import type { BspNode } from './bsp';
import type { Grid } from './grid';
import { rectCenter, rectContains } from './rect';
import type { Rng } from './rng';
import type { Point, Room, Tile } from './types';

/**
 * Turn walls into corridor along row y, from x1 to x2 INCLUSIVE.
 * x1 may be bigger than x2 (corridors can go left or right).
 * Never overwrites a room's 'floor'.
*/
export function carveH(grid: Grid<Tile>, x1: number, x2: number, y: number): void {
    // loop x from the smaller of x1/x2 up to the larger, inclusive
    // if the tile is 'wall', set it to 'corridor'
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        if (grid.get(x, y) === 'wall')  grid.set(x, y, 'corridor');
    }
}

/** Same as carveH, but along column x, from y1 to y2 inclusive. */
export function carveV(grid: Grid<Tile>, y1: number, y2: number, x: number): void {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        if (grid.get(x, y) === 'wall')  grid.set(x, y, 'corridor');
    }
}

/**
 * L-shaped corridor from a to b.
 *   horizontalFirst = true:  along row a.y to column b.x, then down/up column b.x to b.y
 *   horizontalFirst = false: along column a.x to row b.y, then along row b.y to b.x
*/
export function carveL(grid: Grid<Tile>, a: Point, b: Point, horizontalFirst: boolean): void {
    // two calls, using carveH and carveV
    if (horizontalFirst) {
        carveH(grid, a.x, b.x, a.y);
        carveV(grid, a.y, b.y, b.x);
    } else {
        carveV(grid, a.y, b.y, a.x);
        carveH(grid, a.x, b.x, b.y);
    }
}

/** The rooms whose centre lies inside `node`'s rect. */
export function roomsUnder(node: BspNode, rooms: readonly Room[]): Room[] {
    // filter `rooms`, keeping those where rectContains(node.rect, rectCenter(room)) is true
    return rooms.filter((room) => rectContains(node.rect, rectCenter(room)));
}

/**
 * Pairs of points to join with corridors: one pair per inner node,
 * linking a room in its left subtree to a room in its right subtree.
*/
export function connectBsp(rng: Rng, node: BspNode, rooms: readonly Room[]): [Point, Point][] {
    // (base case): a leaf has no children -> nothing to connect -> return []
    if ((!node.left) || (!node.right)) return [];
    // (recursive case): get the pairs from the left subtree and from the right subtree
    const pairs_l = connectBsp(rng, node.left, rooms);
    const pairs_r = connectBsp(rng, node.right, rooms);
    //         leftRooms = roomsUnder(node.left, rooms); rightRooms = roomsUnder(node.right, rooms)
    //         if BOTH are non-empty, make one more pair:
    //           [rectCenter(rng.pick(leftRooms)), rectCenter(rng.pick(rightRooms))]
    const leftRooms = roomsUnder(node.left, rooms);
    const rightRooms = roomsUnder(node.right, rooms);

    const pairs =[...pairs_l, ...pairs_r];
    if ((leftRooms.length > 0) && (rightRooms.length > 0)) {
        pairs.push([rectCenter(rng.pick(leftRooms)), rectCenter(rng.pick(rightRooms))]);
    }
    return pairs;
}