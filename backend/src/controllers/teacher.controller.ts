import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import * as teacherService from '../services/teacher.service';
import { getAvailableSlotsForRange, getAvailableSlotsForDate } from '../utils/slots';
import type { AuthRequest } from '../types';
import { Types } from 'mongoose';
import { format } from 'date-fns';

export const listTeachers = asyncHandler(async (req, res) => {
  const { courseId, minRating, maxPrice, search, page, limit } = req.query as Record<string, string>;

  const result = await teacherService.getActiveTeachers({
    courseId,
    minRating: minRating ? parseFloat(minRating) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    search,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 12,
  });

  return sendPaginated(res, result.data as object[], result.total, result.page, result.limit);
});

export const getTeacherProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await teacherService.getTeacherPublicProfile(id);
  if (!result) return sendError(res, 'Teacher not found', 404);
  return sendSuccess(res, result);
});

export const getTeacherAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, days } = req.query as { startDate?: string; days?: string };

  const from = startDate || format(new Date(), 'yyyy-MM-dd');
  const numDays = days ? parseInt(days) : 30;

  const slots = await getAvailableSlotsForRange(
    new Types.ObjectId(id),
    from,
    numDays
  );

  // Transform to Record<string, boolean> — the calendar only needs to know
  // which dates have at least one available slot, not the slots themselves.
  const availability: Record<string, boolean> = {};
  for (const [date, dateSlots] of Object.entries(slots)) {
    availability[date] = dateSlots.some((s) => s.available);
  }

  return sendSuccess(res, availability);
});

export const getTeacherSlotsForDate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query as { date?: string };

  if (!date) return sendError(res, 'date query param required (YYYY-MM-DD)', 400);

  const slots = await getAvailableSlotsForDate(new Types.ObjectId(id), date);
  return sendSuccess(res, slots);
});

export const registerAsTeacher = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  try {
    const user = await teacherService.registerAsTeacher(req.user._id.toString(), req.body);
    return sendSuccess(res, user, 'Teacher registration submitted. Pending admin approval.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return sendError(res, message, 400);
  }
});

export const getMyTeacherProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const profile = await teacherService.getTeacherOwnProfile(req.user._id.toString());
  if (!profile) return sendError(res, 'Teacher profile not found', 404);
  return sendSuccess(res, profile);
});

export const updateTeacherProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const updated = await teacherService.updateTeacherProfile(req.user._id.toString(), req.body);
  return sendSuccess(res, updated, 'Profile updated');
});
