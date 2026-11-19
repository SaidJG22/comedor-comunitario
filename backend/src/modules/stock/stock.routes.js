import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../middleware/auth.js';
import { hoy } from '../../utils/fechas.js';
import { crearStockController } from './stock.controller.js';

const fecha = z.iso.date();

const productoSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  categoriaId: z.number().int().positive().optional(),
  unidad: z.enum(['kg', 'g', 'l', 'ml', 'unidad']).default('kg'),
  stockMinimo: z.number().min(0).default(0),
});

const edicionProductoSchema = z
  .object({
    nombre: z.string().trim().min(1).max(80),
    categoriaId: z.number().int().positive().nullable().optional(),
    stockMinimo: z.number().min(0),
  })
  .strict();

const estadoSchema = z.object({ activo: z.boolean() }).strict();

const categoriaSchema = z.object({ nombre: z.string().trim().min(1, 'Escribí el nombre de la categoría').max(50) }).strict();

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
  const soloAdmin = auth.requireRole(ROLES.ADMIN);
  const c = crearStockController({ db });

  // Categorías
  r.get('/categorias', c.categorias);
  r.get('/categorias/:id', c.categoria);
  r.post('/categorias', soloAdmin, validate(categoriaSchema), c.crearCategoria);
  r.put('/categorias/:id', soloAdmin, validate(categoriaSchema), c.editarCategoria);
  r.delete('/categorias/:id', soloAdmin, c.borrarCategoria);

  r.get('/productos', c.productos);
  r.get('/productos/:id', c.producto);
  r.post('/productos', gestion, validate(productoSchema), c.crearProducto);
  r.put('/productos/:id', gestion, validate(edicionProductoSchema), c.editarProducto);
  r.patch('/productos/:id', gestion, validate(estadoSchema), c.cambiarEstadoProducto);
  r.delete('/productos/:id', gestion, c.borrarProducto); // sin historial

  r.post('/movimientos', gestion, validate(movimientoSchema), c.registrarMovimiento);
  r.get('/alertas', validate(alertasQuery, 'query'), c.alertas);

  return r;
}
