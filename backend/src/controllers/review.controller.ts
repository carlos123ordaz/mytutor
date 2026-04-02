import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import * as reviewService from '../services/review.service';
import type { AuthRequest } from '../types';

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const { reservationId, rating, comment } = req.body as {
    reservationId: string;
    rating: number;
    comment?: string;
  };

  const review = await reviewService.createReview(req.user._id, { reservationId, rating, comment });

  return sendSuccess(res, review, 'Review submitted', 201);
});

export const getTeacherReviews = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { page, limit } = req.query as Record<string, string>;

  const result = await reviewService.getTeacherReviews(
    teacherId,
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 10
  );

  return sendPaginated(res, result.data as object[], result.total, result.page, result.limit);
});

export const getMyReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const { page, limit } = req.query as Record<string, string>;

  const result = await reviewService.getStudentReviews(
    req.user._id,
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 10
  );

  return sendPaginated(res, result.data as object[], result.total, result.page, result.limit);
});

export const getReceivedReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const { page, limit } = req.query as Record<string, string>;

  const result = await reviewService.getTeacherReceivedReviews(
    req.user._id,
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 10
  );

  return sendPaginated(res, result.data as object[], result.total, result.page, result.limit);
});
