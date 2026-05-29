import { Op } from 'sequelize';
import sequelize from '../config/db.config.js';
import StackConfig from '../models/stack_config.model.js';
import Dimension from '../models/dimension.model.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

export const getAll = async () => {
  return StackConfig.findAll({
    include: [{
      model: Dimension,
      as: 'dimensionsUsingDefault',
      attributes: ['id', 'thickness', 'width', 'length'],
    }],
    order: [['widthStack', 'ASC'], ['heightStack', 'ASC']],
  });
};

export const getById = async (id) => {
  const stackConfig = await StackConfig.findByPk(id, {
    include: [{
      model: Dimension,
      as: 'dimensionsUsingDefault',
      attributes: ['id', 'thickness', 'width', 'length'],
    }],
  });
  if (!stackConfig) {
    throw new NotFoundError('Configuración de apilado no encontrada');
  }
  return stackConfig;
};

export const findOrCreate = async (data, transaction) => {
  const { widthStack, heightStack, separatorEvery } = data;

  const existing = await StackConfig.findOne({
    where: { widthStack, heightStack, separatorEvery },
    paranoid: false,
    transaction,
  });

  if (existing) {
    if (existing.deletedAt) {
      await existing.restore({ transaction });
    }
    return existing;
  }

  return StackConfig.create({
    widthStack,
    heightStack,
    separatorEvery: separatorEvery ?? (heightStack <= 10 ? heightStack : Math.ceil(heightStack / 5)),
  }, { transaction });
};

export const create = async (data) => {
  const { widthStack, heightStack, separatorEvery } = data;

  const existing = await StackConfig.findOne({
    where: { widthStack, heightStack, separatorEvery: separatorEvery ?? (heightStack <= 10 ? heightStack : Math.ceil(heightStack / 5)) },
    paranoid: false,
  });

  if (existing) {
    if (existing.deletedAt) {
      await existing.restore();
      return getById(existing.id);
    }
    throw new ConflictError('Ya existe una configuración de apilado con esos valores');
  }

  try {
    return StackConfig.create({
      widthStack,
      heightStack,
      separatorEvery: separatorEvery ?? (heightStack <= 10 ? heightStack : Math.ceil(heightStack / 5)),
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new ConflictError('Ya existe una configuración de apilado con esos valores');
    }
    throw error;
  }
};

export const update = async (id, data) => {
  const stackConfig = await StackConfig.findByPk(id);
  if (!stackConfig) {
    throw new NotFoundError('Configuración de apilado no encontrada');
  }
  await stackConfig.update(data);
  return getById(stackConfig.id);
};

export const remove = async (id) => {
  const stackConfig = await StackConfig.findByPk(id);
  if (!stackConfig) {
    throw new NotFoundError('Configuración de apilado no encontrada');
  }

  const dimensionsUsing = await Dimension.count({
    where: { defaultStackConfigId: id },
  });

  if (dimensionsUsing > 0) {
    throw new ConflictError('No se puede eliminar: es la configuración por defecto de una o más dimensiones');
  }

  await stackConfig.destroy();
  return stackConfig;
};

export const restore = async (id) => {
  const stackConfig = await StackConfig.findByPk(id, { paranoid: false });
  if (!stackConfig) {
    throw new NotFoundError('Configuración de apilado no encontrada');
  }
  if (!stackConfig.deletedAt) {
    throw new ConflictError('La configuración de apilado no está eliminada');
  }
  await stackConfig.restore();
  return getById(stackConfig.id);
};
