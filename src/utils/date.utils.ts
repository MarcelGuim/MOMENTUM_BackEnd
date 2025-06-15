import { locationSchedule } from '../enums/locationSchedule.enum';
import { ILocation } from '../models/location/location.model';

export function getDayOfWeekEnum(date: Date): locationSchedule {
  const dayNumber = date.getDay(); // 0 = Sunday, ..., 6 = Saturday
  const dayMap: { [key: number]: locationSchedule } = {
    0: locationSchedule.SUNDAY,
    1: locationSchedule.MONDAY,
    2: locationSchedule.TUESDAY,
    3: locationSchedule.WEDNESDAY,
    4: locationSchedule.THURSDAY,
    5: locationSchedule.FRIDAY,
    6: locationSchedule.SATURDAY,
  };
  return dayMap[dayNumber];
}

export function adjustDatesToSchedule(
  date1: Date,
  date2: Date,
  schedule: ILocation['schedule']
): { adjustedDate1: Date; adjustedDate2: Date } | null {
  const day = getDayOfWeekEnum(date1);
  const slot = schedule.find((s) => s.day === day);
  if (!slot) return null;

  const dateOnly = date1.toISOString().split('T')[0];
  const openTime = new Date(`${dateOnly}T${slot.open}:00.000Z`);
  const closeTime = new Date(`${dateOnly}T${slot.close}:00.000Z`);

  if (date2 <= openTime || date1 >= closeTime) return null;

  const adjustedStart = new Date(Math.max(date1.getTime(), openTime.getTime()));
  const adjustedEnd = new Date(Math.min(date2.getTime(), closeTime.getTime()));

  return {
    adjustedDate1: adjustedStart,
    adjustedDate2: adjustedEnd,
  };
}
