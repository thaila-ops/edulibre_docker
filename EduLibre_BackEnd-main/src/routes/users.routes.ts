import { Router } from 'express';
import UsersController from '../controllers/users.controller';
import AdminController from '../controllers/admin.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import upload from '../config/upload';

const router = Router();

router.post('/usuarios', UsersController.create);

router.get(
  '/usuarios',
  authMiddleware,
  requirePermission('usuarios.listar'),
  UsersController.findAll,
);

router.get('/usuarios/me', authMiddleware, UsersController.profile);

router.post(
  '/usuarios/me/tornar-professor',
  authMiddleware,
  UsersController.tornarProfessor,
);

router.get('/usuarios/:id', authMiddleware, UsersController.getById);

router.put(
  '/usuarios/:id',
  authMiddleware,
  upload.single('avatar'),
  UsersController.update,
);

router.delete('/usuarios/:id', authMiddleware, UsersController.remove);

router.patch(
  '/usuarios/:id/promover',
  authMiddleware,
  requirePermission('usuarios.papel.gerenciar'),
  AdminController.promote,
);

router.patch(
  '/usuarios/:id/rebaixar',
  authMiddleware,
  requirePermission('usuarios.papel.gerenciar'),
  AdminController.demote,
);

router.patch(
  '/usuarios/:id/papeis',
  authMiddleware,
  requirePermission('usuarios.papel.gerenciar'),
  AdminController.grantRole,
);

router.delete(
  '/usuarios/:id/papeis/:role',
  authMiddleware,
  requirePermission('usuarios.papel.gerenciar'),
  AdminController.revokeRole,
);

export default router;
