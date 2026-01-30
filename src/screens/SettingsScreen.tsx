import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, Linking } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button } from '../components';
import { NavigationParamList } from '../types';
import { useSettingsStore, useSubscriptionStore } from '../stores';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<NavigationParamList, 'Settings'>;
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const {
    isDarkMode,
    soundEnabled,
    vibrationEnabled,
    toggleDarkMode,
    toggleSound,
    toggleVibration,
  } = useSettingsStore();

  const { isSubscribed, subscriptionType } = useSubscriptionStore();

  const SettingRow = ({
    title,
    subtitle,
    value,
    onToggle,
    icon,
  }: {
    title: string;
    subtitle?: string;
    value: boolean;
    onToggle: () => void;
    icon: string;
  }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-slate-700">
      <View className="flex-row items-center flex-1">
        <Text className="text-2xl mr-3">{icon}</Text>
        <View className="flex-1">
          <Text className="text-white font-medium">{title}</Text>
          {subtitle && (
            <Text className="text-white/50 text-sm">{subtitle}</Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#334155', true: '#0ea5e9' }}
        thumbColor={value ? '#ffffff' : '#94a3b8'}
      />
    </View>
  );

  const ActionRow = ({
    title,
    subtitle,
    icon,
    onPress,
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-slate-700"
    >
      <View className="flex-row items-center flex-1">
        <Text className="text-2xl mr-3">{icon}</Text>
        <View className="flex-1">
          <Text className="text-white font-medium">{title}</Text>
          {subtitle && (
            <Text className="text-white/50 text-sm">{subtitle}</Text>
          )}
        </View>
      </View>
      <Text className="text-white/50">→</Text>
    </TouchableOpacity>
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

          <Text className="text-white text-2xl font-bold">Settings</Text>
        </Animated.View>

        {/* Subscription Status */}
        <Animated.View entering={FadeIn.delay(100)}>
          <Card className="mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-lg font-bold">
                  {isSubscribed ? '👑 Premium Member' : '🎮 Free Player'}
                </Text>
                <Text className="text-white/60 text-sm">
                  {isSubscribed
                    ? `${subscriptionType} subscription active`
                    : 'Upgrade for all features'}
                </Text>
              </View>
              {!isSubscribed && (
                <Button
                  title="Upgrade"
                  onPress={() => navigation.navigate('Subscription')}
                  variant="success"
                  size="small"
                />
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Preferences */}
        <Animated.View entering={FadeIn.delay(200)}>
          <Card className="mb-6">
            <Text className="text-white text-lg font-bold mb-2">
              Preferences
            </Text>

            <SettingRow
              title="Dark Mode"
              subtitle="Use dark theme"
              icon="🌙"
              value={isDarkMode}
              onToggle={toggleDarkMode}
            />

            <SettingRow
              title="Sound Effects"
              subtitle="Play sounds during game"
              icon="🔊"
              value={soundEnabled}
              onToggle={toggleSound}
            />

            <SettingRow
              title="Vibration"
              subtitle="Haptic feedback"
              icon="📳"
              value={vibrationEnabled}
              onToggle={toggleVibration}
            />
          </Card>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeIn.delay(300)}>
          <Card className="mb-6">
            <Text className="text-white text-lg font-bold mb-2">
              About
            </Text>

            <ActionRow
              title="Rate the App"
              subtitle="Help us improve!"
              icon="⭐"
              onPress={() => {
                // Would open app store rating
              }}
            />

            <ActionRow
              title="Share with Friends"
              subtitle="Invite others to play"
              icon="📤"
              onPress={() => {
                // Would open share sheet
              }}
            />

            <ActionRow
              title="Privacy Policy"
              icon="🔒"
              onPress={() => {
                Linking.openURL('https://example.com/privacy');
              }}
            />

            <ActionRow
              title="Terms of Service"
              icon="📄"
              onPress={() => {
                Linking.openURL('https://example.com/terms');
              }}
            />
          </Card>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeIn.delay(400)}>
          <Card className="mb-6">
            <Text className="text-white text-lg font-bold mb-2">
              Support
            </Text>

            <ActionRow
              title="Contact Us"
              subtitle="Get help or send feedback"
              icon="💬"
              onPress={() => {
                Linking.openURL('mailto:support@example.com');
              }}
            />

            <ActionRow
              title="Restore Purchases"
              subtitle="Restore your subscription"
              icon="🔄"
              onPress={() => {
                // Would restore purchases via RevenueCat
              }}
            />
          </Card>
        </Animated.View>

        {/* Version */}
        <Animated.View entering={FadeIn.delay(500)} className="items-center mb-8">
          <Text className="text-white/30 text-sm">
            Who's The Imposter v1.0.0
          </Text>
          <Text className="text-white/20 text-xs mt-1">
            Made with ❤️
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};
