import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, PlayerCard } from '../components';
import { NavigationParamList } from '../types';
import { useGameStore } from '../stores';
import { useVoting, useRatingIncentive } from '../hooks';
import { RatingPrompt } from '../components/RatingPrompt';

type ResultsScreenProps = {
  navigation: NativeStackNavigationProp<NavigationParamList, 'Results'>;
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation }) => {
  const { gameResult, players, resetGame } = useGameStore();
  const { getVoteCount } = useVoting();
  const { showRatingPrompt, setShowRatingPrompt, checkShouldShowRatingPrompt } = useRatingIncentive();

  const scale = useSharedValue(1);

  useEffect(() => {
    // Pulsing animation for winner announcement
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      3,
      true
    );

    // Check if should show rating prompt
    if (checkShouldShowRatingPrompt()) {
      setTimeout(() => setShowRatingPrompt(true), 2000);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!gameResult) {
    return (
      <SafeAreaView className="flex-1 bg-game-background items-center justify-center">
        <Text className="text-white text-xl">No results available</Text>
        <Button
          title="Go Home"
          onPress={() => navigation.replace('Home')}
          variant="primary"
          size="large"
        />
      </SafeAreaView>
    );
  }

  const { winner, imposters, eliminatedPlayers, word } = gameResult;
  const isImposterWin = winner === 'imposters';

  const handlePlayAgain = () => {
    resetGame();
    navigation.replace('CreateLobby', { mode: 'local' });
  };

  const handleGoHome = () => {
    resetGame();
    navigation.replace('Home');
  };

  return (
    <SafeAreaView className="flex-1 bg-game-background">
      <ScrollView className="flex-1 px-6 py-4">
        {/* Winner Announcement */}
        <Animated.View
          entering={ZoomIn.duration(800)}
          style={animatedStyle}
          className={`
            rounded-3xl p-8 mb-6 items-center
            ${isImposterWin ? 'bg-imposter-red' : 'bg-crew-green'}
          `}
        >
          <Text className="text-6xl mb-4">
            {isImposterWin ? '🔪' : '🎉'}
          </Text>
          <Text className="text-white text-3xl font-bold text-center">
            {isImposterWin ? 'Imposters Win!' : 'Crewmates Win!'}
          </Text>
          <Text className="text-white/80 text-lg text-center mt-2">
            {isImposterWin
              ? 'The imposters fooled everyone!'
              : 'The imposters were caught!'}
          </Text>
        </Animated.View>

        {/* Secret Word */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Card className="mb-6 items-center">
            <Text className="text-white/60 text-lg">The secret word was:</Text>
            <Text className="text-primary-400 text-3xl font-bold mt-2">
              {word}
            </Text>
          </Card>
        </Animated.View>

        {/* Imposters Reveal */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Card className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              🔪 Imposters ({imposters.length})
            </Text>
            {imposters.map((imposter, index) => (
              <View
                key={imposter.id}
                className="flex-row items-center bg-imposter-red/20 rounded-xl p-3 mb-2"
              >
                <View className="w-10 h-10 bg-imposter-red rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold">
                    {imposter.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-white font-medium flex-1">
                  {imposter.name}
                </Text>
                <View className="bg-imposter-dark px-3 py-1 rounded-full">
                  <Text className="text-white text-sm">
                    {getVoteCount(imposter.id)} votes
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* Eliminated Players */}
        {eliminatedPlayers.length > 0 && (
          <Animated.View entering={FadeInDown.delay(700)}>
            <Card className="mb-6">
              <Text className="text-white text-lg font-bold mb-4">
                ❌ Eliminated by Vote
              </Text>
              {eliminatedPlayers.map((player) => (
                <View
                  key={player.id}
                  className={`
                    flex-row items-center rounded-xl p-3 mb-2
                    ${player.role === 'imposter' ? 'bg-crew-green/20' : 'bg-imposter-red/20'}
                  `}
                >
                  <View
                    className={`
                      w-10 h-10 rounded-full items-center justify-center mr-3
                      ${player.role === 'imposter' ? 'bg-imposter-red' : 'bg-crew-green'}
                    `}
                  >
                    <Text className="text-white font-bold">
                      {player.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium">{player.name}</Text>
                    <Text
                      className={`text-sm ${
                        player.role === 'imposter'
                          ? 'text-imposter-red'
                          : 'text-crew-green'
                      }`}
                    >
                      was {player.role === 'imposter' ? 'an Imposter' : 'a Crewmate'}
                    </Text>
                  </View>
                  <View className="bg-slate-600 px-3 py-1 rounded-full">
                    <Text className="text-white text-sm">
                      {getVoteCount(player.id)} votes
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* All Players Vote Summary */}
        <Animated.View entering={FadeInDown.delay(900)}>
          <Card className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              📊 Vote Summary
            </Text>
            {players
              .sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id))
              .map((player, index) => (
                <View
                  key={player.id}
                  className="flex-row items-center justify-between py-2 border-b border-slate-700"
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-white/50 w-6">{index + 1}.</Text>
                    <Text className="text-white">{player.name}</Text>
                    {player.role === 'imposter' && (
                      <Text className="text-imposter-red text-xs">🔪</Text>
                    )}
                  </View>
                  <Text className="text-white font-bold">
                    {getVoteCount(player.id)} votes
                  </Text>
                </View>
              ))}
          </Card>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(1100)} className="gap-3 mb-8">
          <Button
            title="🎮 Play Again"
            onPress={handlePlayAgain}
            variant="primary"
            size="large"
            fullWidth
          />
          <Button
            title="🏠 Back to Home"
            onPress={handleGoHome}
            variant="secondary"
            size="large"
            fullWidth
          />
        </Animated.View>
      </ScrollView>

      {/* Rating Prompt */}
      <RatingPrompt
        visible={showRatingPrompt}
        onClose={() => setShowRatingPrompt(false)}
      />
    </SafeAreaView>
  );
};
