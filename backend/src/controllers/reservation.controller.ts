import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import * as reservationService from '../services/reservation.service';
import * as uploadService from '../services/upload.service';
import type { AuthRequest } from '../types';
import type { ReservationStatus } from '../types';

export const createReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const { teacherId, courseId, date, startTime, notes } = req.body as {
    teacherId: string;
    courseId: string;
    date: string;
    startTime: string;
    notes?: string;
  };

  const reservation = await reservationService.createReservation(req.user._id, {
    teacherId,
    courseId,
    date,
    startTime,
    notes,
  });

  return sendSuccess(res, reservation, 'Reservation created', 201);
});

export const getStudentReservations = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const { status, page, limit } = req.query as Record<string, string>;

  const result = await reservationService.getStudentReservations(
    req.user._id,
    status as ReservationStatus | undefined,
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 10
  );

  return sendPaginated(res, result.data as object[], result.total, result.page, result.limit);
});

export const getTeacherReservations = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const { status, page, limit } = req.query as Record<string, string>;

  const result = await reservationService.getTeacherReservations(
    req.user._id,
    status as ReservationStatus | undefined,
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 10
  );

  return sendPaginated(res, result.data as object[], result.total, result.page, result.limit);
});

export const getReservationById = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const reservation = await reservationService.getReservationById(
    req.params.id,
    req.user._id,
    req.user.role
  );

  if (!reservation) return sendError(res, 'Reservation not found or access denied', 404);

  return sendSuccess(res, reservation);
});

export const uploadPaymentProof = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  if (!req.file) return sendError(res, 'No file uploaded', 400);

  const upload = await uploadService.uploadPaymentProof(req.user._id, req.file);
  const reservation = await reservationService.uploadPaymentProof(
    req.params.id,
    req.user._id,
    upload._id
  );

  return sendSuccess(res, reservation, 'Payment proof uploaded');
});

export const confirmReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const { meetLink, teacherNotes } = req.body as { meetLink: string; teacherNotes?: string };

  const reservation = await reservationService.confirmReservation(
    req.params.id,
    req.user._id,
    meetLink,
    teacherNotes
  );

  return sendSuccess(res, reservation, 'Reservation confirmed');
});

export const rejectReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const { rejectionReason } = req.body as { rejectionReason: string };

  const reservation = await reservationService.rejectReservation(
    req.params.id,
    req.user._id,
    rejectionReason
  );

  return sendSuccess(res, reservation, 'Reservation rejected');
});

export const completeReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const reservation = await reservationService.completeReservation(req.params.id, req.user._id);

  return sendSuccess(res, reservation, 'Reservation marked as completed');
});

export const cancelReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const reservation = await reservationService.cancelReservation(req.params.id, req.user._id);

  return sendSuccess(res, reservation, 'Reservation cancelled');
});
