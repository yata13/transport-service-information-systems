import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// All data now lives in Supabase (shared with the mobile app) and the website
// talks to it directly with realtime subscriptions. This server only serves
// the web app: Vite middleware in development, the built `dist/` in production.
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const dist = path.resolve(ROOT, 'dist');
    app.use(express.static(dist, { maxAge: '1h', index: false }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(dist, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
