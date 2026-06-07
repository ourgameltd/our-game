import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Filter, X, Dumbbell } from 'lucide-react';
import { useDrillsByScope, useClubById } from '@/api/hooks';
import { DrillListDto } from '@/api/client';
import DrillCard, { DrillCardSkeleton } from '@/components/training/DrillCard';
import MultiSelectTypeahead from '@components/common/MultiSelectTypeahead';
import { drillCategories, drillCompetencies, normalizeDrillCategory } from '@/constants/referenceData';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import EmptyState from '@components/common/EmptyState';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function DrillsListPage() {
  usePageTitle(['Drills List']);

  const { clubId, ageGroupId, teamId } = useParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

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

  const inheritedDrillIds = useMemo(() => {
    if (!drillsData) return new Set<string>();
    return new Set(drillsData.inheritedDrills.map((drill) => drill.id));
  }, [drillsData]);


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

  const competencyOptions = drillCompetencies.map((c) => ({ value: c.id, label: c.name }));

  // Filter drills based on search term and selected competencies
  const filteredDrills = allDrills.filter((drill: DrillListDto) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const drillDescription = (drill.description ?? '').toLowerCase();
      if (!drill.name.toLowerCase().includes(searchLower) &&
          !drillDescription.includes(searchLower)) {
        return false;
      }
    }
    if (selectedCategory !== 'all') {
      if (normalizeDrillCategory(drill.category) !== selectedCategory) {
        return false;
      }
    }
    if (selectedCompetencies.length > 0) {
      if (!selectedCompetencies.some(id => drill.competencies.some(c => c.id === id))) {
        return false;
      }
    }
    return true;
  });

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
            subtitle={`Manage training drills for your ${teamId ? 'team' : ageGroupId ? 'age group' : 'club'}`}
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 mb-4">
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Filters</span>
              {(searchTerm || selectedCategory !== 'all' || selectedCompetencies.length > 0) && (
                <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                  {[searchTerm ? 1 : 0, selectedCategory !== 'all' ? 1 : 0, selectedCompetencies.length > 0 ? 1 : 0].reduce((a, b) => a + b, 0)} active
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="label">
                    <Search className="w-4 h-4 inline mr-1" />
                    Search Drills
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, description, or attributes..."
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Categories</option>
                    {drillCategories
                      .filter((drillCategory) => drillCategory.value !== 'Mixed')
                      .map((drillCategory) => (
                        <option key={drillCategory.value} value={drillCategory.value}>
                          {drillCategory.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="label">
                    Filter by Competency
                  </label>
                  <MultiSelectTypeahead
                    options={competencyOptions}
                    value={selectedCompetencies}
                    onChange={setSelectedCompetencies}
                    placeholder="Type to find and add competencies..."
                    showSelectedChips={false}
                  />
                </div>
              </div>

              {selectedCompetencies.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
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
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedCompetencies([]);
                    }}
                    className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drills Grid */}
        {drillsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(6)].map((_, i) => <DrillCardSkeleton key={i} />)}
          </div>
        ) : filteredDrills.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {filteredDrills.map((drill: DrillListDto) => (
              <DrillCard
                key={drill.id}
                drill={drill}
                href={getDrillRoute(drill.id)}
                editHref={getDrillEditRoute(drill.id)}
                isInherited={inheritedDrillIds.has(drill.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Dumbbell}
            title="No drills found"
            description={
              searchTerm || selectedCompetencies.length > 0 || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first drill to get started'
            }
          />
        )}
      </main>
    </div>
  );
}
