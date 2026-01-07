import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardList, Users, Plus, MapPin, X, Lock, Unlock, Link as LinkIcon, Clock, Calendar, ExternalLink, Youtube, Instagram, Globe, BookOpen, FileText } from 'lucide-react';
import { sampleTrainingSessions, sampleDrills, sampleDrillTemplates } from '@/data/training';
import { sampleTeams } from '@/data/teams';
import { sampleClubs } from '@/data/clubs';
import { samplePlayers } from '@/data/players';
import { getAgeGroupById } from '@/data/ageGroups';
import { sampleCoaches, getCoachesByTeam, getCoachesByAgeGroup } from '@/data/coaches';
import { coachRoleDisplay, sessionDurations, drillCategories, getDrillCategoryColors } from '@/data/referenceData';
import { Routes } from '@utils/routes';
import { Drill, SessionDrill } from '@/types';

export default function AddEditTrainingSessionPage() {
  const { clubId, ageGroupId, teamId, sessionId } = useParams();
  const navigate = useNavigate();
  const isEditing = sessionId && sessionId !== 'new';

  const team = sampleTeams.find(t => t.id === teamId);
  const club = sampleClubs.find(c => c.id === clubId);
  
  // Try to get age group from URL param, fallback to team's ageGroupId if not found
  let ageGroup = getAgeGroupById(ageGroupId || '');
  if (!ageGroup && team?.ageGroupId) {
    ageGroup = getAgeGroupById(team.ageGroupId);
  }
  
  const existingSession = isEditing ? sampleTrainingSessions.find(s => s.id === sessionId) : null;

  // Get players for this team
  const teamPlayers = samplePlayers.filter(p => team?.playerIds.includes(p.id));

  // Check if team is archived
  if (team?.isArchived && sessionId === 'new') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-orange-800 dark:text-orange-300 mb-2">
              Cannot Schedule Training Session
            </h2>
            <p className="text-orange-700 dark:text-orange-400 mb-4">
              This team is archived. You cannot schedule new training sessions for an archived team. Please unarchive the team first in Settings.
            </p>
            <button
              onClick={() => navigate(Routes.teamTrainingSessions(clubId!, ageGroupId!, teamId!))}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Training Sessions
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Form state
  const [sessionDate, setSessionDate] = useState(
    existingSession?.date ? existingSession.date.toISOString().slice(0, 16) : ''
  );
  const [meetTime, setMeetTime] = useState(
    existingSession?.meetTime ? existingSession.meetTime.toISOString().slice(0, 16) : ''
  );
  const [duration, setDuration] = useState(existingSession?.duration?.toString() || '60');
  const [location, setLocation] = useState(existingSession?.location || '');
  const [focusAreas, setFocusAreas] = useState<string[]>(existingSession?.focusAreas || []);
  const [focusAreaInput, setFocusAreaInput] = useState('');
  
  // Initialize session drills from existing session (prefer sessionDrills, fallback to drillIds)
  const initSessionDrills = (): SessionDrill[] => {
    if (existingSession?.sessionDrills && existingSession.sessionDrills.length > 0) {
      return existingSession.sessionDrills;
    }
    // Convert legacy drillIds to SessionDrill format (all as ad-hoc)
    if (existingSession?.drillIds) {
      return existingSession.drillIds.map((drillId, index) => ({
        drillId,
        source: 'adhoc' as const,
        order: index + 1
      }));
    }
    return [];
  };
  
  const [sessionDrills, setSessionDrills] = useState<SessionDrill[]>(initSessionDrills());
  const [appliedTemplates, setAppliedTemplates] = useState<{ templateId: string; appliedAt: Date; drillIds: string[] }[]>(
    existingSession?.appliedTemplates || []
  );
  
  // Legacy: keep selectedDrillIds for backward compatibility (computed from sessionDrills)
  const selectedDrillIds = sessionDrills.map(sd => sd.drillId);
  
  const [notes, setNotes] = useState(existingSession?.notes || '');
  const [isLocked, setIsLocked] = useState(existingSession?.isLocked || false);
  
  // Coach assignment state
  const [assignedCoachIds, setAssignedCoachIds] = useState<string[]>(existingSession?.coachIds || []);
  const [showCoachModal, setShowCoachModal] = useState(false);
  
  // Drill selection modal
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [drillSearchTerm, setDrillSearchTerm] = useState('');
  const [drillCategoryFilter, setDrillCategoryFilter] = useState<string>('all');
  const [previewDrill, setPreviewDrill] = useState<Drill | null>(null);
  
  // Template selection modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');

  const [activeTab, setActiveTab] = useState<'details' | 'drills' | 'attendance'>('details');
  
  // Attendance state
  const [attendance, setAttendance] = useState<{ playerId: string; status: 'confirmed' | 'declined' | 'maybe' | 'pending'; notes?: string }[]>(
    existingSession?.attendance || teamPlayers.map(p => ({ playerId: p.id, status: 'pending' as const }))
  );
  
  // Get coaches for this team and age group
  const teamCoaches = team ? getCoachesByTeam(team.id) : [];
  const ageGroupCoaches = ageGroup ? getCoachesByAgeGroup(ageGroup.id, sampleTeams) : [];
  
  // Get coaches that can be added (in age group but not yet assigned)
  const availableCoachesForSession = ageGroupCoaches.filter(
    coach => !assignedCoachIds.includes(coach.id)
  );
  
  // Get assigned coach details
  const assignedCoaches = sampleCoaches.filter(coach => assignedCoachIds.includes(coach.id));
  
  // Auto-assign team coaches for new sessions
  useEffect(() => {
    if (!isEditing && teamCoaches.length > 0 && assignedCoachIds.length === 0) {
      setAssignedCoachIds(teamCoaches.map(c => c.id));
    }
  }, [isEditing, teamCoaches.length]);

  if (!team || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Team not found</h2>
          </div>
        </main>
      </div>
    );
  }

  const handleAddFocusArea = () => {
    if (focusAreaInput.trim() && !focusAreas.includes(focusAreaInput.trim())) {
      setFocusAreas([...focusAreas, focusAreaInput.trim()]);
      setFocusAreaInput('');
    }
  };

  const handleRemoveFocusArea = (area: string) => {
    setFocusAreas(focusAreas.filter(a => a !== area));
  };

  const handleAddDrill = (drillId: string) => {
    if (!selectedDrillIds.includes(drillId)) {
      const newDrill: SessionDrill = {
        drillId,
        source: 'adhoc',
        order: sessionDrills.length + 1
      };
      setSessionDrills([...sessionDrills, newDrill]);
    }
  };

  const handleRemoveDrill = (drillId: string) => {
    const updatedDrills = sessionDrills
      .filter(sd => sd.drillId !== drillId)
      .map((sd, index) => ({ ...sd, order: index + 1 }));
    setSessionDrills(updatedDrills);
    
    // If removing a drill from a template, update the applied templates
    setAppliedTemplates(prev => 
      prev.map(at => ({
        ...at,
        drillIds: at.drillIds.filter(id => id !== drillId)
      })).filter(at => at.drillIds.length > 0) // Remove template if all its drills are removed
    );
  };

  const handleSetAttendanceStatus = (playerId: string, status: 'confirmed' | 'declined' | 'maybe' | 'pending') => {
    setAttendance(attendance.map(a => 
      a.playerId === playerId ? { ...a, status } : a
    ));
  };

  const handleSetAttendanceNote = (playerId: string, note: string) => {
    setAttendance(attendance.map(a => 
      a.playerId === playerId ? { ...a, notes: note || undefined } : a
    ));
  };

  const handleToggleLock = () => {
    if (isLocked) {
      const confirmUnlock = window.confirm(
        'Are you sure you want to unlock this training session? This will allow editing of all session details.'
      );
      if (confirmUnlock) {
        setIsLocked(false);
      }
    } else {
      const confirmLock = window.confirm(
        'Are you sure you want to lock this training session? This will prevent any further edits until unlocked.'
      );
      if (confirmLock) {
        setIsLocked(true);
      }
    }
  };

  const handleSave = () => {
    // Check if session is locked
    if (isLocked) {
      alert('This training session is locked and cannot be edited. Please unlock it first.');
      return;
    }

    // Validate required fields
    if (!sessionDate || !location) {
      alert('Please fill in all required fields (Date/Time and Location)');
      return;
    }

    // In a real app, this would save to backend
    console.log('Saving training session...', {
      date: sessionDate,
      meetTime,
      duration: parseInt(duration) || 60,
      location,
      focusAreas,
      drillIds: selectedDrillIds, // Legacy field for backward compatibility
      sessionDrills, // New enhanced drill structure with source tracking
      appliedTemplates, // Templates that have been applied
      coachIds: assignedCoachIds,
      attendance,
      notes,
      isLocked
    });
    
    navigate(Routes.teamTrainingSessions(clubId!, ageGroupId!, teamId!));
  };

  // Filter drills for modal
  const filteredDrills = sampleDrills.filter(drill => {
    if (drillSearchTerm) {
      const searchLower = drillSearchTerm.toLowerCase();
      if (!drill.name.toLowerCase().includes(searchLower) && 
          !drill.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (drillCategoryFilter !== 'all' && drill.category !== drillCategoryFilter) {
      return false;
    }
    return true;
  });

  const selectedDrills = sampleDrills.filter(d => selectedDrillIds.includes(d.id));
  const totalDrillDuration = selectedDrills.reduce((acc, d) => acc + d.duration, 0);

  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'tiktok': return <span className="text-sm font-bold">TT</span>;
      case 'website': return <Globe className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  const handleApplyTemplate = (templateId: string, replaceAll: boolean = false) => {
    const template = sampleDrillTemplates.find(t => t.id === templateId);
    if (template) {
      if (replaceAll) {
        // Replace all existing drills with template drills
        const newDrills: SessionDrill[] = template.drillIds.map((drillId, index) => ({
          drillId,
          source: 'template' as const,
          templateId: template.id,
          order: index + 1
        }));
        setSessionDrills(newDrills);
        setAppliedTemplates([{
          templateId: template.id,
          appliedAt: new Date(),
          drillIds: template.drillIds
        }]);
        setFocusAreas(template.attributes);
        setDuration(template.totalDuration.toString());
      } else {
        // Add template drills to existing drills (only drills not already in session)
        const existingDrillIds = sessionDrills.map(sd => sd.drillId);
        const newDrillIds = template.drillIds.filter(id => !existingDrillIds.includes(id));
        
        if (newDrillIds.length === 0) {
          alert('All drills from this template are already in your session.');
          return;
        }
        
        const startOrder = sessionDrills.length + 1;
        const newDrills: SessionDrill[] = newDrillIds.map((drillId, index) => ({
          drillId,
          source: 'template' as const,
          templateId: template.id,
          order: startOrder + index
        }));
        
        setSessionDrills([...sessionDrills, ...newDrills]);
        setAppliedTemplates([...appliedTemplates, {
          templateId: template.id,
          appliedAt: new Date(),
          drillIds: newDrillIds
        }]);
        
        // Add focus areas from template (avoiding duplicates)
        const newFocusAreas = template.attributes.filter(attr => !focusAreas.includes(attr));
        if (newFocusAreas.length > 0) {
          setFocusAreas([...focusAreas, ...newFocusAreas]);
        }
        
        // Update duration if template adds significant time
        const templateDuration = template.drillIds
          .map(id => sampleDrills.find(d => d.id === id)?.duration || 0)
          .reduce((a, b) => a + b, 0);
        const currentDuration = parseInt(duration) || 60;
        if (templateDuration + totalDrillDuration > currentDuration) {
          setDuration((templateDuration + totalDrillDuration).toString());
        }
      }
      setShowTemplateModal(false);
    }
  };

  // Filter templates
  const filteredTemplates = sampleDrillTemplates.filter(template => {
    if (templateSearchTerm) {
      const searchLower = templateSearchTerm.toLowerCase();
      if (!template.name.toLowerCase().includes(searchLower) && 
          !template.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {isEditing ? 'Edit Training Session' : 'Add New Training Session'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {team.name} - {club.name}
              </p>
            </div>
            {isEditing && (
              <div className="flex items-center gap-3">
                {isLocked && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg font-medium">
                    🔒 Locked
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="card mb-4">
          <div className="flex justify-evenly sm:justify-start sm:flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'details'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="hidden sm:inline">Session Details</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('drills')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'drills'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <LinkIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Drills ({selectedDrillIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Attendance</span>
            </button>
          </div>

          {/* Session Details Tab */}
          {activeTab === 'details' && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Session Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Meet Time
                  </label>
                  <input
                    type="datetime-local"
                    value={meetTime}
                    onChange={(e) => setMeetTime(e.target.value)}
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Optional: When players should arrive before the session
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sessionDurations.map(d => (
                      <option key={d.value} value={d.value.toString()}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={isLocked}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter training location"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const searchQuery = location || 'football pitch near me';
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`, '_blank');
                      }}
                      disabled={isLocked}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      title="Open Google Maps to find location"
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="hidden sm:inline">Map</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Focus Areas */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🎯</span> Focus Areas
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  What skills or areas will this session focus on?
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {focusAreas.map((area, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm"
                    >
                      {area}
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFocusArea(area)}
                          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {!isLocked && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={focusAreaInput}
                      onChange={(e) => setFocusAreaInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFocusArea();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Passing, Shooting, Defending..."
                    />
                    <button
                      type="button"
                      onClick={handleAddFocusArea}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Coaching Staff Assignment */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>👨‍🏫</span> Coaching Staff
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Coaches running this training session. Team coaches are automatically assigned.
                    </p>
                  </div>
                  {!isLocked && availableCoachesForSession.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCoachModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                      title="Add Coach"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {assignedCoaches.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignedCoaches.map((coach) => {
                      const isTeamCoach = teamCoaches.some(tc => tc.id === coach.id);
                      return (
                        <div key={coach.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {coach.photo ? (
                            <img 
                              src={coach.photo} 
                              alt={`${coach.firstName} ${coach.lastName}`}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                              {coach.firstName[0]}{coach.lastName[0]}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {coach.firstName} {coach.lastName}
                            </p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                              {coachRoleDisplay[coach.role]}
                            </p>
                            {isTeamCoach && (
                              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                Team Coach
                              </span>
                            )}
                          </div>
                          {!isLocked && (
                            <button
                              type="button"
                              onClick={() => setAssignedCoachIds(assignedCoachIds.filter(id => id !== coach.id))}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Remove coach"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <span className="text-4xl mb-2 block">👨‍🏫</span>
                    <p>No coaches assigned to this session.</p>
                    {!isLocked && availableCoachesForSession.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowCoachModal(true)}
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                        title="Add Coach"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Session Plan / Notes */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>📝</span> Session Plan & Notes
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Add your session plan, objectives, equipment needed, or any other details for this training session.
                  </p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLocked}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-y"
                  placeholder={`Session Plan:
- Warm up (10 mins): Light jog, dynamic stretches
- Main session (40 mins): Passing drills, small-sided games
- Cool down (10 mins): Static stretches, team talk

Equipment needed: Cones, bibs, balls, goals

Notes: Remember to bring first aid kit. Weather forecast: light rain expected.`}
                />
              </div>
            </div>
          )}

          {/* Drills Tab */}
          {activeTab === 'drills' && (
            <div className="mt-4 space-y-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>⚽</span> Linked Drills
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Use a template or build manually. Total drill time: {totalDrillDuration} mins
                  </p>
                </div>
                {!isLocked && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTemplateModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <BookOpen className="w-5 h-5" />
                      <span className="hidden sm:inline">Use Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDrillModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="hidden sm:inline">Add Drill</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Applied Templates Summary */}
              {appliedTemplates.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Applied Templates
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {appliedTemplates.map((at) => {
                      const template = sampleDrillTemplates.find(t => t.id === at.templateId);
                      return template ? (
                        <span
                          key={at.templateId}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          <BookOpen className="w-3 h-3" />
                          {template.name}
                          <span className="text-blue-600 dark:text-blue-400 text-xs">
                            ({at.drillIds.length} drills)
                          </span>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {selectedDrills.length > 0 ? (
                <div className="space-y-2">
                  {sessionDrills.map((sessionDrill, index) => {
                    const drill = sampleDrills.find(d => d.id === sessionDrill.drillId);
                    if (!drill) return null;
                    
                    const sourceTemplate = sessionDrill.source === 'template' && sessionDrill.templateId
                      ? sampleDrillTemplates.find(t => t.id === sessionDrill.templateId)
                      : null;
                    
                    return (
                    <div key={drill.id} className={`rounded-lg p-4 ${
                      sessionDrill.source === 'template' 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
                              {index + 1}.
                            </span>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {drill.name}
                            </h4>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getDrillCategoryColors(drill.category).bgColor} ${getDrillCategoryColors(drill.category).textColor}`}>
                              {drill.category}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {drill.duration} mins
                            </span>
                            {/* Source badge */}
                            {sessionDrill.source === 'template' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-full" title={sourceTemplate ? `From: ${sourceTemplate.name}` : 'From template'}>
                                <BookOpen className="w-3 h-3" />
                                Template
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-300 rounded-full">
                                <Plus className="w-3 h-3" />
                                Ad-hoc
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {drill.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {drill.attributes.map((skill: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                          {drill.links && drill.links.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {drill.links.map((link, i) => (
                                <a
                                  key={i}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                  title={link.title}
                                >
                                  {getLinkIcon(link.type)}
                                  <span className="max-w-[150px] truncate">{link.title}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDrill(drill.id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Remove drill"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <span className="text-5xl mb-3 block">⚽</span>
                  <p className="font-medium">No drills linked to this session</p>
                  <p className="text-sm mt-1">Click "Use Template" to start with a pre-built plan, or "Add Drill" to build from scratch</p>
                </div>
              )}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="mt-4 space-y-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>📋</span> Player Attendance
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Track player availability for this training session
                </p>
              </div>

              <div className="space-y-2">
                {teamPlayers.map((player) => {
                  const playerAttendance = attendance.find(a => a.playerId === player.id);
                  const status = playerAttendance?.status || 'pending';
                  
                  const getStatusColor = (s: string) => {
                    switch (s) {
                      case 'confirmed': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
                      case 'declined': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
                      case 'maybe': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
                      default: return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
                    }
                  };
                  
                  const getStatusIcon = (s: string) => {
                    switch (s) {
                      case 'confirmed': return '✓';
                      case 'declined': return '✕';
                      case 'maybe': return '?';
                      default: return '•';
                    }
                  };
                  
                  const getStatusButtonColor = (s: string, isActive: boolean) => {
                    if (!isActive) return 'bg-gray-200 dark:bg-gray-600 text-gray-400';
                    switch (s) {
                      case 'confirmed': return 'bg-green-600 text-white';
                      case 'declined': return 'bg-red-600 text-white';
                      case 'maybe': return 'bg-yellow-500 text-white';
                      default: return 'bg-gray-400 text-white';
                    }
                  };
                  
                  return (
                    <div 
                      key={player.id} 
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition-colors ${getStatusColor(status)}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${getStatusButtonColor(status, true)}`}>
                          {getStatusIcon(status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {player.preferredPositions?.[0] || 'Position not set'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                          <button
                            type="button"
                            onClick={() => handleSetAttendanceStatus(player.id, 'confirmed')}
                            disabled={isLocked}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                              status === 'confirmed' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Confirmed"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetAttendanceStatus(player.id, 'maybe')}
                            disabled={isLocked}
                            className={`px-3 py-1.5 text-sm font-medium border-l border-r border-gray-300 dark:border-gray-600 transition-colors ${
                              status === 'maybe' 
                                ? 'bg-yellow-500 text-white' 
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Maybe"
                          >
                            ?
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetAttendanceStatus(player.id, 'declined')}
                            disabled={isLocked}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                              status === 'declined' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Declined"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          value={playerAttendance?.notes || ''}
                          onChange={(e) => handleSetAttendanceNote(player.id, e.target.value)}
                          disabled={isLocked}
                          className="w-32 sm:w-48 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="Notes (optional)"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                      <span className="font-medium">{attendance.filter(a => a.status === 'confirmed').length}</span> Confirmed
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      <span className="font-medium">{attendance.filter(a => a.status === 'maybe').length}</span> Maybe
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                      <span className="font-medium">{attendance.filter(a => a.status === 'declined').length}</span> Declined
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                      <span className="font-medium">{attendance.filter(a => a.status === 'pending').length}</span> Pending
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLocked && (
            <div className="mt-4 pt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                🔒 This training session is locked. Unlock it to make changes.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              {/* Left side - Session-specific controls */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleToggleLock}
                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg font-medium ${
                      isLocked
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Unlock className="w-5 h-5" />
                        <span>Unlock Session</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Lock Session</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* Right side - Standard form actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate(Routes.teamTrainingSessions(clubId!, ageGroupId!, teamId!))}
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLocked}
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                >
                  {isEditing ? 'Save Changes' : 'Create Session'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Coach Selection Modal */}
      {showCoachModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Coach from Age Group</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{availableCoachesForSession.length} coaches available</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCoachModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {availableCoachesForSession.length > 0 ? (
                <div className="space-y-2">
                  {availableCoachesForSession.map((coach) => {
                    const coachTeams = sampleTeams.filter(t => coach.teamIds.includes(t.id) && t.ageGroupId === ageGroup?.id);
                    return (
                      <button
                        key={coach.id}
                        type="button"
                        onClick={() => {
                          setAssignedCoachIds([...assignedCoachIds, coach.id]);
                          setShowCoachModal(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        {coach.photo ? (
                          <img 
                            src={coach.photo} 
                            alt={`${coach.firstName} ${coach.lastName}`}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {coach.firstName[0]}{coach.lastName[0]}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {coach.firstName} {coach.lastName}
                          </p>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">
                            {coachRoleDisplay[coach.role]}
                          </p>
                          {coachTeams.length > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {coachTeams.map(t => t.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  All coaches from this age group have been assigned.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drill Selection Modal */}
      {showDrillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Drill to Session</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Select drills from the library</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDrillModal(false);
                  setPreviewDrill(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    value={drillSearchTerm}
                    onChange={(e) => setDrillSearchTerm(e.target.value)}
                    placeholder="Search drills..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={drillCategoryFilter}
                    onChange={(e) => setDrillCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">All Categories</option>
                    {drillCategories.filter(c => c.value !== 'mixed').map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden flex">
              {/* Drills List */}
              <div className={`p-6 overflow-y-auto ${previewDrill ? 'w-1/2 border-r border-gray-200 dark:border-gray-700' : 'w-full'}`}>
                {filteredDrills.length > 0 ? (
                  <div className="space-y-2">
                    {filteredDrills.map((drill) => {
                      const isSelected = selectedDrillIds.includes(drill.id);
                      const isPreviewed = previewDrill?.id === drill.id;
                      return (
                        <div
                          key={drill.id}
                          className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                            isPreviewed
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                              : isSelected
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          onClick={() => setPreviewDrill(drill)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {drill.name}
                                </h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getDrillCategoryColors(drill.category).bgColor} ${getDrillCategoryColors(drill.category).textColor}`}>
                                  {drill.category}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {drill.duration} mins
                                </span>
                                {drill.links && drill.links.length > 0 && (
                                  <span className="text-xs text-blue-600 dark:text-blue-400" title="Has reference links">
                                    🔗 {drill.links.length}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                {drill.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isSelected) {
                                  handleRemoveDrill(drill.id);
                                } else {
                                  handleAddDrill(drill.id);
                                }
                              }}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                                isSelected
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {isSelected ? 'Remove' : 'Add'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No drills found matching your search.
                  </p>
                )}
              </div>

              {/* Preview Panel */}
              {previewDrill && (
                <div className="w-1/2 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {previewDrill.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getDrillCategoryColors(previewDrill.category).bgColor} ${getDrillCategoryColors(previewDrill.category).textColor}`}>
                          {previewDrill.category}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ⏱️ {previewDrill.duration} minutes
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewDrill(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {previewDrill.description}
                      </p>
                    </div>

                    {/* Skills Focused */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills Focused</h4>
                      <div className="flex flex-wrap gap-1">
                        {previewDrill.attributes.map((skill: string, i: number) => (
                          <span key={i} className="px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Equipment */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Equipment Needed</h4>
                      <div className="flex flex-wrap gap-1">
                        {previewDrill.equipment.map((item, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Instructions</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {previewDrill.instructions.map((instruction, i) => (
                          <li key={i}>{instruction}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Variations */}
                    {previewDrill.variations && previewDrill.variations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Variations</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {previewDrill.variations.map((variation, i) => (
                            <li key={i}>{variation}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Reference Links */}
                    {previewDrill.links && previewDrill.links.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Reference Links</h4>
                        <div className="space-y-2">
                          {previewDrill.links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
                            >
                              <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                                {getLinkIcon(link.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {link.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {link.url}
                                </p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedDrillIds.length} drills selected ({totalDrillDuration} mins total)
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowDrillModal(false);
                    setPreviewDrill(null);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Session Template</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Apply a pre-built session plan with drills and focus areas</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {/* Search */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={templateSearchTerm}
                onChange={(e) => setTemplateSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {filteredTemplates.length > 0 ? (
                <div className="space-y-2">
                  {filteredTemplates.map((template) => {
                    const templateDrills = template.drillIds
                      .map(id => sampleDrills.find(d => d.id === id))
                      .filter(Boolean);
                    
                    return (
                      <div
                        key={template.id}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {template.name}
                              </h4>
                              {template.category && (
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getDrillCategoryColors(template.category).bgColor} ${getDrillCategoryColors(template.category).textColor}`}>
                                  {template.category}
                                </span>
                              )}
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {template.totalDuration} mins • {template.drillIds.length} drills
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                              {template.description}
                            </p>
                            
                            {/* Drills List */}
                            <div className="mb-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Drills:</p>
                              <div className="flex flex-wrap gap-1">
                                {templateDrills.map((drill, i) => {
                                  const alreadyInSession = selectedDrillIds.includes(drill?.id || '');
                                  return (
                                    <span 
                                      key={i} 
                                      className={`px-2 py-0.5 text-xs rounded ${
                                        alreadyInSession 
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                      }`}
                                      title={alreadyInSession ? 'Already in session' : ''}
                                    >
                                      {drill?.name}
                                      {alreadyInSession && ' ✓'}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Focus Areas */}
                            <div className="flex flex-wrap gap-1">
                              {template.attributes.map((area: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => handleApplyTemplate(template.id, false)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm"
                              title="Add template drills to your existing session"
                            >
                              Add to Session
                            </button>
                            {sessionDrills.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm('This will replace all existing drills with the template drills. Continue?')) {
                                    handleApplyTemplate(template.id, true);
                                  }
                                }}
                                className="px-4 py-2 border border-orange-500 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors whitespace-nowrap text-sm"
                                title="Replace all existing drills with template drills"
                              >
                                Replace All
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No templates found matching your search.
                </p>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {sessionDrills.length > 0 
                    ? 'Add template drills to your session, or replace all existing drills' 
                    : 'Select a template to automatically add drills and focus areas'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
