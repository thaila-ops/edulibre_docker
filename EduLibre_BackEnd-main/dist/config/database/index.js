"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
require("dotenv/config");
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME ?? "edulivre", process.env.DB_USER ?? "root", process.env.DB_PASS ?? "", {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false
});
exports.default = sequelize;
