import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { sampleTeams } from '@/data/teams';
import { sampleClubs } from '@/data/clubs';
import { Kit } from '@/types';
import KitBuilder from '@/components/kit/KitBuilder';
import KitCard from '@/components/kit/KitCard';
import PageNavigation from '@/components/navigation/PageNavigation';
import { getTeamNavigationTabs } from '@/utils/navigationHelpers';

export default function TeamKitsPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  const team = sampleTeams.find(t => t.id === teamId);
  const club = sampleClubs.find(c => c.id === clubId);
  
  const [teamKits, setTeamKits] = useState<Kit[]>(team?.kits || []);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | undefined>();

  if (!team || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Team not found</h2>
          </div>
        </main>
      </div>
    );
  }

  const clubKits = club.kits || [];

  const handleSaveKit = (kitData: Omit<Kit, 'id'>) => {
    if (editingKit) {
      // Update existing kit
      setTeamKits(teamKits.map(k => k.id === editingKit.id ? { ...kitData, id: editingKit.id } : k));
      alert('Kit updated successfully! (Demo - not saved to backend)');
    } else {
      // Create new kit
      const newKit: Kit = {
        ...kitData,
        id: `kit-${Date.now()}`,
      };
      setTeamKits([...teamKits, newKit]);
      alert('Kit created successfully! (Demo - not saved to backend)');
    }
    setShowBuilder(false);
    setEditingKit(undefined);
  };

  const handleEditKit = (kit: Kit) => {
    if (team?.isArchived) {
      alert('Cannot edit kits for an archived team.');
      return;
    }
    setEditingKit(kit);
    setShowBuilder(true);
  };

  const handleDeleteKit = (kitId: string) => {
    if (team?.isArchived) {
      alert('Cannot delete kits for an archived team.');
      return;
    }
    if (confirm('Are you sure you want to delete this kit?')) {
      setTeamKits(teamKits.filter(k => k.id !== kitId));
      alert('Kit deleted successfully! (Demo - not saved to backend)');
    }
  };

  const handleCancel = () => {
    setShowBuilder(false);
    setEditingKit(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageNavigation tabs={getTeamNavigationTabs(clubId!, ageGroupId!, teamId!)} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {team.name} - Kit Management
                </h2>
                {team.isArchived && (
                  <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                    🗄️ Archived
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage team-specific kits
              </p>
            </div>
            {!showBuilder && !team.isArchived && (
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

        {/* Archived Notice */}
        {team.isArchived && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This team is archived. Kits cannot be added, edited, or deleted while the team is archived.
            </p>
          </div>
        )}

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

        {/* Team Kits Section */}
        {!showBuilder && (
          <>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Team Kits
              </h3>
              {teamKits.length === 0 ? (
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
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {teamKits.map((kit) => (
                    <KitCard
                      key={kit.id}
                      kit={kit}
                      onEdit={() => handleEditKit(kit)}
                      onDelete={() => handleDeleteKit(kit.id)}
                      showActions={!team.isArchived}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Club Kits Section */}
            {clubKits.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Available Club Kits
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  These kits are defined at the club level and available to all teams.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {clubKits.map((kit) => (
                    <KitCard
                      key={kit.id}
                      kit={kit}
                      showActions={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="card mt-6 bg-gray-50 dark:bg-gray-800/50">
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
