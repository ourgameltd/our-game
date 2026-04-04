import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateClub } from '@/api/hooks';
import { useAuth } from '@/contexts/AuthContext';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
import { Routes } from '@utils/routes';
import { usePageTitle } from '@/hooks/usePageTitle';

const CreateClubPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { createClub, isSubmitting } = useCreateClub();

  usePageTitle(['Create Club']);

  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    logo: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#ffffff',
    accentColor: '#000000',
    city: '',
    country: '',
    venue: '',
    address: '',
    founded: '',
    history: '',
    ethos: '',
    principles: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200 font-medium">Access Denied</p>
          <p className="text-red-600 dark:text-red-300 text-sm mt-1">You must be an admin to create a club.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Club name is required';
    if (!formData.shortName.trim()) newErrors.shortName = 'Short name is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
    if (!formData.primaryColor.trim()) newErrors.primaryColor = 'Primary color is required';
    if (!formData.secondaryColor.trim()) newErrors.secondaryColor = 'Secondary color is required';
    if (formData.founded && (isNaN(Number(formData.founded)) || Number(formData.founded) < 1850 || Number(formData.founded) > new Date().getFullYear())) {
      newErrors.founded = `Founded year must be between 1850 and ${new Date().getFullYear()}`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitError(null);

    const principles = formData.principles.trim()
      ? formData.principles.split('\n').map(p => p.trim()).filter(Boolean)
      : undefined;

    const success = await createClub({
      name: formData.name.trim(),
      shortName: formData.shortName.trim(),
      logo: formData.logo.trim() || undefined,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      accentColor: formData.accentColor || undefined,
      city: formData.city.trim(),
      country: formData.country.trim(),
      venue: formData.venue.trim(),
      address: formData.address.trim() || undefined,
      founded: formData.founded ? Number(formData.founded) : undefined,
      history: formData.history.trim() || undefined,
      ethos: formData.ethos.trim() || undefined,
      principles,
    });

    if (success) {
      navigate(Routes.clubs());
    } else {
      setSubmitError('Failed to create club. Please check the form and try again.');
    }
  };

  const handleCancel = () => {
    navigate(Routes.clubs());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageTitle title="Create Club" />

      {submitError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 font-medium">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Club Name *
              </label>
              <input
                type="text" id="name" name="name"
                value={formData.name} onChange={handleChange} disabled={isSubmitting}
                placeholder="e.g. Vale FC"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="shortName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Short Name *
              </label>
              <input
                type="text" id="shortName" name="shortName"
                value={formData.shortName} onChange={handleChange} disabled={isSubmitting}
                placeholder="e.g. VFC"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.shortName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.shortName && <p className="mt-1 text-sm text-red-500">{errors.shortName}</p>}
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo URL
            </label>
            <input
              type="text" id="logo" name="logo"
              value={formData.logo} onChange={handleChange} disabled={isSubmitting}
              placeholder="https://example.com/logo.png"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="founded" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Founded Year
            </label>
            <input
              type="number" id="founded" name="founded"
              value={formData.founded} onChange={handleChange} disabled={isSubmitting}
              placeholder="e.g. 1876"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                errors.founded ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {errors.founded && <p className="mt-1 text-sm text-red-500">{errors.founded}</p>}
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Club Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color" id="primaryColor" name="primaryColor"
                  value={formData.primaryColor} onChange={handleChange} disabled={isSubmitting}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text" name="primaryColor"
                  value={formData.primaryColor} onChange={handleChange} disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                    errors.primaryColor ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              {errors.primaryColor && <p className="mt-1 text-sm text-red-500">{errors.primaryColor}</p>}
            </div>
            <div>
              <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secondary Color *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color" id="secondaryColor" name="secondaryColor"
                  value={formData.secondaryColor} onChange={handleChange} disabled={isSubmitting}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text" name="secondaryColor"
                  value={formData.secondaryColor} onChange={handleChange} disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                    errors.secondaryColor ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              {errors.secondaryColor && <p className="mt-1 text-sm text-red-500">{errors.secondaryColor}</p>}
            </div>
            <div>
              <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color" id="accentColor" name="accentColor"
                  value={formData.accentColor} onChange={handleChange} disabled={isSubmitting}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text" name="accentColor"
                  value={formData.accentColor} onChange={handleChange} disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
          {/* Color Preview */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Preview:</span>
            <div className="flex gap-1">
              <div className="w-8 h-8 rounded" style={{ backgroundColor: formData.primaryColor }} />
              <div className="w-8 h-8 rounded border border-gray-200 dark:border-gray-600" style={{ backgroundColor: formData.secondaryColor }} />
              <div className="w-8 h-8 rounded" style={{ backgroundColor: formData.accentColor }} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text" id="city" name="city"
                value={formData.city} onChange={handleChange} disabled={isSubmitting}
                placeholder="e.g. Stoke-on-Trent"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country *
              </label>
              <input
                type="text" id="country" name="country"
                value={formData.country} onChange={handleChange} disabled={isSubmitting}
                placeholder="e.g. England"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.country ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
            </div>
            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Venue *
              </label>
              <input
                type="text" id="venue" name="venue"
                value={formData.venue} onChange={handleChange} disabled={isSubmitting}
                placeholder="e.g. Vale Park"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.venue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.venue && <p className="mt-1 text-sm text-red-500">{errors.venue}</p>}
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <input
                type="text" id="address" name="address"
                value={formData.address} onChange={handleChange} disabled={isSubmitting}
                placeholder="e.g. Hamil Road, Burslem, ST6 1AW"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* History & Ethos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">History & Ethos</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="history" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                History
              </label>
              <textarea
                id="history" name="history" rows={4}
                value={formData.history} onChange={handleChange} disabled={isSubmitting}
                placeholder="A brief history of the club..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label htmlFor="ethos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ethos
              </label>
              <textarea
                id="ethos" name="ethos" rows={3}
                value={formData.ethos} onChange={handleChange} disabled={isSubmitting}
                placeholder="The club's ethos and values..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label htmlFor="principles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Principles
              </label>
              <textarea
                id="principles" name="principles" rows={4}
                value={formData.principles} onChange={handleChange} disabled={isSubmitting}
                placeholder="One principle per line..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter one principle per line</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <FormActions
          onCancel={handleCancel}
          saveLabel="Create Club"
          saveDisabled={isSubmitting}
        />
      </form>
    </div>
  );
};

export default CreateClubPage;
