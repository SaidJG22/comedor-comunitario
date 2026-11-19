import { idParam } from '../../middleware/validate.js';
import { HttpError } from '../../middleware/errors.js';
import * as modelo from './raciones.model.js';

export function crearRacionesController({ db }) {
  return {
    async guardar(req, res) {
      const { fecha, servicio, cantidad, observacion } = req.valid;
      await modelo.guardar(db, { fecha, servicio, cantidad, observacion, usuarioId: req.user.id });
      res.json({ fecha, servicio, cantidad });
    },

    async listar(req, res) {
      const { desde = '1900-01-01', hasta = '2999-12-31' } = req.valid;
      res.json(await modelo.listar(db, desde, hasta));
    },

    async borrar(req, res) {
      if ((await modelo.borrar(db, idParam.parse(req.params.id))) === 0) throw new HttpError(404, 'Registro de raciones no encontrado');
      res.status(204).end();
    },
  };
}
