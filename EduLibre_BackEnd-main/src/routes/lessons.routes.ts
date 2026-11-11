import { Router } from 'express';
import AvaliacoesController from '../controllers/avaliacoes.controller';
import AulasController from '../controllers/aulas.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import upload from '../config/upload';

const router = Router();

router.get('/aulas', AulasController.findAll);

router.get('/aulas/destaque', AulasController.featured);

router.post(
  '/aulas',
  authMiddleware,
  requirePermission('aulas.criar'),
  upload.single('image'),
  AulasController.create,
);

router.get('/aulas/:id', AulasController.getById);

router.put(
  '/aulas/:id',
  authMiddleware,
  requirePermission('aulas.editar_propria'),
  upload.single('image'),
  AulasController.update,
);

router.delete(
  '/aulas/:id',
  authMiddleware,
  requirePermission('aulas.excluir_propria'),
  AulasController.remove,
);

router.post(
  '/aulas/:id/avaliacoes',
  authMiddleware,
  AvaliacoesController.create,
);

router.patch(
  '/aulas/:id/bloquear',
  authMiddleware,
  requirePermission('aulas.bloquear'),
  AulasController.block,
);

router.patch(
  '/aulas/:id/desbloquear',
  authMiddleware,
  requirePermission('aulas.desbloquear'),
  AulasController.unblock,
);

export default router;
