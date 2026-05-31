import { useEffect, useMemo, useState } from 'react';
import { Target, Dumbbell, Brain, Info, X } from 'lucide-react';
import {
  CompetencyBand,
  COMPETENCY_BANDS,
  GAME_FORMAT_LABELS,
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
  Development: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
  Intermediate: 'bg-blue-200 text-blue-900 hover:bg-blue-300',
  Advanced: 'bg-green-200 text-green-900 hover:bg-green-300',
  Elite: 'bg-amber-200 text-amber-900 hover:bg-amber-300',
};

const BAND_COLORS_SELECTED: Record<CompetencyBand, string> = {
  Development: 'bg-slate-600 text-white',
  Intermediate: 'bg-blue-600 text-white',
  Advanced: 'bg-green-600 text-white',
  Elite: 'bg-amber-600 text-white',
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
      <div className="bg-white w-full sm:max-w-3xl sm:rounded-xl shadow-2xl max-h-[95vh] flex flex-col">
        <header className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Competencies{playerName ? ` — ${playerName}` : data?.playerName ? ` — ${data.playerName}` : ''}
            </h2>
            {data?.overallBand && (
              <p className="text-sm text-slate-500 mt-1">
                Current overall: <span className="font-medium">{data.overallBand}</span>
                {typeof data.overallRating === 'number' && (
                  <> ({data.overallRating})</>
                )}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700" aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {isLoading && <div className="text-slate-500 text-sm">Loading…</div>}

          {!isLoading && data && categories.map(({ name, items }) => {
            const Icon = CATEGORY_ICONS[name] ?? Target;
            return (
              <section key={name}>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                  <Icon size={16} />
                  {name}
                </h3>
                <div className="space-y-3">
                  {items.map((c) => {
                    const current = selectedBands[c.competencyId];
                    const isExpanded = expandedRubrics[c.competencyId] ?? false;
                    return (
                      <div key={c.competencyId} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-slate-900 text-sm">{c.competencyName}</div>
                          <button
                            type="button"
                            onClick={() => setExpandedRubrics((s) => ({ ...s, [c.competencyId]: !isExpanded }))}
                            className="text-slate-400 hover:text-blue-600"
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
                          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                            {COMPETENCY_BANDS.map((band) => (
                              <div key={band} className="bg-slate-50 rounded p-2">
                                <dt className="font-semibold text-slate-800">{band}</dt>
                                <dd>{c.descriptions[band] || <em className="text-slate-400">No description</em>}</dd>
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

          {!isLoading && data && data.teamScores.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Per-team scores</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {data.teamScores.map((s) => (
                  <li key={s.teamId} className="border border-slate-200 rounded-lg p-3">
                    <div className="font-medium text-slate-900">{s.teamName}</div>
                    <div className="text-xs text-slate-500">
                      {GAME_FORMAT_LABELS[s.format]} · {s.frameworkName}
                    </div>
                    <div className="text-xs text-slate-700 mt-1">
                      Base {s.baseScore.toFixed(2)} · Boosted {s.boostedScore.toFixed(2)} · <span className="font-medium">{s.band}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <label htmlFor="coach-notes" className="block text-sm font-medium text-slate-700 mb-1">Coach notes (optional)</label>
            <textarea
              id="coach-notes"
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              placeholder="Anything to record alongside this evaluation snapshot…"
            />
          </section>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-sm px-3 py-2">
              {error.message}
            </div>
          )}
        </div>

        <footer className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md">
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allBandsSelected || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-slate-300"
          >
            {isSubmitting ? 'Saving…' : 'Save and recalculate'}
          </button>
        </footer>
      </div>
    </div>
  );
}
