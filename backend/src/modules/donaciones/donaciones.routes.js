import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../middleware/auth.js';
import { hoy } from '../../utils/fechas.js';
import { ingresarStock } from '../stock/stock.service.js';

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

  r.get('/origenes', async (_req, res) =>
    res.json(await db.query('SELECT id, nombre FROM origen_donacion ORDER BY id')),
  );

  r.get('/', validate(rangoQuery, 'query'), async (req, res) => {
    const { desde = '1900-01-01', hasta = '2999-12-31' } = req.valid;
    res.json(
      await db.query(
        `SELECT d.id, d.fecha, o.nombre AS origen, d.referencia, d.observacion,
                COUNT(i.id) AS cantidad_items
         FROM donacion d
         JOIN origen_donacion o ON o.id = d.origen_id
         LEFT JOIN donacion_item i ON i.donacion_id = d.id
         WHERE d.fecha BETWEEN ? AND ?
         GROUP BY d.id, o.nombre
         ORDER BY d.fecha DESC, d.id DESC`,
        [desde, hasta],
      ),
    );
  });

  // CU: Registrar donación. La donación y el ingreso a stock son una única transacción.
  r.post('/', gestion, validate(donacionSchema), async (req, res) => {
    const { items, ...cab } = req.valid;
    const id = await db.transaction(async (tx) => {
      const don = await tx.query(
        'INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES (?, ?, ?, ?, ?)',
        [cab.origenId, cab.referencia ?? null, cab.fecha, req.user.id, cab.observacion ?? null],
      );
      for (const item of items) {
        const loteId = await ingresarStock(tx, {
          productoId: item.productoId,
          cantidad: item.cantidad,
          fechaVencimiento: item.fechaVencimiento ?? null,
          motivo: 'donacion',
          fecha: cab.fecha,
          usuarioId: req.user.id,
        });
        await tx.query(
          `INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id)
           VALUES (?, ?, ?, ?, ?)`,
          [don.insertId, item.productoId, item.cantidad, item.fechaVencimiento ?? null, loteId],
        );
      }
      return don.insertId;
    });
    res.status(201).json({ id });
  });

  return r;
}
