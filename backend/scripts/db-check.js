// Diagnóstico de la base
const { existsSync } = require('node:fs');
const path = require('node:path');

if (!existsSync(path.join(__dirname, '..', '.env'))) {
  console.error('✗ No existe backend/.env. Copiá .env.example a .env y completá DB_USER, DB_PASSWORD y JWT_SECRET.');
  process.exit(1);
}

const { conection } = require('../config/db.js');

const TABLAS_ESPERADAS = [
  'rol', 'usuario', 'categoria', 'producto', 'lote_stock', 'movimiento_stock', 'origen_donacion',
  'donacion', 'donacion_item', 'menu', 'menu_insumo', 'racion_diaria', 'voluntario', 'turno',
];

const AYUDA = {
  ECONNREFUSED: 'No hay un servidor MySQL escuchando en ese host y puerto. Verificá que el servicio MySQL80 esté iniciado y que DB_HOST/DB_PORT (3306) de backend/.env sean correctos.',
  ER_ACCESS_DENIED_ERROR: 'MySQL rechazó el usuario o la contraseña. Revisá DB_USER y DB_PASSWORD en backend/.env y que hayas ejecutado db/crear-usuario.sql.',
  ER_BAD_DB_ERROR: 'La base de datos no existe. Ejecutá backend/db/schema.sql en MySQL Workbench.',
};

let fallo = false;
const ok = (mensaje) => console.log(`✓ ${mensaje}`);
const mal = (mensaje) => {
  fallo = true;
  console.error(`✗ ${mensaje}`);
};

const revisar = async () => {
  const { DB_HOST = 'localhost', DB_PORT = 3306, DB_USER, DB_NAME = 'cometuc' } = process.env;
  try {
    console.log(`Conectando a ${DB_HOST}:${DB_PORT} como "${DB_USER}" (base "${DB_NAME}")…`);
    const [info] = await conection.query('SELECT VERSION() AS version, @@sql_mode AS modo');
    ok(`Servidor MySQL ${info[0].version}`);
    if (!info[0].version.startsWith('8.')) mal('Se esperaba MySQL 8.x.');
    const modo = info[0].modo;
    ok(`sql_mode: ${modo.includes('ONLY_FULL_GROUP_BY') ? 'incluye ONLY_FULL_GROUP_BY (las consultas son compatibles)' : modo || '(vacío)'}`);

    const [tablasRows] = await conection.query('SELECT table_name AS t FROM information_schema.tables WHERE table_schema = DATABASE()');
    const tablas = tablasRows.map((r) => r.t.toLowerCase());
    const faltan = TABLAS_ESPERADAS.filter((t) => !tablas.includes(t));
    if (faltan.length) mal(`Faltan tablas: ${faltan.join(', ')}. Ejecutá backend/db/schema.sql.`);
    else ok(`Las ${TABLAS_ESPERADAS.length} tablas existen`);

    if (!faltan.includes('rol')) {
      const [rolesRows] = await conection.query('SELECT nombre FROM rol ORDER BY id');
      const roles = rolesRows.map((r) => r.nombre);
      if (roles.length === 3) ok(`Roles cargados: ${roles.join(', ')}`);
      else mal('Faltan los roles. Ejecutá backend/db/seed.sql.');
      const [admins] = await conection.query(
        "SELECT COUNT(*) AS n FROM usuario u JOIN rol r ON r.id = u.rol_id WHERE r.nombre = 'Administrador' AND u.activo = TRUE",
      );
      if (admins[0].n > 0) ok(`Administradores activos: ${admins[0].n}`);
      else console.log('• Todavía no hay administrador: creálo con "npm run seed:admin".');
    }
    const [personas] = await conection.query(
      "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name REGEXP 'benefici|persona|asistente'",
    );
    if (personas[0].n === 0) ok('No hay tablas de personas asistidas');
    else mal('Hay tablas que parecen guardar personas asistidas: revisar el modelo.');
  } catch (error) {
    mal(AYUDA[error.code] ?? `${error.code ?? 'Error'}: ${error.message}`);
  } finally {
    await conection.end().catch(() => {});
  }
  process.exit(fallo ? 1 : 0);
};

revisar();
