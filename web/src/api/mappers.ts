/**
 * Utility functions for mapping API DTOs to frontend types
 */

import type { PlayerListItemDto } from '../api/client';
import type { Player, PlayerPosition } from '../types';

/**
 * Maps a PlayerListItemDto from the API to a partial Player object
 * suitable for use in list views (PlayerCard, etc.)
 * 
 * Note: This creates a partial Player object with only the fields
 * needed for list displays. Full player details require the
 * GET /api/players/{playerId} endpoint.
 */
export function mapPlayerListItem(dto: PlayerListItemDto): Player {
  return {
    id: dto.id || '',
    clubId: dto.clubId || '',
    firstName: dto.firstName || '',
    lastName: dto.lastName || '',
    dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : new Date(),
    photo: dto.photo,
    preferredPositions: (dto.preferredPositions || []) as PlayerPosition[],
    overallRating: dto.overallRating || 0,
    ageGroupIds: [], // Will be populated from ageGroups array
    teamIds: [], // Will be populated from teams array
    isArchived: dto.isArchived || false,
    // Minimal required fields for Player type
    attributes: {} as any,
    evaluations: [],
  };
}
