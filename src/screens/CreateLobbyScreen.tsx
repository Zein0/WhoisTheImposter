import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { Button, Card, CategoryCard } from '../components';
import { NavigationParamList, Category } from '../types';
import { useGameStore, useSubscriptionStore, useOnlineStore } from '../stores';
import { categories, FREE_CATEGORY_IDS } from '../data/categories';

type CreateLobbyScreenProps = {
  navigation: NativeStackNavigationProp<NavigationParamList, 'CreateLobby'>;
  route: RouteProp<NavigationParamList, 'CreateLobby'>;
};

export const CreateLobbyScreen: React.FC<CreateLobbyScreenProps> = ({
  navigation,
  route,
}) => {
  const { mode } = route.params;
  const isOnline = mode === 'online';

  const { settings, setSettings, addPlayer, players, removePlayer, resetGame } = useGameStore();
  const { isSubscribed, canAccessCategory } = useSubscriptionStore();
  const { createLobby } = useOnlineStore();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [step, setStep] = useState<'players' | 'settings'>('players');

  useEffect(() => {
    // Reset game state when entering
    resetGame();
  }, []);

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    if (players.length >= 15) {
      Alert.alert('Maximum Players', 'You can have up to 15 players.');
      return;
    }
    if (players.length >= 6 && !isSubscribed) {
      Alert.alert('Premium Required', 'Free games support up to 6 players. Upgrade to add more!');
      return;
    }
    addPlayer(newPlayerName.trim());
    setNewPlayerName('');
  };

  const handleRemovePlayer = (id: string) => {
    removePlayer(id);
  };

  const toggleCategory = (categoryId: string) => {
    if (!canAccessCategory(categoryId)) {
      navigation.navigate('Categories');
      return;
    }

    const current = settings.selectedCategories;
    if (current.includes(categoryId)) {
      if (current.length > 1) {
        setSettings({
          selectedCategories: current.filter((id) => id !== categoryId),
        });
      }
    } else {
      setSettings({
        selectedCategories: [...current, categoryId],
      });
    }
  };

  const handleImposterCountChange = (count: number) => {
    // Check for special modes
    if (count === 0 || count >= players.length) {
      if (!isSubscribed) {
        Alert.alert('Premium Required', 'Special modes require a subscription.');
        return;
      }
    }
    setSettings({ imposterCount: count });
  };

  const handleStartGame = async () => {
    if (players.length < 2) {
      Alert.alert('Not Enough Players', 'You need at least 2 players to start.');
      return;
    }

    if (isOnline) {
      const code = await createLobby(settings);
      navigation.replace('OnlineGame', { lobbyCode: code });
    } else {
      navigation.replace('LocalGame');
    }
  };

  const maxImposters = Math.max(1, players.length - 1);

  const renderPlayersStep = () => (
    <Animated.View entering={FadeIn}>
      <Card className="mb-4">
        <Text className="text-white text-lg font-bold mb-4">
          Add Players ({players.length}/{isSubscribed ? 15 : 6})
        </Text>

        <View className="flex-row gap-2 mb-4">
          <TextInput
            value={newPlayerName}
            onChangeText={setNewPlayerName}
            placeholder="Enter player name"
            placeholderTextColor="#64748b"
            className="flex-1 bg-slate-700 rounded-xl px-4 py-3 text-white"
            onSubmitEditing={handleAddPlayer}
            returnKeyType="done"
          />
          <Button
            title="Add"
            onPress={handleAddPlayer}
            variant="primary"
            size="medium"
          />
        </View>

        <ScrollView className="max-h-64">
          {players.map((player, index) => (
            <Animated.View
              key={player.id}
              entering={SlideInRight.delay(index * 50)}
              className="flex-row items-center justify-between bg-slate-700 rounded-xl p-3 mb-2"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center">
                  <Text className="text-white font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-white font-medium">{player.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemovePlayer(player.id)}
                className="w-8 h-8 bg-imposter-red rounded-full items-center justify-center"
              >
                <Text className="text-white font-bold">✕</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}

          {players.length === 0 && (
            <Text className="text-white/50 text-center py-8">
              Add players to start the game
            </Text>
          )}
        </ScrollView>
      </Card>

      <Button
        title="Next: Game Settings"
        onPress={() => setStep('settings')}
        variant="primary"
        size="large"
        fullWidth
        disabled={players.length < 2}
      />
    </Animated.View>
  );

  const renderSettingsStep = () => (
    <Animated.View entering={FadeIn}>
      {/* Categories */}
      <Card className="mb-4">
        <Text className="text-white text-lg font-bold mb-4">
          Select Categories
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {categories.slice(0, 6).map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={settings.selectedCategories.includes(category.id)}
              isLocked={!canAccessCategory(category.id)}
              onPress={() => toggleCategory(category.id)}
              index={index}
            />
          ))}
        </View>
        <Button
          title="See All Categories"
          onPress={() => navigation.navigate('Categories')}
          variant="outline"
          size="small"
        />
      </Card>

      {/* Imposter Count */}
      <Card className="mb-4">
        <Text className="text-white text-lg font-bold mb-2">
          Number of Imposters
        </Text>
        <Text className="text-imposter-red text-3xl font-bold text-center my-2">
          {settings.imposterCount === 0
            ? 'None (Special)'
            : settings.imposterCount >= players.length
            ? 'Everyone (Special)'
            : settings.imposterCount}
        </Text>
        <View className="px-2">
          <Slider
            value={settings.imposterCount}
            onValueChange={(value) => handleImposterCountChange(Math.round(value))}
            minimumValue={0}
            maximumValue={maxImposters}
            step={1}
            minimumTrackTintColor="#0ea5e9"
            maximumTrackTintColor="#334155"
            thumbTintColor="#0ea5e9"
          />
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="text-white/50">0</Text>
          <Text className="text-white/50">{maxImposters}</Text>
        </View>
        {(settings.imposterCount === 0 || settings.imposterCount >= players.length) && (
          <Text className="text-yellow-400 text-center mt-2 text-sm">
            ⚡ Special mode - Everyone gets 1 vote
          </Text>
        )}
      </Card>

      {/* Timer */}
      <Card className="mb-4">
        <Text className="text-white text-lg font-bold mb-2">
          Discussion Timer
        </Text>
        <Text className="text-primary-400 text-3xl font-bold text-center my-2">
          {Math.floor(settings.timerDuration / 60)}:{(settings.timerDuration % 60).toString().padStart(2, '0')}
        </Text>
        <View className="px-2">
          <Slider
            value={settings.timerDuration}
            onValueChange={(value) => setSettings({ timerDuration: Math.round(value) })}
            minimumValue={60}
            maximumValue={600}
            step={30}
            minimumTrackTintColor="#0ea5e9"
            maximumTrackTintColor="#334155"
            thumbTintColor="#0ea5e9"
          />
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="text-white/50">1 min</Text>
          <Text className="text-white/50">10 min</Text>
        </View>
      </Card>

      {/* Actions */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            title="Back"
            onPress={() => setStep('players')}
            variant="secondary"
            size="large"
            fullWidth
          />
        </View>
        <View className="flex-1">
          <Button
            title={isOnline ? 'Create Lobby' : 'Start Game'}
            onPress={handleStartGame}
            variant="success"
            size="large"
            fullWidth
          />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-game-background">
      <ScrollView className="flex-1 px-4 py-4">
        {/* Header */}
        <Animated.View entering={FadeInDown} className="mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center mb-4"
          >
            <Text className="text-primary-400 text-lg">← Back</Text>
          </TouchableOpacity>

          <Text className="text-white text-2xl font-bold">
            {isOnline ? 'Create Online Lobby' : 'Create Local Game'}
          </Text>
          <Text className="text-white/60 mt-1">
            {step === 'players'
              ? 'Add all players who will participate'
              : 'Configure your game settings'}
          </Text>
        </Animated.View>

        {/* Steps */}
        <View className="flex-row justify-center mb-6 gap-2">
          <View
            className={`h-2 w-16 rounded-full ${
              step === 'players' ? 'bg-primary-500' : 'bg-slate-600'
            }`}
          />
          <View
            className={`h-2 w-16 rounded-full ${
              step === 'settings' ? 'bg-primary-500' : 'bg-slate-600'
            }`}
          />
        </View>

        {step === 'players' ? renderPlayersStep() : renderSettingsStep()}
      </ScrollView>
    </SafeAreaView>
  );
};
