-- Datos iniciales

USE cometuc;

DROP PROCEDURE IF EXISTS cargar_datos_iniciales;
DELIMITER //
CREATE PROCEDURE cargar_datos_iniciales()
BEGIN
  DECLARE v_usuario INT UNSIGNED DEFAULT NULL;
  DECLARE v_repetidos TEXT DEFAULT NULL;
  DECLARE v_mensaje VARCHAR(255);

  -- Comprobaciones
  SELECT u.id INTO v_usuario FROM usuario u JOIN rol r ON r.id = u.rol_id
   WHERE r.nombre = 'Administrador' AND u.activo = TRUE ORDER BY u.id LIMIT 1;
  IF v_usuario IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay ningún administrador activo. Crealo primero con npm run seed:admin.';
  END IF;

  IF (SELECT COUNT(*) FROM origen_donacion WHERE nombre IN ('Estado', 'Banco de Alimentos', 'Particular', 'Comercio')) < 4 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Faltan orígenes de donación. Ejecutá primero seed.sql.';
  END IF;

  SELECT GROUP_CONCAT(nombre SEPARATOR ', ') INTO v_repetidos FROM producto
   WHERE nombre IN ('Arroz', 'Fideos tirabuzón', 'Fideos mostachol', 'Harina 000', 'Lentejas', 'Polenta', 'Azúcar', 'Yerba mate', 'Aceite de girasol', 'Cacao en polvo', 'Papa', 'Cebolla', 'Zanahoria', 'Zapallo', 'Carne picada', 'Pollo', 'Huevos', 'Pan', 'Leche', 'Queso cremoso', 'Puré de tomate', 'Arvejas en lata', 'Choclo en lata', 'Lavandina', 'Detergente');
  IF v_repetidos IS NOT NULL THEN
    SET v_mensaje = LEFT(CONCAT('Los datos iniciales ya están cargados (ya existe: ', v_repetidos, ')'), 128);
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_mensaje;
  END IF;

  BEGIN
    -- Errores
    DECLARE v_error TEXT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      GET DIAGNOSTICS CONDITION 1 v_error = MESSAGE_TEXT;
      ROLLBACK;
      SET v_mensaje = LEFT(CONCAT('No se cargó nada: ', v_error), 128);
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_mensaje;
    END;

    SET @u = v_usuario;
    SET @lunes = DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY);
    START TRANSACTION;

    -- Productos
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Arroz', (SELECT id FROM categoria WHERE nombre = 'Secos'), 'kg', 8.00);
    SET @p_arroz = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Fideos tirabuzón', (SELECT id FROM categoria WHERE nombre = 'Secos'), 'kg', 5.00);
    SET @p_tirabuzon = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Fideos mostachol', (SELECT id FROM categoria WHERE nombre = 'Secos'), 'kg', 2.00);
    SET @p_mostachol = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Harina 000', (SELECT id FROM categoria WHERE nombre = 'Secos'), 'kg', 2.00);
    SET @p_harina = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Lentejas', (SELECT id FROM categoria WHERE nombre = 'Secos'), 'kg', 5.00);
    SET @p_lentejas = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Polenta', (SELECT id FROM categoria WHERE nombre = 'Secos'), 'kg', 5.00);
    SET @p_polenta = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Azúcar', (SELECT id FROM categoria WHERE nombre = 'Secos'), 'kg', 2.00);
    SET @p_azucar = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Yerba mate', (SELECT id FROM categoria WHERE nombre = 'Secos'), 'kg', 1.00);
    SET @p_yerba = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Aceite de girasol', (SELECT id FROM categoria WHERE nombre = 'Secos'), 'l', 10.00);
    SET @p_aceite = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Cacao en polvo', (SELECT id FROM categoria WHERE nombre = 'Secos'), 'kg', 4.00);
    SET @p_cacao = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Papa', (SELECT id FROM categoria WHERE nombre = 'Frescos'), 'kg', 6.00);
    SET @p_papa = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Cebolla', (SELECT id FROM categoria WHERE nombre = 'Frescos'), 'kg', 2.00);
    SET @p_cebolla = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Zanahoria', (SELECT id FROM categoria WHERE nombre = 'Frescos'), 'kg', 4.00);
    SET @p_zanahoria = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Zapallo', (SELECT id FROM categoria WHERE nombre = 'Frescos'), 'kg', 5.00);
    SET @p_zapallo = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Carne picada', (SELECT id FROM categoria WHERE nombre = 'Frescos'), 'kg', 1.00);
    SET @p_carne = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Pollo', (SELECT id FROM categoria WHERE nombre = 'Frescos'), 'kg', 9.00);
    SET @p_pollo = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Huevos', (SELECT id FROM categoria WHERE nombre = 'Frescos'), 'unidad', 21.00);
    SET @p_huevos = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Pan', (SELECT id FROM categoria WHERE nombre = 'Frescos'), 'kg', 1.00);
    SET @p_pan = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Leche', (SELECT id FROM categoria WHERE nombre = 'Lácteos'), 'l', 11.00);
    SET @p_leche = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Queso cremoso', (SELECT id FROM categoria WHERE nombre = 'Lácteos'), 'kg', 1.00);
    SET @p_queso = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Puré de tomate', (SELECT id FROM categoria WHERE nombre = 'Conservas'), 'unidad', 5.00);
    SET @p_pure = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Arvejas en lata', (SELECT id FROM categoria WHERE nombre = 'Conservas'), 'unidad', 12.00);
    SET @p_arvejas = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Choclo en lata', (SELECT id FROM categoria WHERE nombre = 'Conservas'), 'unidad', 9.00);
    SET @p_choclo = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Lavandina', (SELECT id FROM categoria WHERE nombre = 'Limpieza'), 'l', 3.00);
    SET @p_lavandina = LAST_INSERT_ID();
    INSERT INTO producto (nombre, categoria_id, unidad, stock_minimo) VALUES ('Detergente', (SELECT id FROM categoria WHERE nombre = 'Limpieza'), 'l', 3.00);
    SET @p_detergente = LAST_INSERT_ID();

    -- Voluntarios
    INSERT INTO voluntario (nombre_visible) VALUES ('Marta'); SET @v0 = LAST_INSERT_ID();
    INSERT INTO voluntario (nombre_visible) VALUES ('Luis'); SET @v1 = LAST_INSERT_ID();
    INSERT INTO voluntario (nombre_visible) VALUES ('Rocío'); SET @v2 = LAST_INSERT_ID();
    INSERT INTO voluntario (nombre_visible) VALUES ('Pato'); SET @v3 = LAST_INSERT_ID();
    INSERT INTO voluntario (nombre_visible) VALUES ('Gabi'); SET @v4 = LAST_INSERT_ID();
    INSERT INTO voluntario (nombre_visible) VALUES ('Don Ramón'); SET @v5 = LAST_INSERT_ID();
    INSERT INTO voluntario (nombre_visible) VALUES ('Ceci'); SET @v6 = LAST_INSERT_ID();
    INSERT INTO voluntario (nombre_visible) VALUES ('Nico'); SET @v7 = LAST_INSERT_ID();
    INSERT INTO voluntario (nombre_visible) VALUES ('Juli'); SET @v8 = LAST_INSERT_ID();
    INSERT INTO voluntario (nombre_visible) VALUES ('Tere'); SET @v9 = LAST_INSERT_ID();

    -- Día -30
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Banco de Alimentos'), 'Entrega mensual', DATE_ADD(@lunes, INTERVAL -30 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_arroz, 8.72, DATE_ADD(@lunes, INTERVAL 270 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -30 DAY), '10:00:00')); SET @l1 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_arroz, 30.00, DATE_ADD(@lunes, INTERVAL 270 DAY), @l1);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_lentejas, 7.52, DATE_ADD(@lunes, INTERVAL 335 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -30 DAY), '10:00:00')); SET @l2 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_lentejas, 20.00, DATE_ADD(@lunes, INTERVAL 335 DAY), @l2);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_tirabuzon, 3.40, DATE_ADD(@lunes, INTERVAL 270 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -30 DAY), '10:00:00')); SET @l3 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_tirabuzon, 20.00, DATE_ADD(@lunes, INTERVAL 270 DAY), @l3);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_pure, 0.00, DATE_ADD(@lunes, INTERVAL 335 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -30 DAY), '10:00:00')); SET @l4 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_pure, 48.00, DATE_ADD(@lunes, INTERVAL 335 DAY), @l4);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_polenta, 2.00, DATE_ADD(@lunes, INTERVAL 270 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -30 DAY), '10:00:00')); SET @l5 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_polenta, 10.00, DATE_ADD(@lunes, INTERVAL 270 DAY), @l5);
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_arroz, @l1, 'ingreso', 'donacion', 30.00, DATE_ADD(@lunes, INTERVAL -30 DAY), @u, NULL),
      (@p_lentejas, @l2, 'ingreso', 'donacion', 20.00, DATE_ADD(@lunes, INTERVAL -30 DAY), @u, NULL),
      (@p_tirabuzon, @l3, 'ingreso', 'donacion', 20.00, DATE_ADD(@lunes, INTERVAL -30 DAY), @u, NULL),
      (@p_pure, @l4, 'ingreso', 'donacion', 48.00, DATE_ADD(@lunes, INTERVAL -30 DAY), @u, NULL),
      (@p_polenta, @l5, 'ingreso', 'donacion', 10.00, DATE_ADD(@lunes, INTERVAL -30 DAY), @u, NULL);

    -- Día -29
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Estado'), 'Programa alimentario', DATE_ADD(@lunes, INTERVAL -29 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_mostachol, 9.40, DATE_ADD(@lunes, INTERVAL 271 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -29 DAY), '10:00:00')); SET @l6 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_mostachol, 20.00, DATE_ADD(@lunes, INTERVAL 271 DAY), @l6);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_harina, 7.38, DATE_ADD(@lunes, INTERVAL 151 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -29 DAY), '10:00:00')); SET @l7 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_harina, 20.00, DATE_ADD(@lunes, INTERVAL 151 DAY), @l7);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_aceite, 6.10, DATE_ADD(@lunes, INTERVAL 336 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -29 DAY), '10:00:00')); SET @l8 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_aceite, 10.00, DATE_ADD(@lunes, INTERVAL 336 DAY), @l8);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_leche, 0.00, DATE_ADD(@lunes, INTERVAL 31 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -29 DAY), '10:00:00')); SET @l9 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_leche, 48.00, DATE_ADD(@lunes, INTERVAL 31 DAY), @l9);
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_mostachol, @l6, 'ingreso', 'donacion', 20.00, DATE_ADD(@lunes, INTERVAL -29 DAY), @u, NULL),
      (@p_harina, @l7, 'ingreso', 'donacion', 20.00, DATE_ADD(@lunes, INTERVAL -29 DAY), @u, NULL),
      (@p_aceite, @l8, 'ingreso', 'donacion', 10.00, DATE_ADD(@lunes, INTERVAL -29 DAY), @u, NULL),
      (@p_leche, @l9, 'ingreso', 'donacion', 48.00, DATE_ADD(@lunes, INTERVAL -29 DAY), @u, NULL);

    -- Día -28
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_papa, 0.00, DATE_ADD(@lunes, INTERVAL 22 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -28 DAY), '10:00:00')); SET @l10 = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_cebolla, 0.00, DATE_ADD(@lunes, INTERVAL 17 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -28 DAY), '10:00:00')); SET @l11 = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_zanahoria, 0.61, DATE_ADD(@lunes, INTERVAL 17 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -28 DAY), '10:00:00')); SET @l12 = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_carne, 0.00, DATE_ADD(@lunes, INTERVAL 62 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -28 DAY), '10:00:00')); SET @l13 = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_yerba, 3.39, DATE_ADD(@lunes, INTERVAL 337 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -28 DAY), '10:00:00')); SET @l14 = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_azucar, 4.37, NULL, TIMESTAMP(DATE_ADD(@lunes, INTERVAL -28 DAY), '10:00:00')); SET @l15 = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_pan, 0.00, DATE_ADD(@lunes, INTERVAL -24 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -28 DAY), '10:00:00')); SET @l16 = LAST_INSERT_ID();
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_lentejas, @l2, 'egreso', 'consumo', 3.76, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_papa, @l10, 'ingreso', 'compra', 20.00, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Compra'),
      (@p_papa, @l10, 'egreso', 'consumo', 4.70, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_cebolla, @l11, 'ingreso', 'compra', 10.00, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Compra'),
      (@p_cebolla, @l11, 'egreso', 'consumo', 1.41, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_zanahoria, @l12, 'ingreso', 'compra', 10.00, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Compra'),
      (@p_zanahoria, @l12, 'egreso', 'consumo', 1.41, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_carne, @l13, 'ingreso', 'compra', 10.00, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Compra'),
      (@p_carne, @l13, 'egreso', 'consumo', 1.88, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_pure, @l4, 'egreso', 'consumo', 3.76, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_yerba, @l14, 'ingreso', 'compra', 4.00, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Compra'),
      (@p_yerba, @l14, 'egreso', 'consumo', 0.13, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Menú: Mate cocido con leche y pan'),
      (@p_leche, @l9, 'egreso', 'consumo', 3.90, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Menú: Mate cocido con leche y pan'),
      (@p_azucar, @l15, 'ingreso', 'compra', 10.00, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Compra'),
      (@p_azucar, @l15, 'egreso', 'consumo', 0.52, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Menú: Mate cocido con leche y pan'),
      (@p_pan, @l16, 'ingreso', 'compra', 6.00, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Compra'),
      (@p_pan, @l16, 'egreso', 'consumo', 1.56, DATE_ADD(@lunes, INTERVAL -28 DAY), @u, 'Menú: Mate cocido con leche y pan');

    -- Día -27
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Comercio'), 'Verdulería del barrio', DATE_ADD(@lunes, INTERVAL -27 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_papa, 7.64, DATE_ADD(@lunes, INTERVAL 23 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -27 DAY), '10:00:00')); SET @l17 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_papa, 20.00, DATE_ADD(@lunes, INTERVAL 23 DAY), @l17);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_cebolla, 0.00, DATE_ADD(@lunes, INTERVAL 18 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -27 DAY), '10:00:00')); SET @l18 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_cebolla, 10.00, DATE_ADD(@lunes, INTERVAL 18 DAY), @l18);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_zanahoria, 8.00, DATE_ADD(@lunes, INTERVAL 18 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -27 DAY), '10:00:00')); SET @l19 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_zanahoria, 8.00, DATE_ADD(@lunes, INTERVAL 18 DAY), @l19);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_zapallo, 0.00, DATE_ADD(@lunes, INTERVAL 18 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -27 DAY), '10:00:00')); SET @l20 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_zapallo, 15.00, DATE_ADD(@lunes, INTERVAL 18 DAY), @l20);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_pollo, 0.00, DATE_ADD(@lunes, INTERVAL 63 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -27 DAY), '10:00:00')); SET @l21 = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_arvejas, 16.05, DATE_ADD(@lunes, INTERVAL 513 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -27 DAY), '10:00:00')); SET @l22 = LAST_INSERT_ID();
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_papa, @l17, 'ingreso', 'donacion', 20.00, DATE_ADD(@lunes, INTERVAL -27 DAY), @u, NULL),
      (@p_cebolla, @l18, 'ingreso', 'donacion', 10.00, DATE_ADD(@lunes, INTERVAL -27 DAY), @u, NULL),
      (@p_zanahoria, @l19, 'ingreso', 'donacion', 8.00, DATE_ADD(@lunes, INTERVAL -27 DAY), @u, NULL),
      (@p_zapallo, @l20, 'ingreso', 'donacion', 15.00, DATE_ADD(@lunes, INTERVAL -27 DAY), @u, NULL),
      (@p_arroz, @l1, 'egreso', 'consumo', 3.84, DATE_ADD(@lunes, INTERVAL -27 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_pollo, @l21, 'ingreso', 'compra', 20.00, DATE_ADD(@lunes, INTERVAL -27 DAY), @u, 'Compra'),
      (@p_pollo, @l21, 'egreso', 'consumo', 7.20, DATE_ADD(@lunes, INTERVAL -27 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_cebolla, @l11, 'egreso', 'consumo', 1.44, DATE_ADD(@lunes, INTERVAL -27 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_arvejas, @l22, 'ingreso', 'compra', 24.00, DATE_ADD(@lunes, INTERVAL -27 DAY), @u, 'Compra'),
      (@p_arvejas, @l22, 'egreso', 'consumo', 2.40, DATE_ADD(@lunes, INTERVAL -27 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_aceite, @l8, 'egreso', 'consumo', 0.48, DATE_ADD(@lunes, INTERVAL -27 DAY), @u, 'Menú: Arroz con pollo');

    -- Día -26
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Particular'), 'Vecinos del barrio', DATE_ADD(@lunes, INTERVAL -26 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_azucar, 5.00, NULL, TIMESTAMP(DATE_ADD(@lunes, INTERVAL -26 DAY), '10:00:00')); SET @l23 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_azucar, 5.00, NULL, @l23);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_yerba, 2.00, DATE_ADD(@lunes, INTERVAL 339 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -26 DAY), '10:00:00')); SET @l24 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_yerba, 2.00, DATE_ADD(@lunes, INTERVAL 339 DAY), @l24);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_cacao, 0.05, DATE_ADD(@lunes, INTERVAL 214 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -26 DAY), '10:00:00')); SET @l25 = LAST_INSERT_ID();
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_azucar, @l23, 'ingreso', 'donacion', 5.00, DATE_ADD(@lunes, INTERVAL -26 DAY), @u, NULL),
      (@p_yerba, @l24, 'ingreso', 'donacion', 2.00, DATE_ADD(@lunes, INTERVAL -26 DAY), @u, NULL),
      (@p_tirabuzon, @l3, 'egreso', 'consumo', 4.80, DATE_ADD(@lunes, INTERVAL -26 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_carne, @l13, 'egreso', 'consumo', 2.88, DATE_ADD(@lunes, INTERVAL -26 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_pure, @l4, 'egreso', 'consumo', 4.80, DATE_ADD(@lunes, INTERVAL -26 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_cebolla, @l11, 'egreso', 'consumo', 1.44, DATE_ADD(@lunes, INTERVAL -26 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_leche, @l9, 'egreso', 'consumo', 5.60, DATE_ADD(@lunes, INTERVAL -26 DAY), @u, 'Menú: Chocolatada con pan'),
      (@p_cacao, @l25, 'ingreso', 'compra', 2.00, DATE_ADD(@lunes, INTERVAL -26 DAY), @u, 'Compra'),
      (@p_cacao, @l25, 'egreso', 'consumo', 0.42, DATE_ADD(@lunes, INTERVAL -26 DAY), @u, 'Menú: Chocolatada con pan'),
      (@p_azucar, @l15, 'egreso', 'consumo', 0.42, DATE_ADD(@lunes, INTERVAL -26 DAY), @u, 'Menú: Chocolatada con pan'),
      (@p_pan, @l16, 'egreso', 'consumo', 1.68, DATE_ADD(@lunes, INTERVAL -26 DAY), @u, 'Menú: Chocolatada con pan');

    -- Día -25
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_choclo, 7.60, DATE_ADD(@lunes, INTERVAL 515 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -25 DAY), '10:00:00')); SET @l26 = LAST_INSERT_ID();
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_zapallo, @l20, 'egreso', 'consumo', 5.20, DATE_ADD(@lunes, INTERVAL -25 DAY), @u, 'Menú: Locro'),
      (@p_choclo, @l26, 'ingreso', 'compra', 24.00, DATE_ADD(@lunes, INTERVAL -25 DAY), @u, 'Compra'),
      (@p_choclo, @l26, 'egreso', 'consumo', 5.20, DATE_ADD(@lunes, INTERVAL -25 DAY), @u, 'Menú: Locro'),
      (@p_carne, @l13, 'egreso', 'consumo', 2.60, DATE_ADD(@lunes, INTERVAL -25 DAY), @u, 'Menú: Locro'),
      (@p_papa, @l10, 'egreso', 'consumo', 2.60, DATE_ADD(@lunes, INTERVAL -25 DAY), @u, 'Menú: Locro'),
      (@p_cebolla, @l11, 'egreso', 'consumo', 1.04, DATE_ADD(@lunes, INTERVAL -25 DAY), @u, 'Menú: Locro');

    -- Día -24
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_queso, 0.00, DATE_ADD(@lunes, INTERVAL 16 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -24 DAY), '10:00:00')); SET @l27 = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_lavandina, 6.00, NULL, TIMESTAMP(DATE_ADD(@lunes, INTERVAL -24 DAY), '10:00:00')); SET @l28 = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_detergente, 7.00, NULL, TIMESTAMP(DATE_ADD(@lunes, INTERVAL -24 DAY), '10:00:00')); SET @l29 = LAST_INSERT_ID();
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_polenta, @l5, 'egreso', 'consumo', 3.60, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Menú: Polenta con salsa'),
      (@p_pure, @l4, 'egreso', 'consumo', 5.40, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Menú: Polenta con salsa'),
      (@p_queso, @l27, 'ingreso', 'compra', 4.00, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Compra'),
      (@p_queso, @l27, 'egreso', 'consumo', 0.90, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Menú: Polenta con salsa'),
      (@p_cebolla, @l11, 'egreso', 'consumo', 0.90, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Menú: Polenta con salsa'),
      (@p_leche, @l9, 'egreso', 'consumo', 5.60, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_harina, @l7, 'egreso', 'consumo', 1.40, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_aceite, @l8, 'egreso', 'consumo', 0.28, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_azucar, @l15, 'egreso', 'consumo', 0.28, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_lavandina, @l28, 'ingreso', 'compra', 10.00, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Compra'),
      (@p_lavandina, @l28, 'egreso', 'consumo', 1.00, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Limpieza semanal'),
      (@p_detergente, @l29, 'ingreso', 'compra', 10.00, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Compra'),
      (@p_detergente, @l29, 'egreso', 'consumo', 0.75, DATE_ADD(@lunes, INTERVAL -24 DAY), @u, 'Limpieza semanal');

    -- Día -23
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Comercio'), 'Carnicería', DATE_ADD(@lunes, INTERVAL -23 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_carne, 0.00, DATE_ADD(@lunes, INTERVAL 67 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -23 DAY), '10:00:00')); SET @l30 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_carne, 15.00, DATE_ADD(@lunes, INTERVAL 67 DAY), @l30);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_pollo, 16.15, DATE_ADD(@lunes, INTERVAL 67 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -23 DAY), '10:00:00')); SET @l31 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_pollo, 20.00, DATE_ADD(@lunes, INTERVAL 67 DAY), @l31);
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_carne, @l30, 'ingreso', 'donacion', 15.00, DATE_ADD(@lunes, INTERVAL -23 DAY), @u, NULL),
      (@p_pollo, @l31, 'ingreso', 'donacion', 20.00, DATE_ADD(@lunes, INTERVAL -23 DAY), @u, NULL),
      (@p_pan, @l16, 'egreso', 'merma', 2.76, DATE_ADD(@lunes, INTERVAL -23 DAY), @u, 'Se descartó: vencido');

    -- Día -21
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Particular'), 'Colecta de una escuela', DATE_ADD(@lunes, INTERVAL -21 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_arvejas, 24.00, DATE_ADD(@lunes, INTERVAL 519 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -21 DAY), '10:00:00')); SET @l32 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_arvejas, 24.00, DATE_ADD(@lunes, INTERVAL 519 DAY), @l32);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_choclo, 24.00, DATE_ADD(@lunes, INTERVAL 519 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -21 DAY), '10:00:00')); SET @l33 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_choclo, 24.00, DATE_ADD(@lunes, INTERVAL 519 DAY), @l33);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_huevos, 0.00, DATE_ADD(@lunes, INTERVAL 14 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -21 DAY), '10:00:00')); SET @l34 = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_pan, 0.00, DATE_ADD(@lunes, INTERVAL -17 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -21 DAY), '10:00:00')); SET @l35 = LAST_INSERT_ID();
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_arvejas, @l32, 'ingreso', 'donacion', 24.00, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, NULL),
      (@p_choclo, @l33, 'ingreso', 'donacion', 24.00, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, NULL),
      (@p_harina, @l7, 'egreso', 'consumo', 2.94, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, 'Menú: Tarta de zapallo'),
      (@p_huevos, @l34, 'ingreso', 'compra', 90.00, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, 'Compra'),
      (@p_huevos, @l34, 'egreso', 'consumo', 49.00, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, 'Menú: Tarta de zapallo'),
      (@p_zapallo, @l20, 'egreso', 'consumo', 4.90, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, 'Menú: Tarta de zapallo'),
      (@p_queso, @l27, 'egreso', 'consumo', 0.98, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, 'Menú: Tarta de zapallo'),
      (@p_aceite, @l8, 'egreso', 'consumo', 0.49, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, 'Menú: Tarta de zapallo'),
      (@p_yerba, @l14, 'egreso', 'consumo', 0.14, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, 'Menú: Mate cocido con leche y pan'),
      (@p_leche, @l9, 'egreso', 'consumo', 4.35, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, 'Menú: Mate cocido con leche y pan'),
      (@p_azucar, @l15, 'egreso', 'consumo', 0.58, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, 'Menú: Mate cocido con leche y pan'),
      (@p_pan, @l35, 'ingreso', 'compra', 6.00, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, 'Compra'),
      (@p_pan, @l35, 'egreso', 'consumo', 1.74, DATE_ADD(@lunes, INTERVAL -21 DAY), @u, 'Menú: Mate cocido con leche y pan');

    -- Día -20
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_arroz, @l1, 'egreso', 'consumo', 4.32, DATE_ADD(@lunes, INTERVAL -20 DAY), @u, 'Menú: Guiso de arroz'),
      (@p_carne, @l13, 'egreso', 'consumo', 2.64, DATE_ADD(@lunes, INTERVAL -20 DAY), @u, 'Menú: Guiso de arroz'),
      (@p_carne, @l30, 'egreso', 'consumo', 0.06, DATE_ADD(@lunes, INTERVAL -20 DAY), @u, 'Menú: Guiso de arroz'),
      (@p_papa, @l10, 'egreso', 'consumo', 4.32, DATE_ADD(@lunes, INTERVAL -20 DAY), @u, 'Menú: Guiso de arroz'),
      (@p_zanahoria, @l12, 'egreso', 'consumo', 1.62, DATE_ADD(@lunes, INTERVAL -20 DAY), @u, 'Menú: Guiso de arroz'),
      (@p_zapallo, @l20, 'egreso', 'consumo', 2.70, DATE_ADD(@lunes, INTERVAL -20 DAY), @u, 'Menú: Guiso de arroz');

    -- Día -19
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Comercio'), 'Panadería', DATE_ADD(@lunes, INTERVAL -19 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_pan, 0.00, DATE_ADD(@lunes, INTERVAL -15 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -19 DAY), '10:00:00')); SET @l36 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_pan, 8.00, DATE_ADD(@lunes, INTERVAL -15 DAY), @l36);
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_pan, @l36, 'ingreso', 'donacion', 8.00, DATE_ADD(@lunes, INTERVAL -19 DAY), @u, NULL),
      (@p_mostachol, @l6, 'egreso', 'consumo', 5.10, DATE_ADD(@lunes, INTERVAL -19 DAY), @u, 'Menú: Mostachol con salsa'),
      (@p_pure, @l4, 'egreso', 'consumo', 6.12, DATE_ADD(@lunes, INTERVAL -19 DAY), @u, 'Menú: Mostachol con salsa'),
      (@p_queso, @l27, 'egreso', 'consumo', 0.51, DATE_ADD(@lunes, INTERVAL -19 DAY), @u, 'Menú: Mostachol con salsa'),
      (@p_cebolla, @l11, 'egreso', 'consumo', 1.02, DATE_ADD(@lunes, INTERVAL -19 DAY), @u, 'Menú: Mostachol con salsa'),
      (@p_leche, @l9, 'egreso', 'consumo', 6.40, DATE_ADD(@lunes, INTERVAL -19 DAY), @u, 'Menú: Chocolatada con pan'),
      (@p_cacao, @l25, 'egreso', 'consumo', 0.48, DATE_ADD(@lunes, INTERVAL -19 DAY), @u, 'Menú: Chocolatada con pan'),
      (@p_azucar, @l15, 'egreso', 'consumo', 0.48, DATE_ADD(@lunes, INTERVAL -19 DAY), @u, 'Menú: Chocolatada con pan'),
      (@p_pan, @l35, 'egreso', 'consumo', 1.92, DATE_ADD(@lunes, INTERVAL -19 DAY), @u, 'Menú: Chocolatada con pan');

    -- Día -18
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_lentejas, @l2, 'egreso', 'consumo', 4.16, DATE_ADD(@lunes, INTERVAL -18 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_papa, @l10, 'egreso', 'consumo', 5.20, DATE_ADD(@lunes, INTERVAL -18 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_cebolla, @l11, 'egreso', 'consumo', 1.56, DATE_ADD(@lunes, INTERVAL -18 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_zanahoria, @l12, 'egreso', 'consumo', 1.56, DATE_ADD(@lunes, INTERVAL -18 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_carne, @l30, 'egreso', 'consumo', 2.08, DATE_ADD(@lunes, INTERVAL -18 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_pure, @l4, 'egreso', 'consumo', 4.16, DATE_ADD(@lunes, INTERVAL -18 DAY), @u, 'Menú: Guiso de lentejas');

    -- Día -17
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_arroz, @l1, 'egreso', 'consumo', 4.08, DATE_ADD(@lunes, INTERVAL -17 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_pollo, @l21, 'egreso', 'consumo', 7.65, DATE_ADD(@lunes, INTERVAL -17 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_cebolla, @l11, 'egreso', 'consumo', 1.19, DATE_ADD(@lunes, INTERVAL -17 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_cebolla, @l18, 'egreso', 'consumo', 0.34, DATE_ADD(@lunes, INTERVAL -17 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_arvejas, @l22, 'egreso', 'consumo', 2.55, DATE_ADD(@lunes, INTERVAL -17 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_aceite, @l8, 'egreso', 'consumo', 0.51, DATE_ADD(@lunes, INTERVAL -17 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_leche, @l9, 'egreso', 'consumo', 6.20, DATE_ADD(@lunes, INTERVAL -17 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_harina, @l7, 'egreso', 'consumo', 1.55, DATE_ADD(@lunes, INTERVAL -17 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_aceite, @l8, 'egreso', 'consumo', 0.31, DATE_ADD(@lunes, INTERVAL -17 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_azucar, @l15, 'egreso', 'consumo', 0.31, DATE_ADD(@lunes, INTERVAL -17 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_lavandina, @l28, 'egreso', 'consumo', 1.00, DATE_ADD(@lunes, INTERVAL -17 DAY), @u, 'Limpieza semanal'),
      (@p_detergente, @l29, 'egreso', 'consumo', 0.75, DATE_ADD(@lunes, INTERVAL -17 DAY), @u, 'Limpieza semanal');

    -- Día -16
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Banco de Alimentos'), 'Entrega quincenal', DATE_ADD(@lunes, INTERVAL -16 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_arroz, 20.00, DATE_ADD(@lunes, INTERVAL 284 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -16 DAY), '10:00:00')); SET @l37 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_arroz, 20.00, DATE_ADD(@lunes, INTERVAL 284 DAY), @l37);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_cacao, 2.00, DATE_ADD(@lunes, INTERVAL 224 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -16 DAY), '10:00:00')); SET @l38 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_cacao, 2.00, DATE_ADD(@lunes, INTERVAL 224 DAY), @l38);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_queso, 2.80, DATE_ADD(@lunes, INTERVAL 24 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -16 DAY), '10:00:00')); SET @l39 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_queso, 4.00, DATE_ADD(@lunes, INTERVAL 24 DAY), @l39);
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_arroz, @l37, 'ingreso', 'donacion', 20.00, DATE_ADD(@lunes, INTERVAL -16 DAY), @u, NULL),
      (@p_cacao, @l38, 'ingreso', 'donacion', 2.00, DATE_ADD(@lunes, INTERVAL -16 DAY), @u, NULL),
      (@p_queso, @l39, 'ingreso', 'donacion', 4.00, DATE_ADD(@lunes, INTERVAL -16 DAY), @u, NULL),
      (@p_pan, @l35, 'egreso', 'merma', 2.34, DATE_ADD(@lunes, INTERVAL -16 DAY), @u, 'Se descartó: vencido');

    -- Día -15
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_zanahoria, @l12, 'egreso', 'merma', 1.50, DATE_ADD(@lunes, INTERVAL -15 DAY), @u, 'Se descartó: dañada');

    -- Día -14
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Comercio'), 'Verdulería del barrio', DATE_ADD(@lunes, INTERVAL -14 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_papa, 15.00, DATE_ADD(@lunes, INTERVAL 36 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -14 DAY), '10:00:00')); SET @l40 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_papa, 15.00, DATE_ADD(@lunes, INTERVAL 36 DAY), @l40);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_zapallo, 0.00, DATE_ADD(@lunes, INTERVAL 31 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -14 DAY), '10:00:00')); SET @l41 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_zapallo, 15.00, DATE_ADD(@lunes, INTERVAL 31 DAY), @l41);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_zanahoria, 6.00, DATE_ADD(@lunes, INTERVAL 31 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -14 DAY), '10:00:00')); SET @l42 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_zanahoria, 6.00, DATE_ADD(@lunes, INTERVAL 31 DAY), @l42);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_pan, 0.00, DATE_ADD(@lunes, INTERVAL -10 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -14 DAY), '10:00:00')); SET @l43 = LAST_INSERT_ID();
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_papa, @l40, 'ingreso', 'donacion', 15.00, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, NULL),
      (@p_zapallo, @l41, 'ingreso', 'donacion', 15.00, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, NULL),
      (@p_zanahoria, @l42, 'ingreso', 'donacion', 6.00, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, NULL),
      (@p_pan, @l36, 'egreso', 'merma', 8.00, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, 'Se descartó: vencido'),
      (@p_tirabuzon, @l3, 'egreso', 'consumo', 5.90, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_carne, @l30, 'egreso', 'consumo', 3.54, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_pure, @l4, 'egreso', 'consumo', 5.90, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_cebolla, @l18, 'egreso', 'consumo', 1.77, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_yerba, @l14, 'egreso', 'consumo', 0.17, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, 'Menú: Mate cocido con leche y pan'),
      (@p_leche, @l9, 'egreso', 'consumo', 4.95, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, 'Menú: Mate cocido con leche y pan'),
      (@p_azucar, @l15, 'egreso', 'consumo', 0.66, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, 'Menú: Mate cocido con leche y pan'),
      (@p_pan, @l43, 'ingreso', 'compra', 6.00, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, 'Compra'),
      (@p_pan, @l43, 'egreso', 'consumo', 1.98, DATE_ADD(@lunes, INTERVAL -14 DAY), @u, 'Menú: Mate cocido con leche y pan');

    -- Día -13
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_zapallo, @l20, 'egreso', 'consumo', 2.20, DATE_ADD(@lunes, INTERVAL -13 DAY), @u, 'Menú: Locro'),
      (@p_zapallo, @l41, 'egreso', 'consumo', 3.20, DATE_ADD(@lunes, INTERVAL -13 DAY), @u, 'Menú: Locro'),
      (@p_choclo, @l26, 'egreso', 'consumo', 5.40, DATE_ADD(@lunes, INTERVAL -13 DAY), @u, 'Menú: Locro'),
      (@p_carne, @l30, 'egreso', 'consumo', 2.70, DATE_ADD(@lunes, INTERVAL -13 DAY), @u, 'Menú: Locro'),
      (@p_papa, @l10, 'egreso', 'consumo', 2.70, DATE_ADD(@lunes, INTERVAL -13 DAY), @u, 'Menú: Locro'),
      (@p_cebolla, @l18, 'egreso', 'consumo', 1.08, DATE_ADD(@lunes, INTERVAL -13 DAY), @u, 'Menú: Locro');

    -- Día -12
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Estado'), 'Programa alimentario', DATE_ADD(@lunes, INTERVAL -12 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_leche, 14.90, DATE_ADD(@lunes, INTERVAL 48 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -12 DAY), '10:00:00')); SET @l44 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_leche, 36.00, DATE_ADD(@lunes, INTERVAL 48 DAY), @l44);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_huevos, 73.00, DATE_ADD(@lunes, INTERVAL 23 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -12 DAY), '10:00:00')); SET @l45 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_huevos, 90.00, DATE_ADD(@lunes, INTERVAL 23 DAY), @l45);
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_leche, @l44, 'ingreso', 'donacion', 36.00, DATE_ADD(@lunes, INTERVAL -12 DAY), @u, NULL),
      (@p_huevos, @l45, 'ingreso', 'donacion', 90.00, DATE_ADD(@lunes, INTERVAL -12 DAY), @u, NULL),
      (@p_polenta, @l5, 'egreso', 'consumo', 4.40, DATE_ADD(@lunes, INTERVAL -12 DAY), @u, 'Menú: Polenta con salsa'),
      (@p_pure, @l4, 'egreso', 'consumo', 6.60, DATE_ADD(@lunes, INTERVAL -12 DAY), @u, 'Menú: Polenta con salsa'),
      (@p_queso, @l27, 'egreso', 'consumo', 1.10, DATE_ADD(@lunes, INTERVAL -12 DAY), @u, 'Menú: Polenta con salsa'),
      (@p_cebolla, @l18, 'egreso', 'consumo', 1.10, DATE_ADD(@lunes, INTERVAL -12 DAY), @u, 'Menú: Polenta con salsa'),
      (@p_leche, @l9, 'egreso', 'consumo', 6.40, DATE_ADD(@lunes, INTERVAL -12 DAY), @u, 'Menú: Chocolatada con pan'),
      (@p_cacao, @l25, 'egreso', 'consumo', 0.48, DATE_ADD(@lunes, INTERVAL -12 DAY), @u, 'Menú: Chocolatada con pan'),
      (@p_azucar, @l15, 'egreso', 'consumo', 0.48, DATE_ADD(@lunes, INTERVAL -12 DAY), @u, 'Menú: Chocolatada con pan'),
      (@p_pan, @l43, 'egreso', 'consumo', 1.92, DATE_ADD(@lunes, INTERVAL -12 DAY), @u, 'Menú: Chocolatada con pan');

    -- Día -11
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_harina, @l7, 'egreso', 'consumo', 3.48, DATE_ADD(@lunes, INTERVAL -11 DAY), @u, 'Menú: Tarta de zapallo'),
      (@p_huevos, @l34, 'egreso', 'consumo', 41.00, DATE_ADD(@lunes, INTERVAL -11 DAY), @u, 'Menú: Tarta de zapallo'),
      (@p_huevos, @l45, 'egreso', 'consumo', 17.00, DATE_ADD(@lunes, INTERVAL -11 DAY), @u, 'Menú: Tarta de zapallo'),
      (@p_zapallo, @l41, 'egreso', 'consumo', 5.80, DATE_ADD(@lunes, INTERVAL -11 DAY), @u, 'Menú: Tarta de zapallo'),
      (@p_queso, @l27, 'egreso', 'consumo', 0.51, DATE_ADD(@lunes, INTERVAL -11 DAY), @u, 'Menú: Tarta de zapallo'),
      (@p_queso, @l39, 'egreso', 'consumo', 0.65, DATE_ADD(@lunes, INTERVAL -11 DAY), @u, 'Menú: Tarta de zapallo'),
      (@p_aceite, @l8, 'egreso', 'consumo', 0.58, DATE_ADD(@lunes, INTERVAL -11 DAY), @u, 'Menú: Tarta de zapallo');

    -- Día -10
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_arroz, @l1, 'egreso', 'consumo', 4.24, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Menú: Guiso de arroz'),
      (@p_carne, @l30, 'egreso', 'consumo', 2.65, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Menú: Guiso de arroz'),
      (@p_papa, @l10, 'egreso', 'consumo', 0.48, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Menú: Guiso de arroz'),
      (@p_papa, @l17, 'egreso', 'consumo', 3.76, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Menú: Guiso de arroz'),
      (@p_zanahoria, @l12, 'egreso', 'consumo', 1.59, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Menú: Guiso de arroz'),
      (@p_zapallo, @l41, 'egreso', 'consumo', 2.65, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Menú: Guiso de arroz'),
      (@p_leche, @l9, 'egreso', 'consumo', 4.60, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_leche, @l44, 'egreso', 'consumo', 1.40, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_harina, @l7, 'egreso', 'consumo', 1.50, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_aceite, @l8, 'egreso', 'consumo', 0.30, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_azucar, @l15, 'egreso', 'consumo', 0.30, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_lavandina, @l28, 'egreso', 'consumo', 1.00, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Limpieza semanal'),
      (@p_detergente, @l29, 'egreso', 'consumo', 0.75, DATE_ADD(@lunes, INTERVAL -10 DAY), @u, 'Limpieza semanal');

    -- Día -9
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Particular'), 'Vecinos del barrio', DATE_ADD(@lunes, INTERVAL -9 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_lavandina, 5.00, NULL, TIMESTAMP(DATE_ADD(@lunes, INTERVAL -9 DAY), '10:00:00')); SET @l46 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_lavandina, 5.00, NULL, @l46);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_detergente, 5.00, NULL, TIMESTAMP(DATE_ADD(@lunes, INTERVAL -9 DAY), '10:00:00')); SET @l47 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_detergente, 5.00, NULL, @l47);
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_lavandina, @l46, 'ingreso', 'donacion', 5.00, DATE_ADD(@lunes, INTERVAL -9 DAY), @u, NULL),
      (@p_detergente, @l47, 'ingreso', 'donacion', 5.00, DATE_ADD(@lunes, INTERVAL -9 DAY), @u, NULL),
      (@p_pan, @l43, 'egreso', 'merma', 2.10, DATE_ADD(@lunes, INTERVAL -9 DAY), @u, 'Se descartó: vencido');

    -- Día -7
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Comercio'), 'Carnicería', DATE_ADD(@lunes, INTERVAL -7 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_carne, 5.25, DATE_ADD(@lunes, INTERVAL 83 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -7 DAY), '10:00:00')); SET @l48 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_carne, 10.00, DATE_ADD(@lunes, INTERVAL 83 DAY), @l48);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_pollo, 15.00, DATE_ADD(@lunes, INTERVAL 83 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -7 DAY), '10:00:00')); SET @l49 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_pollo, 15.00, DATE_ADD(@lunes, INTERVAL 83 DAY), @l49);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_pan, 0.00, DATE_ADD(@lunes, INTERVAL -3 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -7 DAY), '10:00:00')); SET @l50 = LAST_INSERT_ID();
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_carne, @l48, 'ingreso', 'donacion', 10.00, DATE_ADD(@lunes, INTERVAL -7 DAY), @u, NULL),
      (@p_pollo, @l49, 'ingreso', 'donacion', 15.00, DATE_ADD(@lunes, INTERVAL -7 DAY), @u, NULL),
      (@p_mostachol, @l6, 'egreso', 'consumo', 5.50, DATE_ADD(@lunes, INTERVAL -7 DAY), @u, 'Menú: Mostachol con salsa'),
      (@p_pure, @l4, 'egreso', 'consumo', 6.60, DATE_ADD(@lunes, INTERVAL -7 DAY), @u, 'Menú: Mostachol con salsa'),
      (@p_queso, @l39, 'egreso', 'consumo', 0.55, DATE_ADD(@lunes, INTERVAL -7 DAY), @u, 'Menú: Mostachol con salsa'),
      (@p_cebolla, @l18, 'egreso', 'consumo', 1.10, DATE_ADD(@lunes, INTERVAL -7 DAY), @u, 'Menú: Mostachol con salsa'),
      (@p_yerba, @l14, 'egreso', 'consumo', 0.17, DATE_ADD(@lunes, INTERVAL -7 DAY), @u, 'Menú: Mate cocido con leche y pan'),
      (@p_leche, @l44, 'egreso', 'consumo', 5.10, DATE_ADD(@lunes, INTERVAL -7 DAY), @u, 'Menú: Mate cocido con leche y pan'),
      (@p_azucar, @l15, 'egreso', 'consumo', 0.68, DATE_ADD(@lunes, INTERVAL -7 DAY), @u, 'Menú: Mate cocido con leche y pan'),
      (@p_pan, @l50, 'ingreso', 'compra', 6.00, DATE_ADD(@lunes, INTERVAL -7 DAY), @u, 'Compra'),
      (@p_pan, @l50, 'egreso', 'consumo', 2.04, DATE_ADD(@lunes, INTERVAL -7 DAY), @u, 'Menú: Mate cocido con leche y pan');

    -- Día -6
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_lentejas, @l2, 'egreso', 'consumo', 4.56, DATE_ADD(@lunes, INTERVAL -6 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_papa, @l17, 'egreso', 'consumo', 5.70, DATE_ADD(@lunes, INTERVAL -6 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_cebolla, @l18, 'egreso', 'consumo', 1.71, DATE_ADD(@lunes, INTERVAL -6 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_zanahoria, @l12, 'egreso', 'consumo', 1.71, DATE_ADD(@lunes, INTERVAL -6 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_carne, @l30, 'egreso', 'consumo', 2.28, DATE_ADD(@lunes, INTERVAL -6 DAY), @u, 'Menú: Guiso de lentejas'),
      (@p_pure, @l4, 'egreso', 'consumo', 4.56, DATE_ADD(@lunes, INTERVAL -6 DAY), @u, 'Menú: Guiso de lentejas');

    -- Día -5
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Banco de Alimentos'), 'Entrega quincenal', DATE_ADD(@lunes, INTERVAL -5 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_tirabuzon, 15.00, DATE_ADD(@lunes, INTERVAL 295 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -5 DAY), '10:00:00')); SET @l51 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_tirabuzon, 15.00, DATE_ADD(@lunes, INTERVAL 295 DAY), @l51);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_pure, 18.20, DATE_ADD(@lunes, INTERVAL 360 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -5 DAY), '10:00:00')); SET @l52 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_pure, 24.00, DATE_ADD(@lunes, INTERVAL 360 DAY), @l52);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_lentejas, 10.00, DATE_ADD(@lunes, INTERVAL 360 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -5 DAY), '10:00:00')); SET @l53 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_lentejas, 10.00, DATE_ADD(@lunes, INTERVAL 360 DAY), @l53);
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_tirabuzon, @l51, 'ingreso', 'donacion', 15.00, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, NULL),
      (@p_pure, @l52, 'ingreso', 'donacion', 24.00, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, NULL),
      (@p_lentejas, @l53, 'ingreso', 'donacion', 10.00, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, NULL),
      (@p_arroz, @l1, 'egreso', 'consumo', 4.80, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_pollo, @l21, 'egreso', 'consumo', 5.15, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_pollo, @l31, 'egreso', 'consumo', 3.85, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_cebolla, @l18, 'egreso', 'consumo', 1.80, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_arvejas, @l22, 'egreso', 'consumo', 3.00, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_aceite, @l8, 'egreso', 'consumo', 0.60, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, 'Menú: Arroz con pollo'),
      (@p_leche, @l44, 'egreso', 'consumo', 7.60, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, 'Menú: Chocolatada con pan'),
      (@p_cacao, @l25, 'egreso', 'consumo', 0.57, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, 'Menú: Chocolatada con pan'),
      (@p_azucar, @l15, 'egreso', 'consumo', 0.57, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, 'Menú: Chocolatada con pan'),
      (@p_pan, @l50, 'egreso', 'consumo', 2.28, DATE_ADD(@lunes, INTERVAL -5 DAY), @u, 'Menú: Chocolatada con pan');

    -- Día -4
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_cebolla, 8.17, DATE_ADD(@lunes, INTERVAL 41 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -4 DAY), '10:00:00')); SET @l54 = LAST_INSERT_ID();
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_tirabuzon, @l3, 'egreso', 'consumo', 5.90, DATE_ADD(@lunes, INTERVAL -4 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_carne, @l30, 'egreso', 'consumo', 1.69, DATE_ADD(@lunes, INTERVAL -4 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_carne, @l48, 'egreso', 'consumo', 1.85, DATE_ADD(@lunes, INTERVAL -4 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_pure, @l4, 'egreso', 'consumo', 0.10, DATE_ADD(@lunes, INTERVAL -4 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_pure, @l52, 'egreso', 'consumo', 5.80, DATE_ADD(@lunes, INTERVAL -4 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_cebolla, @l54, 'ingreso', 'compra', 10.00, DATE_ADD(@lunes, INTERVAL -4 DAY), @u, 'Compra'),
      (@p_cebolla, @l18, 'egreso', 'consumo', 1.10, DATE_ADD(@lunes, INTERVAL -4 DAY), @u, 'Menú: Fideos con estofado'),
      (@p_cebolla, @l54, 'egreso', 'consumo', 0.67, DATE_ADD(@lunes, INTERVAL -4 DAY), @u, 'Menú: Fideos con estofado');

    -- Día -3
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_zapallo, 17.55, DATE_ADD(@lunes, INTERVAL 42 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL -3 DAY), '10:00:00')); SET @l55 = LAST_INSERT_ID();
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_zapallo, @l55, 'ingreso', 'compra', 20.00, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Compra'),
      (@p_zapallo, @l41, 'egreso', 'consumo', 3.35, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Menú: Locro'),
      (@p_zapallo, @l55, 'egreso', 'consumo', 2.45, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Menú: Locro'),
      (@p_choclo, @l26, 'egreso', 'consumo', 5.80, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Menú: Locro'),
      (@p_carne, @l48, 'egreso', 'consumo', 2.90, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Menú: Locro'),
      (@p_papa, @l17, 'egreso', 'consumo', 2.90, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Menú: Locro'),
      (@p_cebolla, @l54, 'egreso', 'consumo', 1.16, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Menú: Locro'),
      (@p_leche, @l44, 'egreso', 'consumo', 7.00, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_harina, @l7, 'egreso', 'consumo', 1.75, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_aceite, @l8, 'egreso', 'consumo', 0.35, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_azucar, @l15, 'egreso', 'consumo', 0.35, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Menú: Leche con tortas fritas'),
      (@p_lavandina, @l28, 'egreso', 'consumo', 1.00, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Limpieza semanal'),
      (@p_detergente, @l29, 'egreso', 'consumo', 0.75, DATE_ADD(@lunes, INTERVAL -3 DAY), @u, 'Limpieza semanal');

    -- Día -2
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_pan, @l50, 'egreso', 'merma', 1.68, DATE_ADD(@lunes, INTERVAL -2 DAY), @u, 'Se descartó: vencido');

    -- Día 0
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Estado'), 'Programa alimentario', DATE_ADD(@lunes, INTERVAL 0 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_leche, 24.00, DATE_ADD(@lunes, INTERVAL 60 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL 0 DAY), '10:00:00')); SET @l56 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_leche, 24.00, DATE_ADD(@lunes, INTERVAL 60 DAY), @l56);
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_queso, 3.00, DATE_ADD(@lunes, INTERVAL 5 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL 0 DAY), '10:00:00')); SET @l57 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_queso, 3.00, DATE_ADD(@lunes, INTERVAL 5 DAY), @l57);
    INSERT INTO donacion (origen_id, referencia, fecha, usuario_id, observacion) VALUES ((SELECT id FROM origen_donacion WHERE nombre = 'Comercio'), 'Panadería', DATE_ADD(@lunes, INTERVAL 0 DAY), @u, NULL);
    SET @d = LAST_INSERT_ID();
    INSERT INTO lote_stock (producto_id, cantidad_actual, fecha_vencimiento, creado_en) VALUES (@p_pan, 6.00, DATE_ADD(@lunes, INTERVAL 4 DAY), TIMESTAMP(DATE_ADD(@lunes, INTERVAL 0 DAY), '10:00:00')); SET @l58 = LAST_INSERT_ID();
    INSERT INTO donacion_item (donacion_id, producto_id, cantidad, fecha_vencimiento, lote_id) VALUES (@d, @p_pan, 6.00, DATE_ADD(@lunes, INTERVAL 4 DAY), @l58);
    INSERT INTO movimiento_stock (producto_id, lote_id, tipo, motivo, cantidad, fecha, usuario_id, observacion) VALUES
      (@p_leche, @l56, 'ingreso', 'donacion', 24.00, DATE_ADD(@lunes, INTERVAL 0 DAY), @u, NULL),
      (@p_queso, @l57, 'ingreso', 'donacion', 3.00, DATE_ADD(@lunes, INTERVAL 0 DAY), @u, NULL),
      (@p_pan, @l58, 'ingreso', 'donacion', 6.00, DATE_ADD(@lunes, INTERVAL 0 DAY), @u, NULL);

    -- Menús
    -- Guiso de lentejas
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -28 DAY), 'almuerzo', 'Guiso de lentejas', 47, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -28 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_lentejas AS p, 0.0800 AS c
      UNION ALL SELECT @p_papa, 0.1000
      UNION ALL SELECT @p_cebolla, 0.0300
      UNION ALL SELECT @p_zanahoria, 0.0300
      UNION ALL SELECT @p_carne, 0.0400
      UNION ALL SELECT @p_pure, 0.0800
    ) x WHERE @m IS NOT NULL;
    -- Mate cocido con leche y pan
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -28 DAY), 'merienda', 'Mate cocido con leche y pan', 26, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -28 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_yerba AS p, 0.0050 AS c
      UNION ALL SELECT @p_leche, 0.1500
      UNION ALL SELECT @p_azucar, 0.0200
      UNION ALL SELECT @p_pan, 0.0600
    ) x WHERE @m IS NOT NULL;
    -- Arroz con pollo
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -27 DAY), 'almuerzo', 'Arroz con pollo', 48, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -27 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_arroz AS p, 0.0800 AS c
      UNION ALL SELECT @p_pollo, 0.1500
      UNION ALL SELECT @p_cebolla, 0.0300
      UNION ALL SELECT @p_arvejas, 0.0500
      UNION ALL SELECT @p_aceite, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Fideos con estofado
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -26 DAY), 'almuerzo', 'Fideos con estofado', 48, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -26 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_tirabuzon AS p, 0.1000 AS c
      UNION ALL SELECT @p_carne, 0.0600
      UNION ALL SELECT @p_pure, 0.1000
      UNION ALL SELECT @p_cebolla, 0.0300
    ) x WHERE @m IS NOT NULL;
    -- Chocolatada con pan
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -26 DAY), 'merienda', 'Chocolatada con pan', 28, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -26 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_leche AS p, 0.2000 AS c
      UNION ALL SELECT @p_cacao, 0.0150
      UNION ALL SELECT @p_azucar, 0.0150
      UNION ALL SELECT @p_pan, 0.0600
    ) x WHERE @m IS NOT NULL;
    -- Locro
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -25 DAY), 'almuerzo', 'Locro', 52, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -25 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_zapallo AS p, 0.1000 AS c
      UNION ALL SELECT @p_choclo, 0.1000
      UNION ALL SELECT @p_carne, 0.0500
      UNION ALL SELECT @p_papa, 0.0500
      UNION ALL SELECT @p_cebolla, 0.0200
    ) x WHERE @m IS NOT NULL;
    -- Polenta con salsa
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -24 DAY), 'almuerzo', 'Polenta con salsa', 45, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -24 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_polenta AS p, 0.0800 AS c
      UNION ALL SELECT @p_pure, 0.1200
      UNION ALL SELECT @p_queso, 0.0200
      UNION ALL SELECT @p_cebolla, 0.0200
    ) x WHERE @m IS NOT NULL;
    -- Leche con tortas fritas
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -24 DAY), 'merienda', 'Leche con tortas fritas', 28, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -24 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_leche AS p, 0.2000 AS c
      UNION ALL SELECT @p_harina, 0.0500
      UNION ALL SELECT @p_aceite, 0.0100
      UNION ALL SELECT @p_azucar, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Tarta de zapallo
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -21 DAY), 'almuerzo', 'Tarta de zapallo', 49, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -21 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_harina AS p, 0.0600 AS c
      UNION ALL SELECT @p_huevos, 1.0000
      UNION ALL SELECT @p_zapallo, 0.1000
      UNION ALL SELECT @p_queso, 0.0200
      UNION ALL SELECT @p_aceite, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Mate cocido con leche y pan
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -21 DAY), 'merienda', 'Mate cocido con leche y pan', 29, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -21 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_yerba AS p, 0.0050 AS c
      UNION ALL SELECT @p_leche, 0.1500
      UNION ALL SELECT @p_azucar, 0.0200
      UNION ALL SELECT @p_pan, 0.0600
    ) x WHERE @m IS NOT NULL;
    -- Guiso de arroz
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -20 DAY), 'almuerzo', 'Guiso de arroz', 54, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -20 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_arroz AS p, 0.0800 AS c
      UNION ALL SELECT @p_carne, 0.0500
      UNION ALL SELECT @p_papa, 0.0800
      UNION ALL SELECT @p_zanahoria, 0.0300
      UNION ALL SELECT @p_zapallo, 0.0500
    ) x WHERE @m IS NOT NULL;
    -- Mostachol con salsa
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -19 DAY), 'almuerzo', 'Mostachol con salsa', 51, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -19 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_mostachol AS p, 0.1000 AS c
      UNION ALL SELECT @p_pure, 0.1200
      UNION ALL SELECT @p_queso, 0.0100
      UNION ALL SELECT @p_cebolla, 0.0200
    ) x WHERE @m IS NOT NULL;
    -- Chocolatada con pan
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -19 DAY), 'merienda', 'Chocolatada con pan', 32, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -19 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_leche AS p, 0.2000 AS c
      UNION ALL SELECT @p_cacao, 0.0150
      UNION ALL SELECT @p_azucar, 0.0150
      UNION ALL SELECT @p_pan, 0.0600
    ) x WHERE @m IS NOT NULL;
    -- Guiso de lentejas
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -18 DAY), 'almuerzo', 'Guiso de lentejas', 52, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -18 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_lentejas AS p, 0.0800 AS c
      UNION ALL SELECT @p_papa, 0.1000
      UNION ALL SELECT @p_cebolla, 0.0300
      UNION ALL SELECT @p_zanahoria, 0.0300
      UNION ALL SELECT @p_carne, 0.0400
      UNION ALL SELECT @p_pure, 0.0800
    ) x WHERE @m IS NOT NULL;
    -- Arroz con pollo
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -17 DAY), 'almuerzo', 'Arroz con pollo', 51, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -17 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_arroz AS p, 0.0800 AS c
      UNION ALL SELECT @p_pollo, 0.1500
      UNION ALL SELECT @p_cebolla, 0.0300
      UNION ALL SELECT @p_arvejas, 0.0500
      UNION ALL SELECT @p_aceite, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Leche con tortas fritas
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -17 DAY), 'merienda', 'Leche con tortas fritas', 31, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -17 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_leche AS p, 0.2000 AS c
      UNION ALL SELECT @p_harina, 0.0500
      UNION ALL SELECT @p_aceite, 0.0100
      UNION ALL SELECT @p_azucar, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Fideos con estofado
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -14 DAY), 'almuerzo', 'Fideos con estofado', 59, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -14 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_tirabuzon AS p, 0.1000 AS c
      UNION ALL SELECT @p_carne, 0.0600
      UNION ALL SELECT @p_pure, 0.1000
      UNION ALL SELECT @p_cebolla, 0.0300
    ) x WHERE @m IS NOT NULL;
    -- Mate cocido con leche y pan
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -14 DAY), 'merienda', 'Mate cocido con leche y pan', 33, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -14 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_yerba AS p, 0.0050 AS c
      UNION ALL SELECT @p_leche, 0.1500
      UNION ALL SELECT @p_azucar, 0.0200
      UNION ALL SELECT @p_pan, 0.0600
    ) x WHERE @m IS NOT NULL;
    -- Locro
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -13 DAY), 'almuerzo', 'Locro', 54, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -13 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_zapallo AS p, 0.1000 AS c
      UNION ALL SELECT @p_choclo, 0.1000
      UNION ALL SELECT @p_carne, 0.0500
      UNION ALL SELECT @p_papa, 0.0500
      UNION ALL SELECT @p_cebolla, 0.0200
    ) x WHERE @m IS NOT NULL;
    -- Polenta con salsa
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -12 DAY), 'almuerzo', 'Polenta con salsa', 55, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -12 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_polenta AS p, 0.0800 AS c
      UNION ALL SELECT @p_pure, 0.1200
      UNION ALL SELECT @p_queso, 0.0200
      UNION ALL SELECT @p_cebolla, 0.0200
    ) x WHERE @m IS NOT NULL;
    -- Chocolatada con pan
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -12 DAY), 'merienda', 'Chocolatada con pan', 32, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -12 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_leche AS p, 0.2000 AS c
      UNION ALL SELECT @p_cacao, 0.0150
      UNION ALL SELECT @p_azucar, 0.0150
      UNION ALL SELECT @p_pan, 0.0600
    ) x WHERE @m IS NOT NULL;
    -- Tarta de zapallo
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -11 DAY), 'almuerzo', 'Tarta de zapallo', 58, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -11 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_harina AS p, 0.0600 AS c
      UNION ALL SELECT @p_huevos, 1.0000
      UNION ALL SELECT @p_zapallo, 0.1000
      UNION ALL SELECT @p_queso, 0.0200
      UNION ALL SELECT @p_aceite, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Guiso de arroz
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -10 DAY), 'almuerzo', 'Guiso de arroz', 53, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -10 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_arroz AS p, 0.0800 AS c
      UNION ALL SELECT @p_carne, 0.0500
      UNION ALL SELECT @p_papa, 0.0800
      UNION ALL SELECT @p_zanahoria, 0.0300
      UNION ALL SELECT @p_zapallo, 0.0500
    ) x WHERE @m IS NOT NULL;
    -- Leche con tortas fritas
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -10 DAY), 'merienda', 'Leche con tortas fritas', 30, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -10 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_leche AS p, 0.2000 AS c
      UNION ALL SELECT @p_harina, 0.0500
      UNION ALL SELECT @p_aceite, 0.0100
      UNION ALL SELECT @p_azucar, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Mostachol con salsa
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -7 DAY), 'almuerzo', 'Mostachol con salsa', 55, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -7 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_mostachol AS p, 0.1000 AS c
      UNION ALL SELECT @p_pure, 0.1200
      UNION ALL SELECT @p_queso, 0.0100
      UNION ALL SELECT @p_cebolla, 0.0200
    ) x WHERE @m IS NOT NULL;
    -- Mate cocido con leche y pan
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -7 DAY), 'merienda', 'Mate cocido con leche y pan', 34, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -7 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_yerba AS p, 0.0050 AS c
      UNION ALL SELECT @p_leche, 0.1500
      UNION ALL SELECT @p_azucar, 0.0200
      UNION ALL SELECT @p_pan, 0.0600
    ) x WHERE @m IS NOT NULL;
    -- Guiso de lentejas
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -6 DAY), 'almuerzo', 'Guiso de lentejas', 57, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -6 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_lentejas AS p, 0.0800 AS c
      UNION ALL SELECT @p_papa, 0.1000
      UNION ALL SELECT @p_cebolla, 0.0300
      UNION ALL SELECT @p_zanahoria, 0.0300
      UNION ALL SELECT @p_carne, 0.0400
      UNION ALL SELECT @p_pure, 0.0800
    ) x WHERE @m IS NOT NULL;
    -- Arroz con pollo
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -5 DAY), 'almuerzo', 'Arroz con pollo', 60, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -5 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_arroz AS p, 0.0800 AS c
      UNION ALL SELECT @p_pollo, 0.1500
      UNION ALL SELECT @p_cebolla, 0.0300
      UNION ALL SELECT @p_arvejas, 0.0500
      UNION ALL SELECT @p_aceite, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Chocolatada con pan
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -5 DAY), 'merienda', 'Chocolatada con pan', 38, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -5 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_leche AS p, 0.2000 AS c
      UNION ALL SELECT @p_cacao, 0.0150
      UNION ALL SELECT @p_azucar, 0.0150
      UNION ALL SELECT @p_pan, 0.0600
    ) x WHERE @m IS NOT NULL;
    -- Fideos con estofado
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -4 DAY), 'almuerzo', 'Fideos con estofado', 59, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -4 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_tirabuzon AS p, 0.1000 AS c
      UNION ALL SELECT @p_carne, 0.0600
      UNION ALL SELECT @p_pure, 0.1000
      UNION ALL SELECT @p_cebolla, 0.0300
    ) x WHERE @m IS NOT NULL;
    -- Locro
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -3 DAY), 'almuerzo', 'Locro', 58, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -3 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_zapallo AS p, 0.1000 AS c
      UNION ALL SELECT @p_choclo, 0.1000
      UNION ALL SELECT @p_carne, 0.0500
      UNION ALL SELECT @p_papa, 0.0500
      UNION ALL SELECT @p_cebolla, 0.0200
    ) x WHERE @m IS NOT NULL;
    -- Leche con tortas fritas
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL -3 DAY), 'merienda', 'Leche con tortas fritas', 35, 'confirmado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL -3 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_leche AS p, 0.2000 AS c
      UNION ALL SELECT @p_harina, 0.0500
      UNION ALL SELECT @p_aceite, 0.0100
      UNION ALL SELECT @p_azucar, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Polenta con salsa
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 0 DAY), 'almuerzo', 'Polenta con salsa', 64, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 0 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_polenta AS p, 0.0800 AS c
      UNION ALL SELECT @p_pure, 0.1200
      UNION ALL SELECT @p_queso, 0.0200
      UNION ALL SELECT @p_cebolla, 0.0200
    ) x WHERE @m IS NOT NULL;
    -- Mate cocido con leche y pan
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 0 DAY), 'merienda', 'Mate cocido con leche y pan', 38, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 0 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_yerba AS p, 0.0050 AS c
      UNION ALL SELECT @p_leche, 0.1500
      UNION ALL SELECT @p_azucar, 0.0200
      UNION ALL SELECT @p_pan, 0.0600
    ) x WHERE @m IS NOT NULL;
    -- Tarta de zapallo
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 1 DAY), 'almuerzo', 'Tarta de zapallo', 63, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 1 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_harina AS p, 0.0600 AS c
      UNION ALL SELECT @p_huevos, 1.0000
      UNION ALL SELECT @p_zapallo, 0.1000
      UNION ALL SELECT @p_queso, 0.0200
      UNION ALL SELECT @p_aceite, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Guiso de arroz
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 2 DAY), 'almuerzo', 'Guiso de arroz', 65, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 2 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_arroz AS p, 0.0800 AS c
      UNION ALL SELECT @p_carne, 0.0500
      UNION ALL SELECT @p_papa, 0.0800
      UNION ALL SELECT @p_zanahoria, 0.0300
      UNION ALL SELECT @p_zapallo, 0.0500
    ) x WHERE @m IS NOT NULL;
    -- Chocolatada con pan
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 2 DAY), 'merienda', 'Chocolatada con pan', 39, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 2 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_leche AS p, 0.2000 AS c
      UNION ALL SELECT @p_cacao, 0.0150
      UNION ALL SELECT @p_azucar, 0.0150
      UNION ALL SELECT @p_pan, 0.0600
    ) x WHERE @m IS NOT NULL;
    -- Mostachol con salsa
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 3 DAY), 'almuerzo', 'Mostachol con salsa', 60, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 3 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_mostachol AS p, 0.1000 AS c
      UNION ALL SELECT @p_pure, 0.1200
      UNION ALL SELECT @p_queso, 0.0100
      UNION ALL SELECT @p_cebolla, 0.0200
    ) x WHERE @m IS NOT NULL;
    -- Guiso de lentejas
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 4 DAY), 'almuerzo', 'Guiso de lentejas', 65, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 4 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_lentejas AS p, 0.0800 AS c
      UNION ALL SELECT @p_papa, 0.1000
      UNION ALL SELECT @p_cebolla, 0.0300
      UNION ALL SELECT @p_zanahoria, 0.0300
      UNION ALL SELECT @p_carne, 0.0400
      UNION ALL SELECT @p_pure, 0.0800
    ) x WHERE @m IS NOT NULL;
    -- Leche con tortas fritas
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 4 DAY), 'merienda', 'Leche con tortas fritas', 40, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 4 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_leche AS p, 0.2000 AS c
      UNION ALL SELECT @p_harina, 0.0500
      UNION ALL SELECT @p_aceite, 0.0100
      UNION ALL SELECT @p_azucar, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Arroz con pollo
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 7 DAY), 'almuerzo', 'Arroz con pollo', 61, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 7 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_arroz AS p, 0.0800 AS c
      UNION ALL SELECT @p_pollo, 0.1500
      UNION ALL SELECT @p_cebolla, 0.0300
      UNION ALL SELECT @p_arvejas, 0.0500
      UNION ALL SELECT @p_aceite, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Mate cocido con leche y pan
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 7 DAY), 'merienda', 'Mate cocido con leche y pan', 38, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 7 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_yerba AS p, 0.0050 AS c
      UNION ALL SELECT @p_leche, 0.1500
      UNION ALL SELECT @p_azucar, 0.0200
      UNION ALL SELECT @p_pan, 0.0600
    ) x WHERE @m IS NOT NULL;
    -- Fideos con estofado
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 8 DAY), 'almuerzo', 'Fideos con estofado', 60, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 8 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_tirabuzon AS p, 0.1000 AS c
      UNION ALL SELECT @p_carne, 0.0600
      UNION ALL SELECT @p_pure, 0.1000
      UNION ALL SELECT @p_cebolla, 0.0300
    ) x WHERE @m IS NOT NULL;
    -- Locro
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 9 DAY), 'almuerzo', 'Locro', 61, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 9 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_zapallo AS p, 0.1000 AS c
      UNION ALL SELECT @p_choclo, 0.1000
      UNION ALL SELECT @p_carne, 0.0500
      UNION ALL SELECT @p_papa, 0.0500
      UNION ALL SELECT @p_cebolla, 0.0200
    ) x WHERE @m IS NOT NULL;
    -- Chocolatada con pan
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 9 DAY), 'merienda', 'Chocolatada con pan', 38, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 9 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_leche AS p, 0.2000 AS c
      UNION ALL SELECT @p_cacao, 0.0150
      UNION ALL SELECT @p_azucar, 0.0150
      UNION ALL SELECT @p_pan, 0.0600
    ) x WHERE @m IS NOT NULL;
    -- Polenta con salsa
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 10 DAY), 'almuerzo', 'Polenta con salsa', 67, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 10 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_polenta AS p, 0.0800 AS c
      UNION ALL SELECT @p_pure, 0.1200
      UNION ALL SELECT @p_queso, 0.0200
      UNION ALL SELECT @p_cebolla, 0.0200
    ) x WHERE @m IS NOT NULL;
    -- Tarta de zapallo
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 11 DAY), 'almuerzo', 'Tarta de zapallo', 62, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 11 DAY) AND servicio = 'almuerzo');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_harina AS p, 0.0600 AS c
      UNION ALL SELECT @p_huevos, 1.0000
      UNION ALL SELECT @p_zapallo, 0.1000
      UNION ALL SELECT @p_queso, 0.0200
      UNION ALL SELECT @p_aceite, 0.0100
    ) x WHERE @m IS NOT NULL;
    -- Leche con tortas fritas
    INSERT INTO menu (fecha, servicio, nombre_plato, raciones_planificadas, estado)
      SELECT DATE_ADD(@lunes, INTERVAL 11 DAY), 'merienda', 'Leche con tortas fritas', 35, 'planificado' FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM menu WHERE fecha = DATE_ADD(@lunes, INTERVAL 11 DAY) AND servicio = 'merienda');
    SET @m = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
    INSERT INTO menu_insumo (menu_id, producto_id, cantidad_por_racion) SELECT @m, x.p, x.c FROM (
      SELECT @p_leche AS p, 0.2000 AS c
      UNION ALL SELECT @p_harina, 0.0500
      UNION ALL SELECT @p_aceite, 0.0100
      UNION ALL SELECT @p_azucar, 0.0100
    ) x WHERE @m IS NOT NULL;

    -- Raciones
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 50, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -28 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 28, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -28 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 50, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -27 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 51, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -26 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 29, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -26 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 54, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -25 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 48, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -24 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 25, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -24 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 48, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -21 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 28, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -21 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 57, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -20 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 52, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -19 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 32, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -19 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 55, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -18 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 53, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -17 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 30, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -17 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 59, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -14 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 33, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -14 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 53, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -13 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 57, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -12 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 33, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -12 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 57, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -11 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 54, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -10 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 32, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -10 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 53, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -7 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 31, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -7 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 54, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -6 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 62, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -5 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 35, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -5 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 62, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -4 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 55, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -3 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 35, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL -3 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 64, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL 0 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 40, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL 0 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 60, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL 1 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 67, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL 2 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 40, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL 2 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 61, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL 3 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'almuerzo', 68, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL 4 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'almuerzo');
    INSERT INTO racion_diaria (fecha, servicio, cantidad, usuario_id, observacion)
      SELECT x.f, 'merienda', 41, @u, NULL FROM (SELECT DATE_ADD(@lunes, INTERVAL 4 DAY) AS f) x
      WHERE x.f < CURDATE() AND NOT EXISTS (SELECT 1 FROM racion_diaria r WHERE r.fecha = x.f AND r.servicio = 'merienda');

    -- Turnos
    INSERT INTO turno (fecha, servicio, tarea, voluntario_id) VALUES
      (DATE_ADD(@lunes, INTERVAL -28 DAY), 'almuerzo', 'cocina', @v0),
      (DATE_ADD(@lunes, INTERVAL -28 DAY), 'almuerzo', 'cocina', @v1),
      (DATE_ADD(@lunes, INTERVAL -28 DAY), 'almuerzo', 'servicio', @v5),
      (DATE_ADD(@lunes, INTERVAL -28 DAY), 'almuerzo', 'servicio', @v6),
      (DATE_ADD(@lunes, INTERVAL -28 DAY), 'merienda', 'cocina', @v4),
      (DATE_ADD(@lunes, INTERVAL -28 DAY), 'merienda', 'servicio', @v9),
      (DATE_ADD(@lunes, INTERVAL -27 DAY), 'almuerzo', 'cocina', @v4),
      (DATE_ADD(@lunes, INTERVAL -27 DAY), 'almuerzo', 'cocina', @v5),
      (DATE_ADD(@lunes, INTERVAL -27 DAY), 'almuerzo', 'servicio', @v9),
      (DATE_ADD(@lunes, INTERVAL -27 DAY), 'almuerzo', 'servicio', @v0),
      (DATE_ADD(@lunes, INTERVAL -26 DAY), 'almuerzo', 'cocina', @v6),
      (DATE_ADD(@lunes, INTERVAL -26 DAY), 'almuerzo', 'cocina', @v7),
      (DATE_ADD(@lunes, INTERVAL -26 DAY), 'almuerzo', 'servicio', @v1),
      (DATE_ADD(@lunes, INTERVAL -26 DAY), 'almuerzo', 'servicio', @v2),
      (DATE_ADD(@lunes, INTERVAL -26 DAY), 'merienda', 'cocina', @v7),
      (DATE_ADD(@lunes, INTERVAL -26 DAY), 'merienda', 'servicio', @v2),
      (DATE_ADD(@lunes, INTERVAL -25 DAY), 'almuerzo', 'cocina', @v0),
      (DATE_ADD(@lunes, INTERVAL -25 DAY), 'almuerzo', 'cocina', @v1),
      (DATE_ADD(@lunes, INTERVAL -25 DAY), 'almuerzo', 'servicio', @v5),
      (DATE_ADD(@lunes, INTERVAL -25 DAY), 'almuerzo', 'servicio', @v6),
      (DATE_ADD(@lunes, INTERVAL -24 DAY), 'almuerzo', 'cocina', @v2),
      (DATE_ADD(@lunes, INTERVAL -24 DAY), 'almuerzo', 'cocina', @v3),
      (DATE_ADD(@lunes, INTERVAL -24 DAY), 'almuerzo', 'servicio', @v7),
      (DATE_ADD(@lunes, INTERVAL -24 DAY), 'almuerzo', 'servicio', @v8),
      (DATE_ADD(@lunes, INTERVAL -24 DAY), 'merienda', 'cocina', @v0),
      (DATE_ADD(@lunes, INTERVAL -24 DAY), 'merienda', 'servicio', @v5),
      (DATE_ADD(@lunes, INTERVAL -21 DAY), 'almuerzo', 'cocina', @v6),
      (DATE_ADD(@lunes, INTERVAL -21 DAY), 'almuerzo', 'cocina', @v7),
      (DATE_ADD(@lunes, INTERVAL -21 DAY), 'almuerzo', 'servicio', @v1),
      (DATE_ADD(@lunes, INTERVAL -21 DAY), 'almuerzo', 'servicio', @v2),
      (DATE_ADD(@lunes, INTERVAL -21 DAY), 'merienda', 'cocina', @v2),
      (DATE_ADD(@lunes, INTERVAL -21 DAY), 'merienda', 'servicio', @v7),
      (DATE_ADD(@lunes, INTERVAL -20 DAY), 'almuerzo', 'cocina', @v0),
      (DATE_ADD(@lunes, INTERVAL -20 DAY), 'almuerzo', 'cocina', @v1),
      (DATE_ADD(@lunes, INTERVAL -20 DAY), 'almuerzo', 'servicio', @v5),
      (DATE_ADD(@lunes, INTERVAL -20 DAY), 'almuerzo', 'servicio', @v6),
      (DATE_ADD(@lunes, INTERVAL -19 DAY), 'almuerzo', 'cocina', @v2),
      (DATE_ADD(@lunes, INTERVAL -19 DAY), 'almuerzo', 'cocina', @v3),
      (DATE_ADD(@lunes, INTERVAL -19 DAY), 'almuerzo', 'servicio', @v7),
      (DATE_ADD(@lunes, INTERVAL -19 DAY), 'almuerzo', 'servicio', @v8),
      (DATE_ADD(@lunes, INTERVAL -19 DAY), 'merienda', 'cocina', @v5),
      (DATE_ADD(@lunes, INTERVAL -19 DAY), 'merienda', 'servicio', @v0),
      (DATE_ADD(@lunes, INTERVAL -18 DAY), 'almuerzo', 'cocina', @v6),
      (DATE_ADD(@lunes, INTERVAL -18 DAY), 'almuerzo', 'cocina', @v7),
      (DATE_ADD(@lunes, INTERVAL -18 DAY), 'almuerzo', 'servicio', @v1),
      (DATE_ADD(@lunes, INTERVAL -18 DAY), 'almuerzo', 'servicio', @v2),
      (DATE_ADD(@lunes, INTERVAL -17 DAY), 'almuerzo', 'cocina', @v8),
      (DATE_ADD(@lunes, INTERVAL -17 DAY), 'almuerzo', 'cocina', @v9),
      (DATE_ADD(@lunes, INTERVAL -17 DAY), 'almuerzo', 'servicio', @v3),
      (DATE_ADD(@lunes, INTERVAL -17 DAY), 'almuerzo', 'servicio', @v4),
      (DATE_ADD(@lunes, INTERVAL -17 DAY), 'merienda', 'cocina', @v8),
      (DATE_ADD(@lunes, INTERVAL -17 DAY), 'merienda', 'servicio', @v3),
      (DATE_ADD(@lunes, INTERVAL -14 DAY), 'almuerzo', 'cocina', @v2),
      (DATE_ADD(@lunes, INTERVAL -14 DAY), 'almuerzo', 'cocina', @v3),
      (DATE_ADD(@lunes, INTERVAL -14 DAY), 'almuerzo', 'servicio', @v7),
      (DATE_ADD(@lunes, INTERVAL -14 DAY), 'almuerzo', 'servicio', @v8),
      (DATE_ADD(@lunes, INTERVAL -14 DAY), 'merienda', 'cocina', @v0),
      (DATE_ADD(@lunes, INTERVAL -14 DAY), 'merienda', 'servicio', @v5),
      (DATE_ADD(@lunes, INTERVAL -13 DAY), 'almuerzo', 'cocina', @v6),
      (DATE_ADD(@lunes, INTERVAL -13 DAY), 'almuerzo', 'cocina', @v7),
      (DATE_ADD(@lunes, INTERVAL -13 DAY), 'almuerzo', 'servicio', @v1),
      (DATE_ADD(@lunes, INTERVAL -13 DAY), 'almuerzo', 'servicio', @v2),
      (DATE_ADD(@lunes, INTERVAL -12 DAY), 'almuerzo', 'cocina', @v8),
      (DATE_ADD(@lunes, INTERVAL -12 DAY), 'almuerzo', 'cocina', @v9),
      (DATE_ADD(@lunes, INTERVAL -12 DAY), 'almuerzo', 'servicio', @v3),
      (DATE_ADD(@lunes, INTERVAL -12 DAY), 'almuerzo', 'servicio', @v4),
      (DATE_ADD(@lunes, INTERVAL -12 DAY), 'merienda', 'cocina', @v3),
      (DATE_ADD(@lunes, INTERVAL -12 DAY), 'merienda', 'servicio', @v8),
      (DATE_ADD(@lunes, INTERVAL -11 DAY), 'almuerzo', 'cocina', @v2),
      (DATE_ADD(@lunes, INTERVAL -11 DAY), 'almuerzo', 'cocina', @v3),
      (DATE_ADD(@lunes, INTERVAL -11 DAY), 'almuerzo', 'servicio', @v7),
      (DATE_ADD(@lunes, INTERVAL -11 DAY), 'almuerzo', 'servicio', @v8),
      (DATE_ADD(@lunes, INTERVAL -10 DAY), 'almuerzo', 'cocina', @v4),
      (DATE_ADD(@lunes, INTERVAL -10 DAY), 'almuerzo', 'cocina', @v5),
      (DATE_ADD(@lunes, INTERVAL -10 DAY), 'almuerzo', 'servicio', @v9),
      (DATE_ADD(@lunes, INTERVAL -10 DAY), 'almuerzo', 'servicio', @v0),
      (DATE_ADD(@lunes, INTERVAL -10 DAY), 'merienda', 'cocina', @v6),
      (DATE_ADD(@lunes, INTERVAL -10 DAY), 'merienda', 'servicio', @v1),
      (DATE_ADD(@lunes, INTERVAL -7 DAY), 'almuerzo', 'cocina', @v8),
      (DATE_ADD(@lunes, INTERVAL -7 DAY), 'almuerzo', 'cocina', @v9),
      (DATE_ADD(@lunes, INTERVAL -7 DAY), 'almuerzo', 'servicio', @v3),
      (DATE_ADD(@lunes, INTERVAL -7 DAY), 'almuerzo', 'servicio', @v4),
      (DATE_ADD(@lunes, INTERVAL -7 DAY), 'merienda', 'cocina', @v8),
      (DATE_ADD(@lunes, INTERVAL -7 DAY), 'merienda', 'servicio', @v3),
      (DATE_ADD(@lunes, INTERVAL -6 DAY), 'almuerzo', 'cocina', @v2),
      (DATE_ADD(@lunes, INTERVAL -6 DAY), 'almuerzo', 'cocina', @v3),
      (DATE_ADD(@lunes, INTERVAL -6 DAY), 'almuerzo', 'servicio', @v7),
      (DATE_ADD(@lunes, INTERVAL -6 DAY), 'almuerzo', 'servicio', @v8),
      (DATE_ADD(@lunes, INTERVAL -5 DAY), 'almuerzo', 'cocina', @v4),
      (DATE_ADD(@lunes, INTERVAL -5 DAY), 'almuerzo', 'cocina', @v5),
      (DATE_ADD(@lunes, INTERVAL -5 DAY), 'almuerzo', 'servicio', @v9),
      (DATE_ADD(@lunes, INTERVAL -5 DAY), 'almuerzo', 'servicio', @v0),
      (DATE_ADD(@lunes, INTERVAL -5 DAY), 'merienda', 'cocina', @v1),
      (DATE_ADD(@lunes, INTERVAL -5 DAY), 'merienda', 'servicio', @v6),
      (DATE_ADD(@lunes, INTERVAL -4 DAY), 'almuerzo', 'cocina', @v8),
      (DATE_ADD(@lunes, INTERVAL -4 DAY), 'almuerzo', 'cocina', @v9),
      (DATE_ADD(@lunes, INTERVAL -4 DAY), 'almuerzo', 'servicio', @v3),
      (DATE_ADD(@lunes, INTERVAL -4 DAY), 'almuerzo', 'servicio', @v4),
      (DATE_ADD(@lunes, INTERVAL -3 DAY), 'almuerzo', 'cocina', @v0),
      (DATE_ADD(@lunes, INTERVAL -3 DAY), 'almuerzo', 'cocina', @v1),
      (DATE_ADD(@lunes, INTERVAL -3 DAY), 'almuerzo', 'servicio', @v5),
      (DATE_ADD(@lunes, INTERVAL -3 DAY), 'almuerzo', 'servicio', @v6),
      (DATE_ADD(@lunes, INTERVAL -3 DAY), 'merienda', 'cocina', @v4),
      (DATE_ADD(@lunes, INTERVAL -3 DAY), 'merienda', 'servicio', @v9),
      (DATE_ADD(@lunes, INTERVAL 0 DAY), 'almuerzo', 'cocina', @v4),
      (DATE_ADD(@lunes, INTERVAL 0 DAY), 'almuerzo', 'cocina', @v5),
      (DATE_ADD(@lunes, INTERVAL 0 DAY), 'almuerzo', 'servicio', @v9),
      (DATE_ADD(@lunes, INTERVAL 0 DAY), 'almuerzo', 'servicio', @v0),
      (DATE_ADD(@lunes, INTERVAL 0 DAY), 'merienda', 'cocina', @v6),
      (DATE_ADD(@lunes, INTERVAL 0 DAY), 'merienda', 'servicio', @v1),
      (DATE_ADD(@lunes, INTERVAL 1 DAY), 'almuerzo', 'cocina', @v8),
      (DATE_ADD(@lunes, INTERVAL 1 DAY), 'almuerzo', 'cocina', @v9),
      (DATE_ADD(@lunes, INTERVAL 1 DAY), 'almuerzo', 'servicio', @v3),
      (DATE_ADD(@lunes, INTERVAL 1 DAY), 'almuerzo', 'servicio', @v4),
      (DATE_ADD(@lunes, INTERVAL 2 DAY), 'almuerzo', 'cocina', @v0),
      (DATE_ADD(@lunes, INTERVAL 2 DAY), 'almuerzo', 'cocina', @v1),
      (DATE_ADD(@lunes, INTERVAL 2 DAY), 'almuerzo', 'servicio', @v5),
      (DATE_ADD(@lunes, INTERVAL 2 DAY), 'almuerzo', 'servicio', @v6),
      (DATE_ADD(@lunes, INTERVAL 2 DAY), 'merienda', 'cocina', @v9),
      (DATE_ADD(@lunes, INTERVAL 2 DAY), 'merienda', 'servicio', @v4),
      (DATE_ADD(@lunes, INTERVAL 3 DAY), 'almuerzo', 'cocina', @v4),
      (DATE_ADD(@lunes, INTERVAL 3 DAY), 'almuerzo', 'cocina', @v5),
      (DATE_ADD(@lunes, INTERVAL 3 DAY), 'almuerzo', 'servicio', @v9),
      (DATE_ADD(@lunes, INTERVAL 3 DAY), 'almuerzo', 'servicio', @v0),
      (DATE_ADD(@lunes, INTERVAL 4 DAY), 'almuerzo', 'cocina', @v6),
      (DATE_ADD(@lunes, INTERVAL 4 DAY), 'almuerzo', 'cocina', @v7),
      (DATE_ADD(@lunes, INTERVAL 4 DAY), 'almuerzo', 'servicio', @v1),
      (DATE_ADD(@lunes, INTERVAL 4 DAY), 'almuerzo', 'servicio', @v2),
      (DATE_ADD(@lunes, INTERVAL 4 DAY), 'merienda', 'cocina', @v2),
      (DATE_ADD(@lunes, INTERVAL 4 DAY), 'merienda', 'servicio', @v7),
      (DATE_ADD(@lunes, INTERVAL 7 DAY), 'almuerzo', 'cocina', @v0),
      (DATE_ADD(@lunes, INTERVAL 7 DAY), 'almuerzo', 'cocina', @v1),
      (DATE_ADD(@lunes, INTERVAL 7 DAY), 'almuerzo', 'servicio', @v5),
      (DATE_ADD(@lunes, INTERVAL 7 DAY), 'almuerzo', 'servicio', @v6),
      (DATE_ADD(@lunes, INTERVAL 7 DAY), 'merienda', 'cocina', @v4),
      (DATE_ADD(@lunes, INTERVAL 7 DAY), 'merienda', 'servicio', @v9),
      (DATE_ADD(@lunes, INTERVAL 8 DAY), 'almuerzo', 'cocina', @v4),
      (DATE_ADD(@lunes, INTERVAL 8 DAY), 'almuerzo', 'cocina', @v5),
      (DATE_ADD(@lunes, INTERVAL 8 DAY), 'almuerzo', 'servicio', @v9),
      (DATE_ADD(@lunes, INTERVAL 8 DAY), 'almuerzo', 'servicio', @v0),
      (DATE_ADD(@lunes, INTERVAL 9 DAY), 'almuerzo', 'cocina', @v6),
      (DATE_ADD(@lunes, INTERVAL 9 DAY), 'almuerzo', 'cocina', @v7),
      (DATE_ADD(@lunes, INTERVAL 9 DAY), 'almuerzo', 'servicio', @v1),
      (DATE_ADD(@lunes, INTERVAL 9 DAY), 'almuerzo', 'servicio', @v2),
      (DATE_ADD(@lunes, INTERVAL 9 DAY), 'merienda', 'cocina', @v7),
      (DATE_ADD(@lunes, INTERVAL 9 DAY), 'merienda', 'servicio', @v2),
      (DATE_ADD(@lunes, INTERVAL 10 DAY), 'almuerzo', 'cocina', @v0),
      (DATE_ADD(@lunes, INTERVAL 10 DAY), 'almuerzo', 'cocina', @v1),
      (DATE_ADD(@lunes, INTERVAL 10 DAY), 'almuerzo', 'servicio', @v5),
      (DATE_ADD(@lunes, INTERVAL 10 DAY), 'almuerzo', 'servicio', @v6),
      (DATE_ADD(@lunes, INTERVAL 11 DAY), 'almuerzo', 'cocina', @v2),
      (DATE_ADD(@lunes, INTERVAL 11 DAY), 'almuerzo', 'cocina', @v3),
      (DATE_ADD(@lunes, INTERVAL 11 DAY), 'almuerzo', 'servicio', @v7),
      (DATE_ADD(@lunes, INTERVAL 11 DAY), 'almuerzo', 'servicio', @v8),
      (DATE_ADD(@lunes, INTERVAL 11 DAY), 'merienda', 'cocina', @v0),
      (DATE_ADD(@lunes, INTERVAL 11 DAY), 'merienda', 'servicio', @v5);

    COMMIT;
  END;
END //
DELIMITER ;

CALL cargar_datos_iniciales();
DROP PROCEDURE IF EXISTS cargar_datos_iniciales;

-- Resumen
SELECT 'producto' AS tabla, COUNT(*) AS filas FROM producto
UNION ALL SELECT 'voluntario', COUNT(*) FROM voluntario
UNION ALL SELECT 'donacion', COUNT(*) FROM donacion
UNION ALL SELECT 'lote_stock', COUNT(*) FROM lote_stock
UNION ALL SELECT 'movimiento_stock', COUNT(*) FROM movimiento_stock
UNION ALL SELECT 'menu', COUNT(*) FROM menu
UNION ALL SELECT 'racion_diaria', COUNT(*) FROM racion_diaria
UNION ALL SELECT 'turno', COUNT(*) FROM turno;
