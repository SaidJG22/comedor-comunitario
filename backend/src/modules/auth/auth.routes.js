import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { crearAuthController } from './auth.controller.js';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const cambioSchema = z
  .object({
    actual: z.string().min(1),
    nueva: z.string().min(8, 'La contraseña nueva debe tener al menos 8 caracteres').max(72),
  })
  .strict()
  .refine((d) => d.actual !== d.nueva, { path: ['nueva'], message: 'La contraseña nueva debe ser distinta de la actual' });

const registroSchema = z
  .object({
    nombre: z.string().trim().min(1, 'Escribí tu nombre').max(80),
    email: z.email().max(120),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
  })
  .strict();

export function authRoutes({ db, auth }) {
  const r = Router();
  const c = crearAuthController({ db, auth });

  r.post('/login', validate(loginSchema), c.login);
  r.post('/registro', validate(registroSchema), c.registro);
  r.patch('/password', auth.requireAuth, validate(cambioSchema), c.cambiarPassword);

  return r;
}
