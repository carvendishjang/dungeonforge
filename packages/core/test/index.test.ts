import { describe, it, expect } from 'vitest';
import {greet } from '../src/index';

describe('greet', () => {
    it('includes the name', () => {
        expect(greet('Ada')).toContain('Ada');
    });
});