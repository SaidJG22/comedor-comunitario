const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/stock.controllers.js');
const { validate, validarId } = require('../middlewares/validate.js');
const { checkRole, ROLES } = require('../middlewares/auth.js');
const {
  productoSchema,
  edicionProductoSchema,
  estadoSchema,
  categoriaSchema,
  movimientoSchema,
  alertasQuery,
} = require('../schemas/stockSchema.js');

const gestion = checkRole(ROLES.ADMIN, ROLES.RESPONSABLE);
const soloAdmin = checkRole(ROLES.ADMIN);

router.param('id', validarId);

// Categorías
router.get('/categorias', getCategorias);
router.get('/categorias/:id', getCategoria);
router.post('/categorias', soloAdmin, validate(categoriaSchema), postCategoria);
router.put('/categorias/:id', soloAdmin, validate(categoriaSchema), putCategoria);
router.delete('/categorias/:id', soloAdmin, deleteCategoria);

// Productos
router.get('/productos', getProductos);
router.get('/productos/:id', getProducto);
router.post('/productos', gestion, validate(productoSchema), postProducto);
router.put('/productos/:id', gestion, validate(edicionProductoSchema), putProducto);
router.patch('/productos/:id', gestion, validate(estadoSchema), patchProducto);
router.delete('/productos/:id', gestion, deleteProducto);

// Movimientos y alertas
router.post('/movimientos', gestion, validate(movimientoSchema), postMovimiento);
router.get('/alertas', validate(alertasQuery, 'query'), getAlertas);

module.exports = router;
