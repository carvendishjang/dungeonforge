// The interface every generator step will receive.
export interface Rng {
    next(): number;                         // float in  [0)
    int(min: number, max: number): number;  // whole number, min and max are both included
    chance(p: number): boolean;             // true with probability p (0..1)
    pick<T>(items: readonly T[]): T;        // a random element of the array
}

// mulberry32: tiny, fast, good-enough PRNG.
// Returns a FUNCTION that remembers `state` between calls (a closure).
function mulberry32(seed: number): () => number {
    let state = seed >>> 0; // force into an unsigned 32-bit integer
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function createRng(seed: number): Rng {
    const next = mulberry32(seed);
    return {
        next,
        int(min, max) {
            const count = max - min + 1;
            return Math.floor(next() * count) + min;
            
        },
        chance(p) {
            return next() < p;
        },
        pick(items) {
            if (items.length === 0) throw new Error('pick called with an empty array');
            return items[this.int(0, items.length - 1)];
        },
    };
}