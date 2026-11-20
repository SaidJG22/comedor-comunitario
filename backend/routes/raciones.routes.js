const express = require('express');
const router = express.Router();
const { putRaciones, getRaciones, deleteRaciones } = require('../controllers/raciones.controllers.js');
const { validate, validarId } = require('../middlewares/validate.js');
const { checkRole, ROLES } = require('../middlewares/auth.js');
const { racionSchema } = require('../schemas/racionSchema.js');
const { rangoQuery } = require('../schemas/comunes.js');

router.param('id', validarId);

// Todos los roles
router.put('/', validate(racionSchema), putRaciones);
router.get('/', validate(rangoQuery, 'query'), getRaciones);
// Solo gestión
router.delete('/:id', checkRole(ROLES.ADMIN, ROLES.RESPONSABLE), deleteRaciones);

module.exports = router;
