import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  index: number;
  onPress?: () => void;
  isSelected?: boolean;
  showRole?: boolean;
  showVotes?: number;
  isCurrentPlayer?: boolean;
  canRemove?: boolean;
  onRemove?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  index,
  onPress,
  isSelected = false,
  showRole = false,
  showVotes,
  isCurrentPlayer = false,
  canRemove = false,
  onRemove,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const getRoleColor = () => {
    if (!showRole || !player.role) return 'bg-slate-600';
    return player.role === 'imposter' ? 'bg-imposter-red' : 'bg-crew-green';
  };

  const getBorderColor = () => {
    if (isSelected) return 'border-primary-500';
    if (isCurrentPlayer) return 'border-yellow-400';
    if (player.isEliminated) return 'border-imposter-red';
    return 'border-game-border';
  };

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 50).springify()}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        activeOpacity={onPress ? 0.8 : 1}
        className={`
          flex-row items-center justify-between
          bg-game-card rounded-xl p-4 mb-2
          border-2 ${getBorderColor()}
          ${player.isEliminated ? 'opacity-50' : 'opacity-100'}
        `}
      >
        <View className="flex-row items-center flex-1">
          {/* Avatar */}
          <View
            className={`
              w-10 h-10 rounded-full items-center justify-center mr-3
              ${getRoleColor()}
            `}
          >
            <Text className="text-white text-lg font-bold">
              {player.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Player Info */}
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-white font-semibold text-lg">
                {player.name}
              </Text>
              {isCurrentPlayer && (
                <View className="bg-yellow-400 px-2 py-0.5 rounded-full">
                  <Text className="text-black text-xs font-bold">YOU</Text>
                </View>
              )}
            </View>

            {/* Role if revealed */}
            {showRole && player.role && (
              <Text
                className={`
                  text-sm font-medium
                  ${player.role === 'imposter' ? 'text-imposter-red' : 'text-crew-green'}
                `}
              >
                {player.role === 'imposter' ? 'Imposter' : 'Crewmate'}
                {player.role === 'crewmate' && player.word && ` - ${player.word}`}
              </Text>
            )}
          </View>
        </View>

        {/* Right side */}
        <View className="flex-row items-center gap-2">
          {/* Vote count */}
          {typeof showVotes === 'number' && (
            <View className="bg-slate-700 px-3 py-1 rounded-full">
              <Text className="text-white font-bold">{showVotes} votes</Text>
            </View>
          )}

          {/* Selection indicator */}
          {isSelected && (
            <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
              <Text className="text-white font-bold">✓</Text>
            </View>
          )}

          {/* Remove button */}
          {canRemove && onRemove && (
            <TouchableOpacity
              onPress={onRemove}
              className="w-8 h-8 bg-imposter-red rounded-full items-center justify-center"
            >
              <Text className="text-white font-bold">✕</Text>
            </TouchableOpacity>
          )}

          {/* Status indicators */}
          {player.hasVoted && (
            <View className="bg-crew-green px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">Voted</Text>
            </View>
          )}

          {player.isEliminated && (
            <View className="bg-imposter-red px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">OUT</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
