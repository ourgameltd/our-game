import type { Meta, StoryObj } from '@storybook/react';
import TacticDisplay from '@/components/tactics/TacticDisplay';
import { 
  sampleTactics, 
  getResolvedPositions
} from '@/data/tactics';
import { useState } from 'react';

// Get sample tactics for stories
const highPressTactic = sampleTactics[0]; // High Press 4-4-2
const bluesHighPress = sampleTactics[1]; // 2015 Blues High Press (inherited)
const compactTactic = sampleTactics[2]; // Compact 4-2-3-1

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

// Basic High Press 4-4-2 tactic
export const HighPress442: Story = {
  args: {
    tactic: highPressTactic,
    resolvedPositions: getResolvedPositions(highPressTactic),
    showDirections: true,
    showInheritance: false,
  },
};

// Compact 4-2-3-1 defensive tactic
export const Compact4231: Story = {
  args: {
    tactic: compactTactic,
    resolvedPositions: getResolvedPositions(compactTactic),
    showDirections: true,
    showInheritance: false,
  },
};

// Without directions
export const WithoutDirections: Story = {
  args: {
    tactic: highPressTactic,
    resolvedPositions: getResolvedPositions(highPressTactic),
    showDirections: false,
    showInheritance: false,
  },
};

// With inheritance indicators (team tactic inheriting from club tactic)
export const WithInheritance: Story = {
  args: {
    tactic: bluesHighPress,
    resolvedPositions: getResolvedPositions(bluesHighPress),
    showDirections: true,
    showInheritance: true,
  },
};

// Interactive with selection
const InteractiveTemplate = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);

  return (
    <TacticDisplay
      tactic={highPressTactic}
      resolvedPositions={getResolvedPositions(highPressTactic)}
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
    tactic: highPressTactic,
    resolvedPositions: getResolvedPositions(highPressTactic),
  },
};

// All features enabled
export const AllFeatures: Story = {
  args: {
    tactic: compactTactic,
    resolvedPositions: getResolvedPositions(compactTactic),
    showDirections: true,
    showInheritance: false,
  },
};
