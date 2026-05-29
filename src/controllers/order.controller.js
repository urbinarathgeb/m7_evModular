import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import { success } from '../utils/response.js';
import * as orderService from '../services/order.service.js';

export const list = asyncHandler(async (_req, res) => {
  const orders = await orderService.getAll();
  return success(res, {
    message: 'Órdenes obtenidas correctamente',
    data: orders,
  });
});

export const detail = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = await orderService.getById(id);
  return success(res, {
    message: 'Orden encontrada',
    data: order,
  });
});

export const create = asyncHandler(async (req, res) => {
  const { client, orderDate, dimensions } = req.body;
  const order = await orderService.create({ client, orderDate, dimensions });
  return success(res, {
    message: 'Orden creada exitosamente',
    data: order,
    status: 201,
  });
});

export const update = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = await orderService.update(id, req.body);
  return success(res, {
    message: 'Orden actualizada correctamente',
    data: order,
  });
});

export const restore = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = await orderService.restore(id);
  return success(res, {
    message: 'Orden restaurada correctamente',
    data: order,
  });
});

export const destroy = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await orderService.remove(id);
  return success(res, {
    message: 'Orden eliminada correctamente',
  });
});
