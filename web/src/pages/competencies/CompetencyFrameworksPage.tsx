import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Edit3, Trash2 } from 'lucide-react';
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
    <div className="p-6 max-w-6xl mx-auto">
      <PageTitle title="Competency Frameworks" subtitle="System defaults and club-owned frameworks." />

      {isLoading && <div className="text-slate-500 text-sm mt-6">Loading…</div>}

      {!isLoading && (
        <>
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">System defaults</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Club frameworks</h2>
            {clubFrameworks.length === 0 ? (
              <div className="text-sm text-slate-500 italic">No custom frameworks yet. Clone a system framework to start customising.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
    <div className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-2">
        <button onClick={onView} className="text-left font-semibold text-slate-900 hover:text-blue-600">
          {framework.name}
        </button>
        {framework.isSystemDefault && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">System</span>
        )}
      </div>
      {framework.description && <p className="text-xs text-slate-500 line-clamp-3 mb-3">{framework.description}</p>}
      <div className="text-xs text-slate-500 mb-3">
        Uplift {framework.upliftPercent}% · Assignments {framework.assignmentCount}
      </div>
      <div className="mt-auto flex items-center gap-2">
        {onEdit && (
          <button onClick={onEdit} className="flex items-center gap-1 text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-50">
            <Edit3 size={12} /> Edit
          </button>
        )}
        {onClone && (
          <button onClick={onClone} disabled={busy} className="flex items-center gap-1 text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50">
            <Copy size={12} /> {busy ? 'Cloning…' : 'Clone'}
          </button>
        )}
        {onArchive && (
          <button onClick={onArchive} className="flex items-center gap-1 text-xs px-2 py-1 border border-red-200 text-red-700 rounded hover:bg-red-50 ml-auto">
            <Trash2 size={12} /> Archive
          </button>
        )}
      </div>
    </div>
  );
}
