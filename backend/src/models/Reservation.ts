import mongoose, { Schema, Document, Types } from 'mongoose';
import type { ReservationStatus } from '../types';

export interface IReservation extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  teacher: Types.ObjectId;
  course: Types.ObjectId;
  date: Date;
  startTime: string; // "HH:MM" UTC
  endTime: string;   // "HH:MM" UTC
  durationMinutes: number;
  status: ReservationStatus;
  paymentProof?: Types.ObjectId;
  meetLink?: string;
  notes?: string;
  teacherNotes?: string;
  rejectionReason?: string;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  endTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  durationMinutes: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending_payment_upload', 'pending_review', 'confirmed', 'rejected', 'completed', 'cancelled', 'no_show'],
    default: 'pending_payment_upload',
  },
  paymentProof: { type: Schema.Types.ObjectId, ref: 'Upload' },
  meetLink: { type: String },
  notes: { type: String },
  teacherNotes: { type: String },
  rejectionReason: { type: String },
  confirmedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
}, { timestamps: true });

reservationSchema.index({ student: 1, createdAt: -1 });
reservationSchema.index({ teacher: 1, status: 1 });
reservationSchema.index({ teacher: 1, date: 1, startTime: 1 });
reservationSchema.index({ status: 1, date: 1 });

export const Reservation = mongoose.model<IReservation>('Reservation', reservationSchema);
