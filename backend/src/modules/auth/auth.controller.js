import bcrypt from 'bcryptjs';
import { HttpError } from '../../middleware/errors.js';
import * as modelo from './auth.model.js';

export function crearAuthController({ db, auth }) {
  return {
    async login(req, res) {
      const { email, password } = req.valid;
      const u = await modelo.buscarPorEmail(db, email.toLowerCase());
      // Mensaje único
      const correcta = u && (await bcrypt.compare(password, u.password_hash));
      if (!correcta) throw new HttpError(401, 'Credenciales incorrectas');
      // Cuenta pendiente
      if (!u.activo) throw new HttpError(403, 'Tu cuenta todavía no está activa: el administrador del comedor tiene que activarla.');

      res.json({
        token: auth.signToken(u),
        usuario: { id: u.id, nombre: u.nombre, rol: u.rol },
      });
    },

    // Registro
    async registro(req, res) {
      const { nombre, email, password } = req.valid;
      const hash = await bcrypt.hash(password, 10);
      try {
        await modelo.crearPendiente(db, { nombre, email: email.toLowerCase(), hash });
      } catch (err) {
        if (err?.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Ya hay una cuenta con ese correo.');
        throw err;
      }
      res.status(201).json({ pendiente: true });
    },

    // Cambiar contraseña
    async cambiarPassword(req, res) {
      const { actual, nueva } = req.valid;
      const hash = await modelo.hashDeUsuarioActivo(db, req.user.id);
      if (!hash || !(await bcrypt.compare(actual, hash))) {
        throw new HttpError(400, 'La contraseña actual no es correcta');
      }
      await modelo.cambiarHash(db, req.user.id, await bcrypt.hash(nueva, 10));
      res.json({ ok: true });
    },
  };
}
