import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, CategoryCard, RatingPrompt } from '../components';
import { NavigationParamList } from '../types';
import { useSubscriptionStore, useGameStore } from '../stores';
import { categories, FREE_CATEGORY_IDS, PREMIUM_CATEGORY_IDS } from '../data/categories';

type CategoriesScreenProps = {
  navigation: NativeStackNavigationProp<NavigationParamList, 'Categories'>;
};

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  navigation,
}) => {
  const {
    isSubscribed,
    canAccessCategory,
    givenFreeCategories,
    hasRated,
  } = useSubscriptionStore();
  const { settings, setSettings } = useGameStore();
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);

  const freeCategories = categories.filter((c) => FREE_CATEGORY_IDS.includes(c.id));
  const premiumCategories = categories.filter((c) => PREMIUM_CATEGORY_IDS.includes(c.id));
  const unlockedCategories = categories.filter(
    (c) => givenFreeCategories.includes(c.id)
  );

  const toggleCategory = (categoryId: string) => {
    if (!canAccessCategory(categoryId)) {
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

          <Text className="text-white text-2xl font-bold">Categories</Text>
          <Text className="text-white/60 mt-1">
            Select categories to include in your game
          </Text>
        </Animated.View>

        {/* Free Categories */}
        <Animated.View entering={FadeIn.delay(200)} className="mb-6">
          <Text className="text-white text-lg font-bold mb-3">
            🆓 Free Categories
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {freeCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={settings.selectedCategories.includes(category.id)}
                isLocked={false}
                onPress={() => toggleCategory(category.id)}
                index={index}
              />
            ))}
          </View>
        </Animated.View>

        {/* Unlocked by Rating */}
        {unlockedCategories.length > 0 && (
          <Animated.View entering={FadeIn.delay(300)} className="mb-6">
            <Text className="text-white text-lg font-bold mb-3">
              ⭐ Unlocked by Rating
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {unlockedCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isSelected={settings.selectedCategories.includes(category.id)}
                  isLocked={false}
                  onPress={() => toggleCategory(category.id)}
                  index={index}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Premium Categories */}
        <Animated.View entering={FadeIn.delay(400)} className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-lg font-bold">
              👑 Premium Categories
            </Text>
            {!isSubscribed && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Subscription')}
                className="bg-yellow-500 px-3 py-1 rounded-full"
              >
                <Text className="text-black font-bold text-sm">Unlock All</Text>
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-row flex-wrap justify-between">
            {premiumCategories.map((category, index) => {
              const isUnlocked = canAccessCategory(category.id);
              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isSelected={settings.selectedCategories.includes(category.id)}
                  isLocked={!isUnlocked}
                  onPress={() => {
                    if (isUnlocked) {
                      toggleCategory(category.id);
                    } else {
                      navigation.navigate('Subscription');
                    }
                  }}
                  index={index}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* Get More Categories - Rating CTA */}
        {!hasRated && !isSubscribed && (
          <Animated.View entering={FadeIn.delay(500)} className="mb-8">
            <View className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6">
              <Text className="text-white text-xl font-bold mb-2">
                ⭐ Rate Us for Free Categories!
              </Text>
              <Text className="text-white/80 mb-4">
                Give us a 5-star rating and unlock 2 premium categories for free!
              </Text>
              <Button
                title="Rate & Unlock"
                onPress={() => setShowRatingPrompt(true)}
                variant="success"
                size="medium"
              />
            </View>
          </Animated.View>
        )}

        {/* Selected Summary */}
        <Animated.View entering={FadeIn.delay(600)} className="mb-8">
          <View className="bg-game-card rounded-2xl p-4">
            <Text className="text-white font-bold mb-2">
              Selected Categories: {settings.selectedCategories.length}
            </Text>
            <Text className="text-white/60">
              {settings.selectedCategories
                .map((id) => categories.find((c) => c.id === id)?.name)
                .join(', ')}
            </Text>
          </View>
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
