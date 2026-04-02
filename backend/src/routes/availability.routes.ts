import { Router } from 'express';
import {
  getWeeklyAvailability,
  createWeeklySlot,
  updateWeeklySlot,
  deleteWeeklySlot,
  getExceptions,
  createException,
  updateException,
  deleteException,
} from '../controllers/availability.controller';
import { authenticate, requireTeacher } from '../middlewares/auth.middleware';

export const availabilityRouter = Router();

availabilityRouter.get('/weekly', authenticate, requireTeacher, getWeeklyAvailability);
availabilityRouter.post('/weekly', authenticate, requireTeacher, createWeeklySlot);
availabilityRouter.patch('/weekly/:id', authenticate, requireTeacher, updateWeeklySlot);
availabilityRouter.delete('/weekly/:id', authenticate, requireTeacher, deleteWeeklySlot);

availabilityRouter.get('/exceptions', authenticate, requireTeacher, getExceptions);
availabilityRouter.post('/exceptions', authenticate, requireTeacher, createException);
availabilityRouter.patch('/exceptions/:id', authenticate, requireTeacher, updateException);
availabilityRouter.delete('/exceptions/:id', authenticate, requireTeacher, deleteException);
