import * as modelo from './reportes.model.js';

export function crearReportesController({ db }) {
  return {
    async raciones(req, res) {
      res.json(await modelo.racionesPorServicio(db, req.valid.desde, req.valid.hasta));
    },

    async consumoInsumos(req, res) {
      res.json(await modelo.consumoInsumos(db, req.valid.desde, req.valid.hasta));
    },

    async donaciones(req, res) {
      res.json(await modelo.donacionesPorOrigen(db, req.valid.desde, req.valid.hasta));
    },

    // Tablero
    async tablero(req, res) {
      const { desde, hasta } = req.valid;
      const d = await modelo.datosTablero(db, desde, hasta);
      res.json({
        periodo: { desde, hasta },
        kpis: {
          raciones: Number(d.raciones.total),
          diasConRegistro: Number(d.raciones.dias),
          promedioDiario: d.raciones.dias > 0 ? Math.round(Number(d.raciones.total) / Number(d.raciones.dias)) : 0,
          donaciones: Number(d.donaciones.total),
          stockBajo: d.alertas.stockBajo.length,
          porVencer: d.alertas.porVencer.length,
        },
        racionesPorDia: d.racionesPorDia,
        planificadasVsServidas: d.planificadasVsServidas,
        donacionesPorOrigen: d.donacionesPorOrigen,
        despensaPorCategoria: d.despensaPorCategoria,
      });
    },
  };
}
