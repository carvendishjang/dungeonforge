import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './app';

const PORT = Number(process.env.PORT ?? 3001);

// apps/server/src/main.ts -> ../../web/dist = apps/web/dist
const webDist = fileURLToPath(new URL('../../web/dist', import.meta.url));
const staticDir = existsSync(webDist) ? webDist : undefined;

createApp({ staticDir }).listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
    console.log(staticDir ? `Serving web app from ${staticDir}` : 'No web build found (run npm run build)');
});