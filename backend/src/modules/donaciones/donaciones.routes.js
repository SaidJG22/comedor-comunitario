import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../middleware/auth.js';
import { hoy } from '../../utils/fechas.js';
import { crearDonacionesController } from './donaciones.controller.js';

const fecha = z.iso.date();

const donacionSchema = z.object({
  origenId: z.number().int().positive(),
  referencia: z.string().trim().max(100).optional(),
  fecha: fecha.default(() => hoy()),
  observacion: z.string().max(200).optional(),
  items: z
    .array(
      z.object({
        productoId: z.number().int().positive(),
        cantidad: z.number().positive(),
        fechaVencimiento: fecha.optional(),
      }),
    )
    .min(1, 'La donación debe incluir al menos un producto'),
});

const rangoQuery = z.object({ desde: fecha.optional(), hasta: fecha.optional() });

export function donacionesRoutes({ db, auth }) {
  const r = Router();
  const gestion = auth.requireRole(ROLES.ADMIN, ROLES.RESPONSABLE);
  const c = crearDonacionesController({ db });

  r.get('/origenes', c.origenes);
  r.get('/', validate(rangoQuery, 'query'), c.listar);
  r.get('/:id', c.obtener);
  r.post('/', gestion, validate(donacionSchema), c.crear);
  r.put('/:id', gestion, validate(donacionSchema), c.editar);
  r.delete('/:id', gestion, c.borrar);

  return r;
}
