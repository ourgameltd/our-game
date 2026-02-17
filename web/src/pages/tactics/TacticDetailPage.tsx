import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useTactic } from '@/api/hooks';
import { TacticDetailDto, ResolvedPositionDto } from '@/api/client';
import { Routes } from '@/utils/routes';
import TacticDisplay from '@/components/tactics/TacticDisplay';
import PrinciplePanel from '@/components/tactics/PrinciplePanel';
import PageTitle from '@/components/common/PageTitle';
import { Tactic, TacticPrinciple, TacticalPositionOverride, PlayerDirection, FormationScope } from '@/types';
import type { ResolvedPosition } from '@/data/tactics';

/**
 * Map TacticDetailDto from API to Tactic shape expected by UI components
 */
function mapDtoToTactic(dto: TacticDetailDto): Tactic {
  const positionOverrides: Record<number, TacticalPositionOverride> = {};
  for (const po of dto.positionOverrides) {
    const override: TacticalPositionOverride = {};
    if (po.xCoord !== undefined) override.x = po.xCoord;
    if (po.yCoord !== undefined) override.y = po.yCoord;
    if (po.direction) override.direction = po.direction as PlayerDirection;
    positionOverrides[po.positionIndex] = override;
  }

  const principles: TacticPrinciple[] = dto.principles.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description || '',
    positionIndices: p.positionIndices,
  }));

  const scope: FormationScope =
    dto.scope.teamIds.length > 0
      ? { type: 'team', clubId: dto.scope.clubIds[0], ageGroupId: dto.scope.ageGroupIds[0], teamId: dto.scope.teamIds[0] }
      : dto.scope.ageGroupIds.length > 0
      ? { type: 'ageGroup', clubId: dto.scope.clubIds[0], ageGroupId: dto.scope.ageGroupIds[0] }
      : { type: 'club', clubId: dto.scope.clubIds[0] };

  return {
    id: dto.id,
    name: dto.name,
    parentFormationId: dto.parentFormationId,
    parentTacticId: dto.parentTacticId,
    squadSize: dto.squadSize,
    positionOverrides,
    principles,
    summary: dto.summary || '',
    style: dto.style,
    tags: dto.tags,
    scope,
  };
}

/**
 * Map ResolvedPositionDto to ResolvedPosition expected by components
 */
function mapResolvedPositions(dtos: ResolvedPositionDto[]): ResolvedPosition[] {
  return dtos.map(dto => ({
    position: dto.position,
    x: dto.x,
    y: dto.y,
    direction: dto.direction as PlayerDirection | undefined,
    sourceFormationId: dto.sourceFormationId || '',
    overriddenBy: dto.overriddenBy || [],
  }));
}

export default function TacticDetailPage() {
  const { clubId, ageGroupId, teamId, tacticId } = useParams();
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [selectedPrincipleId, setSelectedPrincipleId] = useState<string | null>(null);

  const { data: tacticDto, loading, error } = useTactic(tacticId);

  const tactic = tacticDto ? mapDtoToTactic(tacticDto) : undefined;
  const resolvedPositions = tacticDto ? mapResolvedPositions(tacticDto.resolvedPositions) : [];

  // Get highlighted position indices from selected principle
  const highlightedPositionIndices = selectedPrincipleId
    ? (tactic?.principles?.find(p => p.id === selectedPrincipleId)?.positionIndices || [])
    : [];

  // Handle position click - clear principle selection when position is clicked
  const handlePositionClick = (index: number | null) => {
    setSelectedPosition(index === selectedPosition ? null : index);
    setSelectedPrincipleId(null); // Clear principle selection when clicking a position
  };

  // Handle principle click - clear position selection when principle is clicked
  const handlePrincipleClick = (principleId: string | null) => {
    setSelectedPrincipleId(principleId);
    setSelectedPosition(null); // Clear position selection when clicking a principle
  };

  const getBackUrl = () => {
    if (!clubId) return '/dashboard';
    if (teamId && ageGroupId) {
      return Routes.teamTactics(clubId, ageGroupId, teamId);
    }
    if (ageGroupId) {
      return Routes.ageGroupTactics(clubId, ageGroupId);
    }
    return Routes.clubTactics(clubId);
  };

  const getEditUrl = () => {
    if (!clubId || !tacticId) return '#';
    if (teamId && ageGroupId) {
      return Routes.teamTacticEdit(clubId, ageGroupId, teamId, tacticId);
    }
    if (ageGroupId) {
      return Routes.ageGroupTacticEdit(clubId, ageGroupId, tacticId);
    }
    return Routes.clubTacticEdit(clubId, tacticId);
  };

  // Error state - API failed
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">Error loading tactic</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message || 'An unexpected error occurred'}</p>
            <Link to={getBackUrl()} className="text-blue-600 hover:underline inline-block">
              Back to Tactics
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Not found state - no data and not loading
  if (!tactic && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Tactic not found</p>
            <Link to={getBackUrl()} className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Tactics
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const getScopeLabel = () => {
    if (!tactic) return '';
    switch (tactic.scope.type) {
      case 'club': return 'Club';
      case 'ageGroup': return 'Age Group';
      case 'team': return 'Team';
      default: return 'Unknown';
    }
  };

  // Loading state with section-level skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          {/* Title/Subtitle Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1 animate-pulse">
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-5 w-96 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            {/* Pitch Display Skeleton */}
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>

            {/* Details Skeleton */}
            <div className="lg:col-span-6 space-y-2">
              {/* Summary Skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              </div>

              {/* Principles Skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                <div className="space-y-3">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render main content (tactic is guaranteed to exist here)
  if (!tactic) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <PageTitle
            title={tactic.name}
            subtitle={`${tacticDto?.parentFormationName || 'Unknown Formation'} • ${tactic.squadSize}-a-side${tactic.style ? ` • ${tactic.style}` : ''}`}
            badge={getScopeLabel()}
            backLink={getBackUrl()}
            action={{
            label: 'Settings',
            icon: 'settings',
            title: 'Settings',
            onClick: () => navigate(getEditUrl()),
            variant: 'primary'
          }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        {/* Pitch Display - 30% width on desktop */}
        <div className="lg:col-span-4">
          <TacticDisplay
            tactic={tactic}
            resolvedPositions={resolvedPositions}
            showDirections={true}
            showInheritance={true}
            onPositionClick={handlePositionClick}
            selectedPositionIndex={selectedPosition}
            highlightedPositionIndices={highlightedPositionIndices}
          />
        </div>

        {/* Tactic Details - 70% width on desktop */}
        <div className="lg:col-span-6 space-y-2">
          {/* Summary - Full width without title */}
          {tactic.summary && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="markdown-content">
                <Markdown>{tactic.summary}</Markdown>
              </div>
              {/* Tags - Under summary */}
              {tactic.tags && tactic.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tactic.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Principles Panel */}
          <PrinciplePanel
            principles={tactic.principles || []}
            resolvedPositions={resolvedPositions}
            selectedPositionIndex={selectedPosition}
            onPositionClick={handlePositionClick}
            selectedPrincipleId={selectedPrincipleId}
            onPrincipleClick={handlePrincipleClick}
            readOnly
          />
        </div>
      </div>
      </main>
    </div>
  );
}
