// A union of string literals: a Tile can ONLY be one of these four strings.
export type Tile = 'wall' | 'floor' | 'corridor' | 'door';

export interface Point {
    readonly x: number;
    readonly y: number;
}

// A rectangle covers columns x .. x+width-1 and rows y .. y+height-1.
export interface Rect {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

//`extends` = a Romm is a Rect, plus an id.
export interface Room extends Rect {
    readonly id: number; 
}

export interface DungeonMap {
    readonly width: number;
    readonly height: number;
    readonly seed: number;
    readonly tiles: Tile[][]; // tiles[y][x]
    readonly rooms: Room[];
}