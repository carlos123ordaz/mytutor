import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import * as courseService from '../services/course.service';
import type { AuthRequest } from '../types';

export const listCourses = asyncHandler(async (req, res) => {
  const { search, includeInactive } = req.query as { search?: string; includeInactive?: string };
  const courses = await courseService.getAllCourses(includeInactive === 'true', search);
  return sendSuccess(res, courses);
});

export const getCourse = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);
  if (!course) return sendError(res, 'Course not found', 404);
  return sendSuccess(res, course);
});

export const createCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  const course = await courseService.createCourse(req.body, req.user._id);
  return sendSuccess(res, course, 'Course created', 201);
});

export const updateCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const course = await courseService.updateCourse(req.params.id, req.body);
  if (!course) return sendError(res, 'Course not found', 404);
  return sendSuccess(res, course, 'Course updated');
});

export const getTeachersForCourse = asyncHandler(async (req, res) => {
  const teachers = await courseService.getTeachersForCourse(req.params.id);
  return sendSuccess(res, teachers);
});

// Course Requests
export const createCourseRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  const request = await courseService.createCourseRequest(req.user._id, req.body);
  return sendSuccess(res, request, 'Course request submitted', 201);
});

export const getMyCourseRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  const requests = await courseService.getTeacherCourseRequests(req.user._id);
  return sendSuccess(res, requests);
});

export const getAllCourseRequests = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query as Record<string, string>;
  const result = await courseService.getCourseRequests(
    status,
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 20
  );
  return sendPaginated(res, result.data as object[], result.total, result.page, result.limit);
});

export const approveCourseRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  const { adminNote } = req.body as { adminNote?: string };
  const result = await courseService.approveCourseRequest(req.params.id, req.user._id, adminNote);
  return sendSuccess(res, result, 'Course request approved');
});

export const rejectCourseRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  const { adminNote } = req.body as { adminNote?: string };
  const result = await courseService.rejectCourseRequest(req.params.id, req.user._id, adminNote);
  return sendSuccess(res, result, 'Course request rejected');
});
