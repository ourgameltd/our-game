import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClubById, useUpdateClub, UpdateClubRequest } from '@/api';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
import { Routes } from '@/utils/routes';

/**
 * Skeleton for the page title area
 */
function PageTitleSkeleton() {
  return (
    <div className="mb-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-72" />
    </div>
  );
}

/**
 * Skeleton for a settings card with input-like rectangles
 */
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

/**
 * Skeleton for the history & ethos card with textarea-like rectangles
 */
function HistoryCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
      <div className="space-y-4">
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
          <div className="h-36 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ClubSettingsPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();

  // API hooks
  const { data: club, isLoading, error } = useClubById(clubId);
  const { updateClub, isSubmitting, error: submitError } = useUpdateClub(clubId || '');

  const [formInitialized, setFormInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    founded: '',
    city: '',
    country: '',
    venue: '',
    address: '',
    primaryColor: '#1a472a',
    secondaryColor: '#ffd700',
    accentColor: '#ffffff',
    history: '',
    ethos: '',
    principles: '',
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoDataUri, setLogoDataUri] = useState<string>('');

  // Initialize form state from API data (only once)
  useEffect(() => {
    if (club && !formInitialized) {
      setFormData({
        name: club.name || '',
        shortName: club.shortName || '',
        founded: club.founded ? String(club.founded) : '',
        city: club.location?.city || '',
        country: club.location?.country || '',
        venue: club.location?.venue || '',
        address: club.location?.address || '',
        primaryColor: club.colors?.primary || '#1a472a',
        secondaryColor: club.colors?.secondary || '#ffd700',
        accentColor: club.colors?.accent || '#ffffff',
        history: club.history || '',
        ethos: club.ethos || '',
        principles: club.principles?.join('\n') || '',
      });
      setLogoPreview(club.logo || '');
      setLogoDataUri(club.logo || '');
      setFormInitialized(true);
    }
  }, [club, formInitialized]);

  // Club not found after loading
  if (!isLoading && error && !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Club not found</h2>
            <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setLogoDataUri(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const request: UpdateClubRequest = {
      name: formData.name,
      shortName: formData.shortName,
      logo: logoDataUri,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      accentColor: formData.accentColor,
      city: formData.city,
      country: formData.country,
      venue: formData.venue,
      address: formData.address,
      founded: formData.founded,
      history: formData.history,
      ethos: formData.ethos,
      principles: formData.principles
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0),
    };

    await updateClub(request);

    // Only navigate on success (submitError remains null)
    if (!submitError) {
      navigate(Routes.clubOverview(clubId!));
    }
  };

  const handleCancel = () => {
    navigate(Routes.clubOverview(clubId!));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        {isLoading ? (
          <PageTitleSkeleton />
        ) : (
          <PageTitle
            title="Club Settings"
            subtitle="Manage club information and branding"
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
            <SettingsCardSkeleton inputs={4} columns={2} />
            <SettingsCardSkeleton inputs={4} columns={2} />
            <SettingsCardSkeleton inputs={3} columns={3} />
            <HistoryCardSkeleton />
            <div className="flex justify-end gap-3 pt-4 animate-pulse">
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Basic Information */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Club Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Short Name *
                  </label>
                  <input
                    type="text"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Founded Year *
                  </label>
                  <input
                    type="number"
                    name="founded"
                    value={formData.founded}
                    onChange={handleInputChange}
                    required
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  {logoPreview && (
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="mt-2 h-20 w-20 object-contain rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Location
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Home Venue *
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Club Colors */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Club Colors
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
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
                      className="h-10 w-20 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                      className="h-10 w-20 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      name="accentColor"
                      value={formData.accentColor}
                      onChange={handleInputChange}
                      className="h-10 w-20 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* History & Ethos */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                History & Ethos
              </h3>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Club History
                  </label>
                  <textarea
                    name="history"
                    value={formData.history}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Tell the story of your club..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Club Ethos
                  </label>
                  <textarea
                    name="ethos"
                    value={formData.ethos}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="What does your club stand for?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Core Principles
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">(One per line)</span>
                  </label>
                  <textarea
                    name="principles"
                    value={formData.principles}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Inclusivity - Football for everyone&#10;Community - Building strong connections&#10;Development - Nurturing talent"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <FormActions
              onCancel={handleCancel}
              showArchive={false}
              saveLabel={isSubmitting ? 'Saving...' : 'Save Changes'}
              saveDisabled={isSubmitting || isLoading || !clubId}
            />
          </form>
        )}
      </main>
    </div>
  );
}
