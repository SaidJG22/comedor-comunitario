
CREATE DATABASE IF NOT EXISTS cometuc
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cometuc;

-- Usuarios y roles
CREATE TABLE rol (
  id     TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE usuario (
  id            INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre        VARCHAR(80)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  rol_id        TINYINT UNSIGNED NOT NULL,
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES rol (id)
) ENGINE=InnoDB;

-- Stock
CREATE TABLE categoria (
  id     SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE producto (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre       VARCHAR(80) NOT NULL,
  categoria_id SMALLINT UNSIGNED NULL,
  unidad       ENUM('kg','g','l','ml','unidad') NOT NULL DEFAULT 'kg',
  stock_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
  activo       BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_producto_nombre (nombre),
  CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categoria (id)
) ENGINE=InnoDB;

CREATE TABLE lote_stock (
  id                INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  producto_id       INT UNSIGNED NOT NULL,
  cantidad_actual   DECIMAL(10,2) NOT NULL CHECK (cantidad_actual >= 0),
  fecha_vencimiento DATE NULL,
  creado_en         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_lote_producto (producto_id),
  KEY ix_lote_vencimiento (fecha_vencimiento),
  CONSTRAINT fk_lote_producto FOREIGN KEY (producto_id) REFERENCES producto (id)
) ENGINE=InnoDB;

CREATE TABLE movimiento_stock (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  producto_id INT UNSIGNED NOT NULL,
  lote_id     INT UNSIGNED NULL,
  tipo        ENUM('ingreso','egreso') NOT NULL,
  motivo      ENUM('donacion','compra','consumo','merma','ajuste') NOT NULL,
  cantidad    DECIMAL(10,2) NOT NULL CHECK (cantidad > 0),
  fecha       DATE NOT NULL,
  usuario_id  INT UNSIGNED NOT NULL,
  observacion VARCHAR(200) NULL,
  KEY ix_mov_producto_fecha (producto_id, fecha),
  CONSTRAINT fk_mov_producto FOREIGN KEY (producto_id) REFERENCES producto (id),
  CONSTRAINT fk_mov_lote     FOREIGN KEY (lote_id)     REFERENCES lote_stock (id),
  CONSTRAINT fk_mov_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuario (id)
) ENGINE=InnoDB;

-- Donaciones
CREATE TABLE origen_donacion (
  id     TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(40) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE donacion (
  id          INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  origen_id   TINYINT UNSIGNED NOT NULL,
  -- Sin datos personales
  referencia  VARCHAR(100) NULL,
  fecha       DATE NOT NULL,
  usuario_id  INT UNSIGNED NOT NULL,
  observacion VARCHAR(200) NULL,
  KEY ix_donacion_fecha (fecha),
  CONSTRAINT fk_donacion_origen  FOREIGN KEY (origen_id)  REFERENCES origen_donacion (id),
  CONSTRAINT fk_donacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB;

CREATE TABLE donacion_item (
  id                INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  donacion_id       INT UNSIGNED NOT NULL,
  producto_id       INT UNSIGNED NOT NULL,
  cantidad          DECIMAL(10,2) NOT NULL CHECK (cantidad > 0),
  fecha_vencimiento DATE NULL,
  lote_id           INT UNSIGNED NULL,
  CONSTRAINT fk_ditem_donacion FOREIGN KEY (donacion_id) REFERENCES donacion (id) ON DELETE CASCADE,
  CONSTRAINT fk_ditem_producto FOREIGN KEY (producto_id) REFERENCES producto (id),
  CONSTRAINT fk_ditem_lote     FOREIGN KEY (lote_id)     REFERENCES lote_stock (id)
) ENGINE=InnoDB;

-- Menús
CREATE TABLE menu (
  id                    INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  fecha                 DATE NOT NULL,
  servicio              ENUM('almuerzo','merienda') NOT NULL,
  nombre_plato          VARCHAR(100) NOT NULL,
  raciones_planificadas INT UNSIGNED NOT NULL,
  estado                ENUM('planificado','confirmado') NOT NULL DEFAULT 'planificado',
  UNIQUE KEY uq_menu_fecha_servicio (fecha, servicio)
) ENGINE=InnoDB;

CREATE TABLE menu_insumo (
  id                  INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  menu_id             INT UNSIGNED NOT NULL,
  producto_id         INT UNSIGNED NOT NULL,
  cantidad_por_racion DECIMAL(10,4) NOT NULL CHECK (cantidad_por_racion > 0),
  CONSTRAINT fk_minsumo_menu     FOREIGN KEY (menu_id)     REFERENCES menu (id) ON DELETE CASCADE,
  CONSTRAINT fk_minsumo_producto FOREIGN KEY (producto_id) REFERENCES producto (id)
) ENGINE=InnoDB;

-- Raciones
CREATE TABLE racion_diaria (
  id          INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  fecha       DATE NOT NULL,
  servicio    ENUM('almuerzo','merienda') NOT NULL,
  cantidad    INT UNSIGNED NOT NULL,
  usuario_id  INT UNSIGNED NOT NULL,
  observacion VARCHAR(200) NULL,
  UNIQUE KEY uq_racion_fecha_servicio (fecha, servicio),
  CONSTRAINT fk_racion_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB;

-- Voluntarios y turnos
CREATE TABLE voluntario (
  id             INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre_visible VARCHAR(80) NOT NULL,     -- nombre o apodo
  activo         BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE turno (
  id            INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  fecha         DATE NOT NULL,
  servicio      ENUM('almuerzo','merienda') NOT NULL,
  tarea         ENUM('cocina','servicio') NOT NULL,
  voluntario_id INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_turno (fecha, servicio, tarea, voluntario_id),
  CONSTRAINT fk_turno_voluntario FOREIGN KEY (voluntario_id) REFERENCES voluntario (id)
) ENGINE=InnoDB;
