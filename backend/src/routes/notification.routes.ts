import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

export const notificationRouter = Router();

notificationRouter.get('/', authenticate, getNotifications);
notificationRouter.patch('/read-all', authenticate, markAllNotificationsRead);
notificationRouter.patch('/:id/read', authenticate, markNotificationRead);
