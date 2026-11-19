import { HttpError } from '../../middleware/errors.js';

/** Ingreso */
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

/** Egreso FEFO */
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

/** Movimiento manual */
export function registrarMovimiento(db, { tipo, ...datos }) {
  return db.transaction(async (tx) => {
    if (tipo === 'ingreso') await ingresarStock(tx, datos);
    else await egresarStock(tx, datos);
  });
}

/* Categorías */

/** Listar categorías */
export const listarCategorias = (db) =>
  db.query(
    `SELECT c.id, c.nombre, COUNT(p.id) AS productos
     FROM categoria c LEFT JOIN producto p ON p.categoria_id = c.id AND p.activo = TRUE
     GROUP BY c.id, c.nombre ORDER BY c.nombre`,
  );

export async function obtenerCategoria(db, id) {
  const [c] = await db.query('SELECT id, nombre FROM categoria WHERE id = ?', [id]);
  return c;
}

/** Nombre repetido */
async function sinRepetir(promesa, nombre) {
  try {
    return await promesa;
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') throw new HttpError(409, `Ya existe la categoría "${nombre}"`);
    throw err;
  }
}

export async function crearCategoria(db, nombre) {
  const r = await sinRepetir(db.query('INSERT INTO categoria (nombre) VALUES (?)', [nombre]), nombre);
  return r.insertId;
}

export async function editarCategoria(db, id, nombre) {
  const r = await sinRepetir(db.query('UPDATE categoria SET nombre = ? WHERE id = ?', [nombre, id]), nombre);
  if (r.affectedRows === 0) throw new HttpError(404, 'Categoría no encontrada');
}

/** Borrar categoría */
export function borrarCategoria(db, id) {
  return db.transaction(async (tx) => {
    const [c] = await tx.query('SELECT id FROM categoria WHERE id = ? FOR UPDATE', [id]);
    if (!c) throw new HttpError(404, 'Categoría no encontrada');
    const sueltos = await tx.query('UPDATE producto SET categoria_id = NULL WHERE categoria_id = ?', [id]);
    await tx.query('DELETE FROM categoria WHERE id = ?', [id]);
    return sueltos.affectedRows;
  });
}

/* Productos */

/** Historial del producto */
const TIENE_HISTORIAL = `(EXISTS (SELECT 1 FROM lote_stock x WHERE x.producto_id = p.id)
  OR EXISTS (SELECT 1 FROM movimiento_stock x WHERE x.producto_id = p.id)
  OR EXISTS (SELECT 1 FROM donacion_item x WHERE x.producto_id = p.id)
  OR EXISTS (SELECT 1 FROM menu_insumo x WHERE x.producto_id = p.id))`;

export function listarProductos(db) {
  return db.query(
    `SELECT p.id, p.nombre, p.unidad, p.stock_minimo, p.activo, p.categoria_id, c.nombre AS categoria,
            COALESCE(SUM(l.cantidad_actual), 0) AS stock_actual, ${TIENE_HISTORIAL} AS tiene_historial
     FROM producto p
     LEFT JOIN categoria c ON c.id = p.categoria_id
     LEFT JOIN lote_stock l ON l.producto_id = p.id
     WHERE p.activo = TRUE
     GROUP BY p.id, c.nombre
     ORDER BY p.nombre`,
  );
}

/** Obtener producto */
export async function obtenerProducto(db, id) {
  const [p] = await db.query(
    `SELECT p.id, p.nombre, p.unidad, p.stock_minimo, p.activo, p.categoria_id, c.nombre AS categoria,
            COALESCE(SUM(l.cantidad_actual), 0) AS stock_actual
     FROM producto p
     LEFT JOIN categoria c ON c.id = p.categoria_id
     LEFT JOIN lote_stock l ON l.producto_id = p.id
     WHERE p.id = ?
     GROUP BY p.id, c.nombre`,
    [id],
  );
  if (!p) throw new HttpError(404, 'Producto no encontrado');
  return p;
}

export async function crearProducto(db, { nombre, categoriaId = null, unidad, stockMinimo }) {
  const r = await db.query(
    'INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES (?, ?, ?, ?)',
    [nombre, categoriaId, unidad, stockMinimo],
  );
  return { id: r.insertId, nombre, categoriaId, unidad, stockMinimo };
}

/** Editar producto */
export async function editarProducto(db, id, { nombre, categoriaId = null, stockMinimo }) {
  const r = await db.query(
    'UPDATE producto SET nombre = ?, categoria_id = ?, stock_minimo = ? WHERE id = ? AND activo = TRUE',
    [nombre, categoriaId, stockMinimo, id],
  );
  if (r.affectedRows === 0) throw new HttpError(404, 'Producto no encontrado');
  return { id, nombre, categoriaId, stockMinimo };
}

/** Baja o reactivación */
export function cambiarEstadoProducto(db, id, activo) {
  return db.transaction(async (tx) => {
    const [p] = await tx.query('SELECT id, nombre, unidad FROM producto WHERE id = ? FOR UPDATE', [id]);
    if (!p) throw new HttpError(404, 'Producto no encontrado');
    if (!activo) {
      const [{ stock }] = await tx.query(
        'SELECT COALESCE(SUM(cantidad_actual), 0) AS stock FROM lote_stock WHERE producto_id = ?',
        [id],
      );
      if (Number(stock) > 0) {
        throw new HttpError(
          409,
          `Todavía quedan ${Number(stock)} ${p.unidad === 'unidad' ? 'unidades' : p.unidad} de ${p.nombre}. Primero registrá la salida con "Llegó / se usó".`,
        );
      }
    }
    await tx.query('UPDATE producto SET activo = ? WHERE id = ?', [activo, id]);
    return { id, activo };
  });
}

/** Borrar producto */
export function borrarProducto(db, id) {
  return db.transaction(async (tx) => {
    const [p] = await tx.query('SELECT nombre FROM producto WHERE id = ? FOR UPDATE', [id]);
    if (!p) throw new HttpError(404, 'Producto no encontrado');
    const [{ historial }] = await tx.query(`SELECT ${TIENE_HISTORIAL} AS historial FROM producto p WHERE p.id = ?`, [id]);
    if (Number(historial)) {
      throw new HttpError(409, `"${p.nombre}" ya tiene movimientos o se usa en donaciones o menús: no se puede borrar. Si ya no se usa, dalo de baja.`);
    }
    await tx.query('DELETE FROM producto WHERE id = ?', [id]);
  });
}

/** Alertas */
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
