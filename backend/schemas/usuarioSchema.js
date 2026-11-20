const { z } = require('zod');
const { ROLES } = require('../middlewares/auth.js');

const rol = z.enum([ROLES.ADMIN, ROLES.RESPONSABLE, ROLES.VOLUNTARIO]);

const usuarioSchema = z.object({
  nombre: z.string().trim().min(1, { message: 'Escribí el nombre' }).max(80),
  email: z.email({ message: 'Escribí un correo válido' }).max(120),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }).max(72),
  rol,
});

const cambioUsuarioSchema = z
  .object({
    nombre: z.string().trim().min(1, { message: 'Escribí el nombre' }).max(80).optional(),
    email: z.email({ message: 'Escribí un correo válido' }).max(120).optional(),
    activo: z.boolean().optional(),
    rol: rol.optional(),
  })
  .strict()
  .refine((d) => Object.values(d).some((v) => v !== undefined), { message: 'Indicá qué querés cambiar' });

const passwordSchema = z
  .object({
    password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }).max(72),
  })
  .strict();

module.exports = { usuarioSchema, cambioUsuarioSchema, passwordSchema };
