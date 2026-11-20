const { ZodError } = require('zod');

const BASE_NO_DISPONIBLE = [
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'PROTOCOL_CONNECTION_LOST',
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
  'ER_CON_COUNT_ERROR',
];

// Error con código HTTP
class HttpError extends Error {
  constructor(status, message, detalles) {
    super(message);
    this.status = status;
    this.detalles = detalles;
  }
}

// Ruta inexistente
const notFound = (req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
};

// Manejo de errores
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      errors: err.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, detalles: err.detalles });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Hace referencia a un registro que no existe' });
  }
  if (BASE_NO_DISPONIBLE.includes(err.code)) {
    console.error(`Base de datos no disponible (${err.code}): ${err.message}`);
    return res.status(503).json({ error: 'El servicio de base de datos no está disponible. Intentá de nuevo en unos minutos.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
};

module.exports = { HttpError, notFound, errorHandler };
