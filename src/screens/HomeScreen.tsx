import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, Image } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components';
import { NavigationParamList } from '../types';
import { useSubscriptionStore, useSettingsStore } from '../stores';
import { useRatingIncentive } from '../hooks';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<NavigationParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isSubscribed, loadStoredData } = useSubscriptionStore();
  const { loadSettings } = useSettingsStore();
  const { verifyRatingOnLaunch } = useRatingIncentive();

  // Floating animation for title
  const floatY = useSharedValue(0);

  useEffect(() => {
    // Load stored data on mount
    loadStoredData();
    loadSettings();
    verifyRatingOnLaunch();

    // Start floating animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const handleLocalPlay = () => {
    navigation.navigate('CreateLobby', { mode: 'local' });
  };

  const handleOnlinePlay = () => {
    if (!isSubscribed) {
      navigation.navigate('Subscription');
      return;
    }
    navigation.navigate('CreateLobby', { mode: 'online' });
  };

  const handleJoinLobby = () => {
    navigation.navigate('JoinLobby');
  };

  return (
    <SafeAreaView className="flex-1 bg-game-background">
      <View className="flex-1 px-6 py-4">
        {/* Logo and Title */}
        <Animated.View
          entering={FadeIn.duration(800)}
          style={floatingStyle}
          className="items-center mt-8 mb-8"
        >
          <Text className="text-6xl mb-4">🔍</Text>
          <Text className="text-white text-4xl font-bold text-center">
            Who's The
          </Text>
          <Text className="text-imposter-red text-5xl font-bold text-center">
            Imposter?
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text
          entering={FadeInDown.delay(200).duration(600)}
          className="text-white/60 text-center text-lg mb-12"
        >
          Find the imposter among your friends!
        </Animated.Text>

        {/* Main Actions */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          className="gap-4"
        >
          <Button
            title="🎮 Play Local"
            onPress={handleLocalPlay}
            variant="primary"
            size="large"
            fullWidth
          />

          <Button
            title={isSubscribed ? "🌐 Play Online" : "🌐 Play Online (Pro)"}
            onPress={handleOnlinePlay}
            variant={isSubscribed ? "success" : "secondary"}
            size="large"
            fullWidth
          />

          <Button
            title="🔗 Join Lobby"
            onPress={handleJoinLobby}
            variant="outline"
            size="large"
            fullWidth
          />
        </Animated.View>

        {/* Bottom Actions */}
        <View className="flex-1 justify-end gap-3">
          <Animated.View
            entering={FadeInDown.delay(600).duration(600)}
            className="flex-row gap-3"
          >
            <View className="flex-1">
              <Button
                title="📂 Categories"
                onPress={() => navigation.navigate('Categories')}
                variant="secondary"
                size="medium"
                fullWidth
              />
            </View>
            <View className="flex-1">
              <Button
                title="⚙️ Settings"
                onPress={() => navigation.navigate('Settings')}
                variant="secondary"
                size="medium"
                fullWidth
              />
            </View>
          </Animated.View>

          {!isSubscribed && (
            <Animated.View entering={FadeInDown.delay(800).duration(600)}>
              <Button
                title="⭐ Get Premium"
                onPress={() => navigation.navigate('Subscription')}
                variant="success"
                size="medium"
                fullWidth
              />
            </Animated.View>
          )}

          {/* Version */}
          <Text className="text-white/30 text-center text-sm mt-4">
            v1.0.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
