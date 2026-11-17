import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../middleware/auth.js';
import { hoy } from '../../utils/fechas.js';
import * as service from './stock.service.js';

const fecha = z.iso.date();

const productoSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  categoriaId: z.number().int().positive().optional(),
  unidad: z.enum(['kg', 'g', 'l', 'ml', 'unidad']).default('kg'),
  stockMinimo: z.number().min(0).default(0),
});

const movimientoSchema = z.object({
  productoId: z.number().int().positive(),
  tipo: z.enum(['ingreso', 'egreso']),
  motivo: z.enum(['compra', 'consumo', 'merma', 'ajuste']),
  cantidad: z.number().positive(),
  fecha: fecha.default(() => hoy()),
  fechaVencimiento: fecha.optional(),
  observacion: z.string().max(200).optional(),
});

const alertasQuery = z.object({ dias: z.coerce.number().int().min(0).max(365).default(7) });

export function stockRoutes({ db, auth }) {
  const r = Router();
  const gestion = auth.requireRole(ROLES.ADMIN, ROLES.RESPONSABLE);

  r.get('/categorias', async (_req, res) =>
    res.json(await db.query('SELECT id, nombre FROM categoria ORDER BY nombre')),
  );

  r.get('/productos', async (_req, res) => res.json(await service.listarProductos(db)));

  r.post('/productos', gestion, validate(productoSchema), async (req, res) =>
    res.status(201).json(await service.crearProducto(db, req.valid)),
  );

  r.post('/movimientos', gestion, validate(movimientoSchema), async (req, res) => {
    const { tipo, ...datos } = req.valid;
    await db.transaction(async (tx) => {
      const base = { ...datos, usuarioId: req.user.id };
      if (tipo === 'ingreso') await service.ingresarStock(tx, base);
      else await service.egresarStock(tx, base);
    });
    res.status(201).json({ ok: true });
  });

  r.get('/alertas', validate(alertasQuery, 'query'), async (req, res) =>
    res.json(await service.obtenerAlertas(db, req.valid)),
  );

  return r;
}
