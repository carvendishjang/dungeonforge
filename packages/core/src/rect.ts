import type { Point, Rect } from './types';

export function rectCenter(r: Rect): Point {
    return {x: Math.floor(r.x + r.width/2), y: Math.floor(r.y + r.height/2)}; 
 }

// padding = extra gap required between rects (default 0)
export function rectsOverlap(a: Rect, b: Rect, padding = 0): boolean { 
    return (a.x < b.x + b.width + padding) && (b.x < a.x + a.width + padding)
        && (a.y < b.y + b.height + padding) && (b.y < a.y + a.height + padding);
}

export function rectContains(r: Rect, p: Point): boolean { 
    return (p.x >= r.x) && (p.x < r.x + r.width)
        && (p.y >= r.y) && (p.y < r.y + r.height);
 }