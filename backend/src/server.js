import { loadEnv } from './config/env.js';
import { createDb } from './db/pool.js';
import { createApp } from './app.js';

const env = loadEnv();
const db = createDb(env.db);
const app = createApp({ db, env });

const server = app.listen(env.port, () => {
  console.log(`API ComeTUC escuchando en http://localhost:${env.port}`);
});

const cerrar = () => server.close(() => db.close().finally(() => process.exit(0)));
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);
