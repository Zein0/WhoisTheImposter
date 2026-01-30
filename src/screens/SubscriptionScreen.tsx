import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card } from '../components';
import { NavigationParamList } from '../types';
import { useSubscriptionStore } from '../stores';

type SubscriptionScreenProps = {
  navigation: NativeStackNavigationProp<NavigationParamList, 'Subscription'>;
};

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  navigation,
}) => {
  const { isSubscribed, setSubscribed } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: 'weekly' as const,
      name: 'Weekly',
      price: '$1.99',
      period: '/week',
      savings: null,
    },
    {
      id: 'monthly' as const,
      name: 'Monthly',
      price: '$4.99',
      period: '/month',
      savings: 'Save 37%',
    },
    {
      id: 'yearly' as const,
      name: 'Yearly',
      price: '$29.99',
      period: '/year',
      savings: 'Save 71%',
      popular: true,
    },
  ];

  const features = [
    { icon: '🌐', title: 'Online Multiplayer', description: 'Create lobbies for friends to join' },
    { icon: '👥', title: 'Large Groups', description: 'Up to 15 players in one game' },
    { icon: '⚡', title: 'Special Modes', description: '0 imposters or everyone is imposter' },
    { icon: '📂', title: 'All Categories', description: 'Access 12+ premium word packs' },
    { icon: '✏️', title: 'Custom Categories', description: 'Create your own word lists' },
    { icon: '🎨', title: 'Exclusive Themes', description: 'Unlock special visual themes' },
  ];

  const handlePurchase = async () => {
    setIsLoading(true);

    // Mock purchase flow - in real app, use RevenueCat
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful purchase
      setSubscribed(true, selectedPlan);

      Alert.alert(
        'Welcome to Premium!',
        'You now have access to all premium features.',
        [{ text: 'Awesome!', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Purchase Failed', 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsLoading(true);

    // Mock restore - in real app, use RevenueCat
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Restore Complete', 'No previous purchases found.');
    } catch (error) {
      Alert.alert('Restore Failed', 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <SafeAreaView className="flex-1 bg-game-background">
        <View className="flex-1 px-6 py-4 items-center justify-center">
          <Animated.View entering={ZoomIn} className="items-center">
            <Text className="text-6xl mb-4">👑</Text>
            <Text className="text-white text-3xl font-bold text-center mb-2">
              You're Premium!
            </Text>
            <Text className="text-white/60 text-center mb-8">
              You have access to all features.
            </Text>
            <Button
              title="Go Back"
              onPress={() => navigation.goBack()}
              variant="primary"
              size="large"
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

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
        </Animated.View>

        {/* Hero */}
        <Animated.View
          entering={FadeIn.delay(100)}
          className="items-center mb-8"
        >
          <Text className="text-5xl mb-4">👑</Text>
          <Text className="text-white text-3xl font-bold text-center">
            Unlock Premium
          </Text>
          <Text className="text-white/60 text-center mt-2">
            Get the full experience with all features
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeIn.delay(200)} className="mb-8">
          <View className="flex-row flex-wrap justify-between">
            {features.map((feature, index) => (
              <View key={index} className="w-[48%] mb-3">
                <Card>
                  <Text className="text-2xl mb-2">{feature.icon}</Text>
                  <Text className="text-white font-bold">{feature.title}</Text>
                  <Text className="text-white/50 text-sm">
                    {feature.description}
                  </Text>
                </Card>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Plans */}
        <Animated.View entering={FadeIn.delay(300)} className="mb-8">
          <Text className="text-white text-lg font-bold mb-4 text-center">
            Choose Your Plan
          </Text>

          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              className={`
                mb-3 rounded-2xl p-4 border-2
                ${
                  selectedPlan === plan.id
                    ? 'border-primary-500 bg-primary-500/20'
                    : 'border-game-border bg-game-card'
                }
              `}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View
                    className={`
                      w-6 h-6 rounded-full border-2
                      ${
                        selectedPlan === plan.id
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-slate-500'
                      }
                    `}
                  >
                    {selectedPlan === plan.id && (
                      <Text className="text-white text-center text-xs">✓</Text>
                    )}
                  </View>
                  <View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white font-bold text-lg">
                        {plan.name}
                      </Text>
                      {plan.popular && (
                        <View className="bg-yellow-500 px-2 py-0.5 rounded-full">
                          <Text className="text-black text-xs font-bold">
                            BEST VALUE
                          </Text>
                        </View>
                      )}
                    </View>
                    {plan.savings && (
                      <Text className="text-crew-green text-sm">
                        {plan.savings}
                      </Text>
                    )}
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-white font-bold text-xl">
                    {plan.price}
                  </Text>
                  <Text className="text-white/50 text-sm">{plan.period}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeIn.delay(400)} className="mb-4">
          <Button
            title="Subscribe Now"
            onPress={handlePurchase}
            variant="success"
            size="large"
            fullWidth
            loading={isLoading}
          />
        </Animated.View>

        {/* Restore */}
        <Animated.View entering={FadeIn.delay(500)} className="items-center mb-8">
          <TouchableOpacity onPress={handleRestorePurchases}>
            <Text className="text-primary-400">Restore Purchases</Text>
          </TouchableOpacity>

          <Text className="text-white/30 text-xs text-center mt-4 px-4">
            Payment will be charged to your Apple ID account at confirmation of
            purchase. Subscription automatically renews unless it is cancelled at
            least 24 hours before the end of the current period.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};
