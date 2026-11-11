import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

router.get('/', AuthController.health);

router.post('/login', AuthController.login);

router.get('/auth/me', authMiddleware, AuthController.me);

export default router;
