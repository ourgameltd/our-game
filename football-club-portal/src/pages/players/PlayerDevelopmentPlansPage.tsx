import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { samplePlayers } from '@/data/players';
import { getDevelopmentPlansByPlayerId } from '@/data/developmentPlans';
import PageNavigation from '@components/navigation/PageNavigation';
import { getPlayerNavigationTabs } from '@utils/navigationHelpers';
import PlayerDetailsHeader from '@components/player/PlayerDetailsHeader';

export default function PlayerDevelopmentPlansPage() {
  const { clubId, ageGroupId, playerId } = useParams();
  
  const player = samplePlayers.find(p => p.id === playerId);
  const plans = playerId ? getDevelopmentPlansByPlayerId(playerId) : [];
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  
  const plan = plans[selectedPlanIndex];
  
  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation Tabs */}
        <PageNavigation tabs={getPlayerNavigationTabs(clubId!, ageGroupId!, playerId!)} />

        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Player not found</h2>
          </div>
        </main>
      </div>
    );
  }
  
  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation Tabs */}
        <PageNavigation tabs={getPlayerNavigationTabs(clubId!, ageGroupId!, playerId!)} />

        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">No Development Plans Available</h2>
            <p className="text-gray-600 dark:text-gray-400">
              No development plans have been created for {player.firstName} {player.lastName} yet.
            </p>
          </div>
        </main>
      </div>
    );
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'active':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };
  
  const overallProgress = plan ? Math.round(
    plan.goals.reduce((sum, goal) => sum + goal.progress, 0) / plan.goals.length
  ) : 0;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getPlayerNavigationTabs(clubId!, ageGroupId!, playerId!)} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Player Header with Plan Selector */}
        <div className="card mb-6">
          <PlayerDetailsHeader player={player} customColorClass="from-indigo-500 to-indigo-600" />
          
          {/* Plan Selector */}
          {plans.length > 1 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label htmlFor="plan-selector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Development Plan
                  </label>
                  <select
                    id="plan-selector"
                    value={selectedPlanIndex}
                    onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  >
                    {plans.map((p, index) => (
                      <option key={p.id} value={index}>
                        {index === 0 ? '🎯 Current Plan' : `📋 Plan ${plans.length - index}`} - {p.title} ({p.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Plans</div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{plans.length}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Plan Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {plan.description}
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Period: {plan.period.start.toLocaleDateString('en-GB', { 
                    day: 'numeric',
                    month: 'short', 
                    year: 'numeric' 
                  })} - {plan.period.end.toLocaleDateString('en-GB', { 
                    day: 'numeric',
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
                <p>
                  Created: {plan.createdAt.toLocaleDateString('en-GB', { 
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
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Development Goals
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Individual goals within this development plan. Each goal tracks progress and can be marked as completed.
          </p>
          
          <div className="space-y-4">
            {plan.goals.map((goal) => (
              <div 
                key={goal.id}
                className={`border rounded-lg p-4 ${
                  goal.completed 
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                    : 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    <input 
                      type="checkbox" 
                      checked={goal.completed}
                      readOnly
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg mb-2 ${
                          goal.completed 
                            ? 'text-green-900 dark:text-green-100 line-through' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {goal.goal}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm mb-3">
                          <span className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Started:</span> {goal.startDate.toLocaleDateString('en-GB', { 
                              day: 'numeric',
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Target:</span> {goal.targetDate.toLocaleDateString('en-GB', { 
                              day: 'numeric',
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                          {goal.completed && goal.completedDate && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              ✓ Completed: {goal.completedDate.toLocaleDateString('en-GB', { 
                                day: 'numeric',
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      {!goal.completed && (
                        <div className="ml-4 text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {goal.progress}%
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar - only show if not completed */}
                    {!goal.completed && (
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Coach Notes */}
        {plan.coachNotes && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">💬</span>
              Coach Notes
            </h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {plan.coachNotes}
              </p>
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
              {plan.goals.filter(g => g.completed).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completed</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {plan.goals.filter(g => !g.completed).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">In Progress</div>
          </div>
        </div>
      </main>
    </div>
  );
}
