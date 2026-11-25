import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const passwordResetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Aguarde alguns minutos antes de solicitar outro código.' },
});

const passwordResetConfirmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas. Solicite um novo código mais tarde.' },
});

router.get('/', AuthController.health);
router.get('/health/ready', AuthController.readiness);

router.post('/login', AuthController.login);
router.post('/auth/password-reset/request', passwordResetRequestLimiter, AuthController.requestPasswordReset);
router.post('/auth/password-reset/confirm', passwordResetConfirmLimiter, AuthController.resetPassword);

router.get('/auth/me', authMiddleware, AuthController.me);

export default router;
