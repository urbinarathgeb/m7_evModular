import { Router } from 'express';
import * as orderItemController from '../controllers/order_item.controller.js';
import * as bundleController from '../controllers/bundle.controller.js';
import { validateOrderId, validateItemId, validateAddItems, validateUpdateItem } from '../middlewares/order_item.middleware.js';
import { validateCreateBundle } from '../middlewares/bundle.middleware.js';

const router = Router();

router.post('/:id/items', validateOrderId, validateAddItems, orderItemController.addItems);
router.patch('/:id/items/:itemId', validateOrderId, validateItemId, validateUpdateItem, orderItemController.updateItem);
router.post('/:id/items/:itemId/restore', validateOrderId, validateItemId, orderItemController.restore);
router.delete('/:id/items/:itemId', validateOrderId, validateItemId, orderItemController.destroy);

// Nested bundle routes
router.post('/:id/items/:itemId/bundles', validateOrderId, validateItemId, validateCreateBundle, bundleController.create);
router.get('/:id/items/:itemId/bundles', validateOrderId, validateItemId, bundleController.listByItem);

export default router;
