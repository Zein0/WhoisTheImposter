import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTimer } from '../hooks';

interface TimerProps {
  showControls?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Timer: React.FC<TimerProps> = ({
  size = 'medium',
}) => {
  const { timeRemaining, formattedTime, isRunning } = useTimer();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Pulsing animation when time is low
  useEffect(() => {
    if (timeRemaining <= 30 && isRunning) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [timeRemaining <= 30, isRunning]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'text-2xl';
      case 'medium':
        return 'text-4xl';
      case 'large':
        return 'text-6xl';
      default:
        return 'text-4xl';
    }
  };

  const getContainerSize = () => {
    switch (size) {
      case 'small':
        return 'w-20 h-20';
      case 'medium':
        return 'w-32 h-32';
      case 'large':
        return 'w-40 h-40';
      default:
        return 'w-32 h-32';
    }
  };

  const getTimerColor = () => {
    if (timeRemaining <= 10) return 'text-imposter-red';
    if (timeRemaining <= 30) return 'text-yellow-400';
    return 'text-white';
  };

  const getBorderColor = () => {
    if (timeRemaining <= 10) return 'border-imposter-red';
    if (timeRemaining <= 30) return 'border-yellow-400';
    return 'border-primary-500';
  };

  return (
    <View className="items-center">
      <Animated.View
        style={animatedStyle}
        className={`
          ${getContainerSize()}
          rounded-full border-4 ${getBorderColor()}
          items-center justify-center bg-game-card
        `}
      >
        <Text className={`${getSizeStyles()} ${getTimerColor()} font-bold`}>
          {formattedTime}
        </Text>
      </Animated.View>

      {!isRunning && timeRemaining > 0 && (
        <Text className="text-yellow-400 mt-2 font-medium">PAUSED</Text>
      )}
    </View>
  );
};
