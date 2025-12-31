import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import TacticPitchEditor from '../components/tactics/TacticPitchEditor';
import PositionRolePanel from '../components/tactics/PositionRolePanel';
import ResetOverridesModal from '../components/tactics/ResetOverridesModal';
import { Formation, Tactic, TacticalPositionOverride } from '@/types';

const meta: Meta<typeof TacticPitchEditor> = {
  title: 'Components/Tactics/TacticPitchEditor',
  component: TacticPitchEditor,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TacticPitchEditor>;

// Sample formation (4-3-3)
const sampleFormation: Formation = {
  id: 'formation-433',
  name: '4-3-3 Attack',
  system: '4-3-3',
  squadSize: 11,
  positions: [
    { position: 'GK', x: 50, y: 10 },
    { position: 'LB', x: 20, y: 30 },
    { position: 'CB', x: 40, y: 25 },
    { position: 'CB', x: 60, y: 25 },
    { position: 'RB', x: 80, y: 30 },
    { position: 'CDM', x: 50, y: 45 },
    { position: 'CM', x: 35, y: 55 },
    { position: 'CM', x: 65, y: 55 },
    { position: 'LW', x: 20, y: 75 },
    { position: 'ST', x: 50, y: 85 },
    { position: 'RW', x: 80, y: 75 },
  ],
  description: 'Attacking formation with wide wingers',
};

// Sample tactic with overrides
const sampleTactic: Tactic = {
  id: 'tactic-433-high-press',
  name: '4-3-3 High Press',
  parentFormationId: 'formation-433',
  squadSize: 11,
  summary: 'High pressing variant with advanced fullbacks',
  scope: {
    type: 'club',
    clubId: 'club-1',
  },
  positionOverrides: {
    1: { // LB
      y: 40,
      direction: 'NE',
    },
    4: { // RB
      y: 40,
      direction: 'NW',
    },
    5: { // CDM
      direction: 'S',
    },
  },
  principles: [
    {
      id: 'principle-1',
      title: 'High Press',
      description: 'Press high up the pitch to win the ball back quickly',
      positionIndices: [8, 9, 10],
    },
  ],
  createdBy: 'coach-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// Interactive Story
export const Interactive: Story = {
  render: () => {
    const [tactic, setTactic] = useState<Tactic>(sampleTactic);
    const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [showResetModal, setShowResetModal] = useState(false);

    const handlePositionChange = (index: number, override: Partial<TacticalPositionOverride>) => {
      setTactic((prev) => {
        const existingOverride = prev.positionOverrides[index];
        
        return {
          ...prev,
          positionOverrides: {
            ...prev.positionOverrides,
            [index]: existingOverride 
              ? { ...existingOverride, ...override }
              : override,
          },
        };
      });
    };

    const handleResetField = (field: 'direction' | 'x' | 'y') => {
      if (selectedPosition === null) return;

      setTactic((prev) => {
        const existingOverride = prev.positionOverrides[selectedPosition];
        if (!existingOverride) return prev;

        const { [field]: _, ...restOverride } = existingOverride;
        
        // If no fields left, remove the override entirely
        const hasRemainingFields = Object.keys(restOverride).length > 0;
        
        if (hasRemainingFields) {
          return {
            ...prev,
            positionOverrides: {
              ...prev.positionOverrides,
              [selectedPosition]: restOverride as TacticalPositionOverride,
            },
          };
        } else {
          const { [selectedPosition]: _removed, ...rest } = prev.positionOverrides;
          return {
            ...prev,
            positionOverrides: rest,
          };
        }
      });
    };

    const handleResetAllOverrides = () => {
      setTactic((prev) => ({
        ...prev,
        positionOverrides: {},
      }));
    };

    const selectedOverride = selectedPosition !== null ? tactic.positionOverrides[selectedPosition] : undefined;
    const selectedParentData = selectedPosition !== null ? {
      direction: undefined,
    } : { direction: undefined };

    return (
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Snap to grid</span>
          </label>
          <button
            onClick={() => setShowResetModal(true)}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Reset All Overrides
          </button>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pitch Editor */}
          <div className="lg:col-span-2">
            <TacticPitchEditor
              tactic={tactic}
              parentFormation={sampleFormation}
              onPositionChange={handlePositionChange}
              snapToGrid={snapToGrid}
              gridSize={5}
              onPositionSelect={setSelectedPosition}
              selectedPositionIndex={selectedPosition}
            />
          </div>

          {/* Side panels */}
          <div className="space-y-4">
            {/* Position Role Panel */}
            {selectedPosition !== null && (
              <PositionRolePanel
                positionIndex={selectedPosition}
                position={sampleFormation.positions[selectedPosition].position}
                override={selectedOverride}
                parentData={selectedParentData}
                onUpdate={(override) => handlePositionChange(selectedPosition, override)}
                onResetField={handleResetField}
              />
            )}
          </div>
        </div>

        {/* Reset Modal */}
        <ResetOverridesModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={handleResetAllOverrides}
          overrides={tactic.positionOverrides}
          positions={sampleFormation.positions.map((p) => p.position)}
        />
      </div>
    );
  },
};

// Basic story with minimal props
export const Basic: Story = {
  args: {
    tactic: sampleTactic,
    parentFormation: sampleFormation,
    onPositionChange: () => {},
  },
};

// Without snap to grid
export const FreePositioning: Story = {
  args: {
    tactic: sampleTactic,
    parentFormation: sampleFormation,
    onPositionChange: () => {},
    snapToGrid: false,
  },
};

// Large grid size
export const LargeGridSize: Story = {
  args: {
    tactic: sampleTactic,
    parentFormation: sampleFormation,
    onPositionChange: () => {},
    snapToGrid: true,
    gridSize: 10,
  },
};
