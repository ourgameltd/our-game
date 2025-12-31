import { Tactic, PlayerDirection, TacticPrinciple } from '@/types';
import { ResolvedPosition } from '@/data/tactics';

interface TacticDisplayProps {
  tactic: Tactic;
  resolvedPositions: ResolvedPosition[];
  showDirections?: boolean;
  showInheritance?: boolean;
  onPositionClick?: (index: number) => void;
  selectedPositionIndex?: number | null;
  className?: string;
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
  className = '',
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
    ? getPrinciplesForPosition(tactic.principles, selectedPositionIndex, false) // Don't include global when showing for selected
    : [];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Football Pitch */}
      <div className="relative w-full bg-gradient-to-b from-green-500 to-green-600 dark:from-green-700 dark:to-green-800" style={{ paddingBottom: '140%' }}>
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
          const hasOverrides = showInheritance && pos.overriddenBy && pos.overriddenBy.length > 0;
          const hasPrinciples = hasSpecificPrinciples(tactic.principles, index);
          
          // Dim positions not related to selected position's principles
          const isDimmed = selectedPositionIndex !== null && 
            selectedPositionIndex !== undefined && 
            !isSelected &&
            selectedPrinciples.length > 0 &&
            !selectedPrinciples.some(p => p.positionIndices.includes(index));

          const handleClick = () => {
            if (onPositionClick) {
              onPositionClick(index);
            }
          };

          return (
            <div
              key={index}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                onPositionClick ? 'cursor-pointer hover:scale-110' : ''
              } transition-all duration-200 group ${isDimmed ? 'opacity-40' : ''}`}
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
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors ${
                    isSelected
                      ? 'bg-yellow-500 dark:bg-yellow-600 border-yellow-300 dark:border-yellow-400 ring-4 ring-yellow-400 dark:ring-yellow-500'
                      : hasOverrides
                      ? 'bg-blue-600 dark:bg-blue-700 border-orange-400 dark:border-orange-500 ring-2 ring-orange-400 dark:ring-orange-500'
                      : hasPrinciples
                      ? 'bg-blue-600 dark:bg-blue-700 border-purple-400 dark:border-purple-500 ring-2 ring-purple-400/50 dark:ring-purple-500/50'
                      : 'bg-blue-600 dark:bg-blue-700 border-blue-400 dark:border-blue-500'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {pos.position}
                  </span>
                </div>

                {/* Principle indicator dot */}
                {hasPrinciples && !isSelected && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-purple-500 rounded-full border border-white shadow-sm" />
                )}

                {/* Direction arrow - positioned outside the circle */}
                {showDirections && pos.direction && (() => {
                  const dirStyle = getDirectionStyle(pos.direction);
                  if (!dirStyle) return null;
                  
                  return (
                    <div 
                      className={`absolute ${dirStyle.position} pointer-events-none`}
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        className="drop-shadow-lg"
                        style={{ transform: `rotate(${dirStyle.rotation}deg)` }}
                      >
                        <path 
                          d="M12 4L6 14H18L12 4Z" 
                          fill="white" 
                          stroke="rgba(0,0,0,0.3)" 
                          strokeWidth="1"
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
    </div>
  );
}
