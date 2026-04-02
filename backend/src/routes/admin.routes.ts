import { Router } from 'express';
import {
  getAdminStats,
  getAdminUsers,
  toggleUserActive,
  getAdminTeachers,
  toggleTeacherApproval,
  getAllReservations,
  getAllReviews,
  deleteReview,
  toggleReviewPublic,
} from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

export const adminRouter = Router();

adminRouter.get('/stats', authenticate, requireAdmin, getAdminStats);
adminRouter.get('/users', authenticate, requireAdmin, getAdminUsers);
adminRouter.patch('/users/:id/toggle-active', authenticate, requireAdmin, toggleUserActive);
adminRouter.get('/teachers', authenticate, requireAdmin, getAdminTeachers);
adminRouter.patch('/teachers/:id/toggle-approval', authenticate, requireAdmin, toggleTeacherApproval);
adminRouter.get('/reservations', authenticate, requireAdmin, getAllReservations);
adminRouter.get('/reviews', authenticate, requireAdmin, getAllReviews);
adminRouter.delete('/reviews/:id', authenticate, requireAdmin, deleteReview);
adminRouter.patch('/reviews/:id/toggle-public', authenticate, requireAdmin, toggleReviewPublic);
