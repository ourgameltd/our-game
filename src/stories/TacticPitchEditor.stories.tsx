import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import TacticPitchEditor from '../components/tactics/TacticPitchEditor';
import PositionRolePanel from '../components/tactics/PositionRolePanel';
import RelationshipDrawer from '../components/tactics/RelationshipDrawer';
import ResetOverridesModal from '../components/tactics/ResetOverridesModal';
import { Formation, Tactic, TacticalPositionOverride, PlayerRelationship } from '@/types';

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
  description: 'High pressing variant with advanced fullbacks',
  overrides: [
    {
      positionIndex: 1, // LB
      y: 40,
      direction: 'attacking',
      role: 'Advanced fullback who **overlaps** the winger',
      keyResponsibilities: ['Support attacks', 'Overlap winger', 'Track back quickly'],
    },
    {
      positionIndex: 4, // RB
      y: 40,
      direction: 'attacking',
      role: 'Advanced fullback who provides width',
      keyResponsibilities: ['Provide width', 'Cross from deep', 'Cover center-backs'],
    },
    {
      positionIndex: 5, // CDM
      direction: 'defensive',
      role: 'Defensive shield',
      keyResponsibilities: ['Protect defense', 'Break up play', 'Distribute from deep'],
    },
  ],
  relationships: [
    {
      id: 'rel-1',
      fromPositionIndex: 1,
      toPositionIndex: 8,
      type: 'overlap',
      description: 'LB overlaps LW on attacking runs',
    },
    {
      id: 'rel-2',
      fromPositionIndex: 5,
      toPositionIndex: 2,
      type: 'cover',
      description: 'CDM drops to cover CB when fullbacks advance',
    },
  ],
  createdBy: 'coach-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  isGlobal: true,
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
        const existingOverrideIndex = prev.overrides.findIndex((o) => o.positionIndex === index);
        
        if (existingOverrideIndex >= 0) {
          // Update existing override
          const newOverrides = [...prev.overrides];
          newOverrides[existingOverrideIndex] = {
            ...newOverrides[existingOverrideIndex],
            ...override,
          };
          return { ...prev, overrides: newOverrides };
        } else {
          // Add new override
          return {
            ...prev,
            overrides: [...prev.overrides, { positionIndex: index, ...override }],
          };
        }
      });
    };

    const handleRelationshipAdd = (relationship: PlayerRelationship) => {
      setTactic((prev) => ({
        ...prev,
        relationships: [...prev.relationships, relationship],
      }));
    };

    const handleRelationshipUpdate = (relationship: PlayerRelationship, index: number) => {
      setTactic((prev) => {
        const newRelationships = [...prev.relationships];
        newRelationships[index] = relationship;
        return { ...prev, relationships: newRelationships };
      });
    };

    const handleRelationshipRemove = (index: number) => {
      setTactic((prev) => ({
        ...prev,
        relationships: prev.relationships.filter((_, i) => i !== index),
      }));
    };

    const handleResetField = (field: 'direction' | 'role' | 'keyResponsibilities') => {
      if (selectedPosition === null) return;

      setTactic((prev) => {
        const existingOverrideIndex = prev.overrides.findIndex((o) => o.positionIndex === selectedPosition);
        
        if (existingOverrideIndex >= 0) {
          const newOverrides = [...prev.overrides];
          const override = { ...newOverrides[existingOverrideIndex] };
          
          // Remove the field
          delete override[field];
          
          // If override is now empty (only positionIndex), remove it entirely
          if (Object.keys(override).length === 1 && 'positionIndex' in override) {
            newOverrides.splice(existingOverrideIndex, 1);
          } else {
            newOverrides[existingOverrideIndex] = override;
          }
          
          return { ...prev, overrides: newOverrides };
        }
        
        return prev;
      });
    };

    const handleResetAllOverrides = () => {
      setTactic((prev) => ({
        ...prev,
        overrides: [],
      }));
    };

    const selectedOverride = selectedPosition !== null
      ? tactic.overrides.find((o) => o.positionIndex === selectedPosition)
      : undefined;

    const parentData = {
      direction: undefined,
      role: undefined,
      keyResponsibilities: undefined,
    };

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Tactic Pitch Editor
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Interactive editor for creating tactical variations with drag-and-drop positioning
            </p>
          </div>

          {/* Controls */}
          <div className="mb-4 flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Snap to Grid (5%)
              </span>
            </label>
            <button
              onClick={() => setShowResetModal(true)}
              className="ml-auto px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Reset All Overrides
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pitch Editor */}
            <div className="lg:col-span-2">
              <TacticPitchEditor
                tactic={tactic}
                parentFormation={sampleFormation}
                onPositionChange={handlePositionChange}
                onRelationshipAdd={handleRelationshipAdd}
                snapToGrid={snapToGrid}
                onPositionSelect={setSelectedPosition}
                selectedPositionIndex={selectedPosition}
              />
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Position Role Panel */}
              {selectedPosition !== null && (
                <PositionRolePanel
                  positionIndex={selectedPosition}
                  position={sampleFormation.positions[selectedPosition].position}
                  override={selectedOverride}
                  parentData={parentData}
                  onUpdate={(override) => handlePositionChange(selectedPosition, override)}
                  onResetField={handleResetField}
                />
              )}

              {selectedPosition === null && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Click a position on the pitch to configure its role
                  </p>
                </div>
              )}

              {/* Relationship Drawer */}
              <RelationshipDrawer
                relationships={tactic.relationships}
                positions={sampleFormation.positions.map((p) => p.position)}
                onUpdate={handleRelationshipUpdate}
                onRemove={handleRelationshipRemove}
              />
            </div>
          </div>
        </div>

        {/* Reset Modal */}
        <ResetOverridesModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={handleResetAllOverrides}
          overrides={tactic.overrides}
          positions={sampleFormation.positions.map((p) => p.position)}
        />
      </div>
    );
  },
};

// Simple Story with Basic Tactic
export const BasicTactic: Story = {
  args: {
    tactic: {
      ...sampleTactic,
      overrides: [],
      relationships: [],
    },
    parentFormation: sampleFormation,
    onPositionChange: () => {},
    onRelationshipAdd: () => {},
    snapToGrid: true,
  },
};

// Story with Many Overrides
export const WithManyOverrides: Story = {
  args: {
    tactic: sampleTactic,
    parentFormation: sampleFormation,
    onPositionChange: () => {},
    onRelationshipAdd: () => {},
    snapToGrid: true,
  },
};
