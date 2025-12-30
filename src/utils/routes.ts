/**
 * Route utility functions for consistent URL generation across the application
 */

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
    return `/dashboard/${clubId}`;
  }

  static clubOverview(clubId: string): string {
    return `/dashboard/${clubId}`;
  }

  static clubEthos(clubId: string): string {
    return `/dashboard/${clubId}/ethos`;
  }

  static clubPlayers(clubId: string): string {
    return `/dashboard/${clubId}/players`;
  }

  static clubPlayerSettings(clubId: string, playerId: string): string {
    return `/dashboard/${clubId}/players/${playerId}/settings`;
  }

  static clubPlayerAlbum(clubId: string, playerId: string): string {
    return `/dashboard/${clubId}/players/${playerId}/album`;
  }

  static clubCoaches(clubId: string): string {
    return `/dashboard/${clubId}/coaches`;
  }

  static clubKits(clubId: string): string {
    return `/dashboard/${clubId}/kits`;
  }

  static clubSettings(clubId: string): string {
    return `/dashboard/${clubId}/settings`;
  }

  // Age Groups
  static ageGroups(clubId: string): string {
    return `/dashboard/${clubId}/age-groups`;
  }

  static ageGroup(clubId: string, ageGroupId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}`;
  }

  static ageGroupPlayers(clubId: string, ageGroupId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/players`;
  }

  static ageGroupCoaches(clubId: string, ageGroupId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/coaches`;
  }

  static ageGroupSettings(clubId: string, ageGroupId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/settings`;
  }

  static ageGroupNew(clubId: string): string {
    return `/dashboard/${clubId}/age-groups/new`;
  }

  static ageGroupEdit(clubId: string, ageGroupId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/edit`;
  }

  // Teams
  static teams(clubId: string, ageGroupId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams`;
  }

  static team(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}`;
  }

  static teamSquad(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/squad`;
  }

  static teamCoaches(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/coaches`;
  }

  static teamKits(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/kits`;
  }

  static teamSettings(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/settings`;
  }

  static teamNew(clubId: string, ageGroupId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/new`;
  }

  static teamEdit(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/edit`;
  }

  // Players
  static player(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}`;
  }

  static playerAbilities(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/abilities`;
  }

  static playerReportCard(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/report-card`;
  }

  static playerDevelopmentPlans(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/development-plans`;
  }

  static playerAlbum(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/album`;
  }

  static playerSettings(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/settings`;
  }

  // Players - Team Context
  static teamPlayer(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}`;
  }

  static teamPlayerAbilities(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/abilities`;
  }

  static teamPlayerReportCard(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/report-card`;
  }

  static teamPlayerDevelopmentPlans(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/development-plans`;
  }

  static teamPlayerAlbum(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/album`;
  }

  static teamPlayerSettings(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    playerId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/settings`;
  }

  // Coaches
  static coach(clubId: string, coachId: string): string {
    return `/dashboard/${clubId}/coaches/${coachId}`;
  }

  static coachSettings(clubId: string, coachId: string): string {
    return `/dashboard/${clubId}/coaches/${coachId}/settings`;
  }

  // Coaches - Age Group Context
  static ageGroupCoach(clubId: string, ageGroupId: string, coachId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/coaches/${coachId}`;
  }

  static ageGroupCoachSettings(clubId: string, ageGroupId: string, coachId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/coaches/${coachId}/settings`;
  }

  // Coaches - Team Context
  static teamCoach(clubId: string, ageGroupId: string, teamId: string, coachId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/coaches/${coachId}`;
  }

  static teamCoachSettings(clubId: string, ageGroupId: string, teamId: string, coachId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/coaches/${coachId}/settings`;
  }

  // Matches
  static clubMatches(clubId: string): string {
    return `/dashboard/${clubId}/matches`;
  }

  static ageGroupMatches(clubId: string, ageGroupId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/matches`;
  }

  static ageGroupTrainingSessions(clubId: string, ageGroupId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/training`;
  }

  static matches(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches`;
  }

  static matchNew(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches/new`;
  }

  static matchEdit(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    matchId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches/${matchId}/edit`;
  }

  static matchReport(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    matchId: string
  ): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches/${matchId}`;
  }

  // Formations
  static formations(): string {
    return '/formations';
  }

  static formation(formationId: string): string {
    return `/formations/${formationId}`;
  }

  // Tactics - Club Level
  static clubTactics(clubId: string): string {
    return `/dashboard/${clubId}/tactics`;
  }

  static clubTacticDetail(clubId: string, tacticId: string): string {
    return `/dashboard/${clubId}/tactics/${tacticId}`;
  }

  static clubTacticNew(clubId: string): string {
    return `/dashboard/${clubId}/tactics/new`;
  }

  static clubTacticEdit(clubId: string, tacticId: string): string {
    return `/dashboard/${clubId}/tactics/${tacticId}/edit`;
  }

  // Tactics - Age Group Level
  static ageGroupTactics(clubId: string, ageGroupId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/tactics`;
  }

  static ageGroupTacticDetail(clubId: string, ageGroupId: string, tacticId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/tactics/${tacticId}`;
  }

  static ageGroupTacticNew(clubId: string, ageGroupId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/tactics/new`;
  }

  static ageGroupTacticEdit(clubId: string, ageGroupId: string, tacticId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/tactics/${tacticId}/edit`;
  }

  // Tactics - Team Level
  static teamTactics(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/tactics`;
  }

  static teamTacticDetail(clubId: string, ageGroupId: string, teamId: string, tacticId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/tactics/${tacticId}`;
  }

  static teamTacticNew(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/tactics/new`;
  }

  static teamTacticEdit(clubId: string, ageGroupId: string, teamId: string, tacticId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/tactics/${tacticId}/edit`;
  }

  // Training
  static trainingSessions(): string {
    return '/training';
  }

  static trainingSession(sessionId: string): string {
    return `/training/${sessionId}`;
  }

  // Team Training Sessions
  static teamTrainingSessions(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/training`;
  }

  static teamTrainingSessionNew(clubId: string, ageGroupId: string, teamId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/training/new`;
  }

  static teamTrainingSession(clubId: string, ageGroupId: string, teamId: string, sessionId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/training/${sessionId}`;
  }

  static teamTrainingSessionEdit(clubId: string, ageGroupId: string, teamId: string, sessionId: string): string {
    return `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/training/${sessionId}/edit`;
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
