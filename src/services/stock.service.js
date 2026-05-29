import { Op } from 'sequelize';
import Order from '../models/order.model.js';
import OrderItem from '../models/order_item.model.js';
import Dimension from '../models/dimension.model.js';
import StackConfig from '../models/stack_config.model.js';
import Bundle from '../models/bundle.model.js';

export const getStock = async () => {
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
  });

  const stockMap = new Map();

  for (const order of orders) {
    for (const item of order.items) {
      const dimension = item.dimension;
      const key = `${dimension.thickness}x${dimension.width}x${dimension.length}`;
      const produced = item.bundles?.length || 0;
      const quantity = item.quantity;

      if (!stockMap.has(key)) {
        stockMap.set(key, {
          dimension: key,
          stackConfig: dimension.defaultStackConfig
            ? `${dimension.defaultStackConfig.widthStack}x${dimension.defaultStackConfig.heightStack}`
            : null,
          totalOrdered: 0,
          totalProduced: 0,
          orders: [],
        });
      }

      const stockItem = stockMap.get(key);
      stockItem.totalOrdered += quantity;
      stockItem.totalProduced += produced;
      stockItem.orders.push({
        orderId: order.id,
        client: order.client,
        status: order.status,
        quantity,
        produced,
      });
    }
  }

  const stock = Array.from(stockMap.values()).map((item) => ({
    ...item,
    totalPending: Math.max(0, item.totalOrdered - item.totalProduced),
  }));

  stock.sort((a, b) => a.dimension.localeCompare(b.dimension));

  return stock;
};
