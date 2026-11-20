// Crear administrador
const bcrypt = require('bcryptjs');
const { conection } = require('../config/db.js');

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOMBRE = 'Administrador' } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('Definir ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 8 caracteres).');
  process.exit(1);
}

const crearAdmin = async () => {
  try {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await conection.query(
      `INSERT INTO usuario (nombre, email, password_hash, rol_id)
       SELECT ?, ?, ?, id FROM rol WHERE nombre = 'Administrador'`,
      [ADMIN_NOMBRE, ADMIN_EMAIL.toLowerCase(), hash],
    );
    console.log(`Administrador creado: ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error(error.code === 'ER_DUP_ENTRY' ? 'Ya existe un usuario con ese correo.' : error.message);
    process.exitCode = 1;
  } finally {
    await conection.end();
  }
};

crearAdmin();
