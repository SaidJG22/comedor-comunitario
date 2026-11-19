import bcrypt from 'bcryptjs';
import { idParam } from '../../middleware/validate.js';
import { HttpError } from '../../middleware/errors.js';
import * as modelo from './usuarios.model.js';

export function crearUsuariosController({ db }) {
  return {
    async listar(_req, res) {
      res.json(await modelo.listar(db));
    },

    async obtener(req, res) {
      const u = await modelo.obtener(db, idParam.parse(req.params.id));
      if (!u) throw new HttpError(404, 'Usuario no encontrado');
      res.json(u);
    },

    // Editar usuario
    async cambiar(req, res) {
      const id = idParam.parse(req.params.id);
      const { nombre, email, activo, rol } = req.valid;
      if (id === req.user.id && (activo !== undefined || rol !== undefined)) {
        throw new HttpError(409, 'No podés cambiar tu propio rol ni desactivarte');
      }
      const filas = await modelo.cambiar(db, id, { nombre, email: email?.toLowerCase(), activo, rol });
      if (filas === 0) throw new HttpError(404, 'Usuario no encontrado');
      res.json({ id, ...req.valid });
    },

    async borrar(req, res) {
      const id = idParam.parse(req.params.id);
      if (id === req.user.id) throw new HttpError(409, 'No podés borrar tu propia cuenta');
      await modelo.borrar(db, id);
      res.status(204).end();
    },

    // Restablecer contraseña
    async restablecerPassword(req, res) {
      const id = idParam.parse(req.params.id);
      const hash = await bcrypt.hash(req.valid.password, 10);
      if ((await modelo.cambiarHash(db, id, hash)) === 0) throw new HttpError(404, 'Usuario no encontrado');
      res.json({ ok: true });
    },

    async crear(req, res) {
      const { nombre, email, password, rol } = req.valid;
      const hash = await bcrypt.hash(password, 10);
      res.status(201).json({ id: await modelo.crear(db, { nombre, email: email.toLowerCase(), hash, rol }) });
    },
  };
}
