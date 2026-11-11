import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import NotificacoesController from '../controllers/notificacoes.controller';

const router = Router();

router.get(
  '/notificacoes',
  authMiddleware,
  NotificacoesController.listarMinhas,
);

router.patch(
  '/notificacoes/:id/lida',
  authMiddleware,
  NotificacoesController.marcarComoLida,
);

export default router;
