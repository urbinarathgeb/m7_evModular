import env from '../config/env.config.js';
import { AppError } from '../utils/errors.js';

export const errorMiddleware = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación',
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      status: 'error',
      message: 'Recurso duplicado',
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  console.error('Error no manejado:', err);

  return res.status(500).json({
    status: 'error',
    message: env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
  });
};
