import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { validateId, validateCreate, validateFullUpdate, validatePartialUpdate } from '../middlewares/order.middleware.js';

const router = Router();

router.get('/', orderController.list);
router.get('/:id', validateId, orderController.detail);
router.post('/', validateCreate, orderController.create);
router.put('/:id', validateId, validateFullUpdate, orderController.update);
router.patch('/:id', validateId, validatePartialUpdate, orderController.update);
router.post('/:id/restore', validateId, orderController.restore);
router.delete('/:id', validateId, orderController.destroy);

export default router;
