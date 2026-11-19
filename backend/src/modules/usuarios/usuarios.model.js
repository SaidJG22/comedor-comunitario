import { HttpError } from '../../middleware/errors.js';

/** Registros del usuario */
const TIENE_REGISTROS = `(EXISTS (SELECT 1 FROM movimiento_stock x WHERE x.usuario_id = u.id)
  OR EXISTS (SELECT 1 FROM donacion x WHERE x.usuario_id = u.id)
  OR EXISTS (SELECT 1 FROM racion_diaria x WHERE x.usuario_id = u.id))`;

export function listar(db) {
  return db.query(
    `SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo, ${TIENE_REGISTROS} AS tiene_registros
     FROM usuario u JOIN rol r ON r.id = u.rol_id ORDER BY u.nombre`,
  );
}

/** Borrar usuario */
export function borrar(db, id) {
  return db.transaction(async (tx) => {
    const [u] = await tx.query('SELECT nombre FROM usuario WHERE id = ? FOR UPDATE', [id]);
    if (!u) throw new HttpError(404, 'Usuario no encontrado');
    const [{ registros }] = await tx.query(`SELECT ${TIENE_REGISTROS} AS registros FROM usuario u WHERE u.id = ?`, [id]);
    if (Number(registros)) {
      throw new HttpError(409, `${u.nombre} ya cargó movimientos, donaciones o raciones: no se puede borrar. Desactivalo.`);
    }
    await tx.query('DELETE FROM usuario WHERE id = ?', [id]);
  });
}

export async function obtener(db, id) {
  const [u] = await db.query(
    'SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo FROM usuario u JOIN rol r ON r.id = u.rol_id WHERE u.id = ?',
    [id],
  );
  return u;
}

/** Editar usuario */
export async function cambiar(db, id, { nombre, email, activo, rol }) {
  const sets = [];
  const params = [];
  if (nombre !== undefined) {
    sets.push('nombre = ?');
    params.push(nombre);
  }
  if (email !== undefined) {
    sets.push('email = ?');
    params.push(email);
  }
  if (activo !== undefined) {
    sets.push('activo = ?');
    params.push(activo);
  }
  if (rol !== undefined) {
    sets.push('rol_id = (SELECT id FROM rol WHERE nombre = ?)');
    params.push(rol);
  }
  const out = await db.query(`UPDATE usuario SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
  return out.affectedRows;
}

export async function cambiarHash(db, id, hash) {
  const out = await db.query('UPDATE usuario SET password_hash = ? WHERE id = ?', [hash, id]);
  return out.affectedRows;
}

export async function crear(db, { nombre, email, hash, rol }) {
  const out = await db.query(
    'INSERT INTO usuario (nombre, email, password_hash, rol_id) SELECT ?, ?, ?, id FROM rol WHERE nombre = ?',
    [nombre, email, hash, rol],
  );
  return out.insertId;
}
