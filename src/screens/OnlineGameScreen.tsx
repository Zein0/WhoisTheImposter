import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Button, Timer, HoldToRevealButton, PlayerCard, Card } from '../components';
import { NavigationParamList, Player } from '../types';
import { useGameStore, useOnlineStore } from '../stores';
import { useTimer, useVoting } from '../hooks';

type OnlineGameScreenProps = {
  navigation: NativeStackNavigationProp<NavigationParamList, 'OnlineGame'>;
  route: RouteProp<NavigationParamList, 'OnlineGame'>;
};

export const OnlineGameScreen: React.FC<OnlineGameScreenProps> = ({
  navigation,
  route,
}) => {
  const { lobbyCode } = route.params;

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

  const { lobby, isHost, playerId, leaveLobby } = useOnlineStore();
  const { pauseTimer, resumeTimer, formattedTime } = useTimer();
  const {
    selectedPlayers,
    votesPerPlayer,
    votesRemaining,
    toggleVote,
    submitPlayerVotes,
  } = useVoting();

  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showLobbyInfo, setShowLobbyInfo] = useState(true);
  const [waitingForPlayers, setWaitingForPlayers] = useState(true);

  useEffect(() => {
    // In a real implementation, this would connect to WebSocket
    // and sync game state with the server
    return () => {
      // Cleanup WebSocket connection
    };
  }, []);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(lobbyCode);
    Alert.alert('Copied!', 'Lobby code copied to clipboard.');
  };

  const handleStartOnlineGame = () => {
    if (players.length < 2) {
      Alert.alert('Not Enough Players', 'Wait for more players to join.');
      return;
    }
    setShowLobbyInfo(false);
    setWaitingForPlayers(false);
    startGame();
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Lobby',
      'Are you sure you want to leave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveLobby();
            navigation.replace('Home');
          },
        },
      ]
    );
  };

  const currentPlayer = players[currentPlayerIndex];
  const myPlayer = players.find((p) => p.id === playerId);

  const handleRevealComplete = () => {
    if (currentPlayer) {
      revealPlayer(currentPlayer.id);
    }
  };

  const handleNextPlayer = () => {
    nextPlayer();
  };

  const handlePause = () => {
    if (!isHost) return;
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
    if (!myPlayer) return;
    submitPlayerVotes(myPlayer.id);

    // Check if all players have voted
    const allVoted = players.every((p) => p.hasVoted || p.id === myPlayer.id);
    if (allVoted) {
      calculateResults();
    }
  };

  const handleViewResults = () => {
    navigation.replace('Results');
  };

  // Lobby waiting screen
  if (showLobbyInfo || waitingForPlayers) {
    return (
      <SafeAreaView className="flex-1 bg-game-background">
        <View className="flex-1 px-6 py-4">
          {/* Header */}
          <Animated.View entering={FadeInDown} className="mb-8">
            <TouchableOpacity
              onPress={handleLeave}
              className="flex-row items-center mb-4"
            >
              <Text className="text-imposter-red text-lg">← Leave</Text>
            </TouchableOpacity>

            <Text className="text-white text-2xl font-bold">
              {isHost ? 'Your Lobby' : 'Waiting Room'}
            </Text>
          </Animated.View>

          {/* Lobby Code */}
          <Animated.View entering={FadeIn.delay(100)}>
            <Card className="mb-6 items-center">
              <Text className="text-white/60 mb-2">Lobby Code</Text>
              <TouchableOpacity onPress={handleCopyCode}>
                <Text className="text-primary-400 text-4xl font-bold tracking-widest">
                  {lobbyCode}
                </Text>
              </TouchableOpacity>
              <Text className="text-white/40 text-sm mt-2">
                Tap to copy
              </Text>
            </Card>
          </Animated.View>

          {/* Players */}
          <Animated.View entering={FadeIn.delay(200)} className="flex-1">
            <Text className="text-white text-lg font-bold mb-3">
              Players ({players.length})
            </Text>
            <ScrollView>
              {players.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  index={index}
                  isCurrentPlayer={player.id === playerId}
                />
              ))}

              {players.length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-white/50">Waiting for players to join...</Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>

          {/* Host Controls */}
          {isHost && (
            <Animated.View entering={FadeIn.delay(300)} className="gap-3">
              <Button
                title="Start Game"
                onPress={handleStartOnlineGame}
                variant="success"
                size="large"
                fullWidth
                disabled={players.length < 2}
              />
              <Text className="text-white/50 text-center text-sm">
                {players.length < 2
                  ? 'Need at least 2 players'
                  : 'Ready to start!'}
              </Text>
            </Animated.View>
          )}

          {/* Non-host waiting */}
          {!isHost && (
            <Animated.View entering={FadeIn.delay(300)}>
              <Card variant="outlined" className="items-center">
                <Text className="text-white/60">
                  Waiting for host to start the game...
                </Text>
              </Card>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Revealing phase
  if (phase === 'revealing') {
    // Check if it's this player's turn
    const isMyTurn = currentPlayer?.id === playerId;

    if (!isMyTurn) {
      return (
        <SafeAreaView className="flex-1 bg-game-background items-center justify-center px-6">
          <Animated.View entering={FadeIn} className="items-center">
            <Text className="text-6xl mb-4">⏳</Text>
            <Text className="text-white text-xl font-bold text-center mb-2">
              Waiting for others to reveal...
            </Text>
            <Text className="text-white/60 text-center">
              {currentPlayer?.name} is viewing their role
            </Text>

            <View className="flex-row gap-1 mt-8">
              {players.map((p, i) => (
                <View
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    p.hasRevealed ? 'bg-crew-green' : 'bg-slate-600'
                  }`}
                />
              ))}
            </View>
          </Animated.View>
        </SafeAreaView>
      );
    }

    // It's my turn to reveal
    if (!myPlayer?.hasRevealed) {
      return (
        <SafeAreaView className="flex-1 bg-game-background items-center justify-center px-6">
          <HoldToRevealButton
            playerName={myPlayer?.name || 'Player'}
            word={myPlayer?.word}
            isImposter={myPlayer?.role === 'imposter'}
            onRevealComplete={handleRevealComplete}
          />
        </SafeAreaView>
      );
    }

    // Already revealed, waiting for others
    return (
      <SafeAreaView className="flex-1 bg-game-background items-center justify-center px-6">
        <Animated.View entering={ZoomIn} className="items-center">
          <View
            className={`
              w-64 h-64 rounded-full items-center justify-center
              ${myPlayer.role === 'imposter' ? 'bg-imposter-red' : 'bg-crew-green'}
            `}
          >
            <Text className="text-white text-xl font-bold mb-2">You are</Text>
            <Text className="text-white text-3xl font-bold">
              {myPlayer.role === 'imposter' ? '🔪 IMPOSTER' : '👤 CREWMATE'}
            </Text>
            {myPlayer.role === 'crewmate' && myPlayer.word && (
              <Text className="text-white text-xl mt-4">{myPlayer.word}</Text>
            )}
          </View>
          <Text className="text-white/60 mt-8">
            Waiting for others to reveal...
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Discussion phase
  if (phase === 'discussion') {
    return (
      <SafeAreaView className="flex-1 bg-game-background">
        <View className="flex-1 px-6">
          <Animated.View entering={FadeInDown} className="items-center mb-6">
            <Text className="text-white/60 text-lg">First to speak:</Text>
            <Text className="text-primary-400 text-2xl font-bold">
              {players[firstSpeakerIndex]?.name}
            </Text>
          </Animated.View>

          <View className="items-center mb-8">
            <Timer size="large" />
          </View>

          <Card className="mb-6">
            <Text className="text-white text-center">
              Discuss with your group! Find the imposter!
            </Text>
            {myPlayer?.role === 'crewmate' && (
              <Text className="text-primary-400 text-center mt-2">
                Your word: {myPlayer.word}
              </Text>
            )}
          </Card>

          <ScrollView className="flex-1 mb-4">
            {players.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                index={index}
                isCurrentPlayer={player.id === playerId}
              />
            ))}
          </ScrollView>

          {isHost && (
            <Button
              title="⏸ Pause Game"
              onPress={handlePause}
              variant="secondary"
              size="large"
              fullWidth
            />
          )}

          {/* Pause Menu (Host only) */}
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

                <View className="gap-3">
                  <Button
                    title="▶️ Continue"
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
      </SafeAreaView>
    );
  }

  // Voting phase
  if (phase === 'voting') {
    const hasVoted = myPlayer?.hasVoted;

    if (hasVoted) {
      return (
        <SafeAreaView className="flex-1 bg-game-background items-center justify-center px-6">
          <Animated.View entering={FadeIn} className="items-center">
            <Text className="text-6xl mb-4">✅</Text>
            <Text className="text-white text-xl font-bold text-center">
              Vote Submitted!
            </Text>
            <Text className="text-white/60 text-center mt-2">
              Waiting for other players to vote...
            </Text>

            <View className="flex-row gap-1 mt-8">
              {players.map((p, i) => (
                <View
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    p.hasVoted ? 'bg-crew-green' : 'bg-slate-600'
                  }`}
                />
              ))}
            </View>
          </Animated.View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView className="flex-1 bg-game-background">
        <View className="flex-1 px-6">
          <Animated.View entering={FadeIn} className="items-center mb-6">
            <Text className="text-imposter-red text-2xl font-bold">
              🗳️ VOTING TIME
            </Text>
            <Text className="text-white/50 mt-2">
              Select {votesPerPlayer} player{votesPerPlayer > 1 ? 's' : ''} to vote out
            </Text>
            <Text className="text-primary-400 mt-1">
              Votes remaining: {votesRemaining}
            </Text>
          </Animated.View>

          <ScrollView className="flex-1 mb-4">
            {players
              .filter((p) => p.id !== playerId)
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

          <Button
            title={`Submit Vote (${selectedPlayers.length}/${votesPerPlayer})`}
            onPress={handleSubmitVote}
            variant="danger"
            size="large"
            fullWidth
            disabled={selectedPlayers.length === 0}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Results phase
  if (phase === 'results') {
    return (
      <SafeAreaView className="flex-1 bg-game-background items-center justify-center px-6">
        <Animated.View entering={ZoomIn} className="items-center">
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
      </SafeAreaView>
    );
  }

  return null;
};
