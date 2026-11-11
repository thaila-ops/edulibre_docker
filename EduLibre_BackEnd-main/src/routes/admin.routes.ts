import { Router } from 'express';
import AulasController from '../controllers/aulas.controller';
import AdminController from '../controllers/admin.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';

const router = Router();

router.get(
  '/admin/dashboard',
  authMiddleware,
  requirePermission('admin.dashboard.visualizar'),
  AdminController.dashboard,
);

router.get(
  '/admin/aulas',
  authMiddleware,
  requirePermission('aulas.gerenciar_qualquer'),
  AulasController.findAllAdmin,
);

export default router;
