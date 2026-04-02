import mongoose, { Schema, Document, Types } from 'mongoose';
import type { ExceptionType } from '../types';

export interface IAvailabilityException extends Document {
  _id: Types.ObjectId;
  teacher: Types.ObjectId;
  date: Date;
  type: ExceptionType;
  startTime?: string; // null = full day
  endTime?: string;   // null = full day
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const availabilityExceptionSchema = new Schema<IAvailabilityException>({
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['blocked', 'extra_available'], required: true },
  startTime: { type: String, match: /^\d{2}:\d{2}$/ },
  endTime: { type: String, match: /^\d{2}:\d{2}$/ },
  reason: { type: String },
}, { timestamps: true });

availabilityExceptionSchema.index({ teacher: 1, date: 1 });

export const AvailabilityException = mongoose.model<IAvailabilityException>('AvailabilityException', availabilityExceptionSchema);
