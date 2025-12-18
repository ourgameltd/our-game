import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Save, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import UpcomingMatchesCard from '@components/matches/UpcomingMatchesCard';
import PageTitle from '@components/common/PageTitle';
import { getUpcomingMatches } from '@data/matches';
import { getTeamById } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import { Routes } from '@utils/routes';

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  
  // Mock user data - in real app this would come from API
  const [userData, setUserData] = useState({
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+44 7700 900000',
    location: 'Manchester, UK',
    dateJoined: '2024-01-15',
    role: 'Coach',
    clubAffiliations: ['Vale FC', 'Manchester Youth'],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userData);
  
  // Get upcoming matches for demo - in real app would filter by user's teams
  const upcomingMatches = getUpcomingMatches(undefined, 3);

  const handleSave = () => {
    setUserData(formData);
    setIsEditing(false);
    // In real app, save to backend here
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTitle
          title="My Profile"
          subtitle="Manage your account settings and preferences"
        />

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 mb-6 transition-colors">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{userData.name}</h2>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mt-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">{userData.role}</span>
                </div>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <span className="text-gray-900 dark:text-white">{userData.email}</span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <span className="text-gray-900 dark:text-white">{userData.phone}</span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <span className="text-gray-900 dark:text-white">{userData.location}</span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-900 dark:text-white">
                Joined {new Date(userData.dateJoined).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 mb-6 transition-colors">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Choose how the portal looks to you. Select a single theme, or sync with your system preferences.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light Theme */}
            <button
              onClick={() => setTheme('light')}
              className={`p-4 border-2 rounded-lg transition-all ${
                theme === 'light'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  theme === 'light' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <Sun className="w-6 h-6" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Light</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Day mode</span>
              </div>
            </button>

            {/* Dark Theme */}
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 border-2 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <Moon className="w-6 h-6" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Dark</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Night mode</span>
              </div>
            </button>

            {/* System Theme */}
            <button
              onClick={() => setTheme('system')}
              className={`p-4 border-2 rounded-lg transition-all ${
                theme === 'system'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  theme === 'system' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <Monitor className="w-6 h-6" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">System</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Auto adjust</span>
              </div>
            </button>
          </div>
        </div>

        {/* Club Affiliations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 transition-colors mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Club Affiliations</h3>
          <div className="space-y-2">
            {userData.clubAffiliations.map((club, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-gray-900 dark:text-white font-medium">{club}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{userData.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 transition-colors">
          <UpcomingMatchesCard 
            matches={upcomingMatches}
            showTeamInfo={true}
            getTeamInfo={(match) => {
              const team = getTeamById(match.teamId);
              if (team) {
                const ageGroup = getAgeGroupById(team.ageGroupId);
                return {
                  teamName: team.name,
                  ageGroupName: ageGroup?.name || 'Unknown'
                };
              }
              return null;
            }}
            getMatchLink={(matchId) => {
              const match = upcomingMatches.find(m => m.id === matchId);
              if (match) {
                const team = getTeamById(match.teamId);
                if (team) {
                  // In a real app, we would have the full clubId from user's teams
                  return Routes.matchReport(team.clubId, team.ageGroupId, match.teamId, matchId);
                }
              }
              return '#';
            }}
          />
        </div>
      </div>
    </div>
  );
}
