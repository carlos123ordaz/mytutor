import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import * as notificationService from '../services/notification.service';
import type { AuthRequest } from '../types';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const { page, limit } = req.query as Record<string, string>;

  const result = await notificationService.getNotifications(
    req.user._id,
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 20
  );

  return sendSuccess(res, {
    notifications: result.notifications,
    total: result.total,
  });
});

export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  if (!notification) return sendError(res, 'Notification not found', 404);

  return sendSuccess(res, notification, 'Notification marked as read');
});

export const markAllNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  await notificationService.markAllAsRead(req.user._id);

  return sendSuccess(res, null, 'All notifications marked as read');
});
