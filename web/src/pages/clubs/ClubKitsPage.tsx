import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Shirt } from 'lucide-react';
import { Kit } from '@/types';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  ClubKitDto,
  useClubById,
  useClubKits,
  useCreateClubKit,
  useUpdateClubKit,
  useDeleteClubKit,
} from '@/api';
import { CreateClubKitRequest, UpdateClubKitRequest } from '@/api/client';
import KitBuilder from '@/components/kit/KitBuilder';
import KitCard from '@/components/kit/KitCard';
import PageTitle from '@components/common/PageTitle';
import EmptyState from '@components/common/EmptyState';
import { Routes } from '@/utils/routes';

function KitCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-200 dark:bg-gray-700" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

// Map API DTO to Kit type for component compatibility
function mapApiKitToKit(apiKit: ClubKitDto): Kit {
  return {
    id: apiKit.id,
    name: apiKit.name,
    type: apiKit.type,
    shirtColor: apiKit.shirtColor,
    shortsColor: apiKit.shortsColor,
    socksColor: apiKit.socksColor,
    season: apiKit.season,
    isActive: apiKit.isActive
  };
}

export default function ClubKitsPage() {
  usePageTitle(['Club Kits']);

  const location = useLocation();
  const navigate = useNavigate();
  const { clubId, kitId } = useParams<{ clubId: string; kitId?: string }>();
  const pathKitId = location.pathname.split('/kits/')[1]?.split('/')[0];
  const activeKitId = kitId || pathKitId;
  const isKitDetailPage = Boolean(activeKitId);

  const {
    data: apiKits,
    isLoading: kitsLoading,
    error: kitsError,
    refetch: refetchKits,
  } = useClubKits(clubId);
  const { data: club, isLoading: clubLoading, error: clubError } = useClubById(clubId);

  const {
    createKit,
    data: createdKit,
    error: createError,
  } = useCreateClubKit(clubId);
  const {
    updateKit,
    data: updatedKit,
    error: updateError,
  } = useUpdateClubKit(clubId);
  const { deleteKit, error: deleteError } = useDeleteClubKit(clubId);

  // Local state for UI
  const [showBuilder, setShowBuilder] = useState(false);
  const kits = (apiKits ?? []).map(mapApiKitToKit);
  const selectedKit = activeKitId ? kits.find((kit) => kit.id === activeKitId) : undefined;

  useEffect(() => {
    if (!createdKit && !updatedKit) {
      return;
    }

    if (!isKitDetailPage) {
      setShowBuilder(false);
    }
  }, [createdKit, updatedKit, isKitDetailPage]);

  // Show club not found error
  if (!clubLoading && (clubError || !club)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">{clubError?.message || 'Club not found'}</h2>
          </div>
        </main>
      </div>
    );
  }

  const handleSaveKit = async (kitData: Omit<Kit, 'id'>) => {
    if (isKitDetailPage && selectedKit) {
      const request: UpdateClubKitRequest = {
        name: kitData.name,
        type: kitData.type,
        shirtColor: kitData.shirtColor,
        shortsColor: kitData.shortsColor,
        socksColor: kitData.socksColor,
        season: kitData.season,
        isActive: kitData.isActive,
      };

      await updateKit(selectedKit.id, request);
      await refetchKits();
    } else {
      const request: CreateClubKitRequest = {
        name: kitData.name,
        type: kitData.type,
        shirtColor: kitData.shirtColor,
        shortsColor: kitData.shortsColor,
        socksColor: kitData.socksColor,
        season: kitData.season,
        isActive: kitData.isActive,
      };

      await createKit(request);
      await refetchKits();
      setShowBuilder(false);
    }
  };

  const handleDeleteKit = async () => {
    if (!selectedKit || !clubId) {
      return;
    }

    if (confirm('Are you sure you want to delete this kit?')) {
      await deleteKit(selectedKit.id);
      await refetchKits();
      navigate(Routes.clubKits(clubId));
    }
  };

  const handleCancel = () => {
    if (isKitDetailPage && clubId) {
      navigate(Routes.clubKits(clubId));
      return;
    }

    setShowBuilder(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title={clubLoading ? 'Loading...' : (isKitDetailPage ? `${club?.name} - ${selectedKit?.name || 'Kit'}` : `${club?.name} - Kits`)}
          subtitle={isKitDetailPage ? 'Edit kit details and manage deletion from this page' : 'Manage club kits that can be used by all teams'}
          backLink={isKitDetailPage && clubId ? Routes.clubKits(clubId) : undefined}
          action={!isKitDetailPage && !showBuilder && !kitsLoading ? {
            label: 'Create Kit',
            onClick: () => setShowBuilder(true),
            variant: 'success',
            icon: 'plus'
          } : undefined}
        />

        {/* Create Kit Builder */}
        {!isKitDetailPage && showBuilder && (
          <div className="mb-4">
            <KitBuilder
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

        {/* Kit Detail */}
        {isKitDetailPage && !kitsLoading && !kitsError && selectedKit && (
          <div className="space-y-4">
            <KitBuilder
              kit={selectedKit}
              onSave={handleSaveKit}
              onCancel={handleCancel}
              onDelete={handleDeleteKit}
            />

            {(updateError || deleteError) && (
              <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-red-700 dark:text-red-300">
                  {updateError?.message || deleteError?.message}
                </p>
              </div>
            )}
          </div>
        )}

        {isKitDetailPage && !kitsLoading && !kitsError && !selectedKit && (
          <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300">Kit not found for this club.</p>
          </div>
        )}

        {/* Loading State */}
        {!showBuilder && kitsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3].map((i) => (
              <KitCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!showBuilder && !kitsLoading && kitsError && (
          <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300">{kitsError.message}</p>
          </div>
        )}

        {/* Kits Grid */}
        {!isKitDetailPage && !showBuilder && !kitsLoading && !kitsError && kits.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {kits.map((kit) => (
              <KitCard
                key={kit.id}
                kit={kit}
                isInherited={false}
                onClick={() => navigate(Routes.clubKit(clubId!, kit.id))}
                showActions={false}
                variant="card"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isKitDetailPage && !showBuilder && !kitsLoading && !kitsError && kits.length === 0 && (
          <EmptyState
            icon={Shirt}
            title="No kits yet"
            description="No kits have been created for this club yet."
            action={
              <button
                onClick={() => setShowBuilder(true)}
                className="btn-success"
              >
                Create First Kit
              </button>
            }
          />
        )}
      </main>
    </div>
  );
}
