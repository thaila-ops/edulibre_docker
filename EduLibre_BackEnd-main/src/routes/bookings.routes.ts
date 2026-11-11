import { Router } from 'express';
import AgendamentosController from '../controllers/agendamentos.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';

const router = Router();

router.get('/agendamentos', authMiddleware, AgendamentosController.findAll);

router.post(
  '/agendamentos',
  authMiddleware,
  requirePermission('aulas.contratar'),
  AgendamentosController.create,
);

router.get('/agendamentos/:id', authMiddleware, AgendamentosController.getById);

router.put('/agendamentos/:id', authMiddleware, AgendamentosController.update);

router.patch(
  '/agendamentos/:id/aceitar',
  authMiddleware,
  AgendamentosController.accept,
);

router.patch(
  '/agendamentos/:id/recusar',
  authMiddleware,
  AgendamentosController.reject,
);

router.patch(
  '/agendamentos/:id/pagar',
  authMiddleware,
  AgendamentosController.pay,
);

router.delete(
  '/agendamentos/:id',
  authMiddleware,
  AgendamentosController.remove,
);

export default router;
