import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, Save, Moon, Sun, Monitor, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUser, UserProfile } from '@/api/users';
import { useUpdateCurrentUser, UpdateCurrentUserRequest } from '@/api';
import PageTitle from '@components/common/PageTitle';

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  
  // User data from API
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  
  // Mutation hook for updating profile
  const { updateCurrentUser, data: updatedProfile, isSubmitting, error } = useUpdateCurrentUser();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          setIsLoadingProfile(true);
          const profile = await getCurrentUser();
          setUserProfile(profile);
          setFormData({
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
          });
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchProfile();
  }, [isAuthenticated, isLoading]);

  // Handle successful profile update
  useEffect(() => {
    if (updatedProfile) {
      setUserProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 4 seconds
      const timeout = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [updatedProfile]);

  const handleSave = async () => {
    setSuccessMessage(null);
    
    const request: UpdateCurrentUserRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
    };
    
    await updateCurrentUser(request);
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
      });
    }
    setIsEditing(false);
    setSuccessMessage(null);
  };

  if (isLoadingProfile || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">Failed to load profile</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTitle
          title="My Profile"
          subtitle="Manage your account settings and preferences"
        />

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300">{successMessage}</p>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {error.message}
            </p>
            {error.validationErrors && (
              <ul className="mt-2 list-disc list-inside text-sm text-red-700 dark:text-red-400">
                {Object.entries(error.validationErrors).map(([field, errors]) =>
                  errors.map((msg, i) => (
                    <li key={`${field}-${i}`}>{field}: {msg}</li>
                  ))
                )}
              </ul>
            )}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 mb-4 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden">
                {userProfile.photo ? (
                  <img 
                    src={userProfile.photo} 
                    alt={`${userProfile.firstName} ${userProfile.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Last Name"
                      />
                    </div>
                  ) : (
                    `${userProfile.firstName} ${userProfile.lastName}`
                  )}
                </h2>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mt-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">{userProfile.role}</span>
                </div>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                title="Edit Profile"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <span className="text-gray-900 dark:text-white">{userProfile.email}</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-900 dark:text-white">
                Joined {new Date(userProfile.createdAt).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex space-x-2 mt-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 mb-4 transition-colors">
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
      </div>
    </div>
  );
}
