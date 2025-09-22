'use client';

import { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Star, TrendingUp, Users, Zap, Target, Award, Calendar } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  score: number;
  level: number;
  guild?: string;
  achievements: number;
  gamesPlayed: number;
  winRate: number;
  lastActive: Date;
  isOnline: boolean;
  badges: string[];
}

interface LeaderboardProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function Leaderboard({ isVisible, onToggle }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'weekly' | 'monthly' | 'guilds'>('overall');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'week' | 'month' | 'year'>('all');

  useEffect(() => {
    if (isVisible) {
      loadLeaderboard();
    }
  }, [isVisible, selectedCategory, selectedTimeframe]);

  const loadLeaderboard = () => {
    // Mock data for demonstration
    const mockData: LeaderboardEntry[] = [
      {
        id: '1',
        rank: 1,
        username: 'CryptoKing',
        avatar: '👑',
        score: 125000,
        level: 45,
        guild: 'Crypto Warriors',
        achievements: 28,
        gamesPlayed: 156,
        winRate: 87.5,
        lastActive: new Date(),
        isOnline: true,
        badges: ['legendary', 'trader', 'explorer']
      },
      {
        id: '2',
        rank: 2,
        username: 'FlowMaster',
        avatar: '⚡',
        score: 118000,
        level: 42,
        guild: 'Flow Explorers',
        achievements: 25,
        gamesPlayed: 142,
        winRate: 82.3,
        lastActive: new Date(Date.now() - 30 * 60 * 1000),
        isOnline: true,
        badges: ['epic', 'trader', 'social']
      },
      {
        id: '3',
        rank: 3,
        username: 'NFTCollector',
        avatar: '🎨',
        score: 112000,
        level: 40,
        guild: 'Art Collectors',
        achievements: 22,
        gamesPlayed: 138,
        winRate: 79.1,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isOnline: false,
        badges: ['rare', 'collector', 'creative']
      },
      {
        id: '4',
        rank: 4,
        username: 'BlockchainHero',
        avatar: '🦸',
        score: 108000,
        level: 38,
        guild: 'DeFi Masters',
        achievements: 20,
        gamesPlayed: 134,
        winRate: 76.8,
        lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isOnline: false,
        badges: ['epic', 'defi', 'hero']
      },
      {
        id: '5',
        rank: 5,
        username: 'GameMaster',
        avatar: '🎮',
        score: 105000,
        level: 37,
        guild: 'Gaming Legends',
        achievements: 18,
        gamesPlayed: 129,
        winRate: 74.2,
        lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isOnline: false,
        badges: ['rare', 'gamer', 'strategist']
      }
    ];

    setLeaderboard(mockData);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-400" />;
      default: return <span className="text-slate-400 font-bold text-lg">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'border-yellow-400 bg-yellow-400/10';
      case 2: return 'border-gray-400 bg-gray-400/10';
      case 3: return 'border-orange-400 bg-orange-400/10';
      default: return 'border-slate-600 bg-slate-700/50';
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'legendary': return 'bg-yellow-500 text-yellow-900';
      case 'epic': return 'bg-purple-500 text-purple-900';
      case 'rare': return 'bg-blue-500 text-blue-900';
      case 'trader': return 'bg-green-500 text-green-900';
      case 'explorer': return 'bg-orange-500 text-orange-900';
      case 'social': return 'bg-pink-500 text-pink-900';
      case 'collector': return 'bg-indigo-500 text-indigo-900';
      case 'creative': return 'bg-rose-500 text-rose-900';
      case 'defi': return 'bg-cyan-500 text-cyan-900';
      case 'hero': return 'bg-red-500 text-red-900';
      case 'gamer': return 'bg-violet-500 text-violet-900';
      case 'strategist': return 'bg-emerald-500 text-emerald-900';
      default: return 'bg-slate-500 text-slate-900';
    }
  };

  const formatScore = (score: number) => {
    if (score >= 1000000) {
      return (score / 1000000).toFixed(1) + 'M';
    } else if (score >= 1000) {
      return (score / 1000).toFixed(1) + 'K';
    }
    return score.toString();
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-white text-2xl font-bold">Leaderboard</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-600 px-3 py-1 rounded">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">{leaderboard.length} Players</span>
              </div>
              <button
                onClick={onToggle}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 bg-slate-600 rounded-lg p-1">
            {[
              { id: 'overall', label: 'Overall', icon: <Trophy className="w-4 h-4" /> },
              { id: 'weekly', label: 'Weekly', icon: <Calendar className="w-4 h-4" /> },
              { id: 'monthly', label: 'Monthly', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'guilds', label: 'Guilds', icon: <Users className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-500'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-96">
          {/* Leaderboard List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border-2 transition-all ${getRankColor(entry.rank)} ${
                    entry.isOnline ? 'ring-2 ring-green-400/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar and Username */}
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{entry.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold text-lg">{entry.username}</h3>
                          {entry.isOnline && (
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          )}
                        </div>
                        <div className="text-slate-400 text-sm">
                          Level {entry.level} • {entry.guild && `Guild: ${entry.guild}`}
                        </div>
                      </div>
                    </div>

                    {/* Score and Stats */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-yellow-400 font-bold text-lg">{formatScore(entry.score)}</div>
                        <div className="text-slate-400 text-xs">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 font-bold text-lg">{entry.achievements}</div>
                        <div className="text-slate-400 text-xs">Achievements</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-bold text-lg">{entry.winRate}%</div>
                        <div className="text-slate-400 text-xs">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-400 font-bold text-lg">{entry.gamesPlayed}</div>
                        <div className="text-slate-400 text-xs">Games</div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1">
                      {entry.badges.map((badge, badgeIndex) => (
                        <span
                          key={badgeIndex}
                          className={`px-2 py-1 rounded text-xs font-medium ${getBadgeColor(badge)}`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>

                    {/* Last Active */}
                    <div className="text-right">
                      <div className="text-slate-400 text-sm">
                        {entry.isOnline ? 'Online' : formatLastActive(entry.lastActive)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-2">No leaderboard data</div>
                <div className="text-slate-500 text-sm">
                  Play more games to appear on the leaderboard
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-700/50 p-4 border-t border-slate-600">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              Compete with players worldwide and climb the leaderboard!
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors">
                My Rank
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
