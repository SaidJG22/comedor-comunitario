import { ZodError } from 'zod';

const CODIGOS_BASE_NO_DISPONIBLE = new Set([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'PROTOCOL_CONNECTION_LOST',
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
  'ER_CON_COUNT_ERROR',
]);

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(_req, _res, next) {
  next(new HttpError(404, 'Recurso no encontrado'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: err.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, detalles: err.details });
  }
  if (err?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  // Clave foránea inexistente (ej.: producto u origen que no existe)
  if (err?.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Hace referencia a un registro que no existe' });
  }
  // Base de datos inaccesible: se informa sin exponer detalles internos (el detalle va al registro del servidor).
  if (CODIGOS_BASE_NO_DISPONIBLE.has(err?.code)) {
    console.error(`Base de datos no disponible (${err.code}): ${err.message}`);
    return res.status(503).json({ error: 'El servicio de base de datos no está disponible. Intentá de nuevo en unos minutos.' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}
