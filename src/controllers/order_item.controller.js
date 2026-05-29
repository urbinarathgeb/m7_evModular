import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import { success } from '../utils/response.js';
import * as orderItemService from '../services/order_item.service.js';

export const addItems = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const { items } = req.body;
  const order = await orderItemService.addItems(orderId, items);
  return success(res, {
    message: 'Items agregados a la orden correctamente',
    data: order,
    status: 201,
  });
});

export const updateItem = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const itemId = parseInt(req.params.itemId, 10);
  const order = await orderItemService.updateItem(orderId, itemId, req.body);
  return success(res, {
    message: 'Item actualizado correctamente',
    data: order,
  });
});

export const destroy = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const itemId = parseInt(req.params.itemId, 10);
  const order = await orderItemService.removeItem(orderId, itemId);
  return success(res, {
    message: 'Item eliminado correctamente',
    data: order,
  });
});

export const restore = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const itemId = parseInt(req.params.itemId, 10);
  const order = await orderItemService.restoreItem(orderId, itemId);
  return success(res, {
    message: 'Item restaurado correctamente',
    data: order,
  });
});
