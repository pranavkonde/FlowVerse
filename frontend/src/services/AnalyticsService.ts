import { 
  AnalyticsEvent, 
  PerformanceMetric, 
  UserBehavior, 
  AnalyticsDashboard,
  AnalyticsConfig,
  ANALYTICS_EVENTS,
  AnalyticsEventType,
  DEFAULT_ANALYTICS_CONFIG
} from '@/types/analytics';

export class AnalyticsService {
  private config: AnalyticsConfig;
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private sessionId: string;

  constructor() {
    this.config = { ...DEFAULT_ANALYTICS_CONFIG };
    this.sessionId = this.generateSessionId();
  }

  public async initialize(): Promise<void> {
    try {
      await this.loadConfig();
      this.startPerformanceMonitoring();
      console.log('Analytics Service initialized');
    } catch (error) {
      console.error('Failed to initialize Analytics Service:', error);
    }
  }

  private async loadConfig(): Promise<void> {
    const stored = localStorage.getItem('freeflow_analytics_config');
    if (stored) {
      try {
        this.config = { ...this.config, ...JSON.parse(stored) };
      } catch (error) {
        console.error('Failed to load analytics config:', error);
      }
    }
  }

  private startPerformanceMonitoring(): void {
    if (!this.config.performanceMonitoring) return;

    // Monitor FPS
    let lastTime = performance.now();
    let frameCount = 0;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.recordPerformanceMetric('fps', fps, 'fps');
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    measureFPS();

    // Monitor memory usage
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.recordPerformanceMetric('memory', memory.usedJSHeapSize / 1024 / 1024, 'MB');
      }
    }, 5000);
  }

  public trackEvent(
    type: AnalyticsEventType,
    action: string,
    data: any,
    userId?: string
  ): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type: type.split('_')[0] as any,
      category: type.split('_').slice(1).join('_'),
      action,
      userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      data,
      metadata: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        version: '1.0.0'
      }
    };

    this.events.push(event);
    this.updateUserBehavior(userId, action, data);
    this.cleanupOldEvents();
  }

  public recordPerformanceMetric(
    type: 'fps' | 'latency' | 'memory' | 'cpu' | 'network',
    value: number,
    unit: string,
    userId?: string
  ): void {
    if (!this.config.performanceMonitoring) return;

    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      type,
      value,
      unit,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId,
      metadata: {
        device: navigator.platform,
        browser: this.getBrowserInfo(),
        connection: 'unknown'
      }
    };

    this.metrics.push(metric);
    this.cleanupOldMetrics();
  }

  private updateUserBehavior(userId: string | undefined, action: string, data: any): void {
    if (!userId || !this.config.userBehaviorTracking) return;

    const behavior = this.getUserBehavior(userId);
    
    if (action.includes('movement')) behavior.actions.movement++;
    else if (action.includes('chat')) behavior.actions.chat++;
    else if (action.includes('trade')) behavior.actions.trade++;
    else if (action.includes('quest')) behavior.actions.quest++;
    else if (action.includes('minigame')) behavior.actions.miniGame++;
    else if (action.includes('npc')) behavior.actions.npcInteraction++;

    this.userBehaviors.set(userId, behavior);
  }

  private getUserBehavior(userId: string): UserBehavior {
    if (!this.userBehaviors.has(userId)) {
      const behavior: UserBehavior = {
        userId,
        sessionId: this.sessionId,
        startTime: new Date(),
        totalPlayTime: 0,
        actions: {
          movement: 0,
          chat: 0,
          trade: 0,
          quest: 0,
          miniGame: 0,
          npcInteraction: 0
        },
        locations: [],
        preferences: {
          favoriteAreas: [],
          commonActions: [],
          playStyle: 'casual'
        }
      };
      this.userBehaviors.set(userId, behavior);
    }
    return this.userBehaviors.get(userId)!;
  }

  private cleanupOldEvents(): void {
    const retentionTime = this.config.dataRetention * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionTime;
    this.events = this.events.filter(event => event.timestamp.getTime() > cutoffTime);
  }

  private cleanupOldMetrics(): void {
    const retentionTime = this.config.dataRetention * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionTime;
    this.metrics = this.metrics.filter(metric => metric.timestamp.getTime() > cutoffTime);
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getUserBehavior(userId: string): UserBehavior | undefined {
    return this.userBehaviors.get(userId);
  }

  public getDashboard(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): AnalyticsDashboard {
    const now = Date.now();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const range = timeRanges[timeRange];
    const startTime = now - range;

    const recentEvents = this.events.filter(e => e.timestamp.getTime() > startTime);
    const recentMetrics = this.metrics.filter(m => m.timestamp.getTime() > startTime);

    const uniqueUsers = new Set(recentEvents.map(e => e.userId).filter(Boolean)).size;

    return {
      timeRange,
      metrics: {
        totalUsers: uniqueUsers,
        activeUsers: uniqueUsers,
        newUsers: uniqueUsers,
        retentionRate: 85,
        averageSessionTime: 1800,
        totalSessions: 1
      },
      charts: {
        userActivity: this.generateUserActivityChart(recentEvents),
        performance: this.generatePerformanceChart(recentMetrics),
        popularAreas: this.generatePopularAreasChart(recentEvents),
        actionDistribution: this.generateActionDistributionChart(recentEvents)
      },
      insights: this.generateInsights(recentEvents, recentMetrics)
    };
  }

  private generateUserActivityChart(events: AnalyticsEvent[]): Array<{ time: string; users: number }> {
    const hours = 24;
    const chart = [];
    for (let i = 0; i < hours; i++) {
      const hourStart = Date.now() - (hours - i) * 60 * 60 * 1000;
      const hourEnd = hourStart + 60 * 60 * 1000;
      
      const hourEvents = events.filter(e => 
        e.timestamp.getTime() >= hourStart && e.timestamp.getTime() < hourEnd
      );
      
      const uniqueUsers = new Set(hourEvents.map(e => e.userId).filter(Boolean)).size;
      
      chart.push({
        time: new Date(hourStart).toLocaleTimeString([], { hour: '2-digit' }),
        users: uniqueUsers
      });
    }
    return chart;
  }

  private generatePerformanceChart(metrics: PerformanceMetric[]): Array<{ time: string; fps: number; latency: number }> {
    const fpsMetrics = metrics.filter(m => m.type === 'fps');
    return fpsMetrics.map(fps => ({
      time: fps.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fps: fps.value,
      latency: 0
    }));
  }

  private generatePopularAreasChart(events: AnalyticsEvent[]): Array<{ area: string; visits: number }> {
    const areaCounts: Record<string, number> = {};
    
    events.forEach(event => {
      if (event.data.location?.area) {
        areaCounts[event.data.location.area] = (areaCounts[event.data.location.area] || 0) + 1;
      }
    });
    
    return Object.entries(areaCounts)
      .map(([area, visits]) => ({ area, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  }

  private generateActionDistributionChart(events: AnalyticsEvent[]): Array<{ action: string; count: number }> {
    const actionCounts: Record<string, number> = {};
    
    events.forEach(event => {
      actionCounts[event.action] = (actionCounts[event.action] || 0) + 1;
    });
    
    return Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private generateInsights(events: AnalyticsEvent[], metrics: PerformanceMetric[]): Array<{
    type: 'trend' | 'anomaly' | 'recommendation';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    timestamp: Date;
  }> {
    const insights = [];

    const avgFPS = metrics.filter(m => m.type === 'fps').reduce((sum, m) => sum + m.value, 0) / metrics.length;
    if (avgFPS < 30) {
      insights.push({
        type: 'anomaly' as const,
        title: 'Low FPS Detected',
        description: `Average FPS is ${avgFPS.toFixed(1)}, which may impact user experience`,
        impact: 'high' as const,
        timestamp: new Date()
      });
    }

    return insights;
  }

  public updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('freeflow_analytics_config', JSON.stringify(this.config));
  }
}

export const analyticsService = new AnalyticsService();