// Validación con zod
const validate = (schema, origen = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[origen]);

  if (!result.success) {
    return res.status(400).json({
      error: 'Datos inválidos',
      errors: result.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  if (origen === 'body') req.body = result.data;
  else req.filtros = result.data;
  next();
};

// Id numérico
const validarId = (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({ error: 'Id inválido' });
  }
  next();
};

module.exports = { validate, validarId };
