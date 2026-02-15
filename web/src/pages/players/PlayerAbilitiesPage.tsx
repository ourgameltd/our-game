import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { usePlayerAbilities, useCreatePlayerAbilityEvaluation } from '@api/hooks';
import { CreatePlayerAbilityEvaluationRequest } from '@api/client';
import { groupAttributes, getQualityColor, calculateOverallRating } from '@utils/attributeHelpers';
import { PlayerAttributes } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, RadarChart, Radar, Legend
} from 'recharts';

export default function PlayerAbilitiesPage() {
  const { playerId } = useParams();
  const { data: abilities, isLoading: loading, error, refetch } = usePlayerAbilities(playerId);
  const { mutate: createEvaluation, isSubmitting } = useCreatePlayerAbilityEvaluation(playerId!);
  const { actualTheme } = useTheme();
  const { setEntityName } = useNavigation();
  const isDark = actualTheme === 'dark';
  
  // Update navigation context with player name
  useEffect(() => {
    if (abilities) {
      setEntityName('player', abilities.playerId, `${abilities.firstName} ${abilities.lastName}`);
    }
  }, [abilities, setEntityName]);
  
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
  
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<'skills' | 'physical' | 'mental'>('skills');
  const [attributeRatings, setAttributeRatings] = useState<Record<string, number>>({});
  const [coachNotes, setCoachNotes] = useState('');
  const [showAllAbilities, setShowAllAbilities] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  // Get the last evaluation for pre-filling the form
  const getLastEvaluation = () => {
    if (!abilities?.evaluations || abilities.evaluations.length === 0) return null;
    return abilities.evaluations[0]; // Evaluations are already sorted by date (most recent first)
  };

  // Initialize form with last evaluation or current attributes
  const initializeForm = () => {
    if (!abilities) return;
    
    const lastEval = getLastEvaluation();
    const newRatings: Record<string, number> = {};

    if (lastEval) {
      // Use last evaluation
      lastEval.attributes.forEach(attr => {
        newRatings[attr.attributeName] = attr.rating;
      });
      setCoachNotes(lastEval.coachNotes || '');
    } else {
      // Use current attributes
      Object.entries(abilities.attributes).forEach(([key, value]) => {
        newRatings[key] = value;
      });
    }

    setAttributeRatings(newRatings);
    setSubmitError(null);
    setShowEvaluationForm(true);
  };

  const handleSubmitEvaluation = async () => {
    if (!abilities) return;
    
    setSubmitError(null);
    
    // Build request with all attributes
    const request: CreatePlayerAbilityEvaluationRequest = {
      evaluatedAt: new Date(evaluationDate).toISOString(),
      coachNotes: coachNotes || undefined,
      attributes: Object.entries(attributeRatings).map(([attributeName, rating]) => ({
        attributeName,
        rating,
      })),
    };

    try {
      await createEvaluation(request);
      // On success, close form and refresh data
      setShowEvaluationForm(false);
      setAttributeRatings({});
      setCoachNotes('');
      await refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit evaluation');
    }
  };

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

  // Calculate historical data from evaluations
  const getHistoricalData = () => {
    if (!abilities) return [];
    
    if (!abilities.evaluations || abilities.evaluations.length === 0) {
      return [{ date: 'Current', rating: abilities.overallRating }];
    }

    return abilities.evaluations
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

  const currentAttributes = abilities ? groupedAttributes[selectedCategory] : [];
  const attributeKeyMap: Record<string, string> = {
    'Ball Control': 'ballControl',
    'Crossing': 'crossing',
    'Weak Foot': 'weakFoot',
    'Dribbling': 'dribbling',
    'Finishing': 'finishing',
    'Free Kick': 'freeKick',
    'Heading': 'heading',
    'Long Passing': 'longPassing',
    'Long Shot': 'longShot',
    'Penalties': 'penalties',
    'Short Passing': 'shortPassing',
    'Shot Power': 'shotPower',
    'Sliding Tackle': 'slidingTackle',
    'Standing Tackle': 'standingTackle',
    'Volleys': 'volleys',
    'Acceleration': 'acceleration',
    'Agility': 'agility',
    'Balance': 'balance',
    'Jumping': 'jumping',
    'Pace': 'pace',
    'Reactions': 'reactions',
    'Sprint Speed': 'sprintSpeed',
    'Stamina': 'stamina',
    'Strength': 'strength',
    'Aggression': 'aggression',
    'Attacking Position': 'attackingPosition',
    'Awareness': 'awareness',
    'Composure': 'composure',
    'Defensive Positioning': 'defensivePositioning',
    'Interceptions': 'interceptions',
    'Marking': 'marking',
    'Positioning': 'positioning',
    'Vision': 'vision'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {abilities.firstName} {abilities.lastName} - Abilities
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Overall Rating: {abilities.overallRating}/99
                {abilities.evaluations.length > 0 && (
                  <span className="ml-2 text-sm">
                    (Based on {abilities.evaluations.length} evaluation{abilities.evaluations.length !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>
          ) : null}
          {!loading && abilities && (
            <button
              onClick={initializeForm}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              title="Add New Evaluation"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
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
                  {abilities.evaluations.length} evaluation{abilities.evaluations.length !== 1 ? 's' : ''}
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

        {/* Evaluation Form Modal */}
        {showEvaluationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      New Evaluation - {abilities?.firstName} {abilities?.lastName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {getLastEvaluation() ? 'Values auto-populated from last evaluation' : 'Values auto-populated from current attributes'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEvaluationForm(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Submit Error */}
                {submitError && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-800 dark:text-red-200">{submitError}</p>
                  </div>
                )}
                
                {/* Evaluation Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Evaluation Date
                  </label>
                  <input
                    type="date"
                    value={evaluationDate}
                    onChange={(e) => setEvaluationDate(e.target.value)}
                    className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
                  {(['skills', 'physical', 'mental'] as const).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 font-medium capitalize transition-colors ${
                        selectedCategory === category
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {category} ({groupedAttributes[category].length})
                    </button>
                  ))}
                </div>

                {/* Attributes Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {currentAttributes.map((attr) => {
                    const attrKey = attributeKeyMap[attr.name];
                    const currentRating = attributeRatings[attrKey] ?? (abilities?.attributes[attrKey as keyof PlayerAttributes] || 50);
                    const quality = getQualityColor(attr.quality);

                    return (
                      <div key={attr.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-medium text-gray-900 dark:text-white">
                            {attr.name}
                          </label>
                          <span className={`text-lg font-bold ${quality}`}>
                            {currentRating}/99
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="99"
                          value={currentRating}
                          onChange={(e) => setAttributeRatings(prev => ({
                            ...prev,
                            [attrKey]: parseInt(e.target.value)
                          }))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>0</span>
                          <span>50</span>
                          <span>99</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coach Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Overall Coach Comments
                  </label>
                  <textarea
                    value={coachNotes}
                    onChange={(e) => setCoachNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Provide overall feedback on player performance, areas of improvement, and recommendations..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSubmitEvaluation}
                    disabled={isSubmitting}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                  </button>
                  <button
                    onClick={() => setShowEvaluationForm(false)}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 
                      text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* All Abilities by Category */}
        {loading ? (
          <div className="card">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-64 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : abilities ? (
          <div className="card">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowAllAbilities(!showAllAbilities)}
            >
              <h3 className="text-xl font-semibold">
                All Abilities {abilities.evaluations.length > 0 && `(Based on ${abilities.evaluations.length} evaluations)`}
              </h3>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-transform">
              <svg 
                className={`w-6 h-6 transform transition-transform ${showAllAbilities ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {showAllAbilities && (
            <div className="mt-4">
              {/* Skills */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm mr-3">
                    Skills
                  </span>
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {groupedAttributes.skills.map((ability) => (
                    <div key={ability.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ability.name}</span>
                        <span className={`text-sm font-bold ${getQualityColor(ability.quality)}`}>
                          {ability.rating}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${(ability.rating / 99) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm mr-3">
                    Physical
                  </span>
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {groupedAttributes.physical.map((ability) => (
                    <div key={ability.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ability.name}</span>
                        <span className={`text-sm font-bold ${getQualityColor(ability.quality)}`}>
                          {ability.rating}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-green-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${(ability.rating / 99) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mental */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm mr-3">
                    Mental
                  </span>
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {groupedAttributes.mental.map((ability) => (
                    <div key={ability.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ability.name}</span>
                        <span className={`text-sm font-bold ${getQualityColor(ability.quality)}`}>
                          {ability.rating}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${(ability.rating / 99) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        ) : null}

        {/* Evaluation History */}
        {loading ? (
          <div className="card mt-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-48 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : abilities && abilities.evaluations.length > 0 ? (
          <div className="card mt-4">
            <h3 className="text-xl font-semibold mb-4">Evaluation History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Coach</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {abilities.evaluations.map((evaluation) => (
                    <tr key={evaluation.evaluationId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {new Date(evaluation.evaluatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {evaluation.coachName || 'Unknown Coach'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="font-bold text-primary-600">{evaluation.overallRating}/99</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {evaluation.coachNotes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
