import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import * as adminService from '../services/admin.service';
import * as reservationService from '../services/reservation.service';
import * as reviewService from '../services/review.service';
import type { AuthRequest } from '../types';

export const getAdminStats = asyncHandler(async (_req, res) => {
  const stats = await adminService.getAdminStats();
  return sendSuccess(res, stats);
});

export const getAdminUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search, page, limit } = req.query as Record<string, string>;

  const result = await adminService.getAdminUsers({
    role,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    search,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
  });

  return sendPaginated(res, result.data as object[], result.total, result.page, result.limit);
});

export const toggleUserActive = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const { isActive } = req.body as { isActive: boolean };
  const user = await adminService.toggleUserActive(req.params.id, isActive);

  if (!user) return sendError(res, 'User not found', 404);

  return sendSuccess(res, user, `User ${isActive ? 'activated' : 'deactivated'}`);
});

export const getAdminTeachers = asyncHandler(async (req, res) => {
  const { isApproved, search, page, limit } = req.query as Record<string, string>;

  const result = await adminService.getAdminTeachers({
    isApproved: isApproved !== undefined ? isApproved === 'true' : undefined,
    search,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
  });

  return sendPaginated(res, result.data as object[], result.total, result.page, result.limit);
});

export const toggleTeacherApproval = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const { isApproved } = req.body as { isApproved: boolean };
  const teacher = await adminService.toggleTeacherApproval(req.params.id, isApproved);

  if (!teacher) return sendError(res, 'Teacher not found', 404);

  return sendSuccess(res, teacher, `Teacher ${isApproved ? 'approved' : 'unapproved'}`);
});

export const getAllReservations = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query as Record<string, string>;

  const result = await reservationService.getAllReservations({
    status,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
  });

  return sendPaginated(res, result.data as object[], result.total, result.page, result.limit);
});

export const getAllReviews = asyncHandler(async (req, res) => {
  const { page, limit } = req.query as Record<string, string>;

  const result = await reviewService.getAllReviewsAdmin(
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 20
  );

  return sendPaginated(res, result.data as object[], result.total, result.page, result.limit);
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id);
  return sendSuccess(res, null, 'Review deleted');
});

export const toggleReviewPublic = asyncHandler(async (req, res) => {
  const review = await reviewService.toggleReviewPublic(req.params.id);
  return sendSuccess(res, review, 'Review visibility toggled');
});
