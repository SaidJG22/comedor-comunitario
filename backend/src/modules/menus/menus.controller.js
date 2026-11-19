import { idParam } from '../../middleware/validate.js';
import { HttpError } from '../../middleware/errors.js';
import * as modelo from './menus.model.js';

export function crearMenusController({ db }) {
  return {
    async listar(req, res) {
      const { desde = '1900-01-01', hasta = '2999-12-31' } = req.valid;
      res.json(await modelo.listar(db, desde, hasta));
    },

    async obtener(req, res) {
      const menu = await modelo.obtener(db, idParam.parse(req.params.id));
      if (!menu) throw new HttpError(404, 'Menú no encontrado');
      res.json(menu);
    },

    async crear(req, res) {
      const { insumos, ...m } = req.valid;
      res.status(201).json({ id: await modelo.crear(db, m, insumos) });
    },

    async editar(req, res) {
      const id = idParam.parse(req.params.id);
      const { insumos, ...m } = req.valid;
      await modelo.editar(db, id, m, insumos);
      res.json({ id });
    },

    async borrar(req, res) {
      await modelo.borrar(db, idParam.parse(req.params.id));
      res.status(204).end();
    },

    async confirmar(req, res) {
      const id = idParam.parse(req.params.id);
      await modelo.confirmar(db, id, req.user.id);
      res.json({ id, estado: 'confirmado' });
    },
  };
}
