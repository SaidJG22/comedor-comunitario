import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../middleware/auth.js';
import { hoy } from '../../utils/fechas.js';
import { crearRacionesController } from './raciones.controller.js';

const fecha = z.iso.date();

// Solo cantidades
const racionSchema = z
  .object({
    fecha: fecha.default(() => hoy()),
    servicio: z.enum(['almuerzo', 'merienda']),
    cantidad: z.number().int().min(0).max(5000),
    observacion: z.string().max(200).optional(),
  })
  .strict()
  .refine((d) => d.fecha <= hoy(), { path: ['fecha'], message: 'No se admiten fechas futuras' });

const rangoQuery = z.object({ desde: fecha.optional(), hasta: fecha.optional() });

export function racionesRoutes({ db, auth }) {
  const r = Router();
  const c = crearRacionesController({ db });

  // Permisos
  r.put('/', validate(racionSchema), c.guardar);
  r.get('/', validate(rangoQuery, 'query'), c.listar);
  r.delete('/:id', auth.requireRole(ROLES.ADMIN, ROLES.RESPONSABLE), c.borrar);

  return r;
}
