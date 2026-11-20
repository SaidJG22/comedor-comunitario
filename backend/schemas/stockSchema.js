const { z } = require('zod');
const { fecha } = require('./comunes.js');
const { hoy } = require('../utils/fechas.js');

const productoSchema = z.object({
  nombre: z.string().trim().min(1, { message: 'Escribí el nombre' }).max(80),
  categoriaId: z.number().int().positive().optional(),
  unidad: z.enum(['kg', 'g', 'l', 'ml', 'unidad']).default('kg'),
  stockMinimo: z.number().min(0, { message: 'El mínimo no puede ser negativo' }).default(0),
});

const edicionProductoSchema = z
  .object({
    nombre: z.string().trim().min(1, { message: 'Escribí el nombre' }).max(80),
    categoriaId: z.number().int().positive().nullable().optional(),
    stockMinimo: z.number().min(0, { message: 'El mínimo no puede ser negativo' }),
  })
  .strict();

const estadoSchema = z.object({ activo: z.boolean() }).strict();

const categoriaSchema = z
  .object({ nombre: z.string().trim().min(1, { message: 'Escribí el nombre de la categoría' }).max(50) })
  .strict();

const movimientoSchema = z.object({
  productoId: z.number().int().positive(),
  tipo: z.enum(['ingreso', 'egreso']),
  motivo: z.enum(['compra', 'consumo', 'merma', 'ajuste']),
  cantidad: z.number().positive({ message: 'La cantidad tiene que ser mayor a cero' }),
  fecha: fecha.default(() => hoy()),
  fechaVencimiento: fecha.optional(),
  observacion: z.string().max(200).optional(),
});

const alertasQuery = z.object({
  dias: z.coerce.number().int().min(0).max(365).default(7),
});

module.exports = {
  productoSchema,
  edicionProductoSchema,
  estadoSchema,
  categoriaSchema,
  movimientoSchema,
  alertasQuery,
};
