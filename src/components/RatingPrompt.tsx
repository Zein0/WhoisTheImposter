import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { Button } from './Button';
import { useRatingIncentive } from '../hooks';
import { categories, PREMIUM_CATEGORY_IDS } from '../data/categories';

interface RatingPromptProps {
  visible: boolean;
  onClose: () => void;
}

export const RatingPrompt: React.FC<RatingPromptProps> = ({
  visible,
  onClose,
}) => {
  const { requestRating, completeRating } = useRatingIncentive();
  const [step, setStep] = useState<'initial' | 'select' | 'thanks'>('initial');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const premiumCategories = categories.filter((c) =>
    PREMIUM_CATEGORY_IDS.includes(c.id)
  );

  const handleRateApp = async () => {
    const success = await requestRating();
    if (success) {
      setStep('select');
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      if (prev.length >= 2) {
        return prev; // Max 2 selections
      }
      return [...prev, categoryId];
    });
  };

  const handleConfirmSelection = () => {
    if (selectedCategories.length === 2) {
      completeRating(selectedCategories as [string, string]);
      setStep('thanks');
      setTimeout(() => {
        onClose();
        setStep('initial');
        setSelectedCategories([]);
      }, 2000);
    }
  };

  const renderInitialStep = () => (
    <View className="items-center p-6">
      <Text className="text-6xl mb-4">⭐️</Text>
      <Text className="text-white text-2xl font-bold text-center mb-2">
        Enjoying the Game?
      </Text>
      <Text className="text-white/70 text-center mb-6">
        Rate us 5 stars and unlock 2 premium categories for free!
      </Text>

      <Button
        title="Rate 5 Stars ⭐️"
        onPress={handleRateApp}
        variant="success"
        size="large"
        fullWidth
      />

      <TouchableOpacity onPress={onClose} className="mt-4 p-2">
        <Text className="text-white/60">Maybe Later</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSelectStep = () => (
    <View className="p-6">
      <Text className="text-white text-xl font-bold text-center mb-2">
        Thank You! 🎉
      </Text>
      <Text className="text-white/70 text-center mb-4">
        Select 2 categories to unlock forever:
      </Text>

      <ScrollView className="max-h-80">
        <View className="flex-row flex-wrap justify-between">
          {premiumCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => toggleCategory(category.id)}
              className={`
                w-[48%] mb-3 p-4 rounded-xl border-2
                ${
                  selectedCategories.includes(category.id)
                    ? 'border-crew-green bg-crew-green/20'
                    : 'border-game-border bg-game-card'
                }
              `}
            >
              <Text className="text-3xl text-center mb-1">{category.icon}</Text>
              <Text className="text-white text-center font-medium">
                {category.name}
              </Text>
              {selectedCategories.includes(category.id) && (
                <View className="absolute top-1 right-1 bg-crew-green w-5 h-5 rounded-full items-center justify-center">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text className="text-white/60 text-center my-4">
        {selectedCategories.length}/2 selected
      </Text>

      <Button
        title="Confirm Selection"
        onPress={handleConfirmSelection}
        variant="success"
        size="large"
        fullWidth
        disabled={selectedCategories.length !== 2}
      />
    </View>
  );

  const renderThanksStep = () => (
    <Animated.View
      entering={SlideInUp}
      className="items-center p-6"
    >
      <Text className="text-6xl mb-4">🎊</Text>
      <Text className="text-white text-2xl font-bold text-center">
        Categories Unlocked!
      </Text>
      <Text className="text-white/70 text-center mt-2">
        Enjoy your new categories!
      </Text>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-center items-center p-4">
        <Animated.View
          entering={FadeIn}
          className="bg-game-card rounded-3xl w-full max-w-md overflow-hidden"
        >
          {step === 'initial' && renderInitialStep()}
          {step === 'select' && renderSelectStep()}
          {step === 'thanks' && renderThanksStep()}
        </Animated.View>
      </View>
    </Modal>
  );
};
