import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

class Dimension extends Model {}

Dimension.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  thickness: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Espesor en milímetros',
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Ancho en milímetros',
  },
  length: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Largo en milímetros',
  },
  defaultStackConfigId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Configuración de apilado sugerida',
  },
}, {
  sequelize,
  modelName: 'Dimension',
  tableName: 'dimensions',
  timestamps: true,
  underscored: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['thickness', 'width', 'length'],
    },
  ],
});

export default Dimension;
