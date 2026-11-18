import { placeRoomsBsp, type BspOptions } from "./bsp";
import { carveL, connectBsp } from "./corridors";
import { Grid } from './grid';
import { createRng, Rng } from "./rng";
import type { DungeonMap, Tile } from "./types";

export interface GenerateOptions extends BspOptions {
    seed: number;
}

export function generateBspDungeon(opts: GenerateOptions): DungeonMap {
    const rng: Rng = createRng(opts.seed);
    const {tree, rooms} = placeRoomsBsp(rng, opts);
    const grid = new Grid<Tile>(opts.width, opts.height, 'wall');
    
    rooms.map((room) => (grid.fillRect(room, 'floor')));
    for (const [a, b] of connectBsp(rng, tree, rooms)) carveL(grid, a, b, rng.chance(0.5));
    return { width: opts.width, height: opts.height, seed: opts.seed, tiles: grid.toRows(), rooms };
}