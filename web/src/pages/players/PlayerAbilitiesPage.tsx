import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { usePlayerAbilities, usePlayer } from '@api/hooks';
import { groupAttributes } from '@utils/attributeHelpers';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessProfile } from '@/hooks/useAccessProfile';
import { canViewPlayerAbilities } from '@/utils/accessControl';
import { Routes } from '@utils/routes';
import PlayerSubNav from '@components/player/PlayerSubNav';
import PageTitle from '@components/common/PageTitle';
import AccessDeniedPage from '@components/common/AccessDeniedPage';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, RadarChart, Radar, Legend
} from 'recharts';

export default function PlayerAbilitiesPage() {
  const { clubId, playerId, ageGroupId, teamId } = useParams();
  const { data: player, isLoading: playerLoading } = usePlayer(playerId);

  usePageTitle(
    [
      player?.clubName ?? 'Club',
      ageGroupId ? (player?.ageGroupName ?? 'Age Group') : undefined,
      teamId ? (player?.teamName ?? 'Team') : undefined,
      player ? `${player.firstName} ${player.lastName}` : 'Player',
      'Abilities',
    ],
    !!player,
  );
  const { isAdmin } = useAuth();
  const { profile } = useAccessProfile(isAdmin);
  const { data: abilities, isLoading: loading, error, refetch } = usePlayerAbilities(playerId);
  const { actualTheme } = useTheme();
  const { setEntityName } = useNavigation();
  const isDark = actualTheme === 'dark';
  
  // Update navigation context with entity names
  useEffect(() => {
    if (player) {
      setEntityName('player', player.id, `${player.firstName} ${player.lastName}`);
      if (player.clubId && player.clubName) {
        setEntityName('club', player.clubId, player.clubName);
      }
      if (player.teamId && player.teamName) {
        setEntityName('team', player.teamId, player.teamName);
      }
      if (player.ageGroupId && player.ageGroupName) {
        setEntityName('ageGroup', player.ageGroupId, player.ageGroupName);
      }
    }
  }, [player?.id, player?.firstName, player?.lastName, player?.clubId, player?.clubName, player?.teamId, player?.teamName, player?.ageGroupId, player?.ageGroupName, setEntityName]);

  // Determine back link based on context (team, age group, or club)
  let backLink: string;
  let subtitle: string;
  if (teamId && ageGroupId) {
    backLink = Routes.teamSquad(clubId!, ageGroupId, teamId);
    subtitle = player ? `${player.ageGroupName || 'Age Group'} • ${player.teamName || 'Team'}` : 'Loading...';
  } else if (ageGroupId) {
    backLink = Routes.ageGroupPlayers(clubId!, ageGroupId);
    subtitle = player?.ageGroupName || 'Age Group';
  } else {
    backLink = Routes.clubPlayers(clubId!);
    subtitle = 'Club Players';
  }

  // Determine settings link based on context
  let settingsLink: string;
  if (teamId && ageGroupId) {
    settingsLink = Routes.teamPlayerSettings(clubId!, ageGroupId, teamId, playerId!);
  } else if (ageGroupId) {
    settingsLink = Routes.playerSettings(clubId!, ageGroupId, playerId!);
  } else {
    settingsLink = Routes.clubPlayerSettings(clubId!, playerId!);
  }

  // Theme-aware chart colors
  const chartColors = {
    grid: isDark ? '#4B5563' : '#D1D5DB',
    axis: isDark ? '#9CA3AF' : '#4B5563',
    tooltipBg: isDark ? '#1F2937' : '#FFFFFF',
    tooltipBorder: isDark ? '#374151' : '#E5E7EB',
    tooltipText: isDark ? '#FFFFFF' : '#1F2937',
    labelText: isDark ? '#FFFFFF' : '#1F2937',
    // Category colors - slightly adjusted for better contrast
    blue: { stroke: '#3B82F6', fill: '#3B82F6' },
    green: { stroke: '#22C55E', fill: '#22C55E' },
    purple: { stroke: '#A855F7', fill: '#A855F7' },
    primary: { stroke: '#2563EB', fill: '#2563EB' },
    emerald: { stroke: '#10B981', fill: '#10B981' },
  };
  
  if (!playerId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Player ID is required</h2>
          </div>
        </main>
      </div>
    );
  }

  if (!canViewPlayerAbilities(profile)) {
    return (
      <AccessDeniedPage description="Player abilities are not visible for linked parent accounts." />
    );
  }

  // Group attributes by category
  const groupedAttributes = abilities ? groupAttributes(abilities.attributes) : { skills: [], physical: [], mental: [] };
  
  const allAbilities = abilities ? [
    ...groupedAttributes.skills,
    ...groupedAttributes.physical,
    ...groupedAttributes.mental
  ] : [];

  const topAbilities = [...allAbilities]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const bestSkill = topAbilities[0];
  const lowestAbilities = [...allAbilities]
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 1);
  const focusArea = lowestAbilities[0];

  // Calculate historical data from evaluations (excluding archived)
  const activeEvaluations = abilities?.evaluations?.filter(e => !e.isArchived) ?? [];
  const getHistoricalData = () => {
    if (!abilities) return [];

    if (activeEvaluations.length === 0) {
      return [{ date: 'Current', rating: abilities.overallRating }];
    }

    return activeEvaluations
      .slice()
      .reverse() // Reverse to get chronological order
      .slice(-6) // Last 6 evaluations
      .map(e => ({
        date: new Date(e.evaluatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rating: e.overallRating
      }));
  };

  const abilitiesData = getHistoricalData();

  // Prepare data for Polar Area chart - category averages
  const getCategoryAverages = () => {
    const skillsAvg = Math.round(
      groupedAttributes.skills.reduce((sum, attr) => sum + attr.rating, 0) / groupedAttributes.skills.length
    );
    const physicalAvg = Math.round(
      groupedAttributes.physical.reduce((sum, attr) => sum + attr.rating, 0) / groupedAttributes.physical.length
    );
    const mentalAvg = Math.round(
      groupedAttributes.mental.reduce((sum, attr) => sum + attr.rating, 0) / groupedAttributes.mental.length
    );

    return [
      { category: 'Skills', rating: skillsAvg, fullMark: 99 },
      { category: 'Physical', rating: physicalAvg, fullMark: 99 },
      { category: 'Mental', rating: mentalAvg, fullMark: 99 },
    ];
  };

  // Prepare data for detailed abilities radar - top attributes from each category
  const getDetailedAbilitiesData = () => {
    // Get top 3 from each category for a balanced radar
    const topSkills = [...groupedAttributes.skills].sort((a, b) => b.rating - a.rating).slice(0, 3);
    const topPhysical = [...groupedAttributes.physical].sort((a, b) => b.rating - a.rating).slice(0, 3);
    const topMental = [...groupedAttributes.mental].sort((a, b) => b.rating - a.rating).slice(0, 3);

    return [...topSkills, ...topPhysical, ...topMental].map(attr => ({
      ability: attr.name,
      rating: attr.rating,
      fullMark: 99
    }));
  };

  // Prepare data for individual category radar charts
  const getSkillsRadarData = () => {
    return groupedAttributes.skills.map(attr => ({
      ability: attr.name,
      rating: attr.rating,
      fullMark: 99
    }));
  };

  const getPhysicalRadarData = () => {
    return groupedAttributes.physical.map(attr => ({
      ability: attr.name,
      rating: attr.rating,
      fullMark: 99
    }));
  };

  const getMentalRadarData = () => {
    return groupedAttributes.mental.map(attr => ({
      ability: attr.name,
      rating: attr.rating,
      fullMark: 99
    }));
  };

  const categoryAveragesData = getCategoryAverages();
  const detailedAbilitiesData = getDetailedAbilitiesData();
  const skillsRadarData = getSkillsRadarData();
  const physicalRadarData = getPhysicalRadarData();
  const mentalRadarData = getMentalRadarData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Page Title with Back Button */}
        {playerLoading ? (
          <div className="mb-4 animate-pulse">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : player ? (
          <PageTitle
            title={`${player.firstName} ${player.lastName}`}
            subtitle={subtitle}
            backLink={backLink}
            image={{
              src: player.photoUrl,
              alt: `${player.firstName} ${player.lastName}`,
              initials: `${player.firstName[0]}${player.lastName[0]}`,
              colorClass: 'from-primary-500 to-primary-600'
            }}
            action={{
              label: 'Settings',
              href: settingsLink,
              icon: 'settings',
              title: 'Player Settings'
            }}
          />
        ) : null}

        {/* Player Sub Navigation */}
        {!playerLoading && player && <PlayerSubNav />}

        {/* Error State */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error.message || 'Failed to load player abilities'}
            </p>
            <button onClick={refetch} className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline">
              Try again
            </button>
          </div>
        )}
        
        {/* Header with Action Button */}
        <div className="flex justify-between items-center mb-4">
          {loading ? (
            <div className="flex-1">
              <div className="h-7 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-64 mb-2" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-48" />
            </div>
          ) : abilities ? (
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                Overall Rating: {abilities.overallRating}/99
                {activeEvaluations.length > 0 && (
                  <span className="ml-2 text-sm">
                    (Based on {activeEvaluations.length} review{activeEvaluations.length !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>
          ) : null}
        </div>

        {/* Progress Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {loading ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="card">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-24 mb-2" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-20 mb-1" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-32" />
                </div>
              ))}
            </>
          ) : abilities && bestSkill && focusArea ? (
            <>
              <div className="card">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Score</div>
                <div className="text-4xl font-bold text-primary-600">
                  {abilities.overallRating}/99
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {activeEvaluations.length} review{activeEvaluations.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Skill</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{bestSkill.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Rating: {bestSkill.rating}/99</div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Focus Area</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{focusArea.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Rating: {focusArea.rating}/99</div>
              </div>
            </>
          ) : null}
        </div>

        {/* Main Charts Row */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-48 mb-4" />
                <div className="h-80 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-full mt-4" />
              </div>
            ))}
          </div>
        ) : abilities ? (
          <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* Overall Rating Chart */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Overall Rating Over Time</h3>
            <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={abilitiesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke={chartColors.axis}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke={chartColors.axis}
                    style={{ fontSize: '12px' }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: chartColors.tooltipBg, 
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '8px',
                      color: chartColors.tooltipText
                    }}
                    labelStyle={{ color: chartColors.axis }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke={chartColors.primary.stroke}
                    strokeWidth={3}
                    dot={{ fill: chartColors.primary.fill, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              📈 Track progress based on coach evaluations
            </div>
          </div>

          {/* Category Averages Radar */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Abilities by Category</h3>
            <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryAveragesData}>
                  <PolarGrid stroke={chartColors.grid} />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: chartColors.axis, fontSize: 14, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 99]} 
                    tick={{ fill: chartColors.axis, fontSize: 10 }}
                    tickCount={5}
                  />
                  <Radar
                    name="Rating"
                    dataKey="rating"
                    stroke={chartColors.primary.stroke}
                    fill={chartColors.primary.fill}
                    fillOpacity={0.5}
                    dot={{ fill: chartColors.primary.fill, r: 4 }}
                    label={({ value, x, y }) => (
                      <text 
                        x={x} 
                        y={y} 
                        fill={chartColors.labelText}
                        fontSize={12} 
                        fontWeight={700}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ 
                          textShadow: isDark ? '0 0 4px #2563EB, 0 0 8px #2563EB' : '0 0 3px #fff, 0 0 6px #fff',
                          filter: isDark ? 'drop-shadow(0 0 2px rgba(37, 99, 235, 0.8))' : 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))'
                        }}
                      >
                        {value}
                      </text>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '8px',
                      color: chartColors.tooltipText
                    }}
                    formatter={(value: number) => [`${value}/99`, 'Average Rating']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              🎯 Average ratings by attribute category
            </div>
          </div>

          {/* Detailed Top Abilities Radar */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Top Abilities Breakdown</h3>
            <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={detailedAbilitiesData}>
                  <PolarGrid stroke={chartColors.grid} />
                  <PolarAngleAxis 
                    dataKey="ability" 
                    tick={{ fill: chartColors.axis, fontSize: 10 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 99]} 
                    tick={{ fill: chartColors.axis, fontSize: 9 }}
                    tickCount={4}
                  />
                  <Radar
                    name="Rating"
                    dataKey="rating"
                    stroke={chartColors.emerald.stroke}
                    fill={chartColors.emerald.fill}
                    fillOpacity={0.4}
                    dot={{ fill: chartColors.emerald.fill, r: 3 }}
                    label={({ value, x, y }) => (
                      <text 
                        x={x} 
                        y={y} 
                        fill={chartColors.labelText}
                        fontSize={10} 
                        fontWeight={700}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ 
                          textShadow: isDark ? '0 0 3px #10B981, 0 0 6px #10B981' : '0 0 3px #fff, 0 0 6px #fff',
                          filter: isDark ? 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.8))' : 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))'
                        }}
                      >
                        {value}
                      </text>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '8px',
                      color: chartColors.tooltipText
                    }}
                    formatter={(value: number) => [`${value}/99`, 'Rating']}
                  />
                  <Legend wrapperStyle={{ color: chartColors.axis }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              ⭐ Top 3 abilities from each category
            </div>
          </div>
        </div>
        ) : null}

        {/* Individual Category Radar Charts */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-40 mb-4" />
                <div className="h-72 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : abilities ? (
          <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* Skills Radar */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full text-sm">
                Skills
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({Math.round(groupedAttributes.skills.reduce((sum, attr) => sum + attr.rating, 0) / groupedAttributes.skills.length)}/99 avg)
              </span>
            </h3>
            <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="60%" data={skillsRadarData}>
                  <PolarGrid stroke={chartColors.grid} />
                  <PolarAngleAxis 
                    dataKey="ability" 
                    tick={{ fill: chartColors.axis, fontSize: 8 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 99]} 
                    tick={{ fill: chartColors.axis, fontSize: 8 }}
                    tickCount={4}
                  />
                  <Radar
                    name="Rating"
                    dataKey="rating"
                    stroke={chartColors.blue.stroke}
                    fill={chartColors.blue.fill}
                    fillOpacity={0.4}
                    dot={{ fill: chartColors.blue.fill, r: 2 }}
                    label={({ value, x, y }) => (
                      <text 
                        x={x} 
                        y={y} 
                        fill={chartColors.labelText}
                        fontSize={9} 
                        fontWeight={700}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ 
                          textShadow: isDark ? '0 0 3px #3B82F6, 0 0 6px #3B82F6' : '0 0 3px #fff, 0 0 6px #fff',
                          filter: isDark ? 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.8))' : 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))'
                        }}
                      >
                        {value}
                      </text>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '8px',
                      color: chartColors.tooltipText
                    }}
                    formatter={(value: number) => [`${value}/99`, 'Rating']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Physical Radar */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full text-sm">
                Physical
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({Math.round(groupedAttributes.physical.reduce((sum, attr) => sum + attr.rating, 0) / groupedAttributes.physical.length)}/99 avg)
              </span>
            </h3>
            <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="60%" data={physicalRadarData}>
                  <PolarGrid stroke={chartColors.grid} />
                  <PolarAngleAxis 
                    dataKey="ability" 
                    tick={{ fill: chartColors.axis, fontSize: 8 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 99]} 
                    tick={{ fill: chartColors.axis, fontSize: 8 }}
                    tickCount={4}
                  />
                  <Radar
                    name="Rating"
                    dataKey="rating"
                    stroke={chartColors.green.stroke}
                    fill={chartColors.green.fill}
                    fillOpacity={0.4}
                    dot={{ fill: chartColors.green.fill, r: 2 }}
                    label={({ value, x, y }) => (
                      <text 
                        x={x} 
                        y={y} 
                        fill={chartColors.labelText}
                        fontSize={9} 
                        fontWeight={700}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ 
                          textShadow: isDark ? '0 0 3px #22C55E, 0 0 6px #22C55E' : '0 0 3px #fff, 0 0 6px #fff',
                          filter: isDark ? 'drop-shadow(0 0 2px rgba(34, 197, 94, 0.8))' : 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))'
                        }}
                      >
                        {value}
                      </text>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '8px',
                      color: chartColors.tooltipText
                    }}
                    formatter={(value: number) => [`${value}/99`, 'Rating']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mental Radar */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full text-sm">
                Mental
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({Math.round(groupedAttributes.mental.reduce((sum, attr) => sum + attr.rating, 0) / groupedAttributes.mental.length)}/99 avg)
              </span>
            </h3>
            <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="60%" data={mentalRadarData}>
                  <PolarGrid stroke={chartColors.grid} />
                  <PolarAngleAxis 
                    dataKey="ability" 
                    tick={{ fill: chartColors.axis, fontSize: 8 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 99]} 
                    tick={{ fill: chartColors.axis, fontSize: 8 }}
                    tickCount={4}
                  />
                  <Radar
                    name="Rating"
                    dataKey="rating"
                    stroke={chartColors.purple.stroke}
                    fill={chartColors.purple.fill}
                    fillOpacity={0.4}
                    dot={{ fill: chartColors.purple.fill, r: 2 }}
                    label={({ value, x, y }) => (
                      <text 
                        x={x} 
                        y={y} 
                        fill={chartColors.labelText}
                        fontSize={9} 
                        fontWeight={700}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ 
                          textShadow: isDark ? '0 0 3px #A855F7, 0 0 6px #A855F7' : '0 0 3px #fff, 0 0 6px #fff',
                          filter: isDark ? 'drop-shadow(0 0 2px rgba(168, 85, 247, 0.8))' : 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))'
                        }}
                      >
                        {value}
                      </text>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '8px',
                      color: chartColors.tooltipText
                    }}
                    formatter={(value: number) => [`${value}/99`, 'Rating']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        ) : null}
      </main>
    </div>
  );
}
