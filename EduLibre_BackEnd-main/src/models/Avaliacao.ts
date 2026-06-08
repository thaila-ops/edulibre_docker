import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import sequelize from '../config/database';
import Aula from './Aula';
import User from './User';

class Avaliacao extends Model<InferAttributes<Avaliacao>, InferCreationAttributes<Avaliacao>> {
  declare id: CreationOptional<number>;
  declare aulaId: number;
  declare alunoId: number;
  declare nota: number;
  declare comentario: CreationOptional<string | null>;
}

Avaliacao.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    aulaId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Aulas', key: 'id' } },
    alunoId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
    nota: { type: DataTypes.INTEGER, allowNull: false },
    comentario: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  },
  { sequelize, tableName: 'Avaliacoes' },
);

User.hasMany(Avaliacao, { foreignKey: 'alunoId', as: 'avaliacoes' });
Avaliacao.belongsTo(User, { foreignKey: 'alunoId', as: 'aluno' });
Aula.hasMany(Avaliacao, { foreignKey: 'aulaId', as: 'avaliacoes' });
Avaliacao.belongsTo(Aula, { foreignKey: 'aulaId', as: 'aula' });

export default Avaliacao;
