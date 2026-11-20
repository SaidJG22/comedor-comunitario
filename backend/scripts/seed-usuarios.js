// Usuarios de prueba
const bcrypt = require('bcryptjs');
const { conection } = require('../config/db.js');

const USUARIOS = [
  { nombre: 'Admin de prueba', email: 'admin@cometuc.test', rol: 'Administrador' },
  { nombre: 'Responsable de prueba', email: 'responsable@cometuc.test', rol: 'Responsable' },
  { nombre: 'Voluntario de prueba', email: 'voluntario@cometuc.test', rol: 'Voluntario' },
];

const clave = process.env.PRUEBA_PASSWORD;
if (!clave || clave.length < 8) {
  console.error('Definí PRUEBA_PASSWORD (mínimo 8 caracteres) en backend/.env. No se creó ningún usuario.');
  process.exit(1);
}

const crearUsuarios = async () => {
  try {
    const hash = await bcrypt.hash(clave, 10);
    for (const usuario of USUARIOS) {
      const [existe] = await conection.query('SELECT id FROM usuario WHERE email = ?', [usuario.email]);
      if (existe.length) {
        console.log(`- ${usuario.email} ya existe (no se tocó)`);
        continue;
      }
      const [result] = await conection.query(
        'INSERT INTO usuario (nombre, email, password_hash, rol_id) SELECT ?, ?, ?, id FROM rol WHERE nombre = ?',
        [usuario.nombre, usuario.email, hash, usuario.rol],
      );
      console.log(result.affectedRows ? `✓ ${usuario.rol}: ${usuario.email}` : `✗ falta el rol ${usuario.rol}: ejecutá seed.sql`);
    }
    console.log('La contraseña de los tres es la de PRUEBA_PASSWORD.');
  } finally {
    await conection.end();
  }
};

crearUsuarios();
