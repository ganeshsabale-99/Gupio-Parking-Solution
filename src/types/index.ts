export type ParkingSlot = {
  id: string;
  section: "US" | "LS" | "B3";
  status: "available" | "booked";
  bookedBy?: string;
  bookedAt?: string;
  bookedDate?: string;
  bookedTime?: string;
  bookedEndTime?: string;
};

export type User = {
  employeeId: string;
  name: string;
};

export type Booking = {
  id: string;
  slotId: string;
  employeeId: string;
  bookedAt: string;
  section: string;
  bookingDate: string;
  bookingTime: string;
  bookingEndTime: string;
  status: 'active' | 'completed' | 'cancelled';
};

export type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
};

export type AppState = {
  user: User | null;
  isAuthenticated: boolean;
  parkingSlots: ParkingSlot[];
  activeBookings: Booking[];
};