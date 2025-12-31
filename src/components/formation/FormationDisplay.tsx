import { Plus } from 'lucide-react';
import { Formation, PlayerPosition } from '@/types';

interface FormationDisplayProps {
  formation: Formation;
  selectedPlayers?: { playerId: string; position: PlayerPosition }[];
  onPositionClick?: (position: PlayerPosition, x: number, y: number) => void;
  onPlayerClick?: (playerIndex: number) => void;
  getPlayerName?: (playerId: string) => string;
  interactive?: boolean;
  showPlayerNames?: boolean;
  className?: string;
  highlightedPlayerIndex?: number | null;
}

export default function FormationDisplay({
  formation,
  selectedPlayers = [],
  onPositionClick,
  onPlayerClick,
  getPlayerName,
  interactive = false,
  showPlayerNames = true,
  className = '',
  highlightedPlayerIndex,
}: FormationDisplayProps) {
  // Create a mapping: for each formation position, assign a player from selectedPlayers
  // This allows players to be in any position regardless of their stored position label
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Formation Header */}
      {/* <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 px-4 py-3">
        <h3 className="text-white font-semibold text-lg">{formation.name}</h3>
        <p className="text-green-100 text-sm">{formation.system} Formation</p>
      </div> */}

      {/* Football Pitch */}
      <div className="relative w-full bg-gradient-to-b from-green-500 to-green-600 dark:from-green-700 dark:to-green-800" style={{ paddingBottom: '140%' }}>
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
        {(formation.positions || []).map((pos, formationIndex) => {
          // Simply map formation positions to players by index order
          // This allows any player to be in any formation slot after swapping
          const player = selectedPlayers[formationIndex];
          const hasPlayer = !!player;
          const playerName = hasPlayer && getPlayerName ? getPlayerName(player.playerId) : '';
          const initials = playerName ? playerName.split(' ').map(n => n[0]).join('') : '';
          const isHighlighted = hasPlayer && formationIndex === highlightedPlayerIndex;

          const handleClick = () => {
            if (interactive) {
              if (hasPlayer && onPlayerClick) {
                onPlayerClick(formationIndex);
              } else if (onPositionClick) {
                onPositionClick(pos.position, pos.x, pos.y);
              }
            }
          };

          return (
            <div
              key={formationIndex}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                interactive ? 'cursor-pointer hover:scale-110' : ''
              } transition-all duration-200 group hover:z-50`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
              onClick={handleClick}
            >
              {/* Position marker */}
              <div className="relative">
                {/* Circle with position or player */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors ${
                    isHighlighted
                      ? 'bg-yellow-500 dark:bg-yellow-600 border-yellow-300 dark:border-yellow-400 ring-4 ring-yellow-400 dark:ring-yellow-500 animate-pulse'
                      : hasPlayer
                      ? 'bg-blue-600 dark:bg-blue-700 border-blue-400 dark:border-blue-500'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      hasPlayer
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {hasPlayer ? initials : pos.position}
                  </span>
                </div>

                {/* Position label below */}
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

                {/* Empty position indicator */}
                {!hasPlayer && interactive && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-4 h-4 bg-yellow-400 dark:bg-yellow-500 rounded-full flex items-center justify-center border border-yellow-600">
                      <Plus className="w-3 h-3 text-yellow-900" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Formation Info */}
      {/* {formation.description && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">{formation.description}</p>
        </div>
      )}

      {/* Tactics */}
      {/* {formation.tactics && formation.tactics.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Key Tactics:</h4>
          <ul className="space-y-1">
            {formation.tactics.map((tactic, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                <span>{tactic}</span>
              </li>
            ))}
          </ul>
        </div>
      )}  */}

      {/* Player count summary */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Players assigned:</span>
          <span className={`font-semibold ${
            selectedPlayers.length === formation.squadSize
              ? 'text-green-600 dark:text-green-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}>
            {selectedPlayers.length} / {formation.squadSize}
          </span>
        </div>
      </div>
    </div>
  );
}
