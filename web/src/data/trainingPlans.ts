import { TrainingPlan } from '../types/index';

export const sampleTrainingPlans: TrainingPlan[] = [
  {
    id: 'tp1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
    playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c',
    createdBy: 'c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f',
    createdAt: new Date('2024-12-01'),
    period: {
      start: new Date('2024-12-01'),
      end: new Date('2025-02-28')
    },
    status: 'active',
    objectives: [
      {
        id: 'obj1a2b3-c4d5-e6f7-a8b9-c0d1e2f3a4b5',
        title: 'Improve Aerial Ability',
        description: 'Increase heading accuracy and success rate in aerial duels. Target: 60% aerial duel success rate in matches.',
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        status: 'in-progress',
        progress: 25,
        completed: false
      },
      {
        id: 'obj2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
        title: 'Enhance Defensive Work Rate',
        description: 'Increase pressing actions and defensive contributions. Target: 10+ pressing actions per game.',
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        status: 'in-progress',
        progress: 40,
        completed: false
      },
      {
        id: 'obj3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
        title: 'Physical Conditioning',
        description: 'Complete strength and stamina program to maintain performance in final 15 minutes of games.',
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        status: 'in-progress',
        progress: 50,
        completed: false
      },
      {
        id: 'obj4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8',
        title: 'First-Time Finishing',
        description: 'Develop ability to finish chances with first touch. Practice in training to translate to matches.',
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-01-31'),
        status: 'in-progress',
        progress: 60,
        completed: false
      }
    ],
    sessions: [
      {
        id: 'ps1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
        title: 'Heading Practice & Finishing',
        date: new Date('2024-12-09T18:00:00'),
        drillIds: ['d4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9'],
        focusAreas: ['Heading', 'Finishing', 'Positioning'],
        completed: false,
        notes: 'Focus on timing of jumps and direction of headers'
      },
      {
        id: 'ps2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        title: 'Pressing & Defensive Movement',
        date: new Date('2024-12-12T18:00:00'),
        drillIds: ['d5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0'],
        focusAreas: ['Pressing', 'Defensive Shape', 'Work Rate'],
        completed: false,
        notes: 'Work on when to press and how to recover defensively'
      },
      {
        id: 'ps3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        title: 'Strength & Conditioning',
        date: new Date('2024-12-14T09:00:00'),
        drillIds: [],
        focusAreas: ['Strength', 'Stamina', 'Core Stability'],
        completed: false,
        notes: 'Gym session with strength coach - focus on legs and core'
      },
      {
        id: 'ps4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
        title: 'First-Time Finishing Drills',
        date: new Date('2024-12-16T18:00:00'),
        drillIds: ['d4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9'],
        focusAreas: ['Finishing', 'Touch', 'Reaction Speed'],
        completed: false,
        notes: 'Various crossing scenarios - practice finishing without controlling first'
      }
    ],
    progressNotes: [
      {
        date: new Date('2024-12-05'),
        note: 'Carlos showing good commitment to extra training. Attended first heading session and demonstrated willingness to work on weaknesses.',
        addedBy: 'c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f'
      },
      {
        date: new Date('2024-12-06'),
        note: 'Gym session completed. Good effort on leg strengthening exercises. Will help with aerial duels and overall physicality.',
        addedBy: 'c4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b'
      }
    ]
  },
  {
    id: 'tp2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    playerId: 'player-22',
    createdBy: 'staff-1',
    createdAt: new Date('2024-12-01'),
    period: {
      start: new Date('2024-12-01'),
      end: new Date('2025-02-28')
    },
    status: 'active',
    objectives: [
      {
        id: 'obj-5',
        title: 'Increase Goal Contributions',
        description: 'Target 1 goal or assist per game. Focus on end product in final third.',
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        status: 'in-progress',
        progress: 35,
        completed: false
      },
      {
        id: 'obj-6',
        title: 'Improve Decision Making',
        description: 'Better recognition of when to dribble vs. when to pass. Use video analysis to improve.',
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-01-31'),
        status: 'in-progress',
        progress: 45,
        completed: false
      },
      {
        id: 'obj-7',
        title: 'Physical Development',
        description: 'Build upper body strength to hold off defenders better.',
        startDate: new Date('2024-12-05'),
        targetDate: new Date('2025-02-28'),
        status: 'in-progress',
        progress: 30,
        completed: false
      },
      {
        id: 'obj-8',
        title: 'Shot Selection',
        description: 'Improve quality of shots - when to shoot, when to create for others.',
        startDate: new Date('2024-11-20'),
        targetDate: new Date('2025-01-31'),
        status: 'completed',
        progress: 100,
        completed: true,
        completedDate: new Date('2024-12-08')
      }
    ],
    sessions: [
      {
        id: 'plan-session-5',
        title: 'Finishing & Shot Selection',
        date: new Date('2024-12-10T18:30:00'),
        drillIds: ['drill-4'],
        focusAreas: ['Finishing', 'Decision Making', 'Shooting'],
        completed: false,
        notes: 'Practice shooting from various angles and distances'
      },
      {
        id: 'plan-session-6',
        title: 'Video Analysis Session',
        date: new Date('2024-12-11T19:00:00'),
        drillIds: [],
        focusAreas: ['Tactical Awareness', 'Decision Making'],
        completed: false,
        notes: 'Review recent games - analyze decision making in final third'
      },
      {
        id: 'plan-session-7',
        title: 'Strength Training',
        date: new Date('2024-12-13T10:00:00'),
        drillIds: [],
        focusAreas: ['Upper Body Strength', 'Core Stability'],
        completed: false,
        notes: 'Focus on holding off defenders and maintaining balance'
      },
      {
        id: 'plan-session-8',
        title: 'Combination Play',
        date: new Date('2024-12-15T18:30:00'),
        drillIds: ['drill-3'],
        focusAreas: ['Passing', 'Movement', 'Timing'],
        completed: false,
        notes: 'Work on quick combinations and playing others in'
      }
    ],
    progressNotes: [
      {
        date: new Date('2024-12-03'),
        note: 'Jake eager to improve his output. Discussed importance of making right decisions at right times.',
        addedBy: 'staff-1'
      },
      {
        date: new Date('2024-12-07'),
        note: 'Good progress in training. Jake scored twice in small-sided games with improved decision making.',
        addedBy: 'staff-1'
      }
    ]
  },
  {
    id: 'plan-3',
    playerId: 'player-9',
    createdBy: 'staff-3',
    createdAt: new Date('2024-12-01'),
    period: {
      start: new Date('2024-12-01'),
      end: new Date('2025-03-31')
    },
    status: 'active',
    objectives: [
      {
        id: 'obj-9',
        title: 'Develop Left Foot',
        description: 'Use left foot confidently in games. Practice daily at home and in training.',
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-03-31'),
        status: 'in-progress',
        progress: 20,
        completed: false
      },
      {
        id: 'obj-10',
        title: 'Faster Decision Making',
        description: 'Improve reaction time and speed of thought in small-sided games.',
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        status: 'in-progress',
        progress: 30,
        completed: false
      },
      {
        id: 'obj-11',
        title: 'Positional Awareness',
        description: 'Better understanding of where to be when team doesn\'t have the ball.',
        startDate: new Date('2024-12-05'),
        targetDate: new Date('2025-03-31'),
        status: 'in-progress',
        progress: 25,
        completed: false
      },
      {
        id: 'obj-12',
        title: 'Technical Foundation',
        description: 'Continue building strong technical base through ball mastery.',
        startDate: new Date('2024-11-15'),
        targetDate: new Date('2025-03-31'),
        status: 'in-progress',
        progress: 55,
        completed: false
      }
    ],
    sessions: [
      {
        id: 'plan-session-9',
        title: 'Left Foot Focus',
        date: new Date('2024-12-10T17:00:00'),
        drillIds: ['drill-1', 'drill-2'],
        focusAreas: ['Weak Foot', 'Ball Control', 'Passing'],
        completed: false,
        notes: 'All drills to be performed with left foot only'
      },
      {
        id: 'plan-session-10',
        title: 'Small-Sided Games',
        date: new Date('2024-12-12T17:00:00'),
        drillIds: ['drill-3'],
        focusAreas: ['Decision Making', 'Speed of Play', 'Awareness'],
        completed: false,
        notes: 'Quick thinking games to improve reaction time'
      },
      {
        id: 'plan-session-11',
        title: 'Position Practice',
        date: new Date('2024-12-14T17:00:00'),
        drillIds: ['drill-5'],
        focusAreas: ['Positioning', 'Defensive Shape', 'Communication'],
        completed: false,
        notes: 'Understanding defensive responsibilities'
      }
    ],
    progressNotes: [
      {
        date: new Date('2024-12-04'),
        note: 'Ethan really trying hard with his left foot in training. Great attitude.',
        addedBy: 'staff-3'
      },
      {
        date: new Date('2024-12-06'),
        note: 'Parents very supportive. Ethan practicing at home daily with ball mastery exercises.',
        addedBy: 'staff-3'
      }
    ]
  },
  {
    id: 'plan-4',
    playerId: 'player-14',
    createdBy: 'staff-2',
    createdAt: new Date('2024-12-02'),
    period: {
      start: new Date('2024-12-02'),
      end: new Date('2025-03-31')
    },
    status: 'active',
    objectives: [
      {
        id: 'obj-13',
        title: 'Passing Accuracy',
        description: 'Improve passing success rate to 80%+ in matches. Focus on technique under pressure.',
        startDate: new Date('2024-12-02'),
        targetDate: new Date('2025-03-31'),
        status: 'in-progress',
        progress: 35,
        completed: false
      },
      {
        id: 'obj-14',
        title: 'Ball Comfort',
        description: 'Become more confident on the ball. Able to receive under pressure and turn.',
        startDate: new Date('2024-12-02'),
        targetDate: new Date('2025-02-28'),
        status: 'in-progress',
        progress: 40,
        completed: false
      },
      {
        id: 'obj-15',
        title: 'Speed of Play',
        description: 'Improve decision making speed. Play quicker, think faster.',
        startDate: new Date('2024-12-02'),
        targetDate: new Date('2025-03-31'),
        status: 'in-progress',
        progress: 30,
        completed: false
      },
      {
        id: 'obj-16',
        title: 'Leadership Skills',
        description: 'Continue developing as team captain. Vocal, organized, leads by example.',
        startDate: new Date('2024-11-01'),
        targetDate: new Date('2025-03-31'),
        status: 'in-progress',
        progress: 65,
        completed: false
      }
    ],
    sessions: [
      {
        id: 'plan-session-12',
        title: 'Passing Under Pressure',
        date: new Date('2024-12-11T18:00:00'),
        drillIds: ['drill-1'],
        focusAreas: ['Passing', 'First Touch', 'Composure'],
        completed: false,
        notes: 'Rondos with added pressure - focus on technique'
      },
      {
        id: 'plan-session-13',
        title: 'Possession Drills',
        date: new Date('2024-12-13T18:00:00'),
        drillIds: ['drill-3'],
        focusAreas: ['Ball Comfort', 'Decision Making', 'Movement'],
        completed: false,
        notes: 'Build confidence on the ball in tight spaces'
      },
      {
        id: 'plan-session-14',
        title: 'Video Analysis - Modern Defenders',
        date: new Date('2024-12-15T19:00:00'),
        drillIds: [],
        focusAreas: ['Tactical Understanding', 'Ball Playing'],
        completed: false,
        notes: 'Watch clips of John Stones, Virgil van Dijk playing out from back'
      }
    ],
    progressNotes: [
      {
        date: new Date('2024-12-04'),
        note: 'Oliver showing good progress. His passing was much better in last match. Captaincy really suits him.',
        addedBy: 'staff-2'
      }
    ]
  }
];

export const getTrainingPlansByPlayerId = (playerId: string): TrainingPlan[] => {
  return sampleTrainingPlans.filter(plan => plan.playerId === playerId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getActiveTrainingPlanForPlayer = (playerId: string): TrainingPlan | undefined => {
  return sampleTrainingPlans.find(plan => 
    plan.playerId === playerId && plan.status === 'active'
  );
};
