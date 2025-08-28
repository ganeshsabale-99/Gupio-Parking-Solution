import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  MapPin, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { ParkingSlot, User, Booking } from '../types';
import { useGreeting } from '../hooks/useGreeting';
import { useInactivityTimer } from '../hooks/useInactivityTimer';
import { StatCard } from './StatCard';
import { ParkingSlot as ParkingSlotComponent } from './ParkingSlot';
import { BookingModal } from './BookingModal';
import { ActiveBooking } from './ActiveBooking';
import { InactivityModal } from './InactivityModal';
import { ConfirmModal } from './ConfirmModal';
import toast from 'react-hot-toast';

interface DashboardProps {
  user: User;
  parkingSlots: ParkingSlot[];
  activeBookings: Booking[];
  onUpdateSlots: (slots: ParkingSlot[]) => void;
  onUpdateBookings: (bookings: Booking[]) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  parkingSlots,
  activeBookings,
  onUpdateSlots,
  onUpdateBookings,
  onLogout,
}) => {
  const greeting = useGreeting();
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [highlightedSlot, setHighlightedSlot] = useState<string | null>(null);
  const [reminderTimeoutId, setReminderTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [inactivityShownForBookingId, setInactivityShownForBookingId] = useState<string | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const totalSpots = parkingSlots.length;
    const availableSpots = parkingSlots.filter(slot => slot.status === 'available').length;
    const occupiedSpots = totalSpots - availableSpots;
    
    return {
      totalSpots,
      availableSpots,
      occupiedSpots,
    };
  }, [parkingSlots]);

  // Current user's active booking
  const currentUserBooking = activeBookings.find(booking => 
    booking.employeeId === user.employeeId && booking.status === 'active'
  );

  // Inactivity timer
  useInactivityTimer(
    !!currentUserBooking,
    () => {
      if (currentUserBooking && inactivityShownForBookingId !== currentUserBooking.id) {
        setShowInactivityModal(true);
        setInactivityShownForBookingId(currentUserBooking.id);
      }
    }
  );

  // Schedule 2-minute-before reminder for the user's next upcoming booking
  React.useEffect(() => {
    if (reminderTimeoutId) {
      clearTimeout(reminderTimeoutId);
      setReminderTimeoutId(null);
    }

    const futureBookings = activeBookings
      .filter(b => b.employeeId === user.employeeId && b.status === 'active')
      .map(b => ({
        booking: b,
        dateTime: new Date(`${b.bookingDate}T${b.bookingTime}:00`)
      }))
      .filter(x => x.dateTime.getTime() > Date.now());

    if (futureBookings.length === 0) return;

    futureBookings.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
    const next = futureBookings[0];
    const twoMinutesMs = 2 * 60 * 1000;
    const fireInMs = next.dateTime.getTime() - Date.now() - twoMinutesMs;

    if (fireInMs > 0) {
      const id = setTimeout(() => {
        toast((t) => (
          <div className="text-sm">
            <div className="font-semibold mb-1">Upcoming Parking Reminder</div>
            <div>Your booking for <span className="font-medium">{next.booking.slotId}</span> starts at {next.booking.bookingTime}.</div>
          </div>
        ));
      }, fireInMs);
      setReminderTimeoutId(id);
    }

    return () => {
      if (reminderTimeoutId) clearTimeout(reminderTimeoutId);
    };
  }, [activeBookings, user.employeeId]);

  // Handle slot click
  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
      setIsBookingModalOpen(true);
    } else if (slot.bookedBy === user.employeeId) {
      // Show cancel modal for current user's booking
      setSelectedSlot(slot);
      setShowCancelModal(true);
    }
  };

  // Handle booking confirmation
  const handleBookingConfirm = (date: Date, time: string) => {
    if (!selectedSlot) return;

    const bookingDate = date.toISOString().split('T')[0];
    const bookingTime = time;

    // Update slot status
    const updatedSlots = parkingSlots.map(slot =>
      slot.id === selectedSlot.id
        ? {
            ...slot,
            status: 'booked' as const,
            bookedBy: user.employeeId,
            bookedAt: new Date().toISOString(),
            bookedDate: bookingDate,
            bookedTime: bookingTime,
          }
        : slot
    );

    // Create new booking
    const newBooking: Booking = {
      id: Date.now().toString(),
      slotId: selectedSlot.id,
      employeeId: user.employeeId,
      bookedAt: new Date().toISOString(),
      section: selectedSlot.section,
      bookingDate,
      bookingTime,
      status: 'active',
    };

    onUpdateSlots(updatedSlots);
    onUpdateBookings([...activeBookings, newBooking]);
    
    // Highlight the booked slot
    setHighlightedSlot(selectedSlot.id);
    setTimeout(() => setHighlightedSlot(null), 3000);

    setIsBookingModalOpen(false);
    setSelectedSlot(null);
    toast.success(`${selectedSlot.id} booked for ${date.toLocaleDateString()} at ${time}`);
  };

  // Handle booking cancellation
  const handleBookingCancel = () => {
    if (!currentUserBooking) return;

    // Update slot status
    const updatedSlots = parkingSlots.map(slot =>
      slot.id === currentUserBooking.slotId
        ? {
            ...slot,
            status: 'available' as const,
            bookedBy: undefined,
            bookedAt: undefined,
            bookedDate: undefined,
            bookedTime: undefined,
          }
        : slot
    );

    // Remove booking
    const updatedBookings = activeBookings.map(booking => 
      booking.id === currentUserBooking.id 
        ? { ...booking, status: 'cancelled' as const }
        : booking
    );

    onUpdateSlots(updatedSlots);
    onUpdateBookings(updatedBookings);
    
    setShowCancelModal(false);
    setSelectedSlot(null);
    toast.success('Booking cancelled successfully!');
  };

  // Handle inactivity modal actions
  const handleInactivityCancel = () => {
    handleBookingCancel();
    setShowInactivityModal(false);
  };

  const handleInactivityStay = () => {
    setShowInactivityModal(false);
    toast.success('Booking extended. Thank you!');
  };

  // Group slots by section
  const slotsBySection = useMemo(() => {
    return parkingSlots.reduce((acc, slot) => {
      if (!acc[slot.section]) {
        acc[slot.section] = [];
      }
      acc[slot.section].push(slot);
      return acc;
    }, {} as Record<string, ParkingSlot[]>);
  }, [parkingSlots]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  Gupio Smart Parking
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-600">
                  {greeting}, <span className="font-semibold">{user.name}</span>
                </p>
                <p className="text-xs text-gray-500">{user.employeeId}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed top-0 left-0 w-80 h-full bg-white shadow-xl z-50 md:hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600">
                    {greeting}, <span className="font-semibold">{user.name}</span>
                  </p>
                  <p className="text-sm text-gray-500">{user.employeeId}</p>
                </div>

                {currentUserBooking && (
                  <div className="mb-6">
                    <ActiveBooking
                      booking={currentUserBooking}
                      onCancel={() => {
                        setShowCancelModal(true);
                        setIsSidebarOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {greeting}, {user.name}!
          </h2>
          <p className="text-gray-600">
            Welcome to your parking dashboard. Find and book your spot below.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Spots"
            value={stats.totalSpots}
            icon={MapPin}
            color="bg-blue-600"
            delay={0.1}
          />
          <StatCard
            title="Available Spots"
            value={stats.availableSpots}
            icon={Car}
            color="bg-green-600"
            delay={0.2}
          />
          <StatCard
            title="Occupied Spots"
            value={stats.occupiedSpots}
            icon={Users}
            color="bg-red-600"
            delay={0.3}
          />
        </div>

        {/* Active Booking */}
        <AnimatePresence>
          {currentUserBooking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <ActiveBooking
                booking={currentUserBooking}
                onCancel={() => setShowCancelModal(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Parking Layout */}
        <div className="space-y-8">
          {Object.entries(slotsBySection).map(([section, slots], index) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Section {section}
              </h3>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
                {slots.map((slot) => (
                  <ParkingSlotComponent
                    key={slot.id}
                    slot={slot}
                    onClick={() => handleSlotClick(slot)}
                    isHighlighted={highlightedSlot === slot.id}
                    currentUserId={user.employeeId}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedSlot(null);
        }}
        slot={selectedSlot}
        onConfirm={handleBookingConfirm}
        bookings={activeBookings}
      />

      <InactivityModal
        isOpen={showInactivityModal}
        onCancel={handleInactivityCancel}
        onStay={handleInactivityStay}
      />

      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Booking"
        message="Are you sure you want to cancel your parking booking? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="Keep Booking"
        variant="danger"
        onConfirm={handleBookingCancel}
        onCancel={() => {
          setShowCancelModal(false);
          setSelectedSlot(null);
        }}
      />
    </div>
  );
};