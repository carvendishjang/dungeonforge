import { createRng, generateCaves, keepLargestRegion, toAscii } from '../src/index';

const seed = Number(process.argv[2] ?? 36);
const opts = { width: 60, height: 30, fillChance: 0.45, iterations: 5 };

const raw = generateCaves(createRng(seed), opts);
console.log('BEFORE (all regions):');
console.log(toAscii(raw));
console.log('\nAFTER keepLargestRegion:');
console.log(toAscii(keepLargestRegion(raw)));