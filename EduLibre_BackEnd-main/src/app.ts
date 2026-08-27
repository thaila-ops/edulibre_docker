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
import AdminController from './controllers/admin.controller';
import authMiddleware from './middlewares/auth.middleware';
import { requirePermission } from './middlewares/permission.middleware';
import HttpError from './utils/http-error';
import path from 'path';
import upload from './config/upload';

const app = express();
app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '5mb' }));
app.use(
  '/uploads',
  express.static(path.resolve(process.cwd(), 'uploads')),
);
app.use(cors({ origin: ['http://localhost:3000', 'https://edulibre.local'], credentials: false }));
app.use(limiter);

app.get('/', AuthController.health);
app.post('/login', AuthController.login);
app.get('/auth/me', authMiddleware, AuthController.me);

app.post('/usuarios', UsersController.create);
app.get('/usuarios', authMiddleware, requirePermission('usuarios.listar'), UsersController.findAll,);
app.get('/usuarios/me', authMiddleware, UsersController.profile);
app.post('/usuarios/me/tornar-professor', authMiddleware, UsersController.tornarProfessor,);
app.get('/usuarios/:id', authMiddleware, UsersController.getById);
app.put('/usuarios/:id', authMiddleware, UsersController.update);
app.delete('/usuarios/:id', authMiddleware, UsersController.remove);
app.patch(
  '/usuarios/:id/promover',
  authMiddleware,
  requirePermission('usuarios.papel.gerenciar'),
  AdminController.promote,
);

app.patch(
  '/usuarios/:id/rebaixar',
  authMiddleware,
  requirePermission('usuarios.papel.gerenciar'),
  AdminController.demote,
);

app.patch(
  '/usuarios/:id/papeis',
  authMiddleware,
  requirePermission('usuarios.papel.gerenciar'),
  AdminController.grantRole,
);

app.delete(
  '/usuarios/:id/papeis/:role',
  authMiddleware,
  requirePermission('usuarios.papel.gerenciar'),
  AdminController.revokeRole,
);

app.get('/aulas', AulasController.findAll);
app.get('/aulas/destaque', AulasController.featured);
app.post( '/aulas',  authMiddleware, requirePermission('aulas.criar'),  upload.single('image'),  AulasController.create,);
app.get('/aulas/:id', AulasController.getById);
app.put( '/aulas/:id', authMiddleware, requirePermission('aulas.editar_propria'), upload.single('image'), AulasController.update,);
app.delete( '/aulas/:id', authMiddleware, requirePermission('aulas.excluir_propria'), AulasController.remove,);
app.post('/aulas/:id/avaliacoes', authMiddleware, AvaliacoesController.create);
app.patch('/aulas/:id/bloquear', authMiddleware, requirePermission('aulas.bloquear'), AulasController.block,);
app.patch('/aulas/:id/desbloquear', authMiddleware, requirePermission('aulas.desbloquear'), AulasController.unblock,);
app.get( '/admin/dashboard', authMiddleware, requirePermission('admin.dashboard.visualizar'), AdminController.dashboard,);
app.get( '/admin/aulas', authMiddleware, requirePermission('aulas.gerenciar_qualquer'), AulasController.findAllAdmin,);
app.get('/agendamentos', authMiddleware, AgendamentosController.findAll);
app.post('/agendamentos', authMiddleware, requirePermission('aulas.contratar'), AgendamentosController.create);
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