import { AnalyticsEvent, PerformanceMetric, UserBehavior, SystemHealth, AnalyticsDashboard } from '../types/analytics';

export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private systemHealth: SystemHealth[] = [];

  constructor() {
    this.startSystemMonitoring();
  }

  private startSystemMonitoring(): void {
    // Monitor system health every 30 seconds
    setInterval(() => {
      this.recordSystemHealth();
    }, 30000);
  }

  public recordEvent(event: AnalyticsEvent): void {
    this.events.push(event);
    this.updateUserBehavior(event);
    this.cleanupOldData();
  }

  public recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.cleanupOldData();
  }

  private updateUserBehavior(event: AnalyticsEvent): void {
    if (!event.userId) return;

    const behavior = this.getUserBehavior(event.userId);
    
    // Update action counts based on event type
    if (event.action.includes('movement')) behavior.actions.movement++;
    else if (event.action.includes('chat')) behavior.actions.chat++;
    else if (event.action.includes('trade')) behavior.actions.trade++;
    else if (event.action.includes('quest')) behavior.actions.quest++;
    else if (event.action.includes('minigame')) behavior.actions.miniGame++;
    else if (event.action.includes('npc')) behavior.actions.npcInteraction++;

    // Update location data
    if (event.data.location) {
      const location = behavior.locations.find(l => l.area === event.data.location.area);
      if (location) {
        location.visitCount++;
        location.timeSpent += 1;
      } else {
        behavior.locations.push({
          area: event.data.location.area,
          timeSpent: 1,
          visitCount: 1
        });
      }
    }

    this.userBehaviors.set(event.userId, behavior);
  }

  private getUserBehavior(userId: string): UserBehavior {
    if (!this.userBehaviors.has(userId)) {
      const behavior: UserBehavior = {
        userId,
        sessionId: `session_${Date.now()}`,
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

  private recordSystemHealth(): void {
    const health: SystemHealth = {
      timestamp: new Date(),
      status: this.calculateSystemStatus(),
      metrics: {
        serverLoad: this.getServerLoad(),
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: this.getCpuUsage(),
        activeConnections: this.getActiveConnections(),
        responseTime: this.getAverageResponseTime(),
        errorRate: this.getErrorRate()
      },
      alerts: this.getSystemAlerts()
    };

    this.systemHealth.push(health);
    
    // Keep only last 100 health records
    if (this.systemHealth.length > 100) {
      this.systemHealth = this.systemHealth.slice(-100);
    }
  }

  private calculateSystemStatus(): 'healthy' | 'warning' | 'critical' {
    const recentHealth = this.systemHealth[this.systemHealth.length - 1];
    if (!recentHealth) return 'healthy';

    const { metrics } = recentHealth;
    
    if (metrics.memoryUsage > 90 || metrics.cpuUsage > 90 || metrics.errorRate > 10) {
      return 'critical';
    }
    
    if (metrics.memoryUsage > 70 || metrics.cpuUsage > 70 || metrics.errorRate > 5) {
      return 'warning';
    }
    
    return 'healthy';
  }

  private getServerLoad(): number {
    // Simplified server load calculation
    return Math.random() * 100;
  }

  private getMemoryUsage(): number {
    // Simplified memory usage calculation
    return Math.random() * 100;
  }

  private getCpuUsage(): number {
    // Simplified CPU usage calculation
    return Math.random() * 100;
  }

  private getActiveConnections(): number {
    // This would be connected to the actual game service
    return Math.floor(Math.random() * 100) + 10;
  }

  private getAverageResponseTime(): number {
    // Simplified response time calculation
    return Math.random() * 200 + 50;
  }

  private getErrorRate(): number {
    // Simplified error rate calculation
    return Math.random() * 5;
  }

  private getSystemAlerts(): Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
  }> {
    const alerts = [];
    
    // Check for performance issues
    const recentMetrics = this.metrics.slice(-10);
    const avgFPS = recentMetrics
      .filter(m => m.type === 'fps')
      .reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
    
    if (avgFPS < 30) {
      alerts.push({
        type: 'performance',
        message: 'Low FPS detected across multiple users',
        severity: 'high' as const,
        timestamp: new Date()
      });
    }

    return alerts;
  }

  private cleanupOldData(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    this.events = this.events.filter(event => event.timestamp.getTime() > oneDayAgo);
    this.metrics = this.metrics.filter(metric => metric.timestamp.getTime() > oneDayAgo);
  }

  public getEvents(timeRange?: number): AnalyticsEvent[] {
    if (!timeRange) return [...this.events];
    
    const cutoffTime = Date.now() - timeRange;
    return this.events.filter(event => event.timestamp.getTime() > cutoffTime);
  }

  public getMetrics(timeRange?: number): PerformanceMetric[] {
    if (!timeRange) return [...this.metrics];
    
    const cutoffTime = Date.now() - timeRange;
    return this.metrics.filter(metric => metric.timestamp.getTime() > cutoffTime);
  }

  public getUserBehavior(userId: string): UserBehavior | undefined {
    return this.userBehaviors.get(userId);
  }

  public getSystemHealth(): SystemHealth[] {
    return [...this.systemHealth];
  }

  public getDashboard(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): AnalyticsDashboard {
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const range = timeRanges[timeRange];
    const startTime = Date.now() - range;

    const recentEvents = this.events.filter(e => e.timestamp.getTime() > startTime);
    const recentMetrics = this.metrics.filter(m => m.timestamp.getTime() > startTime);

    const uniqueUsers = new Set(recentEvents.map(e => e.userId).filter(Boolean)).size;
    const uniqueSessions = new Set(recentEvents.map(e => e.sessionId)).size;

    return {
      timeRange,
      metrics: {
        totalUsers: uniqueUsers,
        activeUsers: uniqueUsers,
        newUsers: uniqueUsers, // Simplified
        retentionRate: 85, // Simplified
        averageSessionTime: 1800, // 30 minutes
        totalSessions: uniqueSessions
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
    const latencyMetrics = metrics.filter(m => m.type === 'latency');
    
    return fpsMetrics.map((fps, index) => ({
      time: fps.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fps: fps.value,
      latency: latencyMetrics[index]?.value || 0
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

    // Performance insights
    const fpsMetrics = metrics.filter(m => m.type === 'fps');
    if (fpsMetrics.length > 0) {
      const avgFPS = fpsMetrics.reduce((sum, m) => sum + m.value, 0) / fpsMetrics.length;
      if (avgFPS < 30) {
        insights.push({
          type: 'anomaly' as const,
          title: 'Low FPS Detected',
          description: `Average FPS is ${avgFPS.toFixed(1)}, which may impact user experience`,
          impact: 'high' as const,
          timestamp: new Date()
        });
      }
    }

    // User activity insights
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
    if (uniqueUsers > 50) {
      insights.push({
        type: 'trend' as const,
        title: 'High User Activity',
        description: `${uniqueUsers} unique users active in the last period`,
        impact: 'medium' as const,
        timestamp: new Date()
      });
    }

    // System health insights
    const recentHealth = this.systemHealth[this.systemHealth.length - 1];
    if (recentHealth && recentHealth.status === 'critical') {
      insights.push({
        type: 'anomaly' as const,
        title: 'System Health Critical',
        description: 'Server performance is degraded and may affect user experience',
        impact: 'high' as const,
        timestamp: new Date()
      });
    }

    return insights;
  }

  public getStats(): {
    totalEvents: number;
    totalMetrics: number;
    uniqueUsers: number;
    systemStatus: string;
    averageFPS: number;
    errorRate: number;
  } {
    const uniqueUsers = new Set(this.events.map(e => e.userId).filter(Boolean)).size;
    const fpsMetrics = this.metrics.filter(m => m.type === 'fps');
    const avgFPS = fpsMetrics.length > 0 
      ? fpsMetrics.reduce((sum, m) => sum + m.value, 0) / fpsMetrics.length 
      : 0;

    const recentHealth = this.systemHealth[this.systemHealth.length - 1];
    const systemStatus = recentHealth ? recentHealth.status : 'unknown';

    return {
      totalEvents: this.events.length,
      totalMetrics: this.metrics.length,
      uniqueUsers,
      systemStatus,
      averageFPS: Math.round(avgFPS),
      errorRate: recentHealth ? recentHealth.metrics.errorRate : 0
    };
  }
}