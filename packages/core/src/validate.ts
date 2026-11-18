import { Grid } from './grid';
import type { Point, Tile } from './types';

// `as const` maskes this a readonly array of readonly [dx, dy] tuples
const DIRECTIONS = [
    [1, 0],     // right
    [-1, 0],    // left
    [0, 1],     // down
    [0, -1],    // up
] as const;

export const isWalkable = (tile: Tile): boolean => tile !== 'wall';

/**
 * Breadth-first search from `start` across walkable tiles (4 directions, no diagonals).
 * Returns a Grid<number> of step distances from start; -1 means "not reached".
*/
export function floodFill(tiles: Tile[][], start: Point): Grid<number> {
    const height = tiles.length;
    const width = tiles[0]?.length ?? 0;    // `?.` = safe if tiles is empty
    const dist = new Grid<number>(width, height, -1);

    // if start is out of bounds or not walkable, return dist unchanged
    if (!dist.inBounds(start.x, start.y) || tiles[start.y][start.x] === 'wall') return dist;

    // mark the start: dist.set(start.x, start.y, 0)
    dist.set(start.x, start.y, 0);
    const queue: Point[] = [start];
    let head = 0; // index of the next point to process

    while (head < queue.length) {
        const p = queue[head++];        // take the oldest point, then move head forward
        const d = dist.get(p.x, p.y);

        for (const [dx, dy] of DIRECTIONS) {
            const nx = p.x + dx;
            const ny = p.y + dy;

            if (!dist.inBounds(nx, ny) || tiles[ny][nx] === 'wall' || dist.get(nx, ny) !== -1) continue;
            else {
                dist.set(nx, ny, d + 1);
                queue.push({x: nx, y: ny});
            }
        }
    }
    return dist;
}

export interface ConnectivityReport {
    walkable: number;   // total walkable tiles on the map
    reached: number;    // walkable tiles reached from the first one
    connected: boolean; // reached === walkable
}

export function checkConnectivity(tiles: Tile[][]): ConnectivityReport {
    //         find the FIRST walkable tile (scan rows top to bottom, left to right)
    //         if there is none, return { walkable: 0, reached: 0, connected: true }
    let start: Point | null = null;
    for (let y = 0; y < tiles.length && start === null; y++) {
        for (let x = 0; x < tiles[0].length; x++) {
            if (isWalkable(tiles[y][x])) {
                start = {x, y};
                break;
            }
        }
    }

    if (start === null) return { walkable: 0, reached: 0, connected: true };

    const dist = floodFill(tiles, start);
    let walkable = 0;
    let reached = 0;
    for (let y = 0; y < dist.height; y++) {
        for (let x = 0; x < dist.width; x++) {
            if(isWalkable(tiles[y][x])) walkable++;
            if(dist.get(x, y) >= 0) reached++;
        }
    }

    const connected = (walkable === reached);
    return { walkable, reached, connected};
}