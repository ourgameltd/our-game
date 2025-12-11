import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sampleMatches } from '@/data/matches';
import { sampleTeams } from '@/data/teams';
import { sampleClubs } from '@/data/clubs';
import { samplePlayers } from '@/data/players';
import { sampleFormations } from '@/data/formations';
import { PlayerPosition } from '@/types';
import { Routes } from '@utils/routes';
import { getTeamNavigationTabs } from '@/utils/navigationHelpers';
import PageNavigation from '@/components/navigation/PageNavigation';

export default function AddEditMatchPage() {
  const { clubId, ageGroupId, teamId, matchId } = useParams();
  const navigate = useNavigate();
  const isEditing = matchId && matchId !== 'new';

  const team = sampleTeams.find(t => t.id === teamId);
  const club = sampleClubs.find(c => c.id === clubId);
  const existingMatch = isEditing ? sampleMatches.find(m => m.id === matchId) : null;

  // Get players for this team
  const teamPlayers = samplePlayers.filter(p => team?.playerIds.includes(p.id));

  // Form state
  const [opposition, setOpposition] = useState(existingMatch?.opposition || '');
  const [date, setDate] = useState(
    existingMatch?.date ? existingMatch.date.toISOString().slice(0, 16) : ''
  );
  const [location, setLocation] = useState(existingMatch?.location || '');
  const [isHome, setIsHome] = useState(existingMatch?.isHome ?? true);
  const [competition, setCompetition] = useState(existingMatch?.competition || '');
  const [kit, setKit] = useState(existingMatch?.kit?.primary || 'Home Kit');
  const [formationId, setFormationId] = useState(existingMatch?.lineup?.formationId || '');
  const [weather, setWeather] = useState(existingMatch?.weather?.condition || '');
  const [temperature, setTemperature] = useState(existingMatch?.weather?.temperature?.toString() || '');
  
  // Match result state
  const [homeScore, setHomeScore] = useState(existingMatch?.score?.home?.toString() || '');
  const [awayScore, setAwayScore] = useState(existingMatch?.score?.away?.toString() || '');
  const [summary, setSummary] = useState(existingMatch?.report?.summary || '');
  
  // Lineup state
  const [startingPlayers, setStartingPlayers] = useState<{ playerId: string; position: PlayerPosition }[]>(
    existingMatch?.lineup?.starting || []
  );
  const [substitutes, setSubstitutes] = useState<string[]>(existingMatch?.lineup?.substitutes || []);
  const [substitutions, setSubstitutions] = useState<{ minute: number; playerOut: string; playerIn: string }[]>(
    existingMatch?.lineup?.substitutions || []
  );
  
  // Match events state
  const [goals, setGoals] = useState<{ playerId: string; minute: number; assist?: string }[]>(
    existingMatch?.report?.goalScorers || []
  );
  const [cards, setCards] = useState<{ playerId: string; type: 'yellow' | 'red'; minute: number; reason?: string }[]>(
    existingMatch?.report?.cards || []
  );
  const [injuries, setInjuries] = useState<{ playerId: string; minute: number; description: string; severity: 'minor' | 'moderate' | 'serious' }[]>(
    existingMatch?.report?.injuries || []
  );
  const [ratings, setRatings] = useState<{ playerId: string; rating: number }[]>(
    existingMatch?.report?.performanceRatings || []
  );
  const [playerOfTheMatch, setPlayerOfTheMatch] = useState(existingMatch?.report?.playerOfTheMatch || '');

  const [activeTab, setActiveTab] = useState<'details' | 'lineup' | 'events' | 'report'>('details');

  if (!team || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Team not found</h2>
          </div>
        </main>
      </div>
    );
  }

  const getPlayerName = (playerId: string) => {
    const player = teamPlayers.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown';
  };

  const handleAddStartingPlayer = (playerId: string, position: PlayerPosition) => {
    if (!startingPlayers.find(p => p.playerId === playerId)) {
      setStartingPlayers([...startingPlayers, { playerId, position }]);
      // Remove from substitutes if present
      setSubstitutes(substitutes.filter(id => id !== playerId));
    }
  };

  const handleRemoveStartingPlayer = (playerId: string) => {
    setStartingPlayers(startingPlayers.filter(p => p.playerId !== playerId));
  };

  const handleAddSubstitute = (playerId: string) => {
    if (!substitutes.includes(playerId) && !startingPlayers.find(p => p.playerId === playerId)) {
      setSubstitutes([...substitutes, playerId]);
    }
  };

  const handleRemoveSubstitute = (playerId: string) => {
    setSubstitutes(substitutes.filter(id => id !== playerId));
  };

  const handleAddGoal = () => {
    setGoals([...goals, { playerId: '', minute: 0 }]);
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleAddCard = () => {
    setCards([...cards, { playerId: '', type: 'yellow', minute: 0 }]);
  };

  const handleRemoveCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleAddInjury = () => {
    setInjuries([...injuries, { playerId: '', minute: 0, description: '', severity: 'minor' }]);
  };

  const handleRemoveInjury = (index: number) => {
    setInjuries(injuries.filter((_, i) => i !== index));
  };

  const handleAddSubstitution = () => {
    setSubstitutions([...substitutions, { minute: 0, playerOut: '', playerIn: '' }]);
  };

  const handleRemoveSubstitution = (index: number) => {
    setSubstitutions(substitutions.filter((_, i) => i !== index));
  };

  const handleSetRating = (playerId: string, rating: number) => {
    const existing = ratings.find(r => r.playerId === playerId);
    if (existing) {
      setRatings(ratings.map(r => r.playerId === playerId ? { playerId, rating } : r));
    } else {
      setRatings([...ratings, { playerId, rating }]);
    }
  };

  const getRating = (playerId: string) => {
    return ratings.find(r => r.playerId === playerId)?.rating || 0;
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving match...', {
      opposition,
      date,
      location,
      isHome,
      competition,
      kit,
      formationId,
      weather,
      temperature,
      score: { home: parseInt(homeScore) || 0, away: parseInt(awayScore) || 0 },
      lineup: { formationId, starting: startingPlayers, substitutes, substitutions },
      report: {
        summary,
        goalScorers: goals,
        cards,
        injuries,
        performanceRatings: ratings,
        playerOfTheMatch
      }
    });
    
    alert('Match saved successfully! (This is a demo - no actual save performed)');
    navigate(Routes.matches(clubId!, ageGroupId!, teamId!));
  };

  const allPlayersInMatch = [...startingPlayers.map(p => p.playerId), ...substitutes];
  const availablePlayers = teamPlayers.filter(p => !allPlayersInMatch.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getTeamNavigationTabs(clubId!, ageGroupId!, teamId!)} />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isEditing ? 'Edit Match' : 'Add New Match'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {team.name} - {club.name}
          </p>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'details'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Match Details
            </button>
            <button
              onClick={() => setActiveTab('lineup')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'lineup'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Team Selection
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'events'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Match Events
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'report'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Report & Ratings
            </button>
          </div>

          {/* Match Details Tab */}
          {activeTab === 'details' && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Opposition *
                  </label>
                  <input
                    type="text"
                    value={opposition}
                    onChange={(e) => setOpposition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter opposition team name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter match location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Venue Type *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={isHome}
                        onChange={() => setIsHome(true)}
                        className="mr-2"
                      />
                      <span className="text-gray-900 dark:text-white">Home</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!isHome}
                        onChange={() => setIsHome(false)}
                        className="mr-2"
                      />
                      <span className="text-gray-900 dark:text-white">Away</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Competition *
                  </label>
                  <input
                    type="text"
                    value={competition}
                    onChange={(e) => setCompetition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., County League Division 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kit
                  </label>
                  <select
                    value={kit}
                    onChange={(e) => setKit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option>Home Kit</option>
                    <option>Away Kit</option>
                    <option>Third Kit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weather Condition
                  </label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select weather</option>
                    <option>Clear</option>
                    <option>Partly Cloudy</option>
                    <option>Cloudy</option>
                    <option>Rainy</option>
                    <option>Heavy Rain</option>
                    <option>Windy</option>
                    <option>Snowy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Home Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Away Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Team Selection Tab */}
          {activeTab === 'lineup' && (
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formation
                </label>
                <select
                  value={formationId}
                  onChange={(e) => setFormationId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select formation</option>
                  {sampleFormations.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.system})</option>
                  ))}
                </select>
              </div>

              {/* Starting XI */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Starting XI ({startingPlayers.length}/11)
                </h3>
                <div className="space-y-2 mb-4">
                  {startingPlayers.map((player) => {
                    const playerData = teamPlayers.find(p => p.id === player.playerId);
                    return (
                      <div key={player.playerId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-semibold">
                            {player.position}
                          </span>
                          {playerData?.photo && (
                            <img 
                              src={playerData.photo} 
                              alt={getPlayerName(player.playerId)}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <span className="text-gray-900 dark:text-white font-medium">
                            {getPlayerName(player.playerId)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveStartingPlayer(player.playerId)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>

                {startingPlayers.length < 11 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Add Starting Player</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availablePlayers.map(player => (
                        <button
                          key={player.id}
                          onClick={() => {
                            const position = player.preferredPositions[0] || 'CM';
                            handleAddStartingPlayer(player.id, position);
                          }}
                          className="text-left px-3 py-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white flex items-center gap-2"
                        >
                          {player.photo && (
                            <img 
                              src={player.photo} 
                              alt={`${player.firstName} ${player.lastName}`}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            {player.firstName} {player.lastName}
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({player.preferredPositions.join(', ')})
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Substitutes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Substitutes ({substitutes.length})
                </h3>
                <div className="space-y-2 mb-4">
                  {substitutes.map((playerId) => {
                    const playerData = teamPlayers.find(p => p.id === playerId);
                    return (
                      <div key={playerId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          {playerData?.photo && (
                            <img 
                              src={playerData.photo} 
                              alt={getPlayerName(playerId)}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <span className="text-gray-900 dark:text-white font-medium">
                            {getPlayerName(playerId)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveSubstitute(playerId)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>

                {availablePlayers.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Add Substitute</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availablePlayers.map(player => (
                        <button
                          key={player.id}
                          onClick={() => handleAddSubstitute(player.id)}
                          className="text-left px-3 py-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:border-yellow-500 dark:hover:border-yellow-500 text-gray-900 dark:text-white flex items-center gap-2"
                        >
                          {player.photo && (
                            <img 
                              src={player.photo} 
                              alt={`${player.firstName} ${player.lastName}`}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          {player.firstName} {player.lastName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Substitutions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Substitutions Made
                </h3>
                <div className="space-y-3 mb-4">
                  {substitutions.map((sub, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Minute</label>
                          <input
                            type="number"
                            min="0"
                            max="120"
                            value={sub.minute}
                            onChange={(e) => {
                              const newSubs = [...substitutions];
                              newSubs[index].minute = parseInt(e.target.value) || 0;
                              setSubstitutions(newSubs);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Player Off</label>
                          <select
                            value={sub.playerOut}
                            onChange={(e) => {
                              const newSubs = [...substitutions];
                              newSubs[index].playerOut = e.target.value;
                              setSubstitutions(newSubs);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="">Select player</option>
                            {startingPlayers.map(p => (
                              <option key={p.playerId} value={p.playerId}>
                                {getPlayerName(p.playerId)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Player On</label>
                          <select
                            value={sub.playerIn}
                            onChange={(e) => {
                              const newSubs = [...substitutions];
                              newSubs[index].playerIn = e.target.value;
                              setSubstitutions(newSubs);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="">Select player</option>
                            {substitutes.map(pId => (
                              <option key={pId} value={pId}>
                                {getPlayerName(pId)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => handleRemoveSubstitution(index)}
                            className="w-full px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddSubstitution}
                  className="btn-secondary"
                >
                  + Add Substitution
                </button>
              </div>
            </div>
          )}

          {/* Match Events Tab */}
          {activeTab === 'events' && (
            <div className="mt-6 space-y-6">
              {/* Goals */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Goals ⚽
                </h3>
                <div className="space-y-3 mb-4">
                  {goals.map((goal, index) => (
                    <div key={index} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Minute</label>
                          <input
                            type="number"
                            min="0"
                            max="120"
                            value={goal.minute}
                            onChange={(e) => {
                              const newGoals = [...goals];
                              newGoals[index].minute = parseInt(e.target.value) || 0;
                              setGoals(newGoals);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Goal Scorer</label>
                          <select
                            value={goal.playerId}
                            onChange={(e) => {
                              const newGoals = [...goals];
                              newGoals[index].playerId = e.target.value;
                              setGoals(newGoals);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="">Select player</option>
                            {allPlayersInMatch.map(pId => (
                              <option key={pId} value={pId}>
                                {getPlayerName(pId)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Assist (Optional)</label>
                          <select
                            value={goal.assist || ''}
                            onChange={(e) => {
                              const newGoals = [...goals];
                              newGoals[index].assist = e.target.value;
                              setGoals(newGoals);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="">None</option>
                            {allPlayersInMatch.map(pId => (
                              <option key={pId} value={pId}>
                                {getPlayerName(pId)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => handleRemoveGoal(index)}
                            className="w-full px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddGoal}
                  className="btn-secondary"
                >
                  + Add Goal
                </button>
              </div>

              {/* Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Cards 🟨 🟥
                </h3>
                <div className="space-y-3 mb-4">
                  {cards.map((card, index) => (
                    <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Minute</label>
                          <input
                            type="number"
                            min="0"
                            max="120"
                            value={card.minute}
                            onChange={(e) => {
                              const newCards = [...cards];
                              newCards[index].minute = parseInt(e.target.value) || 0;
                              setCards(newCards);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Player</label>
                          <select
                            value={card.playerId}
                            onChange={(e) => {
                              const newCards = [...cards];
                              newCards[index].playerId = e.target.value;
                              setCards(newCards);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="">Select player</option>
                            {allPlayersInMatch.map(pId => (
                              <option key={pId} value={pId}>
                                {getPlayerName(pId)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Card Type</label>
                          <select
                            value={card.type}
                            onChange={(e) => {
                              const newCards = [...cards];
                              newCards[index].type = e.target.value as 'yellow' | 'red';
                              setCards(newCards);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="yellow">Yellow</option>
                            <option value="red">Red</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Reason (Optional)</label>
                          <input
                            type="text"
                            value={card.reason || ''}
                            onChange={(e) => {
                              const newCards = [...cards];
                              newCards[index].reason = e.target.value;
                              setCards(newCards);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="e.g., Foul"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => handleRemoveCard(index)}
                            className="w-full px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddCard}
                  className="btn-secondary"
                >
                  + Add Card
                </button>
              </div>

              {/* Injuries */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Injuries 🏥
                </h3>
                <div className="space-y-3 mb-4">
                  {injuries.map((injury, index) => (
                    <div key={index} className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Minute</label>
                          <input
                            type="number"
                            min="0"
                            max="120"
                            value={injury.minute}
                            onChange={(e) => {
                              const newInjuries = [...injuries];
                              newInjuries[index].minute = parseInt(e.target.value) || 0;
                              setInjuries(newInjuries);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Player</label>
                          <select
                            value={injury.playerId}
                            onChange={(e) => {
                              const newInjuries = [...injuries];
                              newInjuries[index].playerId = e.target.value;
                              setInjuries(newInjuries);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="">Select player</option>
                            {allPlayersInMatch.map(pId => (
                              <option key={pId} value={pId}>
                                {getPlayerName(pId)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Severity</label>
                          <select
                            value={injury.severity}
                            onChange={(e) => {
                              const newInjuries = [...injuries];
                              newInjuries[index].severity = e.target.value as 'minor' | 'moderate' | 'serious';
                              setInjuries(newInjuries);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="minor">Minor</option>
                            <option value="moderate">Moderate</option>
                            <option value="serious">Serious</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Description</label>
                          <input
                            type="text"
                            value={injury.description}
                            onChange={(e) => {
                              const newInjuries = [...injuries];
                              newInjuries[index].description = e.target.value;
                              setInjuries(newInjuries);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="e.g., Ankle sprain"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => handleRemoveInjury(index)}
                            className="w-full px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddInjury}
                  className="btn-secondary"
                >
                  + Add Injury
                </button>
              </div>
            </div>
          )}

          {/* Report & Ratings Tab */}
          {activeTab === 'report' && (
            <div className="mt-6 space-y-6">
              {/* Match Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Match Summary
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Write a summary of the match..."
                />
              </div>

              {/* Player Ratings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Player Ratings (Out of 10)
                </h3>
                <div className="space-y-3">
                  {allPlayersInMatch.map(playerId => {
                    const rating = getRating(playerId);
                    return (
                      <div key={playerId} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-900 dark:text-white font-medium">
                              {getPlayerName(playerId)}
                            </span>
                            {startingPlayers.find(p => p.playerId === playerId) && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                                Starting XI
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              value={rating || ''}
                              onChange={(e) => handleSetRating(playerId, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
                              placeholder="0.0"
                            />
                            <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  rating >= 8 ? 'bg-green-500' : rating >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${(rating / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Player of the Match */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Player of the Match ⭐
                </label>
                <select
                  value={playerOfTheMatch}
                  onChange={(e) => setPlayerOfTheMatch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select player of the match</option>
                  {allPlayersInMatch.map(pId => (
                    <option key={pId} value={pId}>
                      {getPlayerName(pId)} {getRating(pId) ? `(${getRating(pId).toFixed(1)})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              className="btn-primary flex-1"
            >
              {isEditing ? 'Save Changes' : 'Create Match'}
            </button>
            <Link
              to={Routes.matches(clubId!, ageGroupId!, teamId!)}
              className="btn-secondary flex-1 text-center"
            >
              Cancel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
