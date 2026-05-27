import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const StackConfig = sequelize.define('StackConfig', {
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
    comment: 'Ancho del apilado en milímetros',
  },
  heightStack: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Alto del apilado en milímetros',
  },
  separatorCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Cantidad de separadores entre piezas',
  },
}, {
  tableName: 'stack_configs',
  timestamps: true,
  underscored: true,
});

export default StackConfig;
