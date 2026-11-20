const { z } = require('zod');
const { fecha, servicio } = require('./comunes.js');

const menuSchema = z.object({
  fecha,
  servicio,
  nombrePlato: z.string().trim().min(1, { message: 'Escribí el plato' }).max(100),
  racionesPlanificadas: z.number().int().positive({ message: 'Las raciones tienen que ser más de cero' }).max(5000),
  insumos: z
    .array(
      z.object({
        productoId: z.number().int().positive(),
        cantidadPorRacion: z.number().positive({ message: 'La cantidad tiene que ser mayor a cero' }),
      }),
    )
    .default([]),
});

module.exports = { menuSchema };
