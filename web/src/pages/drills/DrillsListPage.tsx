import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Filter, Settings } from 'lucide-react';
import { useDrillsByScope, useClubById } from '@/api/hooks';
import { DrillListDto } from '@/api/client';
import DrillDiagramRenderer from '@/components/training/DrillDiagramRenderer';
import { getAttributeLabel, getAttributeCategory, drillCategories, getDrillCategoryColors } from '@/constants/referenceData';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import { usePageTitle } from '@/hooks/usePageTitle';

// Skeleton component for drills list loading state
function DrillsListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b md:last:border-b-0 animate-pulse"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            {/* Name and Category Skeleton */}
            <div className="flex items-center justify-between md:w-64 md:shrink-0">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full ml-2" />
            </div>
            
            {/* Description Skeleton */}
            <div className="md:flex-1 md:min-w-0">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </div>

            {/* Stats Skeleton */}
            <div className="flex items-center gap-3 md:shrink-0">
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton component for filter attributes loading state
function FilterAttributesSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      ))}
    </div>
  );
}

export default function DrillsListPage() {
  usePageTitle(['Drills List']);

  const { clubId, ageGroupId, teamId } = useParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Fetch club details from API
  const { data: club, isLoading: clubLoading, error: clubError } = useClubById(clubId);

  // Fetch drills from API based on scope
  const { data: drillsData, isLoading: drillsLoading, error: drillsError } = useDrillsByScope(
    clubId,
    ageGroupId,
    teamId
  );

  // Combine all drills (scope + inherited) for display
  const allDrills = useMemo(() => {
    if (!drillsData) return [];
    return [...drillsData.drills, ...drillsData.inheritedDrills];
  }, [drillsData]);

  // Get all unique attributes from drills
  const availableAttributes = useMemo(() => {
    const attributeSet = new Set<string>();
    allDrills.forEach((drill: DrillListDto) => {
      drill.attributes.forEach((attr: string) => attributeSet.add(attr));
    });
    return Array.from(attributeSet).sort((a, b) => 
      getAttributeLabel(a).localeCompare(getAttributeLabel(b))
    );
  }, [allDrills]);

  // Determine context name for display
  const contextName = useMemo(() => {
    if (teamId) return 'Team';
    if (ageGroupId) return 'Age Group';
    return club?.name || 'Club';
  }, [teamId, ageGroupId, club?.name]);

  // Error handling
  if (clubError || drillsError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Error loading drills</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {clubError?.message || drillsError?.message || 'An error occurred while loading drills.'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Club not found (only check after loading completes)
  if (!clubLoading && !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Club not found</h2>
          </div>
        </main>
      </div>
    );
  }

  // Toggle attribute selection
  const toggleAttribute = (attr: string) => {
    setSelectedAttributes(prev => 
      prev.includes(attr) 
        ? prev.filter(a => a !== attr)
        : [...prev, attr]
    );
  };

  // Filter drills based on search term, category, and attributes
  const filteredDrills = allDrills.filter((drill: DrillListDto) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!drill.name.toLowerCase().includes(searchLower) && 
          !drill.description.toLowerCase().includes(searchLower) &&
          !drill.attributes.some((attr: string) => getAttributeLabel(attr).toLowerCase().includes(searchLower))) {
        return false;
      }
    }
    if (categoryFilter !== 'all' && drill.category !== categoryFilter) {
      return false;
    }
    // Filter by selected attributes - drill must have ALL selected attributes
    if (selectedAttributes.length > 0) {
      if (!selectedAttributes.every(attr => drill.attributes.includes(attr))) {
        return false;
      }
    }
    return true;
  });

  const getCategoryColor = (category: string) => {
    const colors = getDrillCategoryColors(category);
    return `${colors.bgColor} ${colors.textColor}`;
  };

  // Generate the correct route based on context
  const getDrillRoute = (drillId: string) => {
    if (teamId) return Routes.teamDrill(clubId!, ageGroupId!, teamId!, drillId);
    if (ageGroupId) return Routes.ageGroupDrill(clubId!, ageGroupId!, drillId);
    return Routes.drill(clubId!, drillId);
  };

  const getDrillEditRoute = (drillId: string) => {
    if (teamId) return Routes.teamDrillEdit(clubId!, ageGroupId!, teamId!, drillId);
    if (ageGroupId) return Routes.ageGroupDrillEdit(clubId!, ageGroupId!, drillId);
    return Routes.drillEdit(clubId!, drillId);
  };

  const getNewDrillRoute = () => {
    if (teamId) return Routes.teamDrillNew(clubId!, ageGroupId!, teamId!);
    if (ageGroupId) return Routes.ageGroupDrillNew(clubId!, ageGroupId!);
    return Routes.drillNew(clubId!);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <PageTitle
            title="Drills"
            subtitle={`${contextName} - Manage training drills`}
            action={{
              label: 'Create Drill',
              icon: 'plus',
              title: 'Create New Drill',
              onClick: () => navigate(getNewDrillRoute()),
              variant: 'success'
            }}
          />
        </div>

        {/* Filters */}
        <div className="card mb-4">
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
                    Search Drills
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
                    {drillCategories.filter(c => c.value !== 'mixed').map(cat => (
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
                {drillsLoading ? (
                  <FilterAttributesSkeleton />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableAttributes.map(attr => {
                      const category = getAttributeCategory(attr);
                      const isSelected = selectedAttributes.includes(attr);
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
                              {category === 'Skills' ? '⚽' : category === 'Physical' ? '💪' : '🧠'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
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

        {/* Drills List */}
        {drillsLoading ? (
          <DrillsListSkeleton />
        ) : filteredDrills.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {filteredDrills.map((drill: DrillListDto) => (
              <div
                key={drill.id}
                className="bg-white dark:bg-gray-800 rounded-lg md:rounded-none px-3 py-2 md:px-3 md:py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 md:border-0 md:border-b md:last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-gray-50 dark:bg-gray-900 shrink-0">
                    {drill.drillDiagramConfig ? (
                      <DrillDiagramRenderer drillDiagramConfig={drill.drillDiagramConfig} forceSquare />
                    ) : null}
                  </div>

                  <Link to={getDrillRoute(drill.id)} className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {drill.name}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">⏱️ {drill.duration}m</span>
                        <span className={`px-2 py-0.5 text-[11px] rounded-full whitespace-nowrap ${getCategoryColor(drill.category)}`}>
                          {drill.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-1 mt-0.5">
                      {drill.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>🎯 {drill.attributes.length}</span>
                      {drill.links && drill.links.length > 0 && (
                        <span>🔗 {drill.links.length}</span>
                      )}
                    </div>
                  </Link>

                  <Link
                    to={getDrillEditRoute(drill.id)}
                    className="p-1.5 bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 rounded-lg transition-colors shrink-0"
                    aria-label={`Edit ${drill.name}`}
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <span className="text-5xl mb-3 block">⚽</span>
            <p className="font-medium text-gray-900 dark:text-white">No drills found</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Create your first drill to get started'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
