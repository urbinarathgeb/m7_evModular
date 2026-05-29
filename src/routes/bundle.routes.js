import { Router } from 'express';
import * as bundleController from '../controllers/bundle.controller.js';
import { validateBundleId, validateUpdateBundle } from '../middlewares/bundle.middleware.js';

const router = Router();

router.get('/:id', validateBundleId, bundleController.detail);
router.patch('/:id', validateBundleId, validateUpdateBundle, bundleController.update);
router.delete('/:id', validateBundleId, bundleController.destroy);
router.post('/:id/restore', validateBundleId, bundleController.restore);

export default router;
