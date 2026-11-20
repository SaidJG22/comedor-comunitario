const donacionesModel = require('../models/donaciones.model.js');

const getOrigenes = async (req, res, next) => {
  try {
    res.status(200).json(await donacionesModel.listarOrigenes());
  } catch (error) {
    next(error);
  }
};

const getDonaciones = async (req, res, next) => {
  try {
    const { desde = '1900-01-01', hasta = '2999-12-31' } = req.filtros;
    res.status(200).json(await donacionesModel.listar(desde, hasta));
  } catch (error) {
    next(error);
  }
};

const getDonacion = async (req, res, next) => {
  try {
    const donacion = await donacionesModel.obtener(req.params.id);
    if (!donacion) {
      return res.status(404).json({ error: 'Donación no encontrada' });
    }
    res.status(200).json(donacion);
  } catch (error) {
    next(error);
  }
};

const postDonacion = async (req, res, next) => {
  try {
    const { items, ...cabecera } = req.body;
    const id = await donacionesModel.crear(cabecera, items, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

const putDonacion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { items, ...cabecera } = req.body;
    await donacionesModel.editar(id, cabecera, items, req.user.id);
    res.status(200).json({ id });
  } catch (error) {
    next(error);
  }
};

const deleteDonacion = async (req, res, next) => {
  try {
    await donacionesModel.borrar(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrigenes, getDonaciones, getDonacion, postDonacion, putDonacion, deleteDonacion };
