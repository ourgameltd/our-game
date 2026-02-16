import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer, useUpdatePlayer, UpdatePlayerRequest } from '@/api';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
import { Routes } from '@/utils/routes';
import { PlayerPosition } from '@/types';
import { Plus } from 'lucide-react';

// Skeleton for the page title area
function PageTitleSkeleton() {
  return (
    <div className="mb-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-72" />
    </div>
  );
}

// Skeleton for a settings card
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

// Skeleton for positions section
function PositionsSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4" />
      <div className="space-y-2">
        {[1, 2, 3].map(g => (
          <div key={g}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-3" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for emergency contacts
function EmergencyContactsSkeleton() {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40" />
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <div className="space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="grid md:grid-cols-3 gap-3">
              {[1, 2, 3].map(j => (
                <div key={j}>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function PlayerSettingsPage() {
  const { clubId, ageGroupId, playerId } = useParams();
  const navigate = useNavigate();
  const isNewPlayer = playerId === 'new';

  // API hooks
  const { data: player, isLoading: isLoadingPlayer, error: playerError } = usePlayer(
    isNewPlayer ? undefined : playerId
  );
  const { updatePlayer, isSubmitting, error: submitError } = useUpdatePlayer(playerId || '');

  const isLoading = isLoadingPlayer;

  // Form state
  const [formInitialized, setFormInitialized] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [associationId, setAssociationId] = useState('');
  const [preferredPositions, setPreferredPositions] = useState<PlayerPosition[]>([]);
  const [allergies, setAllergies] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');

  const [emergencyContacts, setEmergencyContacts] = useState<{
    id?: string;
    name: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
  }[]>([]);

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Initialize form state from API data (only once)
  useEffect(() => {
    if (player && !formInitialized) {
      setFirstName(player.firstName || '');
      setLastName(player.lastName || '');
      setNickname(player.nickname || '');
      setDateOfBirth(player.dateOfBirth ? player.dateOfBirth.split('T')[0] : '');
      setPhoto(player.photoUrl || '');
      setPhotoPreview(player.photoUrl || '');
      setAssociationId(player.associationId || '');
      setPreferredPositions(player.preferredPositions as PlayerPosition[] || []);
      setAllergies(player.allergies || '');
      setMedicalConditions(player.medicalConditions || '');
      setEmergencyContacts(player.emergencyContacts || []);
      setFormInitialized(true);
    }
  }, [player, formInitialized]);

  // Helper to determine if fields should be disabled (only for archived existing players)
  const isFormDisabled = !isNewPlayer && player?.isArchived;

  // Error state - not found
  if (!isNewPlayer && playerError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Player not found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {playerError.message || 'The player you are looking for could not be loaded.'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Not found after loading completes
  if (!isNewPlayer && !isLoadingPlayer && !player) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Player not found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The player you are looking for does not exist or you do not have access.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'firstName') setFirstName(value);
    else if (name === 'lastName') setLastName(value);
    else if (name === 'nickname') setNickname(value);
    else if (name === 'dateOfBirth') setDateOfBirth(value);
    else if (name === 'associationId') setAssociationId(value);
    else if (name === 'allergies') setAllergies(value);
    else if (name === 'conditions') setMedicalConditions(value);
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

  const handlePositionToggle = (position: PlayerPosition) => {
    setPreferredPositions(prev =>
      prev.includes(position)
        ? prev.filter(p => p !== position)
        : [...prev, position]
    );
  };

  const handleAddEmergencyContact = () => {
    const newContact = {
      id: `ec-${Date.now()}`,
      name: '',
      phone: '',
      relationship: '',
      isPrimary: emergencyContacts.length === 0, // First contact is primary by default
    };
    setEmergencyContacts(prev => [...prev, newContact]);
  };

  const handleRemoveEmergencyContact = (contactId: string) => {
    setEmergencyContacts(prev => {
      const filtered = prev.filter(c => (c.id || `ec-${Date.now()}`) !== contactId);
      // If we removed the primary contact and there are others, make the first one primary
      if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleEmergencyContactChange = (contactId: string, field: 'name' | 'phone' | 'relationship', value: string) => {
    setEmergencyContacts(prev =>
      prev.map(contact =>
        (contact.id || `ec-${Date.now()}`) === contactId
          ? { ...contact, [field]: value }
          : contact
      )
    );
  };

  const handleSetPrimaryContact = (contactId: string) => {
    setEmergencyContacts(prev =>
      prev.map(contact => ({
        ...contact,
        isPrimary: (contact.id || `ec-${Date.now()}`) === contactId
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      return; // Browser validation should catch this
    }

    if (!dateOfBirth) {
      return; // Browser validation should catch this
    }

    if (preferredPositions.length === 0) {
      alert('Please select at least one preferred position');
      return;
    }

    // Validate emergency contacts
    for (const contact of emergencyContacts) {
      if (!contact.name.trim() || !contact.phone.trim() || !contact.relationship.trim()) {
        alert('Please fill in all emergency contact fields or remove incomplete contacts');
        return;
      }
    }

    // Ensure exactly one primary contact if contacts exist
    const primaryCount = emergencyContacts.filter(c => c.isPrimary).length;
    if (emergencyContacts.length > 0 && primaryCount !== 1) {
      alert('Please select exactly one primary emergency contact');
      return;
    }

    const request: UpdatePlayerRequest = {
      firstName,
      lastName,
      nickname: nickname || undefined,
      associationId: associationId || undefined,
      dateOfBirth,
      photo: photo || undefined,
      allergies: allergies || undefined,
      medicalConditions: medicalConditions || undefined,
      preferredPositions,
      emergencyContacts: emergencyContacts.map(({ id, ...rest }) => rest),
      isArchived: player?.isArchived || false,
    };

    await updatePlayer(request);

    // Navigate back on success (submitError will be null)
    if (!submitError) {
      navigate(Routes.player(clubId!, ageGroupId!, playerId!));
    }
  };

  const handleCancel = () => {
    navigate(Routes.player(clubId!, ageGroupId!, playerId!));
  };

  const handleArchive = async () => {
    if (!player) return;
    
    const request: UpdatePlayerRequest = {
      firstName,
      lastName,
      nickname: nickname || undefined,
      associationId: associationId || undefined,
      dateOfBirth,
      photo: photo || undefined,
      allergies: allergies || undefined,
      medicalConditions: medicalConditions || undefined,
      preferredPositions,
      emergencyContacts: emergencyContacts.map(({ id, ...rest }) => rest),
      isArchived: !player.isArchived,
    };

    await updatePlayer(request);

    // Navigate back on success
    if (!submitError) {
      navigate(Routes.player(clubId!, ageGroupId!, playerId!));
    }
  };

  // Calculate age
  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        {isLoading ? (
          <PageTitleSkeleton />
        ) : (
          <>
            <PageTitle
              title={isNewPlayer ? "Add New Player" : "Player Settings"}
              subtitle={isNewPlayer ? "Create a new player profile" : `Manage ${player!.firstName} ${player!.lastName}'s profile and information`}
              badge={!isNewPlayer && player!.isArchived ? "🗄️ Archived" : undefined}
            />
            {!isNewPlayer && player!.isArchived && (
              <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  ⚠️ This player is archived. You cannot modify their settings while they are archived. Unarchive them to make changes.
                </p>
              </div>
            )}
          </>
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
            <SettingsCardSkeleton inputs={7} columns={2} />
            <PositionsSkeleton />
            <div className="card animate-pulse">
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-4" />
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <EmergencyContactsSkeleton />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 animate-pulse">
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        ) : (
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
                  value={firstName}
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
                  value={lastName}
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
                  value={nickname}
                  onChange={handleInputChange}
                  disabled={isFormDisabled}
                  placeholder="e.g., Speedy, The Wall, Magic"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Optional nickname or moniker for the player
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={dateOfBirth}
                  onChange={handleInputChange}
                  required
                  disabled={isFormDisabled}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {dateOfBirth && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Age: {calculateAge(new Date(dateOfBirth))} years
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Association ID
                </label>
                <input
                  type="text"
                  name="associationId"
                  value={associationId}
                  onChange={handleInputChange}
                  disabled={isFormDisabled}
                  placeholder="e.g., SFA-Y-40123"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  FA, UEFA, or other football association registration ID
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Player Photo
                </label>
                <div className="flex items-start gap-4">
                  {/* Photo Preview */}
                  <div className="flex-shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Player preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-300 dark:border-gray-600">
                        {firstName[0]}{lastName[0]}
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
                      disabled={isFormDisabled}
                      className="hidden"
                    />
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
                      {photoPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhoto('');
                            setPhotoPreview('');
                          }}
                          disabled={isFormDisabled}
                          className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

          {/* Position Preferences */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Position Preferences
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select the positions this player can play (select at least one)
            </p>
            
            <div className="space-y-2">
              {/* Goalkeepers */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Goalkeeper</h4>
                <div className="flex flex-wrap gap-2">
                  {['GK'].map(position => (
                    <button
                      key={position}
                      type="button"
                      onClick={() => handlePositionToggle(position as PlayerPosition)}
                      disabled={isFormDisabled}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        preferredPositions.includes(position as PlayerPosition)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {position}
                    </button>
                  ))}
                </div>
              </div>

              {/* Defenders */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Defenders</h4>
                <div className="flex flex-wrap gap-2">
                  {['LB', 'CB', 'RB', 'LWB', 'RWB'].map(position => (
                    <button
                      key={position}
                      type="button"
                      onClick={() => handlePositionToggle(position as PlayerPosition)}
                      disabled={isFormDisabled}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        preferredPositions.includes(position as PlayerPosition)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {position}
                    </button>
                  ))}
                </div>
              </div>

              {/* Midfielders */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Midfielders</h4>
                <div className="flex flex-wrap gap-2">
                  {['CDM', 'CM', 'CAM', 'LM', 'RM'].map(position => (
                    <button
                      key={position}
                      type="button"
                      onClick={() => handlePositionToggle(position as PlayerPosition)}
                      disabled={isFormDisabled}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        preferredPositions.includes(position as PlayerPosition)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {position}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forwards */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Forwards</h4>
                <div className="flex flex-wrap gap-2">
                  {['LW', 'RW', 'CF', 'ST'].map(position => (
                    <button
                      key={position}
                      type="button"
                      onClick={() => handlePositionToggle(position as PlayerPosition)}
                      disabled={isFormDisabled}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        preferredPositions.includes(position as PlayerPosition)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {position}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Medical Information
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This information is kept confidential and only accessible to authorized staff
            </p>
            
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Allergies
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={allergies}
                  onChange={handleInputChange}
                  disabled={isFormDisabled}
                  placeholder="e.g., Peanuts, Penicillin (comma-separated)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Medical Conditions
                </label>
                <input
                  type="text"
                  name="conditions"
                  value={medicalConditions}
                  onChange={handleInputChange}
                  disabled={isFormDisabled}
                  placeholder="e.g., Asthma, Diabetes (comma-separated)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Emergency Contacts
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddEmergencyContact}
                    disabled={isFormDisabled}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title="Add Contact"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {emergencyContacts.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                    No emergency contacts added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {emergencyContacts.map((contact, index) => (
                      <div key={contact.id || `contact-${index}`} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Contact {index + 1}
                            </span>
                            {contact.isPrimary && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!contact.isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryContact(contact.id || `contact-${index}`)}
                                disabled={isFormDisabled}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Set as Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveEmergencyContact(contact.id || `contact-${index}`)}
                              disabled={isFormDisabled}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remove contact"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Name *
                            </label>
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => handleEmergencyContactChange(contact.id || `contact-${index}`, 'name', e.target.value)}
                              disabled={isFormDisabled}
                              placeholder="Enter name"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              value={contact.phone}
                              onChange={(e) => handleEmergencyContactChange(contact.id || `contact-${index}`, 'phone', e.target.value)}
                              disabled={isFormDisabled}
                              placeholder="+44 7XXX XXXXXX"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Relationship *
                            </label>
                            <input
                              type="text"
                              value={contact.relationship}
                              onChange={(e) => handleEmergencyContactChange(contact.id || `contact-${index}`, 'relationship', e.target.value)}
                              disabled={isFormDisabled}
                              placeholder="e.g., Parent, Guardian"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <FormActions
            isArchived={!isNewPlayer && player?.isArchived}
            onArchive={!isNewPlayer ? () => setShowArchiveConfirm(true) : undefined}
            onCancel={handleCancel}
            saveLabel={isSubmitting ? 'Saving...' : 'Save Changes'}
            saveDisabled={isFormDisabled || isSubmitting}
            showArchive={!isNewPlayer}
          />
        </form>
        )}

        {/* Archive Confirmation Modal */}
        {!isNewPlayer && showArchiveConfirm && player && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {player!.isArchived ? 'Unarchive Player?' : 'Archive Player?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
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
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowArchiveConfirm(false)}
                  className="px-4 py-2 text-sm sm:text-base bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowArchiveConfirm(false);
                    handleArchive();
                  }}
                  className={`px-4 py-2 text-sm sm:text-base rounded-lg transition-colors ${
                    player!.isArchived
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  Yes, {player!.isArchived ? 'Unarchive' : 'Archive'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


