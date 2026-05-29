import { ValidationError } from '../utils/errors.js';

const VALID_STATUSES = ['pending', 'in_production', 'completed', 'delivered'];

const isValidDateCL = (dateStr) => {
  if (typeof dateStr !== 'string') return false;
  const regex = /^\d{2}-\d{2}-\d{4}$/;
  if (!regex.test(dateStr)) return false;
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const validateId = (req, _res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) {
    throw new ValidationError('El ID debe ser un número entero positivo');
  }
  next();
};

export const validateCreate = (req, _res, next) => {
  const errors = [];
  const { client, orderDate, dimensions } = req.body;

  if (!client || typeof client !== 'string' || client.trim().length === 0) {
    errors.push({ field: 'client', message: 'El nombre del cliente es obligatorio' });
  }

  if (orderDate !== undefined && !isValidDateCL(orderDate)) {
    errors.push({ field: 'orderDate', message: 'La fecha debe tener formato DD-MM-YYYY (ej: 28-05-2026)' });
  }

  if (!dimensions || !Array.isArray(dimensions) || dimensions.length === 0) {
    errors.push({ field: 'dimensions', message: 'La orden debe tener al menos una dimensión' });
  } else {
    dimensions.forEach((item, index) => {
      if (!item.dimensionId || !Number.isInteger(item.dimensionId) || item.dimensionId < 1) {
        errors.push({ field: `dimensions[${index}].dimensionId`, message: 'El ID de la dimensión debe ser un entero positivo' });
      }
      if (item.quantity === undefined || item.quantity === null || !Number.isInteger(item.quantity) || item.quantity < 1) {
        errors.push({ field: `dimensions[${index}].quantity`, message: 'La cantidad debe ser un entero positivo' });
      }
    });
  }

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};

export const validateFullUpdate = (req, _res, next) => {
  const errors = [];
  const { client, orderDate, status } = req.body;

  if (!client || typeof client !== 'string' || client.trim().length === 0) {
    errors.push({ field: 'client', message: 'El nombre del cliente es obligatorio' });
  }

  if (orderDate === undefined || orderDate === null) {
    errors.push({ field: 'orderDate', message: 'La fecha del pedido es obligatoria' });
  } else if (!isValidDateCL(orderDate)) {
    errors.push({ field: 'orderDate', message: 'La fecha debe tener formato DD-MM-YYYY (ej: 28-05-2026)' });
  }

  if (status === undefined || status === null) {
    errors.push({ field: 'status', message: 'El estado del pedido es obligatorio' });
  } else if (!VALID_STATUSES.includes(status)) {
    errors.push({ field: 'status', message: `El estado debe ser uno de: ${VALID_STATUSES.join(', ')}` });
  }

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};

export const validatePartialUpdate = (req, _res, next) => {
  const errors = [];
  const { client, orderDate, status } = req.body;

  if (Object.keys(req.body).length === 0) {
    throw new ValidationError('Se requiere al menos un campo para actualizar');
  }

  if (client !== undefined) {
    if (typeof client !== 'string' || client.trim().length === 0) {
      errors.push({ field: 'client', message: 'El nombre del cliente no puede estar vacío' });
    }
  }

  if (orderDate !== undefined && !isValidDateCL(orderDate)) {
    errors.push({ field: 'orderDate', message: 'La fecha debe tener formato DD-MM-YYYY (ej: 28-05-2026)' });
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push({ field: 'status', message: `El estado debe ser uno de: ${VALID_STATUSES.join(', ')}` });
  }

  if (errors.length > 0) {
    throw new ValidationError('Error de validación', errors);
  }

  next();
};
