import { Op } from 'sequelize';
import sequelize from '../config/db.config.js';
import Dimension from '../models/dimension.model.js';
import StackConfig from '../models/stack_config.model.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

export const getAll = async () => {
  return Dimension.findAll({
    include: [{
      model: StackConfig,
      as: 'defaultStackConfig',
      attributes: ['id', 'widthStack', 'heightStack', 'separatorEvery'],
    }],
    order: [['thickness', 'ASC'], ['width', 'ASC'], ['length', 'ASC']],
  });
};

export const getById = async (id) => {
  const dimension = await Dimension.findByPk(id, {
    include: [{
      model: StackConfig,
      as: 'defaultStackConfig',
      attributes: ['id', 'widthStack', 'heightStack', 'separatorEvery'],
    }],
  });
  if (!dimension) {
    throw new NotFoundError('Dimensión no encontrada');
  }
  return dimension;
};

export const create = async (data) => {
  const { thickness, width, length, stackConfig } = data;

  const existingDeleted = await Dimension.findOne({
    where: { thickness, width, length },
    paranoid: false,
  });

  if (existingDeleted && existingDeleted.deletedAt) {
    await existingDeleted.restore();
    return getById(existingDeleted.id);
  }

  try {
    return await sequelize.transaction(async (t) => {
      const newStackConfig = await StackConfig.create({
        widthStack: stackConfig.widthStack,
        heightStack: stackConfig.heightStack,
        separatorEvery: stackConfig.separatorEvery ?? (stackConfig.heightStack <= 10 ? stackConfig.heightStack : Math.ceil(stackConfig.heightStack / 5)),
      }, { transaction: t });

      const dimension = await Dimension.create({
        thickness,
        width,
        length,
        defaultStackConfigId: newStackConfig.id,
      }, { transaction: t });

      return Dimension.findByPk(dimension.id, {
        include: [{
          model: StackConfig,
          as: 'defaultStackConfig',
          attributes: ['id', 'widthStack', 'heightStack', 'separatorEvery'],
        }],
        transaction: t,
      });
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new ConflictError('Ya existe una dimensión con esas medidas');
    }
    throw error;
  }
};

export const update = async (id, data) => {
  const dimension = await Dimension.findByPk(id);
  if (!dimension) {
    throw new NotFoundError('Dimensión no encontrada');
  }
  await dimension.update(data);
  return getById(dimension.id);
};

export const remove = async (id) => {
  const dimension = await Dimension.findByPk(id);
  if (!dimension) {
    throw new NotFoundError('Dimensión no encontrada');
  }
  await dimension.destroy();
  return dimension;
};

export const restore = async (id) => {
  const dimension = await Dimension.findByPk(id, { paranoid: false });
  if (!dimension) {
    throw new NotFoundError('Dimensión no encontrada');
  }
  if (!dimension.deletedAt) {
    throw new ConflictError('La dimensión no está eliminada');
  }
  await dimension.restore();
  return getById(dimension.id);
};
