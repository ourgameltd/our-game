import { usePlayer, useUpdatePlayer } from '@/api';
import type { PlayerDto, UpdatePlayerRequest } from '@/api';

export interface UsePlayerSettingsResult {
  player: PlayerDto | null;
  isLoading: boolean;
  loadError: Error | null;
  updatePlayer: (request: UpdatePlayerRequest) => Promise<void>;
  isSubmitting: boolean;
  submitError: { message: string; statusCode?: number; validationErrors?: Record<string, string[]> } | null;
  isSuccess: boolean;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing player settings (read and update operations).
 * 
 * Combines `usePlayer` for fetching player data and `useUpdatePlayer` for saving changes.
 * Provides a clean interface for the PlayerSettingsPage component.
 * 
 * @param playerId - The ID of the player to manage (optional)
 * @returns Combined state for player data fetching and updating
 */
export function usePlayerSettings(playerId?: string): UsePlayerSettingsResult {
  // Fetch player data
  const { 
    data: player, 
    isLoading, 
    error: loadError,
    refetch 
  } = usePlayer(playerId);

  // Mutation hook for updates (only initialize if playerId exists)
  const mutation = useUpdatePlayer(playerId || '');
  
  // Extract mutation state
  const { 
    updatePlayer, 
    isSubmitting, 
    error: submitError,
    data: updatedPlayer 
  } = mutation;

  // isSuccess is true when we have successfully updated data
  const isSuccess = !isSubmitting && updatedPlayer !== null && submitError === null;

  return {
    player,
    isLoading,
    loadError,
    updatePlayer,
    isSubmitting,
    submitError,
    isSuccess,
    refetch,
  };
}
