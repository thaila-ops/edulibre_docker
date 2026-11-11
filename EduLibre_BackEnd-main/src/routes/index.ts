import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import lessonsRoutes from './lessons.routes';
import bookingsRoutes from './bookings.routes';
import notificationsRoutes from './notifications.routes';
import adminRoutes from './admin.routes';

const router = Router();
router.use(authRoutes);
router.use(usersRoutes);
router.use(lessonsRoutes);
router.use(bookingsRoutes);
router.use(notificationsRoutes);
router.use(adminRoutes);

export default router;
