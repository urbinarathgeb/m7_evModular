import { Router } from 'express';
import * as dimensionController from '../controllers/dimension.controller.js';
import { validateId, validateCreate, validateFullUpdate, validatePartialUpdate } from '../middlewares/dimension.middleware.js';

const router = Router();

router.get('/', dimensionController.list);
router.get('/:id', validateId, dimensionController.detail);
router.post('/', validateCreate, dimensionController.create);
router.put('/:id', validateId, validateFullUpdate, dimensionController.update);
router.patch('/:id', validateId, validatePartialUpdate, dimensionController.update);
router.post('/:id/restore', validateId, dimensionController.restore);
router.delete('/:id', validateId, dimensionController.destroy);

export default router;
