import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-500 border-primary-600';
      case 'secondary':
        return 'bg-slate-600 border-slate-700';
      case 'danger':
        return 'bg-imposter-red border-imposter-dark';
      case 'success':
        return 'bg-crew-green border-crew-dark';
      case 'outline':
        return 'bg-transparent border-primary-500 border-2';
      default:
        return 'bg-primary-500 border-primary-600';
    }
  };

  const getTextStyles = () => {
    if (variant === 'outline') {
      return 'text-primary-500';
    }
    return 'text-white';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2';
      case 'medium':
        return 'px-6 py-3';
      case 'large':
        return 'px-8 py-4';
      default:
        return 'px-6 py-3';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'medium':
        return 'text-base';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={animatedStyle}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50' : 'opacity-100'}
        rounded-xl border flex-row items-center justify-center
      `}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text
            className={`
              ${getTextStyles()}
              ${getTextSize()}
              font-semibold text-center
            `}
          >
            {title}
          </Text>
        </View>
      )}
    </AnimatedTouchable>
  );
};
