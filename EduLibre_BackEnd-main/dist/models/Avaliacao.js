"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Aula_1 = __importDefault(require("./Aula"));
const User_1 = __importDefault(require("./User"));
class Avaliacao extends sequelize_1.Model {
}
Avaliacao.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    aulaId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, references: { model: 'Aulas', key: 'id' } },
    alunoId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
    nota: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    comentario: { type: sequelize_1.DataTypes.TEXT, allowNull: true, defaultValue: null },
}, { sequelize: database_1.default, tableName: 'Avaliacoes' });
User_1.default.hasMany(Avaliacao, { foreignKey: 'alunoId', as: 'avaliacoes' });
Avaliacao.belongsTo(User_1.default, { foreignKey: 'alunoId', as: 'aluno' });
Aula_1.default.hasMany(Avaliacao, { foreignKey: 'aulaId', as: 'avaliacoes' });
Avaliacao.belongsTo(Aula_1.default, { foreignKey: 'aulaId', as: 'aula' });
exports.default = Avaliacao;
