import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  client: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del cliente',
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha del pedido',
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_production', 'completed', 'delivered'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Estado del pedido',
  },
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true,
});

export default Order;
