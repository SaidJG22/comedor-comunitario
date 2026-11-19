import { idParam } from '../../middleware/validate.js';
import { HttpError } from '../../middleware/errors.js';
import * as modelo from './stock.model.js';

export function crearStockController({ db }) {
  return {
    async categorias(_req, res) {
      res.json(await modelo.listarCategorias(db));
    },

    async categoria(req, res) {
      const c = await modelo.obtenerCategoria(db, idParam.parse(req.params.id));
      if (!c) throw new HttpError(404, 'Categoría no encontrada');
      res.json(c);
    },

    async crearCategoria(req, res) {
      res.status(201).json({ id: await modelo.crearCategoria(db, req.valid.nombre) });
    },

    async editarCategoria(req, res) {
      const id = idParam.parse(req.params.id);
      await modelo.editarCategoria(db, id, req.valid.nombre);
      res.json({ id, nombre: req.valid.nombre });
    },

    // Borrar categoría
    async borrarCategoria(req, res) {
      res.json({ productosSinCategoria: await modelo.borrarCategoria(db, idParam.parse(req.params.id)) });
    },

    async productos(_req, res) {
      res.json(await modelo.listarProductos(db));
    },

    async producto(req, res) {
      res.json(await modelo.obtenerProducto(db, idParam.parse(req.params.id)));
    },

    async crearProducto(req, res) {
      res.status(201).json(await modelo.crearProducto(db, req.valid));
    },

    async editarProducto(req, res) {
      res.json(await modelo.editarProducto(db, idParam.parse(req.params.id), req.valid));
    },

    // Baja o reactivación
    async cambiarEstadoProducto(req, res) {
      res.json(await modelo.cambiarEstadoProducto(db, idParam.parse(req.params.id), req.valid.activo));
    },

    async borrarProducto(req, res) {
      await modelo.borrarProducto(db, idParam.parse(req.params.id));
      res.status(204).end();
    },

    async registrarMovimiento(req, res) {
      await modelo.registrarMovimiento(db, { ...req.valid, usuarioId: req.user.id });
      res.status(201).json({ ok: true });
    },

    async alertas(req, res) {
      res.json(await modelo.obtenerAlertas(db, req.valid));
    },
  };
}
