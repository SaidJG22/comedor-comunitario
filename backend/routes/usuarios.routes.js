const express = require('express');
const router = express.Router();
const {
  getUsuarios,
  getUsuario,
  postUsuario,
  patchUsuario,
  deleteUsuario,
  patchPassword,
} = require('../controllers/usuarios.controllers.js');
const { validate, validarId } = require('../middlewares/validate.js');
const { checkRole, ROLES } = require('../middlewares/auth.js');
const { usuarioSchema, cambioUsuarioSchema, passwordSchema } = require('../schemas/usuarioSchema.js');

// Solo Administrador
router.use(checkRole(ROLES.ADMIN));
router.param('id', validarId);

router.get('/', getUsuarios);
router.get('/:id', getUsuario);
router.post('/', validate(usuarioSchema), postUsuario);
router.patch('/:id', validate(cambioUsuarioSchema), patchUsuario);
router.delete('/:id', deleteUsuario);
router.patch('/:id/password', validate(passwordSchema), patchPassword);

module.exports = router;
