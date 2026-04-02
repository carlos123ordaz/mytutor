import { Notification } from '../models/Notification';
import type { NotificationType } from '../types';
import { Types } from 'mongoose';

export async function createNotification(params: {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: Types.ObjectId;
  relatedModel?: string;
}) {
  return Notification.create({
    user: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    relatedId: params.relatedId,
    relatedModel: params.relatedModel,
  });
}

export async function getNotifications(userId: Types.ObjectId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ user: userId }),
  ]);
  return { notifications, total };
}

export async function markAsRead(notificationId: string, userId: Types.ObjectId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
}

export async function markAllAsRead(userId: Types.ObjectId) {
  return Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
}

export async function getUnreadCount(userId: Types.ObjectId): Promise<number> {
  return Notification.countDocuments({ user: userId, isRead: false });
}
