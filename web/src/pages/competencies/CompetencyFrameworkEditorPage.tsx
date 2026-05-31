import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Save } from 'lucide-react';
import PageTitle from '@/components/common/PageTitle';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/contexts/ToastContext';
import {
  CompetencyBand,
  COMPETENCY_BANDS,
  GAME_FORMATS,
  GAME_FORMAT_LABELS,
  GameFormat,
  useCompetencyFramework,
  useUpdateCompetencyFramework,
  UpdateCompetencyFrameworkRequest,
} from '@/api/competencies';

type WeightMap = Record<string, Record<GameFormat, number>>; // attributeId -> format -> percent

const DEFAULT_THRESHOLDS: Record<CompetencyBand, number> = {
  Development: 18,
  Intermediate: 35,
  Advanced: 52,
  Elite: 70,
};

export default function CompetencyFrameworkEditorPage() {
  const { clubId, frameworkId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: framework, isLoading, refetch } = useCompetencyFramework(frameworkId);
  const { mutate: saveFramework, isSubmitting, error } = useUpdateCompetencyFramework(frameworkId ?? '');

  usePageTitle([framework?.name ?? 'Framework', 'Competency Frameworks']);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [upliftPercent, setUpliftPercent] = useState(5);
  const [thresholds, setThresholds] = useState<Record<CompetencyBand, number>>(DEFAULT_THRESHOLDS);
  const [weights, setWeights] = useState<WeightMap>({});
  const [descriptions, setDescriptions] = useState<Record<string, Record<CompetencyBand, string>>>({});
  const [activeFormat, setActiveFormat] = useState<GameFormat>('ElevenASide');

  useEffect(() => {
    if (!framework) return;
    setName(framework.name);
    setDescription(framework.description ?? '');
    setUpliftPercent(Number(framework.upliftPercent));

    const t: Record<CompetencyBand, number> = { ...DEFAULT_THRESHOLDS };
    framework.bandThresholds.forEach((b) => { t[b.band] = Number(b.threshold); });
    setThresholds(t);

    const w: WeightMap = {};
    framework.categories.forEach((cat) => {
      cat.attributes.forEach((attr) => {
        w[attr.attributeId] = { ...attr.weightsByFormat } as Record<GameFormat, number>;
      });
    });
    setWeights(w);

    const d: Record<string, Record<CompetencyBand, string>> = {};
    framework.competencyDescriptions.forEach((cd) => {
      d[cd.competencyId] = { ...cd.descriptions };
    });
    setDescriptions(d);
  }, [framework]);

  // Totals
  const formatTotals = useMemo(() => {
    const totals: Record<GameFormat, number> = { FiveASide: 0, SevenASide: 0, NineASide: 0, ElevenASide: 0 };
    Object.values(weights).forEach((perFormat) => {
      GAME_FORMATS.forEach((f) => { totals[f] += perFormat[f] ?? 0; });
    });
    return totals;
  }, [weights]);

  const categoryTotals = useMemo(() => {
    if (!framework) return [] as { categoryId: string; categoryName: string; totalsByFormat: Record<GameFormat, number> }[];
    return framework.categories.map((cat) => {
      const totals: Record<GameFormat, number> = { FiveASide: 0, SevenASide: 0, NineASide: 0, ElevenASide: 0 };
      cat.attributes.forEach((attr) => {
        GAME_FORMATS.forEach((f) => { totals[f] += weights[attr.attributeId]?.[f] ?? 0; });
      });
      return { categoryId: cat.categoryId, categoryName: cat.categoryName, totalsByFormat: totals };
    });
  }, [framework, weights]);

  const allFormatsAt100 = GAME_FORMATS.every((f) => formatTotals[f] === 100);
  const thresholdsAscending =
    thresholds.Development < thresholds.Intermediate &&
    thresholds.Intermediate < thresholds.Advanced &&
    thresholds.Advanced < thresholds.Elite;
  const canSave = !!framework && !framework.isSystemDefault && allFormatsAt100 && thresholdsAscending && !isSubmitting;

  const handleWeightChange = (attributeId: string, format: GameFormat, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [attributeId]: { ...prev[attributeId], [format]: Math.max(0, Math.min(100, value)) },
    }));
  };

  const handleSave = async () => {
    if (!framework) return;
    const request: UpdateCompetencyFrameworkRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      upliftPercent,
      bandThresholds: thresholds,
      weights: Object.entries(weights).flatMap(([attributeId, perFormat]) =>
        GAME_FORMATS.map((f) => ({ attributeId, format: f, weightPercent: perFormat[f] ?? 0 })),
      ),
      competencyDescriptions: Object.entries(descriptions).flatMap(([competencyId, perBand]) =>
        COMPETENCY_BANDS.map((b) => ({ competencyId, band: b, description: perBand[b] ?? '' })),
      ),
    };
    await saveFramework(request);
    if (error) return;
    addToast('success', 'Framework saved');
    await refetch();
  };

  if (isLoading || !framework) {
    return <div className="p-6 max-w-6xl mx-auto text-slate-500 text-sm">Loading…</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageTitle
        title={framework.name}
        subtitle={framework.isSystemDefault ? 'System default — read only. Clone to customise.' : 'Edit weights, thresholds, descriptions and uplift.'}
      />

      {/* Identity */}
      <section className="card mt-6">
        <h3 className="font-semibold text-slate-900 mb-3">Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-sm">
            <span className="block text-slate-600 mb-1">Name</span>
            <input className="w-full border border-slate-300 rounded px-2 py-1.5" value={name} onChange={(e) => setName(e.target.value)} disabled={framework.isSystemDefault} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="block text-slate-600 mb-1">Description</span>
            <input className="w-full border border-slate-300 rounded px-2 py-1.5" value={description} onChange={(e) => setDescription(e.target.value)} disabled={framework.isSystemDefault} />
          </label>
          <label className="text-sm">
            <span className="block text-slate-600 mb-1">Uplift %</span>
            <input
              type="number"
              step="0.5"
              className="w-full border border-slate-300 rounded px-2 py-1.5"
              value={upliftPercent}
              onChange={(e) => setUpliftPercent(Number(e.target.value))}
              disabled={framework.isSystemDefault}
            />
          </label>
        </div>
      </section>

      {/* Thresholds */}
      <section className="card mt-4">
        <h3 className="font-semibold text-slate-900 mb-3">Band thresholds</h3>
        <p className="text-xs text-slate-500 mb-3">Boosted score &ge; threshold &rArr; band. Must be strictly ascending.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COMPETENCY_BANDS.map((band) => (
            <label key={band} className="text-sm">
              <span className="block text-slate-600 mb-1">{band}</span>
              <input
                type="number"
                step="0.5"
                className="w-full border border-slate-300 rounded px-2 py-1.5"
                value={thresholds[band]}
                onChange={(e) => setThresholds((s) => ({ ...s, [band]: Number(e.target.value) }))}
                disabled={framework.isSystemDefault}
              />
            </label>
          ))}
        </div>
        {!thresholdsAscending && (
          <div className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} /> Thresholds must be strictly ascending.</div>
        )}
      </section>

      {/* Weightings */}
      <section className="card mt-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-semibold text-slate-900">Weightings</h3>
          <div className="flex gap-1">
            {GAME_FORMATS.map((f) => {
              const total = formatTotals[f];
              const ok = total === 100;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFormat(f)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${activeFormat === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                >
                  {GAME_FORMAT_LABELS[f]}{' '}
                  <span className={ok ? 'text-emerald-300' : 'text-amber-300'}>
                    {ok ? '✓' : `(${total})`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Each attribute's weight is a percent of the total for the active format. The grand total must be exactly 100.
        </p>

        {framework.categories.map((cat) => {
          const catTotal = categoryTotals.find((c) => c.categoryId === cat.categoryId)?.totalsByFormat[activeFormat] ?? 0;
          return (
            <div key={cat.categoryId} className="mb-5">
              <div className="flex items-center justify-between text-sm font-medium text-slate-800 mb-2">
                <span>{cat.categoryName}</span>
                <span className="text-xs text-slate-500">Category total: {catTotal}</span>
              </div>
              <div className="space-y-2">
                {cat.attributes.map((attr) => {
                  const value = weights[attr.attributeId]?.[activeFormat] ?? 0;
                  return (
                    <div key={attr.attributeId} className="grid grid-cols-12 gap-2 items-center text-sm">
                      <div className="col-span-4 text-slate-700">
                        {attr.attributeName}
                        <div className="text-[10px] text-slate-400">{attr.competencyName}</div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={50}
                        step={1}
                        value={value}
                        onChange={(e) => handleWeightChange(attr.attributeId, activeFormat, Number(e.target.value))}
                        className="col-span-6"
                        disabled={framework.isSystemDefault}
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={value}
                        onChange={(e) => handleWeightChange(attr.attributeId, activeFormat, Number(e.target.value))}
                        className="col-span-2 border border-slate-300 rounded px-1.5 py-1 text-right"
                        disabled={framework.isSystemDefault}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className={`mt-3 text-sm flex items-center gap-2 ${formatTotals[activeFormat] === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
          {formatTotals[activeFormat] === 100 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {GAME_FORMAT_LABELS[activeFormat]} total: <strong>{formatTotals[activeFormat]}</strong> / 100
        </div>
      </section>

      {/* Descriptions */}
      <section className="card mt-4">
        <h3 className="font-semibold text-slate-900 mb-3">Competency rubric</h3>
        <div className="space-y-4">
          {framework.competencyDescriptions.map((cd) => (
            <div key={cd.competencyId} className="border border-slate-200 rounded-md p-3">
              <div className="font-medium text-slate-900 text-sm mb-2">{cd.competencyName}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMPETENCY_BANDS.map((band) => (
                  <label key={band} className="text-sm">
                    <span className="block text-slate-600 mb-1">{band}</span>
                    <textarea
                      className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs"
                      rows={2}
                      value={descriptions[cd.competencyId]?.[band] ?? ''}
                      onChange={(e) => setDescriptions((s) => ({
                        ...s,
                        [cd.competencyId]: { ...s[cd.competencyId], [band]: e.target.value },
                      }))}
                      disabled={framework.isSystemDefault}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => navigate(`/dashboard/${clubId}/competency-frameworks`)} className="text-sm text-slate-700 hover:bg-slate-100 px-3 py-2 rounded">
          Back to list
        </button>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-600">{error.message}</span>}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:bg-slate-300"
          >
            <Save size={14} /> {isSubmitting ? 'Saving…' : 'Save framework'}
          </button>
        </div>
      </div>
    </div>
  );
}
