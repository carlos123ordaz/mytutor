import { Router } from 'express';
import {
  createReview,
  getTeacherReviews,
  getMyReviews,
  getReceivedReviews,
} from '../controllers/review.controller';
import { authenticate, requireStudent, requireTeacher } from '../middlewares/auth.middleware';

export const reviewRouter = Router();

reviewRouter.post('/', authenticate, requireStudent, createReview);
reviewRouter.get('/teacher/:teacherId', getTeacherReviews);
reviewRouter.get('/mine', authenticate, requireStudent, getMyReviews);
reviewRouter.get('/received', authenticate, requireTeacher, getReceivedReviews);
