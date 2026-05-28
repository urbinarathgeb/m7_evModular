import { Op } from 'sequelize';
import Dimension from '../models/dimension.model.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

export const getAll = async () => {
  return Dimension.findAll({
    order: [['thickness', 'ASC'], ['width', 'ASC'], ['length', 'ASC']],
  });
};

export const getById = async (id) => {
  const dimension = await Dimension.findByPk(id);
  if (!dimension) {
    throw new NotFoundError('Dimensión no encontrada');
  }
  return dimension;
};

export const create = async (data) => {
  const { thickness, width, length } = data;

  const existingDeleted = await Dimension.findOne({
    where: { thickness, width, length },
    paranoid: false,
  });

  if (existingDeleted && existingDeleted.deletedAt) {
    await existingDeleted.restore();
    return existingDeleted;
  }

  try {
    return await Dimension.create(data);
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
  return dimension;
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
  return dimension;
};
