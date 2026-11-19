import { describe, it, expect } from 'vitest';
import { parseCliArgs, parseIntFlag } from '../src/args';

describe('parseIntFlag', () => {
  it('accepts whole numbers in range', () => {
    expect(parseIntFlag('seed', '42', 0, 100)).toBe(42);
  });

  it.each(['', 'abc', '4.5', '1e3', '0x1F', ' 7 '])('rejects %j', (raw) => {
    expect(() => parseIntFlag('seed', raw, 0, 100)).toThrow(/whole number/);
  });

  it('rejects numbers out of range', () => {
    expect(() => parseIntFlag('width', '5', 10, 200)).toThrow(/between 10 and 200/);
    expect(() => parseIntFlag('width', '201', 10, 200)).toThrow(/between 10 and 200/);
  });
});

describe('parseCliArgs', () => {
  it('uses defaults when no flags are given', () => {
    expect(parseCliArgs([])).toEqual({
      out: undefined,
      config: { mode: 'bsp', seed: 42, width: 60, height: 30, minLeafSize: 6, maxDepth: 4, minRoomSize: 3 },
    });
  });

  it('builds a caves config', () => {
    const { config, out } = parseCliArgs(['--mode', 'caves', '--seed', '36', '--out', 'maps/c.json']);
    expect(config).toEqual({ mode: 'caves', seed: 36, width: 60, height: 30, fillChance: 0.45, iterations: 5 });
    expect(out).toBe('maps/c.json');
  });

  it('accepts --flag=value form', () => {
    expect(parseCliArgs(['--seed=7']).config.seed).toBe(7);
  });

  it('rejects an unknown mode', () => {
    expect(() => parseCliArgs(['--mode', 'lava'])).toThrow(/bsp or caves/);
  });

  it('rejects unknown flags (typo protection)', () => {
    expect(() => parseCliArgs(['--sed', '42'])).toThrow();
  });
});