import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { sampleTeams } from '@/data/teams';
import { sampleClubs } from '@/data/clubs';
import { Kit } from '@/types';
import KitBuilder from '@/components/kit/KitBuilder';
import KitCard from '@/components/kit/KitCard';
import PageTitle from '@components/common/PageTitle';

export default function TeamKitsPage() {
  const { clubId, teamId } = useParams();
  const team = sampleTeams.find(t => t.id === teamId);
  const club = sampleClubs.find(c => c.id === clubId);
  
  const [teamKits, setTeamKits] = useState<Kit[]>(team?.kits || []);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | undefined>();

  if (!team || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
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
      <main className="mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-grow">
            <PageTitle
              title={`${team.name} - Kit Management`}
              subtitle="Manage team-specific kits"
              action={!showBuilder && !team.isArchived ? {
                label: 'Create Kit',
                onClick: () => setShowBuilder(true),
                variant: 'success',
                icon: 'plus'
              } : undefined}
            />
          </div>
          {team.isArchived && (
            <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 self-start">
              🗄️ Archived
            </span>
          )}
        </div>

        {/* Archived Notice */}
        {team.isArchived && (
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
          </div>
        )}

        {/* Team Kits Section */}
        {!showBuilder && (
          <>
            <div className="mb-4">
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
