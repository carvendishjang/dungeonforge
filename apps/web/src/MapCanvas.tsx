import { useEffect, useRef } from 'react';
import type { DungeonMap, Tile } from '@dungeonforge/core';

const COLORS: Record<Tile, string> = {
    wall: '#1f1b2e',
    floor: '#d8c8a8',
    corridor: '#a8916b',
    door: '#8b4513',
};

interface MapCanvasProps {
    map: DungeonMap;
    cellSize?: number;   // optional prop: pixels per tile
}

export function MapCanvas({ map, cellSize = 12 }: MapCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;   // not mounted yet, or no 2D support

        map.tiles.forEach((row, y) => row.forEach((tile, x) => {
                ctx.fillStyle = COLORS[tile];
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }));
    }, [map, cellSize]);

    return (
        <canvas
            ref={canvasRef}
            width={map.width * cellSize}
            height={map.height * cellSize}
        />
    );
}