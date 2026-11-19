import { generate, tilesToAscii, type DungeonConfig } from '../src/index';

// npx tsx packages/core/scripts/demo.ts [bsp|caves] [seed]
const mode = process.argv[2] ?? 'bsp';
const seed = Number(process.argv[3] ?? 42);

if (mode !== 'bsp' && mode !== 'caves') {
  console.error(`Unknown mode "${mode}". Use bsp or caves.`);
  process.exit(1);
}

const config: DungeonConfig =
  mode === 'caves'
    ? { mode, seed, width: 60, height: 30, fillChance: 0.45, iterations: 5 }
    : { mode, seed, width: 60, height: 30, minLeafSize: 6, maxDepth: 4, minRoomSize: 3 };

const map = generate(config);
console.log(tilesToAscii(map.tiles));
console.log(`${mode}, seed ${map.seed}: ${map.rooms.length} rooms`);