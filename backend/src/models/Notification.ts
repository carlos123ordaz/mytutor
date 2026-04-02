import mongoose, { Schema, Document, Types } from 'mongoose';
import type { NotificationType } from '../types';

export interface INotification extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: Types.ObjectId;
  relatedModel?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'reservation_created', 'reservation_confirmed', 'reservation_rejected',
      'meet_link_added', 'session_completed', 'review_received',
      'course_request_approved', 'course_request_rejected',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedId: { type: Schema.Types.ObjectId },
  relatedModel: { type: String },
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
