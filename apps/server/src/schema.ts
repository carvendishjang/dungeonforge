import { z } from 'zod';
import { MODES } from '@dungeonforge/core';

/** What a client may send to POST /api/generate. Anything else -> 400. */
export const GenerateRequest = z.strictObject({
    mode: z.enum(MODES).default('bsp'),
    seed: z.number().int().min(0).max(2 ** 32 - 1).default(42),
    width: z.number().int().min(10).max(200).default(60),
    height: z.number().int().min(10).max(200).default(30),
});

export type GenerateRequest = z.infer<typeof GenerateRequest>; 