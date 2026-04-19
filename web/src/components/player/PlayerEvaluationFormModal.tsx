import { useMemo, useState } from 'react';
import { Target, Dumbbell, Brain } from 'lucide-react';
import { useCreatePlayerAbilityEvaluation } from '@api/hooks';
import { CreatePlayerAbilityEvaluationRequest, PlayerAbilitiesDto } from '@api/client';
import { groupAttributes, getQualityColor } from '@utils/attributeHelpers';
import { PlayerAttributes } from '@/types';

interface PlayerEvaluationFormModalProps {
  abilities: PlayerAbilitiesDto;
  playerId: string;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

const attributeKeyMap: Record<string, string> = {
  'Ball Control': 'ballControl',
  'Crossing': 'crossing',
  'Weak Foot': 'weakFoot',
  'Dribbling': 'dribbling',
  'Finishing': 'finishing',
  'Free Kick': 'freeKick',
  'Heading': 'heading',
  'Long Passing': 'longPassing',
  'Long Shot': 'longShot',
  'Penalties': 'penalties',
  'Short Passing': 'shortPassing',
  'Shot Power': 'shotPower',
  'Sliding Tackle': 'slidingTackle',
  'Standing Tackle': 'standingTackle',
  'Volleys': 'volleys',
  'Acceleration': 'acceleration',
  'Agility': 'agility',
  'Balance': 'balance',
  'Jumping': 'jumping',
  'Pace': 'pace',
  'Reactions': 'reactions',
  'Sprint Speed': 'sprintSpeed',
  'Stamina': 'stamina',
  'Strength': 'strength',
  'Aggression': 'aggression',
  'Attacking Position': 'attackingPosition',
  'Awareness': 'awareness',
  'Composure': 'composure',
  'Defensive Positioning': 'defensivePositioning',
  'Interceptions': 'interceptions',
  'Marking': 'marking',
  'Positioning': 'positioning',
  'Vision': 'vision',
};

export default function PlayerEvaluationFormModal({
  abilities,
  playerId,
  onClose,
  onSuccess,
}: PlayerEvaluationFormModalProps) {
  const { mutate: createEvaluation, isSubmitting } = useCreatePlayerAbilityEvaluation(playerId);

  const groupedAttributes = useMemo(
    () => groupAttributes(abilities.attributes),
    [abilities.attributes]
  );

  const activeEvaluations = useMemo(
    () => (abilities.evaluations || []).filter((e) => !e.isArchived),
    [abilities.evaluations]
  );

  const lastEvaluation = activeEvaluations[0] ?? null;

  const [evaluationDate, setEvaluationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<'skills' | 'physical' | 'mental'>('skills');
  const [attributeRatings, setAttributeRatings] = useState<Record<string, number>>(() => {
    const ratings: Record<string, number> = {};
    if (lastEvaluation) {
      lastEvaluation.attributes.forEach((attr) => {
        ratings[attr.attributeName] = attr.rating;
      });
    } else {
      Object.entries(abilities.attributes).forEach(([key, value]) => {
        if (typeof value === 'number') {
          ratings[key] = value;
        }
      });
    }
    return ratings;
  });
  const [coachNotes, setCoachNotes] = useState<string>(lastEvaluation?.coachNotes ?? '');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentAttributes = groupedAttributes[selectedCategory];

  const handleSubmit = async () => {
    setSubmitError(null);

    const request: CreatePlayerAbilityEvaluationRequest = {
      evaluatedAt: evaluationDate,
      coachNotes: coachNotes || undefined,
      attributes: Object.entries(attributeRatings).map(([attributeName, rating]) => ({
        attributeName,
        rating,
      })),
    };

    try {
      await createEvaluation(request);
      await onSuccess();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit evaluation');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                New Review - {abilities.firstName} {abilities.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {lastEvaluation
                  ? 'Values auto-populated from last review'
                  : 'Values auto-populated from current attributes'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {submitError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{submitError}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Review Date
            </label>
            <input
              type="date"
              value={evaluationDate}
              onChange={(e) => setEvaluationDate(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-evenly sm:justify-start sm:flex-wrap gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            {([
              { key: 'skills', Icon: Target },
              { key: 'physical', Icon: Dumbbell },
              { key: 'mental', Icon: Brain },
            ] as const).map(({ key: category, Icon }) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {category} ({groupedAttributes[category].length})
                </span>
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {currentAttributes.map((attr) => {
              const attrKey = attributeKeyMap[attr.name];
              const currentRating =
                attributeRatings[attrKey] ??
                (abilities.attributes[attrKey as keyof PlayerAttributes] || 50);
              const quality = getQualityColor(attr.quality);

              return (
                <div key={attr.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-gray-900 dark:text-white">{attr.name}</label>
                    <span className={`text-lg font-bold ${quality}`}>{currentRating}/99</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="99"
                    value={currentRating}
                    onChange={(e) =>
                      setAttributeRatings((prev) => ({
                        ...prev,
                        [attrKey]: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>99</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Overall Coach Comments
            </label>
            <textarea
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Provide overall feedback on player performance, areas of improvement, and recommendations..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
