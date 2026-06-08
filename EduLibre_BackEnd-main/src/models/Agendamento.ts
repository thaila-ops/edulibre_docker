import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import sequelize from '../config/database';
import Aula from './Aula';
import User from './User';

class Agendamento extends Model<InferAttributes<Agendamento>, InferCreationAttributes<Agendamento>> {
  declare id: CreationOptional<number>;
  declare alunoId: number;
  declare aulaId: number;
  declare data: Date;
  declare bookingStatus: CreationOptional<'pendente' | 'aceito' | 'recusado'>;
  declare paymentStatus: CreationOptional<'pendente' | 'pago'>;
}

Agendamento.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    alunoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    aulaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Aulas', key: 'id' },
    },
    data: { type: DataTypes.DATE, allowNull: false },
    bookingStatus: { type: DataTypes.ENUM('pendente', 'aceito', 'recusado'), allowNull: false, defaultValue: 'pendente' },
    paymentStatus: { type: DataTypes.ENUM('pendente', 'pago'), allowNull: false, defaultValue: 'pendente' },
  },
  { sequelize, tableName: 'Agendamentos' },
);

User.hasMany(Agendamento, { foreignKey: 'alunoId', as: 'agendamentos' });
Agendamento.belongsTo(User, { foreignKey: 'alunoId', as: 'aluno' });
Aula.hasMany(Agendamento, { foreignKey: 'aulaId', as: 'agendamentos' });
Agendamento.belongsTo(Aula, { foreignKey: 'aulaId', as: 'aula' });

export default Agendamento;
