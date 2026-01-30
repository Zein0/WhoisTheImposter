import React from 'react';
import { View, ViewProps } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  animated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  animated = false,
  className,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return 'bg-game-card';
      case 'elevated':
        return 'bg-game-card shadow-lg shadow-black/30';
      case 'outlined':
        return 'bg-transparent border-2 border-game-border';
      default:
        return 'bg-game-card';
    }
  };

  const content = (
    <View
      className={`
        ${getVariantStyles()}
        rounded-2xl p-4
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </View>
  );

  if (animated) {
    return (
      <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
        {content}
      </Animated.View>
    );
  }

  return content;
};
