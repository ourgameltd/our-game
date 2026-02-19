import { useParams } from 'react-router-dom';
import { usePlayer, useReportCard } from '@/api';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import { AlertCircle } from 'lucide-react';

/**
 * Skeleton component for page title loading state
 */
function PageTitleSkeleton() {
  return (
    <div className="mb-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton component for report card header
 */
function ReportHeaderSkeleton() {
  return (
    <div className="card mb-4 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton component for report card sections
 */
function ReportSectionSkeleton() {
  return (
    <div className="card mb-4 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export default function PlayerReportCardPage() {
  const { playerId, clubId, ageGroupId, teamId, reportId } = useParams();
  
  // Fetch player and report card from API
  const { data: player, isLoading: playerLoading, error: playerError } = usePlayer(playerId);
  const { data: reportCard, isLoading: reportLoading, error: reportError } = useReportCard(reportId);

  const isLoading = playerLoading || reportLoading;
  
  // Player error state
  if (playerError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Error loading player</h2>
                <p className="text-red-700 dark:text-red-300">
                  {playerError.message || 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Player not found after loading
  if (!isLoading && !player) {
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
  
  // Report card error state (404 = No Reports Available)
  if (reportError) {
    const is404 = (reportError as any).statusCode === 404;
    
    if (is404) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <main className="mx-auto px-4 py-4">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">No Reports Available</h2>
              <p className="text-gray-600 dark:text-gray-400">
                No report cards have been created for {player?.firstName} {player?.lastName} yet.
              </p>
            </div>
          </main>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Error loading report card</h2>
                <p className="text-red-700 dark:text-red-300">
                  {reportError.message || 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Report card not found after loading
  if (!isLoading && !reportCard) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">No Reports Available</h2>
            <p className="text-gray-600 dark:text-gray-400">
              No report cards have been created for {player?.firstName} {player?.lastName} yet.
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
    settingsLink = Routes.editTeamPlayerReportCard(clubId!, ageGroupId, teamId, playerId!, reportId!);
  } else if (ageGroupId) {
    backLink = Routes.playerReportCards(clubId!, ageGroupId, playerId!);
    settingsLink = Routes.editPlayerReportCard(clubId!, ageGroupId, playerId!, reportId!);
  } else {
    backLink = Routes.clubPlayers(clubId!);
    settingsLink = '#';
  }

  // Parse dates from API response
  const periodStart = reportCard?.periodStart ? new Date(reportCard.periodStart) : null;
  const periodEnd = reportCard?.periodEnd ? new Date(reportCard.periodEnd) : null;
  const createdAt = reportCard?.createdAt ? new Date(reportCard.createdAt) : new Date();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Page Title */}
        {isLoading ? (
          <PageTitleSkeleton />
        ) : (
          <PageTitle
            title="Report Card"
            subtitle={`${player?.firstName} ${player?.lastName}`}
            backLink={backLink}
            image={{
              src: player?.photoUrl || '',
              alt: `${player?.firstName} ${player?.lastName}`,
              initials: `${player?.firstName?.[0] || ''}${player?.lastName?.[0] || ''}`,
              colorClass: 'from-blue-500 to-blue-600'
            }}
            action={{
              label: 'Settings',
              href: settingsLink,
              icon: 'settings',
              title: 'Edit Report Card'
            }}
          />
        )}

        {/* Current Report Header */}
        {isLoading ? (
          <ReportHeaderSkeleton />
        ) : reportCard ? (
          <div className="card mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Current Report <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">Created {createdAt.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </h2>
                {periodStart && periodEnd && (
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {periodStart.toLocaleDateString('en-GB', { 
                      month: 'short', 
                      year: 'numeric' 
                    })} - {periodEnd.toLocaleDateString('en-GB', { 
                      month: 'short', 
                      year: 'numeric' 
                  })}
                  </div>
                )}
            </div>
          </div>
        ) : null}
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
            <ReportSectionSkeleton />
            <ReportSectionSkeleton />
          </div>
        ) : reportCard ? (
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
            {/* Strengths */}
            <div className="card mb-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">💪</span>
                Strengths
              </h2>
              <ul className="space-y-2">
                {reportCard.strengths.map((strength, index) => (
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
                {reportCard.areasForImprovement.map((area, index) => (
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
        ) : null}
        
        {/* Development Actions */}
        {isLoading ? (
          <ReportSectionSkeleton />
        ) : reportCard && reportCard.developmentActions.length > 0 ? (
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Development Actions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Recommended actions based on this report card. For comprehensive development tracking, see the Development Plans section.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportCard.developmentActions.map((plan) => {
                const startDate = plan.startDate ? new Date(plan.startDate) : null;
                const targetDate = plan.targetDate ? new Date(plan.targetDate) : null;
                const completedDate = plan.completedDate ? new Date(plan.completedDate) : null;
                
                return (
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
                          {startDate && (
                            <span className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Started:</span> {startDate.toLocaleDateString('en-GB', { 
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
                          {plan.completed && completedDate && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              ✓ Completed: {completedDate.toLocaleDateString('en-GB', { 
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
                );
              })}
            </div>
          </div>
        ) : null}
        
        {/* Coach Comments */}
        {isLoading ? (
          <ReportSectionSkeleton />
        ) : reportCard ? (
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">💬</span>
              Coach's Comments
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-600 dark:border-blue-400">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {reportCard.coachComments}
              </p>
            </div>
          </div>
        ) : null}
        
        {/* Similar Professional Players */}
        {isLoading ? (
          <ReportSectionSkeleton />
        ) : reportCard && reportCard.similarProfessionals && reportCard.similarProfessionals.length > 0 ? (
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              Professional Player Comparisons
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Study these professional players to understand how to develop your game:
            </p>
            <div className="space-y-2">
              {reportCard.similarProfessionals.map((proPlayer) => (
                <div 
                  key={proPlayer.id}
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
        ) : null}
      </main>
    </div>
  );
}
