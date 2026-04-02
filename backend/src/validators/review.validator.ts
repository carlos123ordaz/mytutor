import { z } from 'zod';

export const createReviewSchema = z.object({
  reservationId: z.string().min(1),
  rating: z.number().int().min(1).max(10),
  comment: z.string().max(1000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
