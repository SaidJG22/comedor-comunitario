import { HttpError } from '../../middleware/errors.js';
import { egresarStock } from '../stock/stock.model.js';

async function insertarInsumos(tx, menuId, insumos) {
  for (const i of insumos) {
    await tx.query(
      'INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) VALUES (?, ?, ?)',
      [menuId, i.productoId, i.cantidadPorRacion],
    );
  }
}

/** Exigir planificado */
async function exigirPlanificado(tx, id, accion) {
  const [actual] = await tx.query('SELECT estado FROM menu WHERE id = ? FOR UPDATE', [id]);
  if (!actual) throw new HttpError(404, 'Menú no encontrado');
  if (actual.estado === 'confirmado') {
    throw new HttpError(409, `El menú ya fue confirmado: sus insumos ya se descontaron y no se puede ${accion}`);
  }
}

export function listar(db, desde, hasta) {
  return db.query(
    `SELECT id, fecha, servicio, nombre_plato, raciones_planificadas, estado
     FROM menu WHERE fecha BETWEEN ? AND ? ORDER BY fecha, servicio`,
    [desde, hasta],
  );
}

/** Obtener menú */
export async function obtener(db, id) {
  const [menu] = await db.query(
    `SELECT id, fecha, servicio, nombre_plato, raciones_planificadas, estado FROM menu WHERE id = ?`,
    [id],
  );
  if (!menu) return undefined;
  const insumos = await db.query(
    `SELECT i.producto_id, p.nombre, p.unidad, i.cantidad_por_racion,
            i.cantidad_por_racion * ? AS cantidad_total
     FROM menu_insumo i JOIN producto p ON p.id = i.producto_id
     WHERE i.menu_id = ? ORDER BY p.nombre`,
    [menu.raciones_planificadas, id],
  );
  return { ...menu, insumos };
}

export function crear(db, m, insumos) {
  return db.transaction(async (tx) => {
    const ins = await tx.query(
      'INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas) VALUES (?, ?, ?, ?)',
      [m.fecha, m.servicio, m.nombrePlato, m.racionesPlanificadas],
    );
    await insertarInsumos(tx, ins.insertId, insumos);
    return ins.insertId;
  });
}

/** Editar menú */
export function editar(db, id, m, insumos) {
  return db.transaction(async (tx) => {
    await exigirPlanificado(tx, id, 'modificar');
    await tx.query(
      'UPDATE menu SET fecha = ?, servicio = ?, nombre_plato = ?, raciones_planificadas = ? WHERE id = ?',
      [m.fecha, m.servicio, m.nombrePlato, m.racionesPlanificadas, id],
    );
    await tx.query('DELETE FROM menu_insumo WHERE menu_id = ?', [id]);
    await insertarInsumos(tx, id, insumos);
  });
}

export function borrar(db, id) {
  return db.transaction(async (tx) => {
    await exigirPlanificado(tx, id, 'borrar');
    await tx.query('DELETE FROM menu WHERE id = ?', [id]); // en cascada
  });
}

/** Confirmar menú */
export function confirmar(db, menuId, usuarioId) {
  return db.transaction(async (tx) => {
    const [menu] = await tx.query('SELECT * FROM menu WHERE id = ? FOR UPDATE', [menuId]);
    if (!menu) throw new HttpError(404, 'Menú no encontrado');
    if (menu.estado === 'confirmado') throw new HttpError(409, 'El menú ya fue confirmado');

    const insumos = await tx.query('SELECT producto_id, cantidad_por_racion FROM menu_insumo WHERE menu_id = ?', [menuId]);
    for (const i of insumos) {
      await egresarStock(tx, {
        productoId: i.producto_id,
        cantidad: Number(i.cantidad_por_racion) * menu.raciones_planificadas,
        motivo: 'consumo',
        fecha: menu.fecha,
        usuarioId,
        observacion: `Menú #${menuId}: ${menu.nombre_plato}`,
      });
    }
    await tx.query("UPDATE menu SET estado = 'confirmado' WHERE id = ?", [menuId]);
  });
}
