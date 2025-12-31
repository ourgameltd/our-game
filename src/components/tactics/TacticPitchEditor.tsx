import { useState, useRef, useCallback } from 'react';
import { Formation, Tactic, TacticalPositionOverride } from '@/types';

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
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoverPositionIndex, setHoverPositionIndex] = useState<number | null>(null);

  // Snap value to grid
  const snapToGridValue = useCallback(
    (value: number): number => {
      if (!snapToGrid) return value;
      return Math.round(value / gridSize) * gridSize;
    },
    [snapToGrid, gridSize]
  );

  // Get merged position (parent + override)
  const getMergedPosition = useCallback(
    (index: number) => {
      const parentPos = parentFormation.positions[index];
      const override = tactic.positionOverrides[index];
      
      return {
        position: parentPos.position,
        x: override?.x !== undefined ? override.x : parentPos.x,
        y: override?.y !== undefined ? override.y : parentPos.y,
        direction: override?.direction,
        isOverridden: !!override && (override.x !== undefined || override.y !== undefined),
      };
    },
    [parentFormation, tactic.positionOverrides]
  );

  // Handle pointer down (start drag)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      if (!pitchRef.current) return;

      // Regular position drag
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      
      const rect = pitchRef.current.getBoundingClientRect();
      const position = getMergedPosition(index);
      
      setDragState({
        isDragging: true,
        positionIndex: index,
        startX: (position.x / 100) * rect.width,
        startY: (position.y / 100) * rect.height,
      });

      // Select this position
      if (onPositionSelect) {
        onPositionSelect(index);
      }
    },
    [getMergedPosition, onPositionSelect]
  );

  // Handle pointer move (during drag)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState?.isDragging || !pitchRef.current) return;

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

      // Update override
      onPositionChange(dragState.positionIndex, {
        x: xPercent,
        y: yPercent,
      });
    },
    [dragState, snapToGridValue, onPositionChange]
  );

  // Handle pointer up (end drag)
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (dragState?.isDragging) {
        e.currentTarget.releasePointerCapture(e.pointerId);
        setDragState(null);
      }
    },
    [dragState]
  );

  // Handle position click (for selection)
  const handlePositionClick = useCallback(
    (_e: React.MouseEvent, index: number) => {
      if (onPositionSelect) {
        onPositionSelect(selectedPositionIndex === index ? null : index);
      }
    },
    [onPositionSelect, selectedPositionIndex]
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Pitch */}
      <div
        ref={pitchRef}
        className="relative w-full bg-gradient-to-b from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 cursor-crosshair"
        style={{ paddingBottom: '140%' }}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => handlePointerUp(e)}
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
        {parentFormation.positions.map((_, index) => {
          const mergedPos = getMergedPosition(index);
          const isSelected = selectedPositionIndex === index;
          const isHovered = hoverPositionIndex === index;

          return (
            <div
              key={index}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 group ${
                dragState?.positionIndex === index ? 'z-50 scale-110' : 'z-10'
              }`}
              style={{
                left: `${mergedPos.x}%`,
                top: `${mergedPos.y}%`,
              }}
              onPointerDown={(e) => handlePointerDown(e, index)}
              onPointerUp={(e) => handlePointerUp(e)}
              onClick={(e) => handlePositionClick(e, index)}
              onMouseEnter={() => setHoverPositionIndex(index)}
              onMouseLeave={() => setHoverPositionIndex(null)}
            >
              {/* Position marker */}
              <div className="relative cursor-move touch-none">
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

                {/* Position label */}
                <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 pointer-events-none">
                  <div className="bg-black/70 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                    {mergedPos.position}
                    {mergedPos.direction && (
                      <span className="ml-1 text-yellow-300">
                        ({mergedPos.direction})
                      </span>
                    )}
                  </div>
                </div>
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
