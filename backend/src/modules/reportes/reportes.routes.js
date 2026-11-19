import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../middleware/auth.js';
import { crearReportesController } from './reportes.controller.js';

const fecha = z.iso.date();
const periodo = z.object({ desde: fecha, hasta: fecha });
const periodoOrdenado = periodo.refine((p) => p.desde <= p.hasta, {
  message: 'La fecha "desde" no puede ser posterior a "hasta"',
  path: ['desde'],
});

/** Reportes */
export function reportesRoutes({ db, auth }) {
  const r = Router();
  const c = crearReportesController({ db });
  r.use(auth.requireRole(ROLES.ADMIN, ROLES.RESPONSABLE));

  r.get('/raciones', validate(periodo, 'query'), c.raciones);
  r.get('/consumo-insumos', validate(periodo, 'query'), c.consumoInsumos);
  r.get('/donaciones', validate(periodo, 'query'), c.donaciones);
  r.get('/tablero', validate(periodoOrdenado, 'query'), c.tablero);

  return r;
}
