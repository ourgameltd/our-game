import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import type { TacticListDto } from '@/api';
import { sampleFormations } from '@data/formations';

interface TacticCardProps {
  tactic: TacticListDto;
  href: string;
  editHref: string;
  inheritedFrom?: string;
}

function MiniPitch({ tactic }: { tactic: TacticListDto }) {
  const positions =
    tactic.resolvedPositions && tactic.resolvedPositions.length > 0
      ? tactic.resolvedPositions.map(p => ({ x: p.x, y: p.y, position: p.position }))
      : sampleFormations.find(f => f.id === tactic.parentFormationId)?.positions ?? [];

  return (
    // Always full 140% height — correct pitch proportions, never distorted
    <div
      className="relative w-full bg-linear-to-b from-green-500 to-green-600 dark:from-green-700 dark:to-green-800"
      style={{ paddingBottom: '140%' }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140" preserveAspectRatio="none">
        <rect x="2" y="2" width="96" height="136" fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
        <line x1="2" y1="70" x2="98" y2="70" stroke="white" strokeWidth="0.3" opacity="0.8" />
        <circle cx="50" cy="70" r="8" fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
        <circle cx="50" cy="70" r="0.5" fill="white" opacity="0.8" />
        <rect x="22" y="2" width="56" height="14" fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
        <rect x="35" y="2" width="30" height="5" fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
        <rect x="22" y="124" width="56" height="14" fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
        <rect x="35" y="133" width="30" height="5" fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
        <rect x="42" y="0" width="16" height="2" fill="white" opacity="0.3" stroke="white" strokeWidth="0.2" />
        <rect x="42" y="138" width="16" height="2" fill="white" opacity="0.3" stroke="white" strokeWidth="0.2" />
        <circle cx="50" cy="10" r="0.5" fill="white" opacity="0.8" />
        <circle cx="50" cy="130" r="0.5" fill="white" opacity="0.8" />
      </svg>

      {positions.map((pos, i) => (
        <div
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 shadow bg-blue-600 dark:bg-blue-700 border-blue-400 dark:border-blue-500">
            <span className="text-[9px] font-bold text-white leading-none">{pos.position}</span>
          </div>
        </div>
      ))}

      {positions.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/70 text-xs">No positions</span>
        </div>
      )}
    </div>
  );
}

export function TacticCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden shadow border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="aspect-square bg-gray-300 dark:bg-gray-600" />
      <div className="bg-white dark:bg-gray-800 p-2.5 space-y-1.5">
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex gap-1">
          <div className="h-3.5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-3.5 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function TacticCard({ tactic, href, editHref, inheritedFrom }: TacticCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleTags = tactic.tags.slice(0, 3);
  const extraTagCount = tactic.tags.length - visibleTags.length;

  return (
    <div className={`relative rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 ${inheritedFrom ? 'opacity-80' : ''}`}>
      <Link to={href} className="block">
        {/* Clip wrapper: square by default, full pitch when expanded */}
        <div className={`relative ${isExpanded ? '' : 'aspect-square overflow-hidden'}`}>
          <MiniPitch tactic={tactic} />

          {inheritedFrom && (
            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-medium bg-black/50 text-white rounded">
              {inheritedFrom}
            </span>
          )}

          {/* Expand / collapse toggle */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(v => !v); }}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-0.5 transition-colors"
            title={isExpanded ? 'Collapse pitch' : 'Expand pitch'}
          >
            {isExpanded
              ? <ChevronUp className="w-3.5 h-3.5" />
              : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Metadata */}
        <div className="bg-white dark:bg-gray-800 p-2.5 pr-9">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug truncate mb-1.5">
            {tactic.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            {tactic.style && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full">
                {tactic.style}
              </span>
            )}
            {visibleTags.map(tag => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
              >
                {tag}
              </span>
            ))}
            {extraTagCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                +{extraTagCount}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Edit button — sibling link, not nested inside the main link */}
      <Link
        to={editHref}
        className="btn-sm btn-primary btn-icon absolute bottom-2 right-2"
        title="Edit tactic"
        aria-label="Edit tactic"
      >
        <Settings className="w-4 h-4" />
      </Link>
    </div>
  );
}
