import { DevelopmentPlan } from '../types/index';

export const sampleDevelopmentPlans: DevelopmentPlan[] = [
  {
    id: 'devplan-1',
    playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c', // Carlos Martinez
    createdBy: 'c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f',
    createdAt: new Date('2024-12-01'),
    period: {
      start: new Date('2024-12-01'),
      end: new Date('2025-02-28')
    },
    status: 'active',
    title: 'Complete Forward Development - Q1 2025',
    description: 'Focus on developing Carlos into a more complete forward by improving aerial ability, defensive contribution, and physical conditioning.',
    goals: [
      {
        id: 'goal-1-1',
        goal: 'Improve aerial duel success rate by 20%',
        actions: [
          'Additional heading practice sessions twice per week',
          'Study video analysis of aerial duels from professional strikers',
          'Work on timing of jumps and body positioning',
          'Practice with goalkeeper for crosses'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false,
        progress: 35
      },
      {
        id: 'goal-1-2',
        goal: 'Increase pressing actions per game from 8 to 15',
        actions: [
          'Study video analysis of pressing systems used by top teams',
          'Practice pressing drills in training sessions',
          'Track pressing actions in matches using statistics',
          'Learn optimal body positioning when pressing'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false,
        progress: 45
      },
      {
        id: 'goal-1-3',
        goal: 'Complete individual conditioning program',
        actions: [
          'Follow personalized fitness plan with strength coach',
          'Weekly strength training sessions focusing on core and legs',
          'Monitor stamina levels in matches',
          'Track sprint speeds and recovery times'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false,
        progress: 60
      },
      {
        id: 'goal-1-4',
        goal: 'Develop weak foot finishing ability',
        actions: [
          'Practice shooting drills with left foot daily',
          'One-touch finishing exercises',
          'Study professional strikers\' two-footed techniques',
          'Set target of 2 goals scored with left foot'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-01-31'),
        completed: true,
        completedDate: new Date('2025-01-28'),
        progress: 100
      }
    ],
    coachNotes: 'Carlos is responding well to the development program. His weak foot finishing has improved dramatically, and he scored his first left-footed goal last week. Need to maintain focus on aerial work and pressing.',
    linkedReportCardId: 'r1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'
  },
  {
    id: 'devplan-2',
    playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c', // Carlos Martinez - Previous plan
    createdBy: 'c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f',
    createdAt: new Date('2024-09-01'),
    period: {
      start: new Date('2024-09-01'),
      end: new Date('2024-11-30')
    },
    status: 'completed',
    title: 'Pre-Season Development - Autumn 2024',
    description: 'Initial development plan focusing on first-touch control and movement off the ball.',
    goals: [
      {
        id: 'goal-2-1',
        goal: 'Improve first-touch control under pressure',
        actions: [
          'Daily first-touch drills with varying ball speeds',
          'Practice receiving the ball while moving',
          'Work on cushioning technique',
          'Apply in small-sided games'
        ],
        startDate: new Date('2024-09-01'),
        targetDate: new Date('2024-11-30'),
        completed: true,
        completedDate: new Date('2024-11-15'),
        progress: 100
      },
      {
        id: 'goal-2-2',
        goal: 'Enhance movement patterns in attacking third',
        actions: [
          'Study video of elite strikers\' movement',
          'Practice timing runs between defenders',
          'Work on checking movements to create space',
          'Coordinate with midfielders on run timing'
        ],
        startDate: new Date('2024-09-01'),
        targetDate: new Date('2024-11-30'),
        completed: true,
        completedDate: new Date('2024-11-20'),
        progress: 100
      }
    ],
    coachNotes: 'Excellent progress throughout the term. Carlos has transformed his first-touch and movement. Ready to progress to more advanced areas.',
    linkedReportCardId: 'r1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'
  },
  {
    id: 'devplan-3',
    playerId: 'p22b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d', // James O'Connor
    createdBy: 'c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f',
    createdAt: new Date('2024-12-01'),
    period: {
      start: new Date('2024-12-01'),
      end: new Date('2025-02-28')
    },
    status: 'active',
    title: 'Advanced Defensive Skills - Q1 2025',
    description: 'Develop James as an elite center-back by enhancing ball-playing ability, reading of the game, and leadership qualities.',
    goals: [
      {
        id: 'goal-3-1',
        goal: 'Improve passing accuracy from defence to 90%',
        actions: [
          'Daily passing drills focusing on long and short range',
          'Practice playing out from the back under pressure',
          'Study video of elite ball-playing center-backs',
          'Work on receiving the ball on the half-turn'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false,
        progress: 50
      },
      {
        id: 'goal-3-2',
        goal: 'Develop leadership and communication skills',
        actions: [
          'Lead defensive line organization in training',
          'Study leadership styles of professional captains',
          'Practice giving clear instructions during matches',
          'Attend leadership workshop'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-01-31'),
        completed: false,
        progress: 70
      },
      {
        id: 'goal-3-3',
        goal: 'Enhance anticipation and interception skills',
        actions: [
          'Study opponent attacking patterns through video analysis',
          'Practice reading body language of attackers',
          'Work on positioning to cut off passing lanes',
          'Track interception statistics in matches'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false,
        progress: 40
      }
    ],
    coachNotes: 'James is showing great maturity and leadership potential. His communication on the pitch has improved significantly.',
    linkedReportCardId: 'r2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7'
  },
  {
    id: 'devplan-4',
    playerId: 'p23c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e', // Sophie Williams
    createdBy: 'c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f',
    createdAt: new Date('2024-12-01'),
    period: {
      start: new Date('2024-12-01'),
      end: new Date('2025-02-28')
    },
    status: 'active',
    title: 'Elite Midfielder Development - Q1 2025',
    description: 'Transition Sophie from good to elite by improving tactical awareness, set-piece delivery, and decision-making under pressure.',
    goals: [
      {
        id: 'goal-4-1',
        goal: 'Master set-piece delivery - corners and free kicks',
        actions: [
          'Daily set-piece practice with goalkeeper',
          'Study professional set-piece specialists',
          'Work on different delivery types (inswing, outswing, driven)',
          'Practice under match-like pressure conditions'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-01-31'),
        completed: true,
        completedDate: new Date('2025-01-25'),
        progress: 100
      },
      {
        id: 'goal-4-2',
        goal: 'Improve tactical awareness and positioning',
        actions: [
          'Study game footage to understand space and positioning',
          'Work with coach on reading the game',
          'Practice transitional positioning drills',
          'Learn to dictate tempo of the game'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false,
        progress: 55
      },
      {
        id: 'goal-4-3',
        goal: 'Develop press-resistant skills',
        actions: [
          'Practice receiving under pressure in tight spaces',
          'Work on body positioning to protect the ball',
          'Improve first-touch in congested areas',
          'Study players like Modric and Iniesta'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false,
        progress: 65
      },
      {
        id: 'goal-4-4',
        goal: 'Increase goal contributions from midfield',
        actions: [
          'Practice late runs into the box',
          'Work on shooting from outside the penalty area',
          'Study timing of forward runs',
          'Target: 5 goals and 8 assists by end of period'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false,
        progress: 30
      }
    ],
    coachNotes: 'Sophie\'s set-piece delivery has become exceptional - her corners are now a genuine weapon. Continue to focus on tactical development.',
    linkedReportCardId: 'r3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8'
  },
  {
    id: 'devplan-5',
    playerId: 'p24d6e7f-8a9b-0c1d-2e3f-4a5b6c7d8e9f', // Liam Thompson
    createdBy: 'c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f',
    createdAt: new Date('2024-12-01'),
    period: {
      start: new Date('2024-12-01'),
      end: new Date('2025-02-28')
    },
    status: 'active',
    title: 'Advanced Goalkeeper Training - Q1 2025',
    description: 'Develop Liam\'s shot-stopping, distribution, and command of the penalty area to reach the next level.',
    goals: [
      {
        id: 'goal-5-1',
        goal: 'Improve one-on-one situation success rate',
        actions: [
          'Daily one-on-one drills with strikers',
          'Study positioning and timing of elite keepers',
          'Work on making yourself big and narrowing angles',
          'Practice quick decision-making (stay or come out)'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false,
        progress: 45
      },
      {
        id: 'goal-5-2',
        goal: 'Master distribution - both feet and throwing',
        actions: [
          'Practice kicking with both feet daily',
          'Work on accuracy of throws to start counter-attacks',
          'Study modern keepers\' distribution patterns',
          'Improve decision-making on distribution type'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false,
        progress: 55
      },
      {
        id: 'goal-5-3',
        goal: 'Enhance command of penalty area on crosses',
        actions: [
          'Practice catching crosses under pressure',
          'Work on timing of coming for crosses',
          'Improve communication with defenders',
          'Build confidence in claiming aerial balls'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-01-31'),
        completed: false,
        progress: 60
      }
    ],
    coachNotes: 'Liam is making steady progress. His distribution has improved notably. Need to build more confidence in coming for crosses.',
    linkedReportCardId: 'r4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9'
  }
];

/**
 * Get all development plans for a specific player
 */
export const getDevelopmentPlansByPlayerId = (playerId: string): DevelopmentPlan[] => {
  return sampleDevelopmentPlans
    .filter(plan => plan.playerId === playerId)
    .sort((a, b) => {
      // Active plans first, then by created date (most recent first)
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
};

/**
 * Get a specific development plan by ID
 */
export const getDevelopmentPlanById = (planId: string): DevelopmentPlan | undefined => {
  return sampleDevelopmentPlans.find(plan => plan.id === planId);
};

/**
 * Get all active development plans for a player
 */
export const getActiveDevelopmentPlans = (playerId: string): DevelopmentPlan[] => {
  return sampleDevelopmentPlans
    .filter(plan => plan.playerId === playerId && plan.status === 'active')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Import players data to filter by club/age group/team
import { samplePlayers } from './players';

/**
 * Get all development plans for a specific club
 */
export const getDevelopmentPlansByClubId = (clubId: string): DevelopmentPlan[] => {
  const clubPlayerIds = samplePlayers
    .filter(player => player.clubId === clubId)
    .map(player => player.id);
  
  return sampleDevelopmentPlans
    .filter(plan => clubPlayerIds.includes(plan.playerId))
    .sort((a, b) => {
      // Active plans first, then by created date (most recent first)
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
};

/**
 * Get all development plans for a specific age group
 */
export const getDevelopmentPlansByAgeGroupId = (clubId: string, ageGroupId: string): DevelopmentPlan[] => {
  const ageGroupPlayerIds = samplePlayers
    .filter(player => 
      player.clubId === clubId && 
      player.ageGroupIds.includes(ageGroupId)
    )
    .map(player => player.id);
  
  return sampleDevelopmentPlans
    .filter(plan => ageGroupPlayerIds.includes(plan.playerId))
    .sort((a, b) => {
      // Active plans first, then by created date (most recent first)
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
};

/**
 * Get all development plans for a specific team
 */
export const getDevelopmentPlansByTeamId = (clubId: string, ageGroupId: string, teamId: string): DevelopmentPlan[] => {
  const teamPlayerIds = samplePlayers
    .filter(player => 
      player.clubId === clubId && 
      player.ageGroupIds.includes(ageGroupId) &&
      player.teamIds.includes(teamId)
    )
    .map(player => player.id);
  
  return sampleDevelopmentPlans
    .filter(plan => teamPlayerIds.includes(plan.playerId))
    .sort((a, b) => {
      // Active plans first, then by created date (most recent first)
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
};
