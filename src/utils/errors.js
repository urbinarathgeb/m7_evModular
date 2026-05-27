export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Error de validación', errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Recurso duplicado') {
    super(message, 409);
  }
}

export class InternalError extends AppError {
  constructor(message = 'Error interno del servidor') {
    super(message, 500);
  }
}
