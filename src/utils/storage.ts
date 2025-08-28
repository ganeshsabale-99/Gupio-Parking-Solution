import { AppState, ParkingSlot, Booking } from '../types';

const STORAGE_KEY = 'gupio-parking-data';

export const saveToStorage = (data: Partial<AppState>) => {
  try {
    const existing = getFromStorage();
    const updated = { ...existing, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
};

export const getFromStorage = (): Partial<AppState> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to get from storage:', error);
    return {};
  }
};

export const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
};