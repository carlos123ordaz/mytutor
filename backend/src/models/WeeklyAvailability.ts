import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWeeklyAvailability extends Document {
  _id: Types.ObjectId;
  teacher: Types.ObjectId;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // "HH:MM" UTC
  endTime: string;   // "HH:MM" UTC
  slotDurationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const weeklyAvailabilitySchema = new Schema<IWeeklyAvailability>({
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  endTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  slotDurationMinutes: { type: Number, default: 60, min: 30, max: 240 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

weeklyAvailabilitySchema.index({ teacher: 1, dayOfWeek: 1 });

export const WeeklyAvailability = mongoose.model<IWeeklyAvailability>('WeeklyAvailability', weeklyAvailabilitySchema);
