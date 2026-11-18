import { Grid, toAscii, createRng, placeRoomsNaive, placeRoomsBsp } from '../src/index';
import type { Room, Tile } from '../src/index';

const W = 40;
const H = 20;
const seed = 42;

function draw(rooms: Room[]): string {
    const grid = new Grid<Tile>(W, H, 'wall');
    for (const room of rooms) grid.fillRect(room, 'floor');
    return toAscii(grid);
}

const naive = placeRoomsNaive(createRng(seed), { width: W, height: H, maxRooms: 50, minSize: 3, maxSize: 8 });
console.log(`NAIVE: ${naive.length} rooms`);
console.log(draw(naive));

const bsp = placeRoomsBsp(createRng(seed), { width: W, height: H, minLeafSize: 5, maxDepth: 5, minRoomSize: 3 });
console.log(`\nBSP: ${bsp.rooms.length} rooms`);
console.log(draw(bsp.rooms));