-- Renombrar base

CREATE DATABASE IF NOT EXISTS cometuc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tablas
RENAME TABLE
  mesa_abierta.rol              TO cometuc.rol,
  mesa_abierta.usuario          TO cometuc.usuario,
  mesa_abierta.categoria        TO cometuc.categoria,
  mesa_abierta.producto         TO cometuc.producto,
  mesa_abierta.lote_stock       TO cometuc.lote_stock,
  mesa_abierta.movimiento_stock TO cometuc.movimiento_stock,
  mesa_abierta.origen_donacion  TO cometuc.origen_donacion,
  mesa_abierta.donacion         TO cometuc.donacion,
  mesa_abierta.donacion_item    TO cometuc.donacion_item,
  mesa_abierta.menu             TO cometuc.menu,
  mesa_abierta.menu_insumo      TO cometuc.menu_insumo,
  mesa_abierta.racion_diaria    TO cometuc.racion_diaria,
  mesa_abierta.voluntario       TO cometuc.voluntario,
  mesa_abierta.turno            TO cometuc.turno;

-- Usuario y permisos
RENAME USER 'mesa_app'@'localhost' TO 'cometuc_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON cometuc.* TO 'cometuc_app'@'localhost';
REVOKE SELECT, INSERT, UPDATE, DELETE ON mesa_abierta.* FROM 'cometuc_app'@'localhost';
FLUSH PRIVILEGES;

-- Borrar base vieja
SET @paso = IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'mesa_abierta') = 0,
               'DROP DATABASE IF EXISTS mesa_abierta', 'DO 0');
PREPARE paso FROM @paso;
EXECUTE paso;
DEALLOCATE PREPARE paso;

-- Verificación
SELECT table_schema AS base, COUNT(*) AS tablas FROM information_schema.tables
WHERE table_schema IN ('cometuc', 'mesa_abierta') GROUP BY table_schema;
SELECT COUNT(*) AS claves_foraneas FROM information_schema.referential_constraints WHERE constraint_schema = 'cometuc';
SHOW GRANTS FOR 'cometuc_app'@'localhost';
