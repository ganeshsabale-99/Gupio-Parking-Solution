import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Clock, CheckCircle } from 'lucide-react';
import { ParkingSlot, Booking } from '../types';
import { DateTimePicker } from './DateTimePicker';
import { formatDisplayDate, formatDisplayTime } from '../utils/dateUtils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ParkingSlot | null;
  onConfirm: (date: Date, startTime: string, endTime: string) => void;
  bookings: Booking[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  slot,
  onConfirm,
  bookings,
}) => {
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');

  const handleConfirm = async () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return;
    
    setIsBooking(true);
    
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsBooking(false);
    setIsSuccess(true);
    
    // Show success for a moment then confirm
    setTimeout(() => {
      setIsSuccess(false);
      onConfirm(selectedDate, selectedStartTime, selectedEndTime);
    }, 1500);
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedStartTime('');
    setSelectedEndTime('');
    setIsBooking(false);
    setIsSuccess(false);
    onClose();
  };

  if (!slot) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {!isBooking && !isSuccess ? (
              <>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Book {slot.id}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-6 bg-green-100 rounded-full">
                      <Car className="w-12 h-12 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <p className="text-lg font-semibold text-green-600 mb-2">
                      ✅ Available
                    </p>
                    <p className="text-gray-600">
                      Select a date and time within the next 3 days.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Spot Details</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Section:</span>
                        <span className="font-medium">{slot.section}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Spot ID:</span>
                        <span className="font-medium">{slot.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium text-green-600">Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Date Time Picker */}
                  <DateTimePicker
                    selectedDate={selectedDate}
                    selectedStartTime={selectedStartTime}
                    selectedEndTime={selectedEndTime}
                    onDateChange={setSelectedDate}
                    onStartTimeChange={(t) => {
                      setSelectedStartTime(t);
                      // reset end time if it is before/equal start
                      if (!selectedEndTime || selectedEndTime <= t) {
                        setSelectedEndTime('');
                      }
                    }}
                    onEndTimeChange={setSelectedEndTime}
                    bookings={bookings}
                    slotId={slot.id}
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    disabled={!selectedDate || !selectedStartTime || !selectedEndTime}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Confirm Booking
                  </motion.button>
                </div>
              </>
            ) : isBooking ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Processing Your Booking...
                </h3>
                <p className="text-gray-600">
                  Please wait while we confirm your parking spot.
                </p>
                {selectedDate && selectedStartTime && selectedEndTime && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{slot.id}</strong> for {formatDisplayDate(selectedDate)} from {formatDisplayTime(selectedStartTime)} to {formatDisplayTime(selectedEndTime)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Booking Confirmed!
                </h3>
                <p className="text-gray-600">
                  Your parking spot {slot.id} has been successfully reserved.
                </p>
                {selectedDate && selectedStartTime && selectedEndTime && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Date:</strong> {formatDisplayDate(selectedDate)}<br />
                      <strong>Time:</strong> {formatDisplayTime(selectedStartTime)} - {formatDisplayTime(selectedEndTime)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};