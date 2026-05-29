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

export const validateAddItems = (req, _res, next) => {
  const errors = [];
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ValidationError('Se requiere un array de items con al menos un elemento');
  }

  items.forEach((item, index) => {
    if (item.dimensionId === undefined || item.dimensionId === null) {
      errors.push({ field: `items[${index}].dimensionId`, message: 'El ID de la dimensión es obligatorio' });
    } else if (!Number.isInteger(item.dimensionId) || item.dimensionId < 1) {
      errors.push({ field: `items[${index}].dimensionId`, message: 'El ID de la dimensión debe ser un entero positivo' });
    }

    if (item.quantity === undefined || item.quantity === null) {
      errors.push({ field: `items[${index}].quantity`, message: 'La cantidad es obligatoria' });
    } else if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      errors.push({ field: `items[${index}].quantity`, message: 'La cantidad debe ser un entero positivo' });
    }
  });

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};

export const validateUpdateItem = (req, _res, next) => {
  const errors = [];

  if (Object.keys(req.body).length === 0) {
    throw new ValidationError('Se requiere al menos un campo para actualizar');
  }

  const { quantity } = req.body;

  if (quantity !== undefined) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      errors.push({ field: 'quantity', message: 'La cantidad debe ser un entero positivo' });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};
