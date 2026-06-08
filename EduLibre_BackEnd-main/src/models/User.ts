import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from 'sequelize';
import sequelize from '../config/database';
import { UserRole } from '../types/api';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare password: string;
  declare cpf: string;
  declare dataNascimento: CreationOptional<Date | null>;
  declare tipo: UserRole;
  declare avatarUrl: CreationOptional<string | null>;
  declare bio: CreationOptional<string | null>;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    cpf: { type: DataTypes.STRING(11), allowNull: false, unique: true },
    dataNascimento: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
    tipo: { type: DataTypes.ENUM('usuario'), allowNull: false, defaultValue: 'usuario' },
    avatarUrl: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    bio: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  },
  { sequelize, tableName: 'Users' },
);

export default User;
