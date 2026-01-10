import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ClipboardList, Users, Activity, FileText, Lock, Unlock, Plus, MapPin, X, ExternalLink, CheckSquare } from 'lucide-react';
import { sampleMatches } from '@/data/matches';
import { sampleTeams } from '@/data/teams';
import { sampleClubs } from '@/data/clubs';
import { samplePlayers } from '@/data/players';
import { sampleFormations, getFormationsBySquadSize } from '@/data/formations';
import { sampleTactics, getResolvedPositions } from '@/data/tactics';
import { getAgeGroupById, sampleAgeGroups } from '@/data/ageGroups';
import { sampleCoaches, getCoachesByTeam, getCoachesByAgeGroup } from '@/data/coaches';
import { getPlayerSquadNumber } from '@/data/teams';
import { weatherConditions, squadSizes, cardTypes, injurySeverities, coachRoleDisplay } from '@/data/referenceData';
import { PlayerPosition, SquadSize, Tactic } from '@/types';
import { Routes } from '@utils/routes';
import { calculateTeamRatings, getAttributeQuality, groupAttributes } from '@utils/attributeHelpers';
import TacticDisplay from '@/components/tactics/TacticDisplay';

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
        <main className="mx-auto px-4 py-4">
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
  const [tacticId, setTacticId] = useState(existingMatch?.lineup?.tacticId || '');
  const [weather, setWeather] = useState(existingMatch?.weather?.condition || '');
  const [temperature, setTemperature] = useState(existingMatch?.weather?.temperature?.toString() || '');
  
  // Get formations filtered by squad size
  const availableFormations = getFormationsBySquadSize(squadSize);
  
  // Get tactics available for this team (including inherited from club and age group)
  const getAvailableTactics = (): Tactic[] => {
    return sampleTactics.filter(tactic => {
      // Must match squad size
      if (tactic.squadSize !== squadSize) return false;
      
      const scope = tactic.scope;
      
      // Team-level tactics for this team
      if (scope.type === 'team' && scope.teamId === teamId) return true;
      
      // Age group tactics for this age group
      if (scope.type === 'ageGroup' && scope.ageGroupId === ageGroupId) return true;
      
      // Club-level tactics for this club
      if (scope.type === 'club' && scope.clubId === clubId) return true;
      
      return false;
    });
  };
  
  const availableTactics = getAvailableTactics();
  const selectedTactic = tacticId ? sampleTactics.find(t => t.id === tacticId) : null;
  const selectedFormation = formationId ? sampleFormations.find(f => f.id === formationId) : null;
  
  // Get the URL for viewing the selected tactic's detail page
  const getTacticDetailUrl = (tactic: Tactic | null): string | null => {
    if (!tactic || !clubId) return null;
    
    const scope = tactic.scope;
    if (scope.type === 'team' && scope.teamId && ageGroupId) {
      return Routes.teamTacticDetail(clubId, ageGroupId, scope.teamId, tactic.id);
    } else if (scope.type === 'ageGroup' && scope.ageGroupId) {
      return Routes.ageGroupTacticDetail(clubId, scope.ageGroupId, tactic.id);
    } else if (scope.type === 'club') {
      return Routes.clubTacticDetail(clubId, tactic.id);
    }
    return null;
  };
  
  // Combined formation/tactic selection value
  const getSelectionValue = () => {
    if (tacticId) return `tactic:${tacticId}`;
    if (formationId) return `formation:${formationId}`;
    return '';
  };
  
  const handleSelectionChange = (value: string) => {
    if (!value) {
      setFormationId('');
      setTacticId('');
      return;
    }
    
    const [type, id] = value.split(':');
    if (type === 'tactic') {
      const tactic = sampleTactics.find(t => t.id === id);
      if (tactic) {
        setTacticId(id);
        setFormationId(tactic.parentFormationId || '');
      }
    } else if (type === 'formation') {
      setFormationId(id);
      setTacticId('');
    }
  };
  
  // Match result state
  const [homeScore, setHomeScore] = useState(existingMatch?.score?.home?.toString() || '');
  const [awayScore, setAwayScore] = useState(existingMatch?.score?.away?.toString() || '');
  const [summary, setSummary] = useState(existingMatch?.report?.summary || '');
  
  // Lineup state
  const [startingPlayers, setStartingPlayers] = useState<{ playerId: string; position: PlayerPosition; squadNumber?: number }[]>(
    existingMatch?.lineup?.starting || []
  );
  const [substitutes, setSubstitutes] = useState<{ playerId: string; squadNumber?: number }[]>(
    existingMatch?.lineup?.substitutes || []
  );
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
  const [captainId, setCaptainId] = useState(existingMatch?.report?.captainId || '');
  const [isLocked, setIsLocked] = useState(existingMatch?.isLocked || false);
  const [notes, setNotes] = useState(existingMatch?.notes || '');
  
  // Coach assignment state
  const [assignedCoachIds, setAssignedCoachIds] = useState<string[]>(existingMatch?.coachIds || []);
  const [showCoachModal, setShowCoachModal] = useState(false);
  
  // Attendance state
  const [attendance, setAttendance] = useState<{ playerId: string; status: 'confirmed' | 'declined' | 'maybe' | 'pending'; notes?: string }[]>(
    existingMatch?.attendance || teamPlayers.map(p => ({ playerId: p.id, status: 'pending' as const }))
  );

  const [activeTab, setActiveTab] = useState<'details' | 'lineup' | 'events' | 'report' | 'attendance'>('details');
  
  // Position swap state - tracks the array index in startingPlayers for precise swapping
  const [selectedPlayerIndexForSwap, setSelectedPlayerIndexForSwap] = useState<number | null>(null);
  
  // Cross-team player selection modal
  const [showCrossTeamModal, setShowCrossTeamModal] = useState(false);
  const [crossTeamModalType, setCrossTeamModalType] = useState<'starting' | 'substitute'>('starting');
  
  // Get coaches for this team and age group
  const teamCoaches = team ? getCoachesByTeam(team.id) : [];
  const ageGroupCoaches = ageGroup ? getCoachesByAgeGroup(ageGroup.id, sampleTeams) : [];
  
  // Get coaches that can be added (in age group but not yet assigned)
  const availableCoachesForMatch = ageGroupCoaches.filter(
    coach => !assignedCoachIds.includes(coach.id)
  );
  
  // Get assigned coach details
  const assignedCoaches = sampleCoaches.filter(coach => assignedCoachIds.includes(coach.id));
  
  // Auto-assign team coaches for new matches
  useEffect(() => {
    if (!isEditing && teamCoaches.length > 0 && assignedCoachIds.length === 0) {
      setAssignedCoachIds(teamCoaches.map(c => c.id));
    }
  }, [isEditing, teamCoaches.length]);
  
  // Modal filters
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalAgeGroupFilter, setModalAgeGroupFilter] = useState<string>('all');
  const [modalTeamFilter, setModalTeamFilter] = useState<string>('all');

  if (!team || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
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
      // Get default squad number from team assignment
      const squadNumber = getPlayerSquadNumber(teamId!, playerId);
      setStartingPlayers([...startingPlayers, { playerId, position, squadNumber }]);
      // Remove from substitutes if present
      setSubstitutes(substitutes.filter(s => s.playerId !== playerId));
    }
  };

  const handleRemoveStartingPlayer = (playerId: string) => {
    setStartingPlayers(startingPlayers.filter(p => p.playerId !== playerId));
    // Clear captain if removed player was captain
    if (captainId === playerId) {
      setCaptainId('');
    }
  };

  const handleAddSubstitute = (playerId: string) => {
    if (!substitutes.find(s => s.playerId === playerId) && !startingPlayers.find(p => p.playerId === playerId)) {
      // Get default squad number from team assignment
      const squadNumber = getPlayerSquadNumber(teamId!, playerId);
      setSubstitutes([...substitutes, { playerId, squadNumber }]);
    }
  };

  const handleRemoveSubstitute = (playerId: string) => {
    setSubstitutes(substitutes.filter(s => s.playerId !== playerId));
  };

  const handleUpdateStartingPlayerSquadNumber = (playerId: string, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    setStartingPlayers(prev => 
      prev.map(p => p.playerId === playerId ? { ...p, squadNumber: numValue } : p)
    );
  };

  const handleUpdateSubstituteSquadNumber = (playerId: string, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    setSubstitutes(prev => 
      prev.map(s => s.playerId === playerId ? { ...s, squadNumber: numValue } : s)
    );
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

  const handleSetAttendanceStatus = (playerId: string, status: 'confirmed' | 'declined' | 'maybe' | 'pending') => {
    setAttendance(attendance.map(a => 
      a.playerId === playerId ? { ...a, status } : a
    ));
  };

  const handleSetAttendanceNote = (playerId: string, note: string) => {
    setAttendance(attendance.map(a => 
      a.playerId === playerId ? { ...a, notes: note || undefined } : a
    ));
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
      return;
    }
    if (startingPlayers.length === 0) {
      return;
    }
    
    const confirmComplete = window.confirm(
      'Are you sure you want to mark this match as completed? The match will be locked automatically.'
    );
    
    if (confirmComplete) {
      setIsLocked(true);
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
      }
    } else {
      const confirmLock = window.confirm(
        'Are you sure you want to lock this match? This will prevent any further edits until unlocked.'
      );
      if (confirmLock) {
        setIsLocked(true);
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
      tacticId: tacticId || undefined,
      weather,
      temperature,
      score: { home: parseInt(homeScore) || 0, away: parseInt(awayScore) || 0 },
      lineup: { formationId, tacticId: tacticId || undefined, starting: startingPlayers, substitutes, substitutions },
      report: {
        summary,
        captainId: captainId || undefined,
        goalScorers: goals,
        cards,
        injuries,
        performanceRatings: ratings,
        playerOfTheMatch
      },
      coachIds: assignedCoachIds,
      notes,
      attendance
    });
    
    navigate(Routes.matches(clubId!, ageGroupId!, teamId!));
  };

  const allPlayersInMatch = [...startingPlayers.map(p => p.playerId), ...substitutes.map(s => s.playerId)];
  const availablePlayers = teamPlayers.filter(p => !allPlayersInMatch.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">{/* Header */}
        <div className="mb-4">
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
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="card mb-4">
          <div className="flex justify-evenly sm:justify-start sm:flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
            <button
              type="button"
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
              type="button"
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
              type="button"
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
              type="button"
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
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span className="hidden sm:inline">Attendance</span>
            </button>
          </div>

          {/* Match Details Tab */}
          {activeTab === 'details' && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {squadSizes.map(size => (
                      <option key={size.value} value={size.value}>
                        {size.label}{ageGroup?.defaultSquadSize === size.value ? ' (Age Group Default)' : ''}
                      </option>
                    ))}
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
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={isLocked}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter match location or pick from map"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const searchQuery = location || 'football pitch near me';
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`, '_blank');
                      }}
                      disabled={isLocked}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      title="Open Google Maps to find location"
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="hidden sm:inline">Map</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Type the location or click Map to search on Google Maps. Copy the address and paste it here.
                  </p>
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
                  {kit && availableKits.length > 0 && (() => {
                    const selectedKit = availableKits.find(k => k.id === kit);
                    if (selectedKit) {
                      return (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Colors:</span>
                          <div className="flex items-center gap-1">
                            <div className="flex flex-col items-center">
                              <div 
                                className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: selectedKit.shirtColor }}
                                title="Shirt"
                              />
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Shirt</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div 
                                className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: selectedKit.shortsColor }}
                                title="Shorts"
                              />
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Shorts</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div 
                                className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: selectedKit.socksColor }}
                                title="Socks"
                              />
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Socks</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
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
                  {goalkeeperKit && availableKits.length > 0 && (() => {
                    const selectedGkKit = availableKits.find(k => k.id === goalkeeperKit);
                    if (selectedGkKit) {
                      return (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Colors:</span>
                          <div className="flex items-center gap-1">
                            <div className="flex flex-col items-center">
                              <div 
                                className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: selectedGkKit.shirtColor }}
                                title="Shirt"
                              />
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Shirt</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div 
                                className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: selectedGkKit.shortsColor }}
                                title="Shorts"
                              />
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Shorts</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div 
                                className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: selectedGkKit.socksColor }}
                                title="Socks"
                              />
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Socks</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
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
                    {weatherConditions.map(w => (
                      <option key={w.value} value={w.label}>{w.label}</option>
                    ))}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
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

              {/* Coaching Staff Assignment */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>👨‍🏫</span> Coaching Staff
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Coaches assigned to this match. Team coaches are automatically assigned.
                    </p>
                  </div>
                  {!isLocked && availableCoachesForMatch.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCoachModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                      title="Add Coach"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {assignedCoaches.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignedCoaches.map((coach) => {
                      const isTeamCoach = teamCoaches.some(tc => tc.id === coach.id);
                      return (
                        <div key={coach.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {coach.photo ? (
                            <img 
                              src={coach.photo} 
                              alt={`${coach.firstName} ${coach.lastName}`}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                              {coach.firstName[0]}{coach.lastName[0]}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {coach.firstName} {coach.lastName}
                            </p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                              {coachRoleDisplay[coach.role]}
                            </p>
                            {isTeamCoach && (
                              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                Team Coach
                              </span>
                            )}
                          </div>
                          {!isLocked && (
                            <button
                              type="button"
                              onClick={() => setAssignedCoachIds(assignedCoachIds.filter(id => id !== coach.id))}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Remove coach"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <span className="text-4xl mb-2 block">👨‍🏫</span>
                    <p>No coaches assigned to this match.</p>
                    {!isLocked && availableCoachesForMatch.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowCoachModal(true)}
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                        title="Add Coach"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>📝</span> Additional Notes
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Add any extra information about the match such as travel arrangements, special instructions, or other details.
                  </p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLocked}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-y"
                  placeholder="e.g., Car pooling arrangements, bring packed lunch, meet at school gates, wear appropriate footwear..."
                />
              </div>
            </div>
          )}

          {/* Team Selection Tab */}
          {activeTab === 'lineup' && (
            <div className="mt-4 space-y-4">

              {/* Two Column Layout: Players List + Formation Display */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
                {/* Left Column: Starting XI and Substitutes */}
                <div className="space-y-2">
                   {/* Formation/Tactic Selection - Merged Dropdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Formation / Tactic
                </h3>
                <div className="flex gap-2">
                  <select
                    value={getSelectionValue()}
                    onChange={(e) => handleSelectionChange(e.target.value)}
                    disabled={isLocked}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select formation or tactic</option>
                    
                    {/* Custom Tactics grouped by scope - shown first */}
                    {availableTactics.filter(t => t.scope.type === 'team').length > 0 && (
                      <optgroup label="⚽ Team Tactics">
                        {availableTactics
                          .filter(t => t.scope.type === 'team')
                          .map(t => {
                            const parentFormation = sampleFormations.find(f => f.id === t.parentFormationId);
                            return (
                              <option key={`tactic:${t.id}`} value={`tactic:${t.id}`}>
                                {t.name} {parentFormation ? `(${parentFormation.system})` : ''}
                              </option>
                            );
                          })}
                      </optgroup>
                    )}
                    
                    {availableTactics.filter(t => t.scope.type === 'ageGroup').length > 0 && (
                      <optgroup label="👥 Age Group Tactics">
                        {availableTactics
                          .filter(t => t.scope.type === 'ageGroup')
                          .map(t => {
                            const parentFormation = sampleFormations.find(f => f.id === t.parentFormationId);
                            return (
                              <option key={`tactic:${t.id}`} value={`tactic:${t.id}`}>
                                {t.name} {parentFormation ? `(${parentFormation.system})` : ''}
                              </option>
                            );
                          })}
                      </optgroup>
                    )}
                    
                    {availableTactics.filter(t => t.scope.type === 'club').length > 0 && (
                      <optgroup label="🏛️ Club Tactics">
                        {availableTactics
                          .filter(t => t.scope.type === 'club')
                          .map(t => {
                            const parentFormation = sampleFormations.find(f => f.id === t.parentFormationId);
                            return (
                              <option key={`tactic:${t.id}`} value={`tactic:${t.id}`}>
                                {t.name} {parentFormation ? `(${parentFormation.system})` : ''}
                              </option>
                            );
                          })}
                      </optgroup>
                    )}
                    
                    {/* Base Formations - shown last */}
                    <optgroup label="📐 Base Formations">
                      {availableFormations.map(f => (
                        <option key={`formation:${f.id}`} value={`formation:${f.id}`}>
                          {f.name} ({f.system})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  {selectedTactic && getTacticDetailUrl(selectedTactic) && (
                    <Link
                      target='_blank'
                      to={getTacticDetailUrl(selectedTactic)!}
                      className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      title="View tactic details"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {availableFormations.length} formations and {availableTactics.length} tactics available for {squadSize}-a-side
                </p>
              </div>

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
                      const isCaptain = captainId === player.playerId;
                      return (
                        <div key={player.playerId} className={`flex items-center justify-between p-3 rounded-lg ${isCaptain ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700' : 'bg-gray-50 dark:bg-gray-700'}`}>
                          <div className="flex items-center gap-3">
                            {isLocked ? (
                              player.squadNumber !== undefined && (
                                <span className="w-7 h-7 bg-gray-900 dark:bg-gray-100 rounded flex items-center justify-center text-white dark:text-gray-900 text-xs font-bold">
                                  {player.squadNumber}
                                </span>
                              )
                            ) : (
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={player.squadNumber ?? ''}
                                onChange={(e) => handleUpdateStartingPlayerSquadNumber(player.playerId, e.target.value)}
                                placeholder="#"
                                className="w-10 h-7 bg-gray-900 dark:bg-gray-100 rounded text-center text-white dark:text-gray-900 text-xs font-bold border-0 focus:ring-2 focus:ring-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                title="Squad number for this match (can differ from team default)"
                              />
                            )}
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
                              {isCaptain && <span className="ml-1 text-amber-500" title="Captain">©</span>}
                            </span>
                            {playerData && (
                              <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-bold" title="Overall Rating">
                                {playerData.overallRating}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!isLocked && (
                              <button
                                type="button"
                                onClick={() => setCaptainId(isCaptain ? '' : player.playerId)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${isCaptain ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'}`}
                                title={isCaptain ? 'Remove as captain' : 'Set as captain'}
                              >
                                {isCaptain ? '© Captain' : 'Captain'}
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveStartingPlayer(player.playerId)}
                              disabled={isLocked}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Remove
                            </button>
                          </div>
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
                          <div className="flex-1 flex items-center gap-2">
                            <span>{player.firstName} {player.lastName}</span>
                            <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-bold" title="Overall Rating">
                              {player.overallRating}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
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
                  {substitutes.map((sub) => {
                    const playerData = allClubPlayers.find(p => p.id === sub.playerId);
                    return (
                      <div key={sub.playerId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          {isLocked ? (
                            sub.squadNumber !== undefined && (
                              <span className="w-7 h-7 bg-gray-900 dark:bg-gray-100 rounded flex items-center justify-center text-white dark:text-gray-900 text-xs font-bold">
                                {sub.squadNumber}
                              </span>
                            )
                          ) : (
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={sub.squadNumber ?? ''}
                              onChange={(e) => handleUpdateSubstituteSquadNumber(sub.playerId, e.target.value)}
                              placeholder="#"
                              className="w-10 h-7 bg-gray-900 dark:bg-gray-100 rounded text-center text-white dark:text-gray-900 text-xs font-bold border-0 focus:ring-2 focus:ring-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              title="Squad number for this match (can differ from team default)"
                            />
                          )}
                          {playerData?.photo && (
                            <img 
                              src={playerData.photo} 
                              alt={getPlayerName(sub.playerId)}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <span className="text-gray-900 dark:text-white font-medium">
                            {getPlayerName(sub.playerId)}
                          </span>
                          {playerData && (
                            <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-bold" title="Overall Rating">
                              {playerData.overallRating}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveSubstitute(sub.playerId)}
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
                          <span>{player.firstName} {player.lastName}</span>
                          <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-bold" title="Overall Rating">
                            {player.overallRating}
                          </span>
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

                {/* Right Column: Formation/Tactic Display */}
                <div className="lg:sticky lg:top-6 lg:self-start">
                  {selectedTactic ? (
                    <>
                      {/* Tactic Display */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{selectedTactic.name}</h4>
                          <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                            {selectedTactic.scope.type === 'club' ? 'Club' : selectedTactic.scope.type === 'ageGroup' ? 'Age Group' : 'Team'} Tactic
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Based on {selectedFormation?.name} ({selectedFormation?.system})
                        </p>
                        {selectedTactic.summary && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{selectedTactic.summary}</p>
                        )}
                      </div>
                      <TacticDisplay
                        tactic={selectedTactic}
                        resolvedPositions={getResolvedPositions(selectedTactic)}
                        showDirections={true}
                        showInheritance={false}
                        selectedPlayers={startingPlayers}
                        getPlayerName={getPlayerName}
                        showPlayerNames={true}
                        interactive={!isLocked}
                        onPositionClick={handlePlayerClickForSwap}
                        highlightedPlayerIndex={selectedPlayerIndexForSwap}
                      />
                    </>
                  ) : selectedFormation ? (
                    <>
                      {/* Formation Display */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{selectedFormation.name}</h4>
                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            Base Formation
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {selectedFormation.system} • {squadSize}-a-side
                        </p>
                      </div>
                      <TacticDisplay
                        tactic={selectedFormation}
                        resolvedPositions={getResolvedPositions(selectedFormation)}
                        showDirections={false}
                        showInheritance={false}
                        selectedPlayers={startingPlayers}
                        getPlayerName={getPlayerName}
                        showPlayerNames={true}
                        interactive={!isLocked}
                        onPositionClick={handlePlayerClickForSwap}
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
                        Select a formation or tactic above to see the tactical setup
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Squad Ratings Panel - Below the grid */}
              {(() => {
                const startingPlayerIds = startingPlayers.map(p => p.playerId);
                const substitutePlayerIds = substitutes.map(s => s.playerId);
                const allSelectedIds = [...startingPlayerIds, ...substitutePlayerIds];
                
                const selectedPlayerData = allClubPlayers.filter(p => allSelectedIds.includes(p.id));
                const startingPlayerData = allClubPlayers.filter(p => startingPlayerIds.includes(p.id));
                
                if (startingPlayerData.length === 0) return null;
                
                const startingRatings = calculateTeamRatings(startingPlayerData);
                const squadRatings = calculateTeamRatings(selectedPlayerData);
                
                // Calculate average attributes for the starting XI
                const calculateAverageAttributes = (players: typeof startingPlayerData) => {
                  if (players.length === 0) return null;
                  
                  const totals: Record<string, number> = {};
                  players.forEach(player => {
                    const grouped = groupAttributes(player.attributes);
                    [...grouped.skills, ...grouped.physical, ...grouped.mental].forEach(attr => {
                      totals[attr.name] = (totals[attr.name] || 0) + attr.rating;
                    });
                  });
                  
                  const averages: Record<string, number> = {};
                  Object.entries(totals).forEach(([name, total]) => {
                    averages[name] = Math.round(total / players.length);
                  });
                  
                  return averages;
                };
                
                const avgAttributes = calculateAverageAttributes(startingPlayerData);
                
                const getRatingColor = (rating: number) => {
                  const quality = getAttributeQuality(rating);
                  switch (quality) {
                    case 'Excellent': return 'text-green-600 dark:text-green-400';
                    case 'Very Good': return 'text-blue-600 dark:text-blue-400';
                    case 'Good': return 'text-cyan-600 dark:text-cyan-400';
                    case 'Fair': return 'text-yellow-600 dark:text-yellow-400';
                    case 'Poor': return 'text-orange-600 dark:text-orange-400';
                    default: return 'text-red-600 dark:text-red-400';
                  }
                };

                const getRatingBgColor = (rating: number) => {
                  const quality = getAttributeQuality(rating);
                  switch (quality) {
                    case 'Excellent': return 'bg-green-100 dark:bg-green-900/30';
                    case 'Very Good': return 'bg-blue-100 dark:bg-blue-900/30';
                    case 'Good': return 'bg-cyan-100 dark:bg-cyan-900/30';
                    case 'Fair': return 'bg-yellow-100 dark:bg-yellow-900/30';
                    case 'Poor': return 'bg-orange-100 dark:bg-orange-900/30';
                    default: return 'bg-red-100 dark:bg-red-900/30';
                  }
                };

                const getOverallBgColor = (rating: number) => {
                  const quality = getAttributeQuality(rating);
                  switch (quality) {
                    case 'Excellent': return 'bg-green-600';
                    case 'Very Good': return 'bg-blue-600';
                    case 'Good': return 'bg-cyan-600';
                    case 'Fair': return 'bg-yellow-500';
                    case 'Poor': return 'bg-orange-500';
                    default: return 'bg-red-500';
                  }
                };
                
                // Group attributes by category
                const skillsAttrs = ['Ball Control', 'Crossing', 'Weak Foot', 'Dribbling', 'Finishing', 'Free Kick', 'Heading', 'Long Passing', 'Long Shot', 'Penalties', 'Short Passing', 'Shot Power', 'Sliding Tackle', 'Standing Tackle', 'Volleys'];
                const physicalAttrs = ['Acceleration', 'Agility', 'Balance', 'Jumping', 'Pace', 'Reactions', 'Sprint Speed', 'Stamina', 'Strength'];
                const mentalAttrs = ['Aggression', 'Attacking Position', 'Awareness', 'Communication', 'Composure', 'Defensive Positioning', 'Interceptions', 'Marking', 'Positivity', 'Positioning', 'Vision'];

                return (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    {/* Header with Overall Ratings */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📊</span>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Squad Ratings</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {startingPlayerData.length} starting{substitutes.length > 0 ? ` • ${selectedPlayerData.length} total` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-center">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl ${getOverallBgColor(startingRatings.overall)}`}>
                            {startingRatings.overall}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall</p>
                        </div>
                        <div className="text-center">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getRatingColor(startingRatings.skills)} ${getRatingBgColor(startingRatings.skills)}`}>
                            {startingRatings.skills}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Skills</p>
                        </div>
                        <div className="text-center">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getRatingColor(startingRatings.physical)} ${getRatingBgColor(startingRatings.physical)}`}>
                            {startingRatings.physical}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Physical</p>
                        </div>
                        <div className="text-center">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getRatingColor(startingRatings.mental)} ${getRatingBgColor(startingRatings.mental)}`}>
                            {startingRatings.mental}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mental</p>
                        </div>
                      </div>
                    </div>

                    {/* Attributes Table */}
                    {avgAttributes && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {/* Skills Column */}
                        <div>
                          <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 pb-1 border-b border-gray-200 dark:border-gray-600">
                            ⚽ Skills
                          </h5>
                          <div className="space-y-1">
                            {skillsAttrs.map(attr => {
                              const rating = avgAttributes[attr] || 0;
                              return (
                                <div key={attr} className="flex justify-between items-center">
                                  <span className="text-gray-600 dark:text-gray-400 truncate pr-2">{attr}</span>
                                  <span className={`font-semibold ${getRatingColor(rating)}`}>{rating}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Physical Column */}
                        <div>
                          <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 pb-1 border-b border-gray-200 dark:border-gray-600">
                            🏋️ Physical
                          </h5>
                          <div className="space-y-1">
                            {physicalAttrs.map(attr => {
                              const rating = avgAttributes[attr] || 0;
                              return (
                                <div key={attr} className="flex justify-between items-center">
                                  <span className="text-gray-600 dark:text-gray-400 truncate pr-2">{attr}</span>
                                  <span className={`font-semibold ${getRatingColor(rating)}`}>{rating}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Mental Column */}
                        <div>
                          <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 pb-1 border-b border-gray-200 dark:border-gray-600">
                            🧠 Mental
                          </h5>
                          <div className="space-y-1">
                            {mentalAttrs.map(attr => {
                              const rating = avgAttributes[attr] || 0;
                              return (
                                <div key={attr} className="flex justify-between items-center">
                                  <span className="text-gray-600 dark:text-gray-400 truncate pr-2">{attr}</span>
                                  <span className={`font-semibold ${getRatingColor(rating)}`}>{rating}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Full Squad Summary (if subs) */}
                    {substitutes.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Full Squad ({squadRatings.playerCount})</span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`font-semibold ${getRatingColor(squadRatings.overall)}`}>{squadRatings.overall} OVR</span>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span className={`${getRatingColor(squadRatings.skills)}`}>{squadRatings.skills} SKL</span>
                            <span className={`${getRatingColor(squadRatings.physical)}`}>{squadRatings.physical} PHY</span>
                            <span className={`${getRatingColor(squadRatings.mental)}`}>{squadRatings.mental} MEN</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Match Events Tab */}
          {activeTab === 'events' && (
            <div className="mt-4 space-y-2">
              {/* Goals */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Goals ⚽
                </h3>
                <div className="space-y-2 mb-4">
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
                <div className="space-y-2 mb-4">
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
                            {cardTypes.map(ct => (
                              <option key={ct.value} value={ct.value}>{ct.label}</option>
                            ))}
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
                <div className="space-y-2 mb-4">
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
                            {injurySeverities.map(sev => (
                              <option key={sev.value} value={sev.value}>{sev.label}</option>
                            ))}
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
                <div className="space-y-2 mb-4">
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
                            {substitutes.map(sub => (
                              <option key={sub.playerId} value={sub.playerId}>
                                {getPlayerName(sub.playerId)}
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
            <div className="mt-4 space-y-2">
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
                <div className="space-y-2">
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

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="mt-4 space-y-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>📋</span> Player Attendance
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Track player availability for this match
                </p>
              </div>

              <div className="space-y-2">
                {teamPlayers.map((player) => {
                  const playerAttendance = attendance.find(a => a.playerId === player.id);
                  const status = playerAttendance?.status || 'pending';
                  
                  const getStatusColor = (s: string) => {
                    switch (s) {
                      case 'confirmed': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
                      case 'declined': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
                      case 'maybe': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
                      default: return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
                    }
                  };
                  
                  const getStatusIcon = (s: string) => {
                    switch (s) {
                      case 'confirmed': return '✓';
                      case 'declined': return '✕';
                      case 'maybe': return '?';
                      default: return '•';
                    }
                  };
                  
                  const getStatusButtonColor = (s: string, isActive: boolean) => {
                    if (!isActive) return 'bg-gray-200 dark:bg-gray-600 text-gray-400';
                    switch (s) {
                      case 'confirmed': return 'bg-green-600 text-white';
                      case 'declined': return 'bg-red-600 text-white';
                      case 'maybe': return 'bg-yellow-500 text-white';
                      default: return 'bg-gray-400 text-white';
                    }
                  };
                  
                  return (
                    <div 
                      key={player.id} 
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition-colors ${getStatusColor(status)}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${getStatusButtonColor(status, true)}`}>
                          {getStatusIcon(status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {player.preferredPositions?.[0] || 'Position not set'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                          <button
                            type="button"
                            onClick={() => handleSetAttendanceStatus(player.id, 'confirmed')}
                            disabled={isLocked}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                              status === 'confirmed' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Confirmed"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetAttendanceStatus(player.id, 'maybe')}
                            disabled={isLocked}
                            className={`px-3 py-1.5 text-sm font-medium border-l border-r border-gray-300 dark:border-gray-600 transition-colors ${
                              status === 'maybe' 
                                ? 'bg-yellow-500 text-white' 
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Maybe"
                          >
                            ?
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetAttendanceStatus(player.id, 'declined')}
                            disabled={isLocked}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                              status === 'declined' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Declined"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          value={playerAttendance?.notes || ''}
                          onChange={(e) => handleSetAttendanceNote(player.id, e.target.value)}
                          disabled={isLocked}
                          className="w-32 sm:w-48 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="Notes (optional)"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                      <span className="font-medium">{attendance.filter(a => a.status === 'confirmed').length}</span> Confirmed
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      <span className="font-medium">{attendance.filter(a => a.status === 'maybe').length}</span> Maybe
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                      <span className="font-medium">{attendance.filter(a => a.status === 'declined').length}</span> Declined
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                      <span className="font-medium">{attendance.filter(a => a.status === 'pending').length}</span> Pending
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

        {isLocked && (
            <div className="mt-4 pt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                🔒 This match is locked. Unlock it to make changes.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              {/* Left side - Match-specific controls */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                {isEditing && (
                  <>
                    {!isLocked && existingMatch?.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={handleCompleteMatch}
                        disabled={!homeScore || !awayScore || startingPlayers.length === 0}
                        className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!homeScore || !awayScore ? 'Enter match score to complete' : startingPlayers.length === 0 ? 'Add starting players to complete' : 'Mark match as completed'}
                      >
                        ✓ Complete Match
                      </button>
                    )}
                    <button
                      type="button"
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
              
              {/* Right side - Standard form actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate(Routes.matches(clubId!, ageGroupId!, teamId!))}
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLocked}
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                >
                  {isEditing ? 'Save Changes' : 'Create Match'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Coach Selection Modal */}
      {showCoachModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Coach from Age Group</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{availableCoachesForMatch.length} coaches available</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCoachModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {availableCoachesForMatch.length > 0 ? (
                <div className="space-y-2">
                  {availableCoachesForMatch.map((coach) => {
                    // Get the teams this coach is assigned to
                    const coachTeams = sampleTeams.filter(t => coach.teamIds.includes(t.id) && t.ageGroupId === ageGroup?.id);
                    return (
                      <button
                        key={coach.id}
                        type="button"
                        onClick={() => {
                          setAssignedCoachIds([...assignedCoachIds, coach.id]);
                          setShowCoachModal(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        {coach.photo ? (
                          <img 
                            src={coach.photo} 
                            alt={`${coach.firstName} ${coach.lastName}`}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {coach.firstName[0]}{coach.lastName[0]}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {coach.firstName} {coach.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {coachRoleDisplay[coach.role]}
                            {coachTeams.length > 0 && (
                              <span className="ml-2 text-xs">
                                ({coachTeams.map(t => t.name).join(', ')})
                              </span>
                            )}
                          </p>
                        </div>
                        <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  All coaches from this age group have been assigned.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cross-Team Player Selection Modal */}
      {showCrossTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
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
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              <span>{player.firstName} {player.lastName}</span>
                              <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-bold" title="Overall Rating">
                                {player.overallRating}
                              </span>
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
