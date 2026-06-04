import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shirt } from 'lucide-react';
import { Kit } from '@/types';
import { ClubKitDto } from '@/api/client';
import { CreateTeamKitRequest, UpdateTeamKitRequest } from '@/api/client';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  useTeamKits,
  useTeamOverview,
  useClubKits,
  useCreateTeamKit,
  useUpdateTeamKit,
  useDeleteTeamKit,
} from '@/api/hooks';
import KitBuilder from '@/components/kit/KitBuilder';
import KitCard from '@/components/kit/KitCard';
import PageTitle from '@components/common/PageTitle';
import EmptyState from '@components/common/EmptyState';

function mapClubKitToKit(apiKit: ClubKitDto): Kit {
  return {
    id: apiKit.id,
    name: apiKit.name,
    type: apiKit.type,
    shirtColor: apiKit.shirtColor,
    shortsColor: apiKit.shortsColor,
    socksColor: apiKit.socksColor,
    season: apiKit.season,
    isActive: apiKit.isActive,
  };
}

function KitCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 md:p-4 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b animate-pulse">
      <div className="flex items-stretch gap-3">
        <div className="w-1 self-stretch rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 min-w-0 flex items-center gap-4">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function TeamKitsPage() {
  usePageTitle(['Team Kits']);

  const { teamId } = useParams();

  const { data: teamKitsData, isLoading: kitsLoading, error: kitsError } = useTeamKits(teamId);
  const { data: teamOverview, isLoading: overviewLoading, error: overviewError } = useTeamOverview(teamId);
  const { data: clubKitsData, isLoading: clubKitsLoading, error: clubKitsError } = useClubKits(teamOverview?.team.clubId);

  const { createKit, error: createError } = useCreateTeamKit(teamId);
  const { updateKit, error: updateError } = useUpdateTeamKit(teamId);
  const { deleteKit, error: deleteError } = useDeleteTeamKit(teamId);

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | undefined>();

  if (!overviewLoading && (overviewError || !teamOverview)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">{overviewError?.message || 'Team not found'}</h2>
          </div>
        </main>
      </div>
    );
  }

  const team = teamOverview?.team;
  const teamKits = teamKitsData?.kits || [];
  const clubKits = (clubKitsData || []).map(mapClubKitToKit);
  const isArchived = team?.isArchived || false;
  const isLoading = overviewLoading || kitsLoading || clubKitsLoading;
  const hasError = kitsError || clubKitsError;

  const handleSaveKit = async (kitData: Omit<Kit, 'id'>) => {
    if (editingKit) {
      const request: UpdateTeamKitRequest = {
        name: kitData.name,
        type: kitData.type,
        shirtColor: kitData.shirtColor,
        shortsColor: kitData.shortsColor,
        socksColor: kitData.socksColor,
        season: kitData.season,
        isActive: kitData.isActive,
      };
      await updateKit(editingKit.id, request);
      if (!updateError) {
        setShowBuilder(false);
        setEditingKit(undefined);
      }
    } else {
      const request: CreateTeamKitRequest = {
        name: kitData.name,
        type: kitData.type,
        shirtColor: kitData.shirtColor,
        shortsColor: kitData.shortsColor,
        socksColor: kitData.socksColor,
        season: kitData.season,
        isActive: kitData.isActive,
      };
      await createKit(request);
      if (!createError) {
        setShowBuilder(false);
        setEditingKit(undefined);
      }
    }
  };

  const handleEditKit = (kit: Kit) => {
    if (isArchived) return;
    setEditingKit(kit);
    setShowBuilder(true);
  };

  const handleDeleteKit = async (kitId: string) => {
    if (isArchived) return;
    if (confirm('Are you sure you want to delete this kit?')) {
      await deleteKit(kitId);
    }
  };

  const handleCancel = () => {
    setShowBuilder(false);
    setEditingKit(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="grow">
            <PageTitle
              title={overviewLoading ? 'Loading...' : `${team?.name} - Kits`}
              subtitle="Manage team-specific kits"
              action={!showBuilder && !isArchived && !overviewLoading ? {
                label: 'Create Kit',
                onClick: () => setShowBuilder(true),
                variant: 'success',
                icon: 'plus'
              } : undefined}
            />
          </div>
          {isArchived && (
            <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 self-start">
              🗄️ Archived
            </span>
          )}
        </div>

        {isArchived && (
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This team is archived. Kits cannot be added, edited, or deleted while the team is archived.
            </p>
          </div>
        )}

        {showBuilder && (
          <div className="mb-4">
            <KitBuilder
              kit={editingKit}
              onSave={handleSaveKit}
              onCancel={handleCancel}
            />
            {(createError || updateError) && (
              <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mt-4">
                <p className="text-red-700 dark:text-red-300">
                  {createError?.message || updateError?.message}
                </p>
              </div>
            )}
          </div>
        )}

        {!showBuilder && (
          <>
            {deleteError && (
              <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
                <p className="text-red-700 dark:text-red-300">{deleteError.message}</p>
              </div>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <KitCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!isLoading && hasError && (
              <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-red-700 dark:text-red-300">
                  {kitsError?.message || clubKitsError?.message}
                </p>
              </div>
            )}

            {!isLoading && !hasError && teamKits.length === 0 && clubKits.length === 0 && (
              <EmptyState
                icon={Shirt}
                title="No kits yet"
                description="No kits have been created for this team or club yet."
                action={
                  !isArchived ? (
                    <button onClick={() => setShowBuilder(true)} className="btn-success">
                      Create First Kit
                    </button>
                  ) : undefined
                }
              />
            )}

            {!isLoading && !hasError && (teamKits.length > 0 || clubKits.length > 0) && (
              <div className="grid grid-cols-1 gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
                {teamKits.map((kit) => (
                  <KitCard
                    key={kit.id}
                    kit={kit}
                    isInherited={false}
                    onEdit={() => handleEditKit(kit)}
                    onDelete={() => handleDeleteKit(kit.id)}
                    showActions={!isArchived}
                    variant="list"
                  />
                ))}
                {clubKits.map((kit) => (
                  <KitCard
                    key={kit.id}
                    kit={kit}
                    isInherited={true}
                    showActions={false}
                    variant="list"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
