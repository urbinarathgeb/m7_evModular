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
  const { widthStack, heightStack, separatorEvery } = req.body;

  if (widthStack === undefined || widthStack === null) {
    errors.push({ field: 'widthStack', message: 'Las piezas a lo ancho son obligatorias' });
  } else if (!Number.isInteger(widthStack) || widthStack < 1) {
    errors.push({ field: 'widthStack', message: 'Las piezas a lo ancho deben ser un número entero positivo' });
  }

  if (heightStack === undefined || heightStack === null) {
    errors.push({ field: 'heightStack', message: 'Las piezas a lo alto son obligatorias' });
  } else if (!Number.isInteger(heightStack) || heightStack < 1) {
    errors.push({ field: 'heightStack', message: 'Las piezas a lo alto deben ser un número entero positivo' });
  }

  if (separatorEvery !== undefined) {
    if (!Number.isInteger(separatorEvery) || separatorEvery < 1) {
      errors.push({ field: 'separatorEvery', message: 'Las filas entre separadores deben ser un número entero positivo' });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};

export const validateFullUpdate = (req, _res, next) => {
  const errors = [];
  const { widthStack, heightStack, separatorEvery } = req.body;

  if (widthStack === undefined || widthStack === null) {
    errors.push({ field: 'widthStack', message: 'Las piezas a lo ancho son obligatorias' });
  } else if (!Number.isInteger(widthStack) || widthStack < 1) {
    errors.push({ field: 'widthStack', message: 'Las piezas a lo ancho deben ser un número entero positivo' });
  }

  if (heightStack === undefined || heightStack === null) {
    errors.push({ field: 'heightStack', message: 'Las piezas a lo alto son obligatorias' });
  } else if (!Number.isInteger(heightStack) || heightStack < 1) {
    errors.push({ field: 'heightStack', message: 'Las piezas a lo alto deben ser un número entero positivo' });
  }

  if (separatorEvery === undefined || separatorEvery === null) {
    errors.push({ field: 'separatorEvery', message: 'Las filas entre separadores son obligatorias' });
  } else if (!Number.isInteger(separatorEvery) || separatorEvery < 1) {
    errors.push({ field: 'separatorEvery', message: 'Las filas entre separadores deben ser un número entero positivo' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};

export const validatePartialUpdate = (req, _res, next) => {
  const errors = [];

  if (Object.keys(req.body).length === 0) {
    throw new ValidationError('Se requiere al menos un campo para actualizar');
  }

  const { widthStack, heightStack, separatorEvery } = req.body;

  if (widthStack !== undefined) {
    if (!Number.isInteger(widthStack) || widthStack < 1) {
      errors.push({ field: 'widthStack', message: 'Las piezas a lo ancho deben ser un número entero positivo' });
    }
  }

  if (heightStack !== undefined) {
    if (!Number.isInteger(heightStack) || heightStack < 1) {
      errors.push({ field: 'heightStack', message: 'Las piezas a lo alto deben ser un número entero positivo' });
    }
  }

  if (separatorEvery !== undefined) {
    if (!Number.isInteger(separatorEvery) || separatorEvery < 1) {
      errors.push({ field: 'separatorEvery', message: 'Las filas entre separadores deben ser un número entero positivo' });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};
