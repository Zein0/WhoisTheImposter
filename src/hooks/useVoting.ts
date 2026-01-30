import { useState, useCallback, useMemo } from 'react';
import { useGameStore } from '../stores';

export const useVoting = () => {
  const { players, settings, submitVotes, calculateResults } = useGameStore();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  // Calculate votes per player based on game settings
  const votesPerPlayer = useMemo(() => {
    // Special modes get 1 vote each
    if (settings.isSpecialMode) return 1;
    // Normal mode: votes = number of imposters
    return Math.max(1, settings.imposterCount);
  }, [settings.isSpecialMode, settings.imposterCount]);

  const toggleVote = useCallback(
    (playerId: string) => {
      setSelectedPlayers((prev) => {
        if (prev.includes(playerId)) {
          // Remove vote
          return prev.filter((id) => id !== playerId);
        } else if (prev.length < votesPerPlayer) {
          // Add vote
          return [...prev, playerId];
        }
        // Already at max votes
        return prev;
      });
    },
    [votesPerPlayer]
  );

  const clearVotes = useCallback(() => {
    setSelectedPlayers([]);
  }, []);

  const submitPlayerVotes = useCallback(
    (playerId: string) => {
      if (selectedPlayers.length === 0) return;
      submitVotes(playerId, selectedPlayers);
      setSelectedPlayers([]);
    },
    [selectedPlayers, submitVotes]
  );

  const checkAllVoted = useCallback(() => {
    const allVoted = players.every((p) => p.hasVoted);
    if (allVoted) {
      calculateResults();
    }
    return allVoted;
  }, [players, calculateResults]);

  const getVoteCount = useCallback(
    (playerId: string) => {
      return players.reduce((count, player) => {
        return count + (player.votes.includes(playerId) ? 1 : 0);
      }, 0);
    },
    [players]
  );

  return {
    selectedPlayers,
    votesPerPlayer,
    votesRemaining: votesPerPlayer - selectedPlayers.length,
    toggleVote,
    clearVotes,
    submitPlayerVotes,
    checkAllVoted,
    getVoteCount,
    canSubmit: selectedPlayers.length > 0,
  };
};
