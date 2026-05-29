import Dimension from '../models/dimension.model.js';
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
  if (existingCount === seedData.length) {
    console.log('ℹ️ Seed inicial ya existe, omitiendo');
    return;
  }

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
};
