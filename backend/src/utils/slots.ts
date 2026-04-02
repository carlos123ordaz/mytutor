import { addDays, format, parseISO, isBefore, isAfter, startOfDay } from 'date-fns';
import { WeeklyAvailability } from '../models/WeeklyAvailability';
import { AvailabilityException } from '../models/AvailabilityException';
import { Reservation } from '../models/Reservation';
import type { TimeSlot } from '../types';
import { Types } from 'mongoose';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function generateSlotsForRange(
  startMinutes: number,
  endMinutes: number,
  durationMinutes: number
): string[] {
  const slots: string[] = [];
  let current = startMinutes;
  while (current + durationMinutes <= endMinutes) {
    slots.push(minutesToTime(current));
    current += durationMinutes;
  }
  return slots;
}

export async function getAvailableSlotsForDate(
  teacherId: Types.ObjectId,
  dateStr: string
): Promise<TimeSlot[]> {
  const date = parseISO(dateStr);
  const now = new Date();

  // Cannot book in the past
  if (isBefore(startOfDay(date), startOfDay(now))) {
    return [];
  }

  const dayOfWeek = date.getDay(); // 0=Sun

  // 1. Get weekly availability for this day
  const weeklySlots = await WeeklyAvailability.find({
    teacher: teacherId,
    dayOfWeek,
    isActive: true,
  });

  if (weeklySlots.length === 0) {
    // Check for extra_available exceptions
  }

  // 2. Get exceptions for this date
  const dateStart = startOfDay(date);
  const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

  const exceptions = await AvailabilityException.find({
    teacher: teacherId,
    date: { $gte: dateStart, $lt: dateEnd },
  });

  // 3. Get existing reservations (confirmed or pending_review) that block slots
  const existingReservations = await Reservation.find({
    teacher: teacherId,
    date: { $gte: dateStart, $lt: dateEnd },
    status: { $in: ['pending_review', 'confirmed', 'pending_payment_upload'] },
  });

  // Build set of occupied start times
  const occupiedStartTimes = new Set(
    existingReservations.map((r) => r.startTime)
  );

  // 4. Check if entire day is blocked
  const isFullDayBlocked = exceptions.some(
    (ex) => ex.type === 'blocked' && !ex.startTime && !ex.endTime
  );
  if (isFullDayBlocked) return [];

  // 5. Build available slots
  const allSlots: TimeSlot[] = [];

  for (const weekly of weeklySlots) {
    const startMin = timeToMinutes(weekly.startTime);
    const endMin = timeToMinutes(weekly.endTime);
    const duration = weekly.slotDurationMinutes;

    const slotStarts = generateSlotsForRange(startMin, endMin, duration);

    for (const slotStart of slotStarts) {
      const slotStartMin = timeToMinutes(slotStart);
      const slotEndMin = slotStartMin + duration;
      const slotEnd = minutesToTime(slotEndMin);

      // Check if slot is in the past (for today)
      if (format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        if (slotStartMin <= nowMinutes) continue;
      }

      // Check if slot is blocked by an exception
      const isBlockedByException = exceptions.some((ex) => {
        if (ex.type !== 'blocked') return false;
        if (!ex.startTime && !ex.endTime) return true; // full day
        if (ex.startTime && ex.endTime) {
          const exStart = timeToMinutes(ex.startTime);
          const exEnd = timeToMinutes(ex.endTime);
          // Overlap check
          return slotStartMin < exEnd && slotEndMin > exStart;
        }
        return false;
      });

      if (isBlockedByException) continue;

      const isOccupied = occupiedStartTimes.has(slotStart);

      allSlots.push({
        date: format(date, 'yyyy-MM-dd'),
        startTime: slotStart,
        endTime: slotEnd,
        available: !isOccupied,
      });
    }
  }

  // 6. Add extra_available exceptions
  for (const ex of exceptions) {
    if (ex.type === 'extra_available' && ex.startTime && ex.endTime) {
      const startMin = timeToMinutes(ex.startTime);
      const endMin = timeToMinutes(ex.endTime);
      // Use 60 min default duration for extra slots
      const slotStarts = generateSlotsForRange(startMin, endMin, 60);

      for (const slotStart of slotStarts) {
        const slotStartMin = timeToMinutes(slotStart);
        const slotEndMin = slotStartMin + 60;
        const slotEnd = minutesToTime(slotEndMin);

        // Avoid duplicates with weekly slots
        if (allSlots.some((s) => s.startTime === slotStart)) continue;

        const isOccupied = occupiedStartTimes.has(slotStart);

        allSlots.push({
          date: format(date, 'yyyy-MM-dd'),
          startTime: slotStart,
          endTime: slotEnd,
          available: !isOccupied,
        });
      }
    }
  }

  // Sort by start time
  allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return allSlots;
}

export async function getAvailableSlotsForRange(
  teacherId: Types.ObjectId,
  startDate: string,
  days = 30
): Promise<Record<string, TimeSlot[]>> {
  const result: Record<string, TimeSlot[]> = {};
  const start = parseISO(startDate);

  for (let i = 0; i < days; i++) {
    const currentDate = addDays(start, i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const slots = await getAvailableSlotsForDate(teacherId, dateStr);
    if (slots.length > 0) {
      result[dateStr] = slots;
    }
  }

  return result;
}

export async function isSlotAvailable(
  teacherId: Types.ObjectId,
  dateStr: string,
  startTime: string
): Promise<boolean> {
  const slots = await getAvailableSlotsForDate(teacherId, dateStr);
  const slot = slots.find((s) => s.startTime === startTime);
  return slot?.available === true;
}
