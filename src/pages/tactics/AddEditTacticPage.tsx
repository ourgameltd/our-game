import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Routes } from '@/utils/routes';

export default function AddEditTacticPage() {
  const { clubId, ageGroupId, teamId, tacticId } = useParams();
  const isEditing = !!tacticId;

  const getBackUrl = () => {
    if (!clubId) return '/dashboard';
    if (tacticId) {
      // Go back to detail page when editing
      if (teamId && ageGroupId) {
        return Routes.teamTacticDetail(clubId, ageGroupId, teamId, tacticId);
      }
      if (ageGroupId) {
        return Routes.ageGroupTacticDetail(clubId, ageGroupId, tacticId);
      }
      return Routes.clubTacticDetail(clubId, tacticId);
    }
    // Go back to list when creating new
    if (teamId && ageGroupId) {
      return Routes.teamTactics(clubId, ageGroupId, teamId);
    }
    if (ageGroupId) {
      return Routes.ageGroupTactics(clubId, ageGroupId);
    }
    return Routes.clubTactics(clubId);
  };

  const getScopeLabel = () => {
    if (teamId) return 'Team';
    if (ageGroupId) return 'Age Group';
    return 'Club';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          to={getBackUrl()}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Tactic' : 'New Tactic'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditing ? 'Update your tactical setup' : `Create a new ${getScopeLabel().toLowerCase()} tactic`}
          </p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tactic Editor Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            The interactive tactic editor with drag-and-drop position editing, 
            relationship management, and real-time preview is currently under development.
          </p>
          <div className="pt-4">
            <Link
              to={getBackUrl()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tactics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
