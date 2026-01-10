import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getPlayerById } from '@data/players';
import { getDevelopmentPlansByPlayerId } from '@data/developmentPlans';
import { getAgeGroupById } from '@data/ageGroups';
import { getTeamById } from '@data/teams';
import { developmentPlanStatuses, type DevelopmentPlanStatus } from '@data/referenceData';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import FormActions from '@components/common/FormActions';

interface Goal {
  goal: string;
  actions: string[];
  startDate: string;
  targetDate: string;
  progress: number;
}

export default function AddEditDevelopmentPlanPage() {
  const { clubId, playerId, ageGroupId, teamId, planId } = useParams();
  const navigate = useNavigate();
  
  const player = getPlayerById(playerId!);
  const plans = playerId ? getDevelopmentPlansByPlayerId(playerId) : [];
  const plan = planId ? plans.find(p => p.id === planId) : null;
  const ageGroup = ageGroupId ? getAgeGroupById(ageGroupId) : null;
  const team = teamId ? getTeamById(teamId) : null;
  
  const isEditMode = !!planId;
  
  // Form state
  const [title, setTitle] = useState(plan?.title || '');
  const [description, setDescription] = useState(plan?.description || '');
  const [periodStart, setPeriodStart] = useState(
    plan?.period.start.toISOString().split('T')[0] || ''
  );
  const [periodEnd, setPeriodEnd] = useState(
    plan?.period.end.toISOString().split('T')[0] || ''
  );
  const [status, setStatus] = useState<DevelopmentPlanStatus>(
    plan?.status || 'active'
  );
  const [goals, setGoals] = useState<Goal[]>(
    plan?.goals.map(g => ({
      goal: g.goal,
      actions: g.actions,
      startDate: g.startDate.toISOString().split('T')[0],
      targetDate: g.targetDate.toISOString().split('T')[0],
      progress: g.progress
    })) || [{ goal: '', actions: [''], startDate: '', targetDate: '', progress: 0 }]
  );
  const [coachNotes, setCoachNotes] = useState(plan?.coachNotes || '');
  
  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Player not found</h2>
          </div>
        </main>
      </div>
    );
  }

  // Determine back link based on context
  let backLink: string;
  let subtitle: string;
  if (isEditMode) {
    // Go back to development plan detail
    if (teamId && ageGroupId) {
      backLink = Routes.teamPlayerDevelopmentPlan(clubId!, ageGroupId, teamId, playerId!);
    } else if (ageGroupId) {
      backLink = Routes.playerDevelopmentPlan(clubId!, ageGroupId, playerId!);
    } else {
      backLink = Routes.clubPlayers(clubId!);
    }
  } else {
    // Go back to development plans list
    if (teamId && ageGroupId) {
      backLink = Routes.teamPlayerDevelopmentPlans(clubId!, ageGroupId, teamId, playerId!);
    } else if (ageGroupId) {
      backLink = Routes.playerDevelopmentPlans(clubId!, ageGroupId, playerId!);
    } else {
      backLink = Routes.clubPlayers(clubId!);
    }
  }
  
  if (teamId && ageGroupId) {
    subtitle = `${player.firstName} ${player.lastName} • ${ageGroup?.name || 'Age Group'} • ${team?.name || 'Team'}`;
  } else if (ageGroupId) {
    subtitle = `${player.firstName} ${player.lastName} • ${ageGroup?.name || 'Age Group'}`;
  } else {
    subtitle = `${player.firstName} ${player.lastName}`;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save development plan logic
    console.log('Saving development plan...', {
      title,
      description,
      periodStart,
      periodEnd,
      status,
      goals: goals.filter(g => g.goal.trim() && g.actions.some(a => a.trim())),
      coachNotes
    });
    navigate(backLink);
  };

  const handleCancel = () => {
    navigate(backLink);
  };

  const addGoal = () => {
    setGoals([...goals, { goal: '', actions: [''], startDate: '', targetDate: '', progress: 0 }]);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: keyof Goal, value: string | number | string[]) => {
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
                  placeholder="e.g., Complete Forward Development - Q1 2025"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an overview of what this development plan aims to achieve..."
                  rows={3}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
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
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
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
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DevelopmentPlanStatus)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                        placeholder="e.g., Improve aerial duel success rate by 20%"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                              placeholder="Enter a specific action or drill..."
                              required
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            {goal.actions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAction(goalIndex, actionIndex)}
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
              placeholder="Add any additional notes or observations about the player's progress..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="card">
            <FormActions
              onCancel={handleCancel}
              saveLabel={isEditMode ? 'Save Changes' : 'Create Development Plan'}
              showArchive={false}
            />
          </div>
        </form>
      </main>
    </div>
  );
}
