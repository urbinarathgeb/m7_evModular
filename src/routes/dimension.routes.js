import { Router } from 'express';
import * as dimensionController from '../controllers/dimension.controller.js';
import { validateId, validateCreate, validateUpdate } from '../middlewares/dimension.middleware.js';

const router = Router();

router.get('/', dimensionController.list);
router.get('/:id', validateId, dimensionController.detail);
router.post('/', validateCreate, dimensionController.create);
router.put('/:id', validateId, validateUpdate, dimensionController.update);
router.delete('/:id', validateId, dimensionController.destroy);

export default router;
