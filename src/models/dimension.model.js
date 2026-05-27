import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

class Dimension extends Model {}

Dimension.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Ancho en milímetros',
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Alto en milímetros',
  },
  length: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Largo en milímetros',
  },
}, {
  sequelize,
  modelName: 'Dimension',
  tableName: 'dimensions',
  timestamps: true,
  underscored: true,
});

export default Dimension;
