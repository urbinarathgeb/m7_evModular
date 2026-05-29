import { Op } from 'sequelize';
import Order from '../models/order.model.js';
import Dimension from '../models/dimension.model.js';
import OrderItem from '../models/order_item.model.js';
import Bundle from '../models/bundle.model.js';
import StackConfig from '../models/stack_config.model.js';
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
  if (data.items) {
    data.dimensions = data.items.map((item) => {
      const dimension = item.dimension;
      const stackConfig = dimension?.defaultStackConfig;
      const produced = item.bundles?.length || 0;
      const quantity = item.quantity;
      const pending = Math.max(0, quantity - produced);

      let itemStatus = 'not_started';
      if (produced > 0 && produced < quantity) {
        itemStatus = 'in_progress';
      } else if (produced >= quantity) {
        itemStatus = 'completed';
      }

      return {
        dimension: dimension ? `${dimension.thickness}x${dimension.width}x${dimension.length}` : null,
        stackConfig: stackConfig ? `${stackConfig.widthStack}x${stackConfig.heightStack}` : null,
        quantity,
        produced,
        pending,
        status: itemStatus,
      };
    });
    delete data.items;
  }
  return data;
};

export const getAll = async () => {
  const orders = await Order.findAll({
    include: [{
      model: OrderItem,
      as: 'items',
      include: [
        {
          model: Dimension,
          as: 'dimension',
          attributes: ['id', 'thickness', 'width', 'length', 'defaultStackConfigId'],
          include: [{
            model: StackConfig,
            as: 'defaultStackConfig',
            attributes: ['id', 'widthStack', 'heightStack', 'separatorEvery'],
          }],
        },
        {
          model: Bundle,
          as: 'bundles',
          attributes: ['id'],
        },
      ],
    }],
    order: [['createdAt', 'DESC']],
  });
  return orders.map(formatOrderResponse);
};

export const getById = async (id) => {
  const order = await Order.findByPk(id, {
    include: [{
      model: OrderItem,
      as: 'items',
      include: [
        {
          model: Dimension,
          as: 'dimension',
          attributes: ['id', 'thickness', 'width', 'length', 'defaultStackConfigId'],
          include: [{
            model: StackConfig,
            as: 'defaultStackConfig',
            attributes: ['id', 'widthStack', 'heightStack', 'separatorEvery'],
          }],
        },
        {
          model: Bundle,
          as: 'bundles',
          attributes: ['id'],
        },
      ],
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
