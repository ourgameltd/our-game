import { Tactic } from '@/types';
import { Shield, Zap, Target, TrendingUp, Layers, Building, Users, UserSquare } from 'lucide-react';

interface TacticCardProps {
  tactic: Tactic;
  onClick?: () => void;
}

const styleIcons = {
  attacking: <Zap className="w-4 h-4" />,
  balanced: <Target className="w-4 h-4" />,
  defensive: <Shield className="w-4 h-4" />,
  possession: <TrendingUp className="w-4 h-4" />,
  'counter-attack': <Zap className="w-4 h-4" />,
  'high-press': <Layers className="w-4 h-4" />
};

const styleColors = {
  attacking: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  balanced: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  defensive: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  possession: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  'counter-attack': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
  'high-press': 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300'
};

const scopeIcons = {
  club: <Building className="w-4 h-4" />,
  ageGroup: <Users className="w-4 h-4" />,
  team: <UserSquare className="w-4 h-4" />
};

const scopeLabels = {
  club: 'Club',
  ageGroup: 'Age Group',
  team: 'Team'
};

export default function TacticCard({ tactic, onClick }: TacticCardProps) {
  const styleColor = styleColors[tactic.style];
  const styleIcon = styleIcons[tactic.style];
  const scopeIcon = scopeIcons[tactic.scope];
  const scopeLabel = scopeLabels[tactic.scope];

  // Squad size display
  const squadSizeLabel = `${tactic.squadSize}-a-side`;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {tactic.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Based on {tactic.parentFormationId ? 'Formation' : 'Custom'}
          </p>
        </div>
        {/* Style Badge */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styleColor}`}>
          {styleIcon}
          <span className="capitalize">{tactic.style.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Info Row */}
      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
        {/* Squad Size */}
        <div className="flex items-center gap-1">
          <span className="font-medium">{squadSizeLabel}</span>
        </div>

        {/* Scope */}
        <div className="flex items-center gap-1">
          {scopeIcon}
          <span>{scopeLabel}</span>
        </div>
      </div>

      {/* Tags */}
      {tactic.tags && tactic.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tactic.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {tactic.tags.length > 3 && (
            <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
              +{tactic.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Mini pitch preview placeholder - will be implemented with TacticDisplay */}
      <div className="mt-3 h-24 bg-gradient-to-b from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded border border-green-300 dark:border-green-700 flex items-center justify-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Pitch preview coming soon
        </span>
      </div>
    </div>
  );
}
