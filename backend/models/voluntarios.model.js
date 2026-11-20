const { conection, transaccion } = require('../config/db.js');
const { HttpError } = require('../middlewares/errors.js');

const listar = async (todos) => {
  const [rows] = await conection.query(
    `SELECT v.id, v.nombre_visible, v.activo,
            EXISTS (SELECT 1 FROM turno t WHERE t.voluntario_id = v.id) AS tiene_turnos
     FROM voluntario v
     ${todos ? '' : 'WHERE v.activo = TRUE'}
     ORDER BY v.activo DESC, v.nombre_visible`,
  );
  return rows;
};

const obtener = async (id) => {
  const [rows] = await conection.query('SELECT id, nombre_visible, activo FROM voluntario WHERE id = ?', [id]);
  return rows[0];
};

const crear = async (nombreVisible) => {
  const [result] = await conection.query('INSERT INTO voluntario (nombre_visible) VALUES (?)', [nombreVisible]);
  return result.insertId;
};

// Editar voluntario
const cambiar = async (id, { activo, nombreVisible }) => {
  const campos = [];
  const valores = [];
  if (activo !== undefined) {
    campos.push('activo = ?');
    valores.push(activo);
  }
  if (nombreVisible !== undefined) {
    campos.push('nombre_visible = ?');
    valores.push(nombreVisible);
  }
  const [result] = await conection.query(`UPDATE voluntario SET ${campos.join(', ')} WHERE id = ?`, [...valores, id]);
  return result.affectedRows;
};

// Borrar voluntario
const borrar = (id) =>
  transaccion(async (conexion) => {
    const [rows] = await conexion.query('SELECT nombre_visible FROM voluntario WHERE id = ? FOR UPDATE', [id]);
    const voluntario = rows[0];
    if (!voluntario) throw new HttpError(404, 'Voluntario no encontrado');
    const [turnos] = await conexion.query('SELECT COUNT(*) AS n FROM turno WHERE voluntario_id = ?', [id]);
    if (Number(turnos[0].n) > 0) {
      throw new HttpError(
        409,
        `${voluntario.nombre_visible} ya tiene turnos asignados: no se puede borrar. Si ya no participa, dalo de baja.`,
      );
    }
    await conexion.query('DELETE FROM voluntario WHERE id = ?', [id]);
  });

/* Turnos */

const listarTurnos = async (desde, hasta) => {
  const [rows] = await conection.query(
    `SELECT t.id, t.fecha, t.servicio, t.tarea, v.nombre_visible AS voluntario
     FROM turno t JOIN voluntario v ON v.id = t.voluntario_id
     WHERE t.fecha BETWEEN ? AND ? ORDER BY t.fecha, t.servicio, t.tarea`,
    [desde, hasta],
  );
  return rows;
};

const crearTurno = async ({ fecha, servicio, tarea, voluntarioId }) => {
  const [result] = await conection.query(
    'INSERT INTO turno (fecha, servicio, tarea, voluntario_id) VALUES (?, ?, ?, ?)',
    [fecha, servicio, tarea, voluntarioId],
  );
  return result.insertId;
};

const borrarTurno = async (id) => {
  const [result] = await conection.query('DELETE FROM turno WHERE id = ?', [id]);
  return result.affectedRows;
};

module.exports = { listar, obtener, crear, cambiar, borrar, listarTurnos, crearTurno, borrarTurno };
