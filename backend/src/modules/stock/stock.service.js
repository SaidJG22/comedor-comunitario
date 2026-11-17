import { HttpError } from '../../middleware/errors.js';

/**
 * Ingreso de stock: crea un lote y registra el movimiento.
 * Devuelve el id del lote creado. `tx` puede ser la base o una transacción.
 */
export async function ingresarStock(
  tx,
  { productoId, cantidad, fechaVencimiento = null, motivo, fecha, usuarioId, observacion = null },
) {
  const lote = await tx.query(
    'INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento) VALUES (?, ?, ?)',
    [productoId, cantidad, fechaVencimiento],
  );
  await tx.query(
    `INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion)
     VALUES (?, ?, 'ingreso', ?, ?, ?, ?, ?)`,
    [productoId, lote.insertId, motivo, cantidad, fecha, usuarioId, observacion],
  );
  return lote.insertId;
}

/**
 * Egreso de stock con criterio FEFO (primero vence, primero sale).
 * RN: el stock nunca puede quedar negativo → 409 si no alcanza.
 */
export async function egresarStock(
  tx,
  { productoId, cantidad, motivo, fecha, usuarioId, observacion = null },
) {
  const lotes = await tx.query(
    `SELECT id, cantidad_actual FROM lote_stock
     WHERE producto_id = ? AND cantidad_actual > 0
     ORDER BY fecha_vencimiento IS NULL, fecha_vencimiento, id
     FOR UPDATE`,
    [productoId],
  );
  const disponible = lotes.reduce((acc, l) => acc + Number(l.cantidad_actual), 0);
  if (disponible < cantidad) {
    throw new HttpError(409, 'Stock insuficiente', { productoId, disponible, solicitado: cantidad });
  }

  let restante = cantidad;
  for (const lote of lotes) {
    if (restante <= 0) break;
    const tomar = Math.min(restante, Number(lote.cantidad_actual));
    await tx.query('UPDATE lote_stock SET cantidad_actual = cantidad_actual - ? WHERE id = ?', [
      tomar,
      lote.id,
    ]);
    await tx.query(
      `INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion)
       VALUES (?, ?, 'egreso', ?, ?, ?, ?, ?)`,
      [productoId, lote.id, motivo, tomar, fecha, usuarioId, observacion],
    );
    restante -= tomar;
  }
}

export function listarProductos(db) {
  return db.query(
    `SELECT p.id, p.nombre, p.unidad, p.stock_minimo, p.activo, c.nombre AS categoria,
            COALESCE(SUM(l.cantidad_actual), 0) AS stock_actual
     FROM producto p
     LEFT JOIN categoria c ON c.id = p.categoria_id
     LEFT JOIN lote_stock l ON l.producto_id = p.id
     WHERE p.activo = TRUE
     GROUP BY p.id, c.nombre
     ORDER BY p.nombre`,
  );
}

export async function crearProducto(db, { nombre, categoriaId = null, unidad, stockMinimo }) {
  const r = await db.query(
    'INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES (?, ?, ?, ?)',
    [nombre, categoriaId, unidad, stockMinimo],
  );
  return { id: r.insertId, nombre, categoriaId, unidad, stockMinimo };
}

/** Alertas: productos bajo el stock mínimo y lotes vencidos / próximos a vencer. */
export async function obtenerAlertas(db, { dias }) {
  const [stockBajo, porVencer] = await Promise.all([
    db.query(
      `SELECT p.id, p.nombre, p.unidad, p.stock_minimo,
              COALESCE(SUM(l.cantidad_actual), 0) AS stock_actual
       FROM producto p LEFT JOIN lote_stock l ON l.producto_id = p.id
       WHERE p.activo = TRUE
       GROUP BY p.id
       HAVING stock_actual <= p.stock_minimo
       ORDER BY p.nombre`,
    ),
    db.query(
      `SELECT l.id AS lote_id, p.id AS producto_id, p.nombre, p.unidad,
              l.cantidad_actual, l.fecha_vencimiento,
              DATEDIFF(l.fecha_vencimiento, CURDATE()) AS dias_restantes
       FROM lote_stock l JOIN producto p ON p.id = l.producto_id
       WHERE l.cantidad_actual > 0 AND l.fecha_vencimiento IS NOT NULL
         AND l.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY l.fecha_vencimiento`,
      [dias],
    ),
  ]);
  return { stockBajo, porVencer };
}
