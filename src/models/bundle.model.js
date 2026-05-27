import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

class Bundle extends Model {}

Bundle.init({
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
  totalPieces: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Cantidad total de piezas (ancho * alto)',
  },
  cubicMeters: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    comment: 'Volumen total en metros cúbicos',
  },
}, {
  sequelize,
  modelName: 'Bundle',
  tableName: 'bundles',
  timestamps: true,
  underscored: true,
});

export default Bundle;
