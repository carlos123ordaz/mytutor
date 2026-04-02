import mongoose, { Schema, Document, Types } from 'mongoose';
import type { CourseRequestStatus } from '../types';

export interface ICourseRequest extends Document {
  _id: Types.ObjectId;
  teacher: Types.ObjectId;
  courseName: string;
  description?: string;
  category?: string;
  status: CourseRequestStatus;
  adminNote?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const courseRequestSchema = new Schema<ICourseRequest>({
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseName: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNote: { type: String },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
}, { timestamps: true });

courseRequestSchema.index({ status: 1, createdAt: -1 });
courseRequestSchema.index({ teacher: 1 });

export const CourseRequest = mongoose.model<ICourseRequest>('CourseRequest', courseRequestSchema);
