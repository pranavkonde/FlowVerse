import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyReward {
  day: number;
  tokens: number;
  items: string[];
  specialReward?: string;
}

interface StreakInfo {
  currentStreak: number;
  nextReward: DailyReward;
  canClaim: boolean;
}

export const DailyRewardModal: React.FC = () => {
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [claimedReward, setClaimedReward] = useState<DailyReward | null>(null);

  useEffect(() => {
    fetchStreakInfo();
  }, []);

  const fetchStreakInfo = async () => {
    try {
      const response = await fetch('/api/daily-rewards/streak');
      const data = await response.json();
      setStreakInfo(data);
    } catch (error) {
      console.error('Error fetching streak info:', error);
    }
  };

  const claimReward = async () => {
    try {
      const response = await fetch('/api/daily-rewards/claim', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setClaimedReward(data.reward);
        setShowRewardAnimation(true);
        setTimeout(() => {
          setShowRewardAnimation(false);
          fetchStreakInfo();
        }, 3000);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  if (!streakInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Daily Rewards</h2>
        
        <div className="grid grid-cols-7 gap-2 mb-6">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className={`p-3 rounded ${
                index < streakInfo.currentStreak
                  ? 'bg-green-500'
                  : index === streakInfo.currentStreak
                  ? 'bg-blue-500 animate-pulse'
                  : 'bg-gray-600'
              }`}
            >
              Day {index + 1}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Next Reward:</h3>
          <ul className="text-gray-300">
            <li>• {streakInfo.nextReward.tokens} Tokens</li>
            {streakInfo.nextReward.items.map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
            {streakInfo.nextReward.specialReward && (
              <li className="text-yellow-400">
                • Special: {streakInfo.nextReward.specialReward}
              </li>
            )}
          </ul>
        </div>

        <button
          onClick={claimReward}
          disabled={!streakInfo.canClaim}
          className={`w-full py-3 rounded-lg font-bold ${
            streakInfo.canClaim
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {streakInfo.canClaim ? 'Claim Reward' : 'Come back tomorrow!'}
        </button>

        <AnimatePresence>
          {showRewardAnimation && claimedReward && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center"
            >
              <div className="bg-yellow-400 p-8 rounded-lg text-center">
                <h3 className="text-2xl font-bold mb-4">Reward Claimed!</h3>
                <p className="text-xl">{claimedReward.tokens} Tokens</p>
                {claimedReward.items.map((item, index) => (
                  <p key={index} className="text-lg">{item}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
