import { idParam } from '../../middleware/validate.js';
import { HttpError } from '../../middleware/errors.js';
import * as modelo from './donaciones.model.js';

export function crearDonacionesController({ db }) {
  return {
    async origenes(_req, res) {
      res.json(await modelo.listarOrigenes(db));
    },

    async listar(req, res) {
      const { desde = '1900-01-01', hasta = '2999-12-31' } = req.valid;
      res.json(await modelo.listar(db, desde, hasta));
    },

    async obtener(req, res) {
      const donacion = await modelo.obtener(db, idParam.parse(req.params.id));
      if (!donacion) throw new HttpError(404, 'Donación no encontrada');
      res.json(donacion);
    },

    async crear(req, res) {
      const { items, ...cab } = req.valid;
      res.status(201).json({ id: await modelo.crear(db, cab, items, req.user.id) });
    },

    async editar(req, res) {
      const id = idParam.parse(req.params.id);
      const { items, ...cab } = req.valid;
      await modelo.editar(db, id, cab, items, req.user.id);
      res.json({ id });
    },

    async borrar(req, res) {
      await modelo.borrar(db, idParam.parse(req.params.id));
      res.status(204).end();
    },
  };
}
