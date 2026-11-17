

CREATE USER IF NOT EXISTS 'mesa_app'@'localhost' IDENTIFIED BY 'CAMBIAR_ESTA_CLAVE';


GRANT SELECT, INSERT, UPDATE, DELETE ON mesa_abierta.* TO 'mesa_app'@'localhost';

FLUSH PRIVILEGES;

-- verificacion
SHOW GRANTS FOR 'mesa_app'@'localhost';
