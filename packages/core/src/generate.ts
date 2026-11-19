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
    const rng = createRng(opts.seed);
    const grid = keepLargestRegion(generateCaves(rng, opts));
    return { width: opts.width, height: opts.height, seed: opts.seed, tiles: grid.toRows(), rooms: [] };
}

/** Single entry point for every generator. */
export function generate(config: DungeonConfig): DungeonMap {
    switch (config.mode) {
        case 'bsp':
            return generateBspDungeon(config);   // here TS knows config has minLeafSize etc.
        case 'caves':
            return generateCaveDungeon(config);
        default: {
            const unreachable: never = config;   // compile error if a mode is missing a case
            throw new Error(`Unknown mode: ${JSON.stringify(unreachable)}`);
        }
    }
}

/** 'bsp | 'caves', taken from the union itself so it can never get out of sync. */
export type Mode = DungeonConfig['mode'];

export const MODES: readonly Mode[] = ['bsp', 'caves'];

/** Type predicate: turns an unknown string into a Mode (or not). */
export function isMode(value: string): value is Mode {
    return (MODES as readonly string[]).includes(value);
}

/** Default tuning for each mode; callers choose only seed and size. */
export function createConfig(mode: Mode, seed: number, width: number, height: number): DungeonConfig {
    switch (mode) {
        case 'bsp':
            return { mode, seed, width, height, minLeafSize: 6, maxDepth: 4, minRoomSize: 3 };
        case 'caves':
            return { mode, seed, width, height, fillChance: 0.45, iterations: 5 };
    }
}