import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiClient } from '@api/client';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import FormActions from '@components/common/FormActions';

export default function AddEditReportCardPage() {
  const { clubId, playerId, ageGroupId, teamId, reportId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const isEditMode = !!reportId;
  
  // Form state
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [strengths, setStrengths] = useState<string[]>(['']);
  const [improvements, setImprovements] = useState<string[]>(['']);
  const [coachComments, setCoachComments] = useState('');
  const [similarPlayers, setSimilarPlayers] = useState<Array<{
    id?: string;
    name: string;
    team: string;
    position: string;
    reason: string;
  }>>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load player data
        if (playerId) {
          const playerResponse = await apiClient.players.getById(playerId);
          if (playerResponse.success && playerResponse.data) {
            setPlayer(playerResponse.data);
          } else {
            setError('Failed to load player data');
          }
        }

        // Load report data if editing
        if (isEditMode && reportId) {
          const reportResponse = await apiClient.reports.getById(reportId);
          if (reportResponse.success && reportResponse.data) {
            const reportData = reportResponse.data;
            
            // Populate form with existing data
            setPeriodStart(reportData.periodStart || '');
            setPeriodEnd(reportData.periodEnd || '');
            setStrengths(reportData.strengths.length > 0 ? reportData.strengths : ['']);
            setImprovements(reportData.areasForImprovement.length > 0 ? reportData.areasForImprovement : ['']);
            setCoachComments(reportData.coachComments || '');
            
            // Map similar professionals - add id property
            setSimilarPlayers(
              reportData.similarProfessionals.length > 0 
                ? reportData.similarProfessionals.map((sp: any) => ({
                    id: sp.id,
                    name: sp.name || '',
                    team: sp.team || '',
                    position: sp.position || '',
                    reason: sp.reason || ''
                  }))
                : []
            );
          } else {
            setError('Failed to load report card');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred loading data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [playerId, reportId, isEditMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Error</h2>
            <p className="text-red-600 dark:text-red-400">{error || 'Player not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  // Determine back link based on context
  let backLink: string;
  let subtitle: string;
  if (isEditMode) {
    // Go back to report card detail
    if (teamId && ageGroupId) {
      backLink = Routes.teamPlayerReportCard(clubId!, ageGroupId, teamId, playerId!);
    } else if (ageGroupId) {
      backLink = Routes.playerReportCard(clubId!, ageGroupId, playerId!);
    } else {
      backLink = Routes.clubPlayers(clubId!);
    }
  } else {
    // Go back to report cards list
    if (teamId && ageGroupId) {
      backLink = Routes.teamPlayerReportCards(clubId!, ageGroupId, teamId, playerId!);
    } else if (ageGroupId) {
      backLink = Routes.playerReportCards(clubId!, ageGroupId, playerId!);
    } else {
      backLink = Routes.clubPlayers(clubId!);
    }
  }
  
  // Build subtitle with team and age group if available
  const ageGroupName = player.ageGroupName || player.teams?.[0]?.ageGroupName;
  const teamName = player.teamName || player.teams?.[0]?.name;
  
  if (teamId && ageGroupName && teamName) {
    subtitle = `${player.firstName} ${player.lastName} • ${ageGroupName} • ${teamName}`;
  } else if (ageGroupName) {
    subtitle = `${player.firstName} ${player.lastName} • ${ageGroupName}`;
  } else {
    subtitle = `${player.firstName} ${player.lastName}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Filter out empty values
      const filteredStrengths = strengths.filter(s => s.trim());
      const filteredImprovements = improvements.filter(i => i.trim());
      const filteredSimilarPlayers = similarPlayers.filter(p => p.name.trim() && p.reason.trim());

      if (isEditMode && reportId) {
        // Update existing report
        const updateRequest = {
          periodStart: periodStart || undefined,
          periodEnd: periodEnd || undefined,
          overallRating: undefined,
          strengths: filteredStrengths,
          areasForImprovement: filteredImprovements,
          coachComments,
          developmentActions: [],
          similarProfessionals: filteredSimilarPlayers.map(sp => ({
            id: sp.id,
            name: sp.name,
            team: sp.team,
            position: sp.position,
            reason: sp.reason
          }))
        };
        
        const response = await apiClient.reports.update(reportId, updateRequest);
        
        if (response.success) {
          navigate(backLink);
        } else {
          setError(response.error?.message || 'Failed to update report card');
        }
      } else {
        // Create new report
        const createRequest = {
          playerId: playerId!,
          periodStart: periodStart || undefined,
          periodEnd: periodEnd || undefined,
          overallRating: undefined,
          strengths: filteredStrengths,
          areasForImprovement: filteredImprovements,
          coachComments,
          developmentActions: [],
          similarProfessionals: filteredSimilarPlayers.map(sp => ({
            name: sp.name,
            team: sp.team,
            position: sp.position,
            reason: sp.reason
          }))
        };
        
        const response = await apiClient.reports.create(createRequest);
        
        if (response.success) {
          navigate(backLink);
        } else {
          setError(response.error?.message || 'Failed to create report card');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred saving the report');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(backLink);
  };

  const addStrength = () => {
    setStrengths([...strengths, '']);
  };

  const removeStrength = (index: number) => {
    setStrengths(strengths.filter((_, i) => i !== index));
  };

  const updateStrength = (index: number, value: string) => {
    const updated = [...strengths];
    updated[index] = value;
    setStrengths(updated);
  };

  const addImprovement = () => {
    setImprovements([...improvements, '']);
  };

  const removeImprovement = (index: number) => {
    setImprovements(improvements.filter((_, i) => i !== index));
  };

  const updateImprovement = (index: number, value: string) => {
    const updated = [...improvements];
    updated[index] = value;
    setImprovements(updated);
  };

  const addSimilarPlayer = () => {
    setSimilarPlayers([...similarPlayers, { name: '', team: '', position: '', reason: '' }]);
  };

  const removeSimilarPlayer = (index: number) => {
    setSimilarPlayers(similarPlayers.filter((_, i) => i !== index));
  };

  const updateSimilarPlayer = (index: number, field: 'name' | 'team' | 'position' | 'reason', value: string) => {
    const updated = [...similarPlayers];
    updated[index][field] = value;
    setSimilarPlayers(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Page Title */}
        <PageTitle
          title={isEditMode ? 'Edit Report Card' : 'New Report Card'}
          subtitle={subtitle}
          backLink={backLink}
        />

        {error && (
          <div className="card mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Report Period */}
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Report Period</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="periodStart" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Period Start
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
                  Period End
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
            </div>
          </div>

          {/* Strengths */}
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">💪</span>
                Strengths
              </h2>
              <button
                type="button"
                onClick={addStrength}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add Strength
              </button>
            </div>
            <div className="space-y-2">
              {strengths.map((strength, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) => updateStrength(index, e.target.value)}
                    placeholder="Enter a strength..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  {strengths.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStrength(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Areas for Improvement
              </h2>
              <button
                type="button"
                onClick={addImprovement}
                className="px-3 py-1 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                + Add Area
              </button>
            </div>
            <div className="space-y-2">
              {improvements.map((improvement, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={improvement}
                    onChange={(e) => updateImprovement(index, e.target.value)}
                    placeholder="Enter an area for improvement..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  {improvements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImprovement(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  )}
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
            <textarea
              value={coachComments}
              onChange={(e) => setCoachComments(e.target.value)}
              placeholder="Enter overall comments about the player's performance and development..."
              rows={6}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Similar Professional Players */}
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                Professional Player Comparisons
              </h2>
              <button
                type="button"
                onClick={addSimilarPlayer}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Player
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Suggest professional players for this player to study and learn from.
            </p>
            {similarPlayers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No professional player comparisons added yet.
              </p>
            ) : (
              <div className="space-y-2">
                {similarPlayers.map((player, index) => (
                  <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">Player {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeSimilarPlayer(index)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => updateSimilarPlayer(index, 'name', e.target.value)}
                          placeholder="e.g., Kevin De Bruyne"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Team
                        </label>
                        <input
                          type="text"
                          value={player.team}
                          onChange={(e) => updateSimilarPlayer(index, 'team', e.target.value)}
                          placeholder="e.g., Manchester City"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          value={player.position}
                          onChange={(e) => updateSimilarPlayer(index, 'position', e.target.value)}
                          placeholder="e.g., Midfielder"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Why study this player? *
                      </label>
                      <textarea
                        value={player.reason}
                        onChange={(e) => updateSimilarPlayer(index, 'reason', e.target.value)}
                        placeholder="Explain what aspects of this player's game are relevant to study..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="card">
            <FormActions
              onCancel={handleCancel}
              saveLabel={isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Report Card')}
              showArchive={false}
            />
          </div>
        </form>
      </main>
    </div>
  );
}
