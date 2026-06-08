import { Sequelize } from "sequelize";
import "dotenv/config";

const sequelize = new Sequelize(
    process.env.DB_NAME ?? "edulivre",
    process.env.DB_USER ?? "root",
    process.env.DB_PASS ?? "",
    {
        host: process.env.DB_HOST ?? 'database',
        port: Number(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        logging: false
    }
);

export default sequelize;
