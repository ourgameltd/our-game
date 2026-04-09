import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useClubById, useAgeGroupsByClubId, AgeGroupListDto } from '@/api';
import PageTitle from '../../components/common/PageTitle';
import AgeGroupListCard from '../../components/ageGroup/AgeGroupListCard';
import { Routes } from '@utils/routes';
import { Club, AgeGroup } from '@/types';
import { usePageTitle } from '@/hooks/usePageTitle';

/**
 * Maps AgeGroupListDto from API to AgeGroup type used by components
 */
function mapAgeGroupDtoToAgeGroup(dto: AgeGroupListDto): AgeGroup {
  return {
    id: dto.id,
    clubId: dto.clubId,
    name: dto.name,
    code: dto.code,
    level: dto.level as AgeGroup['level'],
    season: dto.season,
    seasons: dto.seasons,
    defaultSeason: dto.defaultSeason,
    defaultSquadSize: dto.defaultSquadSize as AgeGroup['defaultSquadSize'],
    description: dto.description,
    coordinatorIds: [],
    isArchived: dto.isArchived,
  };
}

/**
 * Skeleton loading component for an age group card
 */
function AgeGroupCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-0 md:px-4 md:py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b overflow-hidden animate-pulse">
      {/* Mobile: Card Layout */}
      <div className="md:hidden">
        {/* Gradient Header Skeleton */}
        <div className="p-4 bg-gray-200 dark:bg-gray-700">
          <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
        {/* Stats Grid Skeleton */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-6 w-8 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                <div className="h-3 w-10 mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>

      {/* Desktop: Row Layout */}
      <div className="hidden md:flex md:items-center md:gap-4">
        <div className="w-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
          <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[60px] text-center">
            <div className="h-5 w-8 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            <div className="h-3 w-10 mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton loading component for the page title
 */
function PageTitleSkeleton() {
  return (
    <div className="animate-pulse mb-4">
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

const AgeGroupsListPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  
  usePageTitle(['Club', 'Age Groups']);
  
  const [showArchived, setShowArchived] = useState(false);
  
  // Fetch club from API
  const { data: clubData, isLoading: clubLoading, error: clubError } = useClubById(clubId);
  
  // Fetch age groups from API with archived filter
  const { data: ageGroupsData, isLoading: ageGroupsLoading, error: ageGroupsError } = useAgeGroupsByClubId(clubId, showArchived);
  
  // Map club data to Club type for component props
  const club: Club | undefined = clubData ? {
    id: clubData.id,
    name: clubData.name,
    shortName: clubData.shortName,
    logo: clubData.logo ?? '',
    colors: {
      primary: clubData.colors.primary,
      secondary: clubData.colors.secondary,
      accent: clubData.colors.accent,
    },
    location: {
      city: clubData.location.city,
      country: clubData.location.country,
      venue: clubData.location.venue,
      address: clubData.location.address,
    },
    founded: clubData.founded ?? 0,
    history: clubData.history,
    ethos: clubData.ethos,
    principles: clubData.principles,
  } : undefined;

  // Sort age groups by name
  const sortedAgeGroups = ageGroupsData
    ? [...ageGroupsData].sort((a, b) => a.name.localeCompare(b.name))
    : [];
  
  // Show not found if club doesn't exist after loading
  if (!clubLoading && !clubData && clubError) {
    return (
      <div className="mx-auto px-4 py-8">
        <p className="text-red-500">Club not found</p>
      </div>
    );
  }

  const isLoading = clubLoading || ageGroupsLoading;
  const hasError = ageGroupsError && !ageGroupsLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {clubLoading ? (
          <PageTitleSkeleton />
        ) : (
          <PageTitle
            title="Age Groups"
            subtitle="Select an age group to view teams and players"
            action={{
              label: 'Add Age Group',
              icon: 'plus',
              title: 'Add Age Group',
              onClick: () => navigate(Routes.ageGroupNew(clubId!)),
              variant: 'success'
            }}
          />
        )}

        {/* Show Archived Checkbox */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
            />
            Show Archived Age Groups
          </label>
        </div>

        {/* Error state */}
        {hasError && (
          <div className="card p-8 text-center text-red-600 dark:text-red-400">
            Failed to load age groups. Please try again later.
          </div>
        )}

        {/* Age Groups List */}
        {!hasError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {isLoading ? (
              // Skeleton loading state
              [...Array(5)].map((_, i) => <AgeGroupCardSkeleton key={i} />)
            ) : (
              sortedAgeGroups.map(ageGroupDto => {
                const ageGroup = mapAgeGroupDtoToAgeGroup(ageGroupDto);
                
                return (
                  <Link
                    key={ageGroup.id}
                    to={Routes.ageGroup(clubId!, ageGroup.id)}
                    className="block"
                  >
                    <AgeGroupListCard
                      ageGroup={ageGroup}
                      club={club!}
                      stats={{
                        teamCount: ageGroupDto.teamCount,
                        playerCount: ageGroupDto.playerCount,
                        matchesPlayed: ageGroupDto.matchesPlayed,
                        wins: ageGroupDto.wins,
                        draws: ageGroupDto.draws,
                        losses: ageGroupDto.losses,
                        winRate: ageGroupDto.winRate,
                        goalDifference: ageGroupDto.goalDifference
                      }}
                      badges={ageGroup.isArchived ? (
                        <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          🗄️ Archived
                        </span>
                      ) : undefined}
                    />
                  </Link>
                );
              })
            )}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !hasError && sortedAgeGroups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No age groups found for this club</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgeGroupsListPage;
