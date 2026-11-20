const { z } = require('zod');
const { fecha } = require('./comunes.js');

const periodo = z.object({ desde: fecha, hasta: fecha });

const periodoOrdenado = periodo.refine((p) => p.desde <= p.hasta, {
  message: 'La fecha "desde" no puede ser posterior a "hasta"',
  path: ['desde'],
});

module.exports = { periodo, periodoOrdenado };
