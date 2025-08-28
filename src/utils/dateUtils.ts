import { format, addDays, isBefore, parse } from 'date-fns';
import type { Booking } from '../types';

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

export const formatDisplayTime = (time: string): string => {
  const [hoursStr, minutesStr] = time.split(':');
  const date = new Date();
  date.setHours(Number(hoursStr));
  date.setMinutes(Number(minutesStr));
  date.setSeconds(0);
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(date);
};

export const getAvailableDates = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  
  // Allow booking for next 30 days
  for (let i = 0; i < 30; i++) {
    dates.push(addDays(today, i));
  }
  
  return dates;
};

export const getTimeSlots = (): string[] => {
  const slots: string[] = [];
  
  // Generate time slots from 6:00 AM to 10:00 PM (30-minute intervals)
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  return slots;
};

export const isTimeSlotAvailable = (
  date: string, 
  time: string, 
  bookings: Booking[], 
  slotId: string
): boolean => {
  const now = new Date();
  const selectedDateTime = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
  
  // Don't allow booking in the past
  if (isBefore(selectedDateTime, now)) {
    return false;
  }
  
  // Check if slot is already booked for this date/time
  return !bookings.some(booking => 
    booking.slotId === slotId && 
    booking.bookingDate === date && 
    booking.bookingTime === time &&
    booking.status === 'active'
  );
};

export const isTimeRangeAvailable = (
  date: string,
  startTime: string,
  endTime: string,
  bookings: Booking[],
  slotId: string
): boolean => {
  if (!startTime || !endTime) return false;
  if (startTime >= endTime) return false;

  // build 30-min slots between start (inclusive) and end (exclusive)
  const slots: string[] = [];
  let [h, m] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const endTotal = endH * 60 + endM;
  let total = h * 60 + m;
  while (total < endTotal) {
    const hh = Math.floor(total / 60).toString().padStart(2, '0');
    const mm = (total % 60).toString().padStart(2, '0');
    slots.push(`${hh}:${mm}`);
    total += 30;
  }

  return slots.every(t => isTimeSlotAvailable(date, t, bookings, slotId));
};

export const getBookingReminder = (bookingDate: string, bookingTime: string): string => {
  const bookingDateTime = parse(`${bookingDate} ${bookingTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const now = new Date();
  const diffInMinutes = Math.floor((bookingDateTime.getTime() - now.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 0) {
    return 'Your booking time has passed';
  } else if (diffInMinutes < 60) {
    return `Your booking starts in ${diffInMinutes} minutes`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `Your booking starts in ${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `Your booking is in ${days} day${days > 1 ? 's' : ''}`;
  }
};