import { useEffect, useRef, useCallback } from 'react';

// Default events to listen for user activity
const DEFAULT_ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];

export interface UseInactivityOptions {
  timeout: number; // milliseconds
  onInactive: () => void;
  events?: string[];
}

export const useInactivity = ({
  timeout,
  onInactive,
  events = DEFAULT_ACTIVITY_EVENTS
}: UseInactivityOptions) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      onInactive();
    }, timeout);
  }, [timeout, onInactive]);

  useEffect(() => {
    // Set up event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    // Start timer
    resetTimer();
    
    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [events, resetTimer]);

  return {
    resetTimer
  };
};
