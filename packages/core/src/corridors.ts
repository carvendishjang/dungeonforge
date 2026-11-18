import type { Grid } from './grid';
import type { Point, Tile } from './types';

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
        if (grid.toRows()[y][x] === 'wall')  grid.set(x, y, 'corridor');
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