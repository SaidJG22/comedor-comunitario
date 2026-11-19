import { idParam } from '../../middleware/validate.js';
import { HttpError } from '../../middleware/errors.js';
import * as modelo from './voluntarios.model.js';

export function crearVoluntariosController({ db }) {
  return {
    async listar(req, res) {
      res.json(await modelo.listar(db, req.valid.todos === '1'));
    },

    async obtener(req, res) {
      const v = await modelo.obtener(db, idParam.parse(req.params.id));
      if (!v) throw new HttpError(404, 'Voluntario no encontrado');
      res.json(v);
    },

    async crear(req, res) {
      res.status(201).json({ id: await modelo.crear(db, req.valid.nombreVisible) });
    },

    // Editar voluntario
    async cambiar(req, res) {
      const id = idParam.parse(req.params.id);
      if ((await modelo.cambiar(db, id, req.valid)) === 0) throw new HttpError(404, 'Voluntario no encontrado');
      res.json({ id, ...req.valid });
    },

    async borrar(req, res) {
      await modelo.borrar(db, idParam.parse(req.params.id));
      res.status(204).end();
    },

    async listarTurnos(req, res) {
      const { desde = '1900-01-01', hasta = '2999-12-31' } = req.valid;
      res.json(await modelo.listarTurnos(db, desde, hasta));
    },

    async crearTurno(req, res) {
      res.status(201).json({ id: await modelo.crearTurno(db, req.valid) });
    },

    // Quitar turno
    async borrarTurno(req, res) {
      if ((await modelo.borrarTurno(db, idParam.parse(req.params.id))) === 0) throw new HttpError(404, 'Turno no encontrado');
      res.status(204).end();
    },
  };
}
