import Order from '../models/order.model.js';
import OrderItem from '../models/order_item.model.js';
import Dimension from '../models/dimension.model.js';
import StackConfig from '../models/stack_config.model.js';
import Bundle from '../models/bundle.model.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

const MODIFIABLE_STATUSES = ['pending', 'in_production'];

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
        itemId: item.id,
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

const getFullOrder = async (orderId) => {
  const order = await Order.findByPk(orderId, {
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

const checkOrderModifiable = async (orderId) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new NotFoundError('Orden no encontrada');
  }
  if (!MODIFIABLE_STATUSES.includes(order.status)) {
    throw new ConflictError(`No se pueden modificar items de una orden en estado "${order.status}"`);
  }
  return order;
};

export const addItems = async (orderId, items) => {
  await checkOrderModifiable(orderId);

  for (const item of items) {
    const dimension = await Dimension.findByPk(item.dimensionId);
    if (!dimension) {
      throw new NotFoundError(`La dimensión con ID ${item.dimensionId} no existe`);
    }

    const existingItem = await OrderItem.findOne({
      where: { orderId, dimensionId: item.dimensionId },
    });

    if (existingItem) {
      await existingItem.update({
        quantity: existingItem.quantity + item.quantity,
      });
    } else {
      await OrderItem.create({
        orderId,
        dimensionId: item.dimensionId,
        quantity: item.quantity,
      });
    }
  }

  return getFullOrder(orderId);
};

export const removeItem = async (orderId, itemId) => {
  await checkOrderModifiable(orderId);

  const orderItem = await OrderItem.findOne({
    where: { id: itemId, orderId },
    include: [{
      model: Dimension,
      as: 'dimension',
      attributes: ['id', 'thickness', 'width', 'length'],
    }],
  });

  if (!orderItem) {
    throw new NotFoundError('Item no encontrado en esta orden');
  }

  await orderItem.destroy();
  return getFullOrder(orderId);
};

export const updateItem = async (orderId, itemId, data) => {
  await checkOrderModifiable(orderId);

  const orderItem = await OrderItem.findOne({
    where: { id: itemId, orderId },
    include: [{
      model: Dimension,
      as: 'dimension',
      attributes: ['id', 'thickness', 'width', 'length'],
    }],
  });

  if (!orderItem) {
    throw new NotFoundError('Item no encontrado en esta orden');
  }

  await orderItem.update(data);
  return getFullOrder(orderId);
};

export const restoreItem = async (orderId, itemId) => {
  await checkOrderModifiable(orderId);

  const orderItem = await OrderItem.findOne({
    where: { id: itemId, orderId },
    paranoid: false,
    include: [{
      model: Dimension,
      as: 'dimension',
      attributes: ['id', 'thickness', 'width', 'length'],
    }],
  });

  if (!orderItem) {
    throw new NotFoundError('Item no encontrado en esta orden');
  }

  if (!orderItem.deletedAt) {
    throw new ConflictError('El item no está eliminado');
  }

  await orderItem.restore();
  return getFullOrder(orderId);
};
