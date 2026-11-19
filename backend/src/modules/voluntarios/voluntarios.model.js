import { HttpError } from '../../middleware/errors.js';

/** Listar voluntarios */
export function listar(db, todos) {
  return db.query(
    `SELECT v.id, v.nombre_visible, v.activo,
            EXISTS (SELECT 1 FROM turno t WHERE t.voluntario_id = v.id) AS tiene_turnos
     FROM voluntario v
     ${todos ? '' : 'WHERE v.activo = TRUE'}
     ORDER BY v.activo DESC, v.nombre_visible`,
  );
}

/** Borrar voluntario */
export function borrar(db, id) {
  return db.transaction(async (tx) => {
    const [v] = await tx.query('SELECT nombre_visible FROM voluntario WHERE id = ? FOR UPDATE', [id]);
    if (!v) throw new HttpError(404, 'Voluntario no encontrado');
    const [{ n }] = await tx.query('SELECT COUNT(*) AS n FROM turno WHERE voluntario_id = ?', [id]);
    if (Number(n) > 0) {
      throw new HttpError(409, `${v.nombre_visible} ya tiene turnos asignados: no se puede borrar. Si ya no participa, dalo de baja.`);
    }
    await tx.query('DELETE FROM voluntario WHERE id = ?', [id]);
  });
}

export async function obtener(db, id) {
  const [v] = await db.query('SELECT id, nombre_visible, activo FROM voluntario WHERE id = ?', [id]);
  return v;
}

export async function crear(db, nombreVisible) {
  const out = await db.query('INSERT INTO voluntario (nombre_visible) VALUES (?)', [nombreVisible]);
  return out.insertId;
}

/** Editar voluntario */
export async function cambiar(db, id, { activo, nombreVisible }) {
  const sets = [];
  const params = [];
  if (activo !== undefined) {
    sets.push('activo = ?');
    params.push(activo);
  }
  if (nombreVisible !== undefined) {
    sets.push('nombre_visible = ?');
    params.push(nombreVisible);
  }
  const out = await db.query(`UPDATE voluntario SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
  return out.affectedRows;
}

export function listarTurnos(db, desde, hasta) {
  return db.query(
    `SELECT t.id, t.fecha, t.servicio, t.tarea, v.nombre_visible AS voluntario
     FROM turno t JOIN voluntario v ON v.id = t.voluntario_id
     WHERE t.fecha BETWEEN ? AND ? ORDER BY t.fecha, t.servicio, t.tarea`,
    [desde, hasta],
  );
}

export async function crearTurno(db, { fecha, servicio, tarea, voluntarioId }) {
  const out = await db.query(
    'INSERT INTO turno (fecha, servicio, tarea, voluntario_id) VALUES (?, ?, ?, ?)',
    [fecha, servicio, tarea, voluntarioId],
  );
  return out.insertId;
}

export async function borrarTurno(db, id) {
  const out = await db.query('DELETE FROM turno WHERE id = ?', [id]);
  return out.affectedRows;
}
