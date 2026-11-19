import { HttpError } from '../../middleware/errors.js';
import { ingresarStock } from '../stock/stock.model.js';

const redondear = (n) => Math.round(n * 100) / 100;

/** Registrar ítems */
async function registrarItems(tx, donacionId, items, fechaDonacion, usuarioId) {
  for (const item of items) {
    const loteId = await ingresarStock(tx, {
      productoId: item.productoId,
      cantidad: item.cantidad,
      fechaVencimiento: item.fechaVencimiento ?? null,
      motivo: 'donacion',
      fecha: fechaDonacion,
      usuarioId,
    });
    await tx.query(
      `INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id)
       VALUES (?, ?, ?, ?, ?)`,
      [donacionId, item.productoId, item.cantidad, item.fechaVencimiento ?? null, loteId],
    );
  }
}

/** Leer ítems */
async function leerItems(tx, donacionId, bloquear = false) {
  const items = await tx.query(
    `SELECT i.id, i.producto_id, p.nombre, p.unidad, i.cantidad, i.fecha_vencimiento, i.lote_id
     FROM donacion_item i JOIN producto p ON p.id = i.producto_id
     WHERE i.donacion_id = ? ORDER BY i.id`,
    [donacionId],
  );
  const loteIds = items.map((i) => i.lote_id).filter(Boolean);
  const lotes = loteIds.length
    ? await tx.query(`SELECT id, cantidad_actual FROM lote_stock WHERE id IN (?)${bloquear ? ' FOR UPDATE' : ''}`, [loteIds])
    : [];
  const actual = new Map(lotes.map((l) => [l.id, Number(l.cantidad_actual)]));
  // Sin lote: usado
  return items.map((i) => ({
    ...i,
    usado: actual.has(i.lote_id) ? redondear(Number(i.cantidad) - actual.get(i.lote_id)) : Number(i.cantidad),
  }));
}

const mismosItems = (actuales, nuevos) =>
  actuales.length === nuevos.length &&
  actuales.every(
    (a, k) =>
      a.producto_id === nuevos[k].productoId &&
      Number(a.cantidad) === redondear(nuevos[k].cantidad) &&
      (a.fecha_vencimiento ?? null) === (nuevos[k].fechaVencimiento ?? null),
  );

/** Exigir sin uso */
function exigirSinUso(items, consecuencia) {
  const usado = items.find((i) => i.usado > 0);
  if (!usado) return;
  const unidad = usado.unidad === 'unidad' && usado.usado !== 1 ? 'unidades' : usado.unidad;
  const cant = String(usado.usado).replace('.', ',');
  throw new HttpError(409, `Ya se usaron ${cant} ${unidad} de ${usado.nombre} de esta donación: ${consecuencia}`);
}

/** Quitar ítems */
async function quitarItems(tx, donacionId, items) {
  const lotes = items.map((i) => i.lote_id).filter(Boolean);
  await tx.query('DELETE FROM donacion_item WHERE donacion_id = ?', [donacionId]);
  if (lotes.length) {
    await tx.query("DELETE FROM movimiento_stock WHERE lote_id IN (?) AND tipo = 'ingreso'", [lotes]);
    await tx.query('DELETE FROM lote_stock WHERE id IN (?)', [lotes]);
  }
}

async function bloquearDonacion(tx, id) {
  const [don] = await tx.query('SELECT id FROM donacion WHERE id = ? FOR UPDATE', [id]);
  if (!don) throw new HttpError(404, 'Donación no encontrada');
}

export const listarOrigenes = (db) => db.query('SELECT id, nombre FROM origen_donacion ORDER BY id');

/** Listar donaciones */
export function listar(db, desde, hasta) {
  return db.query(
    `SELECT d.id, d.fecha, d.origen_id, o.nombre AS origen, d.referencia, d.observacion,
            COUNT(i.id) AS cantidad_items,
            MAX(CASE WHEN i.id IS NOT NULL AND (l.id IS NULL OR l.cantidad_actual < i.cantidad) THEN 1 ELSE 0 END) AS usada
     FROM donacion d
     JOIN origen_donacion o ON o.id = d.origen_id
     LEFT JOIN donacion_item i ON i.donacion_id = d.id
     LEFT JOIN lote_stock l ON l.id = i.lote_id
     WHERE d.fecha BETWEEN ? AND ?
     GROUP BY d.id, o.nombre
     ORDER BY d.fecha DESC, d.id DESC`,
    [desde, hasta],
  );
}

/** Obtener donación */
export async function obtener(db, id) {
  const [don] = await db.query(
    `SELECT d.id, d.origen_id, o.nombre AS origen, d.referencia, d.fecha, d.observacion
     FROM donacion d JOIN origen_donacion o ON o.id = d.origen_id WHERE d.id = ?`,
    [id],
  );
  if (!don) return undefined;
  return { ...don, items: await leerItems(db, id) };
}

/** Crear donación */
export function crear(db, cab, items, usuarioId) {
  return db.transaction(async (tx) => {
    const don = await tx.query(
      'INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES (?, ?, ?, ?, ?)',
      [cab.origenId, cab.referencia ?? null, cab.fecha, usuarioId, cab.observacion ?? null],
    );
    await registrarItems(tx, don.insertId, items, cab.fecha, usuarioId);
    return don.insertId;
  });
}

/** Editar donación */
export function editar(db, id, cab, items, usuarioId) {
  return db.transaction(async (tx) => {
    await bloquearDonacion(tx, id);
    const actuales = await leerItems(tx, id, true);
    await tx.query('UPDATE donacion SET origen_id = ?, referencia = ?, fecha = ? WHERE id = ?', [
      cab.origenId, cab.referencia ?? null, cab.fecha, id,
    ]);
    if (cab.observacion !== undefined) await tx.query('UPDATE donacion SET observacion = ? WHERE id = ?', [cab.observacion, id]);

    if (mismosItems(actuales, items)) {
      const lotes = actuales.map((i) => i.lote_id).filter(Boolean);
      if (lotes.length) {
        await tx.query("UPDATE movimiento_stock SET fecha = ? WHERE lote_id IN (?) AND tipo = 'ingreso'", [cab.fecha, lotes]);
      }
      return;
    }
    exigirSinUso(actuales, 'solo podés corregir el origen, la referencia y la fecha.');
    await quitarItems(tx, id, actuales);
    await registrarItems(tx, id, items, cab.fecha, usuarioId);
  });
}

/** Borrar donación */
export function borrar(db, id) {
  return db.transaction(async (tx) => {
    await bloquearDonacion(tx, id);
    const actuales = await leerItems(tx, id, true);
    exigirSinUso(actuales, 'no se puede borrar. Corregí las cantidades con "Corrección" en Lo que hay.');
    await quitarItems(tx, id, actuales);
    await tx.query('DELETE FROM donacion WHERE id = ?', [id]);
  });
}
