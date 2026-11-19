import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../middleware/auth.js';
import { crearMenusController } from './menus.controller.js';

const fecha = z.iso.date();

const menuSchema = z.object({
  fecha,
  servicio: z.enum(['almuerzo', 'merienda']),
  nombrePlato: z.string().trim().min(1).max(100),
  racionesPlanificadas: z.number().int().positive().max(5000),
  insumos: z
    .array(
      z.object({
        productoId: z.number().int().positive(),
        cantidadPorRacion: z.number().positive(),
      }),
    )
    .default([]),
});

const rangoQuery = z.object({ desde: fecha.optional(), hasta: fecha.optional() });

export function menusRoutes({ db, auth }) {
  const r = Router();
  const gestion = auth.requireRole(ROLES.ADMIN, ROLES.RESPONSABLE);
  const c = crearMenusController({ db });

  r.get('/', validate(rangoQuery, 'query'), c.listar);
  r.get('/:id', c.obtener);
  r.post('/', gestion, validate(menuSchema), c.crear);
  r.put('/:id', gestion, validate(menuSchema), c.editar);
  r.delete('/:id', gestion, c.borrar);
  r.post('/:id/confirmar', gestion, c.confirmar);

  return r;
}
