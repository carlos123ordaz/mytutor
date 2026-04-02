import mongoose, { Types } from 'mongoose';
import { Reservation, IReservation } from '../models/Reservation';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { isSlotAvailable } from '../utils/slots';
import { createNotification } from './notification.service';
import { parseISO, format } from 'date-fns';
import type { PaginatedResult, ReservationStatus } from '../types';

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export async function createReservation(
  studentId: Types.ObjectId,
  data: { teacherId: string; courseId: string; date: string; startTime: string; notes?: string }
): Promise<IReservation> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate teacher
    const teacher = await User.findOne({
      _id: data.teacherId,
      role: 'teacher',
      isActive: true,
      'teacherProfile.isApprovedByAdmin': true,
    }).session(session);
    if (!teacher) throw new Error('Teacher not found or inactive');

    // Validate course
    const course = await Course.findOne({ _id: data.courseId, isActive: true }).session(session);
    if (!course) throw new Error('Course not found or inactive');

    // Check slot availability (includes existing reservations check)
    const teacherObjectId = new Types.ObjectId(data.teacherId);
    const available = await isSlotAvailable(teacherObjectId, data.date, data.startTime);
    if (!available) throw new Error('This time slot is not available');

    // Check for concurrent booking — lock with findOne during transaction
    const conflicting = await Reservation.findOne({
      teacher: data.teacherId,
      date: parseISO(data.date),
      startTime: data.startTime,
      status: { $in: ['pending_payment_upload', 'pending_review', 'confirmed'] },
    }).session(session);
    if (conflicting) throw new Error('This slot was just booked by another student');

    // Get slot duration from weekly availability
    const { WeeklyAvailability } = await import('../models/WeeklyAvailability');
    const parsedDate = parseISO(data.date);
    const dayOfWeek = parsedDate.getDay();
    const weeklySlot = await WeeklyAvailability.findOne({
      teacher: data.teacherId,
      dayOfWeek,
      isActive: true,
    }).session(session);

    const durationMinutes = weeklySlot?.slotDurationMinutes || 60;
    const startMin = timeToMinutes(data.startTime);
    const endMin = startMin + durationMinutes;
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

    const [reservation] = await Reservation.create(
      [
        {
          student: studentId,
          teacher: data.teacherId,
          course: data.courseId,
          date: parseISO(data.date),
          startTime: data.startTime,
          endTime,
          durationMinutes,
          notes: data.notes,
          status: 'pending_payment_upload',
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Send notifications
    await createNotification({
      userId: teacher._id,
      type: 'reservation_created',
      title: 'Nueva solicitud de tutoría',
      message: `${studentId} quiere reservar una sesión de ${course.name}`,
      relatedId: reservation._id,
      relatedModel: 'Reservation',
    });

    return reservation;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function uploadPaymentProof(
  reservationId: string,
  studentId: Types.ObjectId,
  uploadId: Types.ObjectId
): Promise<IReservation> {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    student: studentId,
    status: 'pending_payment_upload',
  });
  if (!reservation) throw new Error('Reservation not found or cannot upload payment');

  reservation.paymentProof = uploadId;
  reservation.status = 'pending_review';
  await reservation.save();

  // Notify teacher
  await createNotification({
    userId: reservation.teacher as Types.ObjectId,
    type: 'reservation_created',
    title: 'Comprobante de pago recibido',
    message: 'El estudiante subió el comprobante de pago. Revisa la solicitud.',
    relatedId: reservation._id,
    relatedModel: 'Reservation',
  });

  return reservation;
}

export async function confirmReservation(
  reservationId: string,
  teacherId: Types.ObjectId,
  meetLink: string,
  teacherNotes?: string
): Promise<IReservation> {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    teacher: teacherId,
    status: 'pending_review',
  });
  if (!reservation) throw new Error('Reservation not found or cannot confirm');
  if (!reservation.paymentProof) throw new Error('Payment proof required before confirming');

  reservation.status = 'confirmed';
  reservation.meetLink = meetLink;
  reservation.confirmedAt = new Date();
  if (teacherNotes) reservation.teacherNotes = teacherNotes;
  await reservation.save();

  await createNotification({
    userId: reservation.student as Types.ObjectId,
    type: 'reservation_confirmed',
    title: '¡Tutoría confirmada!',
    message: 'Tu tutoría fue confirmada. Ya puedes ver el enlace de Google Meet.',
    relatedId: reservation._id,
    relatedModel: 'Reservation',
  });

  return reservation;
}

export async function rejectReservation(
  reservationId: string,
  teacherId: Types.ObjectId,
  rejectionReason: string
): Promise<IReservation> {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    teacher: teacherId,
    status: { $in: ['pending_review', 'pending_payment_upload'] },
  });
  if (!reservation) throw new Error('Reservation not found or cannot reject');

  reservation.status = 'rejected';
  reservation.rejectionReason = rejectionReason;
  await reservation.save();

  await createNotification({
    userId: reservation.student as Types.ObjectId,
    type: 'reservation_rejected',
    title: 'Tutoría rechazada',
    message: `Tu solicitud fue rechazada: ${rejectionReason}`,
    relatedId: reservation._id,
    relatedModel: 'Reservation',
  });

  return reservation;
}

export async function completeReservation(
  reservationId: string,
  teacherId: Types.ObjectId
): Promise<IReservation> {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    teacher: teacherId,
    status: 'confirmed',
  });
  if (!reservation) throw new Error('Reservation not found or cannot complete');

  reservation.status = 'completed';
  reservation.completedAt = new Date();
  await reservation.save();

  await createNotification({
    userId: reservation.student as Types.ObjectId,
    type: 'session_completed',
    title: 'Tutoría completada',
    message: '¡La tutoría fue completada! Puedes dejar una reseña.',
    relatedId: reservation._id,
    relatedModel: 'Reservation',
  });

  return reservation;
}

export async function cancelReservation(
  reservationId: string,
  studentId: Types.ObjectId
): Promise<IReservation> {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    student: studentId,
    status: { $in: ['pending_payment_upload', 'pending_review'] },
  });
  if (!reservation) throw new Error('Reservation cannot be cancelled');

  reservation.status = 'cancelled';
  reservation.cancelledAt = new Date();
  await reservation.save();

  return reservation;
}

export async function getStudentReservations(
  studentId: Types.ObjectId,
  status?: ReservationStatus,
  page = 1,
  limit = 10
): Promise<PaginatedResult<unknown>> {
  const filter: Record<string, unknown> = { student: studentId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Reservation.find(filter)
      .populate('teacher', 'name email avatarUrl teacherProfile.headline')
      .populate('course', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Reservation.countDocuments(filter),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getTeacherReservations(
  teacherId: Types.ObjectId,
  status?: ReservationStatus,
  page = 1,
  limit = 10
): Promise<PaginatedResult<unknown>> {
  const filter: Record<string, unknown> = { teacher: teacherId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Reservation.find(filter)
      .populate('student', 'name email avatarUrl')
      .populate('course', 'name category')
      .populate('paymentProof', 'filename originalName mimetype publicUrl storageKey')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Reservation.countDocuments(filter),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getReservationById(
  reservationId: string,
  userId: Types.ObjectId,
  role: string
): Promise<IReservation | null> {
  const reservation = await Reservation.findById(reservationId)
    .populate('student', 'name email avatarUrl studentProfile')
    .populate('teacher', 'name email avatarUrl teacherProfile')
    .populate('course', 'name category level')
    .populate('paymentProof', 'filename originalName mimetype publicUrl storageKey size');

  if (!reservation) return null;

  // Access control
  if (role === 'admin') return reservation;
  if (role === 'student' && reservation.student._id?.toString() === userId.toString()) return reservation;
  if (role === 'teacher' && reservation.teacher._id?.toString() === userId.toString()) return reservation;

  return null;
}

export async function getAllReservations(
  filter: { status?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResult<unknown>> {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = {};
  if (filter.status) query.status = filter.status;

  const [data, total] = await Promise.all([
    Reservation.find(query)
      .populate('student', 'name email')
      .populate('teacher', 'name email')
      .populate('course', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Reservation.countDocuments(query),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
