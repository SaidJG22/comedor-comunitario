// Usuarios de prueba
import bcrypt from 'bcryptjs';
import { loadEnv } from '../src/config/env.js';
import { createDb } from '../src/db/pool.js';

const USUARIOS = [
  { nombre: 'Admin de prueba', email: 'admin@cometuc.test', rol: 'Administrador' },
  { nombre: 'Responsable de prueba', email: 'responsable@cometuc.test', rol: 'Responsable' },
  { nombre: 'Voluntario de prueba', email: 'voluntario@cometuc.test', rol: 'Voluntario' },
];

const env = loadEnv();
const clave = process.env.PRUEBA_PASSWORD;
if (!clave || clave.length < 8) {
  console.error('Definí PRUEBA_PASSWORD (mínimo 8 caracteres) en backend/.env. No se creó ningún usuario.');
  process.exit(1);
}

const db = createDb(env.db);
try {
  const hash = await bcrypt.hash(clave, 10);
  for (const u of USUARIOS) {
    const [existe] = await db.query('SELECT id FROM usuario WHERE email = ?', [u.email]);
    if (existe) {
      console.log(`- ${u.email} ya existe (no se tocó)`);
      continue;
    }
    const r = await db.query(
      'INSERT INTO usuario (nombre, email, password_hash, rol_id) SELECT ?, ?, ?, id FROM rol WHERE nombre = ?',
      [u.nombre, u.email, hash, u.rol],
    );
    console.log(r.affectedRows ? `✓ ${u.rol}: ${u.email}` : `✗ falta el rol ${u.rol}: ejecutá seed.sql`);
  }
  console.log('La contraseña de los tres es la de PRUEBA_PASSWORD.');
} finally {
  await db.close();
}
