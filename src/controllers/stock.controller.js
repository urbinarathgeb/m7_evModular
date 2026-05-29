import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import { success } from '../utils/response.js';
import * as stockService from '../services/stock.service.js';

export const getStock = asyncHandler(async (_req, res) => {
  const stock = await stockService.getStock();
  return success(res, {
    message: 'Vista de stock obtenida correctamente',
    data: stock,
  });
});
