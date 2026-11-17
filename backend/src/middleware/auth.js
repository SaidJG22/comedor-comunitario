import jwt from 'jsonwebtoken';
import { HttpError } from './errors.js';

export const ROLES = Object.freeze({
  ADMIN: 'Administrador',
  RESPONSABLE: 'Responsable',
  VOLUNTARIO: 'Voluntario',
});

export function makeAuth(secret) {
  function requireAuth(req, _res, next) {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return next(new HttpError(401, 'Autenticación requerida'));
    }
    try {
      const payload = jwt.verify(token, secret);
      req.user = { id: Number(payload.sub), rol: payload.rol, nombre: payload.nombre };
      return next();
    } catch {
      return next(new HttpError(401, 'Sesión inválida o vencida'));
    }
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
