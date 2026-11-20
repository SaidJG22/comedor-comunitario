const bcrypt = require('bcryptjs');
const usuariosModel = require('../models/usuarios.model.js');

const getUsuarios = async (req, res, next) => {
  try {
    res.status(200).json(await usuariosModel.listar());
  } catch (error) {
    next(error);
  }
};

const getUsuario = async (req, res, next) => {
  try {
    const usuario = await usuariosModel.obtener(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
};

const postUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const id = await usuariosModel.crear({ nombre, email: email.toLowerCase(), hash, rol });
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

// Editar usuario
const patchUsuario = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nombre, email, activo, rol } = req.body;
    if (id === req.user.id && (activo !== undefined || rol !== undefined)) {
      return res.status(409).json({ error: 'No podés cambiar tu propio rol ni desactivarte' });
    }
    const cambiados = await usuariosModel.cambiar(id, { nombre, email: email?.toLowerCase(), activo, rol });
    if (cambiados === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json({ id, ...req.body });
  } catch (error) {
    next(error);
  }
};

const deleteUsuario = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (id === req.user.id) {
      return res.status(409).json({ error: 'No podés borrar tu propia cuenta' });
    }
    await usuariosModel.borrar(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// Restablecer contraseña
const patchPassword = async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const cambiados = await usuariosModel.cambiarHash(req.params.id, hash);
    if (cambiados === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsuarios, getUsuario, postUsuario, patchUsuario, deleteUsuario, patchPassword };
