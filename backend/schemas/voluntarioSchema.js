const { z } = require('zod');
const { fecha, servicio } = require('./comunes.js');

const voluntarioSchema = z.object({
  nombreVisible: z.string().trim().min(1, { message: 'Escribí el nombre o apodo' }).max(80),
});

const cambioVoluntarioSchema = z
  .object({
    activo: z.boolean().optional(),
    nombreVisible: z.string().trim().min(1, { message: 'Escribí el nombre o apodo' }).max(80).optional(),
  })
  .strict()
  .refine((d) => d.activo !== undefined || d.nombreVisible !== undefined, {
    message: 'Indicá activo o nombreVisible',
  });

const turnoSchema = z.object({
  fecha,
  servicio,
  tarea: z.enum(['cocina', 'servicio']),
  voluntarioId: z.number().int().positive(),
});

const listaQuery = z.object({
  todos: z.enum(['0', '1']).default('0'),
});

module.exports = { voluntarioSchema, cambioVoluntarioSchema, turnoSchema, listaQuery };
