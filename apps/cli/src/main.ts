import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { generate, tilesToAscii } from '@dungeonforge/core';
import { parseCliArgs, USAGE } from './args';

try {
    const { config, out } = parseCliArgs(process.argv.slice(2));
    const map = generate(config);

    console.log(tilesToAscii(map.tiles));
    console.log(`${config.mode}, seed ${map.seed}, ${map.width}x${map.height}, ${map.rooms.length} rooms`);

    if (out) {
        mkdirSync(dirname(out), { recursive: true });     // create maps/ if it doesn't exist
        writeFileSync(out, JSON.stringify(map));
        console.log(`saved ${out}`);
    }
} catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    console.error(USAGE);
    process.exit(1);    // non-zero = failure, so scripts and CI can detect it
}