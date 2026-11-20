const { z } = require('zod');

const loginSchema = z.object({
  email: z.email({ message: 'Escribí un correo válido' }),
  password: z.string().min(1, { message: 'Escribí tu contraseña' }),
});

const registroSchema = z
  .object({
    nombre: z.string().trim().min(1, { message: 'Escribí tu nombre' }).max(80),
    email: z.email({ message: 'Escribí un correo válido' }).max(120),
    password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }).max(72),
  })
  .strict();

const cambioPasswordSchema = z
  .object({
    actual: z.string().min(1, { message: 'Escribí tu contraseña actual' }),
    nueva: z.string().min(8, { message: 'La contraseña nueva debe tener al menos 8 caracteres' }).max(72),
  })
  .strict()
  .refine((d) => d.actual !== d.nueva, {
    path: ['nueva'],
    message: 'La contraseña nueva debe ser distinta de la actual',
  });

module.exports = { loginSchema, registroSchema, cambioPasswordSchema };
