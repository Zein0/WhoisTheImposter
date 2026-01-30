import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import { useHoldToReveal } from '../hooks';

interface HoldToRevealButtonProps {
  playerName: string;
  word?: string;
  isImposter: boolean;
  onRevealComplete: () => void;
}

export const HoldToRevealButton: React.FC<HoldToRevealButtonProps> = ({
  playerName,
  word,
  isImposter,
  onRevealComplete,
}) => {
  const {
    isRevealed,
    isHolding,
    holdProgress,
    onPressIn,
    onPressOut,
    animatedProgressStyle,
    animatedFillStyle,
  } = useHoldToReveal({
    holdDuration: 1500,
    onReveal: onRevealComplete,
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      holdProgress.value,
      [0, 1],
      ['#1e293b', isImposter ? '#dc2626' : '#16a34a']
    );
    return { backgroundColor };
  });

  if (isRevealed) {
    return (
      <View
        className={`
          w-full aspect-square rounded-3xl items-center justify-center p-8
          ${isImposter ? 'bg-imposter-red' : 'bg-crew-green'}
        `}
      >
        <Text className="text-white text-2xl font-bold mb-4">
          {playerName}
        </Text>

        <View className="bg-black/20 rounded-2xl p-6 w-full items-center">
          <Text className="text-white/70 text-lg mb-2">
            You are the
          </Text>
          <Text className="text-white text-4xl font-bold mb-4">
            {isImposter ? '🔪 IMPOSTER' : '👤 CREWMATE'}
          </Text>

          {!isImposter && word && (
            <>
              <Text className="text-white/70 text-lg mt-4">
                Your word is
              </Text>
              <Text className="text-white text-3xl font-bold mt-2">
                {word}
              </Text>
            </>
          )}

          {isImposter && (
            <Text className="text-white/70 text-center mt-4">
              Find out the secret word by listening to others!
            </Text>
          )}
        </View>

        <Text className="text-white/60 mt-6 text-center">
          Make sure only you see this screen!
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full items-center">
      <Text className="text-white text-2xl font-bold mb-6">
        {playerName}'s Turn
      </Text>

      <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View
          style={[animatedBackgroundStyle, animatedProgressStyle]}
          className="w-64 h-64 rounded-full items-center justify-center border-4 border-primary-500"
        >
          <Text className="text-white text-xl font-bold text-center px-4">
            {isHolding ? 'Keep Holding...' : 'Hold to Reveal'}
          </Text>

          {/* Progress indicator */}
          <View className="absolute bottom-8 w-40 h-2 bg-slate-700 rounded-full overflow-hidden">
            <Animated.View
              style={animatedFillStyle}
              className="h-full bg-primary-400 rounded-full"
            />
          </View>
        </Animated.View>
      </Pressable>

      <Text className="text-white/60 mt-6 text-center px-8">
        Hold the button to privately see your role.{'\n'}
        Make sure no one else is looking!
      </Text>
    </View>
  );
};
