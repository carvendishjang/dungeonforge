import { useEffect, useState } from "react";
import type { DungeonMap, Mode } from "@dungeonforge/core";

/** Fetches a map from the API whenever the inputs change. */
export function useDungeon(mode: Mode, seed: number, width: number, height: number) {
    const [map, setMap] = useState<DungeonMap | null>(null);
    const [error, setError] = useState<String | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                const res = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode, seed, width, height}),
                    signal: controller.signal,  // lets us cancel the request
                });
                if (!res.ok) throw new Error(`API error ${res.status}`);
                const data: DungeonMap = await res.json();
                setMap(data);
                setError(null);
            } catch (err) {
                // WE cancelled it on purpose; that's not an error to show
                if (controller.signal.aborted) return;
                setError(err instanceof Error ? err.message: String(err));
            }
        }

        load();
        // return a cleanup function that calls controller.abort()
        return () => controller.abort(); 
    }, [mode, seed, width, height]);

    return {map, error};
}