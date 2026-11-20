const { conection } = require('../config/db.js');
const { obtenerAlertas } = require('./stock.model.js');

const racionesPorServicio = async (desde, hasta) => {
  const [rows] = await conection.query(
    `SELECT servicio, SUM(cantidad) AS total_raciones, COUNT(*) AS dias_registrados
     FROM racion_diaria WHERE fecha BETWEEN ? AND ? GROUP BY servicio`,
    [desde, hasta],
  );
  return rows;
};

const consumoInsumos = async (desde, hasta) => {
  const [rows] = await conection.query(
    `SELECT p.nombre, p.unidad, SUM(m.cantidad) AS total_consumido
     FROM movimiento_stock m JOIN producto p ON p.id = m.producto_id
     WHERE m.tipo = 'egreso' AND m.fecha BETWEEN ? AND ?
     GROUP BY p.id ORDER BY total_consumido DESC`,
    [desde, hasta],
  );
  return rows;
};

const donacionesPorOrigen = async (desde, hasta) => {
  const [rows] = await conection.query(
    `SELECT o.nombre AS origen, COUNT(DISTINCT d.id) AS donaciones,
            p.nombre AS producto, p.unidad, SUM(i.cantidad) AS cantidad_total
     FROM donacion d
     JOIN origen_donacion o ON o.id = d.origen_id
     JOIN donacion_item i ON i.donacion_id = d.id
     JOIN producto p ON p.id = i.producto_id
     WHERE d.fecha BETWEEN ? AND ?
     GROUP BY o.id, p.id ORDER BY o.nombre, p.nombre`,
    [desde, hasta],
  );
  return rows;
};

// Datos del tablero
const datosTablero = async (desde, hasta) => {
  const [raciones] = await conection.query(
    `SELECT COALESCE(SUM(cantidad), 0) AS total, COUNT(DISTINCT fecha) AS dias
     FROM racion_diaria WHERE fecha BETWEEN ? AND ?`,
    [desde, hasta],
  );
  const [donaciones] = await conection.query('SELECT COUNT(*) AS total FROM donacion WHERE fecha BETWEEN ? AND ?', [
    desde,
    hasta,
  ]);
  const alertas = await obtenerAlertas(7);
  const [racionesPorDia] = await conection.query(
    `SELECT fecha,
            SUM(CASE WHEN servicio = 'almuerzo' THEN cantidad ELSE 0 END) AS almuerzo,
            SUM(CASE WHEN servicio = 'merienda' THEN cantidad ELSE 0 END) AS merienda
     FROM racion_diaria WHERE fecha BETWEEN ? AND ?
     GROUP BY fecha ORDER BY fecha`,
    [desde, hasta],
  );
  const [planificadasVsServidas] = await conection.query(
    `SELECT fecha, SUM(planificadas) AS planificadas, SUM(servidas) AS servidas
     FROM (
       SELECT fecha, raciones_planificadas AS planificadas, 0 AS servidas FROM menu WHERE fecha BETWEEN ? AND ?
       UNION ALL
       SELECT fecha, 0, cantidad FROM racion_diaria WHERE fecha BETWEEN ? AND ?
     ) x
     GROUP BY fecha ORDER BY fecha`,
    [desde, hasta, desde, hasta],
  );
  const [donacionesPorOrigen] = await conection.query(
    `SELECT o.nombre AS origen, COUNT(d.id) AS donaciones
     FROM donacion d JOIN origen_donacion o ON o.id = d.origen_id
     WHERE d.fecha BETWEEN ? AND ?
     GROUP BY o.id, o.nombre ORDER BY donaciones DESC, o.nombre`,
    [desde, hasta],
  );
  const [despensaPorCategoria] = await conection.query(
    `SELECT COALESCE(c.nombre, 'Sin categoría') AS categoria,
            SUM(CASE WHEN s.stock_actual > s.stock_minimo THEN 1 ELSE 0 END) AS enOrden,
            SUM(CASE WHEN s.stock_actual <= s.stock_minimo THEN 1 ELSE 0 END) AS bajoMinimo
     FROM (
       SELECT p.id, p.categoria_id, p.stock_minimo, COALESCE(SUM(l.cantidad_actual), 0) AS stock_actual
       FROM producto p LEFT JOIN lote_stock l ON l.producto_id = p.id
       WHERE p.activo = TRUE
       GROUP BY p.id
     ) s
     LEFT JOIN categoria c ON c.id = s.categoria_id
     GROUP BY c.id, c.nombre ORDER BY categoria`,
  );
  return {
    raciones: raciones[0],
    donaciones: donaciones[0],
    alertas,
    racionesPorDia,
    planificadasVsServidas,
    donacionesPorOrigen,
    despensaPorCategoria,
  };
};

module.exports = { racionesPorServicio, consumoInsumos, donacionesPorOrigen, datosTablero };
