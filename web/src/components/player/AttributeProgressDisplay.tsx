import { Player } from '@/types';
import { groupAttributes, getQualityColor, calculateAttributeChange } from '@/utils/attributeHelpers';

interface AttributeProgressDisplayProps {
  player: Player;
}

export default function AttributeProgressDisplay({ player }: AttributeProgressDisplayProps) {
  const grouped = groupAttributes(player.attributes);
  const evaluations = player.evaluations.sort((a, b) => 
    b.evaluatedAt.getTime() - a.evaluatedAt.getTime()
  );

  const latestEval = evaluations[0];
  const previousEval = evaluations[1];

  const getAttributeChange = (attributeName: string) => {
    if (!previousEval || !latestEval) return null;

    const oldRating = previousEval.attributes.find(a => a.name === attributeName)?.rating;
    const newRating = latestEval.attributes.find(a => a.name === attributeName)?.rating;

    if (oldRating === undefined || newRating === undefined) return null;

    return calculateAttributeChange(oldRating, newRating);
  };

  const renderAttributeCategory = (
    title: string,
    attributes: typeof grouped.skills,
    icon: string
  ) => (
    <div className="card mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="space-y-2">
        {attributes.map((attr) => {
          const attributeKey = attr.name.replace(/ /g, '').replace(/^(.)/, (m) => m.toLowerCase());
          const change = getAttributeChange(attributeKey);

          return (
            <div key={attr.name} className="relative">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {attr.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${getQualityColor(attr.quality)}`}>
                    {attr.rating}/99
                  </span>
                  {change && (
                    <span className={`text-xs font-medium ${
                      change.improved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {change.improved ? '+' : ''}{change.change}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    attr.rating >= 90 ? 'bg-green-600' :
                    attr.rating >= 80 ? 'bg-blue-600' :
                    attr.rating >= 70 ? 'bg-cyan-600' :
                    attr.rating >= 50 ? 'bg-yellow-600' :
                    attr.rating >= 40 ? 'bg-orange-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${(attr.rating / 99) * 100}%` }}
                />
              </div>

              {/* Quality Label */}
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {attr.quality}
                </span>
                {latestEval && latestEval.attributes.find(a => a.name === attributeKey)?.notes && (
                  <span className="text-xs italic text-gray-600 dark:text-gray-400">
                    "{latestEval.attributes.find(a => a.name === attributeKey)?.notes}"
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Overall Rating Card */}
      <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="text-center">
          <div className="text-sm font-medium opacity-90 mb-2">Overall Rating</div>
          <div className="text-6xl font-bold mb-2">{player.overallRating}</div>
          <div className="text-sm opacity-90">
            {player.overallRating >= 90 ? 'Excellent' :
             player.overallRating >= 80 ? 'Very Good' :
             player.overallRating >= 70 ? 'Good' :
             player.overallRating >= 50 ? 'Fair' : 'Developing'}
          </div>
        </div>
      </div>

      {/* Latest Evaluation Summary */}
      {latestEval && (
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📋</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-white mb-1">
                Latest Coach Evaluation
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {latestEval.evaluatedAt.toLocaleDateString()} - 
                {latestEval.period && ` ${latestEval.period.start.toLocaleDateString()} to ${latestEval.period.end.toLocaleDateString()}`}
              </div>
              {latestEval.coachNotes && (
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{latestEval.coachNotes}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      {previousEval && latestEval && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Progress Since Last Evaluation
          </h3>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400 dark:text-gray-500">
                {previousEval.overallRating}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Previous</div>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                latestEval.overallRating > previousEval.overallRating 
                  ? 'text-green-600 dark:text-green-400'
                  : latestEval.overallRating < previousEval.overallRating
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {latestEval.overallRating}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Current</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                latestEval.overallRating > previousEval.overallRating 
                  ? 'text-green-600 dark:text-green-400'
                  : latestEval.overallRating < previousEval.overallRating
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {latestEval.overallRating > previousEval.overallRating ? '+' : ''}
                {latestEval.overallRating - previousEval.overallRating}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Change</div>
            </div>
          </div>
        </div>
      )}

      {/* Attribute Categories */}
      {renderAttributeCategory('Skills', grouped.skills, '⚽')}
      {renderAttributeCategory('Physical', grouped.physical, '💪')}
      {renderAttributeCategory('Mental', grouped.mental, '🧠')}

      {/* Evaluation History */}
      {evaluations.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Evaluation History
          </h3>
          <div className="space-y-2">
            {evaluations.map((evaluation, index) => (
              <div
                key={evaluation.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {evaluation.overallRating}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {evaluation.evaluatedAt.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {evaluation.attributes.length} attributes evaluated
                  </div>
                </div>
                {index < evaluations.length - 1 && (
                  <div className={`text-sm font-medium ${
                    evaluation.overallRating > evaluations[index + 1].overallRating
                      ? 'text-green-600 dark:text-green-400'
                      : evaluation.overallRating < evaluations[index + 1].overallRating
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {evaluation.overallRating > evaluations[index + 1].overallRating ? '+' : ''}
                    {evaluation.overallRating - evaluations[index + 1].overallRating}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
