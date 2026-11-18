import type { Rect } from './types';

// Generic: a Grid<Tile> holds tiles, a Grid<number> could hold distances, etc.
export class Grid<T> {
    // Stored as ONE flat away: index = y * width + x (faster than arrays of arrays)
    private readonly cells: T[];

    // `readonly width` in the constructor = declares AND assigns this.width in one go
    constructor(readonly width: number, readonly height: number, fill: T) {
        this.cells = new Array<T>(width * height).fill(fill);
    }

    inBounds(x: number, y: number): boolean {
        return (0 <= x && x < this.width) && (0 <= y && y < this.height);
    }

    get(x: number, y: number): T {
        if (!this.inBounds(x, y)) throw new Error('Index out of bounds');
        return this.cells[y * this.width + x];
    }

    set(x: number, y: number, value: T): void {
        if (!this.inBounds(x, y)) throw new Error ('Index out of bounds');
        this.cells[y * this.width + x] = value;
    }

    fillRect(r: Rect, value: T): void {        
        for (let y = r.y; y < r.y + r.height; y++) {
            for (let x = r.x; x < r.x + r.width; x++) {
                this.set(x, y, value);
            }
        }
    }

    toRows(): T[][] {
        return Array.from({ length: this.height }, (_, y) => this.cells.slice(y * this.width, (y + 1) * this.width),);
    }
}