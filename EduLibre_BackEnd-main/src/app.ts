import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { UniqueConstraintError } from 'sequelize';
import AuthController from './controllers/auth.controller';
import AvaliacoesController from './controllers/avaliacoes.controller';
import AulasController from './controllers/aulas.controller';
import AgendamentosController from './controllers/agendamentos.controller';
import UsersController from './controllers/users.controller';
import authMiddleware from './middlewares/auth.middleware';
import HttpError from './utils/http-error';

const app = express();
app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '5mb' }));
app.use(cors({ origin: ['http://localhost:3000', 'https://edulibre.local'], credentials: false }));
app.use(limiter);

app.get('/', AuthController.health);
app.post('/login', AuthController.login);
app.get('/auth/me', authMiddleware, AuthController.me);

app.post('/usuarios', UsersController.create);
app.get('/usuarios', authMiddleware, UsersController.findAll);
app.get('/usuarios/me', authMiddleware, UsersController.profile);
app.get('/usuarios/:id', authMiddleware, UsersController.getById);
app.put('/usuarios/:id', authMiddleware, UsersController.update);
app.delete('/usuarios/:id', authMiddleware, UsersController.remove);

app.get('/aulas', AulasController.findAll);
app.get('/aulas/destaque', AulasController.featured);
app.post('/aulas', authMiddleware, AulasController.create);
app.get('/aulas/:id', AulasController.getById);
app.put('/aulas/:id', authMiddleware, AulasController.update);
app.delete('/aulas/:id', authMiddleware, AulasController.remove);
app.post('/aulas/:id/avaliacoes', authMiddleware, AvaliacoesController.create);

app.get('/agendamentos', authMiddleware, AgendamentosController.findAll);
app.post('/agendamentos', authMiddleware, AgendamentosController.create);
app.get('/agendamentos/:id', authMiddleware, AgendamentosController.getById);
app.put('/agendamentos/:id', authMiddleware, AgendamentosController.update);
app.patch('/agendamentos/:id/aceitar', authMiddleware, AgendamentosController.accept);
app.patch('/agendamentos/:id/recusar', authMiddleware, AgendamentosController.reject);
app.patch('/agendamentos/:id/pagar', authMiddleware, AgendamentosController.pay);
app.delete('/agendamentos/:id', authMiddleware, AgendamentosController.remove);

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('ERRO CAPTURADO:', error.message, error.stack);
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ message: 'Já existe um registo com estes dados.' });
  }
  return res.status(500).json({ message: 'Erro interno do servidor.' });
});

export default app;
