import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Filter, AlertCircle, Clock3, ListOrdered, Globe2, ClipboardList } from 'lucide-react';
import { useDrillTemplatesByScope, useClubById } from '@/api/hooks';
import type { DrillTemplateListDto } from '@/api';
import { drillCompetencies, getDrillCategoryColors, getDrillCategoryLabel } from '@/constants/referenceData';
import { normalizeSessionCategory, getSessionCategoryColors, sessionCategories } from '@/constants/sessionCategories';
import MultiSelectTypeahead from '@components/common/MultiSelectTypeahead';
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

export default function DrillTemplatesListPage() {
  usePageTitle(['Drill Templates List']);

  const { clubId, ageGroupId, teamId } = useParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
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
  const { isLoading: isLoadingClub } = useClubById(clubId);

  // Fetch drill templates from API
  const { data: templatesData, isLoading: isLoadingTemplates, error } = useDrillTemplatesByScope(
    clubId,
    ageGroupId,
    teamId,
    {
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      search: debouncedSearch || undefined,
      competencyIds: selectedCompetencies.length > 0 ? selectedCompetencies : undefined
    }
  );

  const competencyOptions = drillCompetencies.map((c) => ({ value: c.id, label: c.name }));

  const getScopeLabel = () => {
    if (teamId) return 'Team';
    if (ageGroupId) return 'Age Group';
    return 'Club';
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

  const isLoading = isLoadingClub || isLoadingTemplates;

  const allTemplates = useMemo(() => [
    ...(templatesData?.templates || []).map(t => ({ ...t, isInherited: false })),
    ...(templatesData?.inheritedTemplates || []).map(t => ({ ...t, isInherited: true })),
  ], [templatesData]);

  // Check if any filters are active
  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || selectedCompetencies.length > 0;

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
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search sessions by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 py-0.5 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Clear search"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            )}
            {hasActiveFilters && (
              <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                {[searchTerm ? 1 : 0, categoryFilter !== 'all' ? 1 : 0, selectedCompetencies.length > 0 ? 1 : 0].reduce((a, b) => a + b, 0)} active
              </span>
            )}
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="More filters"
            >
              {filtersExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {filtersExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="label">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Categories</option>
                    {sessionCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Filter by Competency</label>
                  <MultiSelectTypeahead
                    options={competencyOptions}
                    value={selectedCompetencies}
                    onChange={setSelectedCompetencies}
                    placeholder="Type to find and add competencies..."
                    showSelectedChips={false}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-2">
                  {selectedCompetencies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedCompetencies.map((id) => {
                        const competency = drillCompetencies.find(c => c.id === id);
                        const label = competency?.name ?? id;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300"
                          >
                            {label}
                            <button
                              type="button"
                              onClick={() => setSelectedCompetencies((prev) => prev.filter((item) => item !== id))}
                              className="hover:text-primary-900 dark:hover:text-primary-100"
                              aria-label={`Remove ${label}`}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('all');
                      setSelectedCompetencies([]);
                    }}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
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

        {/* Combined Templates List */}
        {!isLoading && !error && (
          allTemplates.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
              {allTemplates.map((template) => {
                const scopeLabel = template.scopeType === 'club' ? 'Club' : 'Age Group';
                const categoryBadge = getCategoryBadge(template);
                const rowClasses = template.isInherited
                  ? 'block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 opacity-80 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b md:last:border-b-0'
                  : 'block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 md:border-0 md:border-b md:last:border-b-0';

                const content = (
                  <div className="flex items-stretch gap-3">
                    <div className={`w-1 self-stretch rounded-full shrink-0 ${template.isInherited ? 'bg-gray-300 dark:bg-gray-600' : 'bg-primary-500 dark:bg-primary-400'}`} />

                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="md:flex-1 md:min-w-0">
                        <div className="flex flex-wrap items-start gap-2">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white wrap-break-word leading-snug">
                            {template.name}
                          </h3>
                          {template.isInherited && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                              {scopeLabel}
                            </span>
                          )}
                          {categoryBadge && (
                            <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${categoryBadge.classes}`}>
                              {categoryBadge.label}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm line-clamp-2 md:line-clamp-1">
                          {template.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 md:shrink-0">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="w-4 h-4" />
                          {template.totalDuration}m
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ListOrdered className="w-4 h-4" />
                          {template.drillIds.length}
                        </span>
                        {template.isPublic && (
                          <span title="Shared session" aria-label="Shared session">
                            <Globe2 className="w-4 h-4" />
                          </span>
                        )}
                      </div>

                      <div className="hidden md:flex flex-wrap gap-1 md:shrink-0 md:w-48">
                        {template.competencies.slice(0, 2).map((c, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded truncate">
                            {c.name}
                          </span>
                        ))}
                        {template.competencies.length > 2 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            +{template.competencies.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="flex md:hidden flex-wrap gap-1">
                        {template.competencies.slice(0, 3).map((c, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded">
                            {c.name}
                          </span>
                        ))}
                        {template.competencies.length > 3 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            +{template.competencies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );

                return template.isInherited ? (
                  <div key={template.id} className={rowClasses}>
                    {content}
                  </div>
                ) : (
                  <Link key={template.id} to={getTemplateRoute(template.id)} className={rowClasses}>
                    {content}
                  </Link>
                );
              })}
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
          )
        )}
      </main>
    </div>
  );
}
