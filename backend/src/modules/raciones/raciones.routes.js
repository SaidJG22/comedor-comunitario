import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { hoy } from '../../utils/fechas.js';

const fecha = z.iso.date();

// RN: solo se registra la CANTIDAD de raciones servidas por día y servicio.
// No se admiten campos de personas (nombre, DNI, edad, etc.): el esquema es estricto.
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

export function racionesRoutes({ db }) {
  const r = Router();

  // Todos los roles (incluido Voluntario) pueden registrar raciones del día.
  r.put('/', validate(racionSchema), async (req, res) => {
    const { fecha: f, servicio, cantidad, observacion } = req.valid;
    await db.query(
      `INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
       VALUES (?, ?, ?, ?, ?) AS nueva
       ON DUPLICATE KEY UPDATE cantidad = nueva.cantidad, usuario_id = nueva.usuario_id,
                               observacion = nueva.observacion`,
      [f, servicio, cantidad, req.user.id, observacion ?? null],
    );
    res.json({ fecha: f, servicio, cantidad });
  });

  r.get('/', validate(rangoQuery, 'query'), async (req, res) => {
    const { desde = '1900-01-01', hasta = '2999-12-31' } = req.valid;
    res.json(
      await db.query(
        `SELECT fecha, servicio, cantidad, observacion FROM racion_diaria
         WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC, servicio`,
        [desde, hasta],
      ),
    );
  });

  return r;
}
