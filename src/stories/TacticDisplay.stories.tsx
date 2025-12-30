import type { Meta, StoryObj } from '@storybook/react';
import TacticDisplay from '@/components/tactics/TacticDisplay';
import { 
  tactic442, 
  tactic433, 
  tactic7aside, 
  tactic5aside, 
  tactic433Inherited,
  resolvePositions 
} from '@/data/tactics';
import { useState } from 'react';

const meta = {
  title: 'Components/Tactics/TacticDisplay',
  component: TacticDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TacticDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic 4-4-2 tactic
export const Basic442: Story = {
  args: {
    tactic: tactic442,
    resolvedPositions: resolvePositions(tactic442),
    showRelationships: true,
    showDirections: true,
    showInheritance: false,
  },
};

// 4-3-3 attacking tactic
export const Attacking433: Story = {
  args: {
    tactic: tactic433,
    resolvedPositions: resolvePositions(tactic433),
    showRelationships: true,
    showDirections: true,
    showInheritance: false,
  },
};

// 7-a-side tactic
export const SevenASide: Story = {
  args: {
    tactic: tactic7aside,
    resolvedPositions: resolvePositions(tactic7aside),
    showRelationships: true,
    showDirections: true,
    showInheritance: false,
  },
};

// 5-a-side tactic
export const FiveASide: Story = {
  args: {
    tactic: tactic5aside,
    resolvedPositions: resolvePositions(tactic5aside),
    showRelationships: true,
    showDirections: true,
    showInheritance: false,
  },
};

// Without relationships
export const WithoutRelationships: Story = {
  args: {
    tactic: tactic442,
    resolvedPositions: resolvePositions(tactic442),
    showRelationships: false,
    showDirections: true,
    showInheritance: false,
  },
};

// Without directions
export const WithoutDirections: Story = {
  args: {
    tactic: tactic442,
    resolvedPositions: resolvePositions(tactic442),
    showRelationships: true,
    showDirections: false,
    showInheritance: false,
  },
};

// With inheritance indicators
export const WithInheritance: Story = {
  args: {
    tactic: tactic433Inherited,
    resolvedPositions: resolvePositions(tactic433Inherited, tactic442),
    showRelationships: true,
    showDirections: true,
    showInheritance: true,
  },
};

// Interactive with selection
const InteractiveTemplate = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);

  return (
    <TacticDisplay
      tactic={tactic442}
      resolvedPositions={resolvePositions(tactic442)}
      showRelationships={true}
      showDirections={true}
      showInheritance={false}
      onPositionClick={(index) => {
        setSelectedIndex(index === selectedIndex ? undefined : index);
      }}
      selectedPositionIndex={selectedIndex}
    />
  );
};

export const Interactive: Story = {
  render: () => <InteractiveTemplate />,
  args: {
    tactic: tactic442,
    resolvedPositions: resolvePositions(tactic442),
  },
};

// All features enabled
export const AllFeatures: Story = {
  args: {
    tactic: tactic433,
    resolvedPositions: resolvePositions(tactic433),
    showRelationships: true,
    showDirections: true,
    showInheritance: false,
  },
};
