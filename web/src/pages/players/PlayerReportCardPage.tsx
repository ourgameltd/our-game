import { useParams } from 'react-router-dom';
import { getReportsByPlayerId } from '@/data/reports';
import { getPlayerById } from '@data/players';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';

export default function PlayerReportCardPage() {
  const { playerId, clubId, ageGroupId, teamId } = useParams();
  
  const player = getPlayerById(playerId!);
  const reports = playerId ? getReportsByPlayerId(playerId) : [];
  
  const report = reports[0]; // Show most recent report
  
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
  
  if (reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
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
  
  // Determine back link based on context
  let backLink: string;
  let settingsLink: string;
  if (teamId && ageGroupId) {
    backLink = Routes.teamPlayerReportCards(clubId!, ageGroupId, teamId, playerId!);
    settingsLink = Routes.editTeamPlayerReportCard(clubId!, ageGroupId, teamId, playerId!, report.id);
  } else if (ageGroupId) {
    backLink = Routes.playerReportCards(clubId!, ageGroupId, playerId!);
    settingsLink = Routes.editPlayerReportCard(clubId!, ageGroupId, playerId!, report.id);
  } else {
    backLink = Routes.clubPlayers(clubId!);
    settingsLink = '#';
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Page Title */}
        <PageTitle
          title="Report Card"
          subtitle={`${player.firstName} ${player.lastName}`}
          backLink={backLink}
          image={{
            src: player.photo,
            alt: `${player.firstName} ${player.lastName}`,
            initials: `${player.firstName[0]}${player.lastName[0]}`,
            colorClass: 'from-blue-500 to-blue-600'
          }}
          action={{
            label: 'Settings',
            href: settingsLink,
            icon: 'settings',
            title: 'Edit Report Card'
          }}
        />

        {/* Current Report Header */}
        <div className="card mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Current Report <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">Created {report.createdAt.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long', 
                  year: 'numeric' 
                })}</span>
              </h2>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {report.period.start.toLocaleDateString('en-GB', { 
                  month: 'short', 
                  year: 'numeric' 
                })} - {report.period.end.toLocaleDateString('en-GB', { 
                  month: 'short', 
                  year: 'numeric' 
              })}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
          {/* Strengths */}
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">💪</span>
              Strengths
            </h2>
            <ul className="space-y-2">
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
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Areas for Improvement
            </h2>
            <ul className="space-y-2">
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
        </div>
        
        {/* Development Actions */}
        <div className="card mb-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Development Actions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Recommended actions based on this report card. For comprehensive development tracking, see the Development Plans section.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="card mb-4">
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
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              Professional Player Comparisons
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Study these professional players to understand how to develop your game:
            </p>
            <div className="space-y-2">
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
