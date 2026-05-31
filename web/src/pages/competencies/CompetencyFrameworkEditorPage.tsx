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

type WeightMap = Record<string, Record<GameFormat, number>>;

const DEFAULT_THRESHOLDS: Record<CompetencyBand, number> = {
  Development: 18,
  Intermediate: 35,
  Advanced: 52,
  Elite: 70,
};

const inputClass =
  'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4 max-w-6xl">
          <div className="card">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4 max-w-6xl">
        <PageTitle
          title={framework.name}
          subtitle={
            framework.isSystemDefault
              ? 'System default — read only. Clone to customise.'
              : 'Edit weights, thresholds, descriptions and uplift.'
          }
        />

        {framework.isSystemDefault && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              This is a system default framework and cannot be edited. Clone it to create a customisable copy.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">{error.message}</p>
          </div>
        )}

        <div className="space-y-2">
          {/* Identity */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={framework.isSystemDefault}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <input
                  className={inputClass}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={framework.isSystemDefault}
                />
              </div>
              <div>
                <label className={labelClass}>Uplift %</label>
                <input
                  type="number"
                  step="0.5"
                  className={inputClass}
                  value={upliftPercent}
                  onChange={(e) => setUpliftPercent(Number(e.target.value))}
                  disabled={framework.isSystemDefault}
                />
              </div>
            </div>
          </div>

          {/* Thresholds */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Band thresholds</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Boosted score &ge; threshold &rArr; band. Must be strictly ascending.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {COMPETENCY_BANDS.map((band) => (
                <div key={band}>
                  <label className={labelClass}>{band}</label>
                  <input
                    type="number"
                    step="0.5"
                    className={inputClass}
                    value={thresholds[band]}
                    onChange={(e) => setThresholds((s) => ({ ...s, [band]: Number(e.target.value) }))}
                    disabled={framework.isSystemDefault}
                  />
                </div>
              ))}
            </div>
            {!thresholdsAscending && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                <AlertCircle size={14} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-300">Thresholds must be strictly ascending.</p>
              </div>
            )}
          </div>

          {/* Weightings */}
          <div className="card">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Weightings</h3>
              <div className="flex gap-1 flex-wrap justify-end">
                {GAME_FORMATS.map((f) => {
                  const total = formatTotals[f];
                  const ok = total === 100;
                  return (
                    <button
                      key={f}
                      onClick={() => setActiveFormat(f)}
                      className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                        activeFormat === f
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {GAME_FORMAT_LABELS[f]}{' '}
                      <span className={ok ? (activeFormat === f ? 'text-green-300' : 'text-emerald-600 dark:text-emerald-400') : 'text-amber-500 dark:text-amber-400'}>
                        {ok ? '✓' : `(${total})`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Each attribute's weight is a percent of the total for the active format. The grand total must be exactly 100.
            </p>

            {framework.categories.map((cat) => {
              const catTotal = categoryTotals.find((c) => c.categoryId === cat.categoryId)?.totalsByFormat[activeFormat] ?? 0;
              return (
                <div key={cat.categoryId} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{cat.categoryName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Category total: {catTotal}</span>
                  </div>
                  <div className="space-y-3">
                    {cat.attributes.map((attr) => {
                      const value = weights[attr.attributeId]?.[activeFormat] ?? 0;
                      return (
                        <div key={attr.attributeId} className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-4 text-sm text-gray-700 dark:text-gray-300">
                            {attr.attributeName}
                            <div className="text-[10px] text-gray-400 dark:text-gray-500">{attr.competencyName}</div>
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
                            className="col-span-2 px-2 py-1.5 text-right border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={framework.isSystemDefault}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div
              className={`mt-2 p-3 rounded-lg flex items-center gap-2 text-sm ${
                formatTotals[activeFormat] === 100
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
              }`}
            >
              {formatTotals[activeFormat] === 100 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {GAME_FORMAT_LABELS[activeFormat]} total:{' '}
              <strong>{formatTotals[activeFormat]}</strong> / 100
            </div>
          </div>

          {/* Competency rubric */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Competency rubric</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Descriptions for each competency at each performance band.
            </p>
            <div className="space-y-4">
              {framework.competencyDescriptions.map((cd) => (
                <div
                  key={cd.competencyId}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{cd.competencyName}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COMPETENCY_BANDS.map((band) => (
                      <div key={band}>
                        <label className={labelClass}>{band}</label>
                        <textarea
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          rows={2}
                          value={descriptions[cd.competencyId]?.[band] ?? ''}
                          onChange={(e) =>
                            setDescriptions((s) => ({
                              ...s,
                              [cd.competencyId]: { ...s[cd.competencyId], [band]: e.target.value },
                            }))
                          }
                          disabled={framework.isSystemDefault}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="card flex items-center justify-between gap-4">
            <button
              onClick={() => navigate(`/dashboard/${clubId}/competency-frameworks`)}
              className="text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to list
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={14} /> {isSubmitting ? 'Saving…' : 'Save framework'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
