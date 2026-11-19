import { z } from 'zod';

/** Id numérico */
export const idParam = z.coerce.number().int().positive();

/** Validación zod */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    req.valid = result.data;
    return next();
  };
