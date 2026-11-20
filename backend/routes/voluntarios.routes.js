const express = require('express');
const router = express.Router();
const {
  getVoluntarios,
  getVoluntario,
  postVoluntario,
  patchVoluntario,
  deleteVoluntario,
  getTurnos,
  postTurno,
  deleteTurno,
} = require('../controllers/voluntarios.controllers.js');
const { validate, validarId } = require('../middlewares/validate.js');
const { checkRole, ROLES } = require('../middlewares/auth.js');
const { voluntarioSchema, cambioVoluntarioSchema, turnoSchema, listaQuery } = require('../schemas/voluntarioSchema.js');
const { rangoQuery } = require('../schemas/comunes.js');

const gestion = checkRole(ROLES.ADMIN, ROLES.RESPONSABLE);

router.param('id', validarId);

// Voluntarios
router.get('/', validate(listaQuery, 'query'), getVoluntarios);
router.post('/', gestion, validate(voluntarioSchema), postVoluntario);
router.patch('/:id', gestion, validate(cambioVoluntarioSchema), patchVoluntario);
router.delete('/:id', gestion, deleteVoluntario);

// Turnos
router.get('/turnos', validate(rangoQuery, 'query'), getTurnos);
router.post('/turnos', gestion, validate(turnoSchema), postTurno);
router.delete('/turnos/:id', gestion, deleteTurno);

// Después de /turnos
router.get('/:id', getVoluntario);

module.exports = router;
