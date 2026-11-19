

CREATE USER IF NOT EXISTS 'cometuc_app'@'localhost' IDENTIFIED BY 'CAMBIAR_ESTA_CLAVE';


GRANT SELECT, INSERT, UPDATE, DELETE ON cometuc.* TO 'cometuc_app'@'localhost';

FLUSH PRIVILEGES;

-- Verificación
SHOW GRANTS FOR 'cometuc_app'@'localhost';
