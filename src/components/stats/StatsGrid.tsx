import React from 'react';
import StatCard from './StatCard';

interface StatsGridProps {
  stats: {
    goalDifference: number;
    playerCount: number;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
  };
  onPlayerCountClick?: () => void;
  additionalInfo?: string;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, onPlayerCountClick, additionalInfo }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        label="Goal Difference"
        value={`${stats.goalDifference >= 0 ? '+' : ''}${stats.goalDifference}`}
        variant={stats.goalDifference >= 0 ? 'success' : 'danger'}
        subtitle={additionalInfo}
      />
      
      <StatCard
        label="Total Players"
        value={stats.playerCount}
        variant="default"
        subtitle={onPlayerCountClick ? 'View all →' : undefined}
        onClick={onPlayerCountClick}
        className={onPlayerCountClick ? 'cursor-pointer' : ''}
      />
      
      <StatCard
        label="Matches Played"
        value={stats.matchesPlayed}
        subtitle={`${stats.wins}W - ${stats.draws}D - ${stats.losses}L`}
      />
      
      <StatCard
        label="Win Rate"
        value={`${stats.winRate}%`}
        variant="success"
        subtitle="This season"
      />
    </div>
  );
};

export default StatsGrid;
