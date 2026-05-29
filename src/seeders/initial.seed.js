import Dimension from '../models/dimension.model.js';
import StackConfig from '../models/stack_config.model.js';
import Order from '../models/order.model.js';
import OrderItem from '../models/order_item.model.js';
import Bundle from '../models/bundle.model.js';
import sequelize from '../config/db.config.js';
import { findOrCreate as findOrCreateStackConfig } from '../services/stack_config.service.js';

const seedData = [
  { thickness: 45, width: 70, length: 3200, widthStack: 15, heightStack: 14 },
  { thickness: 90, width: 100, length: 3200, widthStack: 10, heightStack: 8 },
  { thickness: 18, width: 100, length: 3200, widthStack: 10, heightStack: 40 },
  { thickness: 18, width: 70, length: 3200, widthStack: 14, heightStack: 40 },
  { thickness: 18, width: 90, length: 3200, widthStack: 11, heightStack: 40 },
  { thickness: 70, width: 90, length: 3200, widthStack: 11, heightStack: 10 },
  { thickness: 24, width: 100, length: 3200, widthStack: 10, heightStack: 28 },
  { thickness: 17, width: 70, length: 2440, widthStack: 14, heightStack: 40 },
  { thickness: 18, width: 100, length: 2440, widthStack: 10, heightStack: 40 },
  { thickness: 50, width: 50, length: 3200, widthStack: 20, heightStack: 14 },
  { thickness: 20, width: 98, length: 3200, widthStack: 10, heightStack: 36 },
  { thickness: 40, width: 90, length: 3200, widthStack: 12, heightStack: 18 },
  { thickness: 40, width: 90, length: 3200, widthStack: 11, heightStack: 18 },
  { thickness: 50, width: 75, length: 3200, widthStack: 13, heightStack: 14 },
  { thickness: 90, width: 90, length: 3200, widthStack: 11, heightStack: 8 },
  { thickness: 50, width: 50, length: 3200, widthStack: 20, heightStack: 14 },
];

const calculateSeparatorEvery = (heightStack) => {
  if (heightStack <= 10) return heightStack;
  return Math.ceil(heightStack / 5);
};

export const seed = async () => {
  const existingCount = await Dimension.count();
  if (existingCount !== seedData.length) {
    for (const row of seedData) {
      const existing = await Dimension.findOne({
        where: {
          thickness: row.thickness,
          width: row.width,
          length: row.length,
        },
        paranoid: false,
      });

      if (existing && existing.deletedAt) {
        await existing.restore();
        continue;
      }

      if (existing) {
        continue;
      }

      await sequelize.transaction(async (t) => {
        const stackConfig = await findOrCreateStackConfig({
          widthStack: row.widthStack,
          heightStack: row.heightStack,
          separatorEvery: calculateSeparatorEvery(row.heightStack),
        }, t);

        await Dimension.create({
          thickness: row.thickness,
          width: row.width,
          length: row.length,
          defaultStackConfigId: stackConfig.id,
        }, { transaction: t });
      });
    }

    console.log(`✅ Seed inicial ejecutado: ${seedData.length} dimensiones y configuraciones`);
  } else {
    console.log('ℹ️ Seed inicial ya existe, omitiendo');
  }

  const orderCount = await Order.count();
  if (orderCount > 0) {
    console.log('ℹ️ Órdenes seed ya existen, omitiendo');
    return;
  }

  const [order1, order2, order3] = await Promise.all([
    Order.create({ client: 'Juan Pérez', status: 'pending', orderDate: new Date() }),
    Order.create({ client: 'Maderas del Sur', status: 'in_production', orderDate: new Date() }),
    Order.create({ client: 'Constructora del Norte', status: 'completed', orderDate: new Date(Date.now() - 86400000) }),
  ]);

  const items1 = await OrderItem.bulkCreate([
    { orderId: order1.id, dimensionId: 1, quantity: 10 },
    { orderId: order1.id, dimensionId: 3, quantity: 5 },
  ]);

  const items2 = await OrderItem.bulkCreate([
    { orderId: order2.id, dimensionId: 2, quantity: 6 },
    { orderId: order2.id, dimensionId: 5, quantity: 8 },
    { orderId: order2.id, dimensionId: 1, quantity: 3 },
  ]);

  const items3 = await OrderItem.bulkCreate([
    { orderId: order3.id, dimensionId: 6, quantity: 4 },
  ]);

  const dimensionIds = [1, 2, 3, 5, 6];
  const dimensions = await Dimension.findAll({
    where: { id: dimensionIds },
    include: [{ model: StackConfig, as: 'defaultStackConfig' }],
  });

  const dimMap = {};
  dimensions.forEach((d) => { dimMap[d.id] = d; });

  const calcBundle = (dimId, orderItemId) => {
    const dim = dimMap[dimId];
    const sc = dim.defaultStackConfig;
    const totalPieces = sc.widthStack * sc.heightStack;
    const cubicMeters = (dim.thickness * dim.width * dim.length * totalPieces) / 1_000_000_000;
    return { orderItemId, stackConfigId: dim.defaultStackConfigId, totalPieces, cubicMeters };
  };

  const bundleData = [
    calcBundle(2, items2[0].id),
    calcBundle(2, items2[0].id),
    calcBundle(5, items2[1].id),
  ];

  for (let i = 0; i < 4; i++) {
    bundleData.push(calcBundle(6, items3[0].id));
  }

  await Bundle.bulkCreate(bundleData);

  console.log(`✅ Datos seed de órdenes creados: 3 órdenes, 6 items, ${bundleData.length} bundles`);
};
