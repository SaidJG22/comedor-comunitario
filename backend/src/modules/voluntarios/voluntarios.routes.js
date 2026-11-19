import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../middleware/auth.js';
import { crearVoluntariosController } from './voluntarios.controller.js';

const fecha = z.iso.date();
const servicio = z.enum(['almuerzo', 'merienda']);

const voluntarioSchema = z.object({ nombreVisible: z.string().trim().min(1).max(80) });
const turnoSchema = z.object({
  fecha,
  servicio,
  tarea: z.enum(['cocina', 'servicio']),
  voluntarioId: z.number().int().positive(),
});
const rangoQuery = z.object({ desde: fecha.optional(), hasta: fecha.optional() });
const listaQuery = z.object({ todos: z.enum(['0', '1']).default('0') });
const cambioSchema = z
  .object({
    activo: z.boolean().optional(),
    nombreVisible: z.string().trim().min(1).max(80).optional(),
  })
  .strict()
  .refine((d) => d.activo !== undefined || d.nombreVisible !== undefined, { message: 'Indicá activo o nombreVisible' });

export function voluntariosRoutes({ db, auth }) {
  const r = Router();
  const gestion = auth.requireRole(ROLES.ADMIN, ROLES.RESPONSABLE);
  const c = crearVoluntariosController({ db });

  // Listar
  r.get('/', validate(listaQuery, 'query'), c.listar);
  r.post('/', gestion, validate(voluntarioSchema), c.crear);
  r.patch('/:id', gestion, validate(cambioSchema), c.cambiar);
  r.delete('/:id', gestion, c.borrar); // sin turnos

  r.get('/turnos', validate(rangoQuery, 'query'), c.listarTurnos);
  r.post('/turnos', gestion, validate(turnoSchema), c.crearTurno);
  r.delete('/turnos/:id', gestion, c.borrarTurno);

  // Después de /turnos
  r.get('/:id', c.obtener);

  return r;
}
