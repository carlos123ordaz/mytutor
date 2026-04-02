import { WeeklyAvailability, IWeeklyAvailability } from '../models/WeeklyAvailability';
import { AvailabilityException, IAvailabilityException } from '../models/AvailabilityException';
import { parseISO, startOfDay } from 'date-fns';
import { Types } from 'mongoose';

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function hasTimeOverlap(s1: string, e1: string, s2: string, e2: string) {
  return timeToMinutes(s1) < timeToMinutes(e2) && timeToMinutes(e1) > timeToMinutes(s2);
}

export async function getWeeklyAvailability(teacherId: Types.ObjectId): Promise<IWeeklyAvailability[]> {
  return WeeklyAvailability.find({ teacher: teacherId, isActive: true }).sort({ dayOfWeek: 1, startTime: 1 });
}

export async function createWeeklySlot(
  teacherId: Types.ObjectId,
  data: { dayOfWeek: number; startTime: string; endTime: string; slotDurationMinutes?: number }
): Promise<IWeeklyAvailability> {
  // Check for time overlap on the same day
  const existing = await WeeklyAvailability.find({
    teacher: teacherId,
    dayOfWeek: data.dayOfWeek,
    isActive: true,
  });

  for (const slot of existing) {
    if (hasTimeOverlap(data.startTime, data.endTime, slot.startTime, slot.endTime)) {
      throw new Error(`Time overlap with existing slot ${slot.startTime}-${slot.endTime}`);
    }
  }

  return WeeklyAvailability.create({ teacher: teacherId, ...data });
}

export async function updateWeeklySlot(
  slotId: string,
  teacherId: Types.ObjectId,
  data: { startTime?: string; endTime?: string; slotDurationMinutes?: number; isActive?: boolean }
): Promise<IWeeklyAvailability | null> {
  const slot = await WeeklyAvailability.findOne({ _id: slotId, teacher: teacherId });
  if (!slot) throw new Error('Slot not found');

  const newStart = data.startTime || slot.startTime;
  const newEnd = data.endTime || slot.endTime;

  // Check for overlap with other slots
  if (data.startTime || data.endTime) {
    const existing = await WeeklyAvailability.find({
      teacher: teacherId,
      dayOfWeek: slot.dayOfWeek,
      isActive: true,
      _id: { $ne: slotId },
    });

    for (const s of existing) {
      if (hasTimeOverlap(newStart, newEnd, s.startTime, s.endTime)) {
        throw new Error(`Time overlap with existing slot ${s.startTime}-${s.endTime}`);
      }
    }
  }

  return WeeklyAvailability.findByIdAndUpdate(slotId, data, { new: true });
}

export async function deleteWeeklySlot(slotId: string, teacherId: Types.ObjectId): Promise<void> {
  const result = await WeeklyAvailability.deleteOne({ _id: slotId, teacher: teacherId });
  if (result.deletedCount === 0) throw new Error('Slot not found');
}

export async function getExceptions(
  teacherId: Types.ObjectId,
  fromDate?: string
): Promise<IAvailabilityException[]> {
  const filter: Record<string, unknown> = { teacher: teacherId };
  if (fromDate) {
    filter.date = { $gte: parseISO(fromDate) };
  }
  return AvailabilityException.find(filter).sort({ date: 1 });
}

export async function createException(
  teacherId: Types.ObjectId,
  data: { date: string; type: 'blocked' | 'extra_available'; startTime?: string; endTime?: string; reason?: string }
): Promise<IAvailabilityException> {
  const date = startOfDay(parseISO(data.date));

  return AvailabilityException.create({
    teacher: teacherId,
    date,
    type: data.type,
    startTime: data.startTime,
    endTime: data.endTime,
    reason: data.reason,
  });
}

export async function updateException(
  exceptionId: string,
  teacherId: Types.ObjectId,
  data: Partial<{ type: string; startTime: string; endTime: string; reason: string }>
): Promise<IAvailabilityException | null> {
  return AvailabilityException.findOneAndUpdate(
    { _id: exceptionId, teacher: teacherId },
    data,
    { new: true }
  );
}

export async function deleteException(exceptionId: string, teacherId: Types.ObjectId): Promise<void> {
  const result = await AvailabilityException.deleteOne({ _id: exceptionId, teacher: teacherId });
  if (result.deletedCount === 0) throw new Error('Exception not found');
}
