const express = require('express');
const router = express.Router();
const {
  getOrigenes,
  getDonaciones,
  getDonacion,
  postDonacion,
  putDonacion,
  deleteDonacion,
} = require('../controllers/donaciones.controllers.js');
const { validate, validarId } = require('../middlewares/validate.js');
const { checkRole, ROLES } = require('../middlewares/auth.js');
const { donacionSchema } = require('../schemas/donacionSchema.js');
const { rangoQuery } = require('../schemas/comunes.js');

const gestion = checkRole(ROLES.ADMIN, ROLES.RESPONSABLE);

router.param('id', validarId);

router.get('/origenes', getOrigenes);
router.get('/', validate(rangoQuery, 'query'), getDonaciones);
router.get('/:id', getDonacion);
router.post('/', gestion, validate(donacionSchema), postDonacion);
router.put('/:id', gestion, validate(donacionSchema), putDonacion);
router.delete('/:id', gestion, deleteDonacion);

module.exports = router;
