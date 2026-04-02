import { z } from 'zod';

export const registerAsTeacherSchema = z.object({
  headline: z.string().min(10).max(200),
  bio: z.string().min(50).max(2000),
  hourlyRate: z.number().min(1).max(10000),
  currency: z.string().length(3).default('USD'),
  timezone: z.string().default('UTC'),
  languages: z.array(z.string().min(1)).min(1),
  courses: z.array(z.string()).optional().default([]),
  videoUrl: z.string().url().optional().or(z.literal('')),
});

export type RegisterAsTeacherInput = z.infer<typeof registerAsTeacherSchema>;

export const updateTeacherProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  headline: z.string().max(200).optional(),
  hourlyRate: z.number().min(1).max(10000).optional(),
  currency: z.string().length(3).optional(),
  languages: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  courses: z.array(z.string()).optional(),
});

export const updateStudentProfileSchema = z.object({
  bio: z.string().max(1000).optional(),
  timezone: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export type UpdateTeacherProfileInput = z.infer<typeof updateTeacherProfileSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
