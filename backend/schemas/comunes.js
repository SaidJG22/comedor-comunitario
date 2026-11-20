const { z } = require('zod');

const fecha = z.iso.date();
const servicio = z.enum(['almuerzo', 'merienda']);

// Desde y hasta
const rangoQuery = z.object({
  desde: fecha.optional(),
  hasta: fecha.optional(),
});

module.exports = { fecha, servicio, rangoQuery };
