import type { Grid } from './grid';
import type { Tile } from './types';

// Record<Tile, string> = an object with EXACTLY one entry per Tile.
const SYMBOLS: Record<Tile, string> = {
    wall: '#',
    floor: '.',
    corridor: ',',
    door: '+',
};

/** Render rows of tiles (e.g. DungeonMap.tiles) as ASCII. */
export function tilesToAscii(tiles: Tile[][]): string {
    return tiles.map((row) => row.map((tile) => SYMBOLS[tile]).join('')).join('\n');
}

/** Render a Grid as ASCII. */
export function toAscii(grid: Grid<Tile>): string {
    return tilesToAscii(grid.toRows());
}