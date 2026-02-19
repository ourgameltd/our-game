import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamLevels } from '@/constants/referenceData';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
import { Routes } from '@/utils/routes';
import { useTeamOverview, useTeamPlayers, useUpdateTeam, useUpdateTeamSquadNumbers, useArchiveTeam } from '@/api/hooks';
import type { SquadNumberAssignment } from '@/api/client';

export default function TeamSettingsPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  const navigate = useNavigate();
  
  // Fetch team data

  // Fetch team data
  const { data: teamData, isLoading: isLoadingTeam } = useTeamOverview(teamId);
  const { data: players, isLoading: isLoadingPlayers, refetch: refetchPlayers } = useTeamPlayers(teamId);
  
  // API mutations
  const { updateTeam, isSubmitting: isUpdatingTeam, error: updateError } = useUpdateTeam(teamId!);
  const { updateSquadNumbers, isSubmitting: isUpdatingSquadNumbers, error: squadNumbersError } = useUpdateTeamSquadNumbers(teamId);
  const { archiveTeam, isSubmitting: isArchiving, error: archiveError } = useArchiveTeam(teamId);

  const team = teamData?.team;
  const teamPlayers = players || [];

  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    level: 'youth',
    season: '2024/25',
    primaryColor: '#1a472a',
    secondaryColor: '#ffffff'
  });

  // Initialize form data when team loads
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        shortName: team.shortName || '',
        level: team.level || 'youth',
        season: team.season || '2024/25',
        primaryColor: team.colors?.primary || '#1a472a',
        secondaryColor: team.colors?.secondary || '#ffffff'
      });
    }
  }, [team]);

  // Initialize squad numbers from team data
  const [squadNumbers, setSquadNumbers] = useState<SquadNumberAssignment[]>([]);

  useEffect(() => {
    if (teamPlayers.length > 0) {
      setSquadNumbers(
        teamPlayers.map(player => ({
          playerId: player.playerId,
          squadNumber: player.squadNumber
        }))
      );
    }
  }, [teamPlayers]);

  if (isLoadingTeam || isLoadingPlayers) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!team) {
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSquadNumberChange = (playerId: string, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    setSquadNumbers(prev => 
      prev.map(assignment => 
        assignment.playerId === playerId 
          ? { ...assignment, squadNumber: numValue }
          : assignment
      )
    );
  };

  // Check for duplicate squad numbers
  const getDuplicateSquadNumbers = (): number[] => {
    const numbers = squadNumbers
      .map(a => a.squadNumber)
      .filter((n): n is number => n !== undefined);
    const seen = new Set<number>();
    const duplicates = new Set<number>();
    numbers.forEach(n => {
      if (seen.has(n)) duplicates.add(n);
      seen.add(n);
    });
    return Array.from(duplicates);
  };

  const duplicates = getDuplicateSquadNumbers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamId) return;

    try {
      // Update team details
      await updateTeam({
        name: formData.name,
        shortName: formData.shortName || undefined,
        level: formData.level,
        season: formData.season,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor
      });

      // Update squad numbers
      await updateSquadNumbers({
        assignments: squadNumbers
      });

      // Refetch team data and navigate back
      await refetchPlayers();
      navigate(Routes.team(clubId!, ageGroupId!, teamId!));
    } catch (err) {
      console.error('Failed to update team settings:', err);
    }
  };

  const handleCancel = () => {
    navigate(Routes.team(clubId!, ageGroupId!, teamId!));
  };

  const handleArchive = async () => {
    if (!teamId) return;

    const isCurrentlyArchived = team.isArchived;
    const action = isCurrentlyArchived ? 'unarchive' : 'archive';
    const actionPast = isCurrentlyArchived ? 'unarchived' : 'archived';
    
    if (confirm(`Are you sure you want to ${action} this team? ${isCurrentlyArchived ? 'This will make it active again.' : 'This will lock the team and prevent modifications.'}`)) {
      try {
        await archiveTeam({ isArchived: !isCurrentlyArchived });
        navigate(Routes.team(clubId!, ageGroupId!, teamId!));
      } catch (err) {
        console.error('Failed to archive team:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <PageTitle
          title="Team Settings"
          subtitle="Manage team details and configuration"
          badge={team.isArchived ? "🗄️ Archived" : undefined}
        />
        {team.isArchived && (
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This team is archived. You cannot modify its settings while it is archived. Unarchive it to make changes.
            </p>
          </div>
        )}

        {/* Error Messages */}
        {(updateError || squadNumbersError || archiveError) && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">
              {updateError?.message || squadNumbersError?.message || archiveError?.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={team.isArchived || isUpdatingTeam}
                  placeholder="e.g., Reds, Blues, Whites"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Name
                </label>
                <input
                  type="text"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleInputChange}
                  placeholder="e.g., RDS, BLS, WTS"
                  maxLength={3}
                  disabled={team.isArchived || isUpdatingTeam}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level *
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  disabled={team.isArchived || isUpdatingTeam}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {teamLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Season *
                </label>
                <input
                  type="text"
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  required
                  disabled={team.isArchived || isUpdatingTeam}
                  placeholder="e.g., 2024/25"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Team Colors */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Team Colors
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              These colors will be used for team identification in listings and may influence kit designs.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color *
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleInputChange}
                    disabled={team.isArchived || isUpdatingTeam}
                    className="h-10 w-20 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    disabled={team.isArchived || isUpdatingTeam}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color *
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleInputChange}
                    disabled={team.isArchived || isUpdatingTeam}
                    className="h-10 w-20 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    disabled={team.isArchived || isUpdatingTeam}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Preview</p>
              <div className="flex gap-2">
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: formData.primaryColor }}
                />
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: formData.secondaryColor }}
                />
              </div>
            </div>
          </div>

          {/* Squad Numbers */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Squad Numbers
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Assign squad numbers (1-99) to players in this team. These numbers will appear on match sheets and player cards.
            </p>

            {duplicates.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">
                  ⚠️ Duplicate squad numbers detected: {duplicates.join(', ')}. Each player should have a unique number.
                </p>
              </div>
            )}

            {teamPlayers.length > 0 ? (
              <div className="space-y-2">
                {teamPlayers
                  .sort((a, b) => {
                    const numA = squadNumbers.find(s => s.playerId === a.playerId)?.squadNumber ?? 999;
                    const numB = squadNumbers.find(s => s.playerId === b.playerId)?.squadNumber ?? 999;
                    return numA - numB;
                  })
                  .map(player => {
                    const assignment = squadNumbers.find(a => a.playerId === player.playerId);
                    const isDuplicate = assignment?.squadNumber !== undefined && duplicates.includes(assignment.squadNumber);
                    
                    return (
                      <div 
                        key={player.playerId} 
                        className={`flex items-center gap-4 p-3 rounded-lg border ${
                          isDuplicate 
                            ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700' 
                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        {/* Player Photo */}
                        <div className="flex-shrink-0">
                          {player.photo ? (
                            <img 
                              src={player.photo} 
                              alt={player.playerName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium">
                              {player.playerName.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>

                        {/* Player Name & Position */}
                        <div className="flex-grow min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {player.playerName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {player.preferredPositions?.join(', ') || 'No position'}
                          </p>
                        </div>

                        {/* Squad Number Input */}
                        <div className="flex-shrink-0 w-20">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={assignment?.squadNumber ?? ''}
                            onChange={(e) => handleSquadNumberChange(player.playerId, e.target.value)}
                            disabled={team.isArchived || isUpdatingSquadNumbers}
                            placeholder="#"
                            className={`w-full px-3 py-2 text-center font-bold text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                              isDuplicate 
                                ? 'border-red-500 dark:border-red-500' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  No players assigned to this team yet.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Add players from the Squad page to assign squad numbers.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <FormActions
            isArchived={team.isArchived}
            onArchive={handleArchive}
            onCancel={handleCancel}
            saveDisabled={team.isArchived || duplicates.length > 0 || isUpdatingTeam || isUpdatingSquadNumbers || isArchiving}
          />
        </form>
      </main>
    </div>
  );
}
