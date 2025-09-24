'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Settings, 
  X, 
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  AnalyticsDashboard,
  AnalyticsConfig,
  PerformanceMetric
} from '@/types/analytics';
import { analyticsService } from '@/services/AnalyticsService';

interface AnalyticsDashboardProps {
  isVisible: boolean;
  onToggle: () => void;
  userId: string;
}

export default function AnalyticsDashboard({ isVisible, onToggle, userId }: AnalyticsDashboardProps) {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [config, setConfig] = useState<AnalyticsConfig | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'users' | 'insights'>('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      initializeAnalytics();
    }
  }, [isVisible, timeRange]);

  const initializeAnalytics = async () => {
    try {
      setIsLoading(true);
      await analyticsService.initialize();
      setConfig(analyticsService.getConfig());
      setMetrics(analyticsService.getMetrics());
      setDashboard(analyticsService.getDashboard(timeRange));
    } catch (error) {
      console.error('Failed to initialize analytics dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    initializeAnalytics();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-400/10';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10';
      case 'critical': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-white font-bold text-xl">{formatNumber(dashboard?.metrics.totalUsers || 0)}</div>
              <div className="text-slate-400 text-sm">Total Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-white font-bold text-xl">{formatNumber(dashboard?.metrics.activeUsers || 0)}</div>
              <div className="text-slate-400 text-sm">Active Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-white font-bold text-xl">{Math.round((dashboard?.metrics.averageSessionTime || 0) / 60)}m</div>
              <div className="text-slate-400 text-sm">Avg Session</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            <div>
              <div className="text-white font-bold text-xl">{dashboard?.metrics.retentionRate || 0}%</div>
              <div className="text-slate-400 text-sm">Retention</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="bg-slate-700/50 p-6 rounded-lg">
          <h3 className="text-white font-medium text-lg mb-4">User Activity (24h)</h3>
          <div className="space-y-2">
            {dashboard?.charts.userActivity.slice(-6).map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">{data.time}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{ width: `${(data.users / Math.max(...dashboard.charts.userActivity.map(d => d.users))) * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-sm w-8">{data.users}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-slate-700/50 p-6 rounded-lg">
          <h3 className="text-white font-medium text-lg mb-4">Performance Metrics</h3>
          <div className="space-y-2">
            {dashboard?.charts.performance.slice(-6).map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">{data.time}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white text-sm">{data.fps} FPS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white text-sm">{data.latency}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Areas */}
      <div className="bg-slate-700/50 p-6 rounded-lg">
        <h3 className="text-white font-medium text-lg mb-4">Popular Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboard?.charts.popularAreas.slice(0, 6).map((area, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded">
              <span className="text-white text-sm">{area.area}</span>
              <span className="text-slate-400 text-sm">{area.visits} visits</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-white font-bold text-xl">
                {Math.round(metrics.filter(m => m.type === 'fps').reduce((sum, m) => sum + m.value, 0) / metrics.filter(m => m.type === 'fps').length) || 0}
              </div>
              <div className="text-slate-400 text-sm">Avg FPS</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-white font-bold text-xl">
                {Math.round(metrics.filter(m => m.type === 'latency').reduce((sum, m) => sum + m.value, 0) / metrics.filter(m => m.type === 'latency').length) || 0}ms
              </div>
              <div className="text-slate-400 text-sm">Avg Latency</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-white font-bold text-xl">
                {Math.round(metrics.filter(m => m.type === 'memory').reduce((sum, m) => sum + m.value, 0) / metrics.filter(m => m.type === 'memory').length) || 0}MB
              </div>
              <div className="text-slate-400 text-sm">Avg Memory</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-slate-700/50 p-6 rounded-lg">
        <h3 className="text-white font-medium text-lg mb-4">Performance Over Time</h3>
        <div className="space-y-3">
          {metrics.slice(-10).map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  metric.type === 'fps' ? 'bg-green-400' :
                  metric.type === 'latency' ? 'bg-blue-400' :
                  metric.type === 'memory' ? 'bg-purple-400' :
                  'bg-gray-400'
                }`} />
                <span className="text-white text-sm capitalize">{metric.type}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">{metric.value}</span>
                <span className="text-slate-400 text-sm">{metric.unit}</span>
                <span className="text-slate-400 text-xs">
                  {metric.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-4">
      {dashboard?.insights.map((insight, index) => (
        <div key={index} className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
              <h4 className="text-white font-medium">{insight.title}</h4>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs border ${
              insight.impact === 'high' ? 'border-red-400 text-red-400 bg-red-400/10' :
              insight.impact === 'medium' ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' :
              'border-green-400 text-green-400 bg-green-400/10'
            }`}>
              {insight.impact}
            </div>
          </div>
          <p className="text-slate-300 text-sm mb-2">{insight.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs capitalize">{insight.type}</span>
            <span className="text-slate-400 text-xs">
              {insight.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-700/50 p-6 rounded-lg">
        <h3 className="text-white font-medium text-lg mb-4">Analytics Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Enable Analytics</div>
              <div className="text-slate-400 text-sm">Master analytics tracking toggle</div>
            </div>
            <button
              onClick={() => analyticsService.updateConfig({ enabled: !config?.enabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
                config?.enabled ? 'bg-green-500' : 'bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config?.enabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Performance Monitoring</div>
              <div className="text-slate-400 text-sm">Track FPS, memory, and latency</div>
            </div>
            <button
              onClick={() => analyticsService.updateConfig({ performanceMonitoring: !config?.performanceMonitoring })}
              className={`w-12 h-6 rounded-full transition-colors ${
                config?.performanceMonitoring ? 'bg-blue-500' : 'bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config?.performanceMonitoring ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">User Behavior Tracking</div>
              <div className="text-slate-400 text-sm">Track user actions and patterns</div>
            </div>
            <button
              onClick={() => analyticsService.updateConfig({ userBehaviorTracking: !config?.userBehaviorTracking })}
              className={`w-12 h-6 rounded-full transition-colors ${
                config?.userBehaviorTracking ? 'bg-purple-500' : 'bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config?.userBehaviorTracking ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-xl font-bold">Analytics Dashboard</h2>
            <div className="flex items-center gap-1 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-slate-400 hover:text-white transition-colors p-2 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-400 hover:text-white transition-colors p-2"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="bg-slate-700/50 p-4 border-b border-slate-600">
          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm">Time Range:</span>
            <div className="flex gap-2">
              {['1h', '24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    timeRange === range 
                      ? 'bg-blue-500 text-white' 
                      : 'text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-700/50 p-4 border-b border-slate-600">
          <div className="flex gap-2">
            {['overview', 'performance', 'users', 'insights'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-400">Loading analytics data...</div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'performance' && renderPerformance()}
              {activeTab === 'users' && (
                <div className="text-center text-slate-400">
                  User analytics coming soon...
                </div>
              )}
              {activeTab === 'insights' && renderInsights()}
              {showSettings && renderSettings()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}