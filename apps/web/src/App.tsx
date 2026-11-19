import { useState } from 'react';
import { isMode, MODES, type Mode } from '@dungeonforge/core';
import { MapCanvas } from './MapCanvas';
import { useDungeon } from './useDungeon';

// Math.random() is fine HERE: it only picks a seed. Generation itself stays deterministic.
const randomSeed = () => Math.floor(Math.random() * 2 ** 32);

export function App() {
    const [mode, setMode] = useState<Mode>('bsp');
    const [seed, setSeed] = useState(42);
    const [width, setWidth] = useState(60);
    const [height, setHeight] = useState(30);

    const { map, error } = useDungeon(mode, seed, width, height);

    return (
        <main>
            <h1>DungeonForge</h1>

            <div className="controls">
                <label>
                    Mode{' '}
                    <select value={mode} onChange={(e) => { if (isMode(e.target.value)) setMode(e.target.value); }}>
                        {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                </label>

                <label>
                    Seed <input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value))} />
                </label>
                <button onClick={() => setSeed(randomSeed())}> Random </button>
                <label>
                    Width <input type="range" min={20} max={120} value={width}
                                 onChange={(e) => setWidth(Number(e.target.value))} /> {width}
                </label>
                <label>
                    Height <input type= "range" min={10} max={80} value={height}
                                  onChange={(e) => setHeight(Number(e.target.value))} /> {height}
                </label>
            </div>

            {error && <p className="error">{error}: is the API running? (npm run server)</p>}

            {map && (
                <>
                    <p>{mode}, seed {map.seed}, {map.width}×{map.height}, {map.rooms.length} rooms</p>
                    <MapCanvas map={map} />
                </>
            )}
        </main>
    );
}