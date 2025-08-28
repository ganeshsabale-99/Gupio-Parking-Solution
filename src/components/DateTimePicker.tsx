import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isBefore, startOfDay, isAfter } from 'date-fns';
import { getTimeSlots, isTimeSlotAvailable, isTimeRangeAvailable, formatDisplayTime } from '../utils/dateUtils';
import { Booking } from '../types';

interface DateTimePickerProps {
  selectedDate: Date | null;
  selectedStartTime: string;
  selectedEndTime: string;
  onDateChange: (date: Date) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  bookings: Booking[];
  slotId: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  bookings,
  slotId,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const today = startOfDay(new Date());
  const dayAfterTomorrow = startOfDay(addDays(today, 2));

  const timeSlots = useMemo(() => getTimeSlots(), []);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const availableStartTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return timeSlots.filter(time => 
      isTimeSlotAvailable(dateString, time, bookings, slotId)
    );
  }, [selectedDate, timeSlots, bookings, slotId]);

  const availableEndTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedStartTime) return [];
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    // end must be after start and range available
    return timeSlots.filter(time => {
      if (time <= selectedStartTime) return false;
      return isTimeRangeAvailable(dateString, selectedStartTime, time, bookings, slotId);
    });
  }, [selectedDate, selectedStartTime, timeSlots, bookings, slotId]);

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setShowCalendar(false);
  };

  const isDateDisabled = (date: Date) => {
    // Only allow today, tomorrow, and day after tomorrow
    if (isBefore(date, today)) return true;
    if (isAfter(date, dayAfterTomorrow)) return true;
    return false;
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between bg-white"
          >
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" />
              <span className={selectedDate ? 'text-gray-900' : 'text-gray-500'}>
                {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Select a date'}
              </span>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showCalendar ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4"
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                    disabled
                    className="p-2 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-semibold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                    disabled
                    className="p-2 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    const isDisabled = isDateDisabled(date);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isCurrentMonth = isDateInCurrentMonth(date);
                    const isToday = isSameDay(date, today);

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => !isDisabled && handleDateSelect(date)}
                        disabled={isDisabled}
                        className={`
                          p-2 text-sm rounded-lg transition-all
                          ${isSelected 
                            ? 'bg-blue-600 text-white' 
                            : isToday
                              ? 'bg-blue-100 text-blue-600 font-semibold'
                              : isCurrentMonth
                                ? 'text-gray-900 hover:bg-gray-100'
                                : 'text-gray-400'
                          }
                          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {format(date, 'd')}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Start Time Selection */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Start Time (IST)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {availableStartTimeSlots.map((time) => (
              <motion.button
                key={time}
                type="button"
                onClick={() => onStartTimeChange(time)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  px-3 py-2 text-sm rounded-lg border transition-all flex items-center justify-center
                  ${selectedStartTime === time
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }
                `}
              >
                <Clock className="w-3 h-3 mr-1" />
                {formatDisplayTime(time)}
              </motion.button>
            ))}
          </div>
          
          {availableStartTimeSlots.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No available time slots for this date</p>
            </div>
          )}
        </motion.div>
      )}

      {/* End Time Selection */}
      {selectedDate && selectedStartTime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select End Time (IST)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {availableEndTimeSlots.map((time) => (
              <motion.button
                key={time}
                type="button"
                onClick={() => onEndTimeChange(time)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  px-3 py-2 text-sm rounded-lg border transition-all flex items-center justify-center
                  ${selectedEndTime === time
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }
                `}
              >
                <Clock className="w-3 h-3 mr-1" />
                {formatDisplayTime(time)}
              </motion.button>
            ))}
          </div>

          {availableEndTimeSlots.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No valid end times for this start time</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};