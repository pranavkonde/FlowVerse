'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Trophy, Target, Activity, Zap } from 'lucide-react';

interface AnalyticsData {
  totalPlayTime: number;
  gamesPlayed: number;
  achievementsUnlocked: number;
  friendsMade: number;
  distanceTraveled: number;
  messagesSent: number;
  tradesCompleted: number;
  roomsVisited: number;
  weeklyStats: {
    playTime: number[];
    gamesPlayed: number[];
    achievements: number[];
  };
  topAchievements: Array<{
    id: string;
    name: string;
    unlockedAt: Date;
    points: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
    points: number;
  }>;
}

interface AnalyticsDashboardProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function AnalyticsDashboard({ isVisible, onToggle }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = () => {
    // Mock data - in real app, this would come from the backend
    const mockData: AnalyticsData = {
      totalPlayTime: 1250, // minutes
      gamesPlayed: 45,
      achievementsUnlocked: 12,
      friendsMade: 8,
      distanceTraveled: 15420, // steps
      messagesSent: 156,
      tradesCompleted: 23,
      roomsVisited: 15,
      weeklyStats: {
        playTime: [120, 180, 90, 200, 150, 220, 140],
        gamesPlayed: [3, 5, 2, 6, 4, 7, 3],
        achievements: [1, 2, 0, 3, 1, 2, 1]
      },
      topAchievements: [
        { id: 'explorer', name: 'Explorer', unlockedAt: new Date(), points: 100 },
        { id: 'social_butterfly', name: 'Social Butterfly', unlockedAt: new Date(), points: 75 },
        { id: 'first_trade', name: 'First Trade', unlockedAt: new Date(), points: 50 }
      ],
      recentActivity: [
        { type: 'achievement', description: 'Unlocked "Explorer" achievement', timestamp: new Date(), points: 100 },
        { type: 'game', description: 'Completed Treasure Hunt mode', timestamp: new Date(), points: 500 },
        { type: 'social', description: 'Made a new friend', timestamp: new Date(), points: 20 },
        { type: 'trade', description: 'Completed FLOW to WFLOW swap', timestamp: new Date(), points: 50 }
      ]
    };
    
    setAnalyticsData(mockData);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  if (!isVisible || !analyticsData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <h2 className="text-white text-2xl font-bold">Analytics Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'all')}
                className="bg-slate-600 text-white px-3 py-1 rounded text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={onToggle}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300 text-sm">Play Time</span>
              </div>
              <div className="text-white text-2xl font-bold">
                {formatTime(analyticsData.totalPlayTime)}
              </div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-slate-300 text-sm">Games Played</span>
              </div>
              <div className="text-white text-2xl font-bold">
                {analyticsData.gamesPlayed}
              </div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-slate-300 text-sm">Achievements</span>
              </div>
              <div className="text-white text-2xl font-bold">
                {analyticsData.achievementsUnlocked}
              </div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300 text-sm">Friends</span>
              </div>
              <div className="text-white text-2xl font-bold">
                {analyticsData.friendsMade}
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-700/50 p-6 rounded-lg">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Activity Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Distance Traveled</span>
                  <span className="text-white font-medium">
                    {formatNumber(analyticsData.distanceTraveled)} steps
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Messages Sent</span>
                  <span className="text-white font-medium">
                    {analyticsData.messagesSent}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Trades Completed</span>
                  <span className="text-white font-medium">
                    {analyticsData.tradesCompleted}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Rooms Visited</span>
                  <span className="text-white font-medium">
                    {analyticsData.roomsVisited}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 p-6 rounded-lg">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Weekly Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Play Time</span>
                    <span className="text-white">
                      {analyticsData.weeklyStats.playTime.reduce((a, b) => a + b, 0)}m
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Games Played</span>
                    <span className="text-white">
                      {analyticsData.weeklyStats.gamesPlayed.reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Achievements</span>
                    <span className="text-white">
                      {analyticsData.weeklyStats.achievements.reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Top Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-700/50 p-6 rounded-lg">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-slate-600/50 rounded">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <div className="flex-1">
                      <div className="text-white text-sm">{activity.description}</div>
                      <div className="text-slate-400 text-xs">
                        {activity.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-yellow-400 text-sm font-medium">
                      +{activity.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-700/50 p-6 rounded-lg">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top Achievements
              </h3>
              <div className="space-y-3">
                {analyticsData.topAchievements.map((achievement, index) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-2 bg-slate-600/50 rounded">
                    <div className="text-2xl">🏆</div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{achievement.name}</div>
                      <div className="text-slate-400 text-xs">
                        Unlocked {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-yellow-400 text-sm font-medium">
                      {achievement.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
