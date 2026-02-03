import { useParams, Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { useAgeGroupPlayers } from '@/api/hooks';
import { 
  apiClient, 
  type ApiResponse, 
  type AgeGroupDetailDto, 
  type AgeGroupPlayerDto,
  type AgeGroupPlayerEvaluationDto,
  type AgeGroupPlayerEvaluationAttributeDto
} from '@/api/client';
import PlayerCard from '@components/player/PlayerCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';
import { Player, PlayerAttributes } from '@/types';

export default function AgeGroupPlayersPage() {
  const { clubId, ageGroupId } = useParams();
  const [showArchived, setShowArchived] = useState(false);
  
  // Fetch age group details
  const [ageGroup, setAgeGroup] = useState<{ name: string } | null>(null);
  useEffect(() => {
    if (ageGroupId) {
      apiClient.ageGroups.getById(ageGroupId).then((response: ApiResponse<AgeGroupDetailDto>) => {
        if (response.success && response.data) {
          setAgeGroup({ name: response.data.name });
        }
      });
    }
  }, [ageGroupId]);
  
  // Fetch players from API
  const { data: playersData, isLoading, error } = useAgeGroupPlayers(ageGroupId, showArchived);
  
  // Map API data to Player type
  const ageGroupPlayers = useMemo<Player[]>(() => {
    if (!playersData) return [];
    
    return playersData.map((player: AgeGroupPlayerDto) => ({
      id: player.id,
      clubId: player.clubId,
      firstName: player.firstName,
      lastName: player.lastName,
      nickname: player.nickname,
      dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth) : new Date(),
      photo: player.photo,
      associationId: player.associationId,
      preferredPositions: player.preferredPositions as any[],
      attributes: {
        ballControl: player.attributes?.ballControl ?? 0,
        crossing: player.attributes?.crossing ?? 0,
        weakFoot: player.attributes?.weakFoot ?? 0,
        dribbling: player.attributes?.dribbling ?? 0,
        finishing: player.attributes?.finishing ?? 0,
        freeKick: player.attributes?.freeKick ?? 0,
        heading: player.attributes?.heading ?? 0,
        longPassing: player.attributes?.longPassing ?? 0,
        longShot: player.attributes?.longShot ?? 0,
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
        strength: player.attributes?.strength ?? 0,
        aggression: player.attributes?.aggression ?? 0,
        attackingPosition: player.attributes?.attackingPosition ?? 0,
        awareness: player.attributes?.awareness ?? 0,
        communication: player.attributes?.communication ?? 0,
        composure: player.attributes?.composure ?? 0,
        defensivePositioning: player.attributes?.defensivePositioning ?? 0,
        interceptions: player.attributes?.interceptions ?? 0,
        marking: player.attributes?.marking ?? 0,
        positivity: player.attributes?.positivity ?? 0,
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

  // Loading skeleton
  if (isLoading) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 md:rounded-none md:p-4 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error loading players</h3>
            <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!ageGroup) {
    return <div>Age Group not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title={`${ageGroup.name} - Players`}
          badge={ageGroupPlayers.length}
          subtitle={`Players registered to teams in the ${ageGroup.name} age group`}
        />

        {/* Archived Toggle */}
        <div className="mb-4 flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show archived players
            </span>
          </label>
        </div>

        {/* Players List */}
        {ageGroupPlayers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {ageGroupPlayers.map((player) => (
              <Link
                key={player.id}
                to={Routes.player(clubId!, ageGroupId!, player.id)}
              >
                <PlayerCard 
                  player={player}
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
        {ageGroupPlayers.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-gray-400 text-5xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No players in this age group yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Players will appear here once they are assigned to teams in this age group
            </p>
            <Link
              to={Routes.teams(clubId!, ageGroupId!)}
              className="btn-primary btn-md inline-block"
            >
              View Teams
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

