import { Tactic, ResolvedPosition, PlayerDirection, RelationshipType } from '@/types';

interface TacticDisplayProps {
  tactic: Tactic;
  resolvedPositions: ResolvedPosition[];
  showRelationships?: boolean;
  showDirections?: boolean;
  showInheritance?: boolean;
  onPositionClick?: (index: number) => void;
  selectedPositionIndex?: number;
  className?: string;
}

export default function TacticDisplay({
  tactic,
  resolvedPositions,
  showRelationships = true,
  showDirections = true,
  showInheritance = false,
  onPositionClick,
  selectedPositionIndex,
  className = '',
}: TacticDisplayProps) {
  // Get direction arrow symbol
  const getDirectionSymbol = (direction?: PlayerDirection) => {
    switch (direction) {
      case 'attacking':
        return '↑';
      case 'defensive':
        return '↓';
      case 'neutral':
      default:
        return '●';
    }
  };

  // Get line style for relationship type
  const getLineStyle = (type: RelationshipType) => {
    switch (type) {
      case 'passing-lane':
        return { strokeDasharray: 'none', stroke: 'white', opacity: 0.6 };
      case 'cover':
        return { strokeDasharray: '5,5', stroke: 'white', opacity: 0.6 };
      case 'overlap':
        return { strokeDasharray: 'none', stroke: 'yellow', opacity: 0.5 };
      case 'combination':
        return { strokeDasharray: '2,4', stroke: 'white', opacity: 0.5 };
      default:
        return { strokeDasharray: 'none', stroke: 'white', opacity: 0.6 };
    }
  };

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

          {/* Relationship lines */}
          {showRelationships && tactic.relationships?.map((rel, idx) => {
            const fromPos = resolvedPositions[rel.fromIndex];
            const toPos = resolvedPositions[rel.toIndex];
            
            if (!fromPos || !toPos) return null;
            
            const lineStyle = getLineStyle(rel.type);
            
            // For overlap type, draw a curved line
            if (rel.type === 'overlap') {
              // Calculate curve control point
              const midX = (fromPos.x + toPos.x) / 2;
              const midY = (fromPos.y + toPos.y) / 2;
              // Offset the control point perpendicular to the line
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const offsetX = -dy / dist * 8; // Perpendicular offset
              const offsetY = dx / dist * 8;
              
              return (
                <g key={`rel-${idx}`}>
                  <path
                    d={`M ${fromPos.x} ${fromPos.y} Q ${midX + offsetX} ${midY + offsetY} ${toPos.x} ${toPos.y}`}
                    fill="none"
                    stroke={lineStyle.stroke}
                    strokeWidth="0.4"
                    opacity={lineStyle.opacity}
                  />
                  {rel.label && (
                    <text
                      x={midX + offsetX}
                      y={midY + offsetY}
                      fill="white"
                      fontSize="2.5"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {rel.label}
                    </text>
                  )}
                </g>
              );
            }
            
            // Straight line for other types
            return (
              <g key={`rel-${idx}`}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={lineStyle.stroke}
                  strokeWidth="0.4"
                  strokeDasharray={lineStyle.strokeDasharray}
                  opacity={lineStyle.opacity}
                />
                {rel.label && (
                  <text
                    x={(fromPos.x + toPos.x) / 2}
                    y={(fromPos.y + toPos.y) / 2}
                    fill="white"
                    fontSize="2.5"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {rel.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Player positions */}
        {resolvedPositions.map((pos, index) => {
          const isSelected = index === selectedPositionIndex;
          const isInherited = showInheritance && pos.isInherited;
          const isOverridden = showInheritance && pos.isOverridden;

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
              } transition-all duration-200 group`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                opacity: isInherited && !isOverridden ? 0.5 : 1,
              }}
              onClick={handleClick}
              title={isInherited && pos.parentTacticName ? `Inherited from ${pos.parentTacticName}` : undefined}
            >
              {/* Direction arrow above/below */}
              {showDirections && pos.direction && (
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-6">
                  <span className="text-white text-lg font-bold drop-shadow-lg">
                    {getDirectionSymbol(pos.direction)}
                  </span>
                </div>
              )}

              {/* Position marker */}
              <div className="relative">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors ${
                    isSelected
                      ? 'bg-yellow-500 dark:bg-yellow-600 border-yellow-300 dark:border-yellow-400 ring-4 ring-yellow-400 dark:ring-yellow-500'
                      : isOverridden
                      ? 'bg-blue-600 dark:bg-blue-700 border-orange-400 dark:border-orange-500 ring-2 ring-orange-400 dark:ring-orange-500'
                      : 'bg-blue-600 dark:bg-blue-700 border-blue-400 dark:border-blue-500'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {pos.position}
                  </span>
                </div>

                {/* Position label below */}
                <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded text-center">
                    {pos.position}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tactic Info */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">{tactic.name}</span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">({tactic.system})</span>
          </div>
          <span className="text-gray-600 dark:text-gray-400">
            {tactic.squadSize}-a-side
          </span>
        </div>
        {tactic.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{tactic.description}</p>
        )}
      </div>
    </div>
  );
}
