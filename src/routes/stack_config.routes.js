import { Router } from 'express';
import * as stackConfigController from '../controllers/stack_config.controller.js';
import { validateId, validateCreate, validateFullUpdate, validatePartialUpdate } from '../middlewares/stack_config.middleware.js';

const router = Router();

router.get('/', stackConfigController.list);
router.get('/:id', validateId, stackConfigController.detail);
router.post('/', validateCreate, stackConfigController.create);
router.put('/:id', validateId, validateFullUpdate, stackConfigController.update);
router.patch('/:id', validateId, validatePartialUpdate, stackConfigController.update);
router.post('/:id/restore', validateId, stackConfigController.restore);
router.delete('/:id', validateId, stackConfigController.destroy);

export default router;
