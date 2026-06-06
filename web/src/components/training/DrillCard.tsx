import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, GitBranch, Dumbbell, Images } from 'lucide-react';
import type { DrillListDto } from '@/api/client';
import DrillDiagramRenderer from './DrillDiagramRenderer';
import { getDrillCategoryLabel, normalizeDrillCategory } from '@/constants/referenceData';

interface DrillCardProps {
  drill: DrillListDto;
  href: string;
  editHref: string;
  isInherited?: boolean;
}

function getCategoryPillClasses(category: string) {
  const normalizedCategory = normalizeDrillCategory(category);
  switch (normalizedCategory) {
    case 'Skills Practice':
      return 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700/60';
    case 'Game Related Practice':
      return 'bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/60';
    case 'Conditioned Game':
      return 'bg-emerald-100 text-emerald-900 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/60';
    case 'Drill':
    default:
      return 'bg-slate-200 text-slate-900 border border-slate-300 dark:bg-slate-700/50 dark:text-slate-100 dark:border-slate-600';
  }
}

export function DrillCardSkeleton() {
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

export default function DrillCard({ drill, href, editHref, isInherited }: DrillCardProps) {
  const slideCount = drill.drillDiagramConfig?.frames?.length ?? 0;
  const [activeFrame, setActiveFrame] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleMouseEnter = () => {
    if (slideCount <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveFrame(prev => (prev + 1) % slideCount);
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setActiveFrame(0);
  };

  const topBorderClass = isInherited
    ? 'border-t-[3px] border-t-gray-300 dark:border-t-gray-600'
    : 'border-t-[3px] border-t-primary-500 dark:border-t-primary-400';

  return (
    <div
      className={`relative rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 ${topBorderClass} ${isInherited ? 'opacity-80' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={href} className="block">
        <div className="relative overflow-hidden">
          {drill.drillDiagramConfig ? (
            <DrillDiagramRenderer drillDiagramConfig={drill.drillDiagramConfig} forceSquare frameIndex={activeFrame} />
          ) : (
            <div className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
              <Dumbbell className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
          )}

          {isInherited && (
            <span
              className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-black/50 text-white rounded"
              title="Inherited drill"
            >
              <GitBranch className="w-3 h-3" />
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-2.5 pr-9">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug truncate mb-1">
            {drill.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1">
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full whitespace-nowrap ${getCategoryPillClasses(drill.category)}`}>
              {getDrillCategoryLabel(drill.category)}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">⏱️ {drill.duration}m</span>
            {slideCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                <Images className="w-3 h-3" aria-hidden="true" />
                {slideCount}
              </span>
            )}
          </div>
        </div>
      </Link>

      <Link
        to={editHref}
        className="btn-sm btn-primary btn-icon absolute bottom-2 right-2"
        title="Edit drill"
        aria-label="Edit drill"
      >
        <Settings className="w-4 h-4" />
      </Link>
    </div>
  );
}
