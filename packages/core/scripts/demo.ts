import { Grid, toAscii, createRng } from '../src/index';
import type { Tile } from '../src/index';
import { placeRoomsNaive } from '../src/index';

const rng = createRng(42);
const grid = new Grid<Tile>(40, 20, 'wall');

const rooms = placeRoomsNaive(rng, { width: 40, height: 20, maxRooms: 8, minSize: 3, maxSize: 8 });
for (const room of rooms) grid.fillRect(room, 'floor');
console.log(toAscii(grid));
console.log(`Placed ${rooms.length} rooms`);