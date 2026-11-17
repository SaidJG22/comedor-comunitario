import { Router } from 'express';
import { z } from 'zod';
import { idParam, validate } from '../../middleware/validate.js';
import { HttpError } from '../../middleware/errors.js';
import { ROLES } from '../../middleware/auth.js';

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

export function voluntariosRoutes({ db, auth }) {
  const r = Router();
  const gestion = auth.requireRole(ROLES.ADMIN, ROLES.RESPONSABLE);

  r.get('/', async (_req, res) =>
    res.json(
      await db.query('SELECT id, nombre_visible, activo FROM voluntario WHERE activo = TRUE ORDER BY nombre_visible'),
    ),
  );

  r.post('/', gestion, validate(voluntarioSchema), async (req, res) => {
    const out = await db.query('INSERT INTO voluntario (nombre_visible) VALUES (?)', [
      req.valid.nombreVisible,
    ]);
    res.status(201).json({ id: out.insertId });
  });

  r.patch('/:id', gestion, validate(z.object({ activo: z.boolean() }).strict()), async (req, res) => {
    const id = idParam.parse(req.params.id);
    const out = await db.query('UPDATE voluntario SET activo = ? WHERE id = ?', [req.valid.activo, id]);
    if (out.affectedRows === 0) throw new HttpError(404, 'Voluntario no encontrado');
    res.json({ id, activo: req.valid.activo });
  });

  r.get('/turnos', validate(rangoQuery, 'query'), async (req, res) => {
    const { desde = '1900-01-01', hasta = '2999-12-31' } = req.valid;
    res.json(
      await db.query(
        `SELECT t.id, t.fecha, t.servicio, t.tarea, v.nombre_visible AS voluntario
         FROM turno t JOIN voluntario v ON v.id = t.voluntario_id
         WHERE t.fecha BETWEEN ? AND ? ORDER BY t.fecha, t.servicio, t.tarea`,
        [desde, hasta],
      ),
    );
  });

  r.post('/turnos', gestion, validate(turnoSchema), async (req, res) => {
    const t = req.valid;
    const out = await db.query(
      'INSERT INTO turno (fecha, servicio, tarea, voluntario_id) VALUES (?, ?, ?, ?)',
      [t.fecha, t.servicio, t.tarea, t.voluntarioId],
    );
    res.status(201).json({ id: out.insertId });
  });

  // Quitar un turno asignado por error.
  r.delete('/turnos/:id', gestion, async (req, res) => {
    const id = idParam.parse(req.params.id);
    const out = await db.query('DELETE FROM turno WHERE id = ?', [id]);
    if (out.affectedRows === 0) throw new HttpError(404, 'Turno no encontrado');
    res.status(204).end();
  });

  return r;
}
