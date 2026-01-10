import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { sampleClubs } from '@/data/clubs';
import { Kit } from '@/types';
import KitBuilder from '@/components/kit/KitBuilder';
import KitCard from '@/components/kit/KitCard';
import PageTitle from '@components/common/PageTitle';

export default function ClubKitsPage() {
  const { clubId } = useParams();
  const club = sampleClubs.find(c => c.id === clubId);
  
  const [kits, setKits] = useState<Kit[]>(club?.kits || []);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | undefined>();

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
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
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title={`${club.name} - Kit Management`}
          subtitle="Manage club kits that can be used by all teams"
          action={!showBuilder ? {
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

        {/* Kits Grid */}
        {!showBuilder && kits.length > 0 && (
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
      </main>
    </div>
  );
}
