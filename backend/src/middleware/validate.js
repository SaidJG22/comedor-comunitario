import { z } from 'zod';

/** Identificador numérico de una ruta (/:id). Lanza ZodError (→ 400) si no es válido. */
export const idParam = z.coerce.number().int().positive();

/** Valida body/query con un esquema zod y deja el resultado en req.valid. */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    req.valid = result.data;
    return next();
  };
