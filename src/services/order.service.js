import { Op } from 'sequelize';
import Order from '../models/order.model.js';
import Dimension from '../models/dimension.model.js';
import OrderItem from '../models/order_item.model.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

const parseDateCL = (dateStr) => {
  if (!dateStr) return new Date();
  const [day, month, year] = dateStr.split('-');
  return new Date(`${year}-${month}-${day}T00:00:00`);
};

const formatDateCL = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

const formatOrderResponse = (order) => {
  const data = order.toJSON();
  if (data.orderDate) data.orderDate = formatDateCL(data.orderDate);
  if (data.dimensions) {
    data.dimensions = data.dimensions.map((d) => ({
      dimension: `${d.thickness}x${d.width}x${d.length}`,
      quantity: d.OrderItem?.quantity || 0,
    }));
  }
  return data;
};

export const getAll = async () => {
  const orders = await Order.findAll({
    include: [{
      model: Dimension,
      as: 'dimensions',
      through: { attributes: ['quantity'] },
    }],
    order: [['createdAt', 'DESC']],
  });
  return orders.map(formatOrderResponse);
};

export const getById = async (id) => {
  const order = await Order.findByPk(id, {
    include: [{
      model: Dimension,
      as: 'dimensions',
      through: { attributes: ['quantity'] },
    }],
  });
  if (!order) {
    throw new NotFoundError('Orden no encontrada');
  }
  return formatOrderResponse(order);
};

export const create = async (data) => {
  const { client, orderDate, dimensions } = data;

  const order = await Order.create({
    client,
    orderDate: parseDateCL(orderDate),
  });

  for (const item of dimensions) {
    const dimension = await Dimension.findByPk(item.dimensionId);
    if (!dimension) {
      await order.destroy();
      throw new NotFoundError(`La dimensión con ID ${item.dimensionId} no existe`);
    }
    await order.addDimension(dimension, { through: { quantity: item.quantity } });
  }

  return getById(order.id);
};

export const update = async (id, data) => {
  const order = await Order.findByPk(id);
  if (!order) {
    throw new NotFoundError('Orden no encontrada');
  }

  const updateData = {};
  if (data.client !== undefined) updateData.client = data.client;
  if (data.orderDate !== undefined) updateData.orderDate = parseDateCL(data.orderDate);
  if (data.status !== undefined) updateData.status = data.status;

  await order.update(updateData);
  return getById(order.id);
};

export const remove = async (id) => {
  const order = await Order.findByPk(id);
  if (!order) {
    throw new NotFoundError('Orden no encontrada');
  }
  await order.destroy();
  return order;
};

export const restore = async (id) => {
  const order = await Order.findByPk(id, { paranoid: false });
  if (!order) {
    throw new NotFoundError('Orden no encontrada');
  }
  if (!order.deletedAt) {
    throw new ConflictError('La orden no está eliminada');
  }
  await order.restore();
  return getById(order.id);
};
