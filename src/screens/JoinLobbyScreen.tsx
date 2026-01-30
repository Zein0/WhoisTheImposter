import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card } from '../components';
import { NavigationParamList } from '../types';
import { useOnlineStore } from '../stores';

type JoinLobbyScreenProps = {
  navigation: NativeStackNavigationProp<NavigationParamList, 'JoinLobby'>;
};

export const JoinLobbyScreen: React.FC<JoinLobbyScreenProps> = ({
  navigation,
}) => {
  const { joinLobby, connectionError } = useOnlineStore();
  const [lobbyCode, setLobbyCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!lobbyCode.trim()) {
      Alert.alert('Missing Code', 'Please enter a lobby code.');
      return;
    }
    if (!playerName.trim()) {
      Alert.alert('Missing Name', 'Please enter your name.');
      return;
    }

    setIsJoining(true);

    try {
      const success = await joinLobby(lobbyCode.trim().toUpperCase(), playerName.trim());

      if (success) {
        navigation.replace('OnlineGame', { lobbyCode: lobbyCode.trim().toUpperCase() });
      } else {
        Alert.alert(
          'Could Not Join',
          'The lobby code may be invalid or the game has already started.'
        );
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Failed to connect to the lobby.');
    } finally {
      setIsJoining(false);
    }
  };

  const formatCode = (text: string) => {
    // Remove any non-alphanumeric characters and uppercase
    return text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
  };

  return (
    <SafeAreaView className="flex-1 bg-game-background">
      <View className="flex-1 px-6 py-4">
        {/* Header */}
        <Animated.View entering={FadeInDown} className="mb-8">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center mb-4"
          >
            <Text className="text-primary-400 text-lg">← Back</Text>
          </TouchableOpacity>

          <Text className="text-white text-2xl font-bold">Join a Lobby</Text>
          <Text className="text-white/60 mt-1">
            Enter the 6-character code from the host
          </Text>
        </Animated.View>

        {/* Join Form */}
        <Animated.View entering={FadeIn.delay(200)}>
          <Card className="mb-6">
            <Text className="text-white font-bold mb-2">Your Name</Text>
            <TextInput
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Enter your name"
              placeholderTextColor="#64748b"
              className="bg-slate-700 rounded-xl px-4 py-3 text-white text-lg mb-4"
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text className="text-white font-bold mb-2">Lobby Code</Text>
            <TextInput
              value={lobbyCode}
              onChangeText={(text) => setLobbyCode(formatCode(text))}
              placeholder="XXXXXX"
              placeholderTextColor="#64748b"
              className="bg-slate-700 rounded-xl px-4 py-4 text-white text-2xl text-center font-bold tracking-widest"
              autoCapitalize="characters"
              maxLength={6}
              returnKeyType="join"
              onSubmitEditing={handleJoin}
            />
          </Card>
        </Animated.View>

        {/* Error Display */}
        {connectionError && (
          <Animated.View entering={FadeIn}>
            <View className="bg-imposter-red/20 rounded-xl p-4 mb-4">
              <Text className="text-imposter-red text-center">
                {connectionError}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Join Button */}
        <Animated.View entering={FadeIn.delay(300)}>
          <Button
            title="Join Lobby"
            onPress={handleJoin}
            variant="primary"
            size="large"
            fullWidth
            loading={isJoining}
            disabled={lobbyCode.length !== 6 || !playerName.trim()}
          />
        </Animated.View>

        {/* Info */}
        <Animated.View entering={FadeIn.delay(400)} className="mt-8">
          <Card variant="outlined">
            <Text className="text-white font-bold mb-2">💡 How it works</Text>
            <Text className="text-white/60">
              1. Ask the host for the 6-character lobby code{'\n'}
              2. Enter your name and the code above{'\n'}
              3. Wait for the host to start the game{'\n'}
              4. No subscription needed to join!
            </Text>
          </Card>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};
