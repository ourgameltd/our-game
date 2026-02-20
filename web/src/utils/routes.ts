/**
 * Route utility functions for consistent URL generation across the application
 */

/**
 * Validates that a route parameter is defined and not a string literal 'undefined' or 'null'
 * @param value - The parameter value to validate
 * @param paramName - Name of the parameter for error messages
 * @returns The validated string
 * @throws Error if the parameter is invalid
 */
function validateParam(value: string | undefined, paramName: string): string {
  if (!value || value === 'undefined' || value === 'null') {
    throw new Error(`Route parameter "${paramName}" is required but was ${value === undefined ? 'undefined' : `"${value}"`}`);
  }
  return value;
}

/**
 * Checks if a parameter is valid (defined and not a string literal 'undefined' or 'null')
 * @param value - The parameter value to check
 * @returns true if the parameter is valid, false otherwise
 */
export function isValidParam(value: string | undefined | null): value is string {
  return !!value && value !== 'undefined' && value !== 'null';
}

/**
 * Validates all parameters in an array and returns true only if all are valid
 * @param params - Array of parameter values to validate
 * @returns true if all parameters are valid
 */
export function areAllParamsValid(...params: (string | undefined | null)[]): boolean {
  return params.every(p => isValidParam(p));
}

export class Routes {
  // Home
  static home(): string {
    return '/';
  }

  // Dashboard (Clubs)
  static clubs(): string {
    return '/dashboard';
  }

  static dashboard(): string {
    return '/dashboard';
  }

  static club(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}`;
  }

  static clubOverview(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}`;
  }

  static clubEthos(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/ethos`;
  }

  static clubPlayers(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/players`;
  }

  static clubPlayerSettings(clubId: string, playerId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/players/${validateParam(playerId, 'playerId')}/settings`;
  }

  static clubPlayerAlbum(clubId: string, playerId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/players/${validateParam(playerId, 'playerId')}/album`;
  }

  static clubCoaches(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/coaches`;
  }

  static clubKits(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/kits`;
  }

  static clubTraining(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/training`;
  }

  static clubSettings(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/settings`;
  }

  // Age Groups
  static ageGroups(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups`;
  }

  static ageGroup(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}`;
  }

  static ageGroupPlayers(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players`;
  }

  static ageGroupCoaches(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/coaches`;
  }

  static ageGroupSettings(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/settings`;
  }

  static ageGroupNew(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/new`;
  }

  static ageGroupEdit(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/edit`;
  }

  // Teams
  static teams(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams`;
  }

  static team(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}`;
  }

  static teamSquad(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/squad`;
  }

  static teamCoaches(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/coaches`;
  }

  static teamKits(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/kits`;
  }

  static teamSettings(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/settings`;
  }

  static teamNew(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/new`;
  }

  static teamEdit(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/edit`;
  }

  // Players
  static player(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}`;
  }

  static playerAbilities(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}/abilities`;
  }

  static playerReportCard(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}/report-card`;
  }

  static playerReportCardDetail(
    clubId: string,
    ageGroupId: string,
    playerId: string,
    reportId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}/report-cards/${validateParam(reportId, 'reportId')}`;
  }

  static playerReportCards(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}/report-cards`;
  }

  static editPlayerReportCard(
    clubId: string,
    ageGroupId: string,
    playerId: string,
    reportId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}/report-cards/${validateParam(reportId, 'reportId')}/edit`;
  }

  static newPlayerReportCard(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}/report-cards/new`;
  }

  static playerDevelopmentPlan(
    clubId: string,
    ageGroupId: string,
    playerId: string,
    planId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}/development-plans/${validateParam(planId, 'planId')}`;
  }

  static playerDevelopmentPlans(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}/development-plans`;
  }

  static editPlayerDevelopmentPlan(
    clubId: string,
    ageGroupId: string,
    playerId: string,
    planId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}/development-plans/${validateParam(planId, 'planId')}/edit`;
  }

  static newPlayerDevelopmentPlan(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}/development-plans/new`;
  }

  static playerAlbum(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}/album`;
  }

  static playerSettings(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/players/${validateParam(playerId, 'playerId')}/settings`;
  }

  // Players - Team Context
  static teamPlayer(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}`;
  }

  static teamPlayerAbilities(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}/abilities`;
  }

  static teamPlayerReportCard(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}/report-card`;
  }

  static teamPlayerReportCardDetail(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string,
    reportId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}/report-cards/${validateParam(reportId, 'reportId')}`;
  }

  static teamPlayerReportCards(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}/report-cards`;
  }

  static editTeamPlayerReportCard(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string,
    reportId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}/report-cards/${validateParam(reportId, 'reportId')}/edit`;
  }

  static newTeamPlayerReportCard(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}/report-cards/new`;
  }

  static teamPlayerDevelopmentPlan(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string,
    planId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}/development-plans/${validateParam(planId, 'planId')}`;
  }

  static teamPlayerDevelopmentPlans(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}/development-plans`;
  }

  static editTeamPlayerDevelopmentPlan(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string,
    planId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}/development-plans/${validateParam(planId, 'planId')}/edit`;
  }

  static newTeamPlayerDevelopmentPlan(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}/development-plans/new`;
  }

  static teamPlayerAlbum(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}/album`;
  }

  static teamPlayerSettings(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/players/${validateParam(playerId, 'playerId')}/settings`;
  }

  // Coaches
  static coach(clubId: string, coachId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/coaches/${validateParam(coachId, 'coachId')}`;
  }

  static coachSettings(clubId: string, coachId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/coaches/${validateParam(coachId, 'coachId')}/settings`;
  }

  // Coaches - Age Group Context
  static ageGroupCoach(clubId: string, ageGroupId: string, coachId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/coaches/${validateParam(coachId, 'coachId')}`;
  }

  static ageGroupCoachSettings(clubId: string, ageGroupId: string, coachId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/coaches/${validateParam(coachId, 'coachId')}/settings`;
  }

  // Coaches - Team Context
  static teamCoach(clubId: string, ageGroupId: string, teamId: string, coachId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/coaches/${validateParam(coachId, 'coachId')}`;
  }

  static teamCoachSettings(clubId: string, ageGroupId: string, teamId: string, coachId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/coaches/${validateParam(coachId, 'coachId')}/settings`;
  }

  // Matches
  static clubMatches(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/matches`;
  }

  static ageGroupMatches(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/matches`;
  }

  static ageGroupTrainingSessions(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/training`;
  }

  static matches(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/matches`;
  }

  static matchNew(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/matches/new`;
  }

  static matchEdit(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    matchId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/matches/${validateParam(matchId, 'matchId')}/edit`;
  }

  static matchReport(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    matchId: string
  ): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/matches/${validateParam(matchId, 'matchId')}`;
  }

  // Tactics - Club Level
  static clubTactics(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/tactics`;
  }

  static clubTacticNew(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/tactics/new`;
  }

  static clubTacticDetail(clubId: string, tacticId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/tactics/${validateParam(tacticId, 'tacticId')}`;
  }

  static clubTacticEdit(clubId: string, tacticId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/tactics/${validateParam(tacticId, 'tacticId')}/edit`;
  }

  // Tactics - Age Group Level
  static ageGroupTactics(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/tactics`;
  }

  static ageGroupTacticNew(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/tactics/new`;
  }

  static ageGroupTacticDetail(clubId: string, ageGroupId: string, tacticId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/tactics/${validateParam(tacticId, 'tacticId')}`;
  }

  static ageGroupTacticEdit(clubId: string, ageGroupId: string, tacticId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/tactics/${validateParam(tacticId, 'tacticId')}/edit`;
  }

  // Tactics - Team Level
  static teamTactics(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/tactics`;
  }

  static teamTacticNew(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/tactics/new`;
  }

  static teamTacticDetail(clubId: string, ageGroupId: string, teamId: string, tacticId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/tactics/${validateParam(tacticId, 'tacticId')}`;
  }

  static teamTacticEdit(clubId: string, ageGroupId: string, teamId: string, tacticId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/tactics/${validateParam(tacticId, 'tacticId')}/edit`;
  }

  // Formations
  static formations(): string {
    return '/formations';
  }

  static formation(formationId: string): string {
    return `/formations/${validateParam(formationId, 'formationId')}`;
  }

  // Training
  static trainingSessions(): string {
    return '/training';
  }

  static trainingSession(sessionId: string): string {
    return `/training/${validateParam(sessionId, 'sessionId')}`;
  }

  // Drills Library - Club Level
  static drills(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/drills`;
  }

  static drillNew(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/drills/new`;
  }

  static drill(clubId: string, drillId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/drills/${validateParam(drillId, 'drillId')}`;
  }

  static drillEdit(clubId: string, drillId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/drills/${validateParam(drillId, 'drillId')}/edit`;
  }

  // Drill Templates (Session Plans) - Club Level
  static drillTemplates(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/drill-templates`;
  }

  static drillTemplateNew(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/drill-templates/new`;
  }

  static drillTemplate(clubId: string, templateId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/drill-templates/${validateParam(templateId, 'templateId')}`;
  }

  static drillTemplateEdit(clubId: string, templateId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/drill-templates/${validateParam(templateId, 'templateId')}/edit`;
  }

  // Drills Library - Age Group Level
  static ageGroupDrills(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/drills`;
  }

  static ageGroupDrillNew(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/drills/new`;
  }

  static ageGroupDrill(clubId: string, ageGroupId: string, drillId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/drills/${validateParam(drillId, 'drillId')}`;
  }

  static ageGroupDrillEdit(clubId: string, ageGroupId: string, drillId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/drills/${validateParam(drillId, 'drillId')}/edit`;
  }

  // Drill Templates - Age Group Level
  static ageGroupDrillTemplates(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/drill-templates`;
  }

  static ageGroupDrillTemplateNew(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/drill-templates/new`;
  }

  static ageGroupDrillTemplate(clubId: string, ageGroupId: string, templateId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/drill-templates/${validateParam(templateId, 'templateId')}`;
  }

  static ageGroupDrillTemplateEdit(clubId: string, ageGroupId: string, templateId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/drill-templates/${validateParam(templateId, 'templateId')}/edit`;
  }

  // Drills Library - Team Level
  static teamDrills(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/drills`;
  }

  static teamDrillNew(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/drills/new`;
  }

  static teamDrill(clubId: string, ageGroupId: string, teamId: string, drillId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/drills/${validateParam(drillId, 'drillId')}`;
  }

  static teamDrillEdit(clubId: string, ageGroupId: string, teamId: string, drillId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/drills/${validateParam(drillId, 'drillId')}/edit`;
  }

  // Drill Templates - Team Level
  static teamDrillTemplates(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/drill-templates`;
  }

  static teamDrillTemplateNew(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/drill-templates/new`;
  }

  static teamDrillTemplate(clubId: string, ageGroupId: string, teamId: string, templateId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/drill-templates/${validateParam(templateId, 'templateId')}`;
  }

  static teamDrillTemplateEdit(clubId: string, ageGroupId: string, teamId: string, templateId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/drill-templates/${validateParam(templateId, 'templateId')}/edit`;
  }

  // Team Training Sessions
  static teamTrainingSessions(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/training`;
  }

  static teamTrainingSessionNew(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/training/new`;
  }

  static teamTrainingSession(clubId: string, ageGroupId: string, teamId: string, sessionId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/training/${validateParam(sessionId, 'sessionId')}`;
  }

  static teamTrainingSessionEdit(clubId: string, ageGroupId: string, teamId: string, sessionId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/training/${validateParam(sessionId, 'sessionId')}/edit`;
  }

  // Report Cards (Management)
  static clubReportCards(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/report-cards`;
  }

  static ageGroupReportCards(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/report-cards`;
  }

  static teamReportCards(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/report-cards`;
  }

  // Development Plans (Management)
  static clubDevelopmentPlans(clubId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/development-plans`;
  }

  static ageGroupDevelopmentPlans(clubId: string, ageGroupId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/development-plans`;
  }

  static teamDevelopmentPlans(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${validateParam(clubId, 'clubId')}/age-groups/${validateParam(ageGroupId, 'ageGroupId')}/teams/${validateParam(teamId, 'teamId')}/development-plans`;
  }

  // Auth
  static login(): string {
    return '/login';
  }

  static register(): string {
    return '/register';
  }

  static passwordReset(): string {
    return '/password-reset';
  }

  // Profile
  static profile(): string {
    return '/profile';
  }

  // Notifications
  static notifications(): string {
    return '/notifications';
  }

  // Help & Support
  static help(): string {
    return '/help';
  }
}
