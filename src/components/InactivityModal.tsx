import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface InactivityModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onStay: () => void;
}

export const InactivityModal: React.FC<InactivityModalProps> = ({
  isOpen,
  onCancel,
  onStay,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Inactivity Notice
              </h2>
            </div>

            {/* Content */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-gray-600">30 minutes elapsed</span>
              </div>
              <p className="text-gray-700 mb-4">
                You haven't parked your vehicle yet. Would you like to cancel this booking to free up the space for others?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  If you're still on your way, you can keep your booking active.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Cancel Booking
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStay}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                No, I'll be there
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};