import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

class StackConfig extends Model {}

StackConfig.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
  indexes: [
    {
      unique: true,
      fields: ['width_stack', 'height_stack', 'separator_every'],
    },
  ],
});

export default StackConfig;
