import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const Bundle = sequelize.define('Bundle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'order_items',
      key: 'id',
    },
  },
  stackConfigId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stack_configs',
      key: 'id',
    },
  },
  producedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de producción del paquete',
  },
}, {
  tableName: 'bundles',
  timestamps: true,
  underscored: true,
});

export default Bundle;
