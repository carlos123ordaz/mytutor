import { Course, ICourse } from '../models/Course';
import { CourseRequest } from '../models/CourseRequest';
import { User } from '../models/User';
import type { CreateCourseInput, UpdateCourseInput } from '../validators/course.validator';
import type { PaginatedResult } from '../types';
import { Types } from 'mongoose';

export async function getAllCourses(
  includeInactive = false,
  search?: string
): Promise<ICourse[]> {
  const filter: Record<string, unknown> = {};
  if (!includeInactive) filter.isActive = true;
  if (search) {
    filter.$text = { $search: search };
  }
  return Course.find(filter).sort({ name: 1 });
}

export async function getCourseById(id: string): Promise<ICourse | null> {
  return Course.findById(id);
}

export async function createCourse(
  data: CreateCourseInput,
  createdBy: Types.ObjectId
): Promise<ICourse> {
  return Course.create({ ...data, createdBy });
}

export async function updateCourse(
  id: string,
  data: UpdateCourseInput
): Promise<ICourse | null> {
  return Course.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function getTeachersForCourse(courseId: string) {
  return User.find({
    role: 'teacher',
    isActive: true,
    'teacherProfile.isApprovedByAdmin': true,
    'teacherProfile.courses': courseId,
  }).select('name email avatarUrl teacherProfile');
}

// Course Requests
export async function createCourseRequest(
  teacherId: Types.ObjectId,
  data: { courseName: string; description?: string; category?: string }
) {
  return CourseRequest.create({ teacher: teacherId, ...data });
}

export async function getCourseRequests(
  status?: string,
  page = 1,
  limit = 20
): Promise<PaginatedResult<unknown>> {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    CourseRequest.find(filter)
      .populate('teacher', 'name email avatarUrl')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CourseRequest.countDocuments(filter),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getTeacherCourseRequests(teacherId: Types.ObjectId) {
  return CourseRequest.find({ teacher: teacherId }).sort({ createdAt: -1 });
}

export async function approveCourseRequest(
  requestId: string,
  adminId: Types.ObjectId,
  adminNote?: string
) {
  const request = await CourseRequest.findById(requestId);
  if (!request) throw new Error('Course request not found');
  if (request.status !== 'pending') throw new Error('Request is not pending');

  // Create the course
  const course = await Course.create({
    name: request.courseName,
    description: request.description,
    category: request.category,
    createdBy: adminId,
  });

  request.status = 'approved';
  request.reviewedBy = adminId;
  request.reviewedAt = new Date();
  if (adminNote) request.adminNote = adminNote;
  await request.save();

  return { request, course };
}

export async function rejectCourseRequest(
  requestId: string,
  adminId: Types.ObjectId,
  adminNote?: string
) {
  const request = await CourseRequest.findById(requestId);
  if (!request) throw new Error('Course request not found');
  if (request.status !== 'pending') throw new Error('Request is not pending');

  request.status = 'rejected';
  request.reviewedBy = adminId;
  request.reviewedAt = new Date();
  if (adminNote) request.adminNote = adminNote;
  await request.save();

  return request;
}
