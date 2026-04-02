import { User } from '../models/User';
import { Course } from '../models/Course';
import { Reservation } from '../models/Reservation';
import { Review } from '../models/Review';
import { CourseRequest } from '../models/CourseRequest';
import { subDays, startOfDay, format } from 'date-fns';
import type { PaginatedResult } from '../types';

export async function getAdminStats() {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    pendingTeacherApprovals,
    totalCourses,
    totalReservations,
    pendingCourseRequests,
    pendingReservations,
    completedReservations,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'teacher', 'teacherProfile.isApprovedByAdmin': false }),
    Course.countDocuments({ isActive: true }),
    Reservation.countDocuments(),
    CourseRequest.countDocuments({ status: 'pending' }),
    Reservation.countDocuments({ status: 'pending_review' }),
    Reservation.countDocuments({ status: 'completed' }),
  ]);

  // Reservations last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const day = subDays(new Date(), i);
    const start = startOfDay(day);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const count = await Reservation.countDocuments({
      createdAt: { $gte: start, $lt: end },
    });
    last7Days.push({ date: format(day, 'yyyy-MM-dd'), count });
  }

  return {
    totalUsers,
    totalStudents,
    totalTeachers,
    pendingTeacherApprovals,
    totalCourses,
    totalReservations,
    pendingCourseRequests,
    pendingReservations,
    completedReservations,
    reservationsLast7Days: last7Days,
  };
}

export async function getAdminUsers(
  filters: { role?: string; isActive?: boolean; search?: string; page?: number; limit?: number }
): Promise<PaginatedResult<unknown>> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};
  if (filters.role) query.role = filters.role;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [data, total] = await Promise.all([
    User.find(query).select('-__v').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  return User.findByIdAndUpdate(userId, { isActive }, { new: true });
}

export async function toggleTeacherApproval(teacherId: string, isApproved: boolean) {
  return User.findByIdAndUpdate(
    teacherId,
    { 'teacherProfile.isApprovedByAdmin': isApproved },
    { new: true }
  );
}

export async function getAdminTeachers(
  filters: { isApproved?: boolean; search?: string; page?: number; limit?: number }
): Promise<PaginatedResult<unknown>> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { role: 'teacher' };
  if (filters.isApproved !== undefined) {
    query['teacherProfile.isApprovedByAdmin'] = filters.isApproved;
  }
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [data, total] = await Promise.all([
    User.find(query)
      .select('name email avatarUrl isActive teacherProfile createdAt')
      .populate('teacherProfile.courses', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
