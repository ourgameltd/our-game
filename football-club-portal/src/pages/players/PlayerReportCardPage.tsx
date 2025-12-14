import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { samplePlayers } from '@/data/players';
import { getReportsByPlayerId } from '@/data/reports';
import PageNavigation from '@components/navigation/PageNavigation';
import { getPlayerNavigationTabs } from '@utils/navigationHelpers';
import PlayerDetailsHeader from '@components/player/PlayerDetailsHeader';

export default function PlayerReportCardPage() {
  const { clubId, ageGroupId, playerId } = useParams();
  
  const player = samplePlayers.find(p => p.id === playerId);
  const reports = playerId ? getReportsByPlayerId(playerId) : [];
  const [selectedReportIndex, setSelectedReportIndex] = useState(0);
  
  const report = reports[selectedReportIndex];
  
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
  
  if (reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getPlayerNavigationTabs(clubId!, ageGroupId!, playerId!)} />

        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">No Reports Available</h2>
            <p className="text-gray-600 dark:text-gray-400">
              No report cards have been created for {player.firstName} {player.lastName} yet.
            </p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getPlayerNavigationTabs(clubId!, ageGroupId!, playerId!)} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Player Header with Report Selector */}
        <div className="card mb-6">
          <PlayerDetailsHeader player={player} customColorClass="from-blue-500 to-blue-600" />
          
          {/* Report Selector */}
          {reports.length > 1 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label htmlFor="report-selector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Report Period
                  </label>
                  <select
                    id="report-selector"
                    value={selectedReportIndex}
                    onChange={(e) => setSelectedReportIndex(Number(e.target.value))}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  >
                    {reports.map((r, index) => (
                      <option key={r.id} value={index}>
                        {index === 0 ? '📊 Latest Report' : `📋 Report ${reports.length - index}`} - {r.period.start.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} to {r.period.end.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} (Rating: {r.overallRating})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Reports</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reports.length}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Report Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedReportIndex === 0 ? 'Current Report' : `Report #${reports.length - selectedReportIndex}`}
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {report.overallRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    Period: {report.period.start.toLocaleDateString('en-GB', { 
                      month: 'short', 
                      year: 'numeric' 
                    })} - {report.period.end.toLocaleDateString('en-GB', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p>
                    Created: {report.createdAt.toLocaleDateString('en-GB', { 
                      day: 'numeric',
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Strengths */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">💪</span>
            Strengths
          </h2>
          <ul className="space-y-3">
            {report.strengths.map((strength, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Areas for Improvement */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Areas for Improvement
          </h2>
          <ul className="space-y-3">
            {report.areasForImprovement.map((area, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
              >
                <span className="text-amber-600 dark:text-amber-400 mt-1">→</span>
                <span className="text-gray-700 dark:text-gray-300">{area}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Development Actions */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Development Actions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Recommended actions based on this report card. For comprehensive development tracking, see the Development Plans section.
          </p>
          
          <div className="space-y-4">
            {report.developmentActions.map((plan) => (
              <div 
                key={plan.id}
                className={`border rounded-lg p-4 ${
                  plan.completed 
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                    : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    <input 
                      type="checkbox" 
                      checked={plan.completed}
                      readOnly
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-2 ${
                      plan.completed 
                        ? 'text-green-900 dark:text-green-100 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {plan.goal}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm mb-3">
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Started:</span> {plan.startDate.toLocaleDateString('en-GB', { 
                          day: 'numeric',
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Target:</span> {plan.targetDate.toLocaleDateString('en-GB', { 
                          day: 'numeric',
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      {plan.completed && plan.completedDate && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          ✓ Completed: {plan.completedDate.toLocaleDateString('en-GB', { 
                            day: 'numeric',
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-white">Actions:</h4>
                      <ul className="space-y-1">
                        {plan.actions.map((action, index) => (
                          <li 
                            key={index}
                            className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
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
        
        {/* Coach Comments */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">💬</span>
            Coach's Comments
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-600 dark:border-blue-400">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {report.coachComments}
            </p>
          </div>
        </div>
        
        {/* Similar Professional Players */}
        {report.similarProfessionalPlayers && report.similarProfessionalPlayers.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              Professional Player Comparisons
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Study these professional players to understand how to develop your game:
            </p>
            <div className="space-y-4">
              {report.similarProfessionalPlayers.map((proPlayer, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {proPlayer.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {proPlayer.team} • {proPlayer.position}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    <span className="font-medium text-gray-900 dark:text-white">Why study this player: </span>
                    {proPlayer.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
