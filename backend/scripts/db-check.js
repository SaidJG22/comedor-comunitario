// Uso: npm run db:check
// Diagnostica la conexión con MySQL usando backend/.env. Nunca imprime la contraseña.
import { existsSync } from 'node:fs';
import { loadEnv } from '../src/config/env.js';
import { createDb } from '../src/db/pool.js';

const TABLAS_ESPERADAS = [
  'rol', 'usuario', 'categoria', 'producto', 'lote_stock', 'movimiento_stock', 'origen_donacion',
  'donacion', 'donacion_item', 'menu', 'menu_insumo', 'racion_diaria', 'voluntario', 'funcion_turno', 'turno',
];

const AYUDA = {
  ECONNREFUSED: 'No hay un servidor MySQL escuchando en ese host y puerto. Verificá que el servicio MySQL80 esté iniciado y que DB_HOST/DB_PORT (3306) de backend/.env sean correctos.',
  ER_ACCESS_DENIED_ERROR: 'MySQL rechazó el usuario o la contraseña. Revisá DB_USER y DB_PASSWORD en backend/.env y que hayas ejecutado db/crear-usuario.sql.',
  ER_BAD_DB_ERROR: 'La base de datos no existe. Ejecutá backend/db/schema.sql en MySQL Workbench.',
};

if (!existsSync(new URL('../.env', import.meta.url))) {
  console.error('✗ No existe backend/.env. Copiá .env.example a .env y completá DB_USER, DB_PASSWORD y JWT_SECRET.');
  process.exit(1);
}

const env = loadEnv();
const db = createDb(env.db);
let fallo = false;
const ok = (m) => console.log(`✓ ${m}`);
const mal = (m) => {
  fallo = true;
  console.error(`✗ ${m}`);
};

try {
  console.log(`Conectando a ${env.db.host}:${env.db.port} como "${env.db.user}" (base "${env.db.database}")…`);
  const [info] = await db.query('SELECT VERSION() AS version, @@sql_mode AS modo');
  ok(`Servidor MySQL ${info.version}`);
  if (!info.version.startsWith('8.')) mal('Se esperaba MySQL 8.x.');
  ok(`sql_mode: ${info.modo.includes('ONLY_FULL_GROUP_BY') ? 'incluye ONLY_FULL_GROUP_BY (las consultas son compatibles)' : info.modo || '(vacío)'}`);

  const tablas = (await db.query('SELECT table_name AS t FROM information_schema.tables WHERE table_schema = DATABASE()')).map((r) => r.t.toLowerCase());
  const faltan = TABLAS_ESPERADAS.filter((t) => !tablas.includes(t));
  // funcion_turno se agrega con la migración 001 (más abajo); el resto viene de schema.sql.
  const faltanBase = faltan.filter((t) => t !== 'funcion_turno');
  if (faltanBase.length) mal(`Faltan tablas: ${faltanBase.join(', ')}. Ejecutá backend/db/schema.sql.`);
  else if (faltan.length === 0) ok(`Las ${TABLAS_ESPERADAS.length} tablas existen`);
  else ok(`Las ${TABLAS_ESPERADAS.length - 1} tablas base existen`);

  if (!faltan.includes('rol')) {
    const roles = (await db.query('SELECT nombre FROM rol ORDER BY id')).map((r) => r.nombre);
    if (roles.length === 3) ok(`Roles cargados: ${roles.join(', ')}`);
    else mal('Faltan los roles. Ejecutá backend/db/seed.sql.');
    const [{ n }] = await db.query(
      "SELECT COUNT(*) AS n FROM usuario u JOIN rol r ON r.id = u.rol_id WHERE r.nombre = 'Administrador' AND u.activo = TRUE",
    );
    if (n > 0) ok(`Administradores activos: ${n}`);
    else console.log('• Todavía no hay administrador: creálo con "npm run seed:admin".');
  }
  // Roles dentro de cada turno (migración 001)
  if (faltan.includes('funcion_turno')) {
    mal('Falta la tabla funcion_turno (roles de turno). Ejecutá backend/db/migraciones/001-roles-de-turno.sql en MySQL Workbench.');
  } else {
    const [{ n: col }] = await db.query(
      "SELECT COUNT(*) AS n FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'turno' AND column_name = 'funcion_id'",
    );
    const [{ n: roles }] = await db.query('SELECT COUNT(*) AS n FROM funcion_turno WHERE activo = TRUE');
    if (col === 0) mal('La tabla turno no tiene la columna funcion_id. Ejecutá backend/db/migraciones/001-roles-de-turno.sql.');
    else ok(`Roles de turno: columna turno.funcion_id presente y ${roles} roles cargados`);
  }
  const [{ n: personas }] = await db.query(
    "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name REGEXP 'benefici|persona|asistente'",
  );
  if (personas === 0) ok('No hay tablas de personas asistidas (el sistema no es un CRM)');
  else mal('Hay tablas que parecen guardar personas asistidas: revisar el modelo.');
} catch (err) {
  mal(AYUDA[err.code] ?? `${err.code ?? 'Error'}: ${err.message}`);
} finally {
  await db.close().catch(() => {});
}

process.exit(fallo ? 1 : 0);
