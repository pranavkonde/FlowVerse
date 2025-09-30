import React, { useEffect, useState } from 'react';
import { DailyChallenge } from '../../types/challenges';
import { useDailyChallenges } from '../../hooks/useDailyChallenges';

interface ChallengePanelProps {
  onClaimReward: (challengeId: string) => void;
}

export const DailyChallengePanel: React.FC<ChallengePanelProps> = ({ onClaimReward }) => {
  const { challenges, loading, error } = useDailyChallenges();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading challenges: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4">Daily Challenges</h2>
      
      <div className="grid gap-4">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onClaimReward={onClaimReward}
          />
        ))}
      </div>
    </div>
  );
};

interface ChallengeCardProps {
  challenge: DailyChallenge & {
    progress: number;
    completed: boolean;
    claimed: boolean;
  };
  onClaimReward: (challengeId: string) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onClaimReward }) => {
  const progress = Math.min((challenge.progress / challenge.requirement.target) * 100, 100);
  
  return (
    <div className="bg-gray-700 rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
          <p className="text-gray-300">{challenge.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          {challenge.type === 'combat' && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">Combat</span>
          )}
          {challenge.type === 'collection' && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">Collection</span>
          )}
          {challenge.type === 'social' && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Social</span>
          )}
          {challenge.type === 'exploration' && (
            <span className="bg-purple-500 text-white px-2 py-1 rounded text-sm">Exploration</span>
          )}
          {challenge.type === 'crafting' && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">Crafting</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-300">
          <span>Progress</span>
          <span>{challenge.progress} / {challenge.requirement.target}</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-400">{challenge.rewards.tokens} tokens</span>
          <span className="text-blue-400">+{challenge.rewards.experience} XP</span>
        </div>
        
        <button
          onClick={() => onClaimReward(challenge.id)}
          disabled={!challenge.completed || challenge.claimed}
          className={`px-4 py-2 rounded font-semibold ${
            challenge.claimed
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
              : challenge.completed
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          {challenge.claimed
            ? 'Claimed'
            : challenge.completed
            ? 'Claim Reward'
            : 'In Progress'}
        </button>
      </div>
    </div>
  );
};
