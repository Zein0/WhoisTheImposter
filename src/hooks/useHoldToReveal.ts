import { useState, useCallback, useRef } from 'react';
import {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface UseHoldToRevealOptions {
  holdDuration?: number; // Duration in ms to hold before reveal
  onReveal?: () => void;
}

export const useHoldToReveal = (options: UseHoldToRevealOptions = {}) => {
  const { holdDuration = 1500, onReveal } = options;

  const [isRevealed, setIsRevealed] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const holdProgress = useSharedValue(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleRevealComplete = useCallback(() => {
    setIsRevealed(true);
    onReveal?.();
  }, [onReveal]);

  const onPressIn = useCallback(() => {
    if (isRevealed) return;

    setIsHolding(true);
    holdProgress.value = withTiming(
      1,
      {
        duration: holdDuration,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) {
          runOnJS(handleRevealComplete)();
        }
      }
    );

    // Backup timeout in case animation callback doesn't fire
    timeoutRef.current = setTimeout(() => {
      handleRevealComplete();
    }, holdDuration + 50);
  }, [isRevealed, holdDuration, holdProgress, handleRevealComplete]);

  const onPressOut = useCallback(() => {
    if (isRevealed) return;

    setIsHolding(false);
    holdProgress.value = withTiming(0, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [isRevealed, holdProgress]);

  const reset = useCallback(() => {
    setIsRevealed(false);
    setIsHolding(false);
    holdProgress.value = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [holdProgress]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: 0.9 + holdProgress.value * 0.1 }],
    };
  });

  const animatedFillStyle = useAnimatedStyle(() => {
    return {
      width: `${holdProgress.value * 100}%`,
    };
  });

  return {
    isRevealed,
    isHolding,
    holdProgress,
    onPressIn,
    onPressOut,
    reset,
    animatedProgressStyle,
    animatedFillStyle,
  };
};
