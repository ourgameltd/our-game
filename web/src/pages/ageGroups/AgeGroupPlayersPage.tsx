import { Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter, Users, X } from 'lucide-react';

function PlayerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-3 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-1 self-stretch rounded-full bg-gray-200 dark:bg-gray-700 min-h-[3.5rem]" />
        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="flex gap-1">
            <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
import { useAgeGroupPlayers } from '@/api/hooks';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  apiClient,
  type ApiResponse,
  type AgeGroupDetailDto,
  type AgeGroupPlayerDto,
  type AgeGroupPlayerEvaluationDto,
  type AgeGroupPlayerEvaluationAttributeDto
} from '@/api/client';
import type { CompetencyBand } from '@/api/competencies';
import PlayerCard from '@components/player/PlayerCard';
import PageTitle from '@components/common/PageTitle';
import EmptyState from '@components/common/EmptyState';
import { Routes } from '@utils/routes';
import { useRequiredParams } from '@utils/routeParams';
import { Player, PlayerAttributes } from '@/types';

export default function AgeGroupPlayersPage() {
  usePageTitle(['Age Group Players']);

  // Validate route parameters
  const params = useRequiredParams(['clubId', 'ageGroupId'], { returnNullOnError: true });
  const clubId = params.clubId;
  const ageGroupId = params.ageGroupId;
  
  const [showArchived, setShowArchived] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  
  // Fetch age group details
  const [ageGroup, setAgeGroup] = useState<{ name: string } | null>(null);
  const [ageGroupLoading, setAgeGroupLoading] = useState(true);
  const [ageGroupError, setAgeGroupError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!ageGroupId) {
      setAgeGroupLoading(false);
      setAgeGroupError('Invalid age group ID');
      return;
    }
    
    setAgeGroupLoading(true);
    apiClient.ageGroups.getById(ageGroupId)
      .then((response: ApiResponse<AgeGroupDetailDto>) => {
        if (response.success && response.data) {
          setAgeGroup({ name: response.data.name });
          setAgeGroupError(null);
        } else {
          setAgeGroupError(response.error?.message || 'Failed to load age group');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch age group:', err);
        setAgeGroupError('Failed to load age group');
      })
      .finally(() => setAgeGroupLoading(false));
  }, [ageGroupId]);
  
  // Fetch players from API
  const { data: playersData, isLoading, error } = useAgeGroupPlayers(ageGroupId || '', showArchived);
  
  // Band map keyed by player id, separate from the Player type
  const playerBands = useMemo<Record<string, CompetencyBand | null>>(() => {
    if (!playersData) return {};
    return Object.fromEntries(
      playersData.map((p: AgeGroupPlayerDto) => [p.id, p.overallBand ?? null])
    );
  }, [playersData]);

  // Map API data to Player type
  const ageGroupPlayers = useMemo<Player[]>(() => {
    if (!playersData) return [];
    
    return playersData.map((player: AgeGroupPlayerDto) => ({
      id: player.id,
      clubId: player.clubId,
      firstName: player.firstName,
      lastName: player.lastName,
      nickname: player.nickname,
      dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth) : undefined,
      photo: player.photo,
      associationId: player.associationId,
      preferredPositions: player.preferredPositions as any[],
      attributes: {
        ballControl: player.attributes?.dribbling ?? 0,
        crossing: player.attributes?.crossing ?? 0,
        weakFoot: player.attributes?.weakFoot ?? 0,
        dribbling: player.attributes?.dribbling ?? 0,
        finishing: player.attributes?.finishing ?? 0,
        freeKick: player.attributes?.shotPower ?? 0,
        heading: player.attributes?.heading ?? 0,
        longPassing: player.attributes?.longPassing ?? 0,
        longShot: player.attributes?.longShots ?? 0,
        penalties: player.attributes?.penalties ?? 0,
        shortPassing: player.attributes?.shortPassing ?? 0,
        shotPower: player.attributes?.shotPower ?? 0,
        slidingTackle: player.attributes?.slidingTackle ?? 0,
        standingTackle: player.attributes?.standingTackle ?? 0,
        volleys: player.attributes?.volleys ?? 0,
        acceleration: player.attributes?.acceleration ?? 0,
        agility: player.attributes?.agility ?? 0,
        balance: player.attributes?.balance ?? 0,
        jumping: player.attributes?.jumping ?? 0,
        pace: player.attributes?.pace ?? 0,
        reactions: player.attributes?.reactions ?? 0,
        sprintSpeed: player.attributes?.sprintSpeed ?? 0,
        stamina: player.attributes?.stamina ?? 0,
        strength: player.attributes?.physicalStrength ?? 0,
        aggression: player.attributes?.aggression ?? 0,
        attackingPosition: player.attributes?.offensiveAwareness ?? 0,
        awareness: player.attributes?.defensiveAwareness ?? 0,
        communication: player.attributes?.leadership ?? 0,
        composure: player.attributes?.composure ?? 0,
        defensivePositioning: player.attributes?.defensiveAwareness ?? 0,
        interceptions: player.attributes?.interceptions ?? 0,
        marking: player.attributes?.marking ?? 0,
        positivity: player.attributes?.workRate ?? 0,
        positioning: player.attributes?.positioning ?? 0,
        vision: player.attributes?.vision ?? 0,
      } as PlayerAttributes,
      overallRating: player.overallRating ?? 0,
      evaluations: player.evaluations?.map((evaluation: AgeGroupPlayerEvaluationDto) => ({
        id: evaluation.id,
        playerId: evaluation.playerId,
        evaluatedBy: evaluation.evaluatedBy ?? '',
        evaluatedAt: new Date(evaluation.evaluatedAt),
        attributes: evaluation.attributes?.map((attr: AgeGroupPlayerEvaluationAttributeDto) => ({
          name: attr.attributeName ?? '',
          rating: attr.rating ?? 0,
          notes: attr.notes,
        })) ?? [],
        overallRating: evaluation.overallRating ?? 0,
        coachNotes: evaluation.coachNotes,
        period: evaluation.periodStart && evaluation.periodEnd ? {
          start: new Date(evaluation.periodStart),
          end: new Date(evaluation.periodEnd),
        } : undefined,
      })) ?? [],
      ageGroupIds: player.ageGroupIds ?? [],
      teamIds: player.teamIds ?? [],
      parentIds: player.parentIds,
      isArchived: player.isArchived,
    }));
  }, [playersData]);

  const filteredAgeGroupPlayers = useMemo(() => {
    if (!nameFilter.trim()) return ageGroupPlayers;
    const q = nameFilter.toLowerCase();
    return ageGroupPlayers.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q));
  }, [ageGroupPlayers, nameFilter]);

  // Invalid parameters state
  if (!clubId || !ageGroupId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Invalid Page Parameters</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {!clubId && !ageGroupId && 'Club ID and Age Group ID are required to view this page.'}
              {!clubId && ageGroupId && 'Club ID is required to view this page.'}
              {clubId && !ageGroupId && 'Age Group ID is required to view this page.'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              The URL may be malformed or contain invalid values.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Loading skeleton
  if (isLoading || ageGroupLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          {/* Title skeleton */}
          <div className="mb-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
          </div>
          
          {/* Toggle skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
          
          {/* List skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <PlayerCardSkeleton key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || ageGroupError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {ageGroupError ? 'Error loading age group' : 'Error loading players'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {ageGroupError || error?.message}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!ageGroup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-gray-400 text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Age Group not found</h3>
            <p className="text-gray-600 dark:text-gray-400">The requested age group could not be found.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title={`${ageGroup.name} - Players`}
          badge={ageGroupPlayers.length}
          subtitle={`Players registered to teams in the ${ageGroup.name} age group`}
        />

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Filter players by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="flex-1 py-0.5 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
            {nameFilter && (
              <button
                onClick={() => setNameFilter('')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Clear filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {showArchived && (
              <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                1 active
              </span>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="More filters"
            >
              {showFilters ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show archived players
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Players List */}
        {ageGroupPlayers.length > 0 && filteredAgeGroupPlayers.length === 0 && (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">No players match "{nameFilter}"</p>
          </div>
        )}
        {filteredAgeGroupPlayers.length > 0 && clubId && ageGroupId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAgeGroupPlayers.map((player) => (
              <Link
                key={player.id}
                to={Routes.player(clubId, ageGroupId, player.id)}
              >
                <PlayerCard
                  player={player}
                  forceCard
                  detailDisplay="banding"
                  competencyBand={playerBands[player.id]}
                  badges={player.isArchived ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      🗄️ Archived
                    </span>
                  ) : undefined}
                />
              </Link>
            ))}
          </div>
        )}
        {ageGroupPlayers.length === 0 && !nameFilter && (
          <EmptyState
            icon={Users}
            title="No players in this age group yet"
            description="Players will appear here once they are assigned to teams in this age group"
            action={
              clubId && ageGroupId ? (
                <Link
                  to={Routes.teams(clubId, ageGroupId)}
                  className="btn-primary btn-md inline-block"
                >
                  View Teams
                </Link>
              ) : undefined
            }
          />
        )}
      </main>
    </div>
  );
}

