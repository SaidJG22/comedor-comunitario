import { Router } from 'express';
import { z } from 'zod';
import { idParam, validate } from '../../middleware/validate.js';
import { HttpError } from '../../middleware/errors.js';
import { ROLES } from '../../middleware/auth.js';
import { egresarStock } from '../stock/stock.service.js';

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

  r.get('/', validate(rangoQuery, 'query'), async (req, res) => {
    const { desde = '1900-01-01', hasta = '2999-12-31' } = req.valid;
    res.json(
      await db.query(
        `SELECT id, fecha, servicio, nombre_plato, raciones_planificadas, estado
         FROM menu WHERE fecha BETWEEN ? AND ? ORDER BY fecha, servicio`,
        [desde, hasta],
      ),
    );
  });

  // Detalle de un menú con sus insumos por ración.
  r.get('/:id', async (req, res) => {
    const id = idParam.parse(req.params.id);
    const [menu] = await db.query(
      `SELECT id, fecha, servicio, nombre_plato, raciones_planificadas, estado FROM menu WHERE id = ?`,
      [id],
    );
    if (!menu) throw new HttpError(404, 'Menú no encontrado');
    const insumos = await db.query(
      `SELECT i.producto_id, p.nombre, p.unidad, i.cantidad_por_racion,
              i.cantidad_por_racion * ? AS cantidad_total
       FROM menu_insumo i JOIN producto p ON p.id = i.producto_id
       WHERE i.menu_id = ? ORDER BY p.nombre`,
      [menu.raciones_planificadas, id],
    );
    res.json({ ...menu, insumos });
  });

  r.post('/', gestion, validate(menuSchema), async (req, res) => {
    const { insumos, ...m } = req.valid;
    const id = await db.transaction(async (tx) => {
      const ins = await tx.query(
        'INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas) VALUES (?, ?, ?, ?)',
        [m.fecha, m.servicio, m.nombrePlato, m.racionesPlanificadas],
      );
      for (const i of insumos) {
        await tx.query(
          'INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) VALUES (?, ?, ?)',
          [ins.insertId, i.productoId, i.cantidadPorRacion],
        );
      }
      return ins.insertId;
    });
    res.status(201).json({ id });
  });

  // Corrección de un menú: solo mientras está "planificado" (uno confirmado ya descontó el stock).
  r.put('/:id', gestion, validate(menuSchema), async (req, res) => {
    const id = idParam.parse(req.params.id);
    const { insumos, ...m } = req.valid;
    await db.transaction(async (tx) => {
      const [actual] = await tx.query('SELECT estado FROM menu WHERE id = ? FOR UPDATE', [id]);
      if (!actual) throw new HttpError(404, 'Menú no encontrado');
      if (actual.estado === 'confirmado') {
        throw new HttpError(409, 'El menú ya fue confirmado: sus insumos ya se descontaron y no se puede modificar');
      }
      await tx.query(
        'UPDATE menu SET fecha = ?, servicio = ?, nombre_plato = ?, raciones_planificadas = ? WHERE id = ?',
        [m.fecha, m.servicio, m.nombrePlato, m.racionesPlanificadas, id],
      );
      await tx.query('DELETE FROM menu_insumo WHERE menu_id = ?', [id]);
      for (const i of insumos) {
        await tx.query(
          'INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) VALUES (?, ?, ?)',
          [id, i.productoId, i.cantidadPorRacion],
        );
      }
    });
    res.json({ id });
  });

  r.delete('/:id', gestion, async (req, res) => {
    const id = idParam.parse(req.params.id);
    await db.transaction(async (tx) => {
      const [actual] = await tx.query('SELECT estado FROM menu WHERE id = ? FOR UPDATE', [id]);
      if (!actual) throw new HttpError(404, 'Menú no encontrado');
      if (actual.estado === 'confirmado') {
        throw new HttpError(409, 'El menú ya fue confirmado: sus insumos ya se descontaron y no se puede borrar');
      }
      await tx.query('DELETE FROM menu WHERE id = ?', [id]); // los insumos se borran en cascada
    });
    res.status(204).end();
  });

  // Proceso: confirmar menú → descuenta insumos según raciones planificadas (RN: FEFO, sin stock negativo).
  r.post('/:id/confirmar', gestion, async (req, res) => {
    const menuId = idParam.parse(req.params.id);

    await db.transaction(async (tx) => {
      const [menu] = await tx.query('SELECT * FROM menu WHERE id = ? FOR UPDATE', [menuId]);
      if (!menu) throw new HttpError(404, 'Menú no encontrado');
      if (menu.estado === 'confirmado') throw new HttpError(409, 'El menú ya fue confirmado');

      const insumos = await tx.query(
        'SELECT producto_id, cantidad_por_racion FROM menu_insumo WHERE menu_id = ?',
        [menuId],
      );
      for (const i of insumos) {
        await egresarStock(tx, {
          productoId: i.producto_id,
          cantidad: Number(i.cantidad_por_racion) * menu.raciones_planificadas,
          motivo: 'consumo',
          fecha: menu.fecha,
          usuarioId: req.user.id,
          observacion: `Menú #${menuId}: ${menu.nombre_plato}`,
        });
      }
      await tx.query("UPDATE menu SET estado = 'confirmado' WHERE id = ?", [menuId]);
    });
    res.json({ id: menuId, estado: 'confirmado' });
  });

  return r;
}
