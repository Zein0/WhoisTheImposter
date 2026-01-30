import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Modal, TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Timer, HoldToRevealButton, PlayerCard, Card } from '../components';
import { NavigationParamList } from '../types';
import { useGameStore } from '../stores';
import { useTimer, useVoting, useRatingIncentive } from '../hooks';

type LocalGameScreenProps = {
  navigation: NativeStackNavigationProp<NavigationParamList, 'LocalGame'>;
};

export const LocalGameScreen: React.FC<LocalGameScreenProps> = ({
  navigation,
}) => {
  const {
    phase,
    players,
    settings,
    currentPlayerIndex,
    firstSpeakerIndex,
    selectedWord,
    startGame,
    nextPlayer,
    revealPlayer,
    startVoting,
    setPhase,
    calculateResults,
  } = useGameStore();

  const { pauseTimer, resumeTimer, formattedTime } = useTimer();
  const {
    selectedPlayers,
    votesPerPlayer,
    votesRemaining,
    toggleVote,
    submitPlayerVotes,
    getVoteCount,
  } = useVoting();
  const { onGameComplete } = useRatingIncentive();

  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);

  useEffect(() => {
    // Start the game when component mounts
    startGame();
  }, []);

  const currentPlayer = players[currentPlayerIndex];
  const currentVoter = players[currentVoterIndex];

  const handleRevealComplete = () => {
    if (currentPlayer) {
      revealPlayer(currentPlayer.id);
    }
  };

  const handleNextPlayer = () => {
    nextPlayer();
  };

  const handlePause = () => {
    pauseTimer();
    setShowPauseMenu(true);
  };

  const handleResume = () => {
    setShowPauseMenu(false);
    resumeTimer();
  };

  const handleStartVoting = () => {
    setShowPauseMenu(false);
    startVoting();
  };

  const handleSubmitVote = () => {
    submitPlayerVotes(currentVoter.id);

    // Move to next voter
    const nextVoterIndex = currentVoterIndex + 1;
    if (nextVoterIndex >= players.length) {
      // All voted, calculate results
      calculateResults();
      onGameComplete();
    } else {
      setCurrentVoterIndex(nextVoterIndex);
    }
  };

  const handleViewResults = () => {
    navigation.replace('Results');
  };

  const renderRevealingPhase = () => {
    if (!currentPlayer) return null;

    const hasRevealed = currentPlayer.hasRevealed;

    return (
      <View className="flex-1 items-center justify-center px-6">
        {!hasRevealed ? (
          <HoldToRevealButton
            playerName={currentPlayer.name}
            word={currentPlayer.word}
            isImposter={currentPlayer.role === 'imposter'}
            onRevealComplete={handleRevealComplete}
          />
        ) : (
          <Animated.View entering={ZoomIn} className="items-center">
            <View
              className={`
                w-full aspect-square rounded-3xl items-center justify-center p-8 max-w-xs
                ${currentPlayer.role === 'imposter' ? 'bg-imposter-red' : 'bg-crew-green'}
              `}
            >
              <Text className="text-white text-2xl font-bold mb-4">
                {currentPlayer.name}
              </Text>

              <View className="bg-black/20 rounded-2xl p-6 w-full items-center">
                <Text className="text-white text-4xl font-bold mb-4">
                  {currentPlayer.role === 'imposter' ? '🔪 IMPOSTER' : '👤 CREWMATE'}
                </Text>

                {currentPlayer.role === 'crewmate' && currentPlayer.word && (
                  <Text className="text-white text-2xl font-bold mt-2">
                    Word: {currentPlayer.word}
                  </Text>
                )}
              </View>
            </View>

            <Button
              title={
                currentPlayerIndex < players.length - 1
                  ? 'Next Player'
                  : 'Start Discussion'
              }
              onPress={handleNextPlayer}
              variant="primary"
              size="large"
              fullWidth
            />

            <Text className="text-white/50 mt-4 text-center">
              Pass the device to the next player
            </Text>
          </Animated.View>
        )}

        {/* Progress */}
        <View className="absolute bottom-8 left-0 right-0 items-center">
          <Text className="text-white/60">
            Player {currentPlayerIndex + 1} of {players.length}
          </Text>
          <View className="flex-row gap-1 mt-2">
            {players.map((_, i) => (
              <View
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i <= currentPlayerIndex ? 'bg-primary-500' : 'bg-slate-600'
                }`}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderDiscussionPhase = () => (
    <View className="flex-1 px-6">
      {/* First Speaker Announcement */}
      <Animated.View entering={FadeInDown} className="items-center mb-6">
        <Text className="text-white/60 text-lg">First to speak:</Text>
        <Text className="text-primary-400 text-2xl font-bold">
          {players[firstSpeakerIndex]?.name}
        </Text>
      </Animated.View>

      {/* Timer */}
      <View className="items-center mb-8">
        <Timer size="large" />
      </View>

      {/* Instructions */}
      <Card className="mb-6">
        <Text className="text-white text-center">
          Discuss with your group! The imposter doesn't know the word.
          {'\n'}Try to find who doesn't belong!
        </Text>
      </Card>

      {/* Players List */}
      <ScrollView className="flex-1 mb-4">
        <Text className="text-white/60 mb-2">Players in this game:</Text>
        {players.map((player, index) => (
          <View
            key={player.id}
            className="flex-row items-center bg-game-card rounded-xl p-3 mb-2"
          >
            <View className="w-8 h-8 bg-slate-600 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">
                {player.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-white font-medium">{player.name}</Text>
            {index === firstSpeakerIndex && (
              <View className="ml-auto bg-primary-500 px-2 py-1 rounded-full">
                <Text className="text-white text-xs">First</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Pause Button */}
      <Button
        title="⏸ Pause Game"
        onPress={handlePause}
        variant="secondary"
        size="large"
        fullWidth
      />

      {/* Pause Menu Modal */}
      <Modal
        visible={showPauseMenu}
        transparent
        animationType="fade"
        onRequestClose={handleResume}
      >
        <View className="flex-1 bg-black/80 justify-center items-center p-6">
          <Animated.View
            entering={SlideInUp}
            className="bg-game-card rounded-3xl p-6 w-full max-w-sm"
          >
            <Text className="text-white text-2xl font-bold text-center mb-6">
              Game Paused
            </Text>
            <Text className="text-white/60 text-center mb-6">
              Time: {formattedTime}
            </Text>

            <View className="gap-3">
              <Button
                title="▶️ Continue Discussion"
                onPress={handleResume}
                variant="primary"
                size="large"
                fullWidth
              />
              <Button
                title="🗳️ Start Voting"
                onPress={handleStartVoting}
                variant="danger"
                size="large"
                fullWidth
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );

  const renderVotingPhase = () => (
    <View className="flex-1 px-6">
      {/* Current Voter */}
      <Animated.View entering={FadeIn} className="items-center mb-6">
        <Text className="text-white/60 text-lg">Now voting:</Text>
        <Text className="text-primary-400 text-3xl font-bold">
          {currentVoter?.name}
        </Text>
        <Text className="text-white/50 mt-2">
          Select {votesPerPlayer} player{votesPerPlayer > 1 ? 's' : ''} to vote out
        </Text>
        <Text className="text-primary-400 mt-1">
          Votes remaining: {votesRemaining}
        </Text>
      </Animated.View>

      {/* Voting List */}
      <ScrollView className="flex-1 mb-4">
        {players
          .filter((p) => p.id !== currentVoter?.id)
          .map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              index={index}
              isSelected={selectedPlayers.includes(player.id)}
              onPress={() => toggleVote(player.id)}
            />
          ))}
      </ScrollView>

      {/* Submit Vote */}
      <View className="gap-3">
        <Button
          title={`Submit Vote (${selectedPlayers.length}/${votesPerPlayer})`}
          onPress={handleSubmitVote}
          variant="danger"
          size="large"
          fullWidth
          disabled={selectedPlayers.length === 0}
        />
        <Text className="text-white/50 text-center text-sm">
          Player {currentVoterIndex + 1} of {players.length}
        </Text>
      </View>
    </View>
  );

  const renderResultsPhase = () => (
    <Animated.View entering={ZoomIn} className="flex-1 items-center justify-center px-6">
      <Text className="text-white text-2xl font-bold mb-6">
        Voting Complete!
      </Text>
      <Button
        title="View Results"
        onPress={handleViewResults}
        variant="primary"
        size="large"
      />
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-game-background">
      {phase === 'revealing' && renderRevealingPhase()}
      {phase === 'discussion' && renderDiscussionPhase()}
      {phase === 'voting' && renderVotingPhase()}
      {phase === 'results' && renderResultsPhase()}
    </SafeAreaView>
  );
};
