import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import sequelize from '../config/database';
import Aula from './Aula';
import User from './User';

class Notificacao extends Model<
  InferAttributes<Notificacao>,
  InferCreationAttributes<Notificacao>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare aulaId: CreationOptional<number | null>;
  declare tipo: 'aula_bloqueada' | 'aula_desbloqueada';
  declare titulo: string;
  declare mensagem: string;
  declare lida: CreationOptional<boolean>;
}

Notificacao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    aulaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Aulas', key: 'id' },
    },
    tipo: {
      type: DataTypes.ENUM('aula_bloqueada', 'aula_desbloqueada'),
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'Notificacoes',
  },
);

User.hasMany(Notificacao, {
  foreignKey: 'userId',
  as: 'notificacoes',
});

Notificacao.belongsTo(User, {
  foreignKey: 'userId',
  as: 'usuario',
});

Aula.hasMany(Notificacao, {
  foreignKey: 'aulaId',
  as: 'notificacoes',
});

Notificacao.belongsTo(Aula, {
  foreignKey: 'aulaId',
  as: 'aula',
});

export default Notificacao;