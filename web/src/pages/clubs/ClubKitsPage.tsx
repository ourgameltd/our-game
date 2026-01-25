import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Kit } from '@/types';
import { apiClient, ClubKitDto, ClubDetailDto } from '@/api';
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
  const { clubId } = useParams();
  
  // API state
  const [apiKits, setApiKits] = useState<ClubKitDto[]>([]);
  const [kitsLoading, setKitsLoading] = useState(true);
  const [kitsError, setKitsError] = useState<string | null>(null);
  
  const [club, setClub] = useState<ClubDetailDto | null>(null);
  const [clubLoading, setClubLoading] = useState(true);
  const [clubError, setClubError] = useState<string | null>(null);
  
  // Local state for UI
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | undefined>();

  // Fetch data from API
  useEffect(() => {
    if (!clubId) return;

    // Fetch kits
    setKitsLoading(true);
    apiClient.clubs.getKits(clubId)
      .then((response) => {
        if (response.success && response.data) {
          setApiKits(response.data);
          setKitsError(null);
        } else {
          setKitsError(response.error?.message || 'Failed to load kits');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch kits:', err);
        setKitsError('Failed to load kits from API');
      })
      .finally(() => setKitsLoading(false));

    // Fetch club
    setClubLoading(true);
    apiClient.clubs.getClubById(clubId)
      .then((response) => {
        if (response.success && response.data) {
          setClub(response.data);
          setClubError(null);
        } else {
          setClubError(response.error?.message || 'Failed to load club');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch club:', err);
        setClubError('Failed to load club from API');
      })
      .finally(() => setClubLoading(false));
  }, [clubId]);

  // Map API kits to Kit type for component compatibility
  const kits = apiKits.map(mapApiKitToKit);

  // Show club not found error
  if (!clubLoading && (clubError || !club)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">{clubError || 'Club not found'}</h2>
          </div>
        </main>
      </div>
    );
  }

  const handleSaveKit = (kitData: Omit<Kit, 'id'>) => {
    if (editingKit) {
      // Update existing kit - demo only, not saved to backend
      const updatedKits = apiKits.map(k => 
        k.id === editingKit.id 
          ? { ...k, ...kitData } 
          : k
      );
      setApiKits(updatedKits);
      alert('Kit updated successfully! (Demo - not saved to backend)');
    } else {
      // Create new kit - demo only, not saved to backend
      const newKit: ClubKitDto = {
        id: `kit-${Date.now()}`,
        name: kitData.name,
        type: kitData.type,
        shirtColor: kitData.shirtColor,
        shortsColor: kitData.shortsColor,
        socksColor: kitData.socksColor,
        season: kitData.season,
        isActive: kitData.isActive
      };
      setApiKits([...apiKits, newKit]);
      alert('Kit created successfully! (Demo - not saved to backend)');
    }
    setShowBuilder(false);
    setEditingKit(undefined);
  };

  const handleEditKit = (kit: Kit) => {
    setEditingKit(kit);
    setShowBuilder(true);
  };

  const handleDeleteKit = (kitId: string) => {
    if (confirm('Are you sure you want to delete this kit?')) {
      setApiKits(apiKits.filter(k => k.id !== kitId));
      alert('Kit deleted successfully! (Demo - not saved to backend)');
    }
  };

  const handleCancel = () => {
    setShowBuilder(false);
    setEditingKit(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title={clubLoading ? 'Loading...' : `${club?.name} - Kit Management`}
          subtitle="Manage club kits that can be used by all teams"
          action={!showBuilder && !kitsLoading ? {
            label: 'Create Kit',
            onClick: () => setShowBuilder(true),
            variant: 'success',
            icon: 'plus'
          } : undefined}
        />

        {/* Kit Builder */}
        {showBuilder && (
          <div className="mb-4">
            <KitBuilder
              kit={editingKit}
              onSave={handleSaveKit}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Loading State */}
        {!showBuilder && kitsLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <KitCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!showBuilder && !kitsLoading && kitsError && (
          <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300">{kitsError}</p>
          </div>
        )}

        {/* Kits Grid */}
        {!showBuilder && !kitsLoading && !kitsError && kits.length > 0 && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kits.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  onEdit={() => handleEditKit(kit)}
                  onDelete={() => handleDeleteKit(kit.id)}
                  showActions={true}
                />
              ))}
            </div>

            <div className="card mt-4 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                About Club Kits
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Club kits are available to all teams within the club. When scheduling a match, 
                teams can select from club kits or their own team-specific kits. If no kit is 
                selected, the system will use the club's primary colors by default.
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showBuilder && !kitsLoading && !kitsError && kits.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No kits have been created for this club yet.
            </p>
            <button
              onClick={() => setShowBuilder(true)}
              className="btn-success"
            >
              Create First Kit
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
