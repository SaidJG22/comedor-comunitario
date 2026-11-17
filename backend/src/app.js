import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { makeAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { stockRoutes } from './modules/stock/stock.routes.js';
import { donacionesRoutes } from './modules/donaciones/donaciones.routes.js';
import { menusRoutes } from './modules/menus/menus.routes.js';
import { racionesRoutes } from './modules/raciones/raciones.routes.js';
import { voluntariosRoutes } from './modules/voluntarios/voluntarios.routes.js';
import { reportesRoutes } from './modules/reportes/reportes.routes.js';
import { usuariosRoutes } from './modules/usuarios/usuarios.routes.js';

/**
 * Crea la aplicación Express. `db` y `env` se inyectan para poder probar sin MySQL real.
 */
export function createApp({ db, env }) {
  const app = express();
  const auth = makeAuth(env.jwtSecret);
  const deps = { db, auth };

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', servicio: 'mesa-abierta-api' }));
  // Comprueba además la conexión con la base de datos (503 si no responde).
  app.get('/api/health/db', async (_req, res) => {
    await db.query('SELECT 1');
    res.json({ status: 'ok', baseDeDatos: 'conectada' });
  });

  // Freno a la adivinación de contraseñas: máximo de intentos de inicio de sesión por IP.
  app.use(
    '/api/auth/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: env.loginLimit ?? 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Demasiados intentos de ingreso. Esperá unos minutos y probá de nuevo.' },
    }),
  );
  app.use(
    '/api/auth/password',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Demasiados intentos. Esperá unos minutos y probá de nuevo.' },
    }),
  );
  app.use('/api/auth', authRoutes(deps));

  const protegido = auth.requireAuth;
  app.use('/api/stock', protegido, stockRoutes(deps));
  app.use('/api/donaciones', protegido, donacionesRoutes(deps));
  app.use('/api/menus', protegido, menusRoutes(deps));
  app.use('/api/raciones', protegido, racionesRoutes(deps));
  app.use('/api/voluntarios', protegido, voluntariosRoutes(deps));
  app.use('/api/reportes', protegido, reportesRoutes(deps));
  app.use('/api/usuarios', protegido, usuariosRoutes(deps));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
