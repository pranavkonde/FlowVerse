import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalTokensEarned: number;
}

export const ReferralDashboard: React.FC = () => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReferralCode();
    fetchReferralStats();
  }, []);

  const fetchReferralCode = async () => {
    try {
      const response = await fetch('/api/referral/generate-code');
      const data = await response.json();
      setReferralCode(data.code);
    } catch (error) {
      console.error('Error fetching referral code:', error);
    }
  };

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referral/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}/join?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const applyReferralCode = async () => {
    try {
      const response = await fetch('/api/referral/apply-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referralCode: inputCode }),
      });
      const data = await response.json();
      
      if (data.success) {
        setError('');
        setInputCode('');
        // Show success message or trigger reward animation
      } else {
        setError(data.error || 'Invalid referral code');
      }
    } catch (error) {
      console.error('Error applying referral code:', error);
      setError('Failed to apply referral code');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Referral Program</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Referral Stats */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-xl font-semibold text-white mb-4">Your Stats</h3>
          {stats && (
            <div className="space-y-2">
              <p className="text-gray-300">
                Total Referrals: <span className="font-bold text-white">{stats.totalReferrals}</span>
              </p>
              <p className="text-gray-300">
                Pending: <span className="font-bold text-yellow-400">{stats.pendingReferrals}</span>
              </p>
              <p className="text-gray-300">
                Completed: <span className="font-bold text-green-400">{stats.completedReferrals}</span>
              </p>
              <p className="text-gray-300">
                Tokens Earned: <span className="font-bold text-blue-400">{stats.totalTokensEarned}</span>
              </p>
            </div>
          )}
        </div>

        {/* Share Referral */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-xl font-semibold text-white mb-4">Share & Earn</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={referralCode}
                readOnly
                className="bg-gray-600 text-white px-4 py-2 rounded flex-1"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={copyReferralLink}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>
            <p className="text-sm text-gray-400">
              Share your referral code with friends and earn rewards when they join!
            </p>
          </div>
        </div>

        {/* Apply Referral Code */}
        <div className="md:col-span-2 bg-gray-700 rounded-lg p-4">
          <h3 className="text-xl font-semibold text-white mb-4">Have a Code?</h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Enter referral code"
              className="bg-gray-600 text-white px-4 py-2 rounded flex-1"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={applyReferralCode}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
            >
              Apply
            </motion.button>
          </div>
          {error && (
            <p className="text-red-400 mt-2 text-sm">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};
