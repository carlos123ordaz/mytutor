import mongoose, { Schema, Document, Types } from 'mongoose';
import type { CourseLevel } from '../types';

export interface ICourse extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  category?: string;
  level: CourseLevel;
  tags: string[];
  iconUrl?: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, trim: true },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
    default: 'all_levels',
  },
  tags: [{ type: String, trim: true }],
  iconUrl: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

courseSchema.index({ isActive: 1, category: 1 });
courseSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Course = mongoose.model<ICourse>('Course', courseSchema);
