const { conection, transaccion } = require('../config/db.js');
const { HttpError } = require('../middlewares/errors.js');

// Registros del usuario
const TIENE_REGISTROS = `(EXISTS (SELECT 1 FROM movimiento_stock x WHERE x.usuario_id = u.id)
  OR EXISTS (SELECT 1 FROM donacion x WHERE x.usuario_id = u.id)
  OR EXISTS (SELECT 1 FROM racion_diaria x WHERE x.usuario_id = u.id))`;

const listar = async () => {
  const [rows] = await conection.query(
    `SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo, ${TIENE_REGISTROS} AS tiene_registros
     FROM usuario u JOIN rol r ON r.id = u.rol_id ORDER BY u.nombre`,
  );
  return rows;
};

const obtener = async (id) => {
  const [rows] = await conection.query(
    `SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo
     FROM usuario u JOIN rol r ON r.id = u.rol_id WHERE u.id = ?`,
    [id],
  );
  return rows[0];
};

const crear = async ({ nombre, email, hash, rol }) => {
  const [result] = await conection.query(
    'INSERT INTO usuario (nombre, email, password_hash, rol_id) SELECT ?, ?, ?, id FROM rol WHERE nombre = ?',
    [nombre, email, hash, rol],
  );
  return result.insertId;
};

// Editar usuario
const cambiar = async (id, { nombre, email, activo, rol }) => {
  const campos = [];
  const valores = [];
  if (nombre !== undefined) {
    campos.push('nombre = ?');
    valores.push(nombre);
  }
  if (email !== undefined) {
    campos.push('email = ?');
    valores.push(email);
  }
  if (activo !== undefined) {
    campos.push('activo = ?');
    valores.push(activo);
  }
  if (rol !== undefined) {
    campos.push('rol_id = (SELECT id FROM rol WHERE nombre = ?)');
    valores.push(rol);
  }
  const [result] = await conection.query(`UPDATE usuario SET ${campos.join(', ')} WHERE id = ?`, [...valores, id]);
  return result.affectedRows;
};

const cambiarHash = async (id, hash) => {
  const [result] = await conection.query('UPDATE usuario SET password_hash = ? WHERE id = ?', [hash, id]);
  return result.affectedRows;
};

// Borrar usuario
const borrar = (id) =>
  transaccion(async (conexion) => {
    const [rows] = await conexion.query('SELECT nombre FROM usuario WHERE id = ? FOR UPDATE', [id]);
    const usuario = rows[0];
    if (!usuario) throw new HttpError(404, 'Usuario no encontrado');
    const [registros] = await conexion.query(`SELECT ${TIENE_REGISTROS} AS tiene FROM usuario u WHERE u.id = ?`, [id]);
    if (Number(registros[0].tiene)) {
      throw new HttpError(409, `${usuario.nombre} ya cargó movimientos, donaciones o raciones: no se puede borrar. Desactivalo.`);
    }
    await conexion.query('DELETE FROM usuario WHERE id = ?', [id]);
  });

module.exports = { listar, obtener, crear, cambiar, cambiarHash, borrar };
