import 'dotenv/config';
import normalizeLegacyBirthDates from './config/database/normalize-legacy-birth-dates';
import app from './app';
import sequelize from './config/database';
import './models/User';
import './models/Aula';
import './models/Agendamento';
import './models/Avaliacao';
import './models/Notificacao';
import './models/Role';
import './models/Permission';
import './models/RolePermission';
import './models/UserRoleAssignment';
import RbacService from './services/rbac.service';
import { redisClient } from './config/redis';
import { startAulaCriadaSubscriber } from './events/aula-criada.subscriber';

const port = Number(process.env.PORT) || 3001;

async function ensurePasswordResetColumns() {
  const [rows] = await sequelize.query('SHOW COLUMNS FROM Users') as unknown as [
    Array<{ Field: string }>,
    unknown,
  ];
  const existingColumns = new Set(rows.map((row) => row.Field));
  const missingDefinitions = [
    !existingColumns.has('passwordResetCodeHash')
      ? 'ADD COLUMN passwordResetCodeHash VARCHAR(255) NULL'
      : null,
    !existingColumns.has('passwordResetExpiresAt')
      ? 'ADD COLUMN passwordResetExpiresAt DATETIME NULL'
      : null,
    !existingColumns.has('passwordResetAttempts')
      ? 'ADD COLUMN passwordResetAttempts INT NOT NULL DEFAULT 0'
      : null,
  ].filter((definition): definition is string => definition !== null);

  if (missingDefinitions.length > 0) {
    await sequelize.query(`ALTER TABLE Users ${missingDefinitions.join(', ')}`);
    console.info('[Banco] Colunas de recuperação de senha adicionadas.');
  }
}

async function ensurePaymentAuditColumns() {
  const [rows] = await sequelize.query('SHOW COLUMNS FROM Agendamentos') as unknown as [
    Array<{ Field: string }>,
    unknown,
  ];
  const existingColumns = new Set(rows.map((row) => row.Field));
  const missingDefinitions = [
    !existingColumns.has('paymentTransactionId')
      ? 'ADD COLUMN paymentTransactionId VARCHAR(255) NULL'
      : null,
    !existingColumns.has('paymentMethod')
      ? "ADD COLUMN paymentMethod ENUM('pix', 'card') NULL"
      : null,
    !existingColumns.has('paymentPaidAt')
      ? 'ADD COLUMN paymentPaidAt DATETIME NULL'
      : null,
  ].filter((definition): definition is string => definition !== null);

  if (missingDefinitions.length > 0) {
    await sequelize.query(`ALTER TABLE Agendamentos ${missingDefinitions.join(', ')}`);
    console.info('[Banco] Colunas de auditoria de pagamento adicionadas.');
  }
}

async function startServer() {
  await normalizeLegacyBirthDates();
  await ensurePasswordResetColumns();
  await ensurePaymentAuditColumns();
  await sequelize.sync();
  await RbacService.seed();
  await RbacService.migrateLegacyUsers();
  app.listen(port, () =>
    console.log(`Servidor EduLivre rodando na porta ${port}`),
  );
}

startServer().catch((error: Error) =>
  console.error('Falha ao iniciar servidor:', error.message),
);

void redisClient.connect().catch((error: Error) => {
  console.warn('[Redis] Não foi possível iniciar a conexão:', error.message);
});

void startAulaCriadaSubscriber().catch((error: unknown) => {
  console.warn(
    '[Eventos] Falha ao iniciar consumidor de aula.criada:',
    error instanceof Error ? error.message : 'Erro desconhecido',
  );
});
