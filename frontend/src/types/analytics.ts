export interface PlayerAnalytics {
  userId: string;
  username: string;
  totalPlayTime: number;
  sessionsPlayed: number;
  averageSessionDuration: number;
  totalDistance: number;
  totalScore: number;
  highScore: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  favoriteGameMode: string;
  achievementsUnlocked: number;
  totalAchievements: number;
  socialInteractions: number;
  friendsCount: number;
  guildMemberships: number;
  tradingVolume: number;
  tokensEarned: number;
  tokensSpent: number;
  nftsOwned: number;
  questsCompleted: number;
  voiceCommandsUsed: number;
  lastActive: Date;
  joinDate: Date;
  level: number;
  experience: number;
  rank: number;
}

export interface GameSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  gameMode: string;
  score: number;
  distance: number;
  interactions: number;
  achievements: string[];
  location: string;
  device: string;
  platform: string;
}

export interface PerformanceMetrics {
  averageFPS: number;
  averageLatency: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  renderTime: number;
  loadTime: number;
  crashCount: number;
  errorCount: number;
}

export interface UserBehavior {
  userId: string;
  mostActiveHours: number[];
  mostActiveDays: string[];
  preferredGameModes: string[];
  averageSessionLength: number;
  retentionRate: number;
  churnRisk: 'low' | 'medium' | 'high';
  engagementScore: number;
  socialActivity: number;
  spendingBehavior: 'low' | 'medium' | 'high';
  devicePreferences: string[];
  platformUsage: { [platform: string]: number };
}

export interface AnalyticsReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    averageSessionDuration: number;
    totalPlayTime: number;
    totalRevenue: number;
    averageRevenuePerUser: number;
    retentionRate: number;
    churnRate: number;
  };
  charts: AnalyticsChart[];
  insights: string[];
  recommendations: string[];
  generatedAt: Date;
  generatedBy: string;
}

export interface AnalyticsChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  description: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  color: string;
  options?: any;
}

export interface RealTimeMetrics {
  onlineUsers: number;
  activeGames: number;
  currentRevenue: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  lastUpdated: Date;
}

export interface CohortAnalysis {
  cohort: string;
  period: string;
  size: number;
  retention: { [period: string]: number };
  revenue: { [period: string]: number };
  engagement: { [period: string]: number };
}

export interface FunnelAnalysis {
  name: string;
  steps: FunnelStep[];
  conversionRates: { [step: string]: number };
  dropOffPoints: { [step: string]: number };
  totalConversions: number;
  averageTimeToConvert: number;
}

export interface FunnelStep {
  name: string;
  users: number;
  conversions: number;
  conversionRate: number;
  averageTime: number;
}

export interface A/BTestResult {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'completed' | 'paused';
  variants: ABTestVariant[];
  metrics: {
    primary: string;
    secondary: string[];
  };
  results: {
    winner: string;
    confidence: number;
    significance: number;
    improvement: number;
  };
  startDate: Date;
  endDate?: Date;
}

export interface ABTestVariant {
  name: string;
  users: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  averageRevenuePerUser: number;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text';
  title: string;
  data: any;
  position: { x: number; y: number; w: number; h: number };
  config: any;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
  padding: number;
}

export const ANALYTICS_METRICS = [
  {
    id: 'users',
    name: 'Users',
    description: 'User-related metrics',
    icon: '👥',
    metrics: ['totalUsers', 'activeUsers', 'newUsers', 'returningUsers']
  },
  {
    id: 'engagement',
    name: 'Engagement',
    description: 'User engagement metrics',
    icon: '📊',
    metrics: ['sessionDuration', 'playTime', 'retentionRate', 'churnRate']
  },
  {
    id: 'revenue',
    name: 'Revenue',
    description: 'Financial metrics',
    icon: '💰',
    metrics: ['totalRevenue', 'arpu', 'ltv', 'conversionRate']
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Technical performance metrics',
    icon: '⚡',
    metrics: ['fps', 'latency', 'memoryUsage', 'errorRate']
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Social interaction metrics',
    icon: '🤝',
    metrics: ['friendsCount', 'guildMemberships', 'socialInteractions']
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Game-specific metrics',
    icon: '🎮',
    metrics: ['gamesPlayed', 'winRate', 'achievements', 'questsCompleted']
  }
];

export const CHART_TYPES = [
  { id: 'line', name: 'Line Chart', icon: '📈' },
  { id: 'bar', name: 'Bar Chart', icon: '📊' },
  { id: 'pie', name: 'Pie Chart', icon: '🥧' },
  { id: 'area', name: 'Area Chart', icon: '📉' },
  { id: 'scatter', name: 'Scatter Plot', icon: '⚪' }
];
