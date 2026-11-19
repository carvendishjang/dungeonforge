import { Grid } from './grid';
import type { Rng } from './rng';
import type { Tile } from './types';
import { floodFill, isWalkable } from './validate';

export interface CaveOptions {
    width: number;
    height: number;
    fillChance: number;     // chance an inner tile STARTS as wall, e.g. 0.45
    iterations: number;     // number of smooting passes, e.g. 5
}

/** How many of the 8 neighbours of (x, y) are walls. Off-map counts as wall. */
export function countWallNeighbours (grid: Grid<Tile>, x: number, y: number): number {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy ===0) continue
            if (!grid.inBounds(x+dx, y+dy) || grid.get(x+dx, y+dy) ==='wall') count++;
        }
    }
    return count;
}

/**
 * One smooting pass. Returns a NEW grid; the input is not changed.
 * The outer border is always wall.
*/
export function smoothStep(grid: Grid<Tile>): Grid<Tile> {
    const next = new Grid<Tile>(grid.width, grid.height, 'wall');
    for (let y = 1; y < grid.height - 1; y++) {
        for (let x = 1; x < grid.width - 1; x++) {
            const n = countWallNeighbours(grid, x, y);
            if (n >= 5) next.set(x, y, 'wall');
            else if (n <= 3) next.set(x, y, 'floor');
            else next.set(x, y, grid.get(x, y));
        }
    }
    return next;
}

/** Random noise, then `iterations` smooting passes. */
export function generateCaves(rng: Rng, opts: CaveOptions): Grid<Tile> {
    let grid = new Grid<Tile>(opts.width, opts.height, 'wall');
    for (let y = 1; y < grid.height - 1; y++) {
        for (let x = 1; x < grid.width - 1; x++) {
            if (rng.chance(opts.fillChance)) grid.set(x, y, 'wall');
            else grid.set(x, y, 'floor');
        }
    }
    for (let i = 0; i < opts.iterations; i++) {
        grid = smoothStep(grid);
    }
    return grid;
}

/**
 * Keep only the largest connected walkable region; fill every other region with wall.
 * Returns a NEW grid. Ties: the region found first (top-left) wins.
*/
export function keepLargestRegion(grid: Grid<Tile>): Grid<Tile> {
    const tiles = grid.toRows();
    const seen = new Grid<boolean>(grid.width, grid.height, false);
    let best: Grid<number> | null = null; // floodFill result of the biggest region so far
    let bestSize = 0;

    for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
            if (!isWalkable(grid.get(x, y )) || seen.get(x, y)) continue;
            const dist = floodFill(tiles, { x, y });
            let size = 0;
            for (let yy = 0; yy < dist.height; yy++) {
                for (let xx = 0; xx < dist.width; xx++) {
                    if (dist.get(xx, yy) >= 0) {
                        seen.set(xx, yy, true);
                        size++;
                    }
                }
            }
            if (size > bestSize) {
                bestSize = size;
                best = dist;
            }
        }
    }

    const result = new Grid<Tile>(grid.width, grid.height, 'wall');
    for (let y = 0; y < result.height; y++) {
        for (let x = 0; x < result.width; x++) {
            if (best && best.get(x, y) >= 0) {
                result.set(x, y, grid.get(x, y));
            }
        }
    }
    return result; 
}