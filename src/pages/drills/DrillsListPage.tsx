import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { sampleDrills } from '@/data/training';
import { sampleClubs } from '@/data/clubs';
import { sampleAgeGroups } from '@/data/ageGroups';
import { sampleTeams } from '@/data/teams';
import { getAttributeLabel, getAttributeCategory, drillCategories, getDrillCategoryColors } from '@/data/referenceData';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';

export default function DrillsListPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  const club = sampleClubs.find(c => c.id === clubId);
  const ageGroup = ageGroupId ? sampleAgeGroups.find(ag => ag.id === ageGroupId) : undefined;
  const team = teamId ? sampleTeams.find(t => t.id === teamId) : undefined;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

  // Get all unique attributes from drills
  const availableAttributes = useMemo(() => {
    const attributeSet = new Set<string>();
    sampleDrills.forEach(drill => {
      drill.attributes.forEach(attr => attributeSet.add(attr));
    });
    return Array.from(attributeSet).sort((a, b) => 
      getAttributeLabel(a).localeCompare(getAttributeLabel(b))
    );
  }, []);

  if (!club) {
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

  // Determine context level
  const contextName = team ? team.name : ageGroup ? ageGroup.name : club.name;

  // Toggle attribute selection
  const toggleAttribute = (attr: string) => {
    setSelectedAttributes(prev => 
      prev.includes(attr) 
        ? prev.filter(a => a !== attr)
        : [...prev, attr]
    );
  };

  // Filter drills (all drills are inherited from club level)
  const filteredDrills = sampleDrills.filter(drill => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!drill.name.toLowerCase().includes(searchLower) && 
          !drill.description.toLowerCase().includes(searchLower) &&
          !drill.attributes.some(attr => getAttributeLabel(attr).toLowerCase().includes(searchLower))) {
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
    if (team) return Routes.teamDrill(clubId!, ageGroupId!, teamId!, drillId);
    if (ageGroup) return Routes.ageGroupDrill(clubId!, ageGroupId!, drillId);
    return Routes.drill(clubId!, drillId);
  };

  const getNewDrillRoute = () => {
    if (team) return Routes.teamDrillNew(clubId!, ageGroupId!, teamId!);
    if (ageGroup) return Routes.ageGroupDrillNew(clubId!, ageGroupId!);
    return Routes.drillNew(clubId!);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-8">
          <PageTitle
            title="Drills"
            subtitle={`${contextName} - Manage training drills`}
            action={{
              label: 'Create Drill',
              icon: 'plus',
              title: 'Create New Drill',
              onClick: () => window.location.href = getNewDrillRoute(),
              variant: 'success'
            }}
          />
        </div>

        {/* Filters */}
        <div className="card mb-6">
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

        {/* Drills List */}
        {filteredDrills.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {filteredDrills.map((drill) => (
              <Link
                key={drill.id}
                to={getDrillRoute(drill.id)}
                className="block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 md:border-0 md:border-b md:last:border-b-0"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  {/* Name and Category */}
                  <div className="flex items-center justify-between md:w-64 md:flex-shrink-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex-1 truncate">
                      {drill.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${getCategoryColor(drill.category)}`}>
                      {drill.category}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1 md:flex-1 md:min-w-0">
                    {drill.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 md:flex-shrink-0">
                    <span>⏱️ {drill.duration}m</span>
                    <span>🎯 {drill.attributes.length}</span>
                    {drill.links && drill.links.length > 0 && (
                      <span>🔗 {drill.links.length}</span>
                    )}
                  </div>
                </div>
              </Link>
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
