import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ClipboardList, Users, Activity, FileText, Lock, Unlock, Plus } from 'lucide-react';
import { sampleMatches } from '@/data/matches';
import { sampleTeams } from '@/data/teams';
import { sampleClubs } from '@/data/clubs';
import { samplePlayers } from '@/data/players';
import { sampleFormations, getFormationsBySquadSize } from '@/data/formations';
import { getAgeGroupById, sampleAgeGroups } from '@/data/ageGroups';
import { PlayerPosition, SquadSize } from '@/types';
import { Routes } from '@utils/routes';
import FormationDisplay from '@/components/formation/FormationDisplay';

export default function AddEditMatchPage() {
  const { clubId, ageGroupId, teamId, matchId } = useParams();
  const navigate = useNavigate();
  const isEditing = matchId && matchId !== 'new';

  const team = sampleTeams.find(t => t.id === teamId);
  const club = sampleClubs.find(c => c.id === clubId);
  
  // Try to get age group from URL param, fallback to team's ageGroupId if not found
  let ageGroup = getAgeGroupById(ageGroupId || '');
  if (!ageGroup && team?.ageGroupId) {
    ageGroup = getAgeGroupById(team.ageGroupId);
  }
  
  const existingMatch = isEditing ? sampleMatches.find(m => m.id === matchId) : null;

  // Get available seasons from age group
  const availableSeasons = ageGroup?.seasons || [];
  const defaultSeason = ageGroup?.defaultSeason || ageGroup?.season || '';

  // Get available kits (team kits take priority, then club kits)
  const teamKits = team?.kits || [];
  const clubKits = club?.kits || [];
  const availableKits = [...teamKits, ...clubKits].filter(k => k.isActive);

  // Get players for this team
  const teamPlayers = samplePlayers.filter(p => team?.playerIds.includes(p.id));
  
  // Get all club players (for cross-team selection)
  const allClubPlayers = samplePlayers.filter(p => p.clubId === clubId);

  // Check if team is archived
  if (team?.isArchived && matchId === 'new') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-orange-800 dark:text-orange-300 mb-2">
              Cannot Schedule Match
            </h2>
            <p className="text-orange-700 dark:text-orange-400 mb-4">
              This team is archived. You cannot schedule new matches for an archived team. Please unarchive the team first in Settings.
            </p>
            <button
              onClick={() => navigate(Routes.matches(clubId!, ageGroupId!, teamId!))}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Matches
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Form state
  const [seasonId, setSeasonId] = useState(existingMatch?.seasonId || defaultSeason);
  const [squadSize, setSquadSize] = useState<SquadSize>(existingMatch?.squadSize || ageGroup?.defaultSquadSize || 11);
  const [opposition, setOpposition] = useState(existingMatch?.opposition || '');
  const [kickOffTime, setKickOffTime] = useState(
    existingMatch?.kickOffTime ? existingMatch.kickOffTime.toISOString().slice(0, 16) : 
    existingMatch?.date ? existingMatch.date.toISOString().slice(0, 16) : ''
  );
  const [meetTime, setMeetTime] = useState(
    existingMatch?.meetTime ? existingMatch.meetTime.toISOString().slice(0, 16) : ''
  );
  const [location, setLocation] = useState(existingMatch?.location || '');
  const [isHome, setIsHome] = useState(existingMatch?.isHome ?? true);
  const [competition, setCompetition] = useState(existingMatch?.competition || '');
  const [kit, setKit] = useState(existingMatch?.kit?.primary || (availableKits.find(k => k.type === 'home')?.id || ''));
  const [goalkeeperKit, setGoalkeeperKit] = useState(existingMatch?.kit?.goalkeeper || (availableKits.find(k => k.type === 'goalkeeper')?.id || ''));
  const [formationId, setFormationId] = useState(existingMatch?.lineup?.formationId || '');
  const [weather, setWeather] = useState(existingMatch?.weather?.condition || '');
  const [temperature, setTemperature] = useState(existingMatch?.weather?.temperature?.toString() || '');
  
  // Get formations filtered by squad size
  const availableFormations = getFormationsBySquadSize(squadSize);
  
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
  const [isLocked, setIsLocked] = useState(existingMatch?.isLocked || false);

  const [activeTab, setActiveTab] = useState<'details' | 'lineup' | 'events' | 'report'>('details');
  
  // Position swap state - tracks the array index in startingPlayers for precise swapping
  const [selectedPlayerIndexForSwap, setSelectedPlayerIndexForSwap] = useState<number | null>(null);
  
  // Cross-team player selection modal
  const [showCrossTeamModal, setShowCrossTeamModal] = useState(false);
  const [crossTeamModalType, setCrossTeamModalType] = useState<'starting' | 'substitute'>('starting');
  
  // Modal filters
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalAgeGroupFilter, setModalAgeGroupFilter] = useState<string>('all');
  const [modalTeamFilter, setModalTeamFilter] = useState<string>('all');

  if (!team || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Team not found</h2>
          </div>
        </main>
      </div>
    );
  }

  const getPlayerName = (playerId: string) => {
    const player = allClubPlayers.find(p => p.id === playerId);
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

  const handlePlayerClickForSwap = (playerIndex: number) => {
    if (isLocked) return;
    
    if (selectedPlayerIndexForSwap === null) {
      // First click - select this player by index
      setSelectedPlayerIndexForSwap(playerIndex);
    } else {
      // Second click - swap positions
      if (selectedPlayerIndexForSwap === playerIndex) {
        // Clicked same player - deselect
        setSelectedPlayerIndexForSwap(null);
      } else {
        // Swap the two players at these indices
        const newStartingPlayers = [...startingPlayers];
        const temp = newStartingPlayers[selectedPlayerIndexForSwap];
        newStartingPlayers[selectedPlayerIndexForSwap] = newStartingPlayers[playerIndex];
        newStartingPlayers[playerIndex] = temp;
        setStartingPlayers(newStartingPlayers);
        setSelectedPlayerIndexForSwap(null);
      }
    }
  };

  const getRating = (playerId: string) => {
    return ratings.find(r => r.playerId === playerId)?.rating || 0;
  };

  const handleSquadSizeChange = (newSquadSize: SquadSize) => {
    setSquadSize(newSquadSize);
    // Reset formation if current one doesn't match new squad size
    const currentFormation = sampleFormations.find(f => f.id === formationId);
    if (currentFormation && currentFormation.squadSize !== newSquadSize) {
      setFormationId('');
      // Also warn if there are starting players selected
      if (startingPlayers.length > 0) {
        const confirmReset = window.confirm(
          'Changing squad size will clear your current lineup. Do you want to continue?'
        );
        if (confirmReset) {
          setStartingPlayers([]);
        } else {
          // Revert squad size change
          setSquadSize(squadSize);
          return;
        }
      }
    }
  };

  const handleCompleteMatch = () => {
    // Validate that essential match data is filled
    if (!homeScore || !awayScore) {
      alert('Please enter the match score before completing');
      return;
    }
    if (startingPlayers.length === 0) {
      alert('Please add starting players before completing the match');
      return;
    }
    
    const confirmComplete = window.confirm(
      'Are you sure you want to mark this match as completed? The match will be locked automatically.'
    );
    
    if (confirmComplete) {
      setIsLocked(true);
      alert('Match marked as completed and locked successfully!');
      // In a real app, this would update the backend
      console.log('Match completed and locked');
    }
  };

  const handleToggleLock = () => {
    if (isLocked) {
      const confirmUnlock = window.confirm(
        'Are you sure you want to unlock this match? This will allow editing of all match details.'
      );
      if (confirmUnlock) {
        setIsLocked(false);
        alert('Match unlocked successfully! You can now make changes.');
      }
    } else {
      const confirmLock = window.confirm(
        'Are you sure you want to lock this match? This will prevent any further edits until unlocked.'
      );
      if (confirmLock) {
        setIsLocked(true);
        alert('Match locked successfully!');
      }
    }
  };

  const handleSave = () => {
    // Check if match is locked
    if (isLocked) {
      alert('This match is locked and cannot be edited. Please unlock it first.');
      return;
    }

    // Validate required fields
    if (!opposition || !kickOffTime || !location || !competition || !kit) {
      alert('Please fill in all required fields');
      return;
    }

    // In a real app, this would save to backend
    console.log('Saving match...', {
      seasonId,
      squadSize,
      opposition,
      kickOffTime,
      meetTime,
      date: kickOffTime, // Keep date for backward compatibility
      location,
      isHome,
      competition,
      kit: {
        primary: kit,
        goalkeeper: goalkeeperKit || undefined
      },
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
      <main className="container mx-auto px-4 py-4">{/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {isEditing ? 'Edit Match' : 'Add New Match'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {team.name} - {club.name}
              </p>
            </div>
            {isEditing && (
              <div className="flex items-center gap-3">
                {isLocked && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg font-medium">
                    🔒 Locked
                  </span>
                )}
                {!isLocked && existingMatch?.status === 'completed' && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg font-medium">
                    ✓ Completed
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex justify-evenly sm:justify-start sm:flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'details'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="hidden sm:inline">Match Details</span>
            </button>
            <button
              onClick={() => setActiveTab('lineup')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'lineup'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Team Selection</span>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'events'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="hidden sm:inline">Match Events</span>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'report'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="hidden sm:inline">Report & Ratings</span>
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
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter opposition team name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Season *
                  </label>
                  <select
                    value={seasonId}
                    onChange={(e) => setSeasonId(e.target.value)}
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {availableSeasons.length === 0 ? (
                      <option value={defaultSeason}>{defaultSeason}</option>
                    ) : (
                      availableSeasons.map(season => (
                        <option key={season} value={season}>
                          {season} {season === defaultSeason ? '(Default)' : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Squad Size *
                  </label>
                  <select
                    value={squadSize}
                    onChange={(e) => handleSquadSizeChange(parseInt(e.target.value) as SquadSize)}
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value={4}>4-a-side{ageGroup?.defaultSquadSize === 4 ? ' (Age Group Default)' : ''}</option>
                    <option value={5}>5-a-side{ageGroup?.defaultSquadSize === 5 ? ' (Age Group Default)' : ''}</option>
                    <option value={7}>7-a-side{ageGroup?.defaultSquadSize === 7 ? ' (Age Group Default)' : ''}</option>
                    <option value={9}>9-a-side{ageGroup?.defaultSquadSize === 9 ? ' (Age Group Default)' : ''}</option>
                    <option value={11}>11-a-side{ageGroup?.defaultSquadSize === 11 ? ' (Age Group Default)' : ''}</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Number of starting players per team{ageGroup?.defaultSquadSize ? ` (Age group default: ${ageGroup.defaultSquadSize}-a-side)` : ''}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kick Off Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={kickOffTime}
                    onChange={(e) => setKickOffTime(e.target.value)}
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meet Time
                  </label>
                  <input
                    type="datetime-local"
                    value={meetTime}
                    onChange={(e) => setMeetTime(e.target.value)}
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Optional: Team meeting time before kick off"
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
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={isLocked}
                        className="mr-2"
                      />
                      <span className="text-gray-900 dark:text-white">Home</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!isHome}
                        onChange={() => setIsHome(false)}
                        disabled={isLocked}
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
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g., County League Division 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kit *
                  </label>
                  <select
                    value={kit}
                    onChange={(e) => setKit(e.target.value)}
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {availableKits.length === 0 ? (
                      <>
                        <option value="home-default">Home Kit (Default)</option>
                        <option value="away-default">Away Kit (Default)</option>
                        <option value="third-default">Third Kit (Default)</option>
                      </>
                    ) : (
                      <>
                        <option value="">Select a kit</option>
                        {teamKits.filter(k => k.isActive && k.type !== 'goalkeeper').length > 0 && (
                          <optgroup label="Team Kits">
                            {teamKits.filter(k => k.isActive && k.type !== 'goalkeeper').map(k => (
                              <option key={k.id} value={k.id}>{k.name}</option>
                            ))}
                          </optgroup>
                        )}
                        {clubKits.filter(k => k.isActive && k.type !== 'goalkeeper').length > 0 && (
                          <optgroup label="Club Kits">
                            {clubKits.filter(k => k.isActive && k.type !== 'goalkeeper').map(k => (
                              <option key={k.id} value={k.id}>{k.name}</option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    )}
                  </select>
                  {availableKits.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      No custom kits defined. Using default kits based on club colors.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Goalkeeper Kit
                  </label>
                  <select
                    value={goalkeeperKit}
                    onChange={(e) => setGoalkeeperKit(e.target.value)}
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select goalkeeper kit (optional)</option>
                    {availableKits.filter(k => k.type === 'goalkeeper').length > 0 ? (
                      <>
                        {teamKits.filter(k => k.isActive && k.type === 'goalkeeper').length > 0 && (
                          <optgroup label="Team Goalkeeper Kits">
                            {teamKits.filter(k => k.isActive && k.type === 'goalkeeper').map(k => (
                              <option key={k.id} value={k.id}>{k.name}</option>
                            ))}
                          </optgroup>
                        )}
                        {clubKits.filter(k => k.isActive && k.type === 'goalkeeper').length > 0 && (
                          <optgroup label="Club Goalkeeper Kits">
                            {clubKits.filter(k => k.isActive && k.type === 'goalkeeper').map(k => (
                              <option key={k.id} value={k.id}>{k.name}</option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    ) : (
                      <option value="gk-default">Default Goalkeeper Kit</option>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select a specific kit for your goalkeeper
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weather Condition
                  </label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLocked}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select formation</option>
                  {availableFormations.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.system})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Showing formations for {squadSize}-a-side ({availableFormations.length} available)
                </p>
              </div>

              {/* Two Column Layout: Players List + Formation Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Starting XI and Substitutes */}
                <div className="space-y-6">
                  {/* Starting XI */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Starting {squadSize} ({startingPlayers.length}/{squadSize})
                    </h3>
                <div className="space-y-2 mb-4">
                  {(() => {
                    // Get the selected formation to access position order
                    const selectedFormation = sampleFormations.find(f => f.id === formationId);
                    
                    // Create a map of position orders from the formation
                    const positionOrder: Record<string, number> = {};
                    if (selectedFormation?.positions) {
                      selectedFormation.positions.forEach((pos, index) => {
                        positionOrder[pos.position] = index;
                      });
                    }
                    
                    // Sort starting lineup by formation position order (GK -> Defenders -> Midfielders -> Forwards)
                    const sortedPlayers = [...startingPlayers].sort((a, b) => {
                      const orderA = positionOrder[a.position] ?? 999;
                      const orderB = positionOrder[b.position] ?? 999;
                      return orderA - orderB;
                    });
                    
                    return sortedPlayers.map((player) => {
                      const playerData = allClubPlayers.find(p => p.id === player.playerId);
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
                            disabled={isLocked}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>

                {startingPlayers.length < squadSize && !isLocked && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Add Starting Player</h4>
                      <button
                        onClick={() => {
                          setCrossTeamModalType('starting');
                          setModalSearchTerm('');
                          setModalAgeGroupFilter('all');
                          setModalTeamFilter('all');
                          setShowCrossTeamModal(true);
                        }}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                      >
                        + From Other Teams
                      </button>
                    </div>
                    {availablePlayers.length > 0 ? (
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
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No team players available. Select from other teams above.
                      </p>
                    )}
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
                    const playerData = allClubPlayers.find(p => p.id === playerId);
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
                          disabled={isLocked}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>

                {!isLocked && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Add Substitute</h4>
                      <button
                        onClick={() => {
                          setCrossTeamModalType('substitute');
                          setModalSearchTerm('');
                          setModalAgeGroupFilter('all');
                          setModalTeamFilter('all');
                          setShowCrossTeamModal(true);
                        }}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                      >
                        + From Other Teams
                      </button>
                    </div>
                    {availablePlayers.length > 0 ? (
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
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No team players available. Select from other teams above.
                      </p>
                    )}
                  </div>
                )}
              </div>
                </div>

                {/* Right Column: Formation Display */}
                <div className="lg:sticky lg:top-6 lg:self-start">
                  {formationId ? (
                    <>
                      <FormationDisplay
                        formation={sampleFormations.find(f => f.id === formationId)!}
                        selectedPlayers={startingPlayers}
                        getPlayerName={getPlayerName}
                        showPlayerNames={true}
                        interactive={!isLocked}
                        onPlayerClick={handlePlayerClickForSwap}
                        highlightedPlayerIndex={selectedPlayerIndexForSwap}
                      />
                    </>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <div className="text-gray-400 dark:text-gray-500 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">No Formation Selected</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Select a formation above to see the tactical setup
                      </p>
                    </div>
                  )}
                </div>
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
                            disabled={isLocked}
                            className="w-full px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLocked}
                  className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Add Goal"
                >
                  <Plus className="w-4 h-4" />
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
                            disabled={isLocked}
                            className="w-full px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLocked}
                  className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Add Card"
                >
                  <Plus className="w-4 h-4" />
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
                            disabled={isLocked}
                            className="w-full px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLocked}
                  className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Add Injury"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Substitutions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Substitutions 🔄
                </h3>
                <div className="space-y-3 mb-4">
                  {substitutions.map((sub, index) => (
                    <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
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
                            disabled={isLocked}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                            disabled={isLocked}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                            disabled={isLocked}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                            disabled={isLocked}
                            className="w-full px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLocked}
                  className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Add Substitution"
                >
                  <Plus className="w-4 h-4" />
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
                  disabled={isLocked}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                              disabled={isLocked}
                              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLocked}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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

        {isLocked && (
            <div className="mt-8 pt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                🔒 This match is locked. Unlock it to make changes.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={handleSave}
                disabled={isLocked}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <Link
                to={Routes.matches(clubId!, ageGroupId!, teamId!)}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium text-center"
              >
                Cancel
              </Link>
              
              {/* Match completion and lock controls */}
              {isEditing && (
                <>
                  {!isLocked && existingMatch?.status !== 'completed' && (
                    <button
                      onClick={handleCompleteMatch}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Complete Match
                    </button>
                  )}
                  <button
                    onClick={handleToggleLock}
                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg font-medium ${
                      isLocked
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        Unlock
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Lock
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Cross-Team Player Selection Modal */}
      {showCrossTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Select Player from Club
                </h2>
              </div>
              <button
                onClick={() => setShowCrossTeamModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {/* Filters */}
            <div className="px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search by name
                  </label>
                  <input
                    type="text"
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    placeholder="Search players..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                
                {/* Age Group Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Age Group
                  </label>
                  <select
                    value={modalAgeGroupFilter}
                    onChange={(e) => {
                      setModalAgeGroupFilter(e.target.value);
                      setModalTeamFilter('all'); // Reset team filter when age group changes
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">All Age Groups</option>
                    {sampleAgeGroups
                      .filter(ag => ag.clubId === clubId)
                      .map(ag => (
                        <option key={ag.id} value={ag.id}>{ag.name}</option>
                      ))}
                  </select>
                </div>
                
                {/* Team Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team
                  </label>
                  <select
                    value={modalTeamFilter}
                    onChange={(e) => setModalTeamFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">All Teams</option>
                    {sampleTeams
                      .filter(t => t.clubId === clubId && (modalAgeGroupFilter === 'all' || t.ageGroupId === modalAgeGroupFilter))
                      .map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid md:grid-cols-2 gap-4">
                {allClubPlayers
                  .filter(p => !allPlayersInMatch.includes(p.id))
                  .filter(p => {
                    // Search filter
                    if (modalSearchTerm) {
                      const searchLower = modalSearchTerm.toLowerCase();
                      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
                      if (!fullName.includes(searchLower)) return false;
                    }
                    
                    // Age group filter
                    if (modalAgeGroupFilter !== 'all') {
                      if (!p.ageGroupIds.includes(modalAgeGroupFilter)) return false;
                    }
                    
                    // Team filter
                    if (modalTeamFilter !== 'all') {
                      if (!p.teamIds.includes(modalTeamFilter)) return false;
                    }
                    
                    return true;
                  })
                  .map((player) => {
                    // Find which teams this player belongs to
                    const playerTeams = sampleTeams.filter(t => t.playerIds.includes(player.id));
                    const teamNames = playerTeams.map(t => t.name).join(', ');
                    
                    return (
                      <div key={player.id} className="relative">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-3">
                          {player.photo ? (
                            <img 
                              src={player.photo} 
                              alt={`${player.firstName} ${player.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                              {player.firstName[0]}{player.lastName[0]}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {player.firstName} {player.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {teamNames || 'No team'}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {player.preferredPositions.slice(0, 3).map(pos => (
                                <span key={pos} className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                  {pos}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const position = player.preferredPositions[0] || 'CM';
                              if (crossTeamModalType === 'starting') {
                                handleAddStartingPlayer(player.id, position);
                              } else {
                                handleAddSubstitute(player.id);
                              }
                              setShowCrossTeamModal(false);
                            }}
                            className="px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm font-medium"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {(() => {
                const filteredPlayers = allClubPlayers
                  .filter(p => !allPlayersInMatch.includes(p.id))
                  .filter(p => {
                    if (modalSearchTerm) {
                      const searchLower = modalSearchTerm.toLowerCase();
                      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
                      if (!fullName.includes(searchLower)) return false;
                    }
                    if (modalAgeGroupFilter !== 'all' && !p.ageGroupIds.includes(modalAgeGroupFilter)) return false;
                    if (modalTeamFilter !== 'all' && !p.teamIds.includes(modalTeamFilter)) return false;
                    return true;
                  });
                
                if (filteredPlayers.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">
                        {allClubPlayers.filter(p => !allPlayersInMatch.includes(p.id)).length === 0
                          ? 'All club players are already in this match'
                          : 'No players match the current filters'}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
