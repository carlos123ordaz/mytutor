import mongoose, { Schema } from 'mongoose';
import type { IUser } from '../types';

const teacherProfileSchema = new Schema({
  bio: { type: String, default: '' },
  headline: { type: String, default: '' },
  hourlyRate: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  languages: [{ type: String }],
  timezone: { type: String, default: 'UTC' },
  totalReviews: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  isProfileComplete: { type: Boolean, default: false },
  isApprovedByAdmin: { type: Boolean, default: false },
  videoUrl: { type: String },
}, { _id: false });

const studentProfileSchema = new Schema({
  bio: { type: String, default: '' },
  timezone: { type: String, default: 'UTC' },
}, { _id: false });

const userSchema = new Schema<IUser>({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  avatarUrl: { type: String },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  isActive: { type: Boolean, default: true },
  teacherProfile: { type: teacherProfileSchema },
  studentProfile: { type: studentProfileSchema },
}, { timestamps: true });

userSchema.index({ role: 1 });
userSchema.index({ 'teacherProfile.isApprovedByAdmin': 1, isActive: 1 });
userSchema.index({ 'teacherProfile.courses': 1 });

export const User = mongoose.model<IUser>('User', userSchema);
