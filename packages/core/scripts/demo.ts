import { Grid, toAscii, createRng } from '../src/index';
import type { Tile } from '../src/index';

const rng = createRng(42);
const grid = new Grid<Tile>(40, 20, 'wall');

for (let i = 0; i < 5; i++) {
  const width = rng.int(4, 8);
  const height = rng.int(3, 6);
  grid.fillRect(
    { x: rng.int(1, 40 - width - 1), y: rng.int(1, 20 - height - 1), width, height },
    'floor',
  );
}

console.log(toAscii(grid));