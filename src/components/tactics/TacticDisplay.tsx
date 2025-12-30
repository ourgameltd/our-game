import { Tactic } from '@/types';

interface TacticDisplayProps {
  tactic: Tactic;
  className?: string;
}

/**
 * Placeholder component for TacticDisplay
 * This component depends on issue #5 (TacticDisplay)
 * TODO: Replace with actual implementation when issue #5 is completed
 */
export default function TacticDisplay({ tactic, className = '' }: TacticDisplayProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="text-center space-y-4">
        <div className="w-full h-96 bg-gradient-to-b from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 rounded-lg flex items-center justify-center">
          <div className="text-white space-y-2">
            <p className="font-semibold">TacticDisplay Component</p>
            <p className="text-sm opacity-80">Depends on issue #5</p>
            <p className="text-xs opacity-60">Tactic: {tactic.name}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This component will display the tactic on a football pitch with position markers, 
          relationships, and tactical instructions
        </p>
      </div>
    </div>
  );
}
