import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getCoachById } from '@data/coaches';
import { getClubById } from '@data/clubs';
import { getTeamsByClubId } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';

export default function CoachSettingsPage() {
  const { clubId, coachId } = useParams();
  const navigate = useNavigate();
  const isNewCoach = coachId === 'new';
  const coach = isNewCoach ? null : getCoachById(coachId!);
  const club = getClubById(clubId!);
  const allTeams = getTeamsByClubId(clubId!);

  const [firstName, setFirstName] = useState(coach?.firstName || '');
  const [lastName, setLastName] = useState(coach?.lastName || '');
  const [email, setEmail] = useState(coach?.email || '');
  const [phone, setPhone] = useState(coach?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    coach?.dateOfBirth ? new Date(coach.dateOfBirth).toISOString().split('T')[0] : ''
  );
  const [associationId, setAssociationId] = useState(coach?.associationId || '');
  const [role, setRole] = useState(coach?.role || 'assistant-coach');
  const [biography, setBiography] = useState(coach?.biography || '');
  const [specializations, setSpecializations] = useState(
    coach?.specializations?.join(', ') || ''
  );
  const [selectedTeams, setSelectedTeams] = useState<string[]>(coach?.teamIds || []);
  const [photo, setPhoto] = useState(coach?.photo || '');
  const [photoPreview, setPhotoPreview] = useState<string>(coach?.photo || '');

  if (!club) {
    return <div>Club not found</div>;
  }

  if (!isNewCoach && !coach) {
    return <div>Coach not found</div>;
  }

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving coach:', {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      associationId,
      role,
      biography,
      specializations: specializations.split(',').map(s => s.trim()).filter(Boolean),
      teamIds: selectedTeams,
      photo,
    });
    
    // Navigate back to club coaches page
    navigate(Routes.clubCoaches(clubId!));
  };

  const handleCancel = () => {
    navigate(Routes.clubCoaches(clubId!));
  };

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendInvite = () => {
    // In a real app, this would send an invite email via the backend
    alert(`Invite sent to ${coach?.email}! (Demo - not actually sent)`);
  };

  const roleOptions = [
    { value: 'head-coach', label: 'Head Coach' },
    { value: 'assistant-coach', label: 'Assistant Coach' },
    { value: 'goalkeeper-coach', label: 'Goalkeeper Coach' },
    { value: 'fitness-coach', label: 'Fitness Coach' },
    { value: 'technical-coach', label: 'Technical Coach' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle
          title={isNewCoach ? 'Add New Coach' : 'Coach Settings'}
          subtitle={isNewCoach ? `Add a new coach to ${club?.name}` : `Manage details for ${coach!.firstName} ${coach!.lastName}`}
        />

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Enter first name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Enter last name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Coach Photo
                </label>
                <div className="flex items-start gap-4">
                  {/* Photo Preview */}
                  <div className="flex-shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Coach preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-300 dark:border-gray-600">
                        {firstName[0] || '?'}{lastName[0] || '?'}
                      </div>
                    )}
                  </div>
                  
                  {/* File Upload */}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="photo-upload"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Choose Photo
                      </label>
                      {photoPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview('');
                            setPhoto('');
                          }}
                          className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Upload a photo (JPG, PNG, GIF - Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email *
                  </label>
                  {!isNewCoach && coach && (
                    coach.hasAccount ? (
                      <span className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Account Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendInvite}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Invite
                      </button>
                    )
                  )}
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly={!isNewCoach}
                  disabled={!isNewCoach}
                  placeholder="coach@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {!isNewCoach && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed once the coach is created
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+44 123 456 7890"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Coaching Details */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Coaching Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  FA Registration ID
                </label>
                <input
                  type="text"
                  value={associationId}
                  onChange={(e) => setAssociationId(e.target.value)}
                  placeholder="e.g., SFA-12345"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Specializations
              </label>
              <input
                type="text"
                value={specializations}
                onChange={(e) => setSpecializations(e.target.value)}
                placeholder="Youth Development, Tactical Training, etc."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separate multiple specializations with commas
              </p>
            </div>
          </div>

          {/* Biography */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Biography
            </h3>
            <textarea
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              rows={4}
              placeholder="Brief biography about the coach..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Team Assignments */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Team Assignments
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select which teams this coach is assigned to
            </p>
            {allTeams.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No teams available. Create teams first to assign coaches.
              </p>
            ) : (
              <div className="space-y-6">
                {/* Group teams by age group and sort */}
                {(() => {
                  const teamsByAgeGroup = allTeams.reduce((acc, team) => {
                    if (!acc[team.ageGroupId]) {
                      acc[team.ageGroupId] = [];
                    }
                    acc[team.ageGroupId].push(team);
                    return acc;
                  }, {} as Record<string, typeof allTeams>);

                  // Sort age groups alphabetically and teams within each group
                  const sortedAgeGroupIds = Object.keys(teamsByAgeGroup).sort((a, b) => {
                    const ageGroupA = getAgeGroupById(a);
                    const ageGroupB = getAgeGroupById(b);
                    return (ageGroupA?.name || '').localeCompare(ageGroupB?.name || '');
                  });

                  return sortedAgeGroupIds.map(ageGroupId => {
                    const ageGroup = getAgeGroupById(ageGroupId);
                    const teams = teamsByAgeGroup[ageGroupId].sort((a, b) => 
                      a.name.localeCompare(b.name)
                    );

                    return (
                      <div key={ageGroupId}>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          {ageGroup?.name || 'Unknown Age Group'}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {teams.map(team => (
                            <label
                              key={team.id}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border border-gray-200 dark:border-gray-700"
                            >
                              <input
                                type="checkbox"
                                checked={selectedTeams.includes(team.id)}
                                onChange={() => handleTeamToggle(team.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                  {team.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {team.season}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {isNewCoach ? 'Create Coach' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Danger Zone - Only show for existing coaches */}
        {!isNewCoach && (
          <div className="card border-2 border-red-200 dark:border-red-900 mt-6">
            <h3 className="text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              These actions are permanent and cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button className="px-4 py-2 text-sm sm:text-base bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap">
                Archive Coach
              </button>
              <button className="px-4 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap">
                Delete Coach
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
