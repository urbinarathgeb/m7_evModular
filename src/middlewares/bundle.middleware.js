import { ValidationError } from '../utils/errors.js';

export const validateOrderId = (req, _res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) {
    throw new ValidationError('El ID de la orden debe ser un número entero positivo');
  }
  next();
};

export const validateItemId = (req, _res, next) => {
  const itemId = parseInt(req.params.itemId, 10);
  if (isNaN(itemId) || itemId < 1) {
    throw new ValidationError('El ID del item debe ser un número entero positivo');
  }
  next();
};

export const validateBundleId = (req, _res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) {
    throw new ValidationError('El ID del bundle debe ser un número entero positivo');
  }
  next();
};

export const validateCreateBundle = (req, _res, next) => {
  const errors = [];
  const { stackConfigId } = req.body || {};

  if (stackConfigId !== undefined) {
    if (!Number.isInteger(stackConfigId) || stackConfigId < 1) {
      errors.push({ field: 'stackConfigId', message: 'El ID de la configuración de apilado debe ser un entero positivo' });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};

export const validateUpdateBundle = (req, _res, next) => {
  const errors = [];
  const { stackConfigId } = req.body || {};

  const body = req.body || {};
  if (Object.keys(body).length === 0) {
    throw new ValidationError('Se requiere al menos un campo para actualizar');
  }

  if (stackConfigId !== undefined) {
    if (!Number.isInteger(stackConfigId) || stackConfigId < 1) {
      errors.push({ field: 'stackConfigId', message: 'El ID de la configuración de apilado debe ser un entero positivo' });
    }
  } else {
    errors.push({ field: 'stackConfigId', message: 'Solo se puede actualizar la configuración de apilado' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};
