"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Aula_1 = __importDefault(require("./Aula"));
const User_1 = __importDefault(require("./User"));
class Agendamento extends sequelize_1.Model {
}
Agendamento.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    alunoId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
    },
    aulaId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Aulas', key: 'id' },
    },
    data: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    bookingStatus: { type: sequelize_1.DataTypes.ENUM('pendente', 'aceito', 'recusado'), allowNull: false, defaultValue: 'pendente' },
    paymentStatus: { type: sequelize_1.DataTypes.ENUM('pendente', 'pago'), allowNull: false, defaultValue: 'pendente' },
}, { sequelize: database_1.default, tableName: 'Agendamentos' });
User_1.default.hasMany(Agendamento, { foreignKey: 'alunoId', as: 'agendamentos' });
Agendamento.belongsTo(User_1.default, { foreignKey: 'alunoId', as: 'aluno' });
Aula_1.default.hasMany(Agendamento, { foreignKey: 'aulaId', as: 'agendamentos' });
Agendamento.belongsTo(Aula_1.default, { foreignKey: 'aulaId', as: 'aula' });
exports.default = Agendamento;
