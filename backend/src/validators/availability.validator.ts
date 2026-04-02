import { z } from 'zod';

const timeRegex = /^\d{2}:\d{2}$/;

export const weeklyAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Time must be HH:MM format'),
  endTime: z.string().regex(timeRegex, 'Time must be HH:MM format'),
  slotDurationMinutes: z.number().int().min(30).max(240).default(60),
}).refine((data) => data.startTime < data.endTime, {
  message: 'startTime must be before endTime',
  path: ['endTime'],
});

export const availabilityExceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  type: z.enum(['blocked', 'extra_available']),
  startTime: z.string().regex(timeRegex).optional(),
  endTime: z.string().regex(timeRegex).optional(),
  reason: z.string().max(500).optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) return data.startTime < data.endTime;
  return true;
}, { message: 'startTime must be before endTime', path: ['endTime'] });

export type WeeklyAvailabilityInput = z.infer<typeof weeklyAvailabilitySchema>;
export type AvailabilityExceptionInput = z.infer<typeof availabilityExceptionSchema>;
