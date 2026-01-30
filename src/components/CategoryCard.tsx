import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  isLocked: boolean;
  onPress: () => void;
  index: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  isLocked,
  onPress,
  index,
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

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50)}
      style={animatedStyle}
      className="w-[48%] mb-3"
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLocked}
        activeOpacity={0.8}
        className={`
          rounded-2xl p-4 items-center
          border-2
          ${isSelected ? 'border-primary-500 bg-primary-500/20' : 'border-game-border bg-game-card'}
          ${isLocked ? 'opacity-50' : 'opacity-100'}
        `}
      >
        {/* Icon */}
        <Text className="text-4xl mb-2">{category.icon}</Text>

        {/* Name */}
        <Text className="text-white font-semibold text-center">
          {category.name}
        </Text>

        {/* Word count */}
        <Text className="text-white/60 text-sm">
          {category.words.length} words
        </Text>

        {/* Lock indicator */}
        {isLocked && (
          <View className="absolute top-2 right-2 bg-yellow-500 px-2 py-1 rounded-full">
            <Text className="text-black text-xs font-bold">🔒 PRO</Text>
          </View>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <View className="absolute top-2 left-2 bg-primary-500 w-6 h-6 rounded-full items-center justify-center">
            <Text className="text-white font-bold">✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
