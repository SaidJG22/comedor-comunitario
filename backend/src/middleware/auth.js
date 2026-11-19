import jwt from 'jsonwebtoken';
import { HttpError } from './errors.js';

export const ROLES = Object.freeze({
  ADMIN: 'Administrador',
  RESPONSABLE: 'Responsable',
  VOLUNTARIO: 'Voluntario',
});

/** Autenticación */
export function makeAuth(secret, db) {
  async function requireAuth(req, _res, next) {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return next(new HttpError(401, 'Autenticación requerida'));
    }
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      return next(new HttpError(401, 'Sesión inválida o vencida'));
    }
    const id = Number(payload.sub);
    if (!db) {
      req.user = { id, rol: payload.rol, nombre: payload.nombre };
      return next();
    }
    // Estado y rol actuales
    const [u] = await db.query(
      'SELECT u.nombre, u.activo, r.nombre AS rol FROM usuario u JOIN rol r ON r.id = u.rol_id WHERE u.id = ?',
      [id],
    );
    if (!u?.activo) return next(new HttpError(401, 'Tu cuenta no está activa. Volvé a ingresar o consultá al administrador.'));
    req.user = { id, rol: u.rol, nombre: u.nombre };
    return next();
  }

  const requireRole =
    (...roles) =>
    (req, _res, next) =>
      roles.includes(req.user?.rol)
        ? next()
        : next(new HttpError(403, 'No tiene permisos para esta acción'));

  const signToken = (usuario) =>
    jwt.sign({ rol: usuario.rol, nombre: usuario.nombre }, secret, {
      subject: String(usuario.id),
      expiresIn: '8h',
    });

  return { requireAuth, requireRole, signToken };
}
