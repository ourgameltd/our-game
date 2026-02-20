import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ClipboardList, Users, Activity, FileText, Lock, Unlock, Plus, MapPin, X, ExternalLink, CheckSquare } from 'lucide-react';
import { getResolvedPositions } from '@/data/tactics';
import { weatherConditions, squadSizes, cardTypes, injurySeverities } from '@/constants/referenceData';
import { coachRoleDisplay } from '@/constants/coachRoleDisplay';
import { PlayerPosition, SquadSize, Tactic } from '@/types';
import { Routes } from '@utils/routes';
import TacticDisplay from '@/components/tactics/TacticDisplay';
import { useMatch, useTeamPlayers, useTeamCoaches, useTacticsByScope, useTeamOverview, useAgeGroupById } from '@/api/hooks';
import { apiClient, CreateMatchRequest, UpdateMatchRequest } from '@/api/client';
import { sampleFormations, getFormationsBySquadSize } from '@/data/formations';

export default function AddEditMatchPage() {
  const { clubId, ageGroupId, teamId, matchId } = useParams();
  const navigate = useNavigate();
  const isEditing = matchId && matchId !== 'new';

  // Fetch data from API
  const { data: team, isLoading: teamLoading, error: teamError } = useTeamOverview(teamId);
  const { data: ageGroup, isLoading: ageGroupLoading } = useAgeGroupById(ageGroupId);
  const { data: existingMatch, isLoading: matchLoading } = useMatch(isEditing ? matchId : undefined);
  const { data: teamPlayers = [], isLoading: playersLoading } = useTeamPlayers(teamId);
  const { data: teamCoaches = [], isLoading: coachesLoading } = useTeamCoaches(teamId);
  const { data: tacticsData, isLoading: tacticsLoading } = useTacticsByScope(clubId, ageGroupId, teamId);
  
  // Get available seasons from age group
  const availableSeasons = ageGroup?.seasons || [];
  const defaultSeason = ageGroup?.defaultSeason || '';

  // Get available kits - not available from API yet, using defaults
  const availableKits: any[] = [];

  // Get all club players (for cross-team selection) - for now using teamPlayers
  // TODO: Add useClubPlayers hook when available
  const allClubPlayers = teamPlayers || [];

  // Loading and error states
  const isLoading = teamLoading || ageGroupLoading || (isEditing && matchLoading) || playersLoading || coachesLoading || tacticsLoading;
  const hasError = teamError;

  // Form initialization state - CRITICAL: Must be called before any conditional returns
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const currentMatchIdRef = useRef<string | undefined>(matchId);
  const currentTeamIdRef = useRef<string | undefined>(teamId);

  // Form state - CRITICAL: All useState must be called before any conditional returns
  const [seasonId, setSeasonId] = useState('');
  const [squadSize, setSquadSize] = useState<SquadSize>(11);
  const [opposition, setOpposition] = useState('');
  const [kickOffTime, setKickOffTime] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [location, setLocation] = useState('');
  const [isHome, setIsHome] = useState(true);
  const [competition, setCompetition] = useState('');
  const [kit, setKit] = useState('');
  const [goalkeeperKit, setGoalkeeperKit] = useState('');
  const [formationId, setFormationId] = useState('');
  const [tacticId, setTacticId] = useState('');
  const [weather, setWeather] = useState('');
  const [temperature, setTemperature] = useState('');
  
  // Match result state
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [summary, setSummary] = useState('');
  
  // Lineup state - derive from MatchDetailDto.lineup.players (LineupPlayerDto[])
  const [startingPlayers, setStartingPlayers] = useState<{ playerId: string; position: PlayerPosition; squadNumber?: number }[]>([]);
  const [substitutes, setSubstitutes] = useState<{ playerId: string; squadNumber?: number }[]>([]);
  const [substitutions, setSubstitutions] = useState<{ minute: number; playerOut: string; playerIn: string }[]>([]);
  
  // Match events state
  const [goals, setGoals] = useState<{ playerId: string; minute: number; assist?: string }[]>([]);
  const [cards, setCards] = useState<{ playerId: string; type: 'yellow' | 'red'; minute: number; reason?: string }[]>([]);
  const [injuries, setInjuries] = useState<{ playerId: string; minute: number; description: string; severity: 'minor' | 'moderate' | 'serious' }[]>([]);
  const [ratings, setRatings] = useState<{ playerId: string; rating: number }[]>([]);
  const [playerOfTheMatch, setPlayerOfTheMatch] = useState('');
  const [captainId, setCaptainId] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Coach assignment state - filter out undefined IDs from TeamCoachDto
  const [assignedCoachIds, setAssignedCoachIds] = useState<string[]>([]);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Attendance state - derive from team players, not from DTO (attendance not in MatchDetailDto)
  const [attendance, setAttendance] = useState<{ playerId: string; status: 'confirmed' | 'declined' | 'maybe' | 'pending'; notes?: string }[]>([]);

  const [activeTab, setActiveTab] = useState<'details' | 'lineup' | 'events' | 'report' | 'attendance'>('details');
  
  // Position swap state - tracks the array index in startingPlayers for precise swapping
  const [selectedPlayerIndexForSwap, setSelectedPlayerIndexForSwap] = useState<number | null>(null);
  
  // Cross-team player selection modal
  const [showCrossTeamModal, setShowCrossTeamModal] = useState(false);
  const [crossTeamModalType, setCrossTeamModalType] = useState<'starting' | 'substitute'>('starting');
  
  // Modal filters
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalAgeGroupFilter, setModalAgeGroupFilter] = useState<string>('all');
  const [modalTeamFilter, setModalTeamFilter] = useState<string>('all');

  // Initialize form when data loads or when navigating to a different match
  useEffect(() => {
    // Check if route parameters changed
    const routeChanged = currentMatchIdRef.current !== matchId || currentTeamIdRef.current !== teamId;
    if (routeChanged) {
      // Reset initialization flag when route changes
      setIsFormInitialized(false);
      currentMatchIdRef.current = matchId;
      currentTeamIdRef.current = teamId;
    }

    // Only initialize if not loading, not already initialized, and we have the necessary data
    if (isLoading || isFormInitialized) return;
    
    // For editing: wait for existingMatch data
    if (isEditing && !existingMatch) return;
    
    // For new match: wait for ageGroup data
    if (!isEditing && !ageGroup) return;

    // Initialize form fields from existingMatch (when editing) or defaults (when adding)
    if (isEditing && existingMatch) {
      setSeasonId(existingMatch.seasonId || defaultSeason);
      setSquadSize((existingMatch.squadSize || ageGroup?.defaultSquadSize || 11) as SquadSize);
      setOpposition(existingMatch.opposition || '');
      setKickOffTime(
        existingMatch.kickOffTime ? existingMatch.kickOffTime.slice(0, 16) : 
        existingMatch.matchDate ? existingMatch.matchDate.slice(0, 16) : ''
      );
      setMeetTime(existingMatch.meetTime ? existingMatch.meetTime.slice(0, 16) : '');
      setLocation(existingMatch.location || '');
      setIsHome(existingMatch.isHome ?? true);
      setCompetition(existingMatch.competition || '');
      setKit(existingMatch.primaryKitId?.toString() || '');
      setGoalkeeperKit(existingMatch.secondaryKitId?.toString() || '');
      setFormationId(existingMatch.lineup?.formationId || '');
      setTacticId(existingMatch.lineup?.tacticId || '');
      setWeather(existingMatch.weatherCondition || '');
      setTemperature(existingMatch.weatherTemperature?.toString() || '');
      setHomeScore(existingMatch.homeScore?.toString() || '');
      setAwayScore(existingMatch.awayScore?.toString() || '');
      setSummary(existingMatch.report?.summary || '');
      setStartingPlayers(
        existingMatch.lineup?.players?.filter(p => p.isStarting).map(p => ({
          playerId: p.playerId,
          position: p.position as PlayerPosition,
          squadNumber: p.squadNumber
        })) || []
      );
      setSubstitutes(
        existingMatch.lineup?.players?.filter(p => !p.isStarting).map(p => ({
          playerId: p.playerId,
          squadNumber: p.squadNumber
        })) || []
      );
      setSubstitutions(
        (existingMatch.substitutions || []).map(s => ({
          minute: s.minute,
          playerOut: s.playerOutId,
          playerIn: s.playerInId
        }))
      );
      setGoals(existingMatch.report?.goals || []);
      setCards(
        (existingMatch.report?.cards || []).map(c => ({ 
          ...c, 
          type: (c.type === 'yellow' || c.type === 'red' ? c.type : 'yellow') as 'yellow' | 'red' 
        }))
      );
      setInjuries(
        (existingMatch.report?.injuries || []).map(i => ({
          playerId: i.playerId,
          minute: i.minute,
          description: i.description || '',
          severity: (['minor', 'moderate', 'serious'].includes(i.severity) ? i.severity : 'minor') as 'minor' | 'moderate' | 'serious'
        }))
      );
      setRatings(
        (existingMatch.report?.performanceRatings || []).map(r => ({ ...r, rating: r.rating || 0 }))
      );
      setPlayerOfTheMatch(existingMatch.report?.playerOfMatchId || '');
      setCaptainId(existingMatch.report?.captainId || '');
      setIsLocked(existingMatch.isLocked || false);
      setNotes(existingMatch.notes || '');
      setAssignedCoachIds(
        (existingMatch.coaches || []).map(c => c.id).filter((id): id is string => id !== undefined)
      );
    } else {
      // New match - set defaults
      setSeasonId(defaultSeason);
      setSquadSize((ageGroup?.defaultSquadSize || 11) as SquadSize);
      setOpposition('');
      setKickOffTime('');
      setMeetTime('');
      setLocation('');
      setIsHome(true);
      setCompetition('');
      setKit('');
      setGoalkeeperKit('');
      setFormationId('');
      setTacticId('');
      setWeather('');
      setTemperature('');
      setHomeScore('');
      setAwayScore('');
      setSummary('');
      setStartingPlayers([]);
      setSubstitutes([]);
      setSubstitutions([]);
      setGoals([]);
      setCards([]);
      setInjuries([]);
      setRatings([]);
      setPlayerOfTheMatch('');
      setCaptainId('');
      setIsLocked(false);
      setNotes('');
      setAssignedCoachIds([]);
    }

    // Initialize attendance from team players
    if (teamPlayers && teamPlayers.length > 0) {
      setAttendance(teamPlayers.map(p => ({ playerId: p.id, status: 'pending' as const })));
    }

    setIsFormInitialized(true);
  }, [isLoading, isFormInitialized, isEditing, existingMatch, ageGroup, defaultSeason, teamPlayers, matchId, teamId]);

  // Auto-assign team coaches for new matches
  useEffect(() => {
    // Only run if form is initialized to avoid running during initial loading
    if (!isFormInitialized) return;
    if (!isEditing && teamCoaches && teamCoaches.length > 0 && assignedCoachIds.length === 0) {
      setAssignedCoachIds(teamCoaches.map(c => c.id).filter((id): id is string => id !== undefined));
    }
  }, [isFormInitialized, isEditing, teamCoaches, assignedCoachIds.length]);

  // NOW we can safely do conditional returns - all hooks have been called
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
              Error Loading Data
            </h2>
            <p className="text-red-700 dark:text-red-400 mb-4">
              {hasError.message || String(hasError)}
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

  if (isLoading || !isFormInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!team) {
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
  
  // Get formations filtered by squad size
  const availableFormations = getFormationsBySquadSize(squadSize);
  
  // Get tactics available for this team (including inherited from club and age group)
  const getAvailableTactics = (): Tactic[] => {
    if (!tacticsData) return [];
    
    const allTactics = [...(tacticsData.scopeTactics || []), ...(tacticsData.inheritedTactics || [])];
    const filtered = allTactics.filter(tactic => {
      // Must match squad size - validate TacticListDto.squadSize (number) as SquadSize
      const validSquadSizes: SquadSize[] = [4, 5, 7, 9, 11];
      const isValidSquadSize = validSquadSizes.includes(tactic.squadSize as SquadSize);
      if (!isValidSquadSize || tactic.squadSize !== squadSize) return false;
      return true;
    });
    // Cast TacticListDto[] to Tactic[] - they're compatible except for squadSize type
    return filtered as any as Tactic[];
  };
  
  const availableTactics = getAvailableTactics();
  const selectedTactic = tacticId ? availableTactics.find(t => t.id === tacticId) : null;
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
      const tactic = availableTactics.find(t => t.id === id);
      if (tactic) {
        setTacticId(id);
        setFormationId(tactic.parentFormationId || '');
      }
    } else if (type === 'formation') {
      setFormationId(id);
      setTacticId('');
    }
  };
  
  // Get coaches that can be added (assigned coaches from API) - filter out undefined IDs
  const availableCoachesForMatch = (teamCoaches || []).filter(
    coach => coach.id !== undefined && !assignedCoachIds.includes(coach.id)
  );
  
  // Get assigned coach details - filter out coaches with undefined IDs
  const assignedCoaches = (teamCoaches || []).filter(coach => coach.id !== undefined && assignedCoachIds.includes(coach.id));


  const getPlayerName = (playerId: string) => {
    const player = (teamPlayers || []).find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown';
  };
  
  const getPlayerSquadNumber = (playerId: string): number | undefined => {
    const player = (teamPlayers || []).find(p => p.id === playerId);
    return player?.squadNumber;
  };

  const handleAddStartingPlayer = (playerId: string, position: PlayerPosition) => {
    if (!startingPlayers.find(p => p.playerId === playerId)) {
      // Get squad number from player data
      const squadNumber = getPlayerSquadNumber(playerId);
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
      // Get squad number from player data
      const squadNumber = getPlayerSquadNumber(playerId);
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

  const handleSave = async () => {
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

    try {
      setIsSaving(true);
      
      const matchData: CreateMatchRequest | UpdateMatchRequest = {
        teamId: teamId!,
        seasonId: seasonId || defaultSeason,
        squadSize,
        opposition,
        matchDate: new Date(kickOffTime).toISOString(),
        kickOffTime: new Date(kickOffTime).toISOString(),
        meetTime: meetTime ? new Date(meetTime).toISOString() : undefined,
        location,
        isHome,
        competition,
        primaryKitId: kit || undefined,
        secondaryKitId: goalkeeperKit || undefined,
        homeScore: homeScore ? parseInt(homeScore) : undefined,
        awayScore: awayScore ? parseInt(awayScore) : undefined,
        status: existingMatch?.status || 'scheduled',
        weatherCondition: weather || undefined,
        weatherTemperature: temperature ? parseFloat(temperature) : undefined,
        lineup: {
          formationId: formationId || undefined,
          tacticId: tacticId || undefined,
          players: [
            ...startingPlayers.map(p => ({ 
              playerId: p.playerId, 
              position: p.position, 
              squadNumber: p.squadNumber, 
              isStarting: true 
            })), 
            ...substitutes.map(s => ({ 
              playerId: s.playerId, 
              position: undefined, 
              squadNumber: s.squadNumber, 
              isStarting: false 
            }))
          ]
        },
        report: {
          summary: summary || undefined,
          captainId: captainId || undefined,
          playerOfMatchId: playerOfTheMatch || undefined,
          goals: goals,
          cards,
          injuries,
          performanceRatings: ratings
        },
        coachIds: assignedCoachIds,
        substitutions: substitutions.map(s => ({
          minute: s.minute,
          playerOutId: s.playerOut,
          playerInId: s.playerIn
        })),
        notes: notes || undefined
      };

      if (isEditing) {
        await apiClient.matches.update(matchId!, matchData as any as UpdateMatchRequest);
      } else {
        await apiClient.matches.create(matchData as any as CreateMatchRequest);
      }
      
      navigate(Routes.matches(clubId!, ageGroupId!, teamId!));
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Failed to save match. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const allPlayersInMatch = [...startingPlayers.map(p => p.playerId), ...substitutes.map(s => s.playerId)];
  const availablePlayers = (teamPlayers ?? []).filter(p => !allPlayersInMatch.includes(p.id));

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
                {team.team.name}
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
                        {availableKits.map((k: any) => (
                          <option key={k.id} value={k.id}>{k.name}</option>
                        ))}
                      </>
                    )}
                  </select>
                  {availableKits.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      No custom kits defined. Using default kits.
                    </p>
                  )}
                  {kit && availableKits.length > 0 && (() => {
                    const selectedKit = availableKits.find((k: any) => k.id === kit);
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
                    {availableKits.length > 0 ? (
                      availableKits.map((k: any) => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                      ))
                    ) : (
                      <option value="gk-default">Default Goalkeeper Kit</option>
                    )}
                  </select>
                  {goalkeeperKit && availableKits.length > 0 && (() => {
                    const selectedGkKit = availableKits.find((k: any) => k.id === goalkeeperKit);
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
                      const isTeamCoach = (teamCoaches || []).some(tc => tc.id === coach.id);
                      return (
                        <div key={coach.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {coach.photoUrl ? (
                            <img 
                              src={coach.photoUrl} 
                              alt={`${coach.firstName || ''} ${coach.lastName || ''}`}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                              {(coach.firstName || '?')[0]}{(coach.lastName || '?')[0]}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {coach.firstName || ''} {coach.lastName || ''}
                            </p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                              {coach.role ? coachRoleDisplay[coach.role] : 'Coach'}
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
                            {playerData?.photoUrl && (
                              <img 
                                src={playerData.photoUrl} 
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
                            const position = (player.preferredPositions?.[0] || 'CM') as PlayerPosition;
                            handleAddStartingPlayer(player.id, position);
                          }}
                          className="text-left px-3 py-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white flex items-center gap-2"
                        >
                          {player.photoUrl && (
                            <img 
                              src={player.photoUrl} 
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
                              ({player.preferredPositions?.join(', ') || 'N/A'})
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
                          {playerData?.photoUrl && (
                            <img 
                              src={playerData.photoUrl} 
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
                          {player.photoUrl && (
                            <img 
                              src={player.photoUrl} 
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
              {/* Disabled: TeamPlayerDto doesn't include attributes/overallRating needed for rating calculations */}
              {/* TODO: Enable when full player data with attributes is available */}
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
                {(teamPlayers || []).map((player) => {
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
                  disabled={isLocked || isSaving}
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                >
                  {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Match'}
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
                    return (
                      <button
                        key={coach.id}
                        type="button"
                        onClick={() => {
                          if (coach.id) {
                            setAssignedCoachIds([...assignedCoachIds, coach.id]);
                            setShowCoachModal(false);
                          }
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        {coach.photoUrl ? (
                          <img 
                            src={coach.photoUrl} 
                            alt={`${coach.firstName || ''} ${coach.lastName || ''}`}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {(coach.firstName || '?')[0]}{(coach.lastName || '?')[0]}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {coach.firstName || ''} {coach.lastName || ''}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {coach.role ? coachRoleDisplay[coach.role] : 'Coach'}
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
                    {/* TODO: Add age groups when useClubAgeGroups() hook is available */}
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
                    {/* TODO: Add team filter when useClubTeams() hook is available */}
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
                    
                    // Age group filter - skip (ageGroupIds not in TeamPlayerDto)
                    // Team filter - skip (teamIds not in TeamPlayerDto)
                    
                    return true;
                  })
                  .map((player) => {
                    // TODO: Show team names when useClubTeams() hook is available
                    const teamNames = team?.team?.name || 'Team';
                    
                    return (
                      <div key={player.id} className="relative">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-3">
                          {player.photoUrl ? (
                            <img 
                              src={player.photoUrl} 
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
                              {(player.preferredPositions || []).slice(0, 3).map((pos: string) => (
                                <span key={pos} className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                  {pos}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const position = ((player.preferredPositions || [])[0] || 'CM') as PlayerPosition;
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
