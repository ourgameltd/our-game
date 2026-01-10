import { PlayerReport } from '../types/index';

export const sampleReports: PlayerReport[] = [
  {
    id: 'r1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c',
    period: {
      start: new Date('2024-09-01'),
      end: new Date('2024-11-30')
    },
    overallRating: 8.5,
    strengths: [
      'Excellent finishing ability with both feet',
      'Strong movement off the ball',
      'Good positioning in the box',
      'Effective at holding up play',
      'Confident on the ball under pressure'
    ],
    areasForImprovement: [
      'Aerial ability needs development',
      'Defensive contribution when team doesn\'t have the ball',
      'Decision making in final third could be quicker',
      'Physical conditioning - stamina in latter stages of games'
    ],
    developmentActions: [
      {
        id: 'dp-1-1',
        goal: 'Improve aerial duel success rate by 20%',
        actions: [
          'Additional heading practice sessions twice per week',
          'Study video analysis of aerial duels',
          'Work on timing of jumps and body positioning'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false
      },
      {
        id: 'dp-1-2',
        goal: 'Increase pressing actions per game',
        actions: [
          'Study video analysis of pressing systems',
          'Practice pressing drills in training',
          'Track pressing actions in matches'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false
      },
      {
        id: 'dp-1-3',
        goal: 'Complete individual conditioning program',
        actions: [
          'Follow personalized fitness plan with strength coach',
          'Weekly strength training sessions',
          'Monitor stamina levels in matches'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false
      },
      {
        id: 'dp-1-4',
        goal: 'Work on first-time finishing',
        actions: [
          'Practice shooting drills focusing on one-touch finishes',
          'Study professional strikers\' finishing techniques',
          'Apply in small-sided games'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-01-31'),
        completed: false
      }
    ],
    coachComments: 'Carlos has been exceptional this term with 12 goals in 10 games. His natural finishing ability is outstanding, and he\'s showing great maturity in his link-up play. The focus now should be on becoming a more complete forward by improving his aerial game and defensive work rate. If he can add these elements to his game, he has the potential to play at a higher level.',
    createdBy: 'c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f',
    createdAt: new Date('2024-12-01'),
    similarProfessionalPlayers: [
      {
        name: 'Gabriel Jesus',
        team: 'Arsenal',
        position: 'Striker',
        reason: 'Similar style of mobile striker who works well in combination play. Good model for pressing and defensive work rate.'
      },
      {
        name: 'Ollie Watkins',
        team: 'Aston Villa',
        position: 'Striker',
        reason: 'Excellent movement off the ball and finishing ability. Shows how a striker can contribute defensively while maintaining goal threat.'
      }
    ]
  },
  {
    id: 'r2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
    playerId: 'p22b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d',
    period: {
      start: new Date('2024-09-01'),
      end: new Date('2024-11-30')
    },
    overallRating: 8.0,
    strengths: [
      'Outstanding dribbling ability',
      'Creative in tight spaces',
      'Excellent vision and passing range',
      'Strong work ethic',
      'Good defensive contribution'
    ],
    areasForImprovement: [
      'End product - needs to increase goals and assists',
      'Can be too individualistic at times',
      'Decision making on when to pass vs. dribble',
      'Physical strength to hold off defenders'
    ],
    developmentActions: [
      {
        id: 'dp-2-1',
        goal: 'Increase goal contributions to 1 per game',
        actions: [
          'Finish training sessions with shooting drills',
          'Practice finishing in various scenarios',
          'Review match footage to identify missed opportunities'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false
      },
      {
        id: 'dp-2-2',
        goal: 'Improve team play in final third',
        actions: [
          'Video analysis of when to pass vs. dribble',
          'Practice combination play drills',
          'Study professional wingers\' decision making'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false
      },
      {
        id: 'dp-2-3',
        goal: 'Develop physical strength',
        actions: [
          'Strength and conditioning program',
          'Core stability exercises',
          'Upper body strength training'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-03-31'),
        completed: false
      },
      {
        id: 'dp-2-4',
        goal: 'Better shot selection',
        actions: [
          'Analyze shooting statistics from matches',
          'Practice identifying high percentage shooting opportunities',
          'Work on technique for different shooting scenarios'
        ],
        startDate: new Date('2024-12-08'),
        targetDate: new Date('2025-01-31'),
        completed: false
      }
    ],
    coachComments: 'Jake is a joy to watch with the ball at his feet. His technical ability is among the best in the league. The challenge now is to turn those dribbles and chances created into tangible goals and assists. He needs to understand when to beat his man and when to play the simple pass. With better decision making, he can be a match-winner.',
    createdBy: 'c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f',
    createdAt: new Date('2024-12-01'),
    similarProfessionalPlayers: [
      {
        name: 'Phil Foden',
        team: 'Manchester City',
        position: 'Winger/Attacking Midfielder',
        reason: 'Similar technical ability and dribbling style. Good example of combining individual skill with team play and end product.'
      },
      {
        name: 'Cole Palmer',
        team: 'Chelsea',
        position: 'Winger/Attacking Midfielder',
        reason: 'Shows excellent decision making and has developed into a prolific goal scorer while maintaining creative abilities.'
      }
    ]
  },
  {
    id: 'report-3',
    playerId: 'player-9',
    period: {
      start: new Date('2024-09-01'),
      end: new Date('2024-11-30')
    },
    overallRating: 7.5,
    strengths: [
      'Excellent ball control for his age',
      'Brave on the ball',
      'Good spatial awareness',
      'Positive attitude and coachability',
      'Improving passing accuracy'
    ],
    areasForImprovement: [
      'Use of weaker foot',
      'Speed of decision making',
      'Physical development',
      'Positioning without the ball'
    ],
    developmentActions: [
      {
        id: 'dp-3-1',
        goal: 'Use left foot in games regularly',
        actions: [
          'Left foot only drills in warm-ups',
          'Practice passing and shooting with left foot',
          'Challenge to use left foot 5+ times per game'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-03-31'),
        completed: false
      },
      {
        id: 'dp-3-2',
        goal: 'Improve reaction time in small-sided games',
        actions: [
          'Play more small-sided games',
          'Quick decision making drills',
          'React to visual and audio cues'
        ],
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-02-28'),
        completed: false
      },
      {
        id: 'dp-3-3',
        goal: 'Build confidence in defensive positions',
        actions: [
          'Practice positional awareness exercises',
          'Study where to be without the ball',
          'Review match footage with coach'
        ],
        startDate: new Date('2024-12-05'),
        targetDate: new Date('2025-03-31'),
        completed: false
      },
      {
        id: 'dp-3-4',
        goal: 'Continue technical development',
        actions: [
          'Individual ball mastery homework',
          'Daily practice routine (15 minutes)',
          'Attend additional skills sessions'
        ],
        startDate: new Date('2024-11-15'),
        targetDate: new Date('2025-03-31'),
        completed: true,
        completedDate: new Date('2024-12-01')
      }
    ],
    coachComments: 'Ethan has made excellent progress this term. His technical ability is very good for his age group, and he\'s starting to understand the game better. He\'s a pleasure to coach due to his attitude and willingness to learn. Focus on developing both feet and game understanding will help him continue to improve.',
    createdBy: 'staff-3',
    createdAt: new Date('2024-12-01'),
    similarProfessionalPlayers: [
      {
        name: 'Bukayo Saka',
        team: 'Arsenal',
        position: 'Winger',
        reason: 'Good example of a technically gifted young player who developed through consistent work on fundamentals and both feet.'
      }
    ]
  },
  {
    id: 'report-4',
    playerId: 'player-14',
    period: {
      start: new Date('2024-09-01'),
      end: new Date('2024-11-30')
    },
    overallRating: 7.8,
    strengths: [
      'Natural leadership qualities',
      'Strong in the tackle',
      'Good reading of the game',
      'Vocal and organizes teammates',
      'Competitive mentality'
    ],
    areasForImprovement: [
      'Distribution under pressure',
      'Speed of play',
      'Technical ability with ball',
      'Composure in possession'
    ],
    developmentActions: [
      {
        id: 'dp-4-1',
        goal: 'Improve passing accuracy to 80%+',
        actions: [
          'Extra passing and control sessions',
          'Practice under pressure scenarios',
          'Track passing stats in matches'
        ],
        startDate: new Date('2024-12-02'),
        targetDate: new Date('2025-03-31'),
        completed: false
      },
      {
        id: 'dp-4-2',
        goal: 'Develop comfort on the ball',
        actions: [
          'Rondos and possession drills',
          'Practice receiving under pressure',
          'Build confidence through small-sided games'
        ],
        startDate: new Date('2024-12-02'),
        targetDate: new Date('2025-02-28'),
        completed: false
      },
      {
        id: 'dp-4-3',
        goal: 'Enhance decision making speed',
        actions: [
          'Quick thinking drills',
          'Practice scanning before receiving',
          'Video analysis of modern defenders'
        ],
        startDate: new Date('2024-12-02'),
        targetDate: new Date('2025-03-31'),
        completed: false
      },
      {
        id: 'dp-4-4',
        goal: 'Continue leadership development',
        actions: [
          'Captain\'s responsibilities in matches',
          'Study great captains and leaders',
          'Mentor younger players'
        ],
        startDate: new Date('2024-11-01'),
        targetDate: new Date('2025-03-31'),
        completed: false
      }
    ],
    coachComments: 'Oliver is a natural leader and his defensive instincts are excellent. He reads the game well and is brave in the tackle. To progress to the next level, he needs to become more comfortable on the ball and improve his distribution. Modern defenders need to be able to play out from the back, and this is an area we\'re working on with him.',
    createdBy: 'staff-2',
    createdAt: new Date('2024-12-02'),
    similarProfessionalPlayers: [
      {
        name: 'John Stones',
        team: 'Manchester City',
        position: 'Centre Back',
        reason: 'Shows how a defender can be strong defensively while being comfortable on the ball and contributing to team play.'
      }
    ]
  },
  // Previous report for Carlos Silva - to show history
  {
    id: 'r5-previous',
    playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c', // Carlos Silva
    period: {
      start: new Date('2024-06-01'),
      end: new Date('2024-08-31')
    },
    overallRating: 8.2,
    strengths: [
      'Natural goal scorer with good instincts',
      'Quick in the box',
      'Good with both feet',
      'Positive attitude and work ethic'
    ],
    areasForImprovement: [
      'Heading ability',
      'Defensive work rate',
      'Physical strength',
      'Consistency across full 90 minutes'
    ],
    developmentActions: [
      {
        id: 'dp-5-1',
        goal: 'Improve shooting technique',
        actions: [
          'Extra shooting practice after training',
          'Work on body positioning when striking the ball',
          'Practice different types of finishes'
        ],
        startDate: new Date('2024-06-01'),
        targetDate: new Date('2024-08-31'),
        completed: true,
        completedDate: new Date('2024-08-25')
      },
      {
        id: 'dp-5-2',
        goal: 'Build physical strength',
        actions: [
          'Start gym program with strength coach',
          'Core stability exercises',
          'Weekly strength assessments'
        ],
        startDate: new Date('2024-06-15'),
        targetDate: new Date('2024-09-30'),
        completed: true,
        completedDate: new Date('2024-09-15')
      },
      {
        id: 'dp-5-3',
        goal: 'Improve movement off the ball',
        actions: [
          'Study video of professional strikers',
          'Practice runs in behind defense',
          'Work on timing of runs'
        ],
        startDate: new Date('2024-07-01'),
        targetDate: new Date('2024-08-31'),
        completed: true,
        completedDate: new Date('2024-08-30')
      }
    ],
    coachComments: 'Carlos had an excellent pre-season. His finishing improved significantly through dedicated practice. He scored 8 goals in 6 pre-season friendlies. The strength work is paying off and he\'s holding the ball up much better. Very pleased with his progress and attitude.',
    createdBy: 'c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f',
    createdAt: new Date('2024-09-01'),
    similarProfessionalPlayers: [
      {
        name: 'Gabriel Jesus',
        team: 'Arsenal',
        position: 'Striker',
        reason: 'Mobile striker who shows great movement and finishing. Good role model for development.'
      }
    ]
  }
];

export const getReportsByPlayerId = (playerId: string): PlayerReport[] => {
  return sampleReports.filter(report => report.playerId === playerId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getLatestReportForPlayer = (playerId: string): PlayerReport | undefined => {
  const reports = getReportsByPlayerId(playerId);
  return reports.length > 0 ? reports[0] : undefined;
};

// Import players data to filter by club/age group/team
import { samplePlayers } from './players';

export const getReportsByClubId = (clubId: string): PlayerReport[] => {
  const clubPlayerIds = samplePlayers
    .filter(player => player.clubId === clubId)
    .map(player => player.id);
  
  return sampleReports
    .filter(report => clubPlayerIds.includes(report.playerId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getReportsByAgeGroupId = (clubId: string, ageGroupId: string): PlayerReport[] => {
  const ageGroupPlayerIds = samplePlayers
    .filter(player => 
      player.clubId === clubId && 
      player.ageGroupIds.includes(ageGroupId)
    )
    .map(player => player.id);
  
  return sampleReports
    .filter(report => ageGroupPlayerIds.includes(report.playerId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getReportsByTeamId = (clubId: string, ageGroupId: string, teamId: string): PlayerReport[] => {
  const teamPlayerIds = samplePlayers
    .filter(player => 
      player.clubId === clubId && 
      player.ageGroupIds.includes(ageGroupId) &&
      player.teamIds.includes(teamId)
    )
    .map(player => player.id);
  
  return sampleReports
    .filter(report => teamPlayerIds.includes(report.playerId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

