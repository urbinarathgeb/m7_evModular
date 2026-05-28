import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import { success } from '../utils/response.js';
import * as dimensionService from '../services/dimension.service.js';

export const list = asyncHandler(async (_req, res) => {
  const dimensions = await dimensionService.getAll();
  return success(res, {
    message: 'Dimensiones obtenidas correctamente',
    data: dimensions,
  });
});

export const detail = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const dimension = await dimensionService.getById(id);
  return success(res, {
    message: 'Dimensión encontrada',
    data: dimension,
  });
});

export const create = asyncHandler(async (req, res) => {
  const { thickness, width, length } = req.body;
  const dimension = await dimensionService.create({ thickness, width, length });
  return success(res, {
    message: 'Dimensión creada exitosamente',
    data: dimension,
    status: 201,
  });
});

export const update = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const dimension = await dimensionService.update(id, req.body);
  return success(res, {
    message: 'Dimensión actualizada correctamente',
    data: dimension,
  });
});

export const destroy = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await dimensionService.remove(id);
  return success(res, {
    message: 'Dimensión eliminada correctamente',
  });
});
