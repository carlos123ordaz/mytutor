import { Router } from 'express';
import multer from 'multer';
import {
  createReservation,
  getStudentReservations,
  getTeacherReservations,
  getReservationById,
  uploadPaymentProof,
  confirmReservation,
  rejectReservation,
  completeReservation,
  cancelReservation,
} from '../controllers/reservation.controller';
import { authenticate, requireStudent, requireTeacher } from '../middlewares/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const reservationRouter = Router();

reservationRouter.post('/', authenticate, requireStudent, createReservation);
reservationRouter.get('/mine', authenticate, requireStudent, getStudentReservations);
reservationRouter.get('/teacher', authenticate, requireTeacher, getTeacherReservations);
reservationRouter.get('/:id', authenticate, getReservationById);
reservationRouter.post('/:id/upload-payment', authenticate, requireStudent, upload.single('file'), uploadPaymentProof);
reservationRouter.patch('/:id/confirm', authenticate, requireTeacher, confirmReservation);
reservationRouter.patch('/:id/reject', authenticate, requireTeacher, rejectReservation);
reservationRouter.patch('/:id/complete', authenticate, requireTeacher, completeReservation);
reservationRouter.patch('/:id/cancel', authenticate, requireStudent, cancelReservation);
