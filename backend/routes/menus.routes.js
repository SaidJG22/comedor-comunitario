const express = require('express');
const router = express.Router();
const { getMenus, getMenu, postMenu, putMenu, deleteMenu, confirmarMenu } = require('../controllers/menus.controllers.js');
const { validate, validarId } = require('../middlewares/validate.js');
const { checkRole, ROLES } = require('../middlewares/auth.js');
const { menuSchema } = require('../schemas/menuSchema.js');
const { rangoQuery } = require('../schemas/comunes.js');

const gestion = checkRole(ROLES.ADMIN, ROLES.RESPONSABLE);

router.param('id', validarId);

router.get('/', validate(rangoQuery, 'query'), getMenus);
router.get('/:id', getMenu);
router.post('/', gestion, validate(menuSchema), postMenu);
router.put('/:id', gestion, validate(menuSchema), putMenu);
router.delete('/:id', gestion, deleteMenu);
router.post('/:id/confirmar', gestion, confirmarMenu);

module.exports = router;
