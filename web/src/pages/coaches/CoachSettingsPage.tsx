import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCoach, useClubTeams, useUpdateCoach, UpdateCoachRequest, ClubTeamDto } from '@/api';
import { coachRoles } from '@data/referenceData';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import FormActions from '@components/common/FormActions';

// Skeleton for the page title area
function PageTitleSkeleton() {
  return (
    <div className="mb-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-72" />
    </div>
  );
}

// Skeleton for a settings card with input-like rectangles
function SettingsCardSkeleton({ inputs = 4, columns = 2 }: { inputs?: number; columns?: number }) {
  return (
    <div className="card animate-pulse">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
      <div className={`grid md:grid-cols-${columns} gap-4`}>
        {[...Array(inputs)].map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for the team assignments card
function TeamAssignmentsSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4" />
      <div className="space-y-4">
        {[1, 2].map(g => (
          <div key={g}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Group teams by age group name for the assignment checkboxes
function groupTeamsByAgeGroup(teams: ClubTeamDto[]): { ageGroupName: string; teams: ClubTeamDto[] }[] {
  const grouped = teams.reduce<Record<string, ClubTeamDto[]>>((acc, team) => {
    const key = team.ageGroupName || 'Unknown Age Group';
    if (!acc[key]) acc[key] = [];
    acc[key].push(team);
    return acc;
  }, {});

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ageGroupName, groupTeams]) => ({
      ageGroupName,
      teams: groupTeams.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

export default function CoachSettingsPage() {
  const { clubId, coachId, ageGroupId, teamId } = useParams();
  const navigate = useNavigate();
  const isNewCoach = coachId === 'new';

  // API hooks
  const { data: coach, isLoading: isLoadingCoach, error: coachError } = useCoach(
    isNewCoach ? undefined : coachId
  );
  const { data: allTeams, isLoading: isLoadingTeams } = useClubTeams(clubId);
  const { updateCoach, isSubmitting, error: submitError } = useUpdateCoach(coachId || '');

  const isLoading = isLoadingCoach || isLoadingTeams;

  // Form state
  const [formInitialized, setFormInitialized] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [associationId, setAssociationId] = useState('');
  const [role, setRole] = useState('assistant-coach');
  const [biography, setBiography] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [photo, setPhoto] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Initialize form state from API data (only once)
  useEffect(() => {
    if (coach && !formInitialized) {
      setFirstName(coach.firstName || '');
      setLastName(coach.lastName || '');
      setEmail(coach.email || '');
      setPhone(coach.phone || '');
      setDateOfBirth(
        coach.dateOfBirth ? new Date(coach.dateOfBirth).toISOString().split('T')[0] : ''
      );
      setAssociationId(coach.associationId || '');
      setRole(coach.role || 'assistant-coach');
      setBiography(coach.biography || '');
      setSpecializations(coach.specializations?.join(', ') || '');
      setSelectedTeams(coach.teams?.map(t => t.teamId) || []);
      setPhoto(coach.photo || '');
      setPhotoPreview(coach.photo || '');
      setFormInitialized(true);
    }
  }, [coach, formInitialized]);

  // Determine context-aware back navigation (same pattern as CoachProfilePage)
  const getBackRoute = (): string => {
    if (teamId && ageGroupId) {
      return Routes.teamCoaches(clubId!, ageGroupId, teamId);
    }
    if (ageGroupId) {
      return Routes.ageGroupCoaches(clubId!, ageGroupId);
    }
    return Routes.clubCoaches(clubId!);
  };

  // Error state
  if (!isNewCoach && coachError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coach not found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {coachError.message || 'The coach you are looking for could not be loaded.'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Not found after loading completes
  if (!isNewCoach && !isLoadingCoach && !coach) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coach not found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The coach you are looking for does not exist or you do not have access.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const handleSave = async () => {
    const request: UpdateCoachRequest = {
      firstName,
      lastName,
      phone: phone || undefined,
      dateOfBirth: dateOfBirth || undefined,
      associationId: associationId || undefined,
      role,
      biography: biography || undefined,
      specializations: specializations.split(',').map(s => s.trim()).filter(Boolean),
      teamIds: selectedTeams,
      photo: photo || undefined,
    };

    await updateCoach(request);

    // Navigate back on success (submitError will be null)
    if (!submitError) {
      navigate(getBackRoute());
    }
  };

  const handleCancel = () => {
    navigate(getBackRoute());
  };

  const handleArchive = () => {
    if (!coach) return;
    const action = coach.isArchived ? 'unarchived' : 'archived';
    alert(`Coach ${action} successfully! (Demo - not saved to backend)`);
    navigate(getBackRoute());
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
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
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
    if (coach) {
      alert(`Invite sent to ${coach.email}! (Demo - not actually sent)`);
    }
  };

  const roleOptions = coachRoles;
  const teamGroups = groupTeamsByAgeGroup(allTeams || []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        {isLoading ? (
          <PageTitleSkeleton />
        ) : (
          <PageTitle
            title="Coach Settings"
            subtitle={coach ? `Manage details for ${coach.firstName} ${coach.lastName}` : 'Coach Settings'}
          />
        )}

        {/* Submit error banner */}
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

        {isLoading ? (
          <div className="space-y-2">
            <SettingsCardSkeleton inputs={3} columns={2} />
            <SettingsCardSkeleton inputs={2} columns={2} />
            <SettingsCardSkeleton inputs={3} columns={2} />
            <SettingsCardSkeleton inputs={1} columns={1} />
            <TeamAssignmentsSkeleton />
            <div className="flex justify-end gap-3 pt-4 animate-pulse">
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-2">
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
                    {coach && (
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
                    readOnly
                    disabled
                    placeholder="coach@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed once the coach is created
                  </p>
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
                    onChange={(e) => setRole(e.target.value)}
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
              {teamGroups.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No teams available. Create teams first to assign coaches.
                </p>
              ) : (
                <div className="space-y-2">
                  {teamGroups.map(group => (
                    <div key={group.ageGroupName}>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        {group.ageGroupName}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.teams.map(team => (
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
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <FormActions
              isArchived={coach?.isArchived}
              onArchive={coach ? () => setShowArchiveConfirm(true) : undefined}
              onCancel={handleCancel}
              saveLabel={isSubmitting ? 'Saving...' : 'Save Changes'}
              saveDisabled={isSubmitting}
              showArchive={!isNewCoach}
            />
          </form>
        )}

        {/* Archive Confirmation Modal */}
        {coach && showArchiveConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {coach.isArchived ? 'Unarchive Coach?' : 'Archive Coach?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {coach.isArchived ? (
                  <>
                    Are you sure you want to unarchive <strong>{coach.firstName} {coach.lastName}</strong>? 
                    This will make their profile active again and allow modifications.
                  </>
                ) : (
                  <>
                    Are you sure you want to archive <strong>{coach.firstName} {coach.lastName}</strong>? 
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
                    coach.isArchived
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  Yes, {coach.isArchived ? 'Unarchive' : 'Archive'} Coach
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
