import type { Grid } from './grid';
import type { Tile } from './types';

// Record<Tile, string> = an object with EXACTLY one entry per Tile.
const SYMBOLS: Record<Tile, string> = {
    wall: '#',
    floor: '.',
    corridor: ',',
    door: '+',
};

export function toAscii(grid: Grid<Tile>): string {
    return grid
        .toRows()
        .map((row) => (row.map((tile) => SYMBOLS[tile]).join('')))
        .join('\n');
}