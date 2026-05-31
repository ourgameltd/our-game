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
  /** Currently assigned framework id (if any) at this scope. */
  currentFrameworkId?: string;
  /** Whether children below this scope are allowed to override (club -> age-groups, age-group -> teams). */
  allowChildrenOverride?: boolean;
  /** Set true to render the "allow children override" toggle. */
  showOverrideToggle?: boolean;
  /** When the parent scope disallows override, this scope cannot change its framework. */
  disabled?: boolean;
  /** Optional: team format selector (only meaningful at scope='team'). */
  teamFormat?: GameFormat | null;
  onTeamFormatChange?: (format: GameFormat) => void;
}

/**
 * Hierarchical framework picker + override toggle.
 * Reusable across club, age-group and team settings pages.
 */
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
    await assign({
      scope,
      scopeId,
      request: {
        frameworkId: selectedFrameworkId,
        allowAgeGroupOverride: scope === 'club' && showOverrideToggle ? allowChildren : undefined,
        allowTeamOverride: scope === 'ageGroup' && showOverrideToggle ? allowChildren : undefined,
      },
    });
    if (!error) {
      addToast('success', 'Competency framework assignment saved');
    }
  };

  return (
    <div className="card mt-4">
      <h3 className="font-semibold text-slate-900 mb-1">Competency framework</h3>
      <p className="text-xs text-slate-500 mb-3">
        Players belonging to this {scope === 'ageGroup' ? 'age group' : scope} will be scored using the selected framework.
      </p>

      {disabled && (
        <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded px-3 py-2 mb-3">
          Your parent scope does not currently allow overriding the competency framework here. Enable the corresponding toggle in the parent settings to unlock this control.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="block text-slate-600 mb-1">Framework</span>
          <select
            className="w-full border border-slate-300 rounded px-2 py-1.5 disabled:bg-slate-50"
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
        </label>

        {scope === 'team' && (
          <label className="text-sm">
            <span className="block text-slate-600 mb-1">Game format</span>
            <select
              className="w-full border border-slate-300 rounded px-2 py-1.5"
              value={teamFormat ?? ''}
              onChange={(e) => onTeamFormatChange?.(e.target.value as GameFormat)}
            >
              <option value="" disabled>Select format…</option>
              {GAME_FORMATS.map((f) => (
                <option key={f} value={f}>{GAME_FORMAT_LABELS[f]}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {showOverrideToggle && (
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowChildren}
            onChange={(e) => setAllowChildren(e.target.checked)}
          />
          {scope === 'club'
            ? 'Allow age groups to choose their own framework'
            : 'Allow teams to choose their own framework'}
        </label>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!selectedFrameworkId || disabled || isSubmitting}
          className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded disabled:bg-slate-300"
        >
          {isSubmitting ? 'Saving…' : 'Save assignment'}
        </button>
        <button
          onClick={() => navigate(`/dashboard/${clubId}/competency-frameworks`)}
          className="text-xs text-slate-600 hover:underline"
        >
          Manage frameworks
        </button>
        {error && <span className="text-xs text-red-600">{error.message}</span>}
      </div>
    </div>
  );
}
