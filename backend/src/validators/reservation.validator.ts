import { z } from 'zod';

export const createReservationSchema = z.object({
  teacherId: z.string().min(1),
  courseId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  notes: z.string().max(1000).optional(),
});

export const confirmReservationSchema = z.object({
  meetLink: z.string().url('Meet link must be a valid URL'),
  teacherNotes: z.string().max(1000).optional(),
});

export const rejectReservationSchema = z.object({
  rejectionReason: z.string().min(1).max(500),
});

export const completeReservationSchema = z.object({
  teacherNotes: z.string().max(1000).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type ConfirmReservationInput = z.infer<typeof confirmReservationSchema>;
export type RejectReservationInput = z.infer<typeof rejectReservationSchema>;
