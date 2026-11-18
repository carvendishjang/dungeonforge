import { generateBspDungeon, tilesToAscii } from '../src/index';

// Read the seed from the command line: npx tsx .../demo.ts 7   (defaults to 42)
const seed = Number(process.argv[2] ?? 42);

const map = generateBspDungeon({ seed, width: 60, height: 30, minLeafSize: 6, maxDepth: 4, minRoomSize: 3 });
console.log(tilesToAscii(map.tiles));
console.log(`seed ${map.seed}: ${map.rooms.length} rooms`);