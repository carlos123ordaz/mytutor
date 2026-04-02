import { Router } from 'express';
import {
  createCourseRequest,
  getMyCourseRequests,
  getAllCourseRequests,
  approveCourseRequest,
  rejectCourseRequest,
} from '../controllers/course.controller';
import { authenticate, requireTeacher, requireAdmin } from '../middlewares/auth.middleware';

export const courseRequestRouter = Router();

courseRequestRouter.post('/', authenticate, requireTeacher, createCourseRequest);
courseRequestRouter.get('/mine', authenticate, requireTeacher, getMyCourseRequests);
courseRequestRouter.get('/', authenticate, requireAdmin, getAllCourseRequests);
courseRequestRouter.patch('/:id/approve', authenticate, requireAdmin, approveCourseRequest);
courseRequestRouter.patch('/:id/reject', authenticate, requireAdmin, rejectCourseRequest);
