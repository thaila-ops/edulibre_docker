import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Role from './Role';

class UserRoleAssignment extends Model<
  InferAttributes<UserRoleAssignment>,
  InferCreationAttributes<UserRoleAssignment>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare roleId: number;
}

UserRoleAssignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'UserRoleAssignments',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'roleId'],
      },
    ],
  },
);

User.belongsToMany(Role, {
  through: UserRoleAssignment,
  as: 'roles',
  foreignKey: 'userId',
  otherKey: 'roleId',
});

Role.belongsToMany(User, {
  through: UserRoleAssignment,
  as: 'usuarios',
  foreignKey: 'roleId',
  otherKey: 'userId',
});

export default UserRoleAssignment;