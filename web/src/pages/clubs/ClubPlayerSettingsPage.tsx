import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer, useClubById, useClubTeams, useUpdatePlayer, UpdatePlayerRequest } from '@/api';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
import { Routes } from '@/utils/routes';
import { PlayerPosition } from '@/types';

export default function ClubPlayerSettingsPage() {
  const { clubId, playerId } = useParams();
  const navigate = useNavigate();
  const isNewPlayer = playerId === 'new';

  // API hooks
  const { data: player, isLoading: playerLoading, error: playerError } = usePlayer(isNewPlayer ? undefined : playerId);
  const { data: club, isLoading: clubLoading } = useClubById(clubId);
  const { data: allTeams, isLoading: teamsLoading } = useClubTeams(clubId);
  const { updatePlayer, isSubmitting, error: submitError } = useUpdatePlayer(playerId || '');

  const [formInitialized, setFormInitialized] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    dateOfBirth: '',
    photo: '',
    associationId: '',
    preferredPositions: [] as string[],
  });

  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Initialize form state from API data
  useEffect(() => {
    if (player && !formInitialized) {
      setFormData({
        firstName: player.firstName || '',
        lastName: player.lastName || '',
        nickname: player.nickname || '',
        dateOfBirth: player.dateOfBirth ? player.dateOfBirth.split('T')[0] : '',
        photo: player.photoUrl || '',
        associationId: player.associationId || '',
        preferredPositions: player.preferredPositions || [],
      });
      setSelectedTeams(player.teamIds || []);
      setPhotoPreview(player.photoUrl || '');
      setFormInitialized(true);
    }
  }, [player, formInitialized]);

  const isLoading = playerLoading || clubLoading || teamsLoading;
  const isFormDisabled = !isNewPlayer && player?.isArchived;
  const teams = allTeams || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4 animate-pulse">
          {/* Page Title Skeleton */}
          <div className="mb-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
          </div>

          <div className="space-y-2">
            {/* Personal Information Skeleton */}
            <div className="card">
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
              
              {/* Photo Upload Skeleton */}
              <div className="mt-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Preferred Positions Skeleton */}
            <div className="card">
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Team Assignments Skeleton */}
            <div className="card">
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
              
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border-l-4 border-gray-200 dark:border-gray-700 pl-4">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-800"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="flex justify-end gap-3 pt-4">
               <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
               <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Player not found
  if (!isNewPlayer && !player && !playerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Player not found</h2>
            {playerError && (
              <p className="text-sm text-red-600 dark:text-red-400">{playerError.message}</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData(prev => ({ ...prev, photo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePositionToggle = (position: PlayerPosition) => {
    setFormData(prev => ({
      ...prev,
      preferredPositions: prev.preferredPositions.includes(position)
        ? prev.preferredPositions.filter(p => p !== position)
        : [...prev.preferredPositions, position]
    }));
  };

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isNewPlayer) {
      // Create flow not yet implemented
      return;
    }

    const request: UpdatePlayerRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      nickname: formData.nickname || undefined,
      associationId: formData.associationId || undefined,
      dateOfBirth: formData.dateOfBirth,
      preferredPositions: formData.preferredPositions,
      teamIds: selectedTeams.length > 0 ? selectedTeams : undefined,
      isArchived: player?.isArchived ?? false,
    };

    await updatePlayer(request);

    // submitError will be set by the hook if the call failed;
    // only navigate on success (submitError remains null)
    if (!submitError) {
      navigate(Routes.clubPlayers(clubId!));
    }
  };

  const handleCancel = () => {
    navigate(Routes.clubPlayers(clubId!));
  };

  const handleArchive = () => {
    if (!player) return;
    const action = player.isArchived ? 'unarchived' : 'archived';
    alert(`Player ${action} successfully! (Demo - not saved to backend)`);
    navigate(Routes.clubPlayers(clubId!));
  };

  const positions: PlayerPosition[] = [
    'GK', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title={isNewPlayer ? "Add New Player" : "Player Settings"}
          subtitle={isNewPlayer ? `Add a new player to ${club?.name}` : `Manage ${player!.firstName} ${player!.lastName}'s profile`}
          badge={!isNewPlayer && player!.isArchived ? "🗄️ Archived" : undefined}
        />
        
        {!isNewPlayer && player!.isArchived && (
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This player is archived. You cannot modify their settings while they are archived. Unarchive them to make changes.
            </p>
          </div>
        )}

        {/* API error banner */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {submitError.message}
            </p>
            {submitError.validationErrors && (
              <ul className="mt-2 list-disc list-inside text-sm text-red-700 dark:text-red-400">
                {Object.entries(submitError.validationErrors).map(([field, errors]) =>
                  errors.map((msg, i) => (
                    <li key={`${field}-${i}`}>{field}: {msg}</li>
                  ))
                )}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Personal Information */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={!!isFormDisabled}
                  placeholder="Enter first name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={!!isFormDisabled}
                  placeholder="Enter last name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nickname
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  disabled={!!isFormDisabled}
                  placeholder="Enter nickname"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  disabled={!!isFormDisabled}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Association ID
                </label>
                <input
                  type="text"
                  name="associationId"
                  value={formData.associationId}
                  onChange={handleInputChange}
                  disabled={!!isFormDisabled}
                  placeholder="e.g., SFA-Y-40123"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  FA, UEFA, or other football association registration ID
                </p>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                  />
                )}
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="photo-upload"
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                      isFormDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose Photo
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={!!isFormDisabled}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferred Positions */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Preferred Positions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {positions.map((position) => (
                <button
                  key={position}
                  type="button"
                  onClick={() => handlePositionToggle(position)}
                  disabled={!!isFormDisabled}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    formData.preferredPositions.includes(position)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {position}
                </button>
              ))}
            </div>
          </div>

          {/* Team Assignments */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Team Assignments
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select which teams this player is assigned to
            </p>
            <div className="space-y-2">
              {/* Group teams by age group */}
              {Array.from(new Set(teams.map(t => t.ageGroupId)))
                .sort((a, b) => {
                  const ageGroupA = teams.find(t => t.ageGroupId === a);
                  const ageGroupB = teams.find(t => t.ageGroupId === b);
                  return (ageGroupA?.ageGroupName || '').localeCompare(ageGroupB?.ageGroupName || '');
                })
                .map(ageGroupId => {
                const ageGroupTeams = teams
                  .filter(t => t.ageGroupId === ageGroupId)
                  .sort((a, b) => a.name.localeCompare(b.name));
                const ageGroupName = ageGroupTeams[0]?.ageGroupName || 'Unknown Age Group';
                
                return (
                  <div key={ageGroupId} className="border-l-4 border-primary-500 pl-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {ageGroupName}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {ageGroupTeams.map((team) => (
                        <label
                          key={team.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border border-gray-200 dark:border-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTeams.includes(team.id)}
                            onChange={() => handleTeamToggle(team.id)}
                            disabled={!!isFormDisabled}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{team.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{team.level}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {teams.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No teams available. Create teams first to assign players.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <FormActions
            isArchived={!isNewPlayer && player?.isArchived}
            onArchive={!isNewPlayer ? () => setShowArchiveConfirm(true) : undefined}
            onCancel={handleCancel}
            saveLabel={isSubmitting ? 'Saving...' : (isNewPlayer ? 'Create Player' : 'Save Changes')}
            saveDisabled={!!isFormDisabled || isSubmitting}
            showArchive={!isNewPlayer}
          />
        </form>

        {/* Archive Confirmation Modal */}
        {!isNewPlayer && showArchiveConfirm && player && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {player.isArchived ? 'Unarchive Player?' : 'Archive Player?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {player.isArchived ? (
                  <>
                    Are you sure you want to unarchive <strong>{player.firstName} {player.lastName}</strong>? 
                    This will make their profile active again and allow modifications.
                  </>
                ) : (
                  <>
                    Are you sure you want to archive <strong>{player.firstName} {player.lastName}</strong>? 
                    This will lock their profile and prevent modifications. All their data will be preserved and you can unarchive them later.
                  </>
                )}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowArchiveConfirm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowArchiveConfirm(false);
                    handleArchive();
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    player.isArchived
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  Yes, {player.isArchived ? 'Unarchive' : 'Archive'} Player
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

