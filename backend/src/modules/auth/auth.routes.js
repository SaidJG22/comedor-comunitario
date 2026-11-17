import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { validate } from '../../middleware/validate.js';
import { HttpError } from '../../middleware/errors.js';

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

export function authRoutes({ db, auth }) {
  const r = Router();

  r.post('/login', validate(loginSchema), async (req, res) => {
    const { email, password } = req.valid;
    const [u] = await db.query(
      `SELECT u.id, u.nombre, u.password_hash, u.activo, r.nombre AS rol
       FROM usuario u JOIN rol r ON r.id = u.rol_id WHERE u.email = ?`,
      [email.toLowerCase()],
    );
    // Mensaje único para no revelar si el correo existe.
    const valido = u?.activo && (await bcrypt.compare(password, u.password_hash));
    if (!valido) throw new HttpError(401, 'Credenciales incorrectas');

    res.json({
      token: auth.signToken(u),
      usuario: { id: u.id, nombre: u.nombre, rol: u.rol },
    });
  });

  // Cambio de la propia contraseña (requiere sesión y la contraseña actual).
  r.patch('/password', auth.requireAuth, validate(cambioSchema), async (req, res) => {
    const { actual, nueva } = req.valid;
    const [u] = await db.query('SELECT password_hash FROM usuario WHERE id = ? AND activo = TRUE', [req.user.id]);
    if (!u || !(await bcrypt.compare(actual, u.password_hash))) {
      throw new HttpError(400, 'La contraseña actual no es correcta');
    }
    const hash = await bcrypt.hash(nueva, 10);
    await db.query('UPDATE usuario SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ ok: true });
  });

  return r;
}
