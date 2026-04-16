import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Filter, AlertCircle, Users, Clock3, ListOrdered, Globe2, ClipboardList } from 'lucide-react';
import { useDrillTemplatesByScope, useClubById } from '@/api/hooks';
import type { DrillTemplateListDto } from '@/api';
import { getAttributeLabel, getAttributeCategory, drillCategories, getDrillCategoryColors, getDrillCategoryLabel } from '@/constants/referenceData';
import { normalizeSessionCategory, getSessionCategoryColors } from '@/constants/sessionCategories';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import EmptyState from '@components/common/EmptyState';
import { usePageTitle } from '@/hooks/usePageTitle';

// Skeleton component for template row loading state
function TemplateRowSkeleton() {
  return (
    <div className="block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b md:last:border-b-0 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        {/* Name and Category skeleton */}
        <div className="flex items-center justify-between md:w-64 md:shrink-0">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full ml-2" />
        </div>
        {/* Description skeleton */}
        <div className="md:flex-1 md:min-w-0">
          <div className="h-4 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {/* Stats skeleton */}
        <div className="flex items-center gap-3 md:shrink-0">
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {/* Attributes skeleton - desktop only */}
        <div className="hidden md:flex flex-wrap gap-1 md:shrink-0 md:w-48">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for the templates list section
function TemplatesListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <TemplateRowSkeleton key={index} />
      ))}
    </div>
  );
}

// Skeleton for filter attributes
function AttributeFiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 animate-pulse">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
      ))}
    </div>
  );
}

export default function DrillTemplatesListPage() {
  usePageTitle(['Drill Templates List']);

  const { clubId, ageGroupId, teamId } = useParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch club info for context name
  const { data: club, isLoading: isLoadingClub } = useClubById(clubId);

  // Fetch drill templates from API
  const { data: templatesData, isLoading: isLoadingTemplates, error } = useDrillTemplatesByScope(
    clubId,
    ageGroupId,
    teamId,
    {
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      search: debouncedSearch || undefined,
      attributes: selectedAttributes.length > 0 ? selectedAttributes : undefined
    }
  );

  // Get all unique attributes from API response for filtering
  const availableAttributes = useMemo(() => {
    return templatesData?.availableAttributes || [];
  }, [templatesData?.availableAttributes]);

  const getScopeLabel = () => {
    if (teamId) return 'Team';
    if (ageGroupId) return 'Age Group';
    return 'Club';
  };

  // Toggle attribute selection
  const toggleAttribute = (attr: string) => {
    setSelectedAttributes(prev => 
      prev.includes(attr) 
        ? prev.filter(a => a !== attr)
        : [...prev, attr]
    );
  };

  const getCategoryColor = (category?: string) => {
    const colors = getDrillCategoryColors(category || 'Mixed');
    return `${colors.bgColor} ${colors.textColor}`;
  };

  const getCategoryBadge = (template: DrillTemplateListDto) => {
    if (template.sessionCategory) {
      const normalizedSessionCategory = normalizeSessionCategory(template.sessionCategory);
      const sessionColors = getSessionCategoryColors(normalizedSessionCategory);
      return {
        label: normalizedSessionCategory,
        classes: `${sessionColors.bgColor} ${sessionColors.textColor}`
      };
    }

    if (template.category) {
      return {
        label: getDrillCategoryLabel(template.category),
        classes: getCategoryColor(template.category)
      };
    }

    return null;
  };

  // Generate the correct route based on context
  const getTemplateRoute = (templateId: string) => {
    if (teamId && ageGroupId) return Routes.teamDrillTemplate(clubId!, ageGroupId, teamId, templateId);
    if (ageGroupId) return Routes.ageGroupDrillTemplate(clubId!, ageGroupId, templateId);
    return Routes.drillTemplate(clubId!, templateId);
  };

  const getNewTemplateRoute = () => {
    if (teamId && ageGroupId) return Routes.teamDrillTemplateNew(clubId!, ageGroupId, teamId);
    if (ageGroupId) return Routes.ageGroupDrillTemplateNew(clubId!, ageGroupId);
    return Routes.drillTemplateNew(clubId!);
  };

  const templates = templatesData?.templates || [];
  const inheritedTemplates = templatesData?.inheritedTemplates || [];
  const isLoading = isLoadingClub || isLoadingTemplates;

  // Check if any filters are active
  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || selectedAttributes.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <PageTitle
            title="Sessions"
            subtitle={`Reusable training session plans for your ${getScopeLabel().toLowerCase()}`}
            action={{
              label: 'Create Template',
              icon: 'plus',
              title: 'Create New Session Template',
              onClick: () => navigate(getNewTemplateRoute()),
              variant: 'success'
            }}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 mb-4">
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Filters</span>
              {(searchTerm || categoryFilter !== 'all' || selectedAttributes.length > 0) && (
                <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                  {[searchTerm ? 1 : 0, categoryFilter !== 'all' ? 1 : 0, selectedAttributes.length].reduce((a, b) => a + b, 0)} active
                </span>
              )}
            </div>
            {filtersExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {filtersExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Search className="w-4 h-4 inline mr-1" />
                    Search Templates
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, description, or attributes..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Categories</option>
                    {drillCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attribute Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Attributes {selectedAttributes.length > 0 && `(${selectedAttributes.length} selected)`}
                </label>
                {isLoading ? (
                  <AttributeFiltersSkeleton />
                ) : availableAttributes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableAttributes.map(attr => {
                      const category = getAttributeCategory(attr);
                      const isSelected = selectedAttributes.includes(attr);
                      const categoryShortLabel = category === 'Skills' ? 'SK' : category === 'Physical' ? 'PH' : 'MN';
                      return (
                        <button
                          key={attr}
                          onClick={() => toggleAttribute(attr)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            isSelected 
                              ? 'bg-primary-600 text-white dark:bg-primary-500'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {getAttributeLabel(attr)}
                          {category && (
                            <span className="ml-1 opacity-60 text-[10px]">
                              {categoryShortLabel}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No attributes available</p>
                )}
                {selectedAttributes.length > 0 && (
                  <button
                    onClick={() => setSelectedAttributes([])}
                    className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" />
            <p className="text-red-700 dark:text-red-300">
              Failed to load session templates: {error.message}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <TemplatesListSkeleton count={4} />
        )}

        {/* Content - Scope Templates */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {/* Current Scope Templates */}
            <div>
              {templates.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
                  {templates.map((template: DrillTemplateListDto) => (
                    <Link
                      key={template.id}
                      to={getTemplateRoute(template.id)}
                      className="block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 md:border-0 md:border-b md:last:border-b-0"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                        {/* Name, Category, Description */}
                        <div className="md:flex-1 md:min-w-0">
                          <div className="flex flex-wrap items-start gap-2">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white wrap-break-word leading-snug">
                              {template.name}
                            </h3>
                            {(() => {
                              const categoryBadge = getCategoryBadge(template);
                              if (!categoryBadge) {
                                return null;
                              }

                              return (
                                <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${categoryBadge.classes}`}>
                                  {categoryBadge.label}
                                </span>
                              );
                            })()}
                          </div>

                          <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm line-clamp-2 md:line-clamp-1">
                            {template.description || 'No description provided.'}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 md:shrink-0">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="w-4 h-4" />
                            {template.totalDuration}m
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ListOrdered className="w-4 h-4" />
                            {template.drillIds.length}
                          </span>
                          {template.isPublic && <Globe2 className="w-4 h-4" title="Shared session" aria-label="Shared session" />}
                        </div>

                        {/* Attributes - desktop only */}
                        <div className="hidden md:flex flex-wrap gap-1 md:shrink-0 md:w-48">
                          {template.attributes.slice(0, 2).map((attr, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded truncate">
                              {getAttributeLabel(attr)}
                            </span>
                          ))}
                          {template.attributes.length > 2 && (
                            <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                              +{template.attributes.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Attributes - mobile only */}
                        <div className="flex md:hidden flex-wrap gap-1">
                          {template.attributes.slice(0, 3).map((attr, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded">
                              {getAttributeLabel(attr)}
                            </span>
                          ))}
                          {template.attributes.length > 3 && (
                            <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                              +{template.attributes.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={ClipboardList}
                  title="No sessions found"
                  description={
                    hasActiveFilters
                      ? 'Try adjusting your filters'
                      : 'Create your first session template to get started'
                  }
                />
              )}
            </div>

            {/* Inherited Templates */}
            {inheritedTemplates.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Inherited Sessions ({inheritedTemplates.length})
                </h2>
                <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
                  {inheritedTemplates.map((template: DrillTemplateListDto) => {
                    const scopeLabel = template.scopeType === 'club' ? 'Club' : 'Age Group';
                    
                    return (
                      <div
                        key={template.id}
                        className="block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b md:last:border-b-0 opacity-75"
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                          {/* Name and Category with scope badge */}
                          <div className="md:flex-1 md:min-w-0">
                            <div className="flex flex-wrap items-start gap-2">
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white wrap-break-word leading-snug">
                                {template.name}
                              </h3>
                              <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                {scopeLabel}
                              </span>
                              {(() => {
                                const categoryBadge = getCategoryBadge(template);
                                if (!categoryBadge) {
                                  return null;
                                }

                                return (
                                  <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${categoryBadge.classes}`}>
                                    {categoryBadge.label}
                                  </span>
                                );
                              })()}
                            </div>

                            <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm line-clamp-2 md:line-clamp-1">
                              {template.description || 'No description provided.'}
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 md:shrink-0">
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="w-4 h-4" />
                              {template.totalDuration}m
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <ListOrdered className="w-4 h-4" />
                              {template.drillIds.length}
                            </span>
                            {template.isPublic && <Globe2 className="w-4 h-4" title="Shared session" aria-label="Shared session" />}
                          </div>

                          {/* Attributes - desktop only */}
                          <div className="hidden md:flex flex-wrap gap-1 md:shrink-0 md:w-48">
                            {template.attributes.slice(0, 2).map((attr, i) => (
                              <span key={i} className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded truncate">
                                {getAttributeLabel(attr)}
                              </span>
                            ))}
                            {template.attributes.length > 2 && (
                              <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                +{template.attributes.length - 2}
                              </span>
                            )}
                          </div>

                          {/* Attributes - mobile only */}
                          <div className="flex md:hidden flex-wrap gap-1">
                            {template.attributes.slice(0, 3).map((attr, i) => (
                              <span key={i} className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded">
                                {getAttributeLabel(attr)}
                              </span>
                            ))}
                            {template.attributes.length > 3 && (
                              <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                +{template.attributes.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
