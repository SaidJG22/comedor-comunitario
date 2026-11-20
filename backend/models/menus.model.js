const { conection, transaccion } = require('../config/db.js');
const { HttpError } = require('../middlewares/errors.js');
const { egresarStock } = require('./stock.model.js');

const insertarInsumos = async (conexion, menuId, insumos) => {
  for (const insumo of insumos) {
    await conexion.query('INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) VALUES (?, ?, ?)', [
      menuId,
      insumo.productoId,
      insumo.cantidadPorRacion,
    ]);
  }
};

// Exigir planificado
const exigirPlanificado = async (conexion, id, accion) => {
  const [rows] = await conexion.query('SELECT estado FROM menu WHERE id = ? FOR UPDATE', [id]);
  if (rows.length === 0) throw new HttpError(404, 'Menú no encontrado');
  if (rows[0].estado === 'confirmado') {
    throw new HttpError(409, `El menú ya fue confirmado: sus insumos ya se descontaron y no se puede ${accion}`);
  }
};

const listar = async (desde, hasta) => {
  const [rows] = await conection.query(
    `SELECT id, fecha, servicio, nombre_plato, raciones_planificadas, estado
     FROM menu WHERE fecha BETWEEN ? AND ? ORDER BY fecha, servicio`,
    [desde, hasta],
  );
  return rows;
};

const obtener = async (id) => {
  const [rows] = await conection.query(
    'SELECT id, fecha, servicio, nombre_plato, raciones_planificadas, estado FROM menu WHERE id = ?',
    [id],
  );
  const menu = rows[0];
  if (!menu) return undefined;
  const [insumos] = await conection.query(
    `SELECT i.producto_id, p.nombre, p.unidad, i.cantidad_por_racion,
            i.cantidad_por_racion * ? AS cantidad_total
     FROM menu_insumo i JOIN producto p ON p.id = i.producto_id
     WHERE i.menu_id = ? ORDER BY p.nombre`,
    [menu.raciones_planificadas, id],
  );
  return { ...menu, insumos };
};

const crear = (menu, insumos) =>
  transaccion(async (conexion) => {
    const [result] = await conexion.query(
      'INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas) VALUES (?, ?, ?, ?)',
      [menu.fecha, menu.servicio, menu.nombrePlato, menu.racionesPlanificadas],
    );
    await insertarInsumos(conexion, result.insertId, insumos);
    return result.insertId;
  });

const editar = (id, menu, insumos) =>
  transaccion(async (conexion) => {
    await exigirPlanificado(conexion, id, 'modificar');
    await conexion.query(
      'UPDATE menu SET fecha = ?, servicio = ?, nombre_plato = ?, raciones_planificadas = ? WHERE id = ?',
      [menu.fecha, menu.servicio, menu.nombrePlato, menu.racionesPlanificadas, id],
    );
    await conexion.query('DELETE FROM menu_insumo WHERE menu_id = ?', [id]);
    await insertarInsumos(conexion, id, insumos);
  });

const borrar = (id) =>
  transaccion(async (conexion) => {
    await exigirPlanificado(conexion, id, 'borrar');
    await conexion.query('DELETE FROM menu WHERE id = ?', [id]); // en cascada
  });

// Confirmar menú
const confirmar = (menuId, usuarioId) =>
  transaccion(async (conexion) => {
    const [rows] = await conexion.query('SELECT * FROM menu WHERE id = ? FOR UPDATE', [menuId]);
    const menu = rows[0];
    if (!menu) throw new HttpError(404, 'Menú no encontrado');
    if (menu.estado === 'confirmado') throw new HttpError(409, 'El menú ya fue confirmado');

    const [insumos] = await conexion.query(
      'SELECT producto_id, cantidad_por_racion FROM menu_insumo WHERE menu_id = ?',
      [menuId],
    );
    for (const insumo of insumos) {
      await egresarStock(conexion, {
        productoId: insumo.producto_id,
        cantidad: Number(insumo.cantidad_por_racion) * menu.raciones_planificadas,
        motivo: 'consumo',
        fecha: menu.fecha,
        usuarioId,
        observacion: `Menú #${menuId}: ${menu.nombre_plato}`,
      });
    }
    await conexion.query("UPDATE menu SET estado = 'confirmado' WHERE id = ?", [menuId]);
  });

module.exports = { listar, obtener, crear, editar, borrar, confirmar };
