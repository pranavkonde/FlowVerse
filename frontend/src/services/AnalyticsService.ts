import { 
  PlayerAnalytics, 
  GameSession, 
  PerformanceMetrics, 
  UserBehavior, 
  AnalyticsReport, 
  RealTimeMetrics,
  CohortAnalysis,
  FunnelAnalysis,
  A/BTestResult,
  AnalyticsDashboard,
  DashboardWidget
} from '@/types/analytics';

class AnalyticsService {
  private playerAnalytics: PlayerAnalytics[] = [];
  private gameSessions: GameSession[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private userBehaviors: UserBehavior[] = [];
  private reports: AnalyticsReport[] = [];
  private realTimeMetrics: RealTimeMetrics | null = null;
  private dashboards: AnalyticsDashboard[] = [];

  constructor() {
    this.loadData();
    this.initializeSampleData();
  }

  // Player Analytics
  getPlayerAnalytics(userId: string): PlayerAnalytics | null {
    return this.playerAnalytics.find(p => p.userId === userId) || null;
  }

  getAllPlayerAnalytics(): PlayerAnalytics[] {
    return this.playerAnalytics;
  }

  updatePlayerAnalytics(userId: string, updates: Partial<PlayerAnalytics>): void {
    const index = this.playerAnalytics.findIndex(p => p.userId === userId);
    if (index >= 0) {
      this.playerAnalytics[index] = { ...this.playerAnalytics[index], ...updates };
    } else {
      const newAnalytics: PlayerAnalytics = {
        userId,
        username: `User_${userId.slice(-4)}`,
        totalPlayTime: 0,
        sessionsPlayed: 0,
        averageSessionDuration: 0,
        totalDistance: 0,
        totalScore: 0,
        highScore: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        winRate: 0,
        favoriteGameMode: 'classic',
        achievementsUnlocked: 0,
        totalAchievements: 0,
        socialInteractions: 0,
        friendsCount: 0,
        guildMemberships: 0,
        tradingVolume: 0,
        tokensEarned: 0,
        tokensSpent: 0,
        nftsOwned: 0,
        questsCompleted: 0,
        voiceCommandsUsed: 0,
        lastActive: new Date(),
        joinDate: new Date(),
        level: 1,
        experience: 0,
        rank: 0,
        ...updates
      };
      this.playerAnalytics.push(newAnalytics);
    }
    this.saveData();
  }

  // Game Sessions
  startGameSession(userId: string, gameMode: string, location: string): string {
    const session: GameSession = {
      id: Date.now().toString(),
      userId,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      gameMode,
      score: 0,
      distance: 0,
      interactions: 0,
      achievements: [],
      location,
      device: this.getDeviceInfo(),
      platform: this.getPlatformInfo()
    };

    this.gameSessions.push(session);
    this.saveData();
    return session.id;
  }

  endGameSession(sessionId: string, score: number, distance: number, interactions: number, achievements: string[]): void {
    const session = this.gameSessions.find(s => s.id === sessionId);
    if (session) {
      session.endTime = new Date();
      session.duration = session.endTime.getTime() - session.startTime.getTime();
      session.score = score;
      session.distance = distance;
      session.interactions = interactions;
      session.achievements = achievements;

      // Update player analytics
      this.updatePlayerAnalytics(session.userId, {
        totalPlayTime: this.getTotalPlayTime(session.userId),
        sessionsPlayed: this.getSessionsPlayed(session.userId),
        averageSessionDuration: this.getAverageSessionDuration(session.userId),
        totalDistance: this.getTotalDistance(session.userId),
        totalScore: this.getTotalScore(session.userId),
        highScore: Math.max(this.getHighScore(session.userId), score),
        gamesPlayed: this.getGamesPlayed(session.userId),
        lastActive: new Date()
      });
    }
    this.saveData();
  }

  getGameSessions(userId?: string): GameSession[] {
    if (userId) {
      return this.gameSessions.filter(s => s.userId === userId);
    }
    return this.gameSessions;
  }

  // Performance Metrics
  recordPerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
    const performanceMetric: PerformanceMetrics = {
      averageFPS: 60,
      averageLatency: 50,
      memoryUsage: 512,
      cpuUsage: 30,
      networkLatency: 20,
      renderTime: 16,
      loadTime: 2000,
      crashCount: 0,
      errorCount: 0,
      ...metrics,
      ...{ timestamp: new Date() }
    } as PerformanceMetrics;

    this.performanceMetrics.push(performanceMetric);
    this.saveData();
  }

  getPerformanceMetrics(): PerformanceMetrics[] {
    return this.performanceMetrics;
  }

  getAveragePerformanceMetrics(): PerformanceMetrics {
    if (this.performanceMetrics.length === 0) {
      return {
        averageFPS: 60,
        averageLatency: 50,
        memoryUsage: 512,
        cpuUsage: 30,
        networkLatency: 20,
        renderTime: 16,
        loadTime: 2000,
        crashCount: 0,
        errorCount: 0
      };
    }

    const sum = this.performanceMetrics.reduce((acc, metric) => ({
      averageFPS: acc.averageFPS + metric.averageFPS,
      averageLatency: acc.averageLatency + metric.averageLatency,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      cpuUsage: acc.cpuUsage + metric.cpuUsage,
      networkLatency: acc.networkLatency + metric.networkLatency,
      renderTime: acc.renderTime + metric.renderTime,
      loadTime: acc.loadTime + metric.loadTime,
      crashCount: acc.crashCount + metric.crashCount,
      errorCount: acc.errorCount + metric.errorCount
    }), {
      averageFPS: 0,
      averageLatency: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkLatency: 0,
      renderTime: 0,
      loadTime: 0,
      crashCount: 0,
      errorCount: 0
    });

    const count = this.performanceMetrics.length;
    return {
      averageFPS: sum.averageFPS / count,
      averageLatency: sum.averageLatency / count,
      memoryUsage: sum.memoryUsage / count,
      cpuUsage: sum.cpuUsage / count,
      networkLatency: sum.networkLatency / count,
      renderTime: sum.renderTime / count,
      loadTime: sum.loadTime / count,
      crashCount: sum.crashCount / count,
      errorCount: sum.errorCount / count
    };
  }

  // Real-time Metrics
  getRealTimeMetrics(): RealTimeMetrics {
    if (!this.realTimeMetrics) {
      this.realTimeMetrics = {
        onlineUsers: this.getOnlineUsersCount(),
        activeGames: this.getActiveGamesCount(),
        currentRevenue: this.getCurrentRevenue(),
        systemHealth: this.getSystemHealth(),
        averageResponseTime: this.getAverageResponseTime(),
        errorRate: this.getErrorRate(),
        memoryUsage: this.getCurrentMemoryUsage(),
        cpuUsage: this.getCurrentCpuUsage(),
        lastUpdated: new Date()
      };
    }
    return this.realTimeMetrics;
  }

  updateRealTimeMetrics(): void {
    this.realTimeMetrics = {
      onlineUsers: this.getOnlineUsersCount(),
      activeGames: this.getActiveGamesCount(),
      currentRevenue: this.getCurrentRevenue(),
      systemHealth: this.getSystemHealth(),
      averageResponseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate(),
      memoryUsage: this.getCurrentMemoryUsage(),
      cpuUsage: this.getCurrentCpuUsage(),
      lastUpdated: new Date()
    };
  }

  // Analytics Reports
  generateReport(type: 'daily' | 'weekly' | 'monthly' | 'custom', period?: { start: Date; end: Date }): AnalyticsReport {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (type) {
      case 'daily':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        start = period?.start || new Date(now.getTime() - 24 * 60 * 60 * 1000);
        end = period?.end || now;
        break;
    }

    const report: AnalyticsReport = {
      id: Date.now().toString(),
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Analytics Report`,
      type,
      period: { start, end },
      metrics: this.calculateMetricsForPeriod(start, end),
      charts: this.generateChartsForPeriod(start, end),
      insights: this.generateInsights(start, end),
      recommendations: this.generateRecommendations(start, end),
      generatedAt: new Date(),
      generatedBy: 'system'
    };

    this.reports.push(report);
    this.saveData();
    return report;
  }

  getReports(): AnalyticsReport[] {
    return this.reports;
  }

  // Dashboard Management
  createDashboard(name: string, description: string): AnalyticsDashboard {
    const dashboard: AnalyticsDashboard = {
      id: Date.now().toString(),
      name,
      description,
      widgets: [],
      layout: {
        columns: 12,
        rows: 8,
        gap: 16,
        padding: 16
      },
      isPublic: false,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dashboards.push(dashboard);
    this.saveData();
    return dashboard;
  }

  getDashboards(): AnalyticsDashboard[] {
    return this.dashboards;
  }

  addWidgetToDashboard(dashboardId: string, widget: DashboardWidget): void {
    const dashboard = this.dashboards.find(d => d.id === dashboardId);
    if (dashboard) {
      dashboard.widgets.push(widget);
      dashboard.updatedAt = new Date();
      this.saveData();
    }
  }

  // Helper Methods
  private getTotalPlayTime(userId: string): number {
    return this.gameSessions
      .filter(s => s.userId === userId)
      .reduce((total, session) => total + session.duration, 0);
  }

  private getSessionsPlayed(userId: string): number {
    return this.gameSessions.filter(s => s.userId === userId).length;
  }

  private getAverageSessionDuration(userId: string): number {
    const sessions = this.gameSessions.filter(s => s.userId === userId);
    if (sessions.length === 0) return 0;
    return sessions.reduce((total, session) => total + session.duration, 0) / sessions.length;
  }

  private getTotalDistance(userId: string): number {
    return this.gameSessions
      .filter(s => s.userId === userId)
      .reduce((total, session) => total + session.distance, 0);
  }

  private getTotalScore(userId: string): number {
    return this.gameSessions
      .filter(s => s.userId === userId)
      .reduce((total, session) => total + session.score, 0);
  }

  private getHighScore(userId: string): number {
    const scores = this.gameSessions
      .filter(s => s.userId === userId)
      .map(s => s.score);
    return scores.length > 0 ? Math.max(...scores) : 0;
  }

  private getGamesPlayed(userId: string): number {
    return this.gameSessions.filter(s => s.userId === userId).length;
  }

  private getDeviceInfo(): string {
    return navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
  }

  private getPlatformInfo(): string {
    return navigator.platform || 'Unknown';
  }

  private getOnlineUsersCount(): number {
    return Math.floor(Math.random() * 1000) + 500;
  }

  private getActiveGamesCount(): number {
    return Math.floor(Math.random() * 100) + 50;
  }

  private getCurrentRevenue(): number {
    return Math.floor(Math.random() * 10000) + 5000;
  }

  private getSystemHealth(): 'healthy' | 'warning' | 'critical' {
    const health = Math.random();
    if (health > 0.8) return 'healthy';
    if (health > 0.5) return 'warning';
    return 'critical';
  }

  private getAverageResponseTime(): number {
    return Math.floor(Math.random() * 100) + 50;
  }

  private getErrorRate(): number {
    return Math.random() * 5;
  }

  private getCurrentMemoryUsage(): number {
    return Math.floor(Math.random() * 1000) + 500;
  }

  private getCurrentCpuUsage(): number {
    return Math.floor(Math.random() * 100);
  }

  private calculateMetricsForPeriod(start: Date, end: Date): any {
    const sessionsInPeriod = this.gameSessions.filter(s => 
      s.startTime >= start && s.startTime <= end
    );

    return {
      totalUsers: this.playerAnalytics.length,
      activeUsers: new Set(sessionsInPeriod.map(s => s.userId)).size,
      newUsers: 0, // Would need to track user creation dates
      returningUsers: 0,
      averageSessionDuration: sessionsInPeriod.reduce((total, s) => total + s.duration, 0) / sessionsInPeriod.length || 0,
      totalPlayTime: sessionsInPeriod.reduce((total, s) => total + s.duration, 0),
      totalRevenue: 0, // Would need revenue data
      averageRevenuePerUser: 0,
      retentionRate: 0.75, // Mock data
      churnRate: 0.05
    };
  }

  private generateChartsForPeriod(start: Date, end: Date): any[] {
    // Mock chart data
    return [
      {
        id: '1',
        type: 'line',
        title: 'Daily Active Users',
        description: 'Number of active users per day',
        data: [],
        xAxis: 'Date',
        yAxis: 'Users',
        color: '#3B82F6'
      }
    ];
  }

  private generateInsights(start: Date, end: Date): string[] {
    return [
      'User engagement increased by 15% compared to the previous period',
      'Average session duration is above the target of 20 minutes',
      'Mobile users show higher retention rates than desktop users',
      'Peak activity occurs between 7-9 PM local time'
    ];
  }

  private generateRecommendations(start: Date, end: Date): string[] {
    return [
      'Consider implementing push notifications to increase user engagement',
      'Optimize mobile performance to improve user experience',
      'Add more social features to increase user retention',
      'Implement personalized content recommendations'
    ];
  }

  // Data Persistence
  private saveData(): void {
    localStorage.setItem('flowverse_analytics', JSON.stringify({
      playerAnalytics: this.playerAnalytics,
      gameSessions: this.gameSessions,
      performanceMetrics: this.performanceMetrics,
      userBehaviors: this.userBehaviors,
      reports: this.reports,
      dashboards: this.dashboards
    }));
  }

  private loadData(): void {
    const saved = localStorage.getItem('flowverse_analytics');
    if (saved) {
      const data = JSON.parse(saved);
      this.playerAnalytics = data.playerAnalytics?.map((p: any) => ({
        ...p,
        lastActive: new Date(p.lastActive),
        joinDate: new Date(p.joinDate)
      })) || [];
      this.gameSessions = data.gameSessions?.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime)
      })) || [];
      this.performanceMetrics = data.performanceMetrics || [];
      this.userBehaviors = data.userBehaviors || [];
      this.reports = data.reports?.map((r: any) => ({
        ...r,
        period: {
          start: new Date(r.period.start),
          end: new Date(r.period.end)
        },
        generatedAt: new Date(r.generatedAt)
      })) || [];
      this.dashboards = data.dashboards?.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt)
      })) || [];
    }
  }

  private initializeSampleData(): void {
    if (this.playerAnalytics.length === 0) {
      // Create sample player analytics
      for (let i = 0; i < 10; i++) {
        this.updatePlayerAnalytics(`user_${i}`, {
          username: `Player_${i}`,
          totalPlayTime: Math.floor(Math.random() * 100000),
          sessionsPlayed: Math.floor(Math.random() * 100),
          totalScore: Math.floor(Math.random() * 100000),
          highScore: Math.floor(Math.random() * 10000),
          gamesPlayed: Math.floor(Math.random() * 50),
          level: Math.floor(Math.random() * 50) + 1,
          experience: Math.floor(Math.random() * 10000)
        });
      }
    }
  }
}

export const analyticsService = new AnalyticsService();
