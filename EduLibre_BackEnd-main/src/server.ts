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

async function startServer() {
  await normalizeLegacyBirthDates();
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