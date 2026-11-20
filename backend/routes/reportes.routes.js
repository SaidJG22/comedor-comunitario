const express = require('express');
const router = express.Router();
const { getRaciones, getConsumoInsumos, getDonaciones, getTablero } = require('../controllers/reportes.controllers.js');
const { validate } = require('../middlewares/validate.js');
const { checkRole, ROLES } = require('../middlewares/auth.js');
const { periodo, periodoOrdenado } = require('../schemas/reporteSchema.js');

// Solo gestión
router.use(checkRole(ROLES.ADMIN, ROLES.RESPONSABLE));

router.get('/raciones', validate(periodo, 'query'), getRaciones);
router.get('/consumo-insumos', validate(periodo, 'query'), getConsumoInsumos);
router.get('/donaciones', validate(periodo, 'query'), getDonaciones);
router.get('/tablero', validate(periodoOrdenado, 'query'), getTablero);

module.exports = router;
