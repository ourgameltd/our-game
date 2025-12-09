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
        ballControl: 70, crossing: 60, curve: 65, dribbling: 80, finishing: 80,
        freeKick: 60, heading: 65, longPassing: 60, longShot: 70, penalties: 75,
        shortPassing: 70, shotPower: 75, slidingTackle: 45, standingTackle: 50, volleys: 70,
        acceleration: 75, agility: 78, balance: 76, jumping: 65, pace: 76,
        reactions: 72, sprintSpeed: 75, stamina: 70, strength: 55,
        aggression: 50, attackingPosition: 80, awareness: 70, composure: 68,
        interceptions: 45, marking: 48, positioning: 78, vision: 72
      },
      overallRating: 70,
      evaluations: [],
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
        ballControl: 88, crossing: 75, curve: 80, dribbling: 85, finishing: 90,
        freeKick: 78, heading: 82, longPassing: 80, longShot: 88, penalties: 85,
        shortPassing: 90, shotPower: 86, slidingTackle: 65, standingTackle: 68, volleys: 84,
        acceleration: 82, agility: 84, balance: 83, jumping: 78, pace: 82,
        reactions: 88, sprintSpeed: 81, stamina: 85, strength: 75,
        aggression: 70, attackingPosition: 92, awareness: 88, composure: 86,
        interceptions: 65, marking: 68, positioning: 90, vision: 88
      },
      overallRating: 85,
      evaluations: [],
      teamIds: ['team-5'],
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
        ballControl: 55, crossing: 45, curve: 50, dribbling: 50, finishing: 40,
        freeKick: 45, heading: 52, longPassing: 68, longShot: 48, penalties: 60,
        shortPassing: 72, shotPower: 50, slidingTackle: 48, standingTackle: 50, volleys: 45,
        acceleration: 65, agility: 75, balance: 70, jumping: 72, pace: 64,
        reactions: 82, sprintSpeed: 63, stamina: 70, strength: 58,
        aggression: 55, attackingPosition: 40, awareness: 78, composure: 75,
        interceptions: 52, marking: 50, positioning: 85, vision: 65
      },
      overallRating: 68,
      evaluations: [],
      teamIds: ['team-1'],
    },
  },
};
