import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Kit } from '@/types';
import {
  useTeamKits,
  useTeamOverview,
  useClubKits,
  useCreateTeamKit,
  useUpdateTeamKit,
  useDeleteTeamKit,
  CreateTeamKitRequest,
  UpdateTeamKitRequest,
} from '@/api/hooks';
import KitBuilder from '@/components/kit/KitBuilder';
import KitCard from '@/components/kit/KitCard';
import PageTitle from '@components/common/PageTitle';

// Skeleton component for kit card loading state
function KitCardSkeleton() {
  return (
    <div className="card-hover animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shirt</div>
          <div className="w-full aspect-square rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shorts</div>
          <div className="w-full aspect-square rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Socks</div>
          <div className="w-full aspect-square rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export default function TeamKitsPage() {
  const { teamId } = useParams();
  
  // API hooks
  const { data: teamKitsData, isLoading: kitsLoading, error: kitsError } = useTeamKits(teamId);
  const { data: teamOverview, isLoading: overviewLoading, error: overviewError } = useTeamOverview(teamId);
  const { data: clubKits, isLoading: clubKitsLoading, error: clubKitsError } = useClubKits(teamOverview?.team.clubId);
  
  // Mutation hooks
  const { createKit, isSubmitting: isCreating, error: createError } = useCreateTeamKit(teamId);
  const { updateKit, isSubmitting: isUpdating, error: updateError } = useUpdateTeamKit(teamId);
  const { deleteKit, isSubmitting: isDeleting, error: deleteError } = useDeleteTeamKit(teamId);
  
  // Local UI state
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | undefined>();

  // Handle team not found
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
  const isArchived = team?.isArchived || false;

  const handleSaveKit = async (kitData: Omit<Kit, 'id'>) => {
    if (editingKit) {
      // Update existing kit
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
      // Create new kit
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
    if (isArchived) {
      return;
    }
    setEditingKit(kit);
    setShowBuilder(true);
  };

  const handleDeleteKit = async (kitId: string) => {
    if (isArchived) {
      return;
    }
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
          <div className="flex-grow">
            <PageTitle
              title={overviewLoading ? 'Loading...' : `${team?.name} - Kit Management`}
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

        {/* Archived Notice */}
        {isArchived && (
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This team is archived. Kits cannot be added, edited, or deleted while the team is archived.
            </p>
          </div>
        )}

        {/* Kit Builder */}
        {showBuilder && (
          <div className="mb-4">
            <KitBuilder
              kit={editingKit}
              onSave={handleSaveKit}
              onCancel={handleCancel}
            />
            
            {/* Inline errors for mutations */}
            {(createError || updateError) && (
              <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mt-4">
                <p className="text-red-700 dark:text-red-300">
                  {createError?.message || updateError?.message}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Team Kits Section */}
        {!showBuilder && (
          <>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Team Kits
              </h3>

              {/* Loading state for team kits */}
              {kitsLoading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <KitCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Error state for team kits */}
              {!kitsLoading && kitsError && (
                <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-300">{kitsError.message}</p>
                </div>
              )}

              {/* Delete error */}
              {deleteError && (
                <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
                  <p className="text-red-700 dark:text-red-300">{deleteError.message}</p>
                </div>
              )}

              {/* Empty state */}
              {!kitsLoading && !kitsError && teamKits.length === 0 && (
                <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        No team-specific kits
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Create team-specific kits or use the club's kits below. Team kits will take priority 
                        over club kits when scheduling matches.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Team kits grid */}
              {!kitsLoading && !kitsError && teamKits.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamKits.map((kit) => (
                    <KitCard
                      key={kit.id}
                      kit={kit}
                      onEdit={() => handleEditKit(kit)}
                      onDelete={() => handleDeleteKit(kit.id)}
                      showActions={!isArchived}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Club Kits Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Available Club Kits
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                These kits are defined at the club level and available to all teams.
              </p>

              {/* Loading state for club kits */}
              {clubKitsLoading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <KitCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Error state for club kits */}
              {!clubKitsLoading && clubKitsError && (
                <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-300">{clubKitsError.message}</p>
                </div>
              )}

              {/* Empty state for club kits */}
              {!clubKitsLoading && !clubKitsError && (!clubKits || clubKits.length === 0) && (
                <div className="card bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No club kits available.
                  </p>
                </div>
              )}

              {/* Club kits grid */}
              {!clubKitsLoading && !clubKitsError && clubKits && clubKits.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clubKits.map((kit) => (
                    <KitCard
                      key={kit.id}
                      kit={kit}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="card mt-4 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                About Team Kits
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Team-specific kits take priority when scheduling matches. If no team kit is selected, 
                club kits will be available. If neither is selected, the system will use the club's 
                primary colors by default.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
