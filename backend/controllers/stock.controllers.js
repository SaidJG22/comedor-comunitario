const stockModel = require('../models/stock.model.js');

/* Categorías */

const getCategorias = async (req, res, next) => {
  try {
    res.status(200).json(await stockModel.listarCategorias());
  } catch (error) {
    next(error);
  }
};

const getCategoria = async (req, res, next) => {
  try {
    const categoria = await stockModel.obtenerCategoria(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.status(200).json(categoria);
  } catch (error) {
    next(error);
  }
};

const postCategoria = async (req, res, next) => {
  try {
    const id = await stockModel.crearCategoria(req.body.nombre);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

const putCategoria = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await stockModel.editarCategoria(id, req.body.nombre);
    res.status(200).json({ id, nombre: req.body.nombre });
  } catch (error) {
    next(error);
  }
};

// Borrar categoría
const deleteCategoria = async (req, res, next) => {
  try {
    const productosSinCategoria = await stockModel.borrarCategoria(req.params.id);
    res.status(200).json({ productosSinCategoria });
  } catch (error) {
    next(error);
  }
};

/* Productos */

const getProductos = async (req, res, next) => {
  try {
    res.status(200).json(await stockModel.listarProductos());
  } catch (error) {
    next(error);
  }
};

const getProducto = async (req, res, next) => {
  try {
    res.status(200).json(await stockModel.obtenerProducto(req.params.id));
  } catch (error) {
    next(error);
  }
};

const postProducto = async (req, res, next) => {
  try {
    res.status(201).json(await stockModel.crearProducto(req.body));
  } catch (error) {
    next(error);
  }
};

const putProducto = async (req, res, next) => {
  try {
    res.status(200).json(await stockModel.editarProducto(Number(req.params.id), req.body));
  } catch (error) {
    next(error);
  }
};

// Baja o reactivación
const patchProducto = async (req, res, next) => {
  try {
    res.status(200).json(await stockModel.cambiarEstadoProducto(Number(req.params.id), req.body.activo));
  } catch (error) {
    next(error);
  }
};

const deleteProducto = async (req, res, next) => {
  try {
    await stockModel.borrarProducto(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/* Movimientos y alertas */

const postMovimiento = async (req, res, next) => {
  try {
    await stockModel.registrarMovimiento({ ...req.body, usuarioId: req.user.id });
    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

const getAlertas = async (req, res, next) => {
  try {
    res.status(200).json(await stockModel.obtenerAlertas(req.filtros.dias));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategorias,
  getCategoria,
  postCategoria,
  putCategoria,
  deleteCategoria,
  getProductos,
  getProducto,
  postProducto,
  putProducto,
  patchProducto,
  deleteProducto,
  postMovimiento,
  getAlertas,
};
