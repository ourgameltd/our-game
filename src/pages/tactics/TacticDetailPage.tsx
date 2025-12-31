import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { getTacticById, getResolvedPositions } from '@/data/tactics';
import { getFormationById } from '@/data/formations';
import { Routes } from '@/utils/routes';
import TacticDisplay from '@/components/tactics/TacticDisplay';
import PrinciplePanel from '@/components/tactics/PrinciplePanel';
import PageTitle from '@/components/common/PageTitle';

export default function TacticDetailPage() {
  const { clubId, ageGroupId, teamId, tacticId } = useParams();
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const tactic = tacticId ? getTacticById(tacticId) : undefined;
  const formation = tactic ? getFormationById(tactic.parentFormationId) : undefined;
  const resolvedPositions = tactic ? getResolvedPositions(tactic) : [];

  const getBackUrl = () => {
    if (!clubId) return '/dashboard';
    if (teamId && ageGroupId) {
      return Routes.teamTactics(clubId, ageGroupId, teamId);
    }
    if (ageGroupId) {
      return Routes.ageGroupTactics(clubId, ageGroupId);
    }
    return Routes.clubTactics(clubId);
  };

  const getEditUrl = () => {
    if (!clubId || !tacticId) return '#';
    if (teamId && ageGroupId) {
      return Routes.teamTacticEdit(clubId, ageGroupId, teamId, tacticId);
    }
    if (ageGroupId) {
      return Routes.ageGroupTacticEdit(clubId, ageGroupId, tacticId);
    }
    return Routes.clubTacticEdit(clubId, tacticId);
  };

  if (!tactic) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Tactic not found</p>
            <Link to={getBackUrl()} className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Tactics
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const getScopeLabel = () => {
    switch (tactic.scope.type) {
      case 'club': return 'Club';
      case 'ageGroup': return 'Age Group';
      case 'team': return 'Team';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <PageTitle
            title={tactic.name}
            subtitle={`${formation?.name || 'Unknown Formation'} • ${tactic.squadSize}-a-side${tactic.style ? ` • ${tactic.style}` : ''}`}
            badge={getScopeLabel()}
            backLink={getBackUrl()}
            action={{
            label: 'Settings',
            icon: 'settings',
            title: 'Settings',
            onClick: () => navigate(getEditUrl()),
            variant: 'primary'
          }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Pitch Display - 30% width on desktop */}
        <div className="lg:col-span-4">
          <TacticDisplay
            tactic={tactic}
            resolvedPositions={resolvedPositions}
            showDirections={true}
            showInheritance={true}
            onPositionClick={(index) => setSelectedPosition(index === selectedPosition ? null : index)}
            selectedPositionIndex={selectedPosition}
          />
        </div>

        {/* Tactic Details - 70% width on desktop */}
        <div className="lg:col-span-6 space-y-6">
          {/* Summary - Full width without title */}
          {tactic.summary && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="markdown-content">
                <Markdown>{tactic.summary}</Markdown>
              </div>
            </div>
          )}
          
          {/* Principles Panel */}
          <PrinciplePanel
            principles={tactic.principles}
            resolvedPositions={resolvedPositions}
            selectedPositionIndex={selectedPosition}
            onPositionClick={setSelectedPosition}
            readOnly
          />
        </div>
      </div>

        

        {/* Tags - Under summary */}
        {tactic.tags && tactic.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tactic.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
