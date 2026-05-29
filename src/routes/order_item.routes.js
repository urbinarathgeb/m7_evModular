import { Router } from 'express';
import * as orderItemController from '../controllers/order_item.controller.js';
import { validateOrderId, validateItemId, validateAddItems, validateUpdateItem } from '../middlewares/order_item.middleware.js';

const router = Router();

router.post('/:id/items', validateOrderId, validateAddItems, orderItemController.addItems);
router.patch('/:id/items/:itemId', validateOrderId, validateItemId, validateUpdateItem, orderItemController.updateItem);
router.post('/:id/items/:itemId/restore', validateOrderId, validateItemId, orderItemController.restore);
router.delete('/:id/items/:itemId', validateOrderId, validateItemId, orderItemController.destroy);

export default router;
