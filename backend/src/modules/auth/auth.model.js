/** Usuario por correo */
export async function buscarPorEmail(db, email) {
  const [u] = await db.query(
    `SELECT u.id, u.nombre, u.password_hash, u.activo, r.nombre AS rol
     FROM usuario u JOIN rol r ON r.id = u.rol_id WHERE u.email = ?`,
    [email],
  );
  return u;
}

/** Hash de la contraseña */
export async function hashDeUsuarioActivo(db, id) {
  const [u] = await db.query('SELECT password_hash FROM usuario WHERE id = ? AND activo = TRUE', [id]);
  return u?.password_hash;
}

export const cambiarHash = (db, id, hash) => db.query('UPDATE usuario SET password_hash = ? WHERE id = ?', [hash, id]);

/** Cuenta pendiente */
export async function crearPendiente(db, { nombre, email, hash }) {
  const r = await db.query(
    "INSERT INTO usuario (nombre, email, password_hash, rol_id, activo) SELECT ?, ?, ?, id, FALSE FROM rol WHERE nombre = 'Voluntario'",
    [nombre, email, hash],
  );
  return r.insertId;
}
