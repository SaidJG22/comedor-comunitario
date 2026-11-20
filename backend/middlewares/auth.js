const jwt = require('jsonwebtoken');
const { conection } = require('../config/db.js');

const ROLES = {
  ADMIN: 'Administrador',
  RESPONSABLE: 'Responsable',
  VOLUNTARIO: 'Voluntario',
};

const secreto = () => process.env.JWT_SECRET || 'solo-desarrollo-cambiar';

// Crear token
const generarToken = (usuario) =>
  jwt.sign({ rol: usuario.rol, nombre: usuario.nombre }, secreto(), {
    subject: String(usuario.id),
    expiresIn: '8h',
  });

// Verificar token
const verifyToken = async (req, res, next) => {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }

  let datos;
  try {
    datos = jwt.verify(token, secreto());
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o vencida' });
  }

  try {
    // Estado y rol actuales
    const consulta = `SELECT u.nombre, u.activo, r.nombre AS rol
                      FROM usuario u JOIN rol r ON r.id = u.rol_id WHERE u.id = ?`;
    const [rows] = await conection.query(consulta, [datos.sub]);
    const usuario = rows[0];
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Tu cuenta no está activa. Volvé a ingresar o consultá al administrador.' });
    }
    req.user = { id: Number(datos.sub), rol: usuario.rol, nombre: usuario.nombre };
    next();
  } catch (error) {
    next(error);
  }
};

// Verificar rol
const checkRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.rol)) {
    return res.status(403).json({ error: 'No tiene permisos para esta acción' });
  }
  next();
};

module.exports = { ROLES, generarToken, verifyToken, checkRole };
