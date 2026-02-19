import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiClient } from '@/api';
import type { PlayerDto, DevelopmentPlanDetailDto, DevelopmentPlanGoalDetailDto, CreateDevelopmentPlanRequest, UpdateDevelopmentPlanRequest } from '@/api';
import { developmentPlanStatuses, type DevelopmentPlanStatus } from '@data/referenceData';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import FormActions from '@components/common/FormActions';

interface Goal {
  id?: string;
  goal: string;
  actions: string[];
  startDate: string;
  targetDate: string;
  progress: number;
  completed: boolean;
  completedDate?: string;
}

/**
 * Format a date string (YYYY-MM-DD or ISO) for API submission.
 */
function formatDateForApi(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

/**
 * Parse an ISO date string from the API into YYYY-MM-DD for form inputs.
 */
function parseApiDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

export default function AddEditDevelopmentPlanPage() {
  const { clubId, playerId, ageGroupId, teamId, planId } = useParams();
  const navigate = useNavigate();

  // Player state
  const [player, setPlayer] = useState<PlayerDto | null>(null);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);

  // Plan state (edit mode)
  const [plan, setPlan] = useState<DevelopmentPlanDetailDto | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Form initialization tracking
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const isEditMode = Boolean(planId);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [status, setStatus] = useState<DevelopmentPlanStatus>('active');
  const [goals, setGoals] = useState<Goal[]>([
    { goal: '', actions: [''], startDate: '', targetDate: '', progress: 0, completed: false },
  ]);
  const [coachNotes, setCoachNotes] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch player and plan data
  useEffect(() => {
    if (!playerId) {
      setPlayerError('Player ID is required');
      setPlayerLoading(false);
      return;
    }

    setPlayerLoading(true);
    apiClient.players.getById(playerId)
      .then((response) => {
        if (response.success && response.data) {
          setPlayer(response.data);
          setPlayerError(null);
        } else {
          setPlayerError(response.error?.message || 'Failed to load player');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch player:', err);
        setPlayerError('Failed to load player from API');
      })
      .finally(() => setPlayerLoading(false));

    if (planId) {
      setPlanLoading(true);
      apiClient.developmentPlans.getById(planId)
        .then((response) => {
          if (response.success && response.data) {
            setPlan(response.data);
            setPlanError(null);
          } else {
            setPlanError(response.error?.message || 'Failed to load development plan');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch development plan:', err);
          setPlanError('Failed to load development plan from API');
        })
        .finally(() => setPlanLoading(false));
    }
  }, [playerId, planId]);

  // Hydrate form in edit mode (one-time initialization)
  useEffect(() => {
    if (isEditMode && plan && !isFormInitialized) {
      setTitle(plan.title || '');
      setDescription(plan.description || '');
      setPeriodStart(parseApiDate(plan.periodStart));
      setPeriodEnd(parseApiDate(plan.periodEnd));
      // Type guard for defensive coding
      const planStatus = plan.status;
      const validStatus: DevelopmentPlanStatus = 
        planStatus === 'active' || planStatus === 'completed' || planStatus === 'archived' 
          ? planStatus 
          : 'active';
      setStatus(validStatus);
      // Note: coachNotes field is not included in DevelopmentPlanDetailDto,
      // so existing notes won't be pre-populated when editing
      setCoachNotes('');
      setGoals(
        plan.goals.length > 0
          ? plan.goals.map((g: DevelopmentPlanGoalDetailDto) => ({
              id: g.id,
              goal: g.title, // DevelopmentPlanGoalDetailDto uses 'title' instead of 'goal'
              actions: g.actions.length > 0 ? g.actions : [''],
              startDate: '', // DevelopmentPlanGoalDetailDto doesn't have startDate, use empty or plan start
              targetDate: parseApiDate(g.targetDate),
              progress: g.progress,
              completed: g.status === 'completed', // Convert status string to boolean
              completedDate: g.completedDate ? parseApiDate(g.completedDate) : undefined,
            }))
          : [{ goal: '', actions: [''], startDate: '', targetDate: '', progress: 0, completed: false }]
      );
      setIsFormInitialized(true);
    }
  }, [isEditMode, plan, isFormInitialized]);

  // Show skeleton while loading
  if (playerLoading || (isEditMode && planLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="animate-pulse">
            <div className="h-7 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
            {/* Plan Details skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
            {/* Goals skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            {/* Coach Notes skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Player error handling
  if (playerError || (!playerLoading && !player)) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
            Player Not Found
          </h2>
          <p className="text-red-700 dark:text-red-400 mb-4">
            {playerError || 'The requested player could not be found.'}
          </p>
          <button
            onClick={() => navigate(Routes.clubPlayers(clubId!))}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Players
          </button>
        </div>
      </div>
    );
  }

  // Plan error handling (edit mode only)
  if (isEditMode && (planError || (!planLoading && !plan))) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
            Development Plan Not Found
          </h2>
          <p className="text-red-700 dark:text-red-400 mb-4">
            {planError || 'The requested development plan could not be found.'}
          </p>
          <button
            onClick={() => navigate(Routes.clubPlayers(clubId!))}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Players
          </button>
        </div>
      </div>
    );
  }

  // Determine back link based on context
  let backLink: string;
  let subtitle: string;
  if (isEditMode) {
    if (teamId && ageGroupId) {
      backLink = Routes.teamPlayerDevelopmentPlan(clubId!, ageGroupId!, teamId!, playerId!, planId!);
    } else if (ageGroupId) {
      backLink = Routes.playerDevelopmentPlan(clubId!, ageGroupId!, playerId!, planId!);
    } else {
      backLink = Routes.clubPlayers(clubId!);
    }
  } else {
    if (teamId && ageGroupId) {
      backLink = Routes.teamPlayerDevelopmentPlans(clubId!, ageGroupId!, teamId!, playerId!);
    } else if (ageGroupId) {
      backLink = Routes.playerDevelopmentPlans(clubId!, ageGroupId!, playerId!);
    } else {
      backLink = Routes.clubPlayers(clubId!);
    }
  }

  if (teamId && ageGroupId) {
    subtitle = `${player!.firstName} ${player!.lastName} • ${player!.ageGroupName || 'Age Group'} • ${player!.teamName || 'Team'}`;
  } else if (ageGroupId) {
    subtitle = `${player!.firstName} ${player!.lastName} • ${player!.ageGroupName || 'Age Group'}`;
  } else {
    subtitle = `${player!.firstName} ${player!.lastName}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setValidationErrors({});

    try {
      const filteredGoals = goals
        .filter((g) => g.goal.trim())
        .map((g) => ({
          goal: g.goal,
          actions: g.actions.filter((a) => a.trim()),
          startDate: formatDateForApi(g.startDate),
          targetDate: formatDateForApi(g.targetDate),
          progress: g.progress,
          completed: g.completed,
          completedDate: g.completedDate ? formatDateForApi(g.completedDate) : undefined,
        }));

      let response;

      if (isEditMode) {
        const request: UpdateDevelopmentPlanRequest = {
          title,
          description: description || undefined,
          periodStart: formatDateForApi(periodStart),
          periodEnd: formatDateForApi(periodEnd),
          status,
          coachNotes: coachNotes || undefined,
          goals: filteredGoals,
        };
        response = await apiClient.developmentPlans.update(planId!, request);
      } else {
        const request: CreateDevelopmentPlanRequest = {
          playerId: playerId!,
          title,
          description: description || undefined,
          periodStart: formatDateForApi(periodStart),
          periodEnd: formatDateForApi(periodEnd),
          status,
          coachNotes: coachNotes || undefined,
          goals: filteredGoals,
        };
        response = await apiClient.developmentPlans.create(request);
      }

      if (response.success && response.data) {
        navigate(backLink);
      } else {
        const errorMessage = response.error?.message || 'Failed to save development plan';
        setSubmitError(errorMessage);

        if (response.error?.validationErrors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(response.error.validationErrors).forEach(([field, messages]) => {
            const fieldName = field.charAt(0).toLowerCase() + field.slice(1);
            fieldErrors[fieldName] = messages[0];
          });
          setValidationErrors(fieldErrors);
        }
      }
    } catch (err) {
      console.error('Failed to save development plan:', err);
      setSubmitError('An unexpected error occurred while saving the development plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(backLink);
  };

  const addGoal = () => {
    setGoals([...goals, { goal: '', actions: [''], startDate: '', targetDate: '', progress: 0, completed: false }]);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: keyof Goal, value: string | number | boolean | string[]) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const addAction = (goalIndex: number) => {
    const updated = [...goals];
    updated[goalIndex].actions.push('');
    setGoals(updated);
  };

  const removeAction = (goalIndex: number, actionIndex: number) => {
    const updated = [...goals];
    updated[goalIndex].actions = updated[goalIndex].actions.filter((_, i) => i !== actionIndex);
    setGoals(updated);
  };

  const updateAction = (goalIndex: number, actionIndex: number, value: string) => {
    const updated = [...goals];
    updated[goalIndex].actions[actionIndex] = value;
    setGoals(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Page Title */}
        <PageTitle
          title={isEditMode ? 'Edit Development Plan' : 'New Development Plan'}
          subtitle={subtitle}
          backLink={backLink}
        />

        <form onSubmit={handleSubmit}>
          {/* Submission Error Display */}
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-300">{submitError}</p>
            </div>
          )}

          {/* Plan Details */}
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Plan Details</h2>
            <div className="space-y-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="e.g., Complete Forward Development - Q1 2025"
                  required
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    validationErrors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Provide an overview of what this development plan aims to achieve..."
                  rows={3}
                  required
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none ${
                    validationErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="periodStart" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Period Start *
                  </label>
                  <input
                    type="date"
                    id="periodStart"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      validationErrors.periodStart ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {validationErrors.periodStart && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.periodStart}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="periodEnd" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Period End *
                  </label>
                  <input
                    type="date"
                    id="periodEnd"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      validationErrors.periodEnd ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {validationErrors.periodEnd && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.periodEnd}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DevelopmentPlanStatus)}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {developmentPlanStatuses.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Development Goals */}
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Development Goals
              </h2>
              <button
                type="button"
                onClick={addGoal}
                disabled={isSubmitting}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                + Add Goal
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Define specific, measurable goals for the player to work towards during this development period.
            </p>
            
            <div className="space-y-2">
              {goals.map((goal, goalIndex) => (
                <div key={goalIndex} className="border border-purple-300 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">Goal {goalIndex + 1}</h3>
                    {goals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGoal(goalIndex)}
                        disabled={isSubmitting}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Goal Description *
                      </label>
                      <input
                        type="text"
                        value={goal.goal}
                        onChange={(e) => updateGoal(goalIndex, 'goal', e.target.value)}
                        disabled={isSubmitting}
                        placeholder="e.g., Improve aerial duel success rate by 20%"
                        required
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={goal.startDate}
                          onChange={(e) => updateGoal(goalIndex, 'startDate', e.target.value)}
                          disabled={isSubmitting}
                          required
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Target Date *
                        </label>
                        <input
                          type="date"
                          value={goal.targetDate}
                          onChange={(e) => updateGoal(goalIndex, 'targetDate', e.target.value)}
                          disabled={isSubmitting}
                          required
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Progress (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={(e) => updateGoal(goalIndex, 'progress', parseInt(e.target.value) || 0)}
                          disabled={isSubmitting}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Actions to Achieve Goal *
                        </label>
                        <button
                          type="button"
                          onClick={() => addAction(goalIndex)}
                          disabled={isSubmitting}
                          className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                          + Add Action
                        </button>
                      </div>
                      <div className="space-y-2">
                        {goal.actions.map((action, actionIndex) => (
                          <div key={actionIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={action}
                              onChange={(e) => updateAction(goalIndex, actionIndex, e.target.value)}
                              disabled={isSubmitting}
                              placeholder="Enter a specific action or drill..."
                              required
                              className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            {goal.actions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAction(goalIndex, actionIndex)}
                                disabled={isSubmitting}
                                className="px-2 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coach Notes */}
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">💬</span>
              Coach's Notes
            </h2>
            <textarea
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              disabled={isSubmitting}
              placeholder="Add any additional notes or observations about the player's progress..."
              rows={4}
              className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Form Actions */}
          <div className="card">
            <FormActions
              onCancel={handleCancel}
              saveLabel={isEditMode ? 'Save Changes' : 'Create Development Plan'}
              showArchive={false}
              saveDisabled={isSubmitting}
            />
          </div>
        </form>
      </main>
    </div>
  );
}
