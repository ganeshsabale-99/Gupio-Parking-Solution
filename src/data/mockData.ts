import { ParkingSlot } from '../types';

export const MOCK_OTP = '1234';

export const MOCK_USERS = {
  'EMP001': { employeeId: 'EMP001', name: 'Ganesh' },
  'EMP002': { employeeId: 'EMP002', name: 'Pratiksha' },
  'EMP003': { employeeId: 'EMP003', name: 'Stef' },
};

export const generateParkingSlots = (): ParkingSlot[] => {
  const sections: Array<'US' | 'LS' | 'B3'> = ['US', 'LS', 'B3'];
  const slots: ParkingSlot[] = [];
  
  sections.forEach(section => {
    for (let i = 1; i <= 40; i++) {
      const slotNumber = i.toString().padStart(2, '0');
      const isAvailable = Math.random() < 0.75; // 75% available, 25% booked
      
      slots.push({
        id: `${section}-P${slotNumber}`,
        section,
        status: isAvailable ? 'available' : 'booked',
        bookedBy: isAvailable ? undefined : 'OTHER_USER',
        bookedAt: isAvailable ? undefined : new Date().toISOString(),
      });
    }
  });
  
  return slots;
};