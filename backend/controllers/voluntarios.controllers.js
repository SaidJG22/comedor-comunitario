const voluntariosModel = require('../models/voluntarios.model.js');

const getVoluntarios = async (req, res, next) => {
  try {
    res.status(200).json(await voluntariosModel.listar(req.filtros.todos === '1'));
  } catch (error) {
    next(error);
  }
};

const getVoluntario = async (req, res, next) => {
  try {
    const voluntario = await voluntariosModel.obtener(req.params.id);
    if (!voluntario) {
      return res.status(404).json({ error: 'Voluntario no encontrado' });
    }
    res.status(200).json(voluntario);
  } catch (error) {
    next(error);
  }
};

const postVoluntario = async (req, res, next) => {
  try {
    const id = await voluntariosModel.crear(req.body.nombreVisible);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

// Editar voluntario
const patchVoluntario = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const cambiadas = await voluntariosModel.cambiar(id, req.body);
    if (cambiadas === 0) {
      return res.status(404).json({ error: 'Voluntario no encontrado' });
    }
    res.status(200).json({ id, ...req.body });
  } catch (error) {
    next(error);
  }
};

const deleteVoluntario = async (req, res, next) => {
  try {
    await voluntariosModel.borrar(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/* Turnos */

const getTurnos = async (req, res, next) => {
  try {
    const { desde = '1900-01-01', hasta = '2999-12-31' } = req.filtros;
    res.status(200).json(await voluntariosModel.listarTurnos(desde, hasta));
  } catch (error) {
    next(error);
  }
};

const postTurno = async (req, res, next) => {
  try {
    const id = await voluntariosModel.crearTurno(req.body);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

// Quitar turno
const deleteTurno = async (req, res, next) => {
  try {
    const borrados = await voluntariosModel.borrarTurno(req.params.id);
    if (borrados === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVoluntarios,
  getVoluntario,
  postVoluntario,
  patchVoluntario,
  deleteVoluntario,
  getTurnos,
  postTurno,
  deleteTurno,
};
