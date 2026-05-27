import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  dimensionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'dimensions',
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Cantidad de paquetes a producir',
  },
}, {
  tableName: 'order_items',
  timestamps: true,
  underscored: true,
});

export default OrderItem;
