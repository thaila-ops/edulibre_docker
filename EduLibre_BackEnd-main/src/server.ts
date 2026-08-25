import 'dotenv/config';
import app from './app';
import sequelize from './config/database';
import './models/User';
import './models/Aula';
import './models/Agendamento';
import './models/Avaliacao';
import './models/Role';
import './models/Permission';
import './models/RolePermission';
import './models/UserRoleAssignment';
import RbacService from './services/rbac.service';

const port = Number(process.env.PORT) || 3001;

async function normalizeLegacyBirthDates() {
  try {
    await sequelize.query(`
      ALTER TABLE Users
      MODIFY COLUMN dataNascimento DATE NULL
    `);

    await sequelize.query(`
      UPDATE Users
      SET dataNascimento = NULL
      WHERE dataNascimento = '0000-00-00'
    `);
  } catch {
    // Banco novo ou schema antigo sem a coluna ainda.
  }
}

async function startServer() {
  await normalizeLegacyBirthDates();
  await sequelize.sync({ alter: true });
  await RbacService.seed();
  await RbacService.migrateLegacyUsers();
  app.listen(port, () => console.log(`Servidor EduLivre rodando na porta ${port}`));
}

startServer().catch((error: Error) => console.error('Falha ao iniciar servidor:', error.message));
