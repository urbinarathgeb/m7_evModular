import Order from '../models/order.model.js';
import OrderItem from '../models/order_item.model.js';
import Dimension from '../models/dimension.model.js';
import StackConfig from '../models/stack_config.model.js';
import Bundle from '../models/bundle.model.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

const MODIFIABLE_STATUSES = ['pending', 'in_production'];

const calculateBundleMetrics = (dimension, stackConfig) => {
  const totalPieces = stackConfig.widthStack * stackConfig.heightStack;
  const cubicMeters = (dimension.thickness * dimension.width * dimension.length * totalPieces) / 1_000_000_000;
  return { totalPieces, cubicMeters };
};

const formatDateCL = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

const formatBundleResponse = (bundle) => {
  const data = bundle.toJSON();
  const dimension = data.orderItem?.dimension;
  const stackConfig = data.stackConfig;

  return {
    id: data.id,
    dimension: dimension ? `${dimension.thickness}x${dimension.width}x${dimension.length}` : null,
    stackConfig: stackConfig ? `${stackConfig.widthStack}x${stackConfig.heightStack}` : null,
    totalPieces: data.totalPieces,
    cubicMeters: data.cubicMeters,
    producedAt: formatDateCL(data.producedAt),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt,
  };
};

const checkOrderModifiable = async (orderId) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new NotFoundError('Orden no encontrada');
  }
  if (!MODIFIABLE_STATUSES.includes(order.status)) {
    throw new ConflictError(`No se pueden registrar bundles de una orden en estado "${order.status}"`);
  }
  return order;
};

const getFullBundle = async (id) => {
  const bundle = await Bundle.findByPk(id, {
    include: [
      {
        model: OrderItem,
        as: 'orderItem',
        attributes: ['id', 'quantity'],
        include: [
          {
            model: Dimension,
            as: 'dimension',
            attributes: ['id', 'thickness', 'width', 'length'],
          },
        ],
      },
      {
        model: StackConfig,
        as: 'stackConfig',
        attributes: ['id', 'widthStack', 'heightStack', 'separatorEvery'],
      },
    ],
  });
  if (!bundle) {
    throw new NotFoundError('Bundle no encontrado');
  }
  return formatBundleResponse(bundle);
};

export const getByItem = async (orderId, itemId) => {
  const orderItem = await OrderItem.findOne({
    where: { id: itemId, orderId },
    include: [
      {
        model: Dimension,
        as: 'dimension',
        attributes: ['id', 'thickness', 'width', 'length'],
      },
    ],
  });

  if (!orderItem) {
    throw new NotFoundError('Item no encontrado en esta orden');
  }

  const bundles = await Bundle.findAll({
    where: { orderItemId: itemId },
    include: [
      {
        model: StackConfig,
        as: 'stackConfig',
        attributes: ['id', 'widthStack', 'heightStack', 'separatorEvery'],
      },
    ],
    order: [['producedAt', 'DESC']],
  });

  return bundles.map(formatBundleResponse);
};

export const getById = async (id) => {
  return getFullBundle(id);
};

export const create = async (orderId, itemId, data) => {
  await checkOrderModifiable(orderId);

  const orderItem = await OrderItem.findOne({
    where: { id: itemId, orderId },
    include: [
      {
        model: Dimension,
        as: 'dimension',
        attributes: ['id', 'thickness', 'width', 'length', 'defaultStackConfigId'],
      },
    ],
  });

  if (!orderItem) {
    throw new NotFoundError('Item no encontrado en esta orden');
  }

  const dimension = orderItem.dimension;

  let stackConfigId = data.stackConfigId;
  if (!stackConfigId) {
    stackConfigId = dimension.defaultStackConfigId;
  }

  const stackConfig = await StackConfig.findByPk(stackConfigId);
  if (!stackConfig) {
    throw new NotFoundError('Configuración de apilado no encontrada');
  }

  const { totalPieces, cubicMeters } = calculateBundleMetrics(dimension, stackConfig);

  const bundle = await Bundle.create({
    orderItemId: itemId,
    stackConfigId,
    totalPieces,
    cubicMeters,
  });

  return getFullBundle(bundle.id);
};

export const update = async (id, data) => {
  const bundle = await Bundle.findByPk(id, {
    include: [
      {
        model: OrderItem,
        as: 'orderItem',
        include: [
          {
            model: Dimension,
            as: 'dimension',
            attributes: ['id', 'thickness', 'width', 'length', 'defaultStackConfigId'],
          },
        ],
      },
    ],
  });

  if (!bundle) {
    throw new NotFoundError('Bundle no encontrado');
  }

  const stackConfigId = data.stackConfigId;
  if (stackConfigId) {
    const stackConfig = await StackConfig.findByPk(stackConfigId);
    if (!stackConfig) {
      throw new NotFoundError('Configuración de apilado no encontrada');
    }

    const dimension = bundle.orderItem.dimension;
    const { totalPieces, cubicMeters } = calculateBundleMetrics(dimension, stackConfig);

    await bundle.update({ stackConfigId, totalPieces, cubicMeters });
  }

  return getFullBundle(bundle.id);
};

export const remove = async (id) => {
  const bundle = await Bundle.findByPk(id);
  if (!bundle) {
    throw new NotFoundError('Bundle no encontrado');
  }
  await bundle.destroy();
  return bundle;
};

export const restore = async (id) => {
  const bundle = await Bundle.findByPk(id, { paranoid: false });
  if (!bundle) {
    throw new NotFoundError('Bundle no encontrado');
  }
  if (!bundle.deletedAt) {
    throw new ConflictError('El bundle no está eliminado');
  }
  await bundle.restore();
  return getFullBundle(bundle.id);
};
