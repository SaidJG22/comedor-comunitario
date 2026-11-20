const { conection } = require('../config/db.js');

// Guardar raciones
const guardar = async ({ fecha, servicio, cantidad, usuarioId, observacion }) => {
  await conection.query(
    `INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
     VALUES (?, ?, ?, ?, ?) AS nueva
     ON DUPLICATE KEY UPDATE cantidad = nueva.cantidad, usuario_id = nueva.usuario_id,
                             observacion = nueva.observacion`,
    [fecha, servicio, cantidad, usuarioId, observacion ?? null],
  );
};

const listar = async (desde, hasta) => {
  const [rows] = await conection.query(
    `SELECT id, fecha, servicio, cantidad, observacion FROM racion_diaria
     WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC, servicio`,
    [desde, hasta],
  );
  return rows;
};

const borrar = async (id) => {
  const [result] = await conection.query('DELETE FROM racion_diaria WHERE id = ?', [id]);
  return result.affectedRows;
};

module.exports = { guardar, listar, borrar };
