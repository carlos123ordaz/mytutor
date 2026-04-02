import { z } from 'zod';

export const createCourseSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all_levels']).default('all_levels'),
  tags: z.array(z.string()).optional(),
  iconUrl: z.string().url().optional().or(z.literal('')),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const courseRequestSchema = z.object({
  courseName: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
});

export const reviewCourseRequestSchema = z.object({
  adminNote: z.string().max(500).optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseRequestInput = z.infer<typeof courseRequestSchema>;
