/**
 * Route utility functions for consistent URL generation across the application
 */

export class Routes {
  // Home
  static home(): string {
    return '/';
  }

  // Clubs
  static clubs(): string {
    return '/clubs';
  }

  static club(clubId: string): string {
    return `/clubs/${clubId}`;
  }

  static clubOverview(clubId: string): string {
    return `/clubs/${clubId}`;
  }

  static clubEthos(clubId: string): string {
    return `/clubs/${clubId}/ethos`;
  }

  static clubPlayers(clubId: string): string {
    return `/clubs/${clubId}/players`;
  }

  static clubPlayerSettings(clubId: string, playerId: string): string {
    return `/clubs/${clubId}/players/${playerId}/settings`;
  }

  static clubCoaches(clubId: string): string {
    return `/clubs/${clubId}/coaches`;
  }

  static clubKits(clubId: string): string {
    return `/clubs/${clubId}/kits`;
  }

  static clubSettings(clubId: string): string {
    return `/clubs/${clubId}/settings`;
  }

  // Age Groups
  static ageGroups(clubId: string): string {
    return `/clubs/${clubId}/age-groups`;
  }

  static ageGroup(clubId: string, ageGroupId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}`;
  }

  static ageGroupPlayers(clubId: string, ageGroupId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/players`;
  }

  static ageGroupCoaches(clubId: string, ageGroupId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/coaches`;
  }

  static ageGroupSettings(clubId: string, ageGroupId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/settings`;
  }

  static ageGroupNew(clubId: string): string {
    return `/clubs/${clubId}/age-groups/new`;
  }

  static ageGroupEdit(clubId: string, ageGroupId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/edit`;
  }

  // Teams
  static teams(clubId: string, ageGroupId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/teams`;
  }

  static team(clubId: string, ageGroupId: string, teamId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}`;
  }

  static teamSquad(clubId: string, ageGroupId: string, teamId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/squad`;
  }

  static teamKits(clubId: string, ageGroupId: string, teamId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/kits`;
  }

  static teamSettings(clubId: string, ageGroupId: string, teamId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/settings`;
  }

  static teamNew(clubId: string, ageGroupId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/teams/new`;
  }

  static teamEdit(clubId: string, ageGroupId: string, teamId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/edit`;
  }

  // Players
  static player(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}`;
  }

  static playerAbilities(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}/abilities`;
  }

  static playerReportCard(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}/report-card`;
  }

  static playerDevelopmentPlans(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}/development-plans`;
  }

  static playerSettings(
    clubId: string,
    ageGroupId: string,
    playerId: string
  ): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}/settings`;
  }

  // Coaches
  static coach(clubId: string, coachId: string): string {
    return `/clubs/${clubId}/coaches/${coachId}`;
  }

  static coachSettings(clubId: string, coachId: string): string {
    return `/clubs/${clubId}/coaches/${coachId}/settings`;
  }

  // Matches
  static matches(clubId: string, ageGroupId: string, teamId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches`;
  }

  static matchNew(clubId: string, ageGroupId: string, teamId: string): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches/new`;
  }

  static matchReport(
    clubId: string,
    ageGroupId: string,
    teamId: string,
    matchId: string
  ): string {
    return `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches/${matchId}`;
  }

  // Formations
  static formations(): string {
    return '/formations';
  }

  static formation(formationId: string): string {
    return `/formations/${formationId}`;
  }

  // Training
  static trainingSessions(): string {
    return '/training';
  }

  static trainingSession(sessionId: string): string {
    return `/training/${sessionId}`;
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
}
