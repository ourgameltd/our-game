import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { sampleClubs } from '@/data/clubs';
import { Kit } from '@/types';
import KitBuilder from '@/components/kit/KitBuilder';
import KitCard from '@/components/kit/KitCard';
import PageNavigation from '@/components/navigation/PageNavigation';
import { getClubNavigationTabs } from '@/utils/navigationHelpers';

export default function ClubKitsPage() {
  const { clubId } = useParams();
  const club = sampleClubs.find(c => c.id === clubId);
  
  const [kits, setKits] = useState<Kit[]>(club?.kits || []);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | undefined>();

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Club not found</h2>
          </div>
        </main>
      </div>
    );
  }

  const handleSaveKit = (kitData: Omit<Kit, 'id'>) => {
    if (editingKit) {
      // Update existing kit
      setKits(kits.map(k => k.id === editingKit.id ? { ...kitData, id: editingKit.id } : k));
      alert('Kit updated successfully! (Demo - not saved to backend)');
    } else {
      // Create new kit
      const newKit: Kit = {
        ...kitData,
        id: `kit-${Date.now()}`,
      };
      setKits([...kits, newKit]);
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
      setKits(kits.filter(k => k.id !== kitId));
      alert('Kit deleted successfully! (Demo - not saved to backend)');
    }
  };

  const handleCancel = () => {
    setShowBuilder(false);
    setEditingKit(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageNavigation tabs={getClubNavigationTabs(clubId!)} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {club.name} - Kit Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage club kits that can be used by all teams
              </p>
            </div>
            {!showBuilder && (
              <button
                onClick={() => setShowBuilder(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                Create Kit
              </button>
            )}
          </div>
        </div>

        {/* Kit Builder */}
        {showBuilder && (
          <div className="mb-6">
            <KitBuilder
              kit={editingKit}
              onSave={handleSaveKit}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Info Box */}
        {!showBuilder && kits.length === 0 && (
          <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  No kits defined yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create club-level kits that can be used by all teams. Teams can also define their own kits, 
                  which will take priority over club kits when selected for matches.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Kits Grid */}
        {!showBuilder && kits.length > 0 && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="card mt-6 bg-gray-50 dark:bg-gray-800/50">
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
      </main>
    </div>
  );
}
