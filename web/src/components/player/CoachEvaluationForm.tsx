import React, { useState } from 'react';
import { Player, AttributeEvaluation } from '@/types';
import { groupAttributes, getQualityColor, calculateOverallRating } from '@/utils/attributeHelpers';

interface CoachEvaluationFormProps {
  player: Player;
  coachId: string;
  onSubmit: (evaluation: AttributeEvaluation) => void;
  onCancel: () => void;
}

export default function CoachEvaluationForm({
  player,
  coachId,
  onSubmit,
  onCancel
}: CoachEvaluationFormProps) {
  const [period, setPeriod] = useState({
    start: new Date(),
    end: new Date()
  });
  
  const [attributeRatings, setAttributeRatings] = useState<{
    name: string;
    rating: number;
    notes: string;
  }[]>([]);

  const [coachNotes, setCoachNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'skills' | 'physical' | 'mental'>('skills');

  const grouped = groupAttributes(player.attributes);

  const handleAttributeChange = (attributeName: string, rating: number) => {
    setAttributeRatings(prev => {
      const existing = prev.find(a => a.name === attributeName);
      if (existing) {
        return prev.map(a => 
          a.name === attributeName ? { ...a, rating } : a
        );
      }
      return [...prev, { name: attributeName, rating, notes: '' }];
    });
  };

  const handleNotesChange = (attributeName: string, notes: string) => {
    setAttributeRatings(prev => {
      const existing = prev.find(a => a.name === attributeName);
      if (existing) {
        return prev.map(a => 
          a.name === attributeName ? { ...a, notes } : a
        );
      }
      return [...prev, { name: attributeName, rating: player.attributes[attributeName as keyof typeof player.attributes] as number, notes }];
    });
  };

  const getRating = (attributeName: string): number => {
    const rating = attributeRatings.find(a => a.name === attributeName);
    return rating?.rating ?? (player.attributes[attributeName as keyof typeof player.attributes] as number);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate new overall rating based on updated attributes
    const updatedAttributes = { ...player.attributes };
    attributeRatings.forEach(({ name, rating }) => {
      (updatedAttributes as any)[name] = rating;
    });
    
    const overallRating = calculateOverallRating(updatedAttributes);

    const evaluation: AttributeEvaluation = {
      id: `eval-${Date.now()}`,
      playerId: player.id,
      evaluatedBy: coachId,
      evaluatedAt: new Date(),
      attributes: attributeRatings,
      overallRating,
      coachNotes,
      period
    };

    onSubmit(evaluation);
  };

  const currentAttributes = grouped[selectedCategory];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Player Evaluation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Evaluate {player.firstName} {player.lastName}'s performance
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Evaluation Period */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Period Start
            </label>
            <input
              type="date"
              value={period.start.toISOString().split('T')[0]}
              onChange={(e) => setPeriod(p => ({ ...p, start: new Date(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Period End
            </label>
            <input
              type="date"
              value={period.end.toISOString().split('T')[0]}
              onChange={(e) => setPeriod(p => ({ ...p, end: new Date(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
          {(['skills', 'physical', 'mental'] as const).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                selectedCategory === category
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Attributes Rating */}
        <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
          {currentAttributes.map((attr) => {
            const currentRating = getRating(attr.name.replace(/ /g, '').replace(/^(.)/, (m) => m.toLowerCase()));
            const quality = getQualityColor(attr.quality);

            return (
              <div key={attr.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-gray-900 dark:text-white">
                    {attr.name}
                  </label>
                  <span className={`text-lg font-bold ${quality}`}>
                    {currentRating}/99
                  </span>
                </div>

                {/* Rating Slider */}
                <input
                  type="range"
                  min="0"
                  max="99"
                  value={currentRating}
                  onChange={(e) => handleAttributeChange(
                    attr.name.replace(/ /g, '').replace(/^(.)/, (m) => m.toLowerCase()),
                    parseInt(e.target.value)
                  )}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />

                {/* Notes */}
                <input
                  type="text"
                  placeholder="Add notes (optional)"
                  value={attributeRatings.find(a => a.name === attr.name.replace(/ /g, '').replace(/^(.)/, (m) => m.toLowerCase()))?.notes || ''}
                  onChange={(e) => handleNotesChange(
                    attr.name.replace(/ /g, '').replace(/^(.)/, (m) => m.toLowerCase()),
                    e.target.value
                  )}
                  className="mt-2 w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            );
          })}
        </div>

        {/* Overall Coach Notes */}
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
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Submit Evaluation
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 
              text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
