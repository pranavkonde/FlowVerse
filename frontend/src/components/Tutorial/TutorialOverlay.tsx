import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  task: string;
  reward: {
    tokens: number;
    items?: string[];
  };
  requiredActions: string[];
  nextStepId?: string;
}

export const TutorialOverlay: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [lastReward, setLastReward] = useState<typeof TutorialStep.prototype.reward | null>(null);

  useEffect(() => {
    fetchCurrentStep();
  }, []);

  const fetchCurrentStep = async () => {
    try {
      const response = await fetch('/api/tutorial/current-step');
      const data = await response.json();
      setCurrentStep(data);
    } catch (error) {
      console.error('Error fetching tutorial step:', error);
    }
  };

  const completeAction = async (action: string) => {
    try {
      const response = await fetch('/api/tutorial/complete-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();

      if (data.stepCompleted) {
        setLastReward(data.reward);
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          if (!data.tutorialCompleted) {
            fetchCurrentStep();
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error completing action:', error);
    }
  };

  if (!currentStep) return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 p-6 rounded-lg max-w-md pointer-events-auto">
        <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
        <p className="text-gray-300 mb-4">{currentStep.description}</p>
        
        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Current Task:</h3>
          <p className="text-gray-300">{currentStep.task}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-gray-300">
            <span className="font-semibold">Reward:</span>
            <span className="ml-2">{currentStep.reward.tokens} Tokens</span>
            {currentStep.reward.items?.map((item, index) => (
              <span key={index} className="ml-2">+ {item}</span>
            ))}
          </div>
          
          {currentStep.id === 'welcome' && (
            <button
              onClick={() => completeAction('click_next')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showReward && lastReward && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-auto"
          >
            <div className="bg-yellow-400 p-8 rounded-lg text-center">
              <h3 className="text-2xl font-bold mb-4">Step Complete!</h3>
              <p className="text-xl">{lastReward.tokens} Tokens</p>
              {lastReward.items?.map((item, index) => (
                <p key={index} className="text-lg">{item}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


