import { useState, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, ArrowUpLeft, ArrowDownRight, ArrowDownLeft, Move } from 'lucide-react';
import { Formation, Tactic, TacticalPositionOverride, PlayerDirection } from '@/types';

interface TacticPitchEditorProps {
  tactic: Tactic;
  parentFormation: Formation;
  onPositionChange: (index: number, override: Partial<TacticalPositionOverride>) => void;
  snapToGrid?: boolean;
  gridSize?: number; // Default 5
  className?: string;
  onPositionSelect?: (index: number | null) => void;
  selectedPositionIndex?: number | null;
}

interface DragState {
  isDragging: boolean;
  positionIndex: number;
  startX: number;
  startY: number;
}

// Direction button configuration
const directionButtons: { direction: PlayerDirection; icon: typeof ArrowUp; position: string }[] = [
  { direction: 'N', icon: ArrowUp, position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full' },
  { direction: 'NE', icon: ArrowUpRight, position: 'top-0 right-0 translate-x-1/2 -translate-y-1/2' },
  { direction: 'E', icon: ArrowRight, position: 'top-1/2 right-0 translate-x-full -translate-y-1/2' },
  { direction: 'SE', icon: ArrowDownRight, position: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2' },
  { direction: 'S', icon: ArrowDown, position: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full' },
  { direction: 'SW', icon: ArrowDownLeft, position: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2' },
  { direction: 'W', icon: ArrowLeft, position: 'top-1/2 left-0 -translate-x-full -translate-y-1/2' },
  { direction: 'NW', icon: ArrowUpLeft, position: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2' },
];

// Get direction arrow rotation based on compass direction
const getDirectionRotation = (direction?: PlayerDirection): number | null => {
  if (!direction) return null;
  
  const rotationMap: Record<PlayerDirection, number> = {
    'N': 0,
    'S': 180,
    'E': 90,
    'W': -90,
    'NE': 45,
    'NW': -45,
    'SE': 135,
    'SW': -135,
    'WN': -45,
    'WS': -135,
    'EN': 45,
    'ES': 135,
  };
  
  return rotationMap[direction] ?? null;
};

export default function TacticPitchEditor({
  tactic,
  parentFormation,
  onPositionChange,
  snapToGrid = true,
  gridSize = 5,
  className = '',
  onPositionSelect,
  selectedPositionIndex = null,
}: TacticPitchEditorProps) {
  const pitchRef = useRef<HTMLDivElement>(null);
  const [hoverPositionIndex, setHoverPositionIndex] = useState<number | null>(null);
  const [showDirectionFlyout, setShowDirectionFlyout] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragPreviewPos, setDragPreviewPos] = useState<{ x: number; y: number } | null>(null);

  // Snap value to grid
  const snapToGridValue = useCallback(
    (value: number): number => {
      if (!snapToGrid) return value;
      return Math.round(value / gridSize) * gridSize;
    },
    [snapToGrid, gridSize]
  );

  // Get merged position (parent + override) - not memoized to ensure fresh data on every render
  const getMergedPosition = (index: number) => {
    const parentPos = parentFormation.positions?.[index];
    const override = tactic.positionOverrides?.[index];
    
    const result = {
      position: parentPos?.position || '',
      x: override?.x !== undefined ? override.x : (parentPos?.x ?? 50),
      y: override?.y !== undefined ? override.y : (parentPos?.y ?? 50),
      direction: override?.direction || parentPos?.direction,
      isOverridden: !!override && (override.x !== undefined || override.y !== undefined || override.direction !== undefined),
    };
    
    return result;
  };

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggingIndex(index);
    // Make the drag image invisible
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle drag over pitch
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Update preview position
    if (draggingIndex !== null && pitchRef.current) {
      const rect = pitchRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let xPercent = (x / rect.width) * 100;
      let yPercent = (y / rect.height) * 100;

      xPercent = Math.max(2, Math.min(98, xPercent));
      yPercent = Math.max(2, Math.min(98, yPercent));

      xPercent = snapToGridValue(xPercent);
      yPercent = snapToGridValue(yPercent);

      setDragPreviewPos({ x: xPercent, y: yPercent });
    }
  }, [draggingIndex, snapToGridValue]);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (draggingIndex === null || !pitchRef.current) return;

      const rect = pitchRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert to percentage
      let xPercent = (x / rect.width) * 100;
      let yPercent = (y / rect.height) * 100;

      // Clamp to pitch boundaries (2-98% to account for markings)
      xPercent = Math.max(2, Math.min(98, xPercent));
      yPercent = Math.max(2, Math.min(98, yPercent));

      // Apply snap-to-grid
      xPercent = snapToGridValue(xPercent);
      yPercent = snapToGridValue(yPercent);

      // Update position
      onPositionChange(draggingIndex, {
        x: xPercent,
        y: yPercent,
      });

      setDraggingIndex(null);
      setDragPreviewPos(null);
    },
    [draggingIndex, snapToGridValue, onPositionChange]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggingIndex(null);
    setDragPreviewPos(null);
  }, []);

  // Handle position click (toggle direction flyout)
  const handlePositionClick = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      
      // Toggle flyout for this position
      if (showDirectionFlyout === index) {
        setShowDirectionFlyout(null);
      } else {
        setShowDirectionFlyout(index);
      }
      
      if (onPositionSelect) {
        onPositionSelect(index);
      }
    },
    [showDirectionFlyout, onPositionSelect]
  );

  // Handle direction selection from flyout
  const handleDirectionSelect = useCallback(
    (index: number, direction: PlayerDirection | null) => {
      const currentDir = getMergedPosition(index).direction;
      if (direction === null || currentDir === direction) {
        onPositionChange(index, { direction: undefined });
      } else {
        onPositionChange(index, { direction });
      }
      setShowDirectionFlyout(null);
    },
    [onPositionChange]
  );

  // Handle pitch click
  const handlePitchClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if clicking directly on the pitch, not on a position
      if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
        setShowDirectionFlyout(null);
        if (onPositionSelect) {
          onPositionSelect(null);
        }
      }
    },
    [onPositionSelect]
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Pitch */}
      <div
        ref={pitchRef}
        className="relative w-full bg-gradient-to-b from-green-500 to-green-600 dark:from-green-700 dark:to-green-800"
        style={{ paddingBottom: '140%' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handlePitchClick}
      >
        {/* Pitch markings */}
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
        {(parentFormation.positions || []).map((_, index) => {
          const mergedPos = getMergedPosition(index);
          const isSelected = selectedPositionIndex === index;
          const isHovered = hoverPositionIndex === index;
          const isDragging = draggingIndex === index;
          
          // Use preview position if this marker is being dragged
          const displayX = isDragging && dragPreviewPos ? dragPreviewPos.x : mergedPos.x;
          const displayY = isDragging && dragPreviewPos ? dragPreviewPos.y : mergedPos.y;

          return (
            <div
              key={index}
              draggable
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-move ${
                showDirectionFlyout === index 
                  ? 'z-[90]' 
                  : isDragging
                  ? 'z-50 scale-110' 
                  : 'z-10'
              }`}
              style={{
                left: `${displayX}%`,
                top: `${displayY}%`,
              }}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onClick={(e) => handlePositionClick(e, index)}
              onMouseEnter={() => setHoverPositionIndex(index)}
              onMouseLeave={() => setHoverPositionIndex(null)}
            >
              {/* Position marker */}
              <div className="relative cursor-move">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${
                    isSelected
                      ? 'bg-yellow-500 dark:bg-yellow-600 border-yellow-300 dark:border-yellow-400 ring-4 ring-yellow-400/50'
                      : mergedPos.isOverridden
                      ? 'bg-blue-600 dark:bg-blue-700 border-blue-400 dark:border-blue-500 ring-4 ring-blue-400/50'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50'
                  } ${isHovered ? 'scale-110' : ''}`}
                >
                  <span
                    className={`text-sm font-bold ${
                      isSelected || mergedPos.isOverridden
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {mergedPos.position}
                  </span>
                </div>

                {/* Override indicator */}
                {mergedPos.isOverridden && !isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}

                {/* Direction arrow with line - from circle edge */}
                {mergedPos.direction && (() => {
                  const rotation = getDirectionRotation(mergedPos.direction);
                  if (rotation === null) return null;
                  
                  // Calculate line and arrow positioning based on direction
                  const rad = (rotation - 90) * (Math.PI / 180);
                  const circleRadius = 24; // Half of w-12 (48px)
                  const lineLength = 20;
                  
                  // Start point (edge of circle)
                  const startX = 30 + Math.cos(rad) * circleRadius;
                  const startY = 30 + Math.sin(rad) * circleRadius;
                  
                  // End point (where arrow tip will be)
                  const endX = 30 + Math.cos(rad) * (circleRadius + lineLength);
                  const endY = 30 + Math.sin(rad) * (circleRadius + lineLength);
                  
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
                          x1={startX + 20} 
                          y1={startY + 20} 
                          x2={endX + 20} 
                          y2={endY + 20}
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
                          transform={`translate(${endX + 20}, ${endY + 20}) rotate(${rotation})`}
                        />
                      </svg>
                    </div>
                  );
                })()}

                {/* Position label */}
                <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 pointer-events-none">
                  <div className="bg-black/70 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                    {mergedPos.position}
                  </div>
                </div>

                {/* Direction Flyout */}
                {showDirectionFlyout === index && (
                  <div 
                    className="absolute inset-0 z-[100] pointer-events-auto" 
                    style={{ width: '120px', height: '120px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                  >
                    {/* Background circle for better visibility */}
                    <div className="absolute inset-0 bg-black/30 rounded-full pointer-events-none" style={{ width: '120px', height: '120px' }} />
                    
                    {/* Direction buttons arranged in a circle */}
                    {directionButtons.map(({ direction, icon: Icon, position }) => (
                      <button
                        key={direction}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDirectionSelect(index, direction);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={`absolute z-[110] ${position} w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg pointer-events-auto ${
                          mergedPos.direction === direction
                            ? 'bg-yellow-500 text-white scale-110'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white hover:scale-110'
                        }`}
                        title={direction}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info bar */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white dark:bg-gray-700 border-2 border-gray-300 opacity-50" />
              <span className="text-gray-600 dark:text-gray-400">Inherited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-blue-400 ring-2 ring-blue-400/50" />
              <span className="text-gray-600 dark:text-gray-400">Overridden</span>
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {snapToGrid ? `Grid: ${gridSize}%` : 'Free positioning'}
          </div>
        </div>
      </div>
    </div>
  );
}
