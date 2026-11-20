const menusModel = require('../models/menus.model.js');

const getMenus = async (req, res, next) => {
  try {
    const { desde = '1900-01-01', hasta = '2999-12-31' } = req.filtros;
    res.status(200).json(await menusModel.listar(desde, hasta));
  } catch (error) {
    next(error);
  }
};

const getMenu = async (req, res, next) => {
  try {
    const menu = await menusModel.obtener(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }
    res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

const postMenu = async (req, res, next) => {
  try {
    const { insumos, ...menu } = req.body;
    const id = await menusModel.crear(menu, insumos);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

const putMenu = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { insumos, ...menu } = req.body;
    await menusModel.editar(id, menu, insumos);
    res.status(200).json({ id });
  } catch (error) {
    next(error);
  }
};

const deleteMenu = async (req, res, next) => {
  try {
    await menusModel.borrar(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// Confirmar menú
const confirmarMenu = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await menusModel.confirmar(id, req.user.id);
    res.status(200).json({ id, estado: 'confirmado' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenus, getMenu, postMenu, putMenu, deleteMenu, confirmarMenu };
