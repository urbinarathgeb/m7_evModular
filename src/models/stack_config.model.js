import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

class StackConfig extends Model {}

StackConfig.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dimensionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'dimensions',
      key: 'id',
    },
  },
  widthStack: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Cantidad de piezas a lo ancho',
  },
  heightStack: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Cantidad de piezas a lo alto',
  },
  separatorEvery: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Cantidad de filas entre cada separador',
  },
}, {
  sequelize,
  modelName: 'StackConfig',
  tableName: 'stack_configs',
  timestamps: true,
  underscored: true,
  paranoid: true,
});

export default StackConfig;
