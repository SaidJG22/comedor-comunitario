const { conection, transaccion } = require('../config/db.js');
const { HttpError } = require('../middlewares/errors.js');

/* Movimientos */

// Ingreso
const ingresarStock = async (
  conexion,
  { productoId, cantidad, fechaVencimiento = null, motivo, fecha, usuarioId, observacion = null },
) => {
  const [lote] = await conexion.query(
    'INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento) VALUES (?, ?, ?)',
    [productoId, cantidad, fechaVencimiento],
  );
  await conexion.query(
    `INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion)
     VALUES (?, ?, 'ingreso', ?, ?, ?, ?, ?)`,
    [productoId, lote.insertId, motivo, cantidad, fecha, usuarioId, observacion],
  );
  return lote.insertId;
};

// Egreso FEFO
const egresarStock = async (conexion, { productoId, cantidad, motivo, fecha, usuarioId, observacion = null }) => {
  const [lotes] = await conexion.query(
    `SELECT id, cantidad_actual FROM lote_stock
     WHERE producto_id = ? AND cantidad_actual > 0
     ORDER BY fecha_vencimiento IS NULL, fecha_vencimiento, id
     FOR UPDATE`,
    [productoId],
  );
  const disponible = lotes.reduce((total, lote) => total + Number(lote.cantidad_actual), 0);
  if (disponible < cantidad) {
    throw new HttpError(409, 'Stock insuficiente', { productoId, disponible, solicitado: cantidad });
  }

  let restante = cantidad;
  for (const lote of lotes) {
    if (restante <= 0) break;
    const tomar = Math.min(restante, Number(lote.cantidad_actual));
    await conexion.query('UPDATE lote_stock SET cantidad_actual = cantidad_actual - ? WHERE id = ?', [tomar, lote.id]);
    await conexion.query(
      `INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion)
       VALUES (?, ?, 'egreso', ?, ?, ?, ?, ?)`,
      [productoId, lote.id, motivo, tomar, fecha, usuarioId, observacion],
    );
    restante -= tomar;
  }
};

// Movimiento manual
const registrarMovimiento = ({ tipo, ...datos }) =>
  transaccion(async (conexion) => {
    if (tipo === 'ingreso') await ingresarStock(conexion, datos);
    else await egresarStock(conexion, datos);
  });

/* Categorías */

const listarCategorias = async () => {
  const [rows] = await conection.query(
    `SELECT c.id, c.nombre, COUNT(p.id) AS productos
     FROM categoria c LEFT JOIN producto p ON p.categoria_id = c.id AND p.activo = TRUE
     GROUP BY c.id, c.nombre ORDER BY c.nombre`,
  );
  return rows;
};

const obtenerCategoria = async (id) => {
  const [rows] = await conection.query('SELECT id, nombre FROM categoria WHERE id = ?', [id]);
  return rows[0];
};

// Nombre repetido
const sinRepetir = async (consulta, nombre) => {
  try {
    return await consulta;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, `Ya existe la categoría "${nombre}"`);
    throw error;
  }
};

const crearCategoria = async (nombre) => {
  const [result] = await sinRepetir(conection.query('INSERT INTO categoria (nombre) VALUES (?)', [nombre]), nombre);
  return result.insertId;
};

const editarCategoria = async (id, nombre) => {
  const [result] = await sinRepetir(conection.query('UPDATE categoria SET nombre = ? WHERE id = ?', [nombre, id]), nombre);
  if (result.affectedRows === 0) throw new HttpError(404, 'Categoría no encontrada');
};

// Borrar categoría
const borrarCategoria = (id) =>
  transaccion(async (conexion) => {
    const [rows] = await conexion.query('SELECT id FROM categoria WHERE id = ? FOR UPDATE', [id]);
    if (rows.length === 0) throw new HttpError(404, 'Categoría no encontrada');
    const [sueltos] = await conexion.query('UPDATE producto SET categoria_id = NULL WHERE categoria_id = ?', [id]);
    await conexion.query('DELETE FROM categoria WHERE id = ?', [id]);
    return sueltos.affectedRows;
  });

/* Productos */

// Historial del producto
const TIENE_HISTORIAL = `(EXISTS (SELECT 1 FROM lote_stock x WHERE x.producto_id = p.id)
  OR EXISTS (SELECT 1 FROM movimiento_stock x WHERE x.producto_id = p.id)
  OR EXISTS (SELECT 1 FROM donacion_item x WHERE x.producto_id = p.id)
  OR EXISTS (SELECT 1 FROM menu_insumo x WHERE x.producto_id = p.id))`;

const listarProductos = async () => {
  const [rows] = await conection.query(
    `SELECT p.id, p.nombre, p.unidad, p.stock_minimo, p.activo, p.categoria_id, c.nombre AS categoria,
            COALESCE(SUM(l.cantidad_actual), 0) AS stock_actual, ${TIENE_HISTORIAL} AS tiene_historial
     FROM producto p
     LEFT JOIN categoria c ON c.id = p.categoria_id
     LEFT JOIN lote_stock l ON l.producto_id = p.id
     WHERE p.activo = TRUE
     GROUP BY p.id, c.nombre
     ORDER BY p.nombre`,
  );
  return rows;
};

const obtenerProducto = async (id) => {
  const [rows] = await conection.query(
    `SELECT p.id, p.nombre, p.unidad, p.stock_minimo, p.activo, p.categoria_id, c.nombre AS categoria,
            COALESCE(SUM(l.cantidad_actual), 0) AS stock_actual
     FROM producto p
     LEFT JOIN categoria c ON c.id = p.categoria_id
     LEFT JOIN lote_stock l ON l.producto_id = p.id
     WHERE p.id = ?
     GROUP BY p.id, c.nombre`,
    [id],
  );
  if (rows.length === 0) throw new HttpError(404, 'Producto no encontrado');
  return rows[0];
};

const crearProducto = async ({ nombre, categoriaId = null, unidad, stockMinimo }) => {
  const [result] = await conection.query(
    'INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES (?, ?, ?, ?)',
    [nombre, categoriaId, unidad, stockMinimo],
  );
  return { id: result.insertId, nombre, categoriaId, unidad, stockMinimo };
};

const editarProducto = async (id, { nombre, categoriaId = null, stockMinimo }) => {
  const [result] = await conection.query(
    'UPDATE producto SET nombre = ?, categoria_id = ?, stock_minimo = ? WHERE id = ? AND activo = TRUE',
    [nombre, categoriaId, stockMinimo, id],
  );
  if (result.affectedRows === 0) throw new HttpError(404, 'Producto no encontrado');
  return { id, nombre, categoriaId, stockMinimo };
};

// Baja o reactivación
const cambiarEstadoProducto = (id, activo) =>
  transaccion(async (conexion) => {
    const [rows] = await conexion.query('SELECT id, nombre, unidad FROM producto WHERE id = ? FOR UPDATE', [id]);
    const producto = rows[0];
    if (!producto) throw new HttpError(404, 'Producto no encontrado');
    if (!activo) {
      const [stockRows] = await conexion.query(
        'SELECT COALESCE(SUM(cantidad_actual), 0) AS stock FROM lote_stock WHERE producto_id = ?',
        [id],
      );
      const stock = Number(stockRows[0].stock);
      if (stock > 0) {
        const unidad = producto.unidad === 'unidad' ? 'unidades' : producto.unidad;
        throw new HttpError(
          409,
          `Todavía quedan ${stock} ${unidad} de ${producto.nombre}. Primero registrá la salida con "Llegó / se usó".`,
        );
      }
    }
    await conexion.query('UPDATE producto SET activo = ? WHERE id = ?', [activo, id]);
    return { id, activo };
  });

// Borrar producto
const borrarProducto = (id) =>
  transaccion(async (conexion) => {
    const [rows] = await conexion.query('SELECT nombre FROM producto WHERE id = ? FOR UPDATE', [id]);
    const producto = rows[0];
    if (!producto) throw new HttpError(404, 'Producto no encontrado');
    const [historial] = await conexion.query(`SELECT ${TIENE_HISTORIAL} AS tiene FROM producto p WHERE p.id = ?`, [id]);
    if (Number(historial[0].tiene)) {
      throw new HttpError(
        409,
        `"${producto.nombre}" ya tiene movimientos o se usa en donaciones o menús: no se puede borrar. Si ya no se usa, dalo de baja.`,
      );
    }
    await conexion.query('DELETE FROM producto WHERE id = ?', [id]);
  });

// Alertas
const obtenerAlertas = async (dias) => {
  const [stockBajo] = await conection.query(
    `SELECT p.id, p.nombre, p.unidad, p.stock_minimo,
            COALESCE(SUM(l.cantidad_actual), 0) AS stock_actual
     FROM producto p LEFT JOIN lote_stock l ON l.producto_id = p.id
     WHERE p.activo = TRUE
     GROUP BY p.id
     HAVING stock_actual <= p.stock_minimo
     ORDER BY p.nombre`,
  );
  const [porVencer] = await conection.query(
    `SELECT l.id AS lote_id, p.id AS producto_id, p.nombre, p.unidad,
            l.cantidad_actual, l.fecha_vencimiento,
            DATEDIFF(l.fecha_vencimiento, CURDATE()) AS dias_restantes
     FROM lote_stock l JOIN producto p ON p.id = l.producto_id
     WHERE l.cantidad_actual > 0 AND l.fecha_vencimiento IS NOT NULL
       AND l.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
     ORDER BY l.fecha_vencimiento`,
    [dias],
  );
  return { stockBajo, porVencer };
};

module.exports = {
  ingresarStock,
  egresarStock,
  registrarMovimiento,
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  editarCategoria,
  borrarCategoria,
  listarProductos,
  obtenerProducto,
  crearProducto,
  editarProducto,
  cambiarEstadoProducto,
  borrarProducto,
  obtenerAlertas,
};
