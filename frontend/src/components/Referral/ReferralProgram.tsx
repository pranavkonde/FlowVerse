import React, { useState } from 'react';
import { useReferral } from '../../hooks/useReferral';
import { ReferralCode, ReferralTier } from '../../types/referral';

export function ReferralProgram() {
  const {
    program,
    stats,
    codes,
    loading,
    error,
    generateCode,
    useCode
  } = useReferral();

  const [referralCode, setReferralCode] = useState('');
  const [showNewCodeForm, setShowNewCodeForm] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number>(24);
  const [maxUses, setMaxUses] = useState<number>(10);

  if (loading) {
    return <div className="p-4">Loading referral program...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!program || !stats) {
    return <div className="p-4">No referral program data available</div>;
  }

  const handleGenerateCode = async () => {
    try {
      await generateCode({ expiresIn, maxUses });
      setShowNewCodeForm(false);
    } catch (err) {
      console.error('Failed to generate code:', err);
    }
  };

  const handleUseCode = async () => {
    try {
      await useCode(referralCode);
      setReferralCode('');
      alert('Referral code used successfully!');
    } catch (err) {
      alert('Failed to use referral code');
    }
  };

  const renderTierProgress = (tier: ReferralTier) => {
    const isCurrentTier = program.currentTier === tier.level;
    const isCompleted = program.currentTier > tier.level;
    const progress = isCompleted
      ? 100
      : isCurrentTier
      ? program.nextTierProgress
      : 0;

    return (
      <div
        key={tier.level}
        className={`
          bg-gray-700 rounded-lg p-4 relative
          ${isCurrentTier ? 'ring-2 ring-blue-500' : ''}
          ${isCompleted ? 'bg-gray-600' : ''}
        `}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">
            {tier.name}
          </h3>
          <span className="text-sm text-gray-300">
            Level {tier.level}
          </span>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-300">
            Required Referrals: {tier.requiredReferrals}
          </div>

          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="bg-blue-500 rounded-full h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">Rewards:</div>
            {tier.rewards.map((reward, index) => (
              <div key={index} className="text-sm text-gray-300">
                • {reward.amount}x {reward.description}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">Special Perks:</div>
            {tier.specialPerks.map((perk, index) => (
              <div key={index} className="text-sm text-gray-300">
                • {perk}
              </div>
            ))}
          </div>
        </div>

        {isCompleted && (
          <div className="absolute top-2 right-2">
            <span className="text-green-500">✓ Completed</span>
          </div>
        )}
      </div>
    );
  };

  const renderStats = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Your Referral Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {stats.totalReferrals}
          </div>
          <div className="text-sm text-gray-400">Total Referrals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {stats.activeReferrals}
          </div>
          <div className="text-sm text-gray-400">Active Referrals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {stats.referralChain}
          </div>
          <div className="text-sm text-gray-400">Referral Chain</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {stats.specialAchievements.length}
          </div>
          <div className="text-sm text-gray-400">Achievements</div>
        </div>
      </div>
    </div>
  );

  const renderCodes = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Your Referral Codes</h2>
        <button
          onClick={() => setShowNewCodeForm(!showNewCodeForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showNewCodeForm ? 'Cancel' : 'Generate New Code'}
        </button>
      </div>

      {showNewCodeForm && (
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Expires In (hours)
              </label>
              <input
                type="number"
                value={expiresIn}
                onChange={e => setExpiresIn(parseInt(e.target.value))}
                className="w-full bg-gray-600 text-white rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Max Uses
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={e => setMaxUses(parseInt(e.target.value))}
                className="w-full bg-gray-600 text-white rounded px-3 py-2"
              />
            </div>
          </div>
          <button
            onClick={handleGenerateCode}
            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Generate Code
          </button>
        </div>
      )}

      <div className="space-y-4">
        {codes.map(code => (
          <div
            key={code.id}
            className="bg-gray-700 rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-xl font-mono text-white">{code.code}</div>
              <div className={`
                px-2 py-1 rounded text-sm
                ${code.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}
              `}>
                {code.status}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div>Uses: {code.currentUses}/{code.maxUses || '∞'}</div>
              {code.expiresAt && (
                <div>
                  Expires: {new Date(code.expiresAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUseCode = () => (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">Use a Referral Code</h2>
      <div className="flex space-x-4">
        <input
          type="text"
          value={referralCode}
          onChange={e => setReferralCode(e.target.value.toUpperCase())}
          placeholder="Enter referral code"
          className="flex-1 bg-gray-700 text-white rounded px-4 py-2"
        />
        <button
          onClick={handleUseCode}
          disabled={!referralCode}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Use Code
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {renderStats()}
      {renderCodes()}
      {renderUseCode()}

      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-bold text-white mb-4">Referral Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {program.tiers.map(renderTierProgress)}
        </div>
      </div>
    </div>
  );
}