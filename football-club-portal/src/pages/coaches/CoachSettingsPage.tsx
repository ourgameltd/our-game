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
    
    // Navigate back to coach profile
    navigate(Routes.coach(clubId!, coachId!));
  };

  const handleCancel = () => {
    navigate(Routes.coach(clubId!, coachId!));
  };

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
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
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(Routes.coach(clubId!, coachId!))}
          className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Coach Profile
        </button>

        <PageTitle
          title={isNewCoach ? 'Add New Coach' : 'Coach Settings'}
          subtitle={isNewCoach ? `Add a new coach to ${club?.name}` : `Manage details for ${coach!.firstName} ${coach!.lastName}`}
        />

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Photo URL
                    </label>
                    <input
                      type="text"
                      value={photo}
                      onChange={(e) => setPhoto(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Coaching Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Coaching Details</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                      required
                    >
                      {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      FA Registration ID
                    </label>
                    <input
                      type="text"
                      value={associationId}
                      onChange={(e) => setAssociationId(e.target.value)}
                      placeholder="e.g., SFA-12345"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Specializations
                  </label>
                  <input
                    type="text"
                    value={specializations}
                    onChange={(e) => setSpecializations(e.target.value)}
                    placeholder="Youth Development, Tactical Training, etc. (comma separated)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Separate multiple specializations with commas
                  </p>
                </div>
              </div>

              {/* Biography */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Biography</h2>
                <textarea
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  rows={4}
                  placeholder="Brief biography about the coach..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>

              {/* Team Assignments */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Assignments</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Select which teams this coach is assigned to
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allTeams.map(team => {
                    const ageGroup = getAgeGroupById(team.ageGroupId);
                    return (
                      <label
                        key={team.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(team.id)}
                          onChange={() => handleTeamToggle(team.id)}
                          className="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {ageGroup?.name} - {team.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {team.season}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCancel}
                  className="btn-secondary btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary btn-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone - Only show for existing coaches */}
          {!isNewCoach && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6 border border-red-200 dark:border-red-800">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                These actions are permanent and cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="btn-md px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors">
                  Archive Coach
                </button>
                <button className="btn-md px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
                  Delete Coach
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
