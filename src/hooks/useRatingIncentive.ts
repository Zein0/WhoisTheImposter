import { useCallback, useEffect, useState } from 'react';
import * as StoreReview from 'expo-store-review';
import { useSubscriptionStore } from '../stores';

const GAMES_BEFORE_PROMPT = 5;

export const useRatingIncentive = () => {
  const {
    gamesPlayed,
    hasRated,
    incrementGamesPlayed,
    setHasRated,
    addGivenFreeCategory,
    revokeGivenFreeCategories,
    givenFreeCategories,
  } = useSubscriptionStore();

  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [canVerifyRating, setCanVerifyRating] = useState(false);

  // Check if rating verification is available
  useEffect(() => {
    const checkAvailability = async () => {
      // Check if store review is available
      const isAvailable = await StoreReview.isAvailableAsync();
      setCanVerifyRating(isAvailable);
    };
    checkAvailability();
  }, []);

  // Note: iOS doesn't provide a way to verify if a user actually rated the app
  // The hasRated flag is based on user completing the rating flow
  // In a real implementation, you'd need a server-side solution or
  // use a third-party service to track ratings

  const checkShouldShowRatingPrompt = useCallback(() => {
    if (hasRated) return false;
    if (gamesPlayed < GAMES_BEFORE_PROMPT) return false;
    return true;
  }, [hasRated, gamesPlayed]);

  const requestRating = useCallback(async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
        // Note: We can't know if the user actually rated 5 stars
        // This is a limitation of the platform APIs
        // In production, you might want to:
        // 1. Ask the user to confirm they rated 5 stars
        // 2. Use a server to track ratings (if you have app analytics)
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting rating:', error);
      return false;
    }
  }, []);

  const completeRating = useCallback(
    (selectedCategories: [string, string]) => {
      setHasRated(true);
      selectedCategories.forEach((categoryId) => {
        addGivenFreeCategory(categoryId);
      });
      setShowRatingPrompt(false);
    },
    [setHasRated, addGivenFreeCategory]
  );

  // This would be called on app launch to verify rating
  // However, there's no reliable way to check if a user rated the app on iOS/Android
  // This is mostly a placeholder for a potential server-side solution
  const verifyRatingOnLaunch = useCallback(async () => {
    // In a real implementation, you might:
    // 1. Call your server to check if the user's rating is still there
    // 2. Use App Store Connect API (requires server) to check reviews
    // 3. Simply trust the local state (current implementation)

    // For now, we trust the hasRated flag
    // If you want to be stricter, you could periodically revoke:
    // if (!hasRated && givenFreeCategories.length > 0) {
    //   revokeGivenFreeCategories();
    // }
  }, [hasRated, givenFreeCategories, revokeGivenFreeCategories]);

  const onGameComplete = useCallback(() => {
    incrementGamesPlayed();
    if (checkShouldShowRatingPrompt()) {
      setShowRatingPrompt(true);
    }
  }, [incrementGamesPlayed, checkShouldShowRatingPrompt]);

  return {
    gamesPlayed,
    hasRated,
    showRatingPrompt,
    canVerifyRating,
    givenFreeCategories,
    setShowRatingPrompt,
    requestRating,
    completeRating,
    verifyRatingOnLaunch,
    onGameComplete,
    checkShouldShowRatingPrompt,
  };
};
