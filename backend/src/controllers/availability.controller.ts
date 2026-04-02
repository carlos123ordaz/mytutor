import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import * as availabilityService from '../services/availability.service';
import type { AuthRequest } from '../types';

export const getWeeklyAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  const slots = await availabilityService.getWeeklyAvailability(req.user._id);
  return sendSuccess(res, slots);
});

export const createWeeklySlot = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  const slot = await availabilityService.createWeeklySlot(req.user._id, req.body);
  return sendSuccess(res, slot, 'Availability slot created', 201);
});

export const updateWeeklySlot = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  const slot = await availabilityService.updateWeeklySlot(req.params.id, req.user._id, req.body);
  return sendSuccess(res, slot, 'Slot updated');
});

export const deleteWeeklySlot = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  await availabilityService.deleteWeeklySlot(req.params.id, req.user._id);
  return sendSuccess(res, null, 'Slot deleted');
});

export const getExceptions = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  const { from } = req.query as { from?: string };
  const exceptions = await availabilityService.getExceptions(req.user._id, from);
  return sendSuccess(res, exceptions);
});

export const createException = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  const exception = await availabilityService.createException(req.user._id, req.body);
  return sendSuccess(res, exception, 'Exception created', 201);
});

export const updateException = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  const exception = await availabilityService.updateException(req.params.id, req.user._id, req.body);
  if (!exception) return sendError(res, 'Exception not found', 404);
  return sendSuccess(res, exception, 'Exception updated');
});

export const deleteException = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  await availabilityService.deleteException(req.params.id, req.user._id);
  return sendSuccess(res, null, 'Exception deleted');
});
