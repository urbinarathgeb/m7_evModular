import { ValidationError } from '../utils/errors.js';

export const validateId = (req, _res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) {
    throw new ValidationError('El ID debe ser un número entero positivo');
  }
  next();
};

export const validateCreate = (req, _res, next) => {
  const errors = [];
  const { thickness, width, length } = req.body;

  if (thickness === undefined || thickness === null) {
    errors.push({ field: 'thickness', message: 'El espesor es obligatorio' });
  } else if (!Number.isInteger(thickness) || thickness < 1) {
    errors.push({ field: 'thickness', message: 'El espesor debe ser un número entero positivo' });
  }

  if (width === undefined || width === null) {
    errors.push({ field: 'width', message: 'El ancho es obligatorio' });
  } else if (!Number.isInteger(width) || width < 1) {
    errors.push({ field: 'width', message: 'El ancho debe ser un número entero positivo' });
  }

  if (length === undefined || length === null) {
    errors.push({ field: 'length', message: 'El largo es obligatorio' });
  } else if (!Number.isInteger(length) || length < 1) {
    errors.push({ field: 'length', message: 'El largo debe ser un número entero positivo' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};

export const validateFullUpdate = (req, _res, next) => {
  const errors = [];
  const { thickness, width, length } = req.body;

  if (thickness === undefined || thickness === null) {
    errors.push({ field: 'thickness', message: 'El espesor es obligatorio' });
  } else if (!Number.isInteger(thickness) || thickness < 1) {
    errors.push({ field: 'thickness', message: 'El espesor debe ser un número entero positivo' });
  }

  if (width === undefined || width === null) {
    errors.push({ field: 'width', message: 'El ancho es obligatorio' });
  } else if (!Number.isInteger(width) || width < 1) {
    errors.push({ field: 'width', message: 'El ancho debe ser un número entero positivo' });
  }

  if (length === undefined || length === null) {
    errors.push({ field: 'length', message: 'El largo es obligatorio' });
  } else if (!Number.isInteger(length) || length < 1) {
    errors.push({ field: 'length', message: 'El largo debe ser un número entero positivo' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};

export const validatePartialUpdate = (req, _res, next) => {
  const errors = [];
  const { thickness, width, length } = req.body;

  if (Object.keys(req.body).length === 0) {
    throw new ValidationError('Se requiere al menos un campo para actualizar');
  }

  if (thickness !== undefined) {
    if (!Number.isInteger(thickness) || thickness < 1) {
      errors.push({ field: 'thickness', message: 'El espesor debe ser un número entero positivo' });
    }
  }

  if (width !== undefined) {
    if (!Number.isInteger(width) || width < 1) {
      errors.push({ field: 'width', message: 'El ancho debe ser un número entero positivo' });
    }
  }

  if (length !== undefined) {
    if (!Number.isInteger(length) || length < 1) {
      errors.push({ field: 'length', message: 'El largo debe ser un número entero positivo' });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};
