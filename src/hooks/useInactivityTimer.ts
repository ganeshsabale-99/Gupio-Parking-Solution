import { useEffect, useRef } from 'react';

export const useInactivityTimer = (
  isActive: boolean,
  onTimeout: () => void,
  timeoutMs: number = 10000 // 10 seconds for demo (30 minutes = 1800000)
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timeoutRef.current = setTimeout(() => {
        onTimeout();
      }, timeoutMs);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, onTimeout, timeoutMs]);
};