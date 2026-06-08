"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
require("./models/User");
require("./models/Aula");
require("./models/Agendamento");
require("./models/Avaliacao");
const port = Number(process.env.PORT) || 3001;
async function normalizeLegacyBirthDates() {
    try {
        await database_1.default.query(`
      ALTER TABLE Users
      MODIFY COLUMN dataNascimento DATE NULL
    `);
        await database_1.default.query(`
      UPDATE Users
      SET dataNascimento = NULL
      WHERE dataNascimento = '0000-00-00'
    `);
    }
    catch {
        // Banco novo ou schema antigo sem a coluna ainda.
    }
}
async function startServer() {
    await normalizeLegacyBirthDates();
    await database_1.default.sync({ alter: true });
    app_1.default.listen(port, () => console.log(`Servidor EduLivre rodando na porta ${port}`));
}
startServer().catch((error) => console.error('Falha ao iniciar servidor:', error.message));
