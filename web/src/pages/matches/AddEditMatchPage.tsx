import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ClipboardList, Users, Activity, FileText, Plus, MapPin, X, ExternalLink, CheckSquare } from 'lucide-react';
import { Timeline, TimelineItem, TimelineHeader, TimelineIcon, TimelineBody } from '@material-tailwind/react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import StyleIcon from '@mui/icons-material/Style';
import HealingIcon from '@mui/icons-material/Healing';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { getResolvedPositions, ResolvedPosition } from '@/data/tactics';
import { weatherConditions, squadSizes, cardTypes, injurySeverities } from '@/constants/referenceData';
import { coachRoleDisplay } from '@/constants/coachRoleDisplay';
import { Formation, FormationScope, PlayerDirection, PlayerPosition, SquadSize, Tactic, TacticalPositionOverride, TacticPrinciple } from '@/types';
import { Routes } from '@utils/routes';
import TacticDisplay from '@/components/tactics/TacticDisplay';
import { useMatch, useTeamPlayers, useTeamCoaches, useTacticsByScope, useTeamOverview, useAgeGroupById, useTeamKits, useClubKits, useSystemFormations, useCreateMatch, useUpdateMatch, useTactic } from '@/api/hooks';
import { CreateMatchRequest, ResolvedPositionDto, SystemFormationDto, TacticListDto, UpdateMatchRequest } from '@/api/client';
import { usePageTitle } from '@/hooks/usePageTitle';

const supportedSquadSizes: SquadSize[] = [4, 5, 7, 9, 11];

function isSupportedSquadSize(value: number): value is SquadSize {
  return supportedSquadSizes.includes(value as SquadSize);
}

// Match edit displays defenders at the top and attackers at the bottom,
// so mirror horizontal coordinates to keep left/right position labels intuitive.
function mirrorPitchXForMatchEdit(x: number): number {
  const safeX = Number.isFinite(x) ? x : 50;
  const clampedX = Math.max(0, Math.min(100, safeX));
  return 100 - clampedX;
}

function mapSystemFormationToFormation(dto: SystemFormationDto): Formation | null {
  if (!dto.id || !dto.name || !isSupportedSquadSize(dto.squadSize) || dto.positions.length === 0) {
    return null;
  }

  return {
    id: dto.id,
    name: dto.name,
    system: dto.system,
    squadSize: dto.squadSize,
    summary: dto.summary,
    tags: dto.tags,
    positions: dto.positions.map(position => ({
      position: position.position as PlayerPosition,
      x: mirrorPitchXForMatchEdit(position.x),
      y: position.y,
      direction: position.direction as PlayerDirection | undefined,
    })),
    isSystemFormation: true,
    scope: { type: 'system' },
  };
}

function mapResolvedPositionDtos(dtos: ResolvedPositionDto[]): ResolvedPosition[] {
  return dtos.map((dto, index) => ({
    positionId: dto.positionId || `resolved-position-${dto.positionIndex ?? index}`,
    positionIndex: dto.positionIndex ?? index,
    position: dto.position as PlayerPosition,
    x: mirrorPitchXForMatchEdit(dto.x),
    y: dto.y,
    direction: dto.direction as PlayerDirection | undefined,
    sourceFormationId: dto.sourceFormationId || '',
    overriddenBy: dto.overriddenBy || [],
  }));
}

function mapTacticScope(scope: TacticListDto['scope']): FormationScope {
  if (scope.type === 'team' && scope.teamId && scope.ageGroupId && scope.clubId) {
    return { type: 'team', clubId: scope.clubId, ageGroupId: scope.ageGroupId, teamId: scope.teamId };
  }

  if (scope.type === 'ageGroup' && scope.ageGroupId && scope.clubId) {
    return { type: 'ageGroup', clubId: scope.clubId, ageGroupId: scope.ageGroupId };
  }

  return { type: 'club', clubId: scope.clubId || '' };
}

function mapTacticListDtoToTactic(dto: TacticListDto): Tactic {
  const positionOverrides: Record<number, TacticalPositionOverride> = {};

  for (const override of dto.positionOverrides || []) {
    const mappedOverride: TacticalPositionOverride = {};

    if (override.xCoord !== undefined) mappedOverride.x = mirrorPitchXForMatchEdit(override.xCoord);
    if (override.yCoord !== undefined) mappedOverride.y = override.yCoord;
    if (override.direction) mappedOverride.direction = override.direction as PlayerDirection;

    positionOverrides[override.positionIndex] = mappedOverride;
  }

  const principles: TacticPrinciple[] = (dto.principles || []).map(principle => ({
    id: principle.id,
    title: principle.title,
    description: principle.description || '',
    positionIndices: principle.positionIndices,
  }));

  return {
    id: dto.id,
    name: dto.name,
    system: dto.system,
    squadSize: dto.squadSize as SquadSize,
    parentFormationId: dto.parentFormationId,
    parentTacticId: dto.parentTacticId,
    positionOverrides,
    principles,
    summary: dto.summary,
    style: dto.style,
    tags: dto.tags,
    scope: mapTacticScope(dto.scope),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    resolvedPositions: dto.resolvedPositions ? mapResolvedPositionDtos(dto.resolvedPositions) : undefined,
  } as Tactic;
}

type StartingLineupPlayer = {
  playerId: string;
  positionIndex: number;
  squadNumber?: number;
  positionLabel?: PlayerPosition;
};

type LineupSlot = {
  positionIndex: number;
  positionLabel?: PlayerPosition;
};

type TimelinePeriod = 'first' | 'second' | 'third' | 'etFirst' | 'etSecond' | 'penalties';

type GoalEvent = {
  playerId: string;
  minute?: number;
  period: TimelinePeriod;
  addedTimeMinutes?: number;
  isExtraTime: boolean;
  isPenalty: boolean;
  assistPlayerId?: string;
};

type CardEvent = {
  playerId: string;
  type: 'yellow' | 'red';
  minute?: number;
  period?: TimelinePeriod;
  addedTimeMinutes?: number;
  reason?: string;
};

type InjuryEvent = {
  playerId: string;
  minute?: number;
  period?: TimelinePeriod;
  addedTimeMinutes?: number;
  description: string;
  severity: 'minor' | 'moderate' | 'serious';
};

type SubstitutionEvent = {
  minute?: number;
  period?: TimelinePeriod;
  addedTimeMinutes?: number;
  playerOut: string;
  playerIn: string;
};

type TimelineEventType = 'goal' | 'card' | 'injury' | 'substitution';

type TimelineModalEventDraft =
  | ({ eventType: 'goal' } & GoalEvent)
  | ({ eventType: 'card' } & CardEvent)
  | ({ eventType: 'injury' } & InjuryEvent)
  | ({ eventType: 'substitution' } & SubstitutionEvent);

type TimelineModalState = {
  mode: 'create' | 'edit';
  eventType: TimelineEventType;
  index?: number;
};

const timelineSections: { period: TimelinePeriod; label: string }[] = [
  { period: 'first', label: 'First Half' },
  { period: 'second', label: 'Second Half' },
  { period: 'third', label: 'Third Period' },
  { period: 'etFirst', label: 'Extra Time First' },
  { period: 'etSecond', label: 'Extra Time Second' },
  { period: 'penalties', label: 'Penalties' },
];

function parseTimelinePeriod(value?: string): TimelinePeriod | undefined {
  if (!value) {
    return undefined;
  }

  if (timelineSections.some(section => section.period === value)) {
    return value as TimelinePeriod;
  }

  return undefined;
}

function buildLineupSlots(resolvedPositions: ResolvedPosition[], squadSize: SquadSize): LineupSlot[] {
  const lineupSlots = Array.from({ length: squadSize }, (_, index) => ({
    positionIndex: index,
    positionLabel: undefined as PlayerPosition | undefined,
  }));

  for (const resolvedPosition of resolvedPositions) {
    const positionIndex = resolvedPosition.positionIndex;

    if (positionIndex === undefined || positionIndex < 0 || positionIndex >= squadSize) {
      continue;
    }

    lineupSlots[positionIndex] = {
      positionIndex,
      positionLabel: resolvedPosition.position as PlayerPosition | undefined,
    };
  }

  return lineupSlots;
}

function resolvePositionsFromFormationAndOverrides(
  formation: Formation,
  overrides: Record<number, TacticalPositionOverride> | undefined,
  tacticId: string,
): ResolvedPosition[] {
  if (!formation.positions || formation.positions.length === 0) {
    return [];
  }

  return formation.positions.map((position, index) => {
    const override = overrides?.[index];
    const hasOverride = Boolean(override && (override.x !== undefined || override.y !== undefined || override.direction !== undefined));

    return {
      positionId: `${formation.id}:${index}`,
      positionIndex: index,
      position: position.position,
      x: override?.x ?? position.x,
      y: override?.y ?? position.y,
      direction: override?.direction ?? position.direction,
      sourceFormationId: formation.id,
      overriddenBy: hasOverride ? [tacticId] : [],
    };
  });
}

export default function AddEditMatchPage() {
  usePageTitle(['Add Edit Match']);

  const { clubId, ageGroupId, teamId, matchId } = useParams();
  const navigate = useNavigate();
  const isEditing = matchId && matchId !== 'new';

  // Fetch data from API
  const { data: team, isLoading: teamLoading, error: teamError } = useTeamOverview(teamId);
  const { data: ageGroup, isLoading: ageGroupLoading } = useAgeGroupById(ageGroupId);
  const { data: existingMatch, isLoading: matchLoading } = useMatch(isEditing ? matchId : undefined);
  const { data: teamPlayers = [], isLoading: playersLoading } = useTeamPlayers(teamId);
  const { data: teamCoaches = [], isLoading: coachesLoading } = useTeamCoaches(teamId);
  const { data: systemFormationDtos, isLoading: formationsLoading, error: formationsError } = useSystemFormations();
  const { data: tacticsData, isLoading: tacticsLoading } = useTacticsByScope(clubId, ageGroupId, teamId);
  const { data: teamKitsData, isLoading: kitsLoading } = useTeamKits(teamId);
  const { data: clubKits = [], isLoading: clubKitsLoading } = useClubKits(clubId);
  const { createMatch, isSubmitting: isCreating, error: createError } = useCreateMatch();
  const { updateMatch, isSubmitting: isUpdating, error: updateError } = useUpdateMatch(matchId || '');
  
  // Get available seasons from age group
  const availableSeasons = ageGroup?.seasons || [];
  const defaultSeason = ageGroup?.defaultSeason || '';

  const teamKits = teamKitsData?.kits || [];
  const inheritedClubKits = clubKits || [];
  const availableKits = (() => {
    const mergedKits = new Map<string, (typeof teamKits)[number]>();

    for (const source of [teamKits, inheritedClubKits]) {
      for (const currentKit of source) {
        if (!mergedKits.has(currentKit.id)) {
          mergedKits.set(currentKit.id, currentKit);
        }
      }
    }

    return Array.from(mergedKits.values());
  })();
  const availableOutfieldKits = availableKits.filter(currentKit => currentKit.type !== 'goalkeeper');
  const availableGoalkeeperKits = availableKits.filter(currentKit => currentKit.type === 'goalkeeper');

  // Get all club players (for cross-team selection) - for now using teamPlayers
  // TODO: Add useClubPlayers hook when available
  const allClubPlayers = teamPlayers || [];

  // Loading and error states
  const isLoading = teamLoading || ageGroupLoading || (isEditing && matchLoading) || playersLoading || coachesLoading || formationsLoading || tacticsLoading || kitsLoading || clubKitsLoading;
  const hasError = teamError || formationsError;
  const mutationError = createError || updateError;
  const isSaving = isCreating || isUpdating;

  const systemFormations = useMemo(
    () => (systemFormationDtos ?? [])
      .map(mapSystemFormationToFormation)
      .filter((formation): formation is Formation => formation !== null),
    [systemFormationDtos],
  );

  const formationsById = useMemo(
    () => new Map(systemFormations.map(formation => [formation.id, formation])),
    [systemFormations],
  );

  const allTactics = useMemo((): Tactic[] => {
    if (!tacticsData) {
      return [];
    }

    return [...(tacticsData.scopeTactics || []), ...(tacticsData.inheritedTactics || [])]
      .filter(tactic => {
        const validSquadSizes: SquadSize[] = [4, 5, 7, 9, 11];
        return validSquadSizes.includes(tactic.squadSize as SquadSize);
      })
      .map(mapTacticListDtoToTactic);
  }, [tacticsData]);

  const tacticsById = useMemo(
    () => new Map(allTactics.map(tactic => [tactic.id, tactic])),
    [allTactics],
  );

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
  const selectedKit = availableKits.find(currentKit => currentKit.id === kit);
  const selectedGoalkeeperKit = availableKits.find(currentKit => currentKit.id === goalkeeperKit);
  const [formationId, setFormationId] = useState('');
  const [tacticId, setTacticId] = useState('');
  const { data: selectedTacticDetail } = useTactic(tacticId || undefined);
  const [weather, setWeather] = useState('');
  const [temperature, setTemperature] = useState('');
  
  // Match result state
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [summary, setSummary] = useState('');
  
  // Lineup state - derive from MatchDetailDto.lineup.players (LineupPlayerDto[])
  const [startingPlayers, setStartingPlayers] = useState<StartingLineupPlayer[]>([]);
  const [substitutes, setSubstitutes] = useState<{ playerId: string; squadNumber?: number }[]>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionEvent[]>([]);
  
  // Match events state
  const [goals, setGoals] = useState<GoalEvent[]>([]);
  const [cards, setCards] = useState<CardEvent[]>([]);
  const [injuries, setInjuries] = useState<InjuryEvent[]>([]);
  const [isEventSpeedDialOpen, setIsEventSpeedDialOpen] = useState(false);
  const [eventModal, setEventModal] = useState<TimelineModalState | null>(null);
  const [eventDraft, setEventDraft] = useState<TimelineModalEventDraft | null>(null);
  const [ratings, setRatings] = useState<{ playerId: string; rating: number }[]>([]);
  const [playerOfTheMatch, setPlayerOfTheMatch] = useState('');
  const [captainId, setCaptainId] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Coach assignment state - filter out undefined IDs from TeamCoachDto
  const [assignedCoachIds, setAssignedCoachIds] = useState<string[]>([]);
  const [showCoachModal, setShowCoachModal] = useState(false);
  // Attendance state - derive from team players, not from DTO (attendance not in MatchDetailDto)
  const [attendance, setAttendance] = useState<{ playerId: string; status: 'confirmed' | 'declined' | 'maybe' | 'pending'; notes?: string }[]>([]);

  const [activeTab, setActiveTab] = useState<'details' | 'lineup' | 'events' | 'report' | 'attendance'>('details');
  
  // Position swap state - tracks the lineup slot index for precise swapping
  const [selectedPlayerIndexForSwap, setSelectedPlayerIndexForSwap] = useState<number | null>(null);
  
  // Cross-team player selection modal
  const [showCrossTeamModal, setShowCrossTeamModal] = useState(false);
  const [crossTeamModalType, setCrossTeamModalType] = useState<'starting' | 'substitute'>('starting');
  
  // Modal filters
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalAgeGroupFilter, setModalAgeGroupFilter] = useState<string>('all');
  const [modalTeamFilter, setModalTeamFilter] = useState<string>('all');

  const availableFormations = useMemo(
    () => systemFormations
      .filter(formation => formation.squadSize === squadSize)
      .sort((left, right) => left.name.localeCompare(right.name)),
    [squadSize, systemFormations],
  );

  const availableTactics = useMemo(
    () => allTactics.filter(tactic => tactic.squadSize === squadSize),
    [allTactics, squadSize],
  );

  const selectedTactic = tacticId ? tacticsById.get(tacticId) ?? null : null;
  const selectedFormation = formationId ? formationsById.get(formationId) ?? null : null;

  const invitedPlayerIds = useMemo(
    () => Array.from(new Set([
      ...startingPlayers.map(player => player.playerId),
      ...substitutes.map(substitute => substitute.playerId),
    ])),
    [startingPlayers, substitutes],
  );

  const invitedPlayerIdSet = useMemo(
    () => new Set(invitedPlayerIds),
    [invitedPlayerIds],
  );

  const invitedPlayers = useMemo(
    () => (teamPlayers || []).filter(player => invitedPlayerIdSet.has(player.id)),
    [teamPlayers, invitedPlayerIdSet],
  );

  const selectedResolvedPositions = useMemo(() => {
    if (selectedTactic) {
      if (selectedTacticDetail?.resolvedPositions && selectedTacticDetail.resolvedPositions.length > 0) {
        return mapResolvedPositionDtos(selectedTacticDetail.resolvedPositions);
      }

      if (selectedFormation) {
        return resolvePositionsFromFormationAndOverrides(
          selectedFormation,
          selectedTactic.positionOverrides,
          selectedTactic.id,
        );
      }

      return getResolvedPositions(selectedTactic);
    }

    if (selectedFormation) {
      return getResolvedPositions(selectedFormation);
    }

    return [] as ResolvedPosition[];
  }, [selectedFormation, selectedTactic, selectedTacticDetail]);

  const lineupSlots = useMemo(
    () => buildLineupSlots(selectedResolvedPositions, squadSize),
    [selectedResolvedPositions, squadSize],
  );

  const lineupSlotsByPositionIndex = useMemo(
    () => new Map(lineupSlots.map(slot => [slot.positionIndex, slot])),
    [lineupSlots],
  );

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
      const initialSquadSize = (existingMatch.squadSize || ageGroup?.defaultSquadSize || 11) as SquadSize;
      const initialTactic = existingMatch.lineup?.tacticId ? tacticsById.get(existingMatch.lineup.tacticId) ?? null : null;
      const initialFormation = existingMatch.lineup?.formationId ? formationsById.get(existingMatch.lineup.formationId) ?? null : null;
      const initialResolvedPositions = initialTactic
        ? getResolvedPositions(initialTactic)
        : initialFormation
          ? getResolvedPositions(initialFormation)
          : [];
      const initialLineupSlots = buildLineupSlots(initialResolvedPositions, initialSquadSize);

      setSeasonId(existingMatch.seasonId || defaultSeason);
      setSquadSize(initialSquadSize);
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
      setGoalkeeperKit(existingMatch.goalkeeperKitId?.toString() || '');
      setFormationId(existingMatch.lineup?.formationId || '');
      setTacticId(existingMatch.lineup?.tacticId || '');
      setWeather(existingMatch.weatherCondition || '');
      setTemperature(existingMatch.weatherTemperature?.toString() || '');
      setHomeScore(existingMatch.homeScore?.toString() || '');
      setAwayScore(existingMatch.awayScore?.toString() || '');
      setSummary(existingMatch.report?.summary || '');
      const usedPositionIndices = new Set<number>();
      setStartingPlayers(
        existingMatch.lineup?.players?.filter(p => p.isStarting).map((p, index) => {
          let resolvedPositionIndex = p.positionIndex ?? initialLineupSlots[index]?.positionIndex ?? index;

          while (usedPositionIndices.has(resolvedPositionIndex)) {
            resolvedPositionIndex = initialLineupSlots.find(
              slot => !usedPositionIndices.has(slot.positionIndex),
            )?.positionIndex ?? (resolvedPositionIndex + 1);
          }

          usedPositionIndices.add(resolvedPositionIndex);

          return {
            playerId: p.playerId,
            positionIndex: resolvedPositionIndex,
            positionLabel: lineupSlotsByPositionIndex.get(resolvedPositionIndex)?.positionLabel
              || initialLineupSlots.find(slot => slot.positionIndex === resolvedPositionIndex)?.positionLabel
              || p.position as PlayerPosition | undefined,
            squadNumber: p.squadNumber,
          };
        }) || []
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
          period: parseTimelinePeriod(s.period),
          addedTimeMinutes: s.addedTimeMinutes,
          playerOut: s.playerOutId,
          playerIn: s.playerInId
        }))
      );
      setGoals(
        (existingMatch.report?.goals || []).map(g => ({
          playerId: g.playerId,
          minute: g.minute,
          period: parseTimelinePeriod(g.period) || 'first',
          addedTimeMinutes: g.addedTimeMinutes,
          isExtraTime: g.isExtraTime,
          isPenalty: g.isPenalty,
          assistPlayerId: g.assistPlayerId
        }))
      );
      setCards(
        (existingMatch.report?.cards || []).map(c => ({
          playerId: c.playerId,
          type: (c.type === 'yellow' || c.type === 'red' ? c.type : 'yellow') as 'yellow' | 'red',
          minute: c.minute,
          period: parseTimelinePeriod(c.period),
          addedTimeMinutes: c.addedTimeMinutes,
          reason: c.reason,
        }))
      );
      setInjuries(
        (existingMatch.report?.injuries || []).map(i => ({
          playerId: i.playerId,
          minute: i.minute,
          period: parseTimelinePeriod(i.period),
          addedTimeMinutes: i.addedTimeMinutes,
          description: i.description || '',
          severity: (['minor', 'moderate', 'serious'].includes(i.severity) ? i.severity : 'minor') as 'minor' | 'moderate' | 'serious'
        }))
      );
      setEventModal(null);
      setEventDraft(null);
      setRatings(
        (existingMatch.report?.performanceRatings || []).map(r => ({ ...r, rating: r.rating || 0 }))
      );
      setPlayerOfTheMatch(existingMatch.report?.playerOfMatchId || '');
      setCaptainId(existingMatch.report?.captainId || '');
      setIsLocked(existingMatch.isLocked || false);
      setNotes(existingMatch.notes || '');
      setAssignedCoachIds(
        (existingMatch.coaches || []).map(c => c.coachId).filter((id): id is string => id !== undefined)
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
      setIsEventSpeedDialOpen(false);
      setEventModal(null);
      setEventDraft(null);
      setRatings([]);
      setPlayerOfTheMatch('');
      setCaptainId('');
      setIsLocked(false);
      setNotes('');
      setAssignedCoachIds([]);
    }

    // Initialize attendance from persisted values for edit mode; sync with invited lineup below.
    if (isEditing && existingMatch && existingMatch.attendance && existingMatch.attendance.length > 0) {
      setAttendance(existingMatch.attendance.map(a => ({
        playerId: a.playerId,
        status: a.status as 'confirmed' | 'declined' | 'maybe' | 'pending',
        notes: a.notes
      })));
    } else {
      setAttendance([]);
    }

    setIsFormInitialized(true);
  }, [isLoading, isFormInitialized, isEditing, existingMatch, ageGroup, defaultSeason, teamPlayers, matchId, teamId, tacticsById, formationsById, lineupSlotsByPositionIndex]);

  // Auto-assign team coaches for new matches
  useEffect(() => {
    // Only run if form is initialized to avoid running during initial loading
    if (!isFormInitialized) return;
    if (!isEditing && teamCoaches && teamCoaches.length > 0 && assignedCoachIds.length === 0) {
      setAssignedCoachIds(teamCoaches.map(c => c.id).filter((id): id is string => id !== undefined));
    }
  }, [isFormInitialized, isEditing, teamCoaches, assignedCoachIds.length]);

  // Keep attendance aligned with invited lineup players only.
  useEffect(() => {
    if (!isFormInitialized) return;

    setAttendance(prevAttendance => {
      const filteredAttendance = prevAttendance.filter(item => invitedPlayerIdSet.has(item.playerId));
      const existingAttendancePlayerIds = new Set(filteredAttendance.map(item => item.playerId));

      let didChange = filteredAttendance.length !== prevAttendance.length;
      const nextAttendance = [...filteredAttendance];

      invitedPlayerIds.forEach(playerId => {
        if (!existingAttendancePlayerIds.has(playerId)) {
          nextAttendance.push({ playerId, status: 'pending' });
          didChange = true;
        }
      });

      return didChange ? nextAttendance : prevAttendance;
    });
  }, [isFormInitialized, invitedPlayerIds, invitedPlayerIdSet]);

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

  const getPositionLabelForSlot = (positionIndex: number, fallback?: PlayerPosition): string => {
    return lineupSlotsByPositionIndex.get(positionIndex)?.positionLabel || fallback || `Slot ${positionIndex + 1}`;
  };

  const getNextAvailablePositionIndex = (): number | undefined => {
    return lineupSlots.find(slot => !startingPlayers.some(player => player.positionIndex === slot.positionIndex))?.positionIndex;
  };

  const handleAddStartingPlayer = (playerId: string, position: PlayerPosition) => {
    if (!startingPlayers.find(p => p.playerId === playerId)) {
      const positionIndex = getNextAvailablePositionIndex();
      if (positionIndex === undefined) {
        return;
      }

      // Get squad number from player data
      const squadNumber = getPlayerSquadNumber(playerId);
      setStartingPlayers([...startingPlayers, { playerId, positionIndex, squadNumber, positionLabel: position }]);
      // Remove from substitutes if present
      setSubstitutes(substitutes.filter(s => s.playerId !== playerId));
    }
  };

  const handleRemoveStartingPlayer = (playerId: string) => {
    const removedPlayer = startingPlayers.find(player => player.playerId === playerId);
    setStartingPlayers(startingPlayers.filter(p => p.playerId !== playerId));

    if (removedPlayer && selectedPlayerIndexForSwap === removedPlayer.positionIndex) {
      setSelectedPlayerIndexForSwap(null);
    }

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

  const allTimelinePeriods = timelineSections.map(section => section.period);

  const defaultTimelinePeriod = 'second' as TimelinePeriod;

  const handleOpenCreateEventModal = (eventType: TimelineEventType) => {
    let draft: TimelineModalEventDraft;

    if (eventType === 'goal') {
      draft = {
        eventType: 'goal',
        playerId: '',
        minute: undefined,
        period: defaultTimelinePeriod,
        addedTimeMinutes: undefined,
        isExtraTime: false,
        isPenalty: defaultTimelinePeriod === 'penalties',
        assistPlayerId: undefined,
      };
    } else if (eventType === 'card') {
      draft = {
        eventType: 'card',
        playerId: '',
        type: 'yellow',
        minute: undefined,
        period: defaultTimelinePeriod,
        addedTimeMinutes: undefined,
        reason: undefined,
      };
    } else if (eventType === 'injury') {
      draft = {
        eventType: 'injury',
        playerId: '',
        minute: undefined,
        period: defaultTimelinePeriod,
        addedTimeMinutes: undefined,
        description: '',
        severity: 'minor',
      };
    } else if (eventType === 'substitution') {
      draft = {
        eventType: 'substitution',
        minute: undefined,
        period: defaultTimelinePeriod,
        addedTimeMinutes: undefined,
        playerOut: '',
        playerIn: '',
      };
    } else {
      return;
    }

    setEventModal({ mode: 'create', eventType });
    setEventDraft(draft);
    setIsEventSpeedDialOpen(false);
  };

  const handleOpenEditEventModal = (eventType: TimelineEventType, index: number) => {
    if (eventType === 'goal' && goals[index]) {
      setEventDraft({ eventType: 'goal', ...goals[index] });
    }

    if (eventType === 'card' && cards[index]) {
      setEventDraft({ eventType: 'card', ...cards[index] });
    }

    if (eventType === 'injury' && injuries[index]) {
      setEventDraft({ eventType: 'injury', ...injuries[index] });
    }

    if (eventType === 'substitution' && substitutions[index]) {
      setEventDraft({ eventType: 'substitution', ...substitutions[index] });
    }

    setEventModal({ mode: 'edit', eventType, index });
    setIsEventSpeedDialOpen(false);
  };

  const eventSpeedDialActions: { eventType: TimelineEventType; label: string; icon: JSX.Element }[] = [
    { eventType: 'goal', label: 'Goal', icon: <SportsSoccerIcon fontSize="small" className="text-green-600" /> },
    { eventType: 'card', label: 'Card', icon: <StyleIcon fontSize="small" className="text-yellow-600" /> },
    { eventType: 'injury', label: 'Injury', icon: <HealingIcon fontSize="small" className="text-red-600" /> },
    { eventType: 'substitution', label: 'Substitution', icon: <SwapHorizIcon fontSize="small" className="text-blue-600" /> },
  ];

  const handleCloseEventModal = () => {
    setEventModal(null);
    setEventDraft(null);
  };

  const handleSaveEventModal = () => {
    if (!eventModal || !eventDraft) {
      return;
    }

    const hasInvalidAddedTime = (addedTimeMinutes?: number) => addedTimeMinutes !== undefined && addedTimeMinutes < 0;
    const hasMinute = (minute?: number) => minute !== undefined && !Number.isNaN(minute) && minute > 0;
    const hasInvalidMinute = (minute?: number) => minute !== undefined && (Number.isNaN(minute) || minute < 1);

    if (eventDraft.eventType === 'goal') {
      if (!eventDraft.playerId) {
        alert('Please select a goal scorer.');
        return;
      }

      if (!eventDraft.period) {
        alert('Please select a period for the goal.');
        return;
      }

      if (hasInvalidMinute(eventDraft.minute)) {
        alert('Goal minute must be 1 or greater when provided.');
        return;
      }

      if (hasInvalidAddedTime(eventDraft.addedTimeMinutes)) {
        alert('Injury time must be at least 1 minute.');
        return;
      }

      if ((eventDraft.addedTimeMinutes ?? 0) > 0 && !hasMinute(eventDraft.minute)) {
        alert('Set a minute before adding injury time.');
        return;
      }

      if (eventDraft.assistPlayerId && eventDraft.assistPlayerId === eventDraft.playerId) {
        alert('Assist player cannot be the same as the goal scorer.');
        return;
      }
    }

    if (eventDraft.eventType === 'card') {
      if (!eventDraft.playerId) {
        alert('Please select a player for the card event.');
        return;
      }

      if (!eventDraft.period) {
        alert('Please select a period for the card event.');
        return;
      }

      if (hasInvalidMinute(eventDraft.minute)) {
        alert('Card minute must be 1 or greater when provided.');
        return;
      }

      if (hasInvalidAddedTime(eventDraft.addedTimeMinutes)) {
        alert('Injury time must be at least 1 minute.');
        return;
      }

      if ((eventDraft.addedTimeMinutes ?? 0) > 0 && !hasMinute(eventDraft.minute)) {
        alert('Set a minute before adding injury time.');
        return;
      }

    }


    if (eventDraft.eventType === 'injury') {
      if (!eventDraft.playerId) {
        alert('Please select a player for the injury event.');
        return;
      }

      if (!eventDraft.period) {
        alert('Please select a period for the injury event.');
        return;
      }

      if (hasInvalidMinute(eventDraft.minute)) {
        alert('Injury minute must be 1 or greater when provided.');
        return;
      }

      if (hasInvalidAddedTime(eventDraft.addedTimeMinutes)) {
        alert('Injury time must be at least 1 minute.');
        return;
      }

      if ((eventDraft.addedTimeMinutes ?? 0) > 0 && !hasMinute(eventDraft.minute)) {
        alert('Set a minute before adding injury time.');
        return;
      }

      if (!eventDraft.description.trim()) {
        alert('Please add a brief injury description.');
        return;
      }
    }

    if (eventDraft.eventType === 'substitution') {
      if (!eventDraft.playerOut || !eventDraft.playerIn) {
        alert('Please select both players for the substitution.');
        return;
      }

      if (!eventDraft.period) {
        alert('Please select a period for the substitution.');
        return;
      }

      if (eventDraft.playerOut === eventDraft.playerIn) {
        alert('Player off and player on must be different players.');
        return;
      }

      if (hasInvalidMinute(eventDraft.minute)) {
        alert('Substitution minute must be 1 or greater when provided.');
        return;
      }

      if (hasInvalidAddedTime(eventDraft.addedTimeMinutes)) {
        alert('Injury time must be at least 1 minute.');
        return;
      }

      if ((eventDraft.addedTimeMinutes ?? 0) > 0 && !hasMinute(eventDraft.minute)) {
        alert('Set a minute before adding injury time.');
        return;
      }

    }

    const isCreate = eventModal.mode === 'create';

    if (eventDraft.eventType === 'goal') {
      setGoals(previous => isCreate
        ? [...previous, {
          playerId: eventDraft.playerId,
          minute: eventDraft.minute,
          period: eventDraft.period,
          addedTimeMinutes: eventDraft.addedTimeMinutes,
          isExtraTime: eventDraft.isExtraTime,
          isPenalty: eventDraft.isPenalty,
          assistPlayerId: eventDraft.assistPlayerId,
        }]
        : previous.map((event, index) => index === eventModal.index ? {
          playerId: eventDraft.playerId,
          minute: eventDraft.minute,
          period: eventDraft.period,
          addedTimeMinutes: eventDraft.addedTimeMinutes,
          isExtraTime: eventDraft.isExtraTime,
          isPenalty: eventDraft.isPenalty,
          assistPlayerId: eventDraft.assistPlayerId,
        } : event),
      );
    }

    if (eventDraft.eventType === 'card') {
      setCards(previous => isCreate
        ? [...previous, {
          playerId: eventDraft.playerId,
          type: eventDraft.type,
          minute: eventDraft.minute,
          period: eventDraft.period,
          addedTimeMinutes: eventDraft.addedTimeMinutes,
          reason: eventDraft.reason,
        }]
        : previous.map((event, index) => index === eventModal.index ? {
          playerId: eventDraft.playerId,
          type: eventDraft.type,
          minute: eventDraft.minute,
          period: eventDraft.period,
          addedTimeMinutes: eventDraft.addedTimeMinutes,
          reason: eventDraft.reason,
        } : event),
      );
    }

    if (eventDraft.eventType === 'injury') {
      setInjuries(previous => isCreate
        ? [...previous, {
          playerId: eventDraft.playerId,
          minute: eventDraft.minute,
          period: eventDraft.period,
          addedTimeMinutes: eventDraft.addedTimeMinutes,
          description: eventDraft.description,
          severity: eventDraft.severity,
        }]
        : previous.map((event, index) => index === eventModal.index ? {
          playerId: eventDraft.playerId,
          minute: eventDraft.minute,
          period: eventDraft.period,
          addedTimeMinutes: eventDraft.addedTimeMinutes,
          description: eventDraft.description,
          severity: eventDraft.severity,
        } : event),
      );
    }

    if (eventDraft.eventType === 'substitution') {
      setSubstitutions(previous => isCreate
        ? [...previous, {
          minute: eventDraft.minute,
          period: eventDraft.period,
          addedTimeMinutes: eventDraft.addedTimeMinutes,
          playerOut: eventDraft.playerOut,
          playerIn: eventDraft.playerIn,
        }]
        : previous.map((event, index) => index === eventModal.index ? {
          minute: eventDraft.minute,
          period: eventDraft.period,
          addedTimeMinutes: eventDraft.addedTimeMinutes,
          playerOut: eventDraft.playerOut,
          playerIn: eventDraft.playerIn,
        } : event),
      );
    }

    handleCloseEventModal();
  };

  const handleDeleteTimelineEvent = (eventType: TimelineEventType, index: number) => {
    if (eventType === 'goal') {
      setGoals(prev => prev.filter((_, currentIndex) => currentIndex !== index));
    }

    if (eventType === 'card') {
      setCards(prev => prev.filter((_, currentIndex) => currentIndex !== index));
    }

    if (eventType === 'injury') {
      setInjuries(prev => prev.filter((_, currentIndex) => currentIndex !== index));
    }

    if (eventType === 'substitution') {
      setSubstitutions(prev => prev.filter((_, currentIndex) => currentIndex !== index));
    }

  };

  const timelineEvents = (() => {
    const goalsTimeline = goals.map((event, index) => ({
      id: `goal-${index}`,
      eventType: 'goal' as const,
      index,
      period: event.period,
      minute: event.minute,
      addedTimeMinutes: event.addedTimeMinutes,
    }));

    const cardsTimeline = cards.map((event, index) => ({
      id: `card-${index}`,
      eventType: 'card' as const,
      index,
      period: event.period,
      minute: event.minute,
      addedTimeMinutes: event.addedTimeMinutes,
    }));

    const injuriesTimeline = injuries.map((event, index) => ({
      id: `injury-${index}`,
      eventType: 'injury' as const,
      index,
      period: event.period,
      minute: event.minute,
      addedTimeMinutes: event.addedTimeMinutes,
    }));

    const substitutionsTimeline = substitutions.map((event, index) => ({
      id: `substitution-${index}`,
      eventType: 'substitution' as const,
      index,
      period: event.period,
      minute: event.minute,
      addedTimeMinutes: event.addedTimeMinutes,
    }));

    return [...goalsTimeline, ...cardsTimeline, ...injuriesTimeline, ...substitutionsTimeline]
      .filter(event => event.period && allTimelinePeriods.includes(event.period))
      .sort((left, right) => {
        const sectionOrder = allTimelinePeriods.indexOf(left.period as TimelinePeriod) - allTimelinePeriods.indexOf(right.period as TimelinePeriod);
        if (sectionOrder !== 0) {
          return sectionOrder;
        }

        const leftMinute = left.minute ?? 999;
        const rightMinute = right.minute ?? 999;
        if (leftMinute !== rightMinute) {
          return leftMinute - rightMinute;
        }

        return (left.addedTimeMinutes ?? 0) - (right.addedTimeMinutes ?? 0);
      });
  })();

  const timelineSectionsWithEvents = timelineSections
    .map(section => ({
      section,
      events: timelineEvents.filter(event => event.period === section.period),
    }))
    .filter(group => group.events.length > 0);

  const handleSetRating = (playerId: string, rating: number) => {
    const existing = ratings.find(r => r.playerId === playerId);
    if (existing) {
      setRatings(ratings.map(r => r.playerId === playerId ? { playerId, rating } : r));
    } else {
      setRatings([...ratings, { playerId, rating }]);
    }
  };

  const handleTogglePlayerOfTheMatch = (playerId: string) => {
    if (isLocked) {
      return;
    }

    setPlayerOfTheMatch(current => current === playerId ? '' : playerId);
  };

  const handlePlayerClickForSwap = (playerIndex: number) => {
    if (isLocked) return;
    
    const clickedPlayer = startingPlayers.find(player => player.positionIndex === playerIndex);
    
    if (selectedPlayerIndexForSwap === null) {
      if (clickedPlayer) {
        setSelectedPlayerIndexForSwap(playerIndex);
      }
    } else {
      if (selectedPlayerIndexForSwap === playerIndex) {
        setSelectedPlayerIndexForSwap(null);
      } else {
        setStartingPlayers(prev => {
          const selectedPlayer = prev.find(player => player.positionIndex === selectedPlayerIndexForSwap);
          if (!selectedPlayer) {
            return prev;
          }

          return prev.map(player => {
            if (player.playerId === selectedPlayer.playerId) {
              return { ...player, positionIndex: playerIndex };
            }

            if (clickedPlayer && player.playerId === clickedPlayer.playerId) {
              return { ...player, positionIndex: selectedPlayerIndexForSwap };
            }

            return player;
          });
        });
        setSelectedPlayerIndexForSwap(null);
      }
    }
  };

  const getRating = (playerId: string) => {
    return ratings.find(r => r.playerId === playerId)?.rating || 0;
  };

  const handleSetAttendanceStatus = (playerId: string, status: 'confirmed' | 'declined' | 'maybe' | 'pending') => {
    if (!invitedPlayerIdSet.has(playerId)) {
      return;
    }

    setAttendance(prevAttendance => {
      const index = prevAttendance.findIndex(item => item.playerId === playerId);
      if (index === -1) {
        return [...prevAttendance, { playerId, status }];
      }

      return prevAttendance.map(item =>
        item.playerId === playerId ? { ...item, status } : item,
      );
    });
  };

  const handleSetAttendanceNote = (playerId: string, note: string) => {
    if (!invitedPlayerIdSet.has(playerId)) {
      return;
    }

    setAttendance(prevAttendance => {
      const index = prevAttendance.findIndex(item => item.playerId === playerId);
      if (index === -1) {
        return [...prevAttendance, { playerId, status: 'pending', notes: note || undefined }];
      }

      return prevAttendance.map(item =>
        item.playerId === playerId ? { ...item, notes: note || undefined } : item,
      );
    });
  };

  const handleSquadSizeChange = (newSquadSize: SquadSize) => {
    setSquadSize(newSquadSize);
    // Reset formation if current one doesn't match new squad size
    const currentFormation = formationId ? formationsById.get(formationId) : null;
    const currentTactic = tacticId ? tacticsById.get(tacticId) ?? null : null;
    if ((currentFormation && currentFormation.squadSize !== newSquadSize) || (currentTactic && currentTactic.squadSize !== newSquadSize)) {
      setFormationId('');
      setTacticId('');
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

  const handleSave = async () => {
    // Check if match is locked
    if (isLocked) {
      alert('This match is locked and cannot be edited.');
      return;
    }

    // Validate required fields
    if (!opposition || !kickOffTime || !location || !competition || !kit) {
      alert('Please fill in all required fields');
      return;
    }

    const invalidGoalIndex = goals.findIndex(goal => !goal.playerId || !goal.period || (goal.minute !== undefined && goal.minute < 1));
    if (invalidGoalIndex >= 0) {
      alert(`Goal ${invalidGoalIndex + 1} requires scorer and period. If minute is entered it must be 1 or greater.`);
      return;
    }

    const invalidSubstitutionIndex = substitutions.findIndex(substitution => !substitution.playerOut || !substitution.playerIn);
    if (invalidSubstitutionIndex >= 0) {
      alert(`Substitution ${invalidSubstitutionIndex + 1} requires both player off and player on.`);
      return;
    }

    const hasInvalidGoalInjuryTime = goals.some(goal => goal.addedTimeMinutes !== undefined && goal.addedTimeMinutes < 0);
    const hasInvalidCardInjuryTime = cards.some(card => card.addedTimeMinutes !== undefined && card.addedTimeMinutes < 0);
    const hasInvalidInjuryEventInjuryTime = injuries.some(injury => injury.addedTimeMinutes !== undefined && injury.addedTimeMinutes < 0);
    const hasInvalidSubstitutionInjuryTime = substitutions.some(substitution => substitution.addedTimeMinutes !== undefined && substitution.addedTimeMinutes < 0);

    if (hasInvalidGoalInjuryTime || hasInvalidCardInjuryTime || hasInvalidInjuryEventInjuryTime || hasInvalidSubstitutionInjuryTime) {
      alert('Injury time must be at least 1 minute.');
      return;
    }

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
      goalkeeperKitId: goalkeeperKit || undefined,
      homeScore: homeScore ? parseInt(homeScore) : undefined,
      awayScore: awayScore ? parseInt(awayScore) : undefined,
      status: existingMatch?.status || 'scheduled',
      weatherCondition: weather || undefined,
      weatherTemperature: temperature ? parseFloat(temperature) : undefined,
      lineup: {
        formationId: formationId || undefined,
        tacticId: tacticId || undefined,
        players: [
          ...[...startingPlayers].sort((left, right) => left.positionIndex - right.positionIndex).map(p => ({ 
            playerId: p.playerId, 
            position: lineupSlotsByPositionIndex.get(p.positionIndex)?.positionLabel || p.positionLabel,
            positionIndex: p.positionIndex,
            squadNumber: p.squadNumber, 
            isStarting: true 
          })), 
          ...substitutes.map(s => ({ 
            playerId: s.playerId, 
            position: undefined, 
            positionIndex: undefined,
            squadNumber: s.squadNumber, 
            isStarting: false 
          }))
        ]
      },
      report: {
        summary: summary || undefined,
        captainId: captainId || undefined,
        playerOfMatchId: playerOfTheMatch || undefined,
        goals: goals
          .filter(goal => goal.playerId)
          .map(goal => ({
            playerId: goal.playerId,
            minute: goal.minute ?? 0,
            period: goal.period,
            addedTimeMinutes: goal.addedTimeMinutes && goal.addedTimeMinutes > 0 ? goal.addedTimeMinutes : undefined,
            isExtraTime: goal.isExtraTime,
            isPenalty: goal.isPenalty,
            assistPlayerId: goal.assistPlayerId,
          })),
        cards: cards
          .filter(card => card.playerId)
          .map(card => ({
            playerId: card.playerId,
            type: card.type,
            minute: card.minute,
            period: card.period,
            addedTimeMinutes: card.addedTimeMinutes && card.addedTimeMinutes > 0 ? card.addedTimeMinutes : undefined,
            reason: card.reason,
          })),
        injuries: injuries
          .filter(injury => injury.playerId)
          .map(injury => ({
            playerId: injury.playerId,
            minute: injury.minute,
            period: injury.period,
            addedTimeMinutes: injury.addedTimeMinutes && injury.addedTimeMinutes > 0 ? injury.addedTimeMinutes : undefined,
            description: injury.description,
            severity: injury.severity,
          })),
        performanceRatings: ratings
      },
      coachIds: assignedCoachIds,
      substitutions: substitutions.map(s => ({
        minute: s.minute,
        period: s.period,
        addedTimeMinutes: s.addedTimeMinutes && s.addedTimeMinutes > 0 ? s.addedTimeMinutes : undefined,
        playerOutId: s.playerOut,
        playerInId: s.playerIn
      })),
      attendance: attendance
        .filter(a => invitedPlayerIdSet.has(a.playerId))
        .map(a => ({
        playerId: a.playerId,
        status: a.status,
        notes: a.notes || undefined
      })),
      notes: notes || undefined
    };

    const response = isEditing
      ? await updateMatch({
          ...(matchData as Omit<UpdateMatchRequest, 'isLocked'>),
          isLocked,
        })
      : await createMatch(matchData as CreateMatchRequest);

    if (response.success && response.data) {
      navigate(Routes.matches(clubId!, ageGroupId!, teamId!));
    }
  };

  const allPlayersInMatch = invitedPlayerIds;
  const availablePlayers = (teamPlayers ?? []).filter(p => !allPlayersInMatch.includes(p.id));
  
  // Players available for events (goals/cards/injuries) - fallback to all team players when lineup is empty
  const playersForEvents = allPlayersInMatch.length > 0 ? allPlayersInMatch : (teamPlayers || []).map(p => p.id);

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

        {mutationError && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 dark:text-red-300">{mutationError.message}</p>
              {mutationError.validationErrors && (
                <ul className="mt-1 text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                  {Object.entries(mutationError.validationErrors).map(([field, messages]) =>
                    messages.map((message, index) => (
                      <li key={`${field}-${index}`}>{field}: {message}</li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
        )}

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
                    <option value="">Select a team or club kit</option>
                    {availableOutfieldKits.map(k => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                      ))}
                  </select>
                  {availableOutfieldKits.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      No team or club match kits are available for this fixture.
                    </p>
                  )}
                  {selectedKit && (
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
                    <option value="">Select a team or club goalkeeper kit (optional)</option>
                    {availableGoalkeeperKits.map(k => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                      ))}
                  </select>
                  {availableGoalkeeperKits.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      No team or club goalkeeper kits are available for this fixture.
                    </p>
                  )}
                  {selectedGoalkeeperKit && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Colors:</span>
                      <div className="flex items-center gap-1">
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: selectedGoalkeeperKit.shirtColor }}
                            title="Shirt"
                          />
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Shirt</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: selectedGoalkeeperKit.shortsColor }}
                            title="Shorts"
                          />
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Shorts</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: selectedGoalkeeperKit.socksColor }}
                            title="Socks"
                          />
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Socks</span>
                        </div>
                      </div>
                    </div>
                  )}
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
                            const parentFormation = t.parentFormationId ? formationsById.get(t.parentFormationId) : null;
                            const formationLabel = parentFormation?.system || t.system || 'Unknown Formation';
                            return (
                              <option key={`tactic:${t.id}`} value={`tactic:${t.id}`}>
                                {t.name} ({formationLabel})
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
                            const parentFormation = t.parentFormationId ? formationsById.get(t.parentFormationId) : null;
                            const formationLabel = parentFormation?.system || t.system || 'Unknown Formation';
                            return (
                              <option key={`tactic:${t.id}`} value={`tactic:${t.id}`}>
                                {t.name} ({formationLabel})
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
                            const parentFormation = t.parentFormationId ? formationsById.get(t.parentFormationId) : null;
                            const formationLabel = parentFormation?.system || t.system || 'Unknown Formation';
                            return (
                              <option key={`tactic:${t.id}`} value={`tactic:${t.id}`}>
                                {t.name} ({formationLabel})
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
                    const sortedPlayers = [...startingPlayers].sort((a, b) => a.positionIndex - b.positionIndex);
                    
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
                              {getPositionLabelForSlot(player.positionIndex, player.positionLabel)}
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
                              type="button"
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
                        type="button"
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
                          type="button"
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
                          type="button"
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
                        type="button"
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
                          type="button"
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
                        resolvedPositions={selectedResolvedPositions}
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
                        resolvedPositions={selectedResolvedPositions}
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
            <div className="mt-4 space-y-4">
              <div className="relative h-14">
                <SpeedDial
                  ariaLabel="Add match event"
                  icon={<SpeedDialIcon />}
                  direction="right"
                  FabProps={{
                    size: 'small',
                    color: 'success',
                    disabled: isLocked,
                  }}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    '& .MuiSpeedDial-actions': {
                      gap: 1,
                    },
                    '& .MuiSpeedDial-fab': {
                      boxShadow: 'none',
                    },
                  }}
                  open={isEventSpeedDialOpen}
                  onOpen={(_, reason) => {
                    if (!isLocked && reason === 'toggle') {
                      setIsEventSpeedDialOpen(true);
                    }
                  }}
                  onClose={(_, reason) => {
                    if (reason === 'toggle') {
                      setIsEventSpeedDialOpen(false);
                    }
                  }}
                >
                  {eventSpeedDialActions.map((action) => (
                    <SpeedDialAction
                      key={action.eventType}
                      icon={action.icon}
                      slotProps={{
                        tooltip: {
                          title: `Add ${action.label}`,
                          placement: 'bottom',
                        },
                      }}
                      onClick={() => handleOpenCreateEventModal(action.eventType)}
                      
                    />
                  ))}
                </SpeedDial>
              </div>

              {timelineSectionsWithEvents.length === 0 && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No events yet. Add one to get started.</p>
                </div>
              )}

              {timelineSectionsWithEvents.map(({ section, events: sectionEvents }) => {

                return (
                  <section key={section.period} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">{section.label}</h3>

                    <div className="relative">
                      <Timeline className="w-full min-w-0">
                      {sectionEvents.map((event, index) => {
                        const timelineMinute = event.minute !== undefined && event.minute !== null && event.minute > 0
                          ? `${event.minute}${event.addedTimeMinutes ? `+${event.addedTimeMinutes}` : ''}`
                          : '';

                        const hasConnector = index < sectionEvents.length - 1;

                        if (event.eventType === 'goal') {
                          const goal = goals[event.index];
                          return (
                            <TimelineItem key={event.id} className="relative pb-2">
                              {hasConnector && (
                                <span className="pointer-events-none absolute left-[2.125rem] top-[3.5rem] h-[calc(100%-2.5rem)] w-px bg-gray-300 dark:bg-gray-700" />
                              )}
                              <TimelineHeader className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-3 pr-3 shadow-sm">
                                <TimelineIcon className="p-0 bg-gray-100 dark:bg-gray-700">
                                  <span className="flex h-11 w-11 items-center justify-center rounded-full text-[10px] font-semibold text-gray-700 dark:text-gray-200 leading-tight text-center px-1">{timelineMinute}</span>
                                </TimelineIcon>
                                <div className="ml-3 flex w-full items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">⚽ Goal • {getPlayerName(goal.playerId)}</p>
                                    {goal.assistPlayerId && (
                                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Assist: {getPlayerName(goal.assistPlayerId)}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <button type="button" onClick={() => handleOpenEditEventModal('goal', event.index)} disabled={isLocked} className="text-blue-600 disabled:opacity-50">Edit</button>
                                    <button type="button" onClick={() => handleDeleteTimelineEvent('goal', event.index)} disabled={isLocked} className="text-red-600 disabled:opacity-50">Delete</button>
                                  </div>
                                </div>
                              </TimelineHeader>
                              <TimelineBody className="pb-1" />
                            </TimelineItem>
                          );
                        }

                        if (event.eventType === 'card') {
                          const card = cards[event.index];
                          return (
                            <TimelineItem key={event.id} className="relative pb-2">
                              {hasConnector && (
                                <span className="pointer-events-none absolute left-[2.125rem] top-[3.5rem] h-[calc(100%-2.5rem)] w-px bg-gray-300 dark:bg-gray-700" />
                              )}
                              <TimelineHeader className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-3 pr-3 shadow-sm">
                                <TimelineIcon className="p-0 bg-gray-100 dark:bg-gray-700">
                                  <span className="flex h-11 w-11 items-center justify-center rounded-full text-[10px] font-semibold text-gray-700 dark:text-gray-200 leading-tight text-center px-1">{timelineMinute}</span>
                                </TimelineIcon>
                                <div className="ml-3 flex w-full items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{card.type === 'red' ? '🟥' : '🟨'} Card • {getPlayerName(card.playerId)}</p>
                                    {card.reason?.trim() && (
                                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{card.reason}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <button type="button" onClick={() => handleOpenEditEventModal('card', event.index)} disabled={isLocked} className="text-blue-600 disabled:opacity-50">Edit</button>
                                    <button type="button" onClick={() => handleDeleteTimelineEvent('card', event.index)} disabled={isLocked} className="text-red-600 disabled:opacity-50">Delete</button>
                                  </div>
                                </div>
                              </TimelineHeader>
                              <TimelineBody className="pb-1" />
                            </TimelineItem>
                          );
                        }

                        if (event.eventType === 'injury') {
                          const injury = injuries[event.index];
                          return (
                            <TimelineItem key={event.id} className="relative pb-2">
                              {hasConnector && (
                                <span className="pointer-events-none absolute left-[2.125rem] top-[3.5rem] h-[calc(100%-2.5rem)] w-px bg-gray-300 dark:bg-gray-700" />
                              )}
                              <TimelineHeader className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-3 pr-3 shadow-sm">
                                <TimelineIcon className="p-0 bg-gray-100 dark:bg-gray-700">
                                  <span className="flex h-11 w-11 items-center justify-center rounded-full text-[10px] font-semibold text-gray-700 dark:text-gray-200 leading-tight text-center px-1">{timelineMinute}</span>
                                </TimelineIcon>
                                <div className="ml-3 flex w-full items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">🏥 Injury • {getPlayerName(injury.playerId)}</p>
                                    {injury.description.trim() && (
                                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{injury.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <button type="button" onClick={() => handleOpenEditEventModal('injury', event.index)} disabled={isLocked} className="text-blue-600 disabled:opacity-50">Edit</button>
                                    <button type="button" onClick={() => handleDeleteTimelineEvent('injury', event.index)} disabled={isLocked} className="text-red-600 disabled:opacity-50">Delete</button>
                                  </div>
                                </div>
                              </TimelineHeader>
                              <TimelineBody className="pb-1" />
                            </TimelineItem>
                          );
                        }

                        const substitution = substitutions[event.index];
                        return (
                          <TimelineItem key={event.id} className="relative pb-2">
                            {hasConnector && (
                              <span className="pointer-events-none absolute left-[2.125rem] top-[3.5rem] h-[calc(100%-2.5rem)] w-px bg-gray-300 dark:bg-gray-700" />
                            )}
                            <TimelineHeader className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-3 pr-3 shadow-sm">
                              <TimelineIcon className="p-0 bg-gray-100 dark:bg-gray-700">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full text-[10px] font-semibold text-gray-700 dark:text-gray-200 leading-tight text-center px-1">{timelineMinute}</span>
                              </TimelineIcon>
                              <div className="ml-3 flex w-full items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">🔄 Substitution • {getPlayerName(substitution.playerOut)}</p>
                                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{getPlayerName(substitution.playerOut)} → {getPlayerName(substitution.playerIn)}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <button type="button" onClick={() => handleOpenEditEventModal('substitution', event.index)} disabled={isLocked} className="text-blue-600 disabled:opacity-50">Edit</button>
                                  <button type="button" onClick={() => handleDeleteTimelineEvent('substitution', event.index)} disabled={isLocked} className="text-red-600 disabled:opacity-50">Delete</button>
                                </div>
                              </div>
                            </TimelineHeader>
                            <TimelineBody className="pb-1" />
                          </TimelineItem>
                        );
                      })}
                      </Timeline>
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {activeTab === 'events' && eventModal && eventDraft && (
            <div className="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {eventModal.mode === 'create' ? 'Add' : 'Edit'} {eventModal.eventType.charAt(0).toUpperCase() + eventModal.eventType.slice(1)}
                  </h3>
                  <button type="button" onClick={handleCloseEventModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {eventDraft.eventType === 'goal' && (
                    <>
                      <select value={eventDraft.playerId} onChange={(e) => setEventDraft({ ...eventDraft, playerId: e.target.value })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700">
                        <option value="">Goal scorer</option>
                        {playersForEvents.map(playerId => <option key={playerId} value={playerId}>{getPlayerName(playerId)}</option>)}
                      </select>
                      <select
                        value={eventDraft.period}
                        onChange={(e) => {
                          const period = e.target.value as TimelinePeriod;
                          setEventDraft({
                            ...eventDraft,
                            period,
                            isExtraTime: period === 'etFirst' || period === 'etSecond',
                            isPenalty: period === 'penalties',
                          });
                        }}
                        className="px-2 py-2 border rounded bg-white dark:bg-gray-700"
                      >
                        {timelineSections.map(periodOption => <option key={periodOption.period} value={periodOption.period}>{periodOption.label}</option>)}
                      </select>
                      <input type="number" min="1" value={eventDraft.minute ?? ''} onChange={(e) => setEventDraft({ ...eventDraft, minute: e.target.value ? parseInt(e.target.value, 10) : undefined })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700" placeholder="Minute" />
                      <input type="number" min="1" value={eventDraft.addedTimeMinutes ?? ''} onChange={(e) => { const value = e.target.value ? parseInt(e.target.value, 10) : undefined; setEventDraft({ ...eventDraft, addedTimeMinutes: value && value > 0 ? value : undefined }); }} className="px-2 py-2 border rounded bg-white dark:bg-gray-700" placeholder="Injury time (+)" />
                      <select value={eventDraft.assistPlayerId || ''} onChange={(e) => setEventDraft({ ...eventDraft, assistPlayerId: e.target.value || undefined })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700 md:col-span-2">
                        <option value="">Assist (optional)</option>
                        {playersForEvents.map(playerId => <option key={playerId} value={playerId}>{getPlayerName(playerId)}</option>)}
                      </select>
                    </>
                  )}

                  {eventDraft.eventType === 'card' && (
                    <>
                      <select value={eventDraft.playerId} onChange={(e) => setEventDraft({ ...eventDraft, playerId: e.target.value })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700">
                        <option value="">Player</option>
                        {playersForEvents.map(playerId => <option key={playerId} value={playerId}>{getPlayerName(playerId)}</option>)}
                      </select>
                      <select value={eventDraft.period || ''} onChange={(e) => setEventDraft({ ...eventDraft, period: e.target.value ? e.target.value as TimelinePeriod : undefined })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700">
                        <option value="">Period (optional)</option>
                        {timelineSections.map(periodOption => <option key={periodOption.period} value={periodOption.period}>{periodOption.label}</option>)}
                      </select>
                      <input type="number" min="0" value={eventDraft.minute ?? ''} onChange={(e) => setEventDraft({ ...eventDraft, minute: e.target.value ? parseInt(e.target.value, 10) : undefined })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700" placeholder="Minute (optional)" />
                      <input type="number" min="1" value={eventDraft.addedTimeMinutes ?? ''} onChange={(e) => { const value = e.target.value ? parseInt(e.target.value, 10) : undefined; setEventDraft({ ...eventDraft, addedTimeMinutes: value && value > 0 ? value : undefined }); }} className="px-2 py-2 border rounded bg-white dark:bg-gray-700" placeholder="Injury time (+)" />
                      <select value={eventDraft.type} onChange={(e) => setEventDraft({ ...eventDraft, type: e.target.value as 'yellow' | 'red' })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700">
                        {cardTypes.map(cardType => <option key={cardType.value} value={cardType.value}>{cardType.label}</option>)}
                      </select>
                      <input type="text" value={eventDraft.reason || ''} onChange={(e) => setEventDraft({ ...eventDraft, reason: e.target.value || undefined })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700" placeholder="Reason" />
                    </>
                  )}

                  {eventDraft.eventType === 'injury' && (
                    <>
                      <select value={eventDraft.playerId} onChange={(e) => setEventDraft({ ...eventDraft, playerId: e.target.value })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700">
                        <option value="">Player</option>
                        {playersForEvents.map(playerId => <option key={playerId} value={playerId}>{getPlayerName(playerId)}</option>)}
                      </select>
                      <select value={eventDraft.period || ''} onChange={(e) => setEventDraft({ ...eventDraft, period: e.target.value ? e.target.value as TimelinePeriod : undefined })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700">
                        <option value="">Period (optional)</option>
                        {timelineSections.map(periodOption => <option key={periodOption.period} value={periodOption.period}>{periodOption.label}</option>)}
                      </select>
                      <input type="number" min="0" value={eventDraft.minute ?? ''} onChange={(e) => setEventDraft({ ...eventDraft, minute: e.target.value ? parseInt(e.target.value, 10) : undefined })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700" placeholder="Minute (optional)" />
                      <input type="number" min="1" value={eventDraft.addedTimeMinutes ?? ''} onChange={(e) => { const value = e.target.value ? parseInt(e.target.value, 10) : undefined; setEventDraft({ ...eventDraft, addedTimeMinutes: value && value > 0 ? value : undefined }); }} className="px-2 py-2 border rounded bg-white dark:bg-gray-700" placeholder="Injury time (+)" />
                      <select value={eventDraft.severity} onChange={(e) => setEventDraft({ ...eventDraft, severity: e.target.value as 'minor' | 'moderate' | 'serious' })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700">
                        {injurySeverities.map(severity => <option key={severity.value} value={severity.value}>{severity.label}</option>)}
                      </select>
                      <input type="text" value={eventDraft.description} onChange={(e) => setEventDraft({ ...eventDraft, description: e.target.value })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700" placeholder="Description" />
                    </>
                  )}

                  {eventDraft.eventType === 'substitution' && (
                    <>
                      <select value={eventDraft.playerOut} onChange={(e) => setEventDraft({ ...eventDraft, playerOut: e.target.value })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700">
                        <option value="">Player off</option>
                        {startingPlayers.map(player => <option key={player.playerId} value={player.playerId}>{getPlayerName(player.playerId)}</option>)}
                      </select>
                      <select value={eventDraft.period || ''} onChange={(e) => setEventDraft({ ...eventDraft, period: e.target.value ? e.target.value as TimelinePeriod : undefined })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700">
                        <option value="">Period (optional)</option>
                        {timelineSections.map(periodOption => <option key={periodOption.period} value={periodOption.period}>{periodOption.label}</option>)}
                      </select>
                      <input type="number" min="0" value={eventDraft.minute ?? ''} onChange={(e) => setEventDraft({ ...eventDraft, minute: e.target.value ? parseInt(e.target.value, 10) : undefined })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700" placeholder="Minute (optional)" />
                      <input type="number" min="1" value={eventDraft.addedTimeMinutes ?? ''} onChange={(e) => { const value = e.target.value ? parseInt(e.target.value, 10) : undefined; setEventDraft({ ...eventDraft, addedTimeMinutes: value && value > 0 ? value : undefined }); }} className="px-2 py-2 border rounded bg-white dark:bg-gray-700" placeholder="Injury time (+)" />
                      <select value={eventDraft.playerIn} onChange={(e) => setEventDraft({ ...eventDraft, playerIn: e.target.value })} className="px-2 py-2 border rounded bg-white dark:bg-gray-700">
                        <option value="">Player on</option>
                        {substitutes.map(player => <option key={player.playerId} value={player.playerId}>{getPlayerName(player.playerId)}</option>)}
                      </select>
                    </>
                  )}

                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <button type="button" onClick={handleCloseEventModal} className="btn-secondary btn-sm">Cancel</button>
                  <button type="button" onClick={handleSaveEventModal} className="btn-success btn-sm">Save Event</button>
                </div>
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
                    const isPlayerOfTheMatch = playerOfTheMatch === playerId;
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
                            <button
                              type="button"
                              onClick={() => handleTogglePlayerOfTheMatch(playerId)}
                              disabled={isLocked}
                              className={`px-2 py-0.5 rounded text-xs border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                isPlayerOfTheMatch
                                  ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-500 text-amber-900 dark:text-amber-100'
                                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                              aria-pressed={isPlayerOfTheMatch}
                            >
                              {isPlayerOfTheMatch ? '⭐' : '☆'}
                            </button>
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
                {invitedPlayers.map((player) => {
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
                🔒 This match is locked and cannot be edited.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4">
            <div className="flex justify-end">
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
                type="button"
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
                            type="button"
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
