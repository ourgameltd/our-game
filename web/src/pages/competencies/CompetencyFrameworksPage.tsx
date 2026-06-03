import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Pencil, Trash2, Award, ChevronRight } from 'lucide-react';
import PageTitle from '@/components/common/PageTitle';
import EmptyState from '@/components/common/EmptyState';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/contexts/ToastContext';
import {
  useClubCompetencyFrameworks,
  useCreateCompetencyFramework,
  useArchiveCompetencyFramework,
  CompetencyFrameworkListItemDto,
} from '@/api/competencies';
import { Routes } from '@/utils/routes';

function FrameworkRowSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-none px-4 py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b animate-pulse">
      <div className="hidden md:flex md:items-center md:gap-4">
        <div className="w-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
          <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="shrink-0 w-20 text-center">
          <div className="h-5 w-8 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-1" />
          <div className="h-3 w-14 mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="md:hidden flex flex-col gap-2">
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

interface FrameworkRowProps {
  framework: CompetencyFrameworkListItemDto;
  busy?: boolean;
  onView: () => void;
  onClone?: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
}

function FrameworkRow({ framework, busy, onView, onClone, onEdit, onArchive }: FrameworkRowProps) {
  const indicatorClass = framework.isSystemDefault ? 'bg-gray-300 dark:bg-gray-600' : 'bg-primary-500 dark:bg-primary-400';
  const scopeLabel = framework.isSystemDefault ? 'System'
    : framework.scope === 'AgeGroup' ? 'Age Group'
    : framework.scope === 'Team' ? 'Team'
    : 'Club';

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg md:rounded-none border border-gray-200 dark:border-gray-700 md:border-0 md:border-b hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors overflow-hidden"
    >
      {/* Mobile layout */}
      <div className="md:hidden p-4">
        <div className="flex items-stretch gap-3">
          <div className={`w-1 self-stretch rounded-full shrink-0 ${indicatorClass}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <button onClick={onView} className="text-left font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {framework.name}
              </button>
            </div>
            {framework.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{framework.description}</p>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">{framework.assignmentCount} assignment{framework.assignmentCount !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button onClick={onEdit} className="btn-sm btn-secondary gap-1.5">
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                )}
                {onClone && (
                  <button onClick={onClone} disabled={busy} className="btn-sm btn-secondary gap-1.5">
                    <Copy className="w-4 h-4" /> {busy ? 'Cloning…' : 'Clone'}
                  </button>
                )}
                {onArchive && (
                  <button onClick={onArchive} className="btn-sm btn-danger gap-1.5">
                    <Trash2 className="w-4 h-4" /> Archive
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop row layout */}
      <div className="hidden md:flex md:items-center md:gap-4 px-4 py-3">
        {/* Accent bar */}
        <div className={`w-1 self-stretch rounded-full shrink-0 ${indicatorClass}`} />

        {/* Name & description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button onClick={onView} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate">
              {framework.name}
            </button>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
              {scopeLabel}
            </span>
          </div>
          {framework.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{framework.description}</p>
          )}
        </div>

        {/* Assignments */}
        <div className="shrink-0 w-[80px] text-center">
          <div className="text-base font-bold text-gray-900 dark:text-white">{framework.assignmentCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Assignments</div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="btn-sm btn-secondary gap-1.5"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
          {onClone && (
            <button
              onClick={onClone}
              disabled={busy}
              className="btn-sm btn-secondary gap-1.5"
            >
              <Copy className="w-4 h-4" /> {busy ? 'Cloning…' : 'Clone'}
            </button>
          )}
          {onArchive && (
            <button
              onClick={onArchive}
              className="btn-sm btn-danger gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Archive
            </button>
          )}
        </div>

        <ChevronRight className="shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>
    </div>
  );
}

export default function CompetencyFrameworksPage() {
  usePageTitle(['Competency Frameworks']);
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data, isLoading, refetch } = useClubCompetencyFrameworks(clubId);
  const { mutate: create, isSubmitting: isCreating } = useCreateCompetencyFramework();
  const { mutate: archive } = useArchiveCompetencyFramework();

  const [cloningId, setCloningId] = useState<string | null>(null);

  const handleClone = async (source: CompetencyFrameworkListItemDto) => {
    if (!clubId) return;
    setCloningId(source.id);
    const { ok, data: newId } = await create({
      name: `${source.name} (Copy)`,
      description: source.description,
      sourceFrameworkId: source.id,
      scope: 'Club',
      ownerClubId: clubId,
      upliftPercent: source.upliftPercent,
    });
    setCloningId(null);
    if (ok && newId) {
      addToast('success', `Cloned "${source.name}"`);
      await refetch();
      navigate(Routes.competencyFramework(clubId, newId));
    } else if (!ok) {
      addToast('error', 'Failed to clone framework');
    }
  };

  const handleArchive = async (framework: CompetencyFrameworkListItemDto) => {
    if (!confirm(`Archive "${framework.name}"? This is reversible from the database but hides it from the UI.`)) return;
    const { ok } = await archive(framework.id);
    if (ok) addToast('success', 'Framework archived');
    await refetch();
  };

  const goTo = (id: string) => navigate(Routes.competencyFramework(clubId!, id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle title="Competency Frameworks" subtitle="All frameworks available to your club — system, club, age group, and team." />

        {!isLoading && (data ?? []).length === 0 ? (
          <EmptyState
            icon={Award}
            title="No frameworks found"
            description="No competency frameworks are available for your club yet."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {isLoading
              ? [...Array(3)].map((_, i) => <FrameworkRowSkeleton key={i} />)
              : (data ?? []).map((f) => (
                  <FrameworkRow
                    key={f.id}
                    framework={f}
                    busy={cloningId === f.id || isCreating}
                    onView={() => goTo(f.id)}
                    onClone={() => handleClone(f)}
                    onEdit={!f.isSystemDefault ? () => goTo(f.id) : undefined}
                    onArchive={!f.isSystemDefault ? () => handleArchive(f) : undefined}
                  />
                ))}
          </div>
        )}
      </main>
    </div>
  );
}
