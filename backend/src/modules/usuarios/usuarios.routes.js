import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../middleware/auth.js';
import { crearUsuariosController } from './usuarios.controller.js';

const rol = z.enum([ROLES.ADMIN, ROLES.RESPONSABLE, ROLES.VOLUNTARIO]);

const usuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  email: z.email().max(120),
  password: z.string().min(8).max(72),
  rol,
});

const cambioSchema = z
  .object({
    nombre: z.string().trim().min(1).max(80).optional(),
    email: z.email().max(120).optional(),
    activo: z.boolean().optional(),
    rol: rol.optional(),
  })
  .strict()
  .refine((d) => Object.values(d).some((v) => v !== undefined), { message: 'Indicá qué querés cambiar' });

const passwordSchema = z.object({ password: z.string().min(8).max(72) }).strict();

// Solo Administrador
export function usuariosRoutes({ db, auth }) {
  const r = Router();
  const c = crearUsuariosController({ db });
  r.use(auth.requireRole(ROLES.ADMIN));

  r.get('/', c.listar);
  r.get('/:id', c.obtener);
  r.patch('/:id', validate(cambioSchema), c.cambiar);
  r.delete('/:id', c.borrar); // sin registros
  r.patch('/:id/password', validate(passwordSchema), c.restablecerPassword);
  r.post('/', validate(usuarioSchema), c.crear);

  return r;
}
