import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useClubCompetencyFrameworks,
  useSetCompetencyAssignment,
  GAME_FORMAT_LABELS,
  GAME_FORMATS,
  GameFormat,
} from '@/api/competencies';
import { useToast } from '@/contexts/ToastContext';

interface CompetencyAssignmentPanelProps {
  clubId: string;
  scope: 'club' | 'ageGroup' | 'team';
  scopeId: string;
  currentFrameworkId?: string;
  allowChildrenOverride?: boolean;
  showOverrideToggle?: boolean;
  disabled?: boolean;
  teamFormat?: GameFormat | null;
  onTeamFormatChange?: (format: GameFormat) => void;
  /** When true, hides the "Save assignment" and "Manage frameworks" controls. */
  hideSaveControls?: boolean;
  /** When provided, `current` is set to the panel's save function so a parent form can trigger it. */
  saveRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

const selectClass = 'input disabled:opacity-50 disabled:cursor-not-allowed';
const labelClass = 'label';

export default function CompetencyAssignmentPanel({
  clubId,
  scope,
  scopeId,
  currentFrameworkId,
  allowChildrenOverride,
  showOverrideToggle,
  disabled,
  teamFormat,
  onTeamFormatChange,
}: CompetencyAssignmentPanelProps) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: frameworks, isLoading } = useClubCompetencyFrameworks(clubId);
  const { mutate: assign, isSubmitting, error } = useSetCompetencyAssignment();

  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('');
  const [allowChildren, setAllowChildren] = useState<boolean>(false);

  useEffect(() => { if (currentFrameworkId) setSelectedFrameworkId(currentFrameworkId); }, [currentFrameworkId]);
  useEffect(() => { setAllowChildren(!!allowChildrenOverride); }, [allowChildrenOverride]);

  const handleSave = async () => {
    if (!selectedFrameworkId) return;
    const { ok } = await assign({
      scope,
      scopeId,
      request: {
        frameworkId: selectedFrameworkId,
        allowAgeGroupOverride: scope === 'club' && showOverrideToggle ? allowChildren : undefined,
        allowTeamOverride: scope === 'ageGroup' && showOverrideToggle ? allowChildren : undefined,
      },
    });
    if (ok) {
      addToast('success', 'Competency framework assignment saved');
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Competency framework
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Players belonging to this {scope === 'ageGroup' ? 'age group' : scope} will be scored using the selected framework.
      </p>

      {disabled && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Your parent scope does not currently allow overriding the competency framework here. Enable the corresponding toggle in the parent settings to unlock this control.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">{error.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Framework</label>
          <select
            className={selectClass}
            value={selectedFrameworkId}
            onChange={(e) => setSelectedFrameworkId(e.target.value)}
            disabled={!!disabled || isLoading}
          >
            <option value="" disabled>Select a framework…</option>
            {(frameworks ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}{f.isSystemDefault ? ' (System)' : ''}
              </option>
            ))}
          </select>
        </div>

        {scope === 'team' && (
          <div>
            <label className={labelClass}>Game format</label>
            <select
              className={selectClass}
              value={teamFormat ?? ''}
              onChange={(e) => onTeamFormatChange?.(e.target.value as GameFormat)}
            >
              <option value="" disabled>Select format…</option>
              {GAME_FORMATS.map((f) => (
                <option key={f} value={f}>{GAME_FORMAT_LABELS[f]}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {showOverrideToggle && (
        <label className="mt-4 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={allowChildren}
            onChange={(e) => setAllowChildren(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          {scope === 'club'
            ? 'Allow age groups to choose their own framework'
            : 'Allow teams to choose their own framework'}
        </label>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!selectedFrameworkId || disabled || isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving…' : 'Save assignment'}
        </button>
        <button
          onClick={() => navigate(`/dashboard/${clubId}/competency-frameworks`)}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 underline transition-colors"
        >
          Manage frameworks
        </button>
      </div>
    </div>
  );
}
