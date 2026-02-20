import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/api';
import type { AgeGroupCoachDto, AgeGroupDetailDto } from '@/api';
import type { Coach } from '@/types';
import CoachCard from '@components/coach/CoachCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';
import { useRequiredParams } from '@utils/routeParams';

export default function AgeGroupCoachesPage() {
  const params = useRequiredParams(['clubId', 'ageGroupId'], { returnNullOnError: true });
  const clubId = params.clubId;
  const ageGroupId = params.ageGroupId;
  
  const [ageGroup, setAgeGroup] = useState<AgeGroupDetailDto | null>(null);
  const [ageGroupLoading, setAgeGroupLoading] = useState(true);
  const [ageGroupError, setAgeGroupError] = useState<string | null>(null);

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const [coachesError, setCoachesError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId || !ageGroupId) return;

    // Fetch age group data
    setAgeGroupLoading(true);
    apiClient.ageGroups.getById(ageGroupId)
      .then((response) => {
        if (response.success && response.data) {
          setAgeGroup(response.data);
          setAgeGroupError(null);
        } else {
          setAgeGroupError(response.error?.message || 'Failed to load age group');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch age group:', err);
        setAgeGroupError('Failed to load age group from API');
      })
      .finally(() => setAgeGroupLoading(false));

    // Fetch coaches data
    setCoachesLoading(true);
    apiClient.ageGroups.getCoachesByAgeGroupId(ageGroupId)
      .then((response) => {
        if (response.success && response.data) {
          // Map AgeGroupCoachDto to Coach type
          const mappedCoaches = response.data.map(mapCoachDtoToCoach);
          setCoaches(mappedCoaches);
          setCoachesError(null);
        } else {
          setCoachesError(response.error?.message || 'Failed to load coaches');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch coaches:', err);
        setCoachesError('Failed to load coaches from API');
      })
      .finally(() => setCoachesLoading(false));
  }, [clubId, ageGroupId]);

  const mapCoachDtoToCoach = (dto: AgeGroupCoachDto): Coach => {
    // Convert DateOnly string to Date, use fallback if null
    const dateOfBirth = dto.dateOfBirth 
      ? new Date(dto.dateOfBirth) 
      : new Date('2000-01-01');

    // Extract team IDs from teams array
    const teamIds = dto.teams.map(team => team.id);

    // Ensure role is one of the valid Coach role types
    const validRole = ['head-coach', 'assistant-coach', 'goalkeeper-coach', 'fitness-coach', 'technical-coach']
      .includes(dto.role) ? dto.role : 'head-coach';

    return {
      id: dto.id,
      clubId: dto.clubId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth,
      photo: dto.photo,
      email: dto.email || '',
      phone: dto.phone || '',
      associationId: dto.associationId,
      hasAccount: dto.hasAccount,
      teamIds,
      role: validRole as Coach['role'],
      biography: dto.biography,
      specializations: dto.specializations,
      isArchived: dto.isArchived
    };
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {ageGroupLoading ? (
          <div className="animate-pulse mb-4">
            <div className="h-7 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : ageGroup ? (
          <PageTitle
            title={`${ageGroup.name} - Coaches`}
            badge={coaches.length}
            subtitle={`Coaches assigned to teams in the ${ageGroup.name} age group`}
          />
        ) : (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 font-medium">Failed to load age group</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{ageGroupError}</p>
          </div>
        )}

        {/* Coaches List */}
        {coachesError ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 font-medium">Failed to load coaches</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{coachesError}</p>
          </div>
        ) : coachesLoading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        ) : coaches.length > 0 && clubId && ageGroupId ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {coaches.map((coach) => (
              <Link key={coach.id} to={Routes.ageGroupCoach(clubId, ageGroupId, coach.id)}>
                <CoachCard coach={coach} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">👨‍🏫</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No coaches assigned yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Assign coaches to teams in this age group to see them here
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
