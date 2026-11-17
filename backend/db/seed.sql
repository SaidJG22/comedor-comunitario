USE mesa_abierta;

INSERT INTO rol (nombre) VALUES ('Administrador'), ('Responsable'), ('Voluntario');

INSERT INTO origen_donacion (nombre) VALUES
  ('Estado'), ('Banco de Alimentos'), ('Particular'), ('Comercio');

INSERT INTO categoria (nombre) VALUES
  ('Secos'), ('Frescos'), ('Lácteos'), ('Conservas'), ('Limpieza');

-- Roles que puede cumplir una persona en un turno 
INSERT INTO funcion_turno (nombre, tarea) VALUES
  ('Cocinero/a principal', 'cocina'),
  ('Ayudante de cocina',   'cocina'),
  ('Pelar y cortar',       'cocina'),
  ('Recibir mercadería',   'cocina'),
  ('Servir',               'servicio'),
  ('Entregar raciones',    'servicio'),
  ('Lavar platos',         'servicio'),
  ('Limpieza',             'servicio');


