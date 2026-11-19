import express, { type ErrorRequestHandler } from 'express';
import { createConfig, generate } from '@dungeonforge/core';
import { GenerateRequest } from './schema';

/** Turns errors into JSON. Never leaks a stack trace to the client. */
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    // express.json() errors (bad JSON, body too big) carry  a 4xx status and expose: true
    if (err?.expose && typeof err.status ==='number') {
        res.status(err.status).json({ error: err.message });
        return;
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
};

/** Builds the app without starting it, so tests can start it on any port. */
export function createApp() {
    const app = express();
    app.use(express.json({ limit: '10kb' }));   // parse JSON bodies; reject anything bigger than 10 kB

    app.get('/api/health', (_req, res) => {
        res.json({ ok: true});
    })

    app.post('/api/generate', (req, res) => {
        const parsed = GenerateRequest.safeParse(req.body ?? {});

        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid request',
                                   issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message}))});
            return;
        }
        const { mode, seed, width, height } = parsed.data;
        res.json( generate(createConfig(mode, seed, width, height)));
    });

    app.use(errorHandler);  // must come AFTER the routes
    return app;
}