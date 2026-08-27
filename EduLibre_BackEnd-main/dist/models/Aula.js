"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
class Aula extends sequelize_1.Model {
}
Aula.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    materia: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    valor: { type: sequelize_1.DataTypes.FLOAT, allowNull: false },
    descricao: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    imageUrl: { type: sequelize_1.DataTypes.TEXT('long'), allowNull: true, defaultValue: null },
    status: { type: sequelize_1.DataTypes.ENUM('ativa', 'bloqueada'), allowNull: false, defaultValue: 'ativa' },
    motivoBloqueio: { type: sequelize_1.DataTypes.TEXT, allowNull: true, defaultValue: null },
    professorId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
    },
}, { sequelize: database_1.default, tableName: 'Aulas' });
User_1.default.hasMany(Aula, { foreignKey: 'professorId', as: 'aulas' });
Aula.belongsTo(User_1.default, { foreignKey: 'professorId', as: 'professor' });
exports.default = Aula;
