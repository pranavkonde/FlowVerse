'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Clock, Zap, AlertTriangle, CheckCircle, RefreshCw, Download, Filter, Calendar } from 'lucide-react';
import { PlayerAnalytics, RealTimeMetrics, AnalyticsReport, PerformanceMetrics } from '@/types/analytics';
import { analyticsService } from '@/services/AnalyticsService';

interface AdvancedAnalyticsProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function AdvancedAnalytics({ isVisible, onToggle }: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'performance' | 'reports'>('overview');
  const [playerAnalytics, setPlayerAnalytics] = useState<PlayerAnalytics[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      analyticsService.updateRealTimeMetrics();
      setRealTimeMetrics(analyticsService.getRealTimeMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setPlayerAnalytics(analyticsService.getAllPlayerAnalytics());
    setRealTimeMetrics(analyticsService.getRealTimeMetrics());
    setPerformanceMetrics(analyticsService.getAveragePerformanceMetrics());
    setReports(analyticsService.getReports());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    loadData();
    setIsRefreshing(false);
  };

  const generateReport = () => {
    const report = analyticsService.generateReport(selectedPeriod);
    setReports(analyticsService.getReports());
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400 bg-green-400/10 border-green-400';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400';
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-slate-400">Live</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(realTimeMetrics.onlineUsers)}</div>
            <div className="text-sm text-slate-400">Online Users</div>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-green-400" />
              <span className="text-xs text-slate-400">Live</span>
            </div>
            <div className="text-2xl font-bold text-white">{realTimeMetrics.activeGames}</div>
            <div className="text-sm text-slate-400">Active Games</div>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-yellow-400" />
              <span className="text-xs text-slate-400">Live</span>
            </div>
            <div className="text-2xl font-bold text-white">${formatNumber(realTimeMetrics.currentRevenue)}</div>
            <div className="text-sm text-slate-400">Current Revenue</div>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              {getHealthIcon(realTimeMetrics.systemHealth)}
              <span className="text-xs text-slate-400">Live</span>
            </div>
            <div className={`text-2xl font-bold capitalize ${getHealthColor(realTimeMetrics.systemHealth).split(' ')[0]}`}>
              {realTimeMetrics.systemHealth}
            </div>
            <div className="text-sm text-slate-400">System Health</div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="bg-slate-700/50 p-6 rounded-lg">
          <h3 className="text-white font-medium text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{performanceMetrics.averageFPS.toFixed(1)}</div>
              <div className="text-sm text-slate-400">Avg FPS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{performanceMetrics.averageLatency.toFixed(0)}ms</div>
              <div className="text-sm text-slate-400">Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{performanceMetrics.memoryUsage.toFixed(0)}MB</div>
              <div className="text-sm text-slate-400">Memory</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{performanceMetrics.cpuUsage.toFixed(0)}%</div>
              <div className="text-sm text-slate-400">CPU Usage</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Players */}
      <div className="bg-slate-700/50 p-6 rounded-lg">
        <h3 className="text-white font-medium text-lg mb-4">Top Players</h3>
        <div className="space-y-3">
          {playerAnalytics
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 5)
            .map((player, index) => (
              <div key={player.userId} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{player.username}</div>
                    <div className="text-sm text-slate-400">Level {player.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{formatNumber(player.totalScore)}</div>
                  <div className="text-sm text-slate-400">Total Score</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderPlayers = () => (
    <div className="space-y-6">
      <div className="bg-slate-700/50 p-6 rounded-lg">
        <h3 className="text-white font-medium text-lg mb-4">Player Analytics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left text-slate-300 py-3">Player</th>
                <th className="text-left text-slate-300 py-3">Level</th>
                <th className="text-left text-slate-300 py-3">Total Score</th>
                <th className="text-left text-slate-300 py-3">Play Time</th>
                <th className="text-left text-slate-300 py-3">Sessions</th>
                <th className="text-left text-slate-300 py-3">Win Rate</th>
                <th className="text-left text-slate-300 py-3">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {playerAnalytics.map((player) => (
                <tr key={player.userId} className="border-b border-slate-700/50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {player.username.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{player.username}</div>
                        <div className="text-sm text-slate-400">ID: {player.userId.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-white">{player.level}</td>
                  <td className="py-3 text-white">{formatNumber(player.totalScore)}</td>
                  <td className="py-3 text-white">{formatDuration(player.totalPlayTime)}</td>
                  <td className="py-3 text-white">{player.sessionsPlayed}</td>
                  <td className="py-3 text-white">{(player.winRate * 100).toFixed(1)}%</td>
                  <td className="py-3 text-slate-400">{new Date(player.lastActive).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="bg-slate-700/50 p-6 rounded-lg">
        <h3 className="text-white font-medium text-lg mb-4">System Performance</h3>
        {performanceMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Average FPS</span>
                <span className="text-white font-bold">{performanceMetrics.averageFPS.toFixed(1)}</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (performanceMetrics.averageFPS / 60) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">Average Latency</span>
                <span className="text-white font-bold">{performanceMetrics.averageLatency.toFixed(0)}ms</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (performanceMetrics.averageLatency / 100) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">Memory Usage</span>
                <span className="text-white font-bold">{performanceMetrics.memoryUsage.toFixed(0)}MB</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (performanceMetrics.memoryUsage / 1024) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">CPU Usage</span>
                <span className="text-white font-bold">{performanceMetrics.cpuUsage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${performanceMetrics.cpuUsage}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">Network Latency</span>
                <span className="text-white font-bold">{performanceMetrics.networkLatency.toFixed(0)}ms</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (performanceMetrics.networkLatency / 50) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">Error Rate</span>
                <span className="text-white font-bold">{performanceMetrics.errorCount.toFixed(1)}</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, performanceMetrics.errorCount * 10)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-slate-700/50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium text-lg">Analytics Reports</h3>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              onClick={generateReport}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-slate-800 p-4 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{report.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </span>
                  <button className="text-blue-400 hover:text-blue-300">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-3">
                Period: {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">Total Users</div>
                  <div className="text-white font-bold">{formatNumber(report.metrics.totalUsers)}</div>
                </div>
                <div>
                  <div className="text-slate-400">Active Users</div>
                  <div className="text-white font-bold">{formatNumber(report.metrics.activeUsers)}</div>
                </div>
                <div>
                  <div className="text-slate-400">Avg Session</div>
                  <div className="text-white font-bold">{formatDuration(report.metrics.averageSessionDuration)}</div>
                </div>
                <div>
                  <div className="text-slate-400">Retention</div>
                  <div className="text-white font-bold">{(report.metrics.retentionRate * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-slate-800 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-xl font-bold">Advanced Analytics</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-slate-400 hover:text-white transition-colors p-2"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-96">
          {/* Sidebar */}
          <div className="w-64 bg-slate-700/50 p-4 border-r border-slate-600">
            <div className="space-y-2">
              {[
                { id: 'overview', name: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
                { id: 'players', name: 'Players', icon: <Users className="w-4 h-4" /> },
                { id: 'performance', name: 'Performance', icon: <Zap className="w-4 h-4" /> },
                { id: 'reports', name: 'Reports', icon: <BarChart3 className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left p-3 rounded transition-colors flex items-center gap-3 ${
                    activeTab === tab.id 
                      ? 'bg-blue-500 text-white' 
                      : 'text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'players' && renderPlayers()}
            {activeTab === 'performance' && renderPerformance()}
            {activeTab === 'reports' && renderReports()}
          </div>
        </div>
      </div>
    </div>
  );
}
