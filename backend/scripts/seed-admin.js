// Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NOMBRE=... npm run seed:admin
import bcrypt from 'bcryptjs';
import { loadEnv } from '../src/config/env.js';
import { createDb } from '../src/db/pool.js';

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOMBRE = 'Administrador' } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('Definir ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 8 caracteres).');
  process.exit(1);
}

const db = createDb(loadEnv().db);
try {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await db.query(
    `INSERT INTO usuario (nombre, email, password_hash, rol_id)
     SELECT ?, ?, ?, id FROM rol WHERE nombre = 'Administrador'`,
    [ADMIN_NOMBRE, ADMIN_EMAIL.toLowerCase(), hash],
  );
  console.log(`Administrador creado: ${ADMIN_EMAIL}`);
} finally {
  await db.close();
}
