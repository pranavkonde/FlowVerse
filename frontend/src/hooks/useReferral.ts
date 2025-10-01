import { useState, useEffect } from 'react';
import {
  ReferralCode,
  ReferralProgram,
  ReferralStats,
  ReferralUse
} from '../types/referral';
import { api } from '../services/api';

interface UseReferralResult {
  program: ReferralProgram | null;
  stats: ReferralStats | null;
  codes: ReferralCode[];
  loading: boolean;
  error: string | null;
  generateCode: (options?: {
    expiresIn?: number;
    maxUses?: number;
  }) => Promise<ReferralCode>;
  useCode: (code: string) => Promise<ReferralUse>;
  claimRewards: (useId: string) => Promise<ReferralUse>;
  refreshData: () => Promise<void>;
}

export function useReferral(): UseReferralResult {
  const [program, setProgram] = useState<ReferralProgram | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgram = async () => {
    try {
      const response = await api.get('/referral/program');
      setProgram(response.data);
    } catch (err) {
      console.error('Error fetching referral program:', err);
      setError('Failed to load referral program');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/referral/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching referral stats:', err);
    }
  };

  const fetchCodes = async () => {
    try {
      const response = await api.get('/referral/codes');
      setCodes(response.data);
    } catch (err) {
      console.error('Error fetching referral codes:', err);
    }
  };

  const generateCode = async (options?: {
    expiresIn?: number;
    maxUses?: number;
  }): Promise<ReferralCode> => {
    try {
      const response = await api.post('/referral/generate', options);
      const newCode = response.data;
      setCodes(current => [...current, newCode]);
      return newCode;
    } catch (err) {
      console.error('Error generating referral code:', err);
      throw err;
    }
  };

  const useCode = async (code: string): Promise<ReferralUse> => {
    try {
      const response = await api.post('/referral/use', { code });
      return response.data;
    } catch (err) {
      console.error('Error using referral code:', err);
      throw err;
    }
  };

  const claimRewards = async (useId: string): Promise<ReferralUse> => {
    try {
      const response = await api.post('/referral/claim', { useId });
      await Promise.all([fetchStats(), fetchProgram()]);
      return response.data;
    } catch (err) {
      console.error('Error claiming rewards:', err);
      throw err;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProgram(),
        fetchStats(),
        fetchCodes()
      ]);
      setError(null);
    } catch (err) {
      setError('Failed to refresh referral data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('referral:used', ({ referralId }) => {
      setCodes(current =>
        current.map(code =>
          code.id === referralId
            ? { ...code, currentUses: code.currentUses + 1 }
            : code
        )
      );
      fetchStats();
    });

    socket.on('referral:expired', ({ codeId }) => {
      setCodes(current =>
        current.map(code =>
          code.id === codeId
            ? { ...code, status: 'EXPIRED' }
            : code
        )
      );
    });

    socket.on('rewards:claimed', () => {
      Promise.all([fetchStats(), fetchProgram()]);
    });

    return () => {
      socket.off('referral:used');
      socket.off('referral:expired');
      socket.off('rewards:claimed');
    };
  }, []);

  return {
    program,
    stats,
    codes,
    loading,
    error,
    generateCode,
    useCode,
    claimRewards,
    refreshData
  };
}