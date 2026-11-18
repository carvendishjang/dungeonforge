import { rectsOverlap } from "./rect";
import type { Rng } from './rng';
import type { Rect, Room } from './types';

export interface RoomOptions {
    width: number;          // map width
    height: number;         // map height
    maxRooms: number;       // stop once we have this many
    minSize: number;        // smallest room side
    maxSize: number;        // largest room side
    maxAttempts?: number;   // `?` = optional; we default it to 200;
}

export function placeRoomsNaive(rng: Rng, opts: RoomOptions): Room[] {
    // Destructuring with a default value for the optional field
    const { width, height, maxRooms, minSize, maxSize, maxAttempts = 200 } = opts;
    const rooms: Room[] = [];

    for (let attempt = 0; attempt < maxAttempts && rooms.length < maxRooms; attempt++) {
        // TODO 1: random room width w and height h, each between minSize and maxSize
        const w = rng.int(minSize, maxSize);
        const h = rng.int(minSize, maxSize);
        // TODO 2: random x, y so the room stays at least 1 tile inside the map border
        const x = rng.int(1, width - w - 1);
        const y = rng.int(1, height - h -1);
        // TODO 3: if it overlaps ANY existing room (padding 1), `continue` to the next attempt
        const candidate : Rect = {x, y, width: w, height: h}; 
        if(rooms.some((other) => rectsOverlap(candidate, other, 1))) continue;
        // TODO 4: otherwise push { id: rooms.length, x, y, width: w, height: h }
        rooms.push({ id: rooms.length, x, y, width: w, height: h});
    }

    return rooms;
}