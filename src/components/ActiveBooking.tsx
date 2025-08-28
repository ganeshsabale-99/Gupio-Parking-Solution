import React from 'react';
import { motion } from 'framer-motion';
import { Car, Clock, X } from 'lucide-react';
import { Booking } from '../types';
import { formatDisplayDate, formatDisplayTime, getBookingReminder } from '../utils/dateUtils';

interface ActiveBookingProps {
  booking: Booking;
  onCancel: () => void;
}

export const ActiveBooking: React.FC<ActiveBookingProps> = ({ booking, onCancel }) => {
  const reminder = getBookingReminder(booking.bookingDate, booking.bookingTime);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Booking</h3>
        <button
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-full">
          <Car className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-blue-600">
              {booking.slotId}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {booking.section} Section
            </span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatDisplayDate(new Date(booking.bookingDate))} at {formatDisplayTime(booking.bookingTime)}</span>
            </div>
            <p className="text-xs text-gray-500">
              Booked on {new Date(booking.bookedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Reminder */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-yellow-600 mr-2" />
          <p className="text-sm text-yellow-800 font-medium">
            {reminder}
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCancel}
        className="w-full mt-4 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
      >
        Cancel Booking
      </motion.button>
    </motion.div>
  );
};