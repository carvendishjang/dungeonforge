import { parseArgs } from 'node:util';
import { createConfig, isMode } from '@dungeonforge/core';
import type { DungeonConfig } from '@dungeonforge/core';

export interface CliOptions {
    config: DungeonConfig;
    out?: string;   // file to save JSON to; undefined = don't save
}

export const USAGE = 
    'Usage: npm run gen -- [--mode bsp|caves] [--seed N] [--width N] [--height N] [--out file.json]';

    /** Parse a whole-number flag. Throws a friendly error on bad input. */
    export function parseIntFlag(name: string, raw: string, min: number, max: number): number {
        if (!/^-?\d+$/.test(raw)) throw new Error(`--${name} must be a whole number, got "${raw}"`);

        const n = Number(raw);

        if (n < min || n > max) throw new Error(`--${name} must be between ${min} and ${max}, got ${n}`);
        return n;
    }

    /** argv (without "node script.ts") -> a validated config. Pure: no console, no files. */
    export function parseCliArgs(argv: string[]): CliOptions {
        const { values } = parseArgs({
            args: argv,
            strict: true,   // an unknow flag like --sed throws instead of being silently ignored
            options: {
                mode:   {type: 'string', default: 'bsp' },
                seed:   {type: 'string', default: '42' },
                width:  {type: 'string', default: '60'},
                height: {type: 'string', default: '30'},
                out:    {type: 'string' },
            },
        });

        const seed = parseIntFlag('seed', values.seed, 0, 2 ** 32 - 1);
        const width = parseIntFlag('width', values.width, 10, 200);
        const height = parseIntFlag('height', values.height, 10, 200);

        if (!isMode(values.mode)) throw new Error(`--mode must be bsp or caves, got "${values.mode}"`);
        return { config: createConfig(values.mode, seed, width, height), out: values.out };
    }