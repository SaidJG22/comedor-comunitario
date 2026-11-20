const express = require('express');
const cors = require('cors');
const { conection } = require('./config/db.js');
const { verifyToken } = require('./middlewares/auth.js');
const { notFound, errorHandler } = require('./middlewares/errors.js');
const authRouter = require('./routes/auth.routes.js');
const stockRouter = require('./routes/stock.routes.js');
const donacionesRouter = require('./routes/donaciones.routes.js');
const menusRouter = require('./routes/menus.routes.js');
const racionesRouter = require('./routes/raciones.routes.js');
const voluntariosRouter = require('./routes/voluntarios.routes.js');
const reportesRouter = require('./routes/reportes.routes.js');
const usuariosRouter = require('./routes/usuarios.routes.js');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.warn('Aviso: falta JWT_SECRET en backend/.env (se usa uno de desarrollo).');
}

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', servicio: 'cometuc-api' });
});

// Rutas públicas
app.use('/api/auth', authRouter);

// Rutas privadas
app.use('/api/stock', verifyToken, stockRouter);
app.use('/api/donaciones', verifyToken, donacionesRouter);
app.use('/api/menus', verifyToken, menusRouter);
app.use('/api/raciones', verifyToken, racionesRouter);
app.use('/api/voluntarios', verifyToken, voluntariosRouter);
app.use('/api/reportes', verifyToken, reportesRouter);
app.use('/api/usuarios', verifyToken, usuariosRouter);

app.use(notFound);
app.use(errorHandler);

const initServer = async () => {
  try {
    const conexion = await conection.getConnection();
    console.log('Conectado a la base de datos');
    conexion.release();
    app.listen(PORT, () => {
      console.log(`API ComeTUC escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
  }
};

initServer();
