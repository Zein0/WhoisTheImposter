import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores';

export const useTimer = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    timeRemaining,
    isTimerRunning,
    decrementTimer,
    setTimerRunning,
    startVoting,
  } = useGameStore();

  const startTimer = useCallback(() => {
    setTimerRunning(true);
  }, [setTimerRunning]);

  const pauseTimer = useCallback(() => {
    setTimerRunning(false);
  }, [setTimerRunning]);

  const resumeTimer = useCallback(() => {
    setTimerRunning(true);
  }, [setTimerRunning]);

  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        decrementTimer();
      }, 1000);
    } else if (timeRemaining === 0 && isTimerRunning) {
      // Timer finished, start voting
      startVoting();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining, decrementTimer, startVoting]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isRunning: isTimerRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
  };
};
