import express from 'express';
import cors from 'cors';
import env from './config/env.config.js';
import sequelize, {testConnection} from './config/db.config.js';
import {errorMiddleware} from './middlewares/error.middleware.js';
import {NotFoundError} from './utils/errors.js';
import './models/index.js';
import {seed} from './seeders/initial.seed.js';
import dimensionRoutes from './routes/dimension.routes.js';
import orderRoutes from './routes/order.routes.js';

const app = express();

app.use(cors({
	origin: env.NODE_ENV === 'production' ? env.CORS_ORIGIN : '*'
}));

app.use(express.json());

app.get('/', (_req, res) => {
	res.status(200).json({
		status: 'success',
		message: 'CutLog API funcionando'
	});
});

app.use('/api/dimensions', dimensionRoutes);
app.use('/api/orders', orderRoutes);

/** @type {import('express').RequestHandler} */
const notFoundHandler = (_req, _res, next) => {
	next(new NotFoundError('Ruta no encontrada'));
};

app.use(
	/** @type {import('express').RequestHandler} */
	notFoundHandler
);

app.use(
	/** @type {import('express').ErrorRequestHandler} */
	errorMiddleware
);

async function start() {
	try {
		await testConnection();

		await sequelize.sync({force: env.NODE_ENV === 'development'});

		if (env.NODE_ENV === 'development') {
			await seed();
		}

		app.listen(env.PORT, () => {
			console.log(`✅ Servidor corriendo en el puerto ${env.PORT}`);
		});
	} catch (error) {
		console.error('❌ No se pudo iniciar el servidor:', error.message);
		process.exit(1);
	}
}

start().catch((error) => {
	console.error('❌ Error fatal:', error);
	process.exit(1);
});