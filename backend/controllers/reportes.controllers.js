const reportesModel = require('../models/reportes.model.js');

const getRaciones = async (req, res, next) => {
  try {
    const { desde, hasta } = req.filtros;
    res.status(200).json(await reportesModel.racionesPorServicio(desde, hasta));
  } catch (error) {
    next(error);
  }
};

const getConsumoInsumos = async (req, res, next) => {
  try {
    const { desde, hasta } = req.filtros;
    res.status(200).json(await reportesModel.consumoInsumos(desde, hasta));
  } catch (error) {
    next(error);
  }
};

const getDonaciones = async (req, res, next) => {
  try {
    const { desde, hasta } = req.filtros;
    res.status(200).json(await reportesModel.donacionesPorOrigen(desde, hasta));
  } catch (error) {
    next(error);
  }
};

// Tablero
const getTablero = async (req, res, next) => {
  try {
    const { desde, hasta } = req.filtros;
    const datos = await reportesModel.datosTablero(desde, hasta);
    const total = Number(datos.raciones.total);
    const dias = Number(datos.raciones.dias);
    res.status(200).json({
      periodo: { desde, hasta },
      kpis: {
        raciones: total,
        diasConRegistro: dias,
        promedioDiario: dias > 0 ? Math.round(total / dias) : 0,
        donaciones: Number(datos.donaciones.total),
        stockBajo: datos.alertas.stockBajo.length,
        porVencer: datos.alertas.porVencer.length,
      },
      racionesPorDia: datos.racionesPorDia,
      planificadasVsServidas: datos.planificadasVsServidas,
      donacionesPorOrigen: datos.donacionesPorOrigen,
      despensaPorCategoria: datos.despensaPorCategoria,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRaciones, getConsumoInsumos, getDonaciones, getTablero };
