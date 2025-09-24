'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity, 
  Settings, 
  X, 
  Eye, 
  EyeOff,
  Ban,
  Kick,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { 
  SecurityEvent, 
  AntiCheatRule, 
  SecurityConfig, 
  PlayerSecurityProfile,
  SecurityAlert,
  SecurityStats
} from '@/types/security';
import { securityService } from '@/services/SecurityService';

interface SecurityDashboardProps {
  isVisible: boolean;
  onToggle: () => void;
  userId: string;
}

export default function SecurityDashboard({ isVisible, onToggle, userId }: SecurityDashboardProps) {
  const [config, setConfig] = useState<SecurityConfig | null>(null);
  const [rules, setRules] = useState<AntiCheatRule[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'alerts' | 'rules' | 'players'>('overview');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isVisible) {
      initializeSecurity();
    }
  }, [isVisible]);

  const initializeSecurity = async () => {
    try {
      await securityService.initialize();
      setConfig(securityService.getConfig());
      setRules(securityService.getRules());
      setEvents(securityService.getEvents());
      setAlerts(securityService.getAlerts());
      setStats(securityService.getStats());
    } catch (error) {
      console.error('Failed to initialize security dashboard:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400';
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400';
    }
  };

  const getTrustLevelColor = (trustLevel: string) => {
    switch (trustLevel) {
      case 'trusted': return 'text-green-400 bg-green-400/10';
      case 'normal': return 'text-blue-400 bg-blue-400/10';
      case 'suspicious': return 'text-yellow-400 bg-yellow-400/10';
      case 'banned': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-white font-bold text-xl">{stats?.totalEvents || 0}</div>
              <div className="text-slate-400 text-sm">Total Events</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-white font-bold text-xl">{stats?.activeWarnings || 0}</div>
              <div className="text-slate-400 text-sm">Active Alerts</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Ban className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-white font-bold text-xl">{stats?.activeBans || 0}</div>
              <div className="text-slate-400 text-sm">Active Bans</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-white font-bold text-xl">{rules.length}</div>
              <div className="text-slate-400 text-sm">Active Rules</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-slate-700/50 p-6 rounded-lg">
        <h3 className="text-white font-medium text-lg mb-4">Recent Security Events</h3>
        <div className="space-y-3">
          {events.slice(-5).map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-slate-800 rounded">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  event.severity === 'critical' ? 'bg-red-400' :
                  event.severity === 'high' ? 'bg-orange-400' :
                  event.severity === 'medium' ? 'bg-yellow-400' :
                  'bg-green-400'
                }`} />
                <div>
                  <div className="text-white text-sm font-medium">{event.description}</div>
                  <div className="text-slate-400 text-xs">User: {event.userId}</div>
                </div>
              </div>
              <div className="text-slate-400 text-xs">
                {formatTime(event.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                event.severity === 'critical' ? 'bg-red-400' :
                event.severity === 'high' ? 'bg-orange-400' :
                event.severity === 'medium' ? 'bg-yellow-400' :
                'bg-green-400'
              }`} />
              <div>
                <h4 className="text-white font-medium">{event.description}</h4>
                <p className="text-slate-400 text-sm">User: {event.userId}</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs border ${getSeverityColor(event.severity)}`}>
              {event.severity}
            </div>
          </div>
          <div className="text-slate-300 text-sm mb-2">
            {JSON.stringify(event.data, null, 2)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Type: {event.type}</span>
            <span>{formatTime(event.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.id} className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-yellow-400">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <div>
                <h4 className="text-white font-medium">{alert.message}</h4>
                <p className="text-slate-400 text-sm">User: {alert.userId}</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs border ${getSeverityColor(alert.severity)}`}>
              {alert.severity}
            </div>
          </div>
          <div className="text-slate-300 text-sm mb-2">
            {JSON.stringify(alert.data, null, 2)}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                Acknowledge
              </button>
              <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
                Resolve
              </button>
            </div>
            <span className="text-xs text-slate-400">{formatTime(alert.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRules = () => (
    <div className="space-y-4">
      {rules.map((rule) => (
        <div key={rule.id} className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-white font-medium">{rule.name}</h4>
              <p className="text-slate-400 text-sm">{rule.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => securityService.updateRule(rule.id, { enabled: !rule.enabled })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  rule.enabled ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  rule.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Type:</span>
              <span className="text-white ml-2 capitalize">{rule.type}</span>
            </div>
            <div>
              <span className="text-slate-400">Severity:</span>
              <span className="text-white ml-2 capitalize">{rule.severity}</span>
            </div>
            <div>
              <span className="text-slate-400">Threshold:</span>
              <span className="text-white ml-2">{rule.conditions.threshold}</span>
            </div>
            <div>
              <span className="text-slate-400">Time Window:</span>
              <span className="text-white ml-2">{rule.conditions.timeWindow}s</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-700/50 p-6 rounded-lg">
        <h3 className="text-white font-medium text-lg mb-4">Security Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Enable Security</div>
              <div className="text-slate-400 text-sm">Master security system toggle</div>
            </div>
            <button
              onClick={() => securityService.updateConfig({ enabled: !config?.enabled })}
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
              <div className="text-white font-medium">Strict Mode</div>
              <div className="text-slate-400 text-sm">More aggressive security measures</div>
            </div>
            <button
              onClick={() => securityService.updateConfig({ strictMode: !config?.strictMode })}
              className={`w-12 h-6 rounded-full transition-colors ${
                config?.strictMode ? 'bg-red-500' : 'bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config?.strictMode ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Auto Kick</div>
              <div className="text-slate-400 text-sm">Automatically kick players for violations</div>
            </div>
            <button
              onClick={() => securityService.updateConfig({ autoKick: !config?.autoKick })}
              className={`w-12 h-6 rounded-full transition-colors ${
                config?.autoKick ? 'bg-yellow-500' : 'bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config?.autoKick ? 'translate-x-6' : 'translate-x-0.5'
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
            <Shield className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-xl font-bold">Security Dashboard</h2>
            <div className="flex items-center gap-1 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Tabs */}
        <div className="bg-slate-700/50 p-4 border-b border-slate-600">
          <div className="flex gap-2">
            {['overview', 'events', 'alerts', 'rules', 'players'].map((tab) => (
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
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'events' && renderEvents()}
          {activeTab === 'alerts' && renderAlerts()}
          {activeTab === 'rules' && renderRules()}
          {activeTab === 'players' && (
            <div className="text-center text-slate-400">
              Player management coming soon...
            </div>
          )}
          {showSettings && renderSettings()}
        </div>
      </div>
    </div>
  );
}
