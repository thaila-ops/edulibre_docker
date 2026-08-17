import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Aula extends Model<InferAttributes<Aula>, InferCreationAttributes<Aula>> {
  declare id: CreationOptional<number>;
  declare materia: string;
  declare valor: number;
  declare descricao: string | null;
  declare professorId: number;
  declare imageUrl: CreationOptional<string | null>;
  declare status: CreationOptional<'ativa' | 'bloqueada'>;
  declare motivoBloqueio: CreationOptional<string | null>;
}

Aula.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    materia: { type: DataTypes.STRING, allowNull: false },
    valor: { type: DataTypes.FLOAT, allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: true },
    imageUrl: { type: DataTypes.TEXT('long'), allowNull: true, defaultValue: null },
    status: { type: DataTypes.ENUM('ativa', 'bloqueada'), allowNull: false, defaultValue: 'ativa' },
    motivoBloqueio: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    professorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
  },
  { sequelize, tableName: 'Aulas' },
);

User.hasMany(Aula, { foreignKey: 'professorId', as: 'aulas' });
Aula.belongsTo(User, { foreignKey: 'professorId', as: 'professor' });

export default Aula;