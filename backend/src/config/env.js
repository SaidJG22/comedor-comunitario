import 'dotenv/config';

const SECRETO_POR_DEFECTO = 'solo-desarrollo-cambiar';

/** Lee y valida la configuración. En producción exige un JWT_SECRET propio y largo. */
export function loadEnv(source = process.env) {
  const env = {
    produccion: source.NODE_ENV === 'production',
    port: Number(source.PORT ?? 3000),
    corsOrigin: source.CORS_ORIGIN ?? 'http://localhost:5173',
    jwtSecret: source.JWT_SECRET ?? SECRETO_POR_DEFECTO,
    loginLimit: Number(source.LOGIN_LIMIT ?? 20),
    db: {
      host: source.DB_HOST ?? 'localhost',
      port: Number(source.DB_PORT ?? 3306),
      user: source.DB_USER ?? 'root',
      password: source.DB_PASSWORD ?? '',
      database: source.DB_NAME ?? 'mesa_abierta',
    },
  };

  for (const [nombre, valor] of [['PORT', env.port], ['DB_PORT', env.db.port], ['LOGIN_LIMIT', env.loginLimit]]) {
    if (!Number.isInteger(valor) || valor <= 0) throw new Error(`Configuración inválida: ${nombre} debe ser un número entero positivo.`);
  }
  if (env.produccion && (env.jwtSecret === SECRETO_POR_DEFECTO || env.jwtSecret.length < 32)) {
    throw new Error('Configuración insegura: en producción JWT_SECRET debe definirse y tener al menos 32 caracteres.');
  }
  if (!env.produccion && env.jwtSecret === SECRETO_POR_DEFECTO) {
    console.warn('Aviso: se usa el JWT_SECRET de desarrollo. Definí JWT_SECRET en backend/.env.');
  }
  return env;
}
