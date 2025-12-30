import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Copy, ChevronRight, ChevronDown } from 'lucide-react';
import { getClubById } from '@/data/clubs';
import { getAgeGroupById } from '@/data/ageGroups';
import { getTeamById } from '@/data/teams';
import { getTacticById } from '@/data/tactics';
import { getFormationById } from '@/data/formations';
import { Routes } from '@/utils/routes';
import PageTitle from '@/components/common/PageTitle';
import TacticDisplay from '@/components/tactics/TacticDisplay';

export default function TacticDetailPage() {
  const { clubId, ageGroupId, teamId, tacticId } = useParams();
  const navigate = useNavigate();

  // State for expandable sections
  const [isRolesExpanded, setIsRolesExpanded] = useState(false);
  const [isRelationshipsExpanded, setIsRelationshipsExpanded] = useState(false);

  // Get data
  const club = getClubById(clubId!);
  const ageGroup = ageGroupId ? getAgeGroupById(ageGroupId) : null;
  const team = teamId ? getTeamById(teamId) : null;
  const tactic = getTacticById(tacticId!);
  const parentFormation = tactic ? getFormationById(tactic.parentFormationId) : null;
  const parentTactic = tactic?.parentTacticId ? getTacticById(tactic.parentTacticId) : null;

  if (!club || !tactic) {
    return <div>Tactic not found</div>;
  }

  // Style colors
  const styleColors: Record<string, string> = {
    attacking: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    balanced: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    defensive: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    possession: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    'counter-attack': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    'high-press': 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300'
  };

  // Navigation helpers
  const getEditRoute = () => {
    if (teamId) return Routes.teamTacticEdit(clubId!, ageGroupId!, teamId, tacticId!);
    if (ageGroupId) return Routes.ageGroupTacticEdit(clubId!, ageGroupId, tacticId!);
    return Routes.clubTacticEdit(clubId!, tacticId!);
  };

  const getCreateCopyRoute = () => {
    if (teamId) return Routes.teamTacticNew(clubId!, ageGroupId!, teamId) + `?copyFrom=${tacticId}`;
    if (ageGroupId) return Routes.ageGroupTacticNew(clubId!, ageGroupId) + `?copyFrom=${tacticId}`;
    return Routes.clubTacticNew(clubId!) + `?copyFrom=${tacticId}`;
  };

  // Breadcrumb items
  const breadcrumbs = [
    { label: club.name, path: Routes.clubOverview(clubId!) },
    ...(ageGroup ? [{ label: ageGroup.name, path: Routes.ageGroup(clubId!, ageGroupId!) }] : []),
    ...(team ? [{ label: team.name, path: Routes.team(clubId!, ageGroupId!, teamId!) }] : []),
    { label: 'Tactics', path: teamId ? Routes.teamTactics(clubId!, ageGroupId!, teamId) : ageGroupId ? Routes.ageGroupTactics(clubId!, ageGroupId) : Routes.clubTactics(clubId!) },
    { label: tactic.name, path: '' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-primary-600 dark:hover:text-primary-400">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 dark:text-white font-medium">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4" />}
            </div>
          ))}
        </nav>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <PageTitle title={tactic.name} subtitle="" />
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${styleColors[tactic.style]}`}>
                  {tactic.style.replace('-', ' ')}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {tactic.squadSize}-a-side
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => navigate(getEditRoute())}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => navigate(getCreateCopyRoute())}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Copy className="w-4 h-4" />
                Create Copy
              </button>
            </div>
          </div>

          {/* Parent Info */}
          <div className="space-y-2 text-sm">
            {parentFormation && (
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Base Formation:</span> {parentFormation.name} ({parentFormation.system})
              </p>
            )}
            {parentTactic && (
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Parent Tactic:</span> {parentTactic.name}
              </p>
            )}
            {tactic.tags && tactic.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-600 dark:text-gray-400">Tags:</span>
                {tactic.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pitch Display */}
        <div className="mb-6">
          <TacticDisplay tactic={tactic} />
        </div>

        {/* Summary */}
        {tactic.summary && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Tactical Summary
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {/* Simple markdown rendering - in production, use a proper markdown library */}
              {tactic.summary.split('\n').map((line, index) => {
                if (line.startsWith('## ')) {
                  return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('## ', '')}</h3>;
                } else if (line.startsWith('### ')) {
                  return <h4 key={index} className="text-base font-semibold mt-3 mb-2">{line.replace('### ', '')}</h4>;
                } else if (line.startsWith('- ')) {
                  return <li key={index} className="ml-4">{line.replace('- ', '')}</li>;
                } else if (line.trim()) {
                  return <p key={index} className="mb-2">{line}</p>;
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* Position Roles */}
        {tactic.positionRoles && tactic.positionRoles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <button
              onClick={() => setIsRolesExpanded(!isRolesExpanded)}
              className="w-full flex items-center justify-between text-xl font-semibold text-gray-900 dark:text-white mb-4"
            >
              <span>Position Roles ({tactic.positionRoles.length})</span>
              {isRolesExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            
            {isRolesExpanded && (
              <div className="space-y-4">
                {tactic.positionRoles.map((role, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                        {role.position}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {role.role}
                      </span>
                    </div>
                    
                    {role.duties && role.duties.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Duties:</p>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {role.duties.map((duty, dutyIndex) => (
                            <li key={dutyIndex}>{duty}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {role.instructions && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Instructions:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                          "{role.instructions}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Relationships */}
        {tactic.relationships && tactic.relationships.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <button
              onClick={() => setIsRelationshipsExpanded(!isRelationshipsExpanded)}
              className="w-full flex items-center justify-between text-xl font-semibold text-gray-900 dark:text-white mb-4"
            >
              <span>Tactical Relationships ({tactic.relationships.length})</span>
              {isRelationshipsExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            
            {isRelationshipsExpanded && (
              <div className="space-y-3">
                {tactic.relationships.map((relationship) => (
                  <div key={relationship.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        {relationship.fromPosition}
                      </span>
                      <span className="text-gray-500">→</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        {relationship.toPosition}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                        {relationship.type.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {relationship.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
