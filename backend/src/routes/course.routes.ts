import { Router } from 'express';
import {
  listCourses,
  getCourse,
  getTeachersForCourse,
  createCourse,
  updateCourse,
} from '../controllers/course.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCourseSchema } from '../validators/course.validator';

export const courseRouter = Router();

courseRouter.get('/', listCourses);
courseRouter.get('/:id', getCourse);
courseRouter.get('/:id/teachers', getTeachersForCourse);
courseRouter.post('/', authenticate, requireAdmin, validate(createCourseSchema), createCourse);
courseRouter.patch('/:id', authenticate, requireAdmin, updateCourse);
