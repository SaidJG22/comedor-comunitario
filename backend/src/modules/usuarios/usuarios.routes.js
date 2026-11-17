import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { idParam, validate } from '../../middleware/validate.js';
import { HttpError } from '../../middleware/errors.js';
import { ROLES } from '../../middleware/auth.js';

const usuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  email: z.email().max(120),
  password: z.string().min(8).max(72),
  rol: z.enum([ROLES.ADMIN, ROLES.RESPONSABLE, ROLES.VOLUNTARIO]),
});

const cambioSchema = z
  .object({
    activo: z.boolean().optional(),
    rol: z.enum([ROLES.ADMIN, ROLES.RESPONSABLE, ROLES.VOLUNTARIO]).optional(),
  })
  .strict()
  .refine((d) => d.activo !== undefined || d.rol !== undefined, { message: 'Indicá activo o rol' });

export function usuariosRoutes({ db, auth }) {
  const r = Router();
  r.use(auth.requireRole(ROLES.ADMIN));

  r.get('/', async (_req, res) =>
    res.json(
      await db.query(
        `SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo
         FROM usuario u JOIN rol r ON r.id = u.rol_id ORDER BY u.nombre`,
      ),
    ),
  );

  // Activar/desactivar o cambiar el rol. Un administrador no puede modificarse a sí mismo
  // (evita quedarse sin acceso de administración).
  r.patch('/:id', validate(cambioSchema), async (req, res) => {
    const id = idParam.parse(req.params.id);
    if (id === req.user.id) throw new HttpError(409, 'No podés cambiar tu propio usuario');
    const { activo, rol } = req.valid;

    const sets = [];
    const params = [];
    if (activo !== undefined) {
      sets.push('activo = ?');
      params.push(activo);
    }
    if (rol !== undefined) {
      sets.push('rol_id = (SELECT id FROM rol WHERE nombre = ?)');
      params.push(rol);
    }
    const out = await db.query(`UPDATE usuario SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
    if (out.affectedRows === 0) throw new HttpError(404, 'Usuario no encontrado');
    res.json({ id, ...req.valid });
  });

  // Restablecer la contraseña de un usuario que la olvidó.
  r.patch('/:id/password', validate(z.object({ password: z.string().min(8).max(72) }).strict()), async (req, res) => {
    const id = idParam.parse(req.params.id);
    const hash = await bcrypt.hash(req.valid.password, 10);
    const out = await db.query('UPDATE usuario SET password_hash = ? WHERE id = ?', [hash, id]);
    if (out.affectedRows === 0) throw new HttpError(404, 'Usuario no encontrado');
    res.json({ ok: true });
  });

  r.post('/', validate(usuarioSchema), async (req, res) => {
    const { nombre, email, password, rol } = req.valid;
    const hash = await bcrypt.hash(password, 10);
    const out = await db.query(
      'INSERT INTO usuario (nombre, email, password_hash, rol_id) SELECT ?, ?, ?, id FROM rol WHERE nombre = ?',
      [nombre, email.toLowerCase(), hash, rol],
    );
    res.status(201).json({ id: out.insertId });
  });

  return r;
}
