import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../middleware/auth.js';

const fecha = z.iso.date();
const periodo = z.object({ desde: fecha, hasta: fecha });

/**
 * Reportes de rendición de cuentas (solo datos agregados, nunca de personas).
 * Pendiente (Fase de Construcción): exportación a PDF/Excel.
 */
export function reportesRoutes({ db, auth }) {
  const r = Router();
  r.use(auth.requireRole(ROLES.ADMIN, ROLES.RESPONSABLE));

  r.get('/raciones', validate(periodo, 'query'), async (req, res) => {
    const { desde, hasta } = req.valid;
    res.json(
      await db.query(
        `SELECT servicio, SUM(cantidad) AS total_raciones, COUNT(*) AS dias_registrados
         FROM racion_diaria WHERE fecha BETWEEN ? AND ? GROUP BY servicio`,
        [desde, hasta],
      ),
    );
  });

  r.get('/consumo-insumos', validate(periodo, 'query'), async (req, res) => {
    const { desde, hasta } = req.valid;
    res.json(
      await db.query(
        `SELECT p.nombre, p.unidad, SUM(m.cantidad) AS total_consumido
         FROM movimiento_stock m JOIN producto p ON p.id = m.producto_id
         WHERE m.tipo = 'egreso' AND m.fecha BETWEEN ? AND ?
         GROUP BY p.id ORDER BY total_consumido DESC`,
        [desde, hasta],
      ),
    );
  });

  r.get('/donaciones', validate(periodo, 'query'), async (req, res) => {
    const { desde, hasta } = req.valid;
    res.json(
      await db.query(
        `SELECT o.nombre AS origen, COUNT(DISTINCT d.id) AS donaciones,
                p.nombre AS producto, p.unidad, SUM(i.cantidad) AS cantidad_total
         FROM donacion d
         JOIN origen_donacion o ON o.id = d.origen_id
         JOIN donacion_item i ON i.donacion_id = d.id
         JOIN producto p ON p.id = i.producto_id
         WHERE d.fecha BETWEEN ? AND ?
         GROUP BY o.id, p.id ORDER BY o.nombre, p.nombre`,
        [desde, hasta],
      ),
    );
  });

  return r;
}
