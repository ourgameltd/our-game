import type { Meta, StoryObj } from '@storybook/react';
import PlayerCard from '../components/player/PlayerCard';

const meta: Meta<typeof PlayerCard> = {
  title: 'Components/Player/PlayerCard',
  component: PlayerCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PlayerCard>;

export const Youth: Story = {
  args: {
    player: {
      id: 'player-1',
      clubId: 'club-1',
      firstName: 'Oliver',
      lastName: 'Smith',
      dateOfBirth: new Date('2016-05-12'),
      preferredPositions: ['CF', 'ST'],
      attributes: {
        ballControl: 70, crossing: 60, weakFoot: 89, defensivePositioning: 45, dribbling: 80, finishing: 80,
        freeKick: 60, heading: 65, longPassing: 60, longShot: 70, penalties: 75,
        shortPassing: 70, shotPower: 75, slidingTackle: 45, standingTackle: 50, volleys: 70,
        acceleration: 75, agility: 78, balance: 76, jumping: 65, pace: 76,
        reactions: 72, sprintSpeed: 75, stamina: 70, strength: 55,
        aggression: 50, attackingPosition: 80, awareness: 70, composure: 68,
        interceptions: 45, marking: 48, positioning: 78, vision: 72, positivity: 85, communication: 80
      },
      overallRating: 70,
      evaluations: [],
      ageGroupIds: ['age-group-1'],
      teamIds: ['team-1'],
    },
  },
};

export const Adult: Story = {
  args: {
    player: {
      id: 'player-21',
      clubId: 'club-1',
      firstName: 'Sarah',
      lastName: 'Martinez',
      dateOfBirth: new Date('1996-12-11'),
      preferredPositions: ['ST', 'CF'],
      attributes: {
        ballControl: 88, crossing: 75, weakFoot: 80, defensivePositioning: 70, dribbling: 85, finishing: 90,
        freeKick: 78, heading: 82, longPassing: 80, longShot: 88, penalties: 85,
        shortPassing: 90, shotPower: 86, slidingTackle: 65, standingTackle: 68, volleys: 84,
        acceleration: 82, agility: 84, balance: 83, jumping: 78, pace: 82,
        reactions: 88, sprintSpeed: 81, stamina: 85, strength: 75,
        aggression: 55, attackingPosition: 40, awareness: 78, composure: 75,
        interceptions: 52, marking: 50, positioning: 85, vision: 65, positivity: 80, communication: 78
      },
      overallRating: 68,
      evaluations: [],
      ageGroupIds: ['age-group-1'],
      teamIds: ['team-1'],
    },
  },
};

export const Goalkeeper: Story = {
  args: {
    player: {
      id: 'player-8',
      clubId: 'club-1',
      firstName: 'Isabella',
      lastName: 'Davis',
      dateOfBirth: new Date('2016-12-03'),
      preferredPositions: ['GK'],
      attributes: {
        ballControl: 55, crossing: 45, weakFoot: 50, defensivePositioning: 60, dribbling: 50, finishing: 40,
        freeKick: 45, heading: 52, longPassing: 68, longShot: 48, penalties: 60,
        shortPassing: 72, shotPower: 50, slidingTackle: 48, standingTackle: 50, volleys: 45,
        acceleration: 65, agility: 75, balance: 70, jumping: 72, pace: 64,
        reactions: 82, sprintSpeed: 63, stamina: 70, strength: 58,
        aggression: 30, attackingPosition: 35, awareness: 55, composure: 50,
        interceptions: 68, marking: 70, positioning: 60, vision: 55, positivity: 75, communication: 72
      },
      overallRating: 62,
      evaluations: [],
      ageGroupIds: ['age-group-5'],
      teamIds: ['team-5'],
    },
  },
};
