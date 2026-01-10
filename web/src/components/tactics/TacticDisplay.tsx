import { Plus } from 'lucide-react';
import { Tactic, PlayerDirection, TacticPrinciple, PlayerPosition } from '@/types';
import { ResolvedPosition } from '@/data/tactics';

interface SelectedPlayer {
  playerId: string;
  position: PlayerPosition;
}

interface TacticDisplayProps {
  tactic: Tactic;
  resolvedPositions: ResolvedPosition[];
  showDirections?: boolean;
  showInheritance?: boolean;
  onPositionClick?: (index: number) => void;
  selectedPositionIndex?: number | null;
  highlightedPositionIndices?: number[]; // For principle highlighting
  className?: string;
  compact?: boolean;
  // Player assignment props (optional - for match lineup display)
  selectedPlayers?: SelectedPlayer[];
  getPlayerName?: (playerId: string) => string;
  showPlayerNames?: boolean;
  interactive?: boolean;
  highlightedPlayerIndex?: number | null;
}

/**
 * Get principles that apply to a specific position
 * Returns principles that either:
 * - Have this position explicitly listed
 * - Apply to all players (empty positionIndices array)
 */
export function getPrinciplesForPosition(
  principles: TacticPrinciple[],
  positionIndex: number,
  includeGlobal: boolean = true
): TacticPrinciple[] {
  return principles.filter(p => {
    // Global principle (applies to all)
    if (p.positionIndices.length === 0) {
      return includeGlobal;
    }
    // Position-specific principle
    return p.positionIndices.includes(positionIndex);
  });
}

/**
 * Check if a position has any non-global principles
 */
export function hasSpecificPrinciples(
  principles: TacticPrinciple[],
  positionIndex: number
): boolean {
  return principles.some(p => 
    p.positionIndices.length > 0 && p.positionIndices.includes(positionIndex)
  );
}

export default function TacticDisplay({
  tactic,
  resolvedPositions,
  showDirections = true,
  showInheritance = false,
  onPositionClick,
  selectedPositionIndex,
  highlightedPositionIndices = [],
  className = '',
  compact = false,
  // Player assignment props
  selectedPlayers = [],
  getPlayerName,
  showPlayerNames = true,
  interactive = false,
  highlightedPlayerIndex,
}: TacticDisplayProps) {
  // Get direction arrow positioning and rotation based on compass direction
  const getDirectionStyle = (direction?: PlayerDirection): { rotation: number; position: string } | null => {
    if (!direction) return null;
    
    // Map compass directions to rotation degrees (0 = pointing up/north)
    // and position classes for where the arrow should appear relative to the circle
    const directionMap: Record<PlayerDirection, { rotation: number; position: string }> = {
      'N': { rotation: 0, position: 'bottom-full left-1/2 -translate-x-1/2 mb-1' },
      'S': { rotation: 180, position: 'top-full left-1/2 -translate-x-1/2 mt-1' },
      'E': { rotation: 90, position: 'left-full top-1/2 -translate-y-1/2 ml-1' },
      'W': { rotation: -90, position: 'right-full top-1/2 -translate-y-1/2 mr-1' },
      'NE': { rotation: 45, position: 'bottom-full left-full -translate-x-1/4 mb-0.5' },
      'NW': { rotation: -45, position: 'bottom-full right-full translate-x-1/4 mb-0.5' },
      'SE': { rotation: 135, position: 'top-full left-full -translate-x-1/4 mt-0.5' },
      'SW': { rotation: -135, position: 'top-full right-full translate-x-1/4 mt-0.5' },
      'WN': { rotation: -45, position: 'right-full top-1/2 -translate-y-full mr-0.5' },
      'WS': { rotation: -135, position: 'right-full top-1/2 translate-y-0 mr-0.5' },
      'EN': { rotation: 45, position: 'left-full top-1/2 -translate-y-full ml-0.5' },
      'ES': { rotation: 135, position: 'left-full top-1/2 translate-y-0 ml-0.5' },
    };
    
    return directionMap[direction] || null;
  };

  // Get principles for selected position (excluding global ones that apply to everyone)
  const selectedPrinciples = selectedPositionIndex !== null && selectedPositionIndex !== undefined
    ? getPrinciplesForPosition(tactic.principles || [], selectedPositionIndex, false) // Don't include global when showing for selected
    : [];

  return (
    <div className={`bg-white dark:bg-gray-800 ${compact ? '' : 'rounded-lg border border-gray-200 dark:border-gray-700'} overflow-hidden h-full ${className}`}>
      {/* Football Pitch */}
      <div className="relative w-full h-full bg-gradient-to-b from-green-500 to-green-600 dark:from-green-700 dark:to-green-800" style={compact ? {} : { paddingBottom: '140%' }}>
        {/* Pitch markings SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140" preserveAspectRatio="none">
          {/* Outer boundary */}
          <rect x="2" y="2" width="96" height="136" fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
          
          {/* Halfway line */}
          <line x1="2" y1="70" x2="98" y2="70" stroke="white" strokeWidth="0.3" opacity="0.8" />
          
          {/* Center circle */}
          <circle cx="50" cy="70" r="8" fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
          <circle cx="50" cy="70" r="0.5" fill="white" opacity="0.8" />
          
          {/* Top penalty area */}
          <rect x="22" y="2" width="56" height="14" fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
          <rect x="35" y="2" width="30" height="5" fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
          
          {/* Bottom penalty area */}
          <rect x="22" y="124" width="56" height="14" fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
          <rect x="35" y="133" width="30" height="5" fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
          
          {/* Top goal */}
          <rect x="42" y="0" width="16" height="2" fill="white" opacity="0.3" stroke="white" strokeWidth="0.2" />
          
          {/* Bottom goal */}
          <rect x="42" y="138" width="16" height="2" fill="white" opacity="0.3" stroke="white" strokeWidth="0.2" />
          
          {/* Penalty spots */}
          <circle cx="50" cy="10" r="0.5" fill="white" opacity="0.8" />
          <circle cx="50" cy="130" r="0.5" fill="white" opacity="0.8" />
        </svg>

        {/* Player positions */}
        {resolvedPositions.map((pos, index) => {
          const isSelected = index === selectedPositionIndex;
          const isPrincipleHighlighted = highlightedPositionIndices.includes(index);
          const hasOverrides = showInheritance && pos.overriddenBy && pos.overriddenBy.length > 0;
          const hasPrinciples = hasSpecificPrinciples(tactic.principles || [], index);
          
          // Player assignment support
          const player = selectedPlayers[index];
          const hasPlayer = !!player;
          const playerName = hasPlayer && getPlayerName ? getPlayerName(player.playerId) : '';
          const initials = playerName ? playerName.split(' ').map(n => n[0]).join('') : '';
          const isHighlighted = hasPlayer && index === highlightedPlayerIndex;
          
          // Dim positions not related to selected position's principles OR selected principle's positions
          const isDimmed = (selectedPositionIndex !== null && 
            selectedPositionIndex !== undefined && 
            !isSelected &&
            selectedPrinciples.length > 0 &&
            !selectedPrinciples.some(p => p.positionIndices.includes(index))) ||
            (highlightedPositionIndices.length > 0 && !isPrincipleHighlighted);

          const handleClick = () => {
            if (onPositionClick) {
              onPositionClick(index);
            }
          };

          return (
            <div
              key={index}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                onPositionClick || interactive ? 'cursor-pointer hover:scale-110' : ''
              } transition-all duration-200 group hover:z-50 ${isDimmed ? 'opacity-40' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
              onClick={handleClick}
              title={hasOverrides ? `Overridden by: ${pos.overriddenBy?.join(', ')}` : undefined}
            >
              {/* Position marker */}
              <div className="relative">
                <div
                  className={`${
                    compact 
                      ? 'w-4 h-4' 
                      : 'w-10 h-10 sm:w-12 sm:h-12'
                  } rounded-full flex items-center justify-center border-2 shadow-lg transition-colors ${
                    isHighlighted
                      ? 'bg-yellow-500 dark:bg-yellow-600 border-yellow-300 dark:border-yellow-400 ring-4 ring-yellow-400 dark:ring-yellow-500 animate-pulse'
                      : isSelected
                      ? 'bg-yellow-500 dark:bg-yellow-600 border-yellow-300 dark:border-yellow-400 ring-4 ring-yellow-400 dark:ring-yellow-500'
                      : isPrincipleHighlighted
                      ? 'bg-purple-500 dark:bg-purple-600 border-purple-300 dark:border-purple-400 ring-4 ring-purple-400 dark:ring-purple-500'
                      : hasPlayer
                      ? 'bg-blue-600 dark:bg-blue-700 border-blue-400 dark:border-blue-500'
                      : hasOverrides
                      ? 'bg-blue-600 dark:bg-blue-700 border-orange-400 dark:border-orange-500 ring-2 ring-orange-400 dark:ring-orange-500'
                      : hasPrinciples
                      ? 'bg-blue-600 dark:bg-blue-700 border-purple-400 dark:border-purple-500 ring-2 ring-purple-400/50 dark:ring-purple-500/50'
                      : selectedPlayers.length > 0
                      ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      : 'bg-blue-600 dark:bg-blue-700 border-blue-400 dark:border-blue-500'
                  }`}
                >
                  {!compact && (
                    <span className={`text-xs sm:text-sm font-bold ${
                      hasPlayer || (!selectedPlayers.length && !hasOverrides) || isPrincipleHighlighted
                        ? 'text-white'
                        : selectedPlayers.length > 0 && !hasPlayer
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-white'
                    }`}>
                      {hasPlayer ? initials : pos.position}
                    </span>
                  )}
                </div>

                {/* Position label below */}
                {!compact && (
                  <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                    <div className="bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded text-center">
                      {pos.position}
                    </div>
                    {hasPlayer && showPlayerNames && (
                      <div className="bg-blue-600/90 dark:bg-blue-700/90 text-white text-[10px] px-1.5 py-0.5 rounded mt-0.5 max-w-[60px] group-hover:max-w-none truncate group-hover:whitespace-nowrap transition-all duration-200 text-center">
                        {playerName}
                      </div>
                    )}
                  </div>
                )}

                {/* Empty position indicator - for player assignment mode */}
                {!hasPlayer && interactive && selectedPlayers.length > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-4 h-4 bg-yellow-400 dark:bg-yellow-500 rounded-full flex items-center justify-center border border-yellow-600">
                      <Plus className="w-3 h-3 text-yellow-900" />
                    </div>
                  </div>
                )}

                {/* Principle indicator dot - hidden in compact mode and player assignment mode */}
                {!compact && hasPrinciples && !isSelected && !selectedPlayers.length && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-purple-500 rounded-full border border-white shadow-sm" />
                )}

                {/* Direction arrow with line - positioned outside the circle, hidden in compact mode */}
                {!compact && showDirections && pos.direction && (() => {
                  const dirStyle = getDirectionStyle(pos.direction);
                  if (!dirStyle) return null;
                  
                  // Calculate line and arrow positioning based on direction
                  // Arrow points in the direction, line connects from circle edge to arrow
                  const getLineCoords = (rotation: number) => {
                    // Convert rotation to radians (0 = up/north)
                    const rad = (rotation - 90) * (Math.PI / 180);
                    const circleRadius = 24; // Half of the circle size (w-12 = 48px, so radius = 24)
                    const lineLength = 20;
                    
                    // Start point (edge of circle)
                    const startX = 30 + Math.cos(rad) * circleRadius;
                    const startY = 30 + Math.sin(rad) * circleRadius;
                    
                    // End point (where arrow tip will be)
                    const endX = 30 + Math.cos(rad) * (circleRadius + lineLength);
                    const endY = 30 + Math.sin(rad) * (circleRadius + lineLength);
                    
                    return { startX, startY, endX, endY, rad };
                  };
                  
                  const coords = getLineCoords(dirStyle.rotation);
                  
                  return (
                    <div 
                      className="absolute inset-0 pointer-events-none z-20"
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        left: '50%', 
                        top: '50%', 
                        transform: 'translate(-50%, -50%)' 
                      }}
                    >
                      <svg 
                        width="100" 
                        height="100" 
                        viewBox="0 0 100 100" 
                        fill="none" 
                        className="drop-shadow-lg overflow-visible"
                      >
                        {/* Line from circle edge */}
                        <line 
                          x1={coords.startX + 20} 
                          y1={coords.startY + 20} 
                          x2={coords.endX + 20} 
                          y2={coords.endY + 20}
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="drop-shadow-md"
                          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                        />
                        {/* Arrow head at end */}
                        <polygon 
                          points="0,-6 5,4 -5,4"
                          fill="white"
                          stroke="rgba(0,0,0,0.4)"
                          strokeWidth="1"
                          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                          transform={`translate(${coords.endX + 20}, ${coords.endY + 20}) rotate(${dirStyle.rotation})`}
                        />
                      </svg>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Player count summary - only shown when in player assignment mode */}
      {selectedPlayers.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Players assigned:</span>
            <span className={`font-semibold ${
              selectedPlayers.length === tactic.squadSize
                ? 'text-green-600 dark:text-green-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {selectedPlayers.length} / {tactic.squadSize}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
