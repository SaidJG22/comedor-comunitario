const express = require('express');
const router = express.Router();
const { login, registro, cambiarPassword } = require('../controllers/auth.controllers.js');
const { validate } = require('../middlewares/validate.js');
const { verifyToken } = require('../middlewares/auth.js');
const { loginSchema, registroSchema, cambioPasswordSchema } = require('../schemas/authSchema.js');

router.post('/login', validate(loginSchema), login);
router.post('/registro', validate(registroSchema), registro);
router.patch('/password', verifyToken, validate(cambioPasswordSchema), cambiarPassword);

module.exports = router;
