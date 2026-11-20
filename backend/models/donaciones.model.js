const { conection, transaccion } = require('../config/db.js');
const { HttpError } = require('../middlewares/errors.js');
const { ingresarStock } = require('./stock.model.js');

const redondear = (n) => Math.round(n * 100) / 100;

// Registrar ítems
const registrarItems = async (conexion, donacionId, items, fechaDonacion, usuarioId) => {
  for (const item of items) {
    const loteId = await ingresarStock(conexion, {
      productoId: item.productoId,
      cantidad: item.cantidad,
      fechaVencimiento: item.fechaVencimiento ?? null,
      motivo: 'donacion',
      fecha: fechaDonacion,
      usuarioId,
    });
    await conexion.query(
      `INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id)
       VALUES (?, ?, ?, ?, ?)`,
      [donacionId, item.productoId, item.cantidad, item.fechaVencimiento ?? null, loteId],
    );
  }
};

// Leer ítems
const leerItems = async (conexion, donacionId, bloquear = false) => {
  const [items] = await conexion.query(
    `SELECT i.id, i.producto_id, p.nombre, p.unidad, i.cantidad, i.fecha_vencimiento, i.lote_id
     FROM donacion_item i JOIN producto p ON p.id = i.producto_id
     WHERE i.donacion_id = ? ORDER BY i.id`,
    [donacionId],
  );
  const loteIds = items.map((i) => i.lote_id).filter(Boolean);
  let lotes = [];
  if (loteIds.length) {
    [lotes] = await conexion.query(
      `SELECT id, cantidad_actual FROM lote_stock WHERE id IN (?)${bloquear ? ' FOR UPDATE' : ''}`,
      [loteIds],
    );
  }
  const actual = new Map(lotes.map((l) => [l.id, Number(l.cantidad_actual)]));
  // Sin lote: usado
  return items.map((i) => ({
    ...i,
    usado: actual.has(i.lote_id) ? redondear(Number(i.cantidad) - actual.get(i.lote_id)) : Number(i.cantidad),
  }));
};

const mismosItems = (actuales, nuevos) =>
  actuales.length === nuevos.length &&
  actuales.every(
    (a, k) =>
      a.producto_id === nuevos[k].productoId &&
      Number(a.cantidad) === redondear(nuevos[k].cantidad) &&
      (a.fecha_vencimiento ?? null) === (nuevos[k].fechaVencimiento ?? null),
  );

// Exigir sin uso
const exigirSinUso = (items, consecuencia) => {
  const usado = items.find((i) => i.usado > 0);
  if (!usado) return;
  const unidad = usado.unidad === 'unidad' && usado.usado !== 1 ? 'unidades' : usado.unidad;
  const cantidad = String(usado.usado).replace('.', ',');
  throw new HttpError(409, `Ya se usaron ${cantidad} ${unidad} de ${usado.nombre} de esta donación: ${consecuencia}`);
};

// Quitar ítems
const quitarItems = async (conexion, donacionId, items) => {
  const lotes = items.map((i) => i.lote_id).filter(Boolean);
  await conexion.query('DELETE FROM donacion_item WHERE donacion_id = ?', [donacionId]);
  if (lotes.length) {
    await conexion.query("DELETE FROM movimiento_stock WHERE lote_id IN (?) AND tipo = 'ingreso'", [lotes]);
    await conexion.query('DELETE FROM lote_stock WHERE id IN (?)', [lotes]);
  }
};

const bloquearDonacion = async (conexion, id) => {
  const [rows] = await conexion.query('SELECT id FROM donacion WHERE id = ? FOR UPDATE', [id]);
  if (rows.length === 0) throw new HttpError(404, 'Donación no encontrada');
};

const listarOrigenes = async () => {
  const [rows] = await conection.query('SELECT id, nombre FROM origen_donacion ORDER BY id');
  return rows;
};

const listar = async (desde, hasta) => {
  const [rows] = await conection.query(
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
  return rows;
};

const obtener = async (id) => {
  const [rows] = await conection.query(
    `SELECT d.id, d.origen_id, o.nombre AS origen, d.referencia, d.fecha, d.observacion
     FROM donacion d JOIN origen_donacion o ON o.id = d.origen_id WHERE d.id = ?`,
    [id],
  );
  if (rows.length === 0) return undefined;
  return { ...rows[0], items: await leerItems(conection, id) };
};

const crear = (cabecera, items, usuarioId) =>
  transaccion(async (conexion) => {
    const [result] = await conexion.query(
      'INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES (?, ?, ?, ?, ?)',
      [cabecera.origenId, cabecera.referencia ?? null, cabecera.fecha, usuarioId, cabecera.observacion ?? null],
    );
    await registrarItems(conexion, result.insertId, items, cabecera.fecha, usuarioId);
    return result.insertId;
  });

const editar = (id, cabecera, items, usuarioId) =>
  transaccion(async (conexion) => {
    await bloquearDonacion(conexion, id);
    const actuales = await leerItems(conexion, id, true);
    await conexion.query('UPDATE donacion SET origen_id = ?, referencia = ?, fecha = ? WHERE id = ?', [
      cabecera.origenId,
      cabecera.referencia ?? null,
      cabecera.fecha,
      id,
    ]);
    if (cabecera.observacion !== undefined) {
      await conexion.query('UPDATE donacion SET observacion = ? WHERE id = ?', [cabecera.observacion, id]);
    }

    if (mismosItems(actuales, items)) {
      const lotes = actuales.map((i) => i.lote_id).filter(Boolean);
      if (lotes.length) {
        await conexion.query("UPDATE movimiento_stock SET fecha = ? WHERE lote_id IN (?) AND tipo = 'ingreso'", [
          cabecera.fecha,
          lotes,
        ]);
      }
      return;
    }
    exigirSinUso(actuales, 'solo podés corregir el origen, la referencia y la fecha.');
    await quitarItems(conexion, id, actuales);
    await registrarItems(conexion, id, items, cabecera.fecha, usuarioId);
  });

const borrar = (id) =>
  transaccion(async (conexion) => {
    await bloquearDonacion(conexion, id);
    const actuales = await leerItems(conexion, id, true);
    exigirSinUso(actuales, 'no se puede borrar. Corregí las cantidades con "Corrección" en Lo que hay.');
    await quitarItems(conexion, id, actuales);
    await conexion.query('DELETE FROM donacion WHERE id = ?', [id]);
  });

module.exports = { listarOrigenes, listar, obtener, crear, editar, borrar };
