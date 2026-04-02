import { Review, IReview } from '../models/Review';
import { Reservation } from '../models/Reservation';
import { recalculateTeacherRating } from './teacher.service';
import { createNotification } from './notification.service';
import { Types } from 'mongoose';
import type { PaginatedResult } from '../types';

export async function createReview(
  studentId: Types.ObjectId,
  data: { reservationId: string; rating: number; comment?: string }
): Promise<IReview> {
  // Validate reservation
  const reservation = await Reservation.findOne({
    _id: data.reservationId,
    student: studentId,
    status: 'completed',
  });
  if (!reservation) {
    throw new Error('Reservation not found or not completed');
  }

  // Check if review already exists
  const existing = await Review.findOne({ reservation: data.reservationId });
  if (existing) throw new Error('Review already submitted for this session');

  const review = await Review.create({
    student: studentId,
    teacher: reservation.teacher,
    reservation: data.reservationId,
    rating: data.rating,
    comment: data.comment,
  });

  // Recalculate teacher rating
  await recalculateTeacherRating(reservation.teacher.toString());

  // Notify teacher
  await createNotification({
    userId: reservation.teacher as Types.ObjectId,
    type: 'review_received',
    title: 'Nueva reseña recibida',
    message: `Recibiste una reseña de ${data.rating}/10`,
    relatedId: review._id,
    relatedModel: 'Review',
  });

  return review;
}

export async function getTeacherReviews(
  teacherId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResult<unknown>> {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Review.find({ teacher: teacherId, isPublic: true })
      .populate('student', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ teacher: teacherId, isPublic: true }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getStudentReviews(
  studentId: Types.ObjectId,
  page = 1,
  limit = 10
): Promise<PaginatedResult<unknown>> {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Review.find({ student: studentId })
      .populate('teacher', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ student: studentId }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getTeacherReceivedReviews(
  teacherId: Types.ObjectId,
  page = 1,
  limit = 10
): Promise<PaginatedResult<unknown>> {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Review.find({ teacher: teacherId })
      .populate('student', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ teacher: teacherId }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getAllReviewsAdmin(
  page = 1,
  limit = 20
): Promise<PaginatedResult<unknown>> {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Review.find()
      .populate('student', 'name email')
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function deleteReview(reviewId: string): Promise<void> {
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) throw new Error('Review not found');
  await recalculateTeacherRating(review.teacher.toString());
}

export async function toggleReviewPublic(reviewId: string): Promise<IReview | null> {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error('Review not found');
  review.isPublic = !review.isPublic;
  await review.save();
  await recalculateTeacherRating(review.teacher.toString());
  return review;
}
