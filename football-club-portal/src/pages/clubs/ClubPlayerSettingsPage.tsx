import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlayerById } from '@/data/players';
import { getTeamsByClubId } from '@/data/teams';
import { getClubById } from '@/data/clubs';
import { getAgeGroupById } from '@/data/ageGroups';
import PageTitle from '@/components/common/PageTitle';
import { Routes } from '@/utils/routes';
import { PlayerPosition } from '@/types';

export default function ClubPlayerSettingsPage() {
  const { clubId, playerId } = useParams();
  const navigate = useNavigate();
  const isNewPlayer = playerId === 'new';
  const player = isNewPlayer ? null : getPlayerById(playerId!);
  const club = getClubById(clubId!);
  const allTeams = getTeamsByClubId(clubId!);

  const [formData, setFormData] = useState({
    firstName: player?.firstName || '',
    lastName: player?.lastName || '',
    nickname: player?.nickname || '',
    dateOfBirth: player?.dateOfBirth ? player.dateOfBirth.toISOString().split('T')[0] : '',
    photo: player?.photo || '',
    associationId: player?.associationId || '',
    preferredPositions: player?.preferredPositions || [],
  });

  const [selectedAgeGroups, setselectedAgeGroups] = useState<string[]>(player?.ageGroupIds || []);
  const [photoPreview, setPhotoPreview] = useState<string>(player?.photo || '');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const isFormDisabled = !isNewPlayer && player?.isArchived;

  if (!isNewPlayer && !player) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Player not found</h2>
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
    setselectedAgeGroups(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving player:', { ...formData, ageGroupIds: selectedAgeGroups });
    alert(`Player ${isNewPlayer ? 'created' : 'updated'} successfully! (Demo - not saved to backend)`);
    navigate(Routes.clubPlayers(clubId!));
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
      <main className="container mx-auto px-4 py-8">
        <PageTitle
          title={isNewPlayer ? "Add New Player" : "Player Settings"}
          subtitle={isNewPlayer ? `Add a new player to ${club?.name}` : `Manage ${player!.firstName} ${player!.lastName}'s profile`}
          badge={!isNewPlayer && player!.isArchived ? "🗄️ Archived" : undefined}
        />
        
        {!isNewPlayer && player!.isArchived && (
          <div className="mb-6 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This player is archived. You cannot modify their settings while they are archived. Unarchive them to make changes.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
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
                    disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
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
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allTeams.map((team) => {
                const ageGroup = getAgeGroupById(team.ageGroupId);
                return (
                  <label
                    key={team.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAgeGroups.includes(team.id)}
                      onChange={() => handleTeamToggle(team.id)}
                      disabled={isFormDisabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{team.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{ageGroup?.name || 'Unknown'}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            {allTeams.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No teams available. Create teams first to assign players.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="submit"
                disabled={isFormDisabled}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isNewPlayer ? 'Create Player' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Archive Zone - Only show for existing players */}
        {!isNewPlayer && (
          <div className="card border-2 border-orange-200 dark:border-orange-900 mt-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <h3 className="text-xl font-semibold text-orange-600 dark:text-orange-400 mb-4">
                  {player!.isArchived ? 'Unarchive Player' : 'Archive Player'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {player!.isArchived 
                    ? 'Make this player active and allow modifications to their profile'
                    : 'Lock this player profile and prevent modifications while keeping all data'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(true)}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  player!.isArchived
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {player!.isArchived ? 'Unarchive Player' : 'Archive Player'}
              </button>
            </div>
          </div>
        )}

        {/* Archive Confirmation Modal */}
        {!isNewPlayer && showArchiveConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {player!.isArchived ? 'Unarchive Player?' : 'Archive Player?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {player!.isArchived ? (
                  <>
                    Are you sure you want to unarchive <strong>{player!.firstName} {player!.lastName}</strong>? 
                    This will make their profile active again and allow modifications.
                  </>
                ) : (
                  <>
                    Are you sure you want to archive <strong>{player!.firstName} {player!.lastName}</strong>? 
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
                    player!.isArchived
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  Yes, {player!.isArchived ? 'Unarchive' : 'Archive'} Player
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

