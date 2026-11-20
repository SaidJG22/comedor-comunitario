const bcrypt = require('bcryptjs');
const authModel = require('../models/auth.model.js');
const usuariosModel = require('../models/usuarios.model.js');
const { generarToken } = require('../middlewares/auth.js');

// Ingresar
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const usuario = await authModel.buscarPorEmail(email.toLowerCase());
    // Mensaje único
    const correcta = usuario && (await bcrypt.compare(password, usuario.password_hash));
    if (!correcta) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    // Cuenta pendiente
    if (!usuario.activo) {
      return res.status(403).json({ error: 'Tu cuenta todavía no está activa: el administrador del comedor tiene que activarla.' });
    }
    res.status(200).json({
      token: generarToken(usuario),
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
    });
  } catch (error) {
    next(error);
  }
};

// Registro
const registro = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await authModel.crearPendiente({ nombre, email: email.toLowerCase(), hash });
    res.status(201).json({ pendiente: true });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya hay una cuenta con ese correo.' });
    }
    next(error);
  }
};

// Cambiar contraseña
const cambiarPassword = async (req, res, next) => {
  try {
    const { actual, nueva } = req.body;
    const hash = await authModel.hashDeUsuarioActivo(req.user.id);
    if (!hash || !(await bcrypt.compare(actual, hash))) {
      return res.status(400).json({ error: 'La contraseña actual no es correcta' });
    }
    await usuariosModel.cambiarHash(req.user.id, await bcrypt.hash(nueva, 10));
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, registro, cambiarPassword };
