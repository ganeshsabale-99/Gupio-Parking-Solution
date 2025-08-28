import { useMemo } from 'react';

export const useGreeting = () => {
  return useMemo(() => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  }, []);
};