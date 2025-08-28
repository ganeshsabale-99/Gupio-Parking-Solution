import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoginForm } from './components/LoginForm';
import { OTPForm } from './components/OTPForm';
import { Dashboard } from './components/Dashboard';
import { Toast } from './components/Toast';
import { User, ParkingSlot, Booking } from './types';
import { MOCK_USERS, generateParkingSlots } from './data/mockData';
import { saveToStorage, getFromStorage } from './utils/storage';

type AppStep = 'login' | 'otp' | 'dashboard';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('login');
  const [pendingEmployeeId, setPendingEmployeeId] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);

  // Load data from storage on mount
  useEffect(() => {
    const savedData = getFromStorage();
    
    if (savedData.user && savedData.isAuthenticated) {
      setUser(savedData.user);
      setCurrentStep('dashboard');
    }
    
    if (savedData.parkingSlots) {
      setParkingSlots(savedData.parkingSlots);
    } else {
      // Initialize with fresh data
      const initialSlots = generateParkingSlots();
      setParkingSlots(initialSlots);
      saveToStorage({ parkingSlots: initialSlots });
    }
    
    if (savedData.activeBookings) {
      setActiveBookings(savedData.activeBookings);
    }
  }, []);

  // Save data to storage whenever state changes
  useEffect(() => {
    if (user) {
      saveToStorage({
        user,
        isAuthenticated: currentStep === 'dashboard',
        parkingSlots,
        activeBookings,
      });
    }
  }, [user, currentStep, parkingSlots, activeBookings]);

  const handleLoginSuccess = (employeeId: string) => {
    setPendingEmployeeId(employeeId);
    setCurrentStep('otp');
  };

  const handleOTPSuccess = () => {
    const userData = MOCK_USERS[pendingEmployeeId as keyof typeof MOCK_USERS];
    if (userData) {
      setUser(userData);
      setCurrentStep('dashboard');
    }
  };

  const handleBackToLogin = () => {
    setPendingEmployeeId('');
    setCurrentStep('login');
  };

  const handleUpdateSlots = (updatedSlots: ParkingSlot[]) => {
    setParkingSlots(updatedSlots);
  };

  const handleUpdateBookings = (updatedBookings: Booking[]) => {
    setActiveBookings(updatedBookings);
  };

  const handleLogout = () => {
    setUser(null);
    setPendingEmployeeId('');
    setCurrentStep('login');
    saveToStorage({
      user: null,
      isAuthenticated: false,
    });
  };

  return (
    <div className="App">
      <Toast />
      <AnimatePresence mode="wait">
        {currentStep === 'login' && (
          <LoginForm
            key="login"
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        
        {currentStep === 'otp' && (
          <OTPForm
            key="otp"
            employeeId={pendingEmployeeId}
            onOTPSuccess={handleOTPSuccess}
            onBack={handleBackToLogin}
          />
        )}
        
        {currentStep === 'dashboard' && user && (
          <Dashboard
            key="dashboard"
            user={user}
            parkingSlots={parkingSlots}
            activeBookings={activeBookings}
            onUpdateSlots={handleUpdateSlots}
            onUpdateBookings={handleUpdateBookings}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;