import { Tactic } from '@/types';

interface TacticPitchEditorProps {
  tactic: Tactic;
  showInheritance?: boolean;
  snapToGrid?: boolean;
}

/**
 * Placeholder component for TacticPitchEditor
 * This component depends on issue #6 (TacticPitchEditor)
 * TODO: Replace with actual implementation when issue #6 is completed
 */
export default function TacticPitchEditor({ 
  tactic, 
  showInheritance = false, 
  snapToGrid = true 
}: TacticPitchEditorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="text-center space-y-4">
        <div className="w-full h-96 bg-gradient-to-b from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 rounded-lg flex items-center justify-center">
          <div className="text-white space-y-2">
            <p className="font-semibold">TacticPitchEditor Component</p>
            <p className="text-sm opacity-80">Depends on issue #6</p>
            <p className="text-xs opacity-60">Tactic: {tactic.name}</p>
            <p className="text-xs opacity-60">Inheritance: {showInheritance ? 'On' : 'Off'} | Grid: {snapToGrid ? 'On' : 'Off'}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This component will allow editing positions on the pitch with drag-and-drop,
          showing inheritance indicators and grid snapping
        </p>
      </div>
    </div>
  );
}
