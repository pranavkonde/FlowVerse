import React from 'react';
import { useDailyChallenges } from '../../hooks/useDailyChallenges';

export function DailyChallengePanel() {
  const {
    challenges,
    loading,
    error,
    updateProgress,
    claimReward,
  } = useDailyChallenges();

  if (loading) {
    return <div className="p-4">Loading daily challenges...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h2 className="text-2xl font-bold text-white">Daily Challenges</h2>
      <div className="space-y-4">
        {challenges.map(challenge => (
          <div
            key={challenge.id}
            className="bg-gray-700 rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {challenge.title}
              </h3>
              <span className="text-sm text-gray-300">
                {new Date(challenge.expiresAt).toLocaleTimeString()}
              </span>
            </div>
            
            <p className="text-gray-300">{challenge.description}</p>
            
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2"
                style={{
                  width: `${(challenge.progress / challenge.requirement) * 100}%`,
                }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">
                Progress: {challenge.progress} / {challenge.requirement}
              </span>
              
              {challenge.completed && !challenge.claimed ? (
                <button
                  onClick={() => claimReward(challenge.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Claim Reward
                </button>
              ) : challenge.claimed ? (
                <span className="text-green-500">Claimed</span>
              ) : null}
            </div>
            
            <div className="text-sm text-gray-400">
              Reward: {challenge.reward.amount} {challenge.reward.type.toLowerCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}