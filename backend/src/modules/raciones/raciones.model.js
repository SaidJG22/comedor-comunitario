/** Guardar raciones */
export function guardar(db, { fecha, servicio, cantidad, usuarioId, observacion }) {
  return db.query(
    `INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
     VALUES (?, ?, ?, ?, ?) AS nueva
     ON DUPLICATE KEY UPDATE cantidad = nueva.cantidad, usuario_id = nueva.usuario_id,
                             observacion = nueva.observacion`,
    [fecha, servicio, cantidad, usuarioId, observacion ?? null],
  );
}

export function listar(db, desde, hasta) {
  return db.query(
    `SELECT id, fecha, servicio, cantidad, observacion FROM racion_diaria
     WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC, servicio`,
    [desde, hasta],
  );
}

/** Borrar raciones */
export async function borrar(db, id) {
  const out = await db.query('DELETE FROM racion_diaria WHERE id = ?', [id]);
  return out.affectedRows;
}
