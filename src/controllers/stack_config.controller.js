import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import { success } from '../utils/response.js';
import * as stackConfigService from '../services/stack_config.service.js';

export const list = asyncHandler(async (_req, res) => {
  const stackConfigs = await stackConfigService.getAll();
  return success(res, {
    message: 'Configuraciones de apilado obtenidas correctamente',
    data: stackConfigs,
  });
});

export const detail = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const stackConfig = await stackConfigService.getById(id);
  return success(res, {
    message: 'Configuración de apilado encontrada',
    data: stackConfig,
  });
});

export const create = asyncHandler(async (req, res) => {
  const { widthStack, heightStack, separatorEvery } = req.body;
  const stackConfig = await stackConfigService.create({ widthStack, heightStack, separatorEvery });
  return success(res, {
    message: 'Configuración de apilado creada exitosamente',
    data: stackConfig,
    status: 201,
  });
});

export const update = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const stackConfig = await stackConfigService.update(id, req.body);
  return success(res, {
    message: 'Configuración de apilado actualizada correctamente',
    data: stackConfig,
  });
});

export const destroy = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await stackConfigService.remove(id);
  return success(res, {
    message: 'Configuración de apilado eliminada correctamente',
  });
});

export const restore = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const stackConfig = await stackConfigService.restore(id);
  return success(res, {
    message: 'Configuración de apilado restaurada correctamente',
    data: stackConfig,
  });
});
