import express from 'express';
import cors from 'cors';
import env from './config/env.config.js';
import sequelize, { testConnection } from './config/db.config.js';

const app = express();

app.use(cors({
  origin: env.NODE_ENV === 'production' ? env.CORS_ORIGIN : '*',
}));

app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CutLog API funcionando',
  });
});

app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
  });
});

async function start() {
  try {
    await testConnection();

    await sequelize.sync({ force: env.NODE_ENV === 'development' });

    app.listen(env.PORT, () => {
      console.log(`✅ Servidor corriendo en el puerto ${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

start();
