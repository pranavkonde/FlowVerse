import { 
  SecurityEvent, 
  CheatDetection, 
  SecurityPenalty, 
  SecurityMetrics, 
  UserSecurityProfile, 
  SecurityViolation,
  BehaviorPattern,
  AntiCheatConfig,
  SecurityAlert,
  SecurityAction,
  DeviceFingerprint,
  NetworkAnalysis,
  NetworkAnomaly,
  SecurityDashboard,
  SecurityReport,
  CHEAT_TYPES,
  SECURITY_EVENTS,
  PENALTY_TYPES
} from '@/types/security';

class SecurityService {
  private events: SecurityEvent[] = [];
  private cheatDetections: CheatDetection[] = [];
  private userProfiles: UserSecurityProfile[] = [];
  private alerts: SecurityAlert[] = [];
  private deviceFingerprints: DeviceFingerprint[] = [];
  private networkAnalyses: NetworkAnalysis[] = [];
  private config: AntiCheatConfig;
  private eventListeners: { [event: string]: Function[] } = {};

  constructor() {
    this.config = {
      enabled: true,
      sensitivity: 'medium',
      realTimeDetection: true,
      machineLearning: true,
      behavioralAnalysis: true,
      networkAnalysis: true,
      autoPenalty: false,
      thresholds: {
        speedHack: 0.8,
        aimbot: 0.9,
        wallhack: 0.85,
        scoreManipulation: 0.7,
        timeManipulation: 0.75
      },
      whitelist: [],
      blacklist: []
    };

    this.loadData();
    this.initializeMonitoring();
  }

  // Event System
  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Configuration
  getConfig(): AntiCheatConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<AntiCheatConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveData();
  }

  // Device Fingerprinting
  generateDeviceFingerprint(userId: string): DeviceFingerprint {
    const fingerprint = this.createFingerprint();
    const deviceFingerprint: DeviceFingerprint = {
      id: Date.now().toString(),
      userId,
      deviceId: this.getDeviceId(),
      fingerprint,
      components: {
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        canvas: this.getCanvasFingerprint(),
        webgl: this.getWebGLFingerprint(),
        audio: this.getAudioFingerprint(),
        fonts: this.getFontFingerprint(),
        plugins: this.getPluginFingerprint()
      },
      createdAt: new Date(),
      lastSeen: new Date(),
      trusted: false
    };

    this.deviceFingerprints.push(deviceFingerprint);
    this.saveData();
    return deviceFingerprint;
  }

  private createFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      navigator.cookieEnabled
    ];
    return btoa(components.join('|'));
  }

  private getDeviceId(): string {
    let deviceId = localStorage.getItem('flowverse_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('flowverse_device_id', deviceId);
    }
    return deviceId;
  }

  private getCanvasFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('FlowVerse Security', 2, 2);
      return canvas.toDataURL();
    }
    return '';
  }

  private getWebGLFingerprint(): string {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
    return '';
  }

  private getAudioFingerprint(): string {
    // Simplified audio fingerprint
    return 'audio_' + Math.random().toString(36).substr(2, 9);
  }

  private getFontFingerprint(): string[] {
    const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana'];
    return fonts.filter(font => this.isFontAvailable(font));
  }

  private isFontAvailable(font: string): boolean {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = '72px monospace';
      const baseline = ctx.measureText('mmmmmmmmmmlli').width;
      ctx.font = `72px ${font}, monospace`;
      const width = ctx.measureText('mmmmmmmmmmlli').width;
      return width !== baseline;
    }
    return false;
  }

  private getPluginFingerprint(): string[] {
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    return plugins;
  }

  // Cheat Detection
  detectCheat(userId: string, gameData: any): CheatDetection | null {
    if (!this.config.enabled) return null;

    const detections: CheatDetection[] = [];

    // Speed hack detection
    if (this.detectSpeedHack(gameData)) {
      detections.push(this.createCheatDetection(userId, 'speed_hack', gameData));
    }

    // Score manipulation detection
    if (this.detectScoreManipulation(gameData)) {
      detections.push(this.createCheatDetection(userId, 'score_manipulation', gameData));
    }

    // Time manipulation detection
    if (this.detectTimeManipulation(gameData)) {
      detections.push(this.createCheatDetection(userId, 'time_manipulation', gameData));
    }

    // Return highest confidence detection
    if (detections.length > 0) {
      const bestDetection = detections.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      this.cheatDetections.push(bestDetection);
      this.createSecurityEvent('cheat_detected', 'high', userId, bestDetection);
      this.saveData();
      
      return bestDetection;
    }

    return null;
  }

  private detectSpeedHack(gameData: any): boolean {
    const threshold = this.config.thresholds.speedHack;
    const maxSpeed = gameData.maxSpeed || 10;
    const currentSpeed = gameData.currentSpeed || 0;
    
    if (currentSpeed > maxSpeed * 1.5) {
      return true;
    }
    return false;
  }

  private detectScoreManipulation(gameData: any): boolean {
    const threshold = this.config.thresholds.scoreManipulation;
    const scoreIncrease = gameData.scoreIncrease || 0;
    const timeElapsed = gameData.timeElapsed || 1;
    const scoreRate = scoreIncrease / timeElapsed;
    
    // Unrealistic score increase rate
    if (scoreRate > 1000) {
      return true;
    }
    return false;
  }

  private detectTimeManipulation(gameData: any): boolean {
    const threshold = this.config.thresholds.timeManipulation;
    const clientTime = gameData.clientTime || Date.now();
    const serverTime = gameData.serverTime || Date.now();
    const timeDiff = Math.abs(clientTime - serverTime);
    
    // Large time discrepancy
    if (timeDiff > 5000) { // 5 seconds
      return true;
    }
    return false;
  }

  private createCheatDetection(userId: string, type: string, gameData: any): CheatDetection {
    return {
      id: Date.now().toString(),
      userId,
      type: type as any,
      confidence: this.calculateConfidence(type, gameData),
      evidence: this.gatherEvidence(type, gameData),
      detectedAt: new Date(),
      gameSession: gameData.sessionId || 'unknown',
      status: 'investigating'
    };
  }

  private calculateConfidence(type: string, gameData: any): number {
    // Simplified confidence calculation
    const baseConfidence = 0.7;
    const typeMultiplier = this.config.thresholds[type as keyof typeof this.config.thresholds] || 0.8;
    return Math.min(100, (baseConfidence + typeMultiplier) * 50);
  }

  private gatherEvidence(type: string, gameData: any): any[] {
    return [
      {
        type: 'behavioral',
        description: `Suspicious ${type} behavior detected`,
        data: gameData,
        weight: 0.8,
        timestamp: new Date()
      }
    ];
  }

  // Security Events
  createSecurityEvent(type: string, severity: 'low' | 'medium' | 'high' | 'critical', userId?: string, details?: any): SecurityEvent {
    const event: SecurityEvent = {
      id: Date.now().toString(),
      type: type as any,
      severity,
      userId,
      deviceId: this.getDeviceId(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      description: this.getEventDescription(type, details),
      details,
      resolved: false
    };

    this.events.push(event);
    this.emit(SECURITY_EVENTS.SECURITY_VIOLATION, event);
    this.saveData();
    
    return event;
  }

  private getEventDescription(type: string, details?: any): string {
    switch (type) {
      case 'cheat_detected':
        return `Cheat detected: ${details?.type || 'unknown'}`;
      case 'suspicious_activity':
        return 'Suspicious activity detected';
      case 'security_violation':
        return 'Security violation detected';
      case 'login_attempt':
        return 'Login attempt recorded';
      default:
        return 'Security event occurred';
    }
  }

  private getClientIP(): string {
    // In a real implementation, this would be provided by the server
    return '127.0.0.1';
  }

  // User Security Profiles
  getUserSecurityProfile(userId: string): UserSecurityProfile | null {
    return this.userProfiles.find(p => p.userId === userId) || null;
  }

  createUserSecurityProfile(userId: string): UserSecurityProfile {
    const profile: UserSecurityProfile = {
      userId,
      riskScore: 0,
      trustLevel: 'medium',
      violations: [],
      lastSecurityCheck: new Date(),
      deviceFingerprint: this.createFingerprint(),
      behaviorPattern: this.createDefaultBehaviorPattern(),
      whitelisted: false,
      blacklisted: false
    };

    this.userProfiles.push(profile);
    this.saveData();
    return profile;
  }

  private createDefaultBehaviorPattern(): BehaviorPattern {
    return {
      averageSessionTime: 0,
      typicalPlayHours: [],
      commonLocations: [],
      interactionPatterns: {},
      deviceConsistency: 1.0,
      networkStability: 1.0,
      anomalyScore: 0
    };
  }

  updateUserRiskScore(userId: string, newScore: number): void {
    const profile = this.getUserSecurityProfile(userId);
    if (profile) {
      profile.riskScore = Math.max(0, Math.min(100, newScore));
      profile.lastSecurityCheck = new Date();
      this.saveData();
    }
  }

  // Security Alerts
  createSecurityAlert(type: string, severity: 'low' | 'medium' | 'high' | 'critical', title: string, description: string, userId?: string): SecurityAlert {
    const alert: SecurityAlert = {
      id: Date.now().toString(),
      type: type as any,
      severity,
      title,
      description,
      userId,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      actions: []
    };

    this.alerts.push(alert);
    this.saveData();
    return alert;
  }

  getActiveAlerts(): SecurityAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.saveData();
    }
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.saveData();
    }
  }

  // Network Analysis
  analyzeNetwork(userId: string, sessionId: string): NetworkAnalysis {
    const analysis: NetworkAnalysis = {
      userId,
      sessionId,
      latency: this.measureLatency(),
      packetLoss: this.measurePacketLoss(),
      jitter: this.measureJitter(),
      bandwidth: this.measureBandwidth(),
      anomalies: this.detectNetworkAnomalies(),
      suspiciousPatterns: this.detectSuspiciousPatterns(),
      riskScore: this.calculateNetworkRiskScore(),
      timestamp: new Date()
    };

    this.networkAnalyses.push(analysis);
    this.saveData();
    return analysis;
  }

  private measureLatency(): number {
    // Simplified latency measurement
    return Math.random() * 100 + 20; // 20-120ms
  }

  private measurePacketLoss(): number {
    // Simplified packet loss measurement
    return Math.random() * 5; // 0-5%
  }

  private measureJitter(): number {
    // Simplified jitter measurement
    return Math.random() * 20 + 5; // 5-25ms
  }

  private measureBandwidth(): number {
    // Simplified bandwidth measurement
    return Math.random() * 100 + 10; // 10-110 Mbps
  }

  private detectNetworkAnomalies(): NetworkAnomaly[] {
    const anomalies: NetworkAnomaly[] = [];
    
    // Simulate anomaly detection
    if (Math.random() > 0.8) {
      anomalies.push({
        type: 'high_latency',
        severity: 'medium',
        description: 'High latency detected',
        timestamp: new Date(),
        duration: 5000,
        impact: 'Game performance affected'
      });
    }

    return anomalies;
  }

  private detectSuspiciousPatterns(): string[] {
    const patterns: string[] = [];
    
    // Simulate pattern detection
    if (Math.random() > 0.9) {
      patterns.push('Unusual connection pattern');
    }

    return patterns;
  }

  private calculateNetworkRiskScore(): number {
    // Simplified risk score calculation
    return Math.random() * 100;
  }

  // Security Dashboard
  getSecurityDashboard(): SecurityDashboard {
    const metrics = this.calculateSecurityMetrics();
    const recentEvents = this.events.slice(-10);
    const activeAlerts = this.getActiveAlerts();
    const topThreats = this.cheatDetections.slice(-5);

    return {
      metrics,
      recentEvents,
      activeAlerts,
      topThreats,
      systemHealth: this.getSystemHealth(),
      lastUpdate: new Date()
    };
  }

  private calculateSecurityMetrics(): SecurityMetrics {
    const totalEvents = this.events.length;
    const eventsByType = this.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as { [type: string]: number });

    const eventsBySeverity = this.events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as { [severity: string]: number });

    const cheatsDetected = this.cheatDetections.length;
    const falsePositives = this.cheatDetections.filter(c => c.status === 'false_positive').length;

    return {
      totalEvents,
      eventsByType,
      eventsBySeverity,
      cheatsDetected,
      falsePositives,
      averageDetectionTime: 1500, // ms
      systemUptime: Date.now() - (Date.now() - 24 * 60 * 60 * 1000), // 24 hours
      lastIncident: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : new Date()
    };
  }

  private getSystemHealth(): 'healthy' | 'warning' | 'critical' {
    const recentEvents = this.events.filter(e => 
      new Date().getTime() - e.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    );
    
    const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length;
    const highEvents = recentEvents.filter(e => e.severity === 'high').length;

    if (criticalEvents > 0) return 'critical';
    if (highEvents > 5) return 'warning';
    return 'healthy';
  }

  // Monitoring
  private initializeMonitoring(): void {
    // Monitor for suspicious activities
    setInterval(() => {
      this.performSecurityCheck();
    }, 30000); // Every 30 seconds

    // Monitor network
    setInterval(() => {
      this.performNetworkAnalysis();
    }, 60000); // Every minute
  }

  private performSecurityCheck(): void {
    // Simulate security checks
    if (Math.random() > 0.95) {
      this.createSecurityEvent('suspicious_activity', 'medium', undefined, {
        type: 'unusual_pattern',
        description: 'Unusual user behavior detected'
      });
    }
  }

  private performNetworkAnalysis(): void {
    // Simulate network analysis
    const userId = 'current_user'; // In real implementation, get current user
    const sessionId = 'current_session'; // In real implementation, get current session
    this.analyzeNetwork(userId, sessionId);
  }

  // Data Persistence
  private saveData(): void {
    localStorage.setItem('flowverse_security', JSON.stringify({
      events: this.events,
      cheatDetections: this.cheatDetections,
      userProfiles: this.userProfiles,
      alerts: this.alerts,
      deviceFingerprints: this.deviceFingerprints,
      networkAnalyses: this.networkAnalyses,
      config: this.config
    }));
  }

  private loadData(): void {
    const saved = localStorage.getItem('flowverse_security');
    if (saved) {
      const data = JSON.parse(saved);
      this.events = data.events?.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      })) || [];
      this.cheatDetections = data.cheatDetections?.map((c: any) => ({
        ...c,
        detectedAt: new Date(c.detectedAt),
        evidence: c.evidence?.map((ev: any) => ({
          ...ev,
          timestamp: new Date(ev.timestamp)
        })) || []
      })) || [];
      this.userProfiles = data.userProfiles?.map((p: any) => ({
        ...p,
        lastSecurityCheck: new Date(p.lastSecurityCheck)
      })) || [];
      this.alerts = data.alerts?.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp)
      })) || [];
      this.deviceFingerprints = data.deviceFingerprints?.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        lastSeen: new Date(d.lastSeen)
      })) || [];
      this.networkAnalyses = data.networkAnalyses?.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
        anomalies: n.anomalies?.map((an: any) => ({
          ...an,
          timestamp: new Date(an.timestamp)
        })) || []
      })) || [];
      this.config = { ...this.config, ...data.config };
    }
  }

  // Public API
  getEvents(): SecurityEvent[] {
    return this.events;
  }

  getCheatDetections(): CheatDetection[] {
    return this.cheatDetections;
  }

  getAlerts(): SecurityAlert[] {
    return this.alerts;
  }

  getMetrics(): SecurityMetrics {
    return this.calculateSecurityMetrics();
  }
}

export const securityService = new SecurityService();
