import React, { useState } from 'react';
import { ReferralCode, ReferralStats, REWARD_TYPES, STATUS_COLORS } from '../../types/referral';
import { useReferral } from '../../hooks/useReferral';

export const ReferralProgram: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const {
    codes,
    stats,
    loading,
    error,
    createCode,
    useCode,
    claimRewards
  } = useReferral();

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
        Error loading referral program: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Referral Program</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Create Referral Code
        </button>
      </div>

      {stats && <ReferralStats stats={stats} />}

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white mb-4">Your Referral Codes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {codes.map((code) => (
            <ReferralCodeCard
              key={code.id}
              code={code}
              onClaim={(useId, type) => claimRewards(useId, type)}
            />
          ))}
        </div>
      </div>

      {showCreateModal && (
        <CreateCodeModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createCode}
        />
      )}
    </div>
  );
};

const ReferralStats: React.FC<{ stats: ReferralStats }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-2">Referral Activity</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Total Referrals:</span>
            <span className="text-white">{stats.totalReferrals}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Active Referrals:</span>
            <span className="text-white">{stats.activeReferrals}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Referral Streak:</span>
            <span className="text-white">{stats.referralStreak} days</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-2">Rewards Earned</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Tokens:</span>
            <span className="text-white">{stats.totalRewardsEarned.tokens}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Experience:</span>
            <span className="text-white">{stats.totalRewardsEarned.experience}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Items:</span>
            <span className="text-white">
              {Object.keys(stats.totalRewardsEarned.items).length} types
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-2">Last Activity</h4>
        <div className="space-y-2">
          {stats.lastReferralAt ? (
            <>
              <div className="text-gray-300">Last Referral:</div>
              <div className="text-white">
                {new Date(stats.lastReferralAt).toLocaleDateString()}
              </div>
            </>
          ) : (
            <div className="text-gray-300">No referrals yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReferralCodeCard: React.FC<{
  code: ReferralCode;
  onClaim: (useId: string, type: 'referrer' | 'referee') => Promise<void>;
}> = ({ code, onClaim }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-white">{code.code}</h4>
          {code.metadata.campaign && (
            <span className="text-sm text-gray-400">{code.metadata.campaign}</span>
          )}
        </div>
        <button
          onClick={copyCode}
          className="text-primary hover:text-primary-light"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Uses:</span>
          <span className="text-white">{code.uses} / {code.maxUses}</span>
        </div>

        {code.expiresAt && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Expires:</span>
            <span className="text-white">
              {new Date(code.expiresAt).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="border-t border-gray-600 pt-3">
          <div className="text-sm font-semibold text-white mb-2">Rewards:</div>
          <div className="grid grid-cols-2 gap-4">
            <RewardsList title="You Get" rewards={code.rewards.referrer} />
            <RewardsList title="Friend Gets" rewards={code.rewards.referee} />
          </div>
        </div>

        {code.metadata.customMessage && (
          <div className="mt-3 text-sm text-gray-300 italic">
            "{code.metadata.customMessage}"
          </div>
        )}
      </div>
    </div>
  );
};

const RewardsList: React.FC<{
  title: string;
  rewards: ReferralCode['rewards']['referrer'];
}> = ({ title, rewards }) => {
  return (
    <div>
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <ul className="space-y-1">
        <li className="text-sm">
          <span className="text-yellow-400">{REWARD_TYPES.tokens.icon}</span>
          <span className="text-white ml-2">{rewards.tokens}</span>
        </li>
        <li className="text-sm">
          <span className="text-blue-400">{REWARD_TYPES.experience.icon}</span>
          <span className="text-white ml-2">{rewards.experience}</span>
        </li>
        {rewards.items.map((item, index) => (
          <li key={index} className="text-sm">
            <span className="text-green-400">{REWARD_TYPES.items.icon}</span>
            <span className="text-white ml-2">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const CreateCodeModal: React.FC<{
  onClose: () => void;
  onCreate: (options: {
    maxUses?: number;
    expiresIn?: number;
    campaign?: string;
    customMessage?: string;
  }) => Promise<void>;
}> = ({ onClose, onCreate }) => {
  const [maxUses, setMaxUses] = useState(10);
  const [expiresIn, setExpiresIn] = useState(30); // days
  const [campaign, setCampaign] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await onCreate({
        maxUses,
        expiresIn: expiresIn * 24 * 60 * 60 * 1000, // convert days to milliseconds
        campaign: campaign || undefined,
        customMessage: customMessage || undefined
      });
      onClose();
    } catch (error) {
      console.error('Failed to create code:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">Create Referral Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Maximum Uses
            </label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value))}
              min="1"
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Expires After (days)
            </label>
            <input
              type="number"
              value={expiresIn}
              onChange={(e) => setExpiresIn(parseInt(e.target.value))}
              min="1"
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Campaign Name (optional)
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              placeholder="e.g., Summer2023"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Custom Message (optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              placeholder="Add a personal message for your friends"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
