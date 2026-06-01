import { useEffect, useMemo, useState } from 'react';
import { Target, Dumbbell, Brain, Info, X } from 'lucide-react';
import {
  CompetencyBand,
  COMPETENCY_BANDS,
  PlayerCompetencyBandDto,
  usePlayerCompetencies,
  useUpdatePlayerCompetencies,
} from '@api/competencies';
import { useToast } from '@/contexts/ToastContext';

interface PlayerCompetencyModalProps {
  playerId: string;
  playerName?: string;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const CATEGORY_ICONS: Record<string, typeof Target> = {
  Skills: Target,
  Physical: Dumbbell,
  Mental: Brain,
};

const BAND_COLORS: Record<CompetencyBand, string> = {
  Development: 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500',
  Intermediate: 'bg-blue-200 dark:bg-blue-900/50 text-blue-900 dark:text-blue-300 hover:bg-blue-300 dark:hover:bg-blue-800/50',
  Advanced: 'bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-300 hover:bg-green-300 dark:hover:bg-green-800/50',
  Elite: 'bg-amber-200 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 hover:bg-amber-300 dark:hover:bg-amber-800/50',
};

const BAND_COLORS_SELECTED: Record<CompetencyBand, string> = {
  Development: 'bg-gray-600 dark:bg-gray-500 text-white',
  Intermediate: 'bg-blue-600 dark:bg-blue-500 text-white',
  Advanced: 'bg-green-600 dark:bg-green-500 text-white',
  Elite: 'bg-amber-600 dark:bg-amber-500 text-white',
};

export default function PlayerCompetencyModal({ playerId, playerName, onClose, onSuccess }: PlayerCompetencyModalProps) {
  const { data, isLoading, refetch } = usePlayerCompetencies(playerId);
  const { mutate, isSubmitting, error } = useUpdatePlayerCompetencies(playerId);
  const { addToast } = useToast();

  const [selectedBands, setSelectedBands] = useState<Record<string, CompetencyBand>>({});
  const [coachNotes, setCoachNotes] = useState('');
  const [expandedRubrics, setExpandedRubrics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!data) return;
    const next: Record<string, CompetencyBand> = {};
    data.competencies.forEach((c) => {
      if (c.band) next[c.competencyId] = c.band;
    });
    setSelectedBands(next);
  }, [data]);

  const categories = useMemo(() => {
    if (!data) return [] as { name: string; items: PlayerCompetencyBandDto[] }[];
    const grouped = new Map<string, PlayerCompetencyBandDto[]>();
    data.competencies.forEach((c) => {
      const list = grouped.get(c.categoryName) ?? [];
      list.push(c);
      grouped.set(c.categoryName, list);
    });
    return Array.from(grouped.entries())
      .map(([name, items]) => ({ name, items: items.sort((a, b) => a.displayOrder - b.displayOrder) }))
      .sort((a, b) => {
        const order: Record<string, number> = { Skills: 1, Physical: 2, Mental: 3 };
        return (order[a.name] ?? 99) - (order[b.name] ?? 99);
      });
  }, [data]);

  const allBandsSelected = data ? data.competencies.every((c) => selectedBands[c.competencyId]) : false;

  const handleSubmit = async () => {
    if (!data) return;
    const { ok } = await mutate({
      bands: Object.entries(selectedBands).map(([competencyId, band]) => ({ competencyId, band })),
      coachNotes: coachNotes.trim() || undefined,
    });
    if (!ok) return;
    addToast('success', 'Competencies saved and scores recalculated');
    setCoachNotes('');
    await refetch();
    if (onSuccess) await onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-3xl sm:rounded-xl shadow-2xl max-h-[95vh] flex flex-col">
        <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Competencies{playerName ? ` — ${playerName}` : data?.playerName ? ` — ${data.playerName}` : ''}
            </h2>
            {data?.overallBand && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Current band: <span className="font-medium">{data.overallBand}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {isLoading && <div className="text-gray-500 dark:text-gray-400 text-sm">Loading…</div>}

          {!isLoading && data && categories.map(({ name, items }) => {
            const Icon = CATEGORY_ICONS[name] ?? Target;
            return (
              <section key={name}>
                <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  <Icon size={16} />
                  {name}
                </h3>
                <div className="space-y-3">
                  {items.map((c) => {
                    const current = selectedBands[c.competencyId];
                    const isExpanded = expandedRubrics[c.competencyId] ?? false;
                    return (
                      <div key={c.competencyId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{c.competencyName}</div>
                          <button
                            type="button"
                            onClick={() => setExpandedRubrics((s) => ({ ...s, [c.competencyId]: !isExpanded }))}
                            className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                            aria-label="Toggle rubric"
                          >
                            <Info size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                          {COMPETENCY_BANDS.map((band) => {
                            const isSelected = current === band;
                            return (
                              <button
                                key={band}
                                type="button"
                                onClick={() => setSelectedBands((s) => ({ ...s, [c.competencyId]: band }))}
                                className={`text-xs font-medium px-2 py-2 rounded-md transition-colors ${
                                  isSelected ? BAND_COLORS_SELECTED[band] : BAND_COLORS[band]
                                }`}
                              >
                                {band}
                              </button>
                            );
                          })}
                        </div>

                        {isExpanded && (
                          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                            {COMPETENCY_BANDS.map((band) => (
                              <div key={band} className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                                <dt className="font-semibold text-gray-800 dark:text-gray-200">{band}</dt>
                                <dd>{c.descriptions[band] || <em className="text-gray-400 dark:text-gray-500">No description</em>}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <section>
            <label htmlFor="coach-notes" className="label">
              Coach notes (optional)
            </label>
            <textarea
              id="coach-notes"
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              placeholder="Anything to record alongside this evaluation snapshot…"
            />
          </section>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm px-3 py-2">
              {error.message}
            </div>
          )}
        </div>

        <footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allBandsSelected || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving…' : 'Save and recalculate'}
          </button>
        </footer>
      </div>
    </div>
  );
}
