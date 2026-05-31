import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Edit3, Trash2, Award } from 'lucide-react';
import PageTitle from '@/components/common/PageTitle';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/contexts/ToastContext';
import {
  useClubCompetencyFrameworks,
  useCreateCompetencyFramework,
  useArchiveCompetencyFramework,
  CompetencyFrameworkListItemDto,
} from '@/api/competencies';

export default function CompetencyFrameworksPage() {
  usePageTitle(['Competency Frameworks']);
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data, isLoading, refetch } = useClubCompetencyFrameworks(clubId);
  const { mutate: create, isSubmitting: isCreating } = useCreateCompetencyFramework();
  const { mutate: archive } = useArchiveCompetencyFramework();

  const [cloningId, setCloningId] = useState<string | null>(null);

  const systemFrameworks = useMemo(() => (data ?? []).filter((f) => f.isSystemDefault), [data]);
  const clubFrameworks = useMemo(() => (data ?? []).filter((f) => !f.isSystemDefault), [data]);

  const handleClone = async (source: CompetencyFrameworkListItemDto) => {
    if (!clubId) return;
    setCloningId(source.id);
    const newId = await create({
      name: `${source.name} (Copy)`,
      description: source.description,
      sourceFrameworkId: source.id,
      scope: 'Club',
      ownerClubId: clubId,
      upliftPercent: source.upliftPercent,
    });
    setCloningId(null);
    if (newId) {
      addToast('success', `Cloned "${source.name}"`);
      await refetch();
      navigate(`/dashboard/${clubId}/competency-frameworks/${newId}`);
    } else {
      addToast('error', 'Failed to clone framework');
    }
  };

  const handleArchive = async (framework: CompetencyFrameworkListItemDto) => {
    if (!confirm(`Archive "${framework.name}"? This is reversible from the database but hides it from the UI.`)) return;
    await archive(framework.id);
    addToast('success', 'Framework archived');
    await refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4 max-w-6xl">
        <PageTitle title="Competency Frameworks" subtitle="System defaults and club-owned frameworks." />

        {isLoading && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            <section className="mt-6">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                System defaults
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemFrameworks.map((f) => (
                  <FrameworkCard
                    key={f.id}
                    framework={f}
                    busy={cloningId === f.id || isCreating}
                    onView={() => navigate(`/dashboard/${clubId}/competency-frameworks/${f.id}`)}
                    onClone={() => handleClone(f)}
                  />
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Club frameworks
              </h2>
              {clubFrameworks.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                  <Award className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No custom frameworks yet. Clone a system framework to start customising.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clubFrameworks.map((f) => (
                    <FrameworkCard
                      key={f.id}
                      framework={f}
                      onView={() => navigate(`/dashboard/${clubId}/competency-frameworks/${f.id}`)}
                      onEdit={() => navigate(`/dashboard/${clubId}/competency-frameworks/${f.id}`)}
                      onArchive={() => handleArchive(f)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

interface FrameworkCardProps {
  framework: CompetencyFrameworkListItemDto;
  busy?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onClone?: () => void;
  onArchive?: () => void;
}

function FrameworkCard({ framework, busy, onView, onEdit, onClone, onArchive }: FrameworkCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <button
          onClick={onView}
          className="text-left font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {framework.name}
        </button>
        {framework.isSystemDefault && (
          <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
            System
          </span>
        )}
      </div>
      {framework.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-3">{framework.description}</p>
      )}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Uplift {framework.upliftPercent}% · Assignments {framework.assignmentCount}
      </div>
      <div className="mt-auto flex items-center gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <Edit3 size={12} /> Edit
          </button>
        )}
        {onClone && (
          <button
            onClick={onClone}
            disabled={busy}
            className="flex items-center gap-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors"
          >
            <Copy size={12} /> {busy ? 'Cloning…' : 'Clone'}
          </button>
        )}
        {onArchive && (
          <button
            onClick={onArchive}
            className="flex items-center gap-1 text-xs px-2 py-1 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 ml-auto transition-colors"
          >
            <Trash2 size={12} /> Archive
          </button>
        )}
      </div>
    </div>
  );
}
