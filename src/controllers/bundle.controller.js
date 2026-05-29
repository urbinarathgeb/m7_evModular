import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import { success } from '../utils/response.js';
import * as bundleService from '../services/bundle.service.js';

export const listByItem = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const itemId = parseInt(req.params.itemId, 10);
  const bundles = await bundleService.getByItem(orderId, itemId);
  return success(res, {
    message: 'Bundles obtenidos correctamente',
    data: bundles,
  });
});

export const detail = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const bundle = await bundleService.getById(id);
  return success(res, {
    message: 'Bundle encontrado',
    data: bundle,
  });
});

export const create = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const itemId = parseInt(req.params.itemId, 10);
  const bundle = await bundleService.create(orderId, itemId, req.body);
  return success(res, {
    message: 'Bundle registrado exitosamente',
    data: bundle,
    status: 201,
  });
});

export const update = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const bundle = await bundleService.update(id, req.body);
  return success(res, {
    message: 'Bundle actualizado correctamente',
    data: bundle,
  });
});

export const destroy = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await bundleService.remove(id);
  return success(res, {
    message: 'Bundle eliminado correctamente',
  });
});

export const restore = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const bundle = await bundleService.restore(id);
  return success(res, {
    message: 'Bundle restaurado correctamente',
    data: bundle,
  });
});
