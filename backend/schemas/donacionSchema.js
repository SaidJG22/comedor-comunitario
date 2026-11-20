const { z } = require('zod');
const { fecha } = require('./comunes.js');
const { hoy } = require('../utils/fechas.js');

const donacionSchema = z.object({
  origenId: z.number().int().positive({ message: 'Elegí de dónde llegó' }),
  referencia: z.string().trim().max(100).optional(),
  fecha: fecha.default(() => hoy()),
  observacion: z.string().max(200).optional(),
  items: z
    .array(
      z.object({
        productoId: z.number().int().positive(),
        cantidad: z.number().positive({ message: 'La cantidad tiene que ser mayor a cero' }),
        fechaVencimiento: fecha.optional(),
      }),
    )
    .min(1, { message: 'La donación debe incluir al menos un producto' }),
});

module.exports = { donacionSchema };
