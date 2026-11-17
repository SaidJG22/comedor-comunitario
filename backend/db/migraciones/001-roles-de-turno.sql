-- Migración 001: roles dentro de cada turno ("¿Qué va a hacer?": cocinero/a principal, ayudante, servir, etc.)
--
-- PARA BASES YA CREADAS. Ejecutar UNA SOLA VEZ en MySQL Workbench, conectado como root al servidor
-- MySQL 8.x de localhost:3306 (File > Open SQL Script... > botón del rayo).
-- Si la ejecutás dos veces, la segunda falla con "Duplicate column name 'funcion_id'": no pasa nada,
-- significa que ya estaba aplicada.
-- Las instalaciones nuevas NO necesitan este archivo: ya está incluido en schema.sql.
--
-- No borra ni cambia los turnos existentes: solo agrega una columna opcional (NULL = "sin rol específico").

USE mesa_abierta;

-- Catálogo de roles de turno, editable desde la aplicación.
CREATE TABLE IF NOT EXISTS funcion_turno (
  id     SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(40) NOT NULL UNIQUE,
  tarea  ENUM('cocina','servicio') NOT NULL,   -- en qué grupo aparece al asignar
  activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- Cada turno puede indicar el rol que cumple la persona.
ALTER TABLE turno
  ADD COLUMN funcion_id SMALLINT UNSIGNED NULL AFTER tarea,
  ADD CONSTRAINT fk_turno_funcion FOREIGN KEY (funcion_id) REFERENCES funcion_turno (id);

-- Roles comunes precargados (el Responsable puede agregar o quitar los suyos).
INSERT IGNORE INTO funcion_turno (nombre, tarea) VALUES
  ('Cocinero/a principal', 'cocina'),
  ('Ayudante de cocina',   'cocina'),
  ('Pelar y cortar',       'cocina'),
  ('Recibir mercadería',   'cocina'),
  ('Servir',               'servicio'),
  ('Entregar raciones',    'servicio'),
  ('Lavar platos',         'servicio'),
  ('Limpieza',             'servicio');

-- Verificación (opcional): debe mostrar 8 roles y la columna funcion_id en turno.
SELECT id, nombre, tarea FROM funcion_turno ORDER BY tarea, id;
SHOW COLUMNS FROM turno;
