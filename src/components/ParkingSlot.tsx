import React from 'react';
import { motion } from 'framer-motion';
import { Car } from 'lucide-react';
import { ParkingSlot as ParkingSlotType } from '../types';

interface ParkingSlotProps {
  slot: ParkingSlotType;
  onClick: () => void;
  isHighlighted?: boolean;
  currentUserId: string;
}

export const ParkingSlot: React.FC<ParkingSlotProps> = ({ 
  slot, 
  onClick, 
  isHighlighted,
  currentUserId,
}) => {
  const isAvailable = slot.status === 'available';
  const isBookedByCurrentUser = slot.bookedBy === currentUserId;

  return (
    <motion.button
      whileHover={{ scale: isAvailable ? 1.05 : 1 }}
      whileTap={{ scale: isAvailable ? 0.95 : 1 }}
      onClick={onClick}
      disabled={!isAvailable && !isBookedByCurrentUser}
      className={`
        relative p-2 sm:p-3 md:p-4 rounded-lg border-2 transition-all duration-200 group min-h-[60px] sm:min-h-[70px] md:min-h-[80px]
        ${isAvailable 
          ? 'border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400 cursor-pointer' 
          : isBookedByCurrentUser
            ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 cursor-pointer'
            : 'border-red-300 bg-red-50 cursor-not-allowed'
        }
        ${isHighlighted ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
      `}
      initial={false}
      animate={isHighlighted ? { 
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
        scale: 1.02
      } : {}}
    >
      <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2 h-full">
        <Car 
          className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-colors ${
            isAvailable 
              ? 'text-green-600 group-hover:text-green-700' 
              : isBookedByCurrentUser
                ? 'text-blue-600 group-hover:text-blue-700'
                : 'text-red-600'
          }`} 
        />
        <span className={`text-xs sm:text-sm font-semibold ${
          isAvailable 
            ? 'text-green-800' 
            : isBookedByCurrentUser
              ? 'text-blue-800'
              : 'text-red-800'
        }`}>
          {slot.id}
        </span>
      </div>
      
      {/* Status indicator */}
      <div className={`
        absolute top-1 right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full
        ${isAvailable 
          ? 'bg-green-500' 
          : isBookedByCurrentUser
            ? 'bg-blue-500'
            : 'bg-red-500'
        }
      `} />
    </motion.button>
  );
};