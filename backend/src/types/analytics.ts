export interface AnalyticsEvent {
  id: string;
  type: 'user_action' | 'performance' | 'error' | 'custom';
  category: string;
  action: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  data: any;
  metadata: {
    userAgent?: string;
    platform?: string;
    version?: string;
    location?: {
      x: number;
      y: number;
      area: string;
    };
  };
}

export interface PerformanceMetric {
  id: string;
  type: 'fps' | 'latency' | 'memory' | 'cpu' | 'network';
  value: number;
  unit: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  metadata: {
    device?: string;
    browser?: string;
    connection?: string;
  };
}

export interface UserBehavior {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  totalPlayTime: number;
  actions: {
    movement: number;
    chat: number;
    trade: number;
    quest: number;
    miniGame: number;
    npcInteraction: number;
  };
  locations: Array<{
    area: string;
    timeSpent: number;
    visitCount: number;
  }>;
  preferences: {
    favoriteAreas: string[];
    commonActions: string[];
    playStyle: 'explorer' | 'social' | 'competitive' | 'casual';
  };
}

export interface SystemHealth {
  timestamp: Date;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    serverLoad: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
    responseTime: number;
    errorRate: number;
  };
  alerts: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
  }>;
}

export interface AnalyticsDashboard {
  timeRange: '1h' | '24h' | '7d' | '30d';
  metrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    retentionRate: number;
    averageSessionTime: number;
    totalSessions: number;
  };
  charts: {
    userActivity: Array<{ time: string; users: number }>;
    performance: Array<{ time: string; fps: number; latency: number }>;
    popularAreas: Array<{ area: string; visits: number }>;
    actionDistribution: Array<{ action: string; count: number }>;
  };
  insights: Array<{
    type: 'trend' | 'anomaly' | 'recommendation';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    timestamp: Date;
  }>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingLevel: 'minimal' | 'standard' | 'detailed';
  dataRetention: number;
  realTimeUpdates: boolean;
  performanceMonitoring: boolean;
  userBehaviorTracking: boolean;
  errorTracking: boolean;
  customEvents: boolean;
}
