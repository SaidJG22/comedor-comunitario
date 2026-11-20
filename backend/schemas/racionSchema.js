const { z } = require('zod');
const { fecha, servicio } = require('./comunes.js');
const { hoy } = require('../utils/fechas.js');

// Solo cantidades
const racionSchema = z
  .object({
    fecha: fecha.default(() => hoy()),
    servicio,
    cantidad: z.number().int().min(0, { message: 'La cantidad no puede ser negativa' }).max(5000),
    observacion: z.string().max(200).optional(),
  })
  .strict()
  .refine((d) => d.fecha <= hoy(), { path: ['fecha'], message: 'No se admiten fechas futuras' });

module.exports = { racionSchema };
