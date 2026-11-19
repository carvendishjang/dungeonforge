import { placeRoomsBsp, type BspOptions } from './bsp';
import { generateCaves, keepLargestRegion, type CaveOptions } from './caves';
import { carveL, connectBsp } from './corridors';
import { Grid } from './grid';
import { createRng } from './rng';
import type { DungeonMap, Tile } from './types';

export interface GenerateOptions extends BspOptions {
    seed: number;
}

export interface CaveGenerateOptions extends CaveOptions {
    seed: number;
}

/** Discriminated union: `mode` decides which other fields are required. */
export type DungeonConfig =
    | ({ mode: 'bsp' } & GenerateOptions)
    | ({ mode: 'caves' } & CaveGenerateOptions);

export function generateBspDungeon(opts: GenerateOptions): DungeonMap {
    const rng = createRng(opts.seed);
    const { tree, rooms } = placeRoomsBsp(rng, opts);
    const grid = new Grid<Tile>(opts.width, opts.height, 'wall');

    for (const room of rooms) grid.fillRect(room, 'floor');
    for (const [a, b] of connectBsp(rng, tree, rooms)) carveL(grid, a, b, rng.chance(0.5));
    return { width: opts.width, height: opts.height, seed: opts.seed, tiles: grid.toRows(), rooms };
}

export function generateCaveDungeon(opts: CaveGenerateOptions): DungeonMap {
    // TODO 1: const rng = createRng(opts.seed)
    const rng = createRng(opts.seed);
    // TODO 2: const grid = keepLargestRegion(generateCaves(rng, opts))
    const grid = keepLargestRegion(generateCaves(rng, opts));
    // TODO 3: return a DungeonMap: width, height, seed from opts; tiles: grid.toRows(); rooms: []
    //         (caves have no rectangular rooms, so the list is empty)
    return { width: opts.width, height: opts.height, seed: opts.seed, tiles: grid.toRows(), rooms: [] };
}

/** Single entry point for every generator. */
export function generate(config: DungeonConfig): DungeonMap {
    switch (config.mode) {
        case 'bsp':
            return generateBspDungeon(config);   // here TS knows config has minLeafSize etc.
        // TODO 4: case 'caves': return generateCaveDungeon(config);
        case 'caves':
            return generateCaveDungeon(config);
        default: {
            const unreachable: never = config;   // compile error if a mode is missing a case
            throw new Error(`Unknown mode: ${JSON.stringify(unreachable)}`);
        }
    }
}