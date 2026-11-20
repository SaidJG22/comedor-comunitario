const racionesModel = require('../models/raciones.model.js');

// Guardar raciones
const putRaciones = async (req, res, next) => {
  try {
    const { fecha, servicio, cantidad, observacion } = req.body;
    await racionesModel.guardar({ fecha, servicio, cantidad, observacion, usuarioId: req.user.id });
    res.status(200).json({ fecha, servicio, cantidad });
  } catch (error) {
    next(error);
  }
};

const getRaciones = async (req, res, next) => {
  try {
    const { desde = '1900-01-01', hasta = '2999-12-31' } = req.filtros;
    res.status(200).json(await racionesModel.listar(desde, hasta));
  } catch (error) {
    next(error);
  }
};

const deleteRaciones = async (req, res, next) => {
  try {
    const borradas = await racionesModel.borrar(req.params.id);
    if (borradas === 0) {
      return res.status(404).json({ error: 'Registro de raciones no encontrado' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = { putRaciones, getRaciones, deleteRaciones };
