import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDevelopmentPlan } from '@/api/hooks';
import { useNavigation } from '@/contexts/NavigationContext';
import { Routes } from '@/utils/routes';
import PageTitle from '@/components/common/PageTitle';

export default function PlayerDevelopmentPlanPage() {
  const { planId, playerId, clubId, ageGroupId, teamId } = useParams();
  const { data: plan, isLoading, error } = useDevelopmentPlan(planId);
  const { setEntityName } = useNavigation();

  // Populate navigation context once data loads
  useEffect(() => {
    if (plan) {
      setEntityName('developmentPlan', plan.id, plan.title);
      setEntityName('player', plan.playerId, plan.playerName);
      if (plan.teamId && plan.teamName) {
        setEntityName('team', plan.teamId, plan.teamName);
      }
      if (plan.ageGroupId && plan.ageGroupName) {
        setEntityName('ageGroup', plan.ageGroupId, plan.ageGroupName);
      }
      if (plan.clubId && plan.clubName) {
        setEntityName('club', plan.clubId, plan.clubName);
      }
    }
  }, [plan, setEntityName]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">Error Loading Development Plan</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {(error as any).statusCode === 404 
                ? 'Development plan not found or you do not have access to view it.'
                : error.message || 'An error occurred while loading the development plan.'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Loading state with skeletons
  if (isLoading || !plan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          {/* Page Title Skeleton */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Plan Header Skeleton */}
          <div className="card mb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="ml-4">
                <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Goals Skeleton */}
          <div className="card mb-4">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card text-center">
                <div className="h-12 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Handle missing planId
  if (!planId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">No Development Plan Selected</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please select a development plan from the list.
            </p>
          </div>
        </main>
      </div>
    );
  }
  
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'active':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };
  
  const overallProgress = plan.goals.length > 0
    ? Math.round(plan.goals.reduce((sum, goal) => sum + goal.progress, 0) / plan.goals.length)
    : 0;

  // Parse dates
  const periodStart = new Date(plan.periodStart);
  const periodEnd = new Date(plan.periodEnd);
  const createdAt = new Date(plan.createdAt);

  // Get player initials from name
  const playerInitials = plan.playerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  // Determine the edit link based on context
  const editPlanLink = teamId && ageGroupId && clubId
    ? Routes.editTeamPlayerDevelopmentPlan(clubId, ageGroupId, teamId, playerId!, planId)
    : ageGroupId && clubId
    ? Routes.editPlayerDevelopmentPlan(clubId, ageGroupId, playerId!, planId)
    : `/players/${playerId}/development-plans/${planId}/edit`;

  // Determine the back link based on context
  const backLink = teamId && ageGroupId && clubId
    ? Routes.teamPlayer(clubId, ageGroupId, teamId, playerId!)
    : ageGroupId && clubId
    ? Routes.player(clubId, ageGroupId, playerId!)
    : `/players/${playerId}`;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Player Header */}
        <PageTitle
          title={plan.playerName}
          subtitle={plan.position ? `Position: ${plan.position}` : undefined}
          backLink={backLink}
          image={{
            src: undefined,
            alt: plan.playerName,
            initials: playerInitials,
            colorClass: 'from-indigo-500 to-indigo-600'
          }}
          action={{
            label: 'Edit Plan',
            icon: 'settings',
            href: editPlanLink,
            variant: 'primary',
            title: 'Edit development plan'
          }}
        />

        {/* Current Plan Header */}
        <div className="card mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.title}
              </h2>
              {plan.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {plan.description}
                </p>
              )}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Period: {periodStart.toLocaleDateString('en-GB', { 
                    day: 'numeric',
                    month: 'short', 
                    year: 'numeric' 
                  })} - {periodEnd.toLocaleDateString('en-GB', { 
                    day: 'numeric',
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
                <p>
                  Created: {createdAt.toLocaleDateString('en-GB', { 
                    day: 'numeric',
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Progress</div>
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                {overallProgress}%
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(plan.status)}`}>
                {plan.status.toUpperCase()}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  overallProgress >= 75 ? 'bg-green-500' : 
                  overallProgress >= 50 ? 'bg-indigo-500' : 
                  overallProgress >= 25 ? 'bg-amber-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Development Goals */}
        <div className="card mb-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Development Goals
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Individual goals within this development plan. Each goal tracks progress and can be marked as completed.
          </p>
          
          <div className="space-y-2">
            {plan.goals.map((goal) => {
              const isCompleted = goal.status.toLowerCase() === 'completed';
              const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
              const completedDate = goal.completedDate ? new Date(goal.completedDate) : null;

              return (
                <div 
                  key={goal.id}
                  className={`border rounded-lg p-4 ${
                    isCompleted
                      ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                      : 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 mt-1">
                      <input 
                        type="checkbox" 
                        checked={isCompleted}
                        readOnly
                        className="w-5 h-5 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg mb-2 ${
                            isCompleted
                              ? 'text-green-900 dark:text-green-100 line-through' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {goal.title}
                          </h3>
                          
                          {goal.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {goal.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-sm mb-3">
                            {targetDate && (
                              <span className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Target:</span> {targetDate.toLocaleDateString('en-GB', { 
                                  day: 'numeric',
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </span>
                            )}
                            {isCompleted && completedDate && (
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                ✓ Completed: {completedDate.toLocaleDateString('en-GB', { 
                                  day: 'numeric',
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        {!isCompleted && (
                          <div className="ml-4 text-right flex-shrink-0">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                              {goal.progress}%
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Progress Bar - only show if not completed */}
                      {!isCompleted && (
                        <div className="mb-3">
                          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                goal.progress >= 75 ? 'bg-green-500' : 
                                goal.progress >= 50 ? 'bg-indigo-500' : 
                                goal.progress >= 25 ? 'bg-amber-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {goal.actions && goal.actions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-white">Actions:</h4>
                          <ul className="space-y-1">
                            {goal.actions.map((action, index) => (
                              <li 
                                key={index}
                                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                              >
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Progress Notes */}
        {plan.progressNotes && plan.progressNotes.length > 0 && (
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Progress Notes
            </h2>
            <div className="space-y-3">
              {plan.progressNotes.map((note) => {
                const noteDate = new Date(note.noteDate);
                return (
                  <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {note.coachName || 'Coach'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {noteDate.toLocaleDateString('en-GB', { 
                          day: 'numeric',
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {note.note}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Training Objectives */}
        {plan.trainingObjectives && plan.trainingObjectives.length > 0 && (
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">🏋️</span>
              Training Objectives
            </h2>
            <div className="space-y-3">
              {plan.trainingObjectives.map((objective) => {
                const isCompleted = objective.completed;
                const startDate = objective.startDate ? new Date(objective.startDate) : null;
                const targetDate = objective.targetDate ? new Date(objective.targetDate) : null;
                const completedDate = objective.completedDate ? new Date(objective.completedDate) : null;

                return (
                  <div 
                    key={objective.id}
                    className={`border rounded-lg p-4 ${
                      isCompleted
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                        : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg mb-1 ${
                          isCompleted
                            ? 'text-green-900 dark:text-green-100 line-through' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {objective.title}
                        </h3>
                        
                        {objective.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {objective.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                          {startDate && (
                            <span className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Start:</span> {startDate.toLocaleDateString('en-GB', { 
                                day: 'numeric',
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                          )}
                          {targetDate && (
                            <span className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Target:</span> {targetDate.toLocaleDateString('en-GB', { 
                                day: 'numeric',
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                          )}
                          {isCompleted && completedDate && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              ✓ Completed: {completedDate.toLocaleDateString('en-GB', { 
                                day: 'numeric',
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      {!isCompleted && (
                        <div className="ml-4 text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {objective.progress}%
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar - only show if not completed */}
                    {!isCompleted && (
                      <div className="mt-3">
                        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              objective.progress >= 75 ? 'bg-green-500' : 
                              objective.progress >= 50 ? 'bg-blue-500' : 
                              objective.progress >= 25 ? 'bg-amber-500' : 
                              'bg-red-500'
                            }`}
                            style={{ width: `${objective.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Plan Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {plan.goals.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Goals</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {plan.goals.filter(g => g.status.toLowerCase() === 'completed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completed</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {plan.goals.filter(g => g.status.toLowerCase() !== 'completed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">In Progress</div>
          </div>
        </div>
      </main>
    </div>
  );
}
