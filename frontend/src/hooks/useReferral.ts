import { useState, useEffect } from 'react';
import { ReferralCode, ReferralStats } from '../types/referral';
import { api } from '../services/api';

interface UseReferralResult {
  codes: ReferralCode[];
  stats: ReferralStats | null;
  loading: boolean;
  error: string | null;
  createCode: (options: {
    maxUses?: number;
    expiresIn?: number;
    campaign?: string;
    customMessage?: string;
  }) => Promise<void>;
  useCode: (code: string) => Promise<void>;
  claimRewards: (useId: string, type: 'referrer' | 'referee') => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useReferral(): UseReferralResult {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [codesResponse, statsResponse] = await Promise.all([
        api.get('/referral/codes'),
        api.get('/referral/stats')
      ]);

      setCodes(codesResponse.data);
      setStats(statsResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load referral data');
      console.error('Error fetching referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCode = async (options: {
    maxUses?: number;
    expiresIn?: number;
    campaign?: string;
    customMessage?: string;
  }) => {
    try {
      const response = await api.post('/referral/codes', options);
      setCodes(current => [...current, response.data]);
    } catch (err) {
      console.error('Error creating referral code:', err);
      throw err;
    }
  };

  const useCode = async (code: string) => {
    try {
      await api.post('/referral/use', { code });
      // Refresh data to get updated stats
      fetchData();
    } catch (err) {
      console.error('Error using referral code:', err);
      throw err;
    }
  };

  const claimRewards = async (useId: string, type: 'referrer' | 'referee') => {
    try {
      await api.post('/referral/claim', { useId, claimerType: type });
      // Refresh data to get updated stats
      fetchData();
    } catch (err) {
      console.error('Error claiming rewards:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('referralCodeCreated', (code: ReferralCode) => {
      setCodes(current => [...current, code]);
    });

    socket.on('referralCodeUsed', ({ code }: { code: ReferralCode }) => {
      setCodes(current =>
        current.map(c =>
          c.id === code.id ? code : c
        )
      );
    });

    socket.on('statsUpdated', ({ stats: newStats }: { stats: ReferralStats }) => {
      setStats(newStats);
    });

    return () => {
      socket.off('referralCodeCreated');
      socket.off('referralCodeUsed');
      socket.off('statsUpdated');
    };
  }, []);

  return {
    codes,
    stats,
    loading,
    error,
    createCode,
    useCode,
    claimRewards,
    refreshData: fetchData
  };
}
