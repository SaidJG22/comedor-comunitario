const { conection } = require('../config/db.js');

// Usuario por correo
const buscarPorEmail = async (email) => {
  const [rows] = await conection.query(
    `SELECT u.id, u.nombre, u.password_hash, u.activo, r.nombre AS rol
     FROM usuario u JOIN rol r ON r.id = u.rol_id WHERE u.email = ?`,
    [email],
  );
  return rows[0];
};

// Hash de la contraseña
const hashDeUsuarioActivo = async (id) => {
  const [rows] = await conection.query('SELECT password_hash FROM usuario WHERE id = ? AND activo = TRUE', [id]);
  return rows[0]?.password_hash;
};

// Cuenta pendiente
const crearPendiente = async ({ nombre, email, hash }) => {
  const [result] = await conection.query(
    `INSERT INTO usuario (nombre, email, password_hash, rol_id, activo)
     SELECT ?, ?, ?, id, FALSE FROM rol WHERE nombre = 'Voluntario'`,
    [nombre, email, hash],
  );
  return result.insertId;
};

module.exports = { buscarPorEmail, hashDeUsuarioActivo, crearPendiente };
