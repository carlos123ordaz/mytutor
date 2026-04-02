import { Router } from 'express';
import {
  listTeachers,
  getTeacherProfile,
  getMyTeacherProfile,
  getTeacherAvailability,
  getTeacherSlotsForDate,
  registerAsTeacher,
  updateTeacherProfile,
} from '../controllers/teacher.controller';
import { authenticate, requireTeacher, requireStudent } from '../middlewares/auth.middleware';

export const teacherRouter = Router();

teacherRouter.get('/', listTeachers);
teacherRouter.post('/register', authenticate, requireStudent, registerAsTeacher);
teacherRouter.get('/profile', authenticate, requireTeacher, getMyTeacherProfile);
teacherRouter.patch('/profile', authenticate, requireTeacher, updateTeacherProfile);
teacherRouter.get('/:id', getTeacherProfile);
teacherRouter.get('/:id/availability', getTeacherAvailability);
teacherRouter.get('/:id/slots', getTeacherSlotsForDate);
