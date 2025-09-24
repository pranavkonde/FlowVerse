import { SecurityEvent, AntiCheatRule, SecurityConfig, PlayerSecurityProfile, SecurityAlert, SecurityStats } from '../types/security';

export class AntiCheatService {
  private config: SecurityConfig;
  private rules: AntiCheatRule[];
  private events: SecurityEvent[] = [];
  private alerts: SecurityAlert[] = [];
  private playerProfiles: Map<string, PlayerSecurityProfile> = new Map();
  private actionHistory: Map<string, any[]> = new Map(); // userId -> actions

  constructor() {
    this.config = this.getDefaultConfig();
    this.rules = this.getDefaultRules();
  }

  private getDefaultConfig(): SecurityConfig {
    return {
      enabled: true,
      strictMode: false,
      autoKick: false,
      autoBan: false,
      logLevel: 'standard',
      rateLimits: {
        movement: 10,
        chat: 30,
        trade: 10,
        login: 5
      },
      suspiciousActivityThreshold: 70,
      banDuration: 60,
      kickThreshold: 3
    };
  }

  private getDefaultRules(): AntiCheatRule[] {
    return [
      {
        id: 'movement_speed',
        name: 'Movement Speed Validation',
        description: 'Detects players moving faster than physically possible',
        type: 'movement',
        enabled: true,
        severity: 'warning',
        conditions: {
          threshold: 500,
          timeWindow: 5
        },
        actions: {
          log: true,
          alert: true,
          autoAction: false,
          notifyAdmins: false
        }
      },
      {
        id: 'teleport_detection',
        name: 'Teleport Detection',
        description: 'Detects impossible position changes',
        type: 'movement',
        enabled: true,
        severity: 'kick',
        conditions: {
          threshold: 1000,
          timeWindow: 1
        },
        actions: {
          log: true,
          alert: true,
          autoAction: true,
          notifyAdmins: true
        }
      },
      {
        id: 'chat_rate_limit',
        name: 'Chat Rate Limiting',
        description: 'Prevents chat spam and flooding',
        type: 'rate_limit',
        enabled: true,
        severity: 'warning',
        conditions: {
          threshold: 10,
          timeWindow: 60
        },
        actions: {
          log: true,
          alert: false,
          autoAction: true,
          notifyAdmins: false
        }
      },
      {
        id: 'action_spam',
        name: 'Action Spam Detection',
        description: 'Detects rapid-fire actions that may indicate automation',
        type: 'rate_limit',
        enabled: true,
        severity: 'warning',
        conditions: {
          threshold: 20,
          timeWindow: 1
        },
        actions: {
          log: true,
          alert: true,
          autoAction: false,
          notifyAdmins: false
        }
      }
    ];
  }

  public validateMovement(
    userId: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    timestamp: number
  ): { isValid: boolean; violations: string[] } {
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const timeDelta = (Date.now() - timestamp) / 1000;
    const speed = timeDelta > 0 ? distance / timeDelta : 0;

    const violations: string[] = [];

    // Check movement speed
    const speedRule = this.rules.find(rule => rule.id === 'movement_speed');
    if (speedRule && speedRule.enabled && speed > speedRule.conditions.threshold!) {
      violations.push('Movement speed exceeds maximum allowed');
      this.logSecurityEvent('movement', 'high', userId, {
        speed,
        threshold: speedRule.conditions.threshold,
        from: { x: fromX, y: fromY },
        to: { x: toX, y: toY }
      });
    }

    // Check teleportation
    const teleportRule = this.rules.find(rule => rule.id === 'teleport_detection');
    if (teleportRule && teleportRule.enabled && distance > teleportRule.conditions.threshold!) {
      violations.push('Teleportation detected');
      this.logSecurityEvent('movement', 'critical', userId, {
        distance,
        threshold: teleportRule.conditions.threshold,
        from: { x: fromX, y: fromY },
        to: { x: toX, y: toY }
      });
    }

    // Record movement for pattern analysis
    this.recordAction(userId, {
      type: 'movement',
      timestamp: Date.now(),
      data: { fromX, fromY, toX, toY, speed, distance }
    });

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  public validateAction(
    userId: string,
    actionType: string,
    timestamp: number
  ): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check action rate limiting
    const spamRule = this.rules.find(rule => rule.id === 'action_spam');
    if (spamRule && spamRule.enabled) {
      const recentActions = this.getRecentActions(userId, spamRule.conditions.timeWindow! * 1000);
      if (recentActions.length > spamRule.conditions.threshold!) {
        violations.push('Action rate limit exceeded');
        this.logSecurityEvent('action', 'medium', userId, {
          actionType,
          count: recentActions.length,
          threshold: spamRule.conditions.threshold
        });
      }
    }

    // Record action for pattern analysis
    this.recordAction(userId, {
      type: actionType,
      timestamp: Date.now(),
      data: { actionType }
    });

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  public validateChatMessage(userId: string, message: string): boolean {
    // Check chat rate limiting
    const chatRule = this.rules.find(rule => rule.id === 'chat_rate_limit');
    if (chatRule && chatRule.enabled) {
      const recentMessages = this.getRecentActions(userId, chatRule.conditions.timeWindow! * 1000, 'chat');
      if (recentMessages.length > chatRule.conditions.threshold!) {
        this.logSecurityEvent('chat', 'low', userId, {
          messageCount: recentMessages.length,
          threshold: chatRule.conditions.threshold
        });
        return false;
      }
    }

    // Check for spam patterns
    if (this.detectSpamPattern(message)) {
      this.logSecurityEvent('chat', 'medium', userId, {
        message,
        pattern: 'spam_detected'
      });
      return false;
    }

    // Record chat message
    this.recordAction(userId, {
      type: 'chat',
      timestamp: Date.now(),
      data: { message: message.substring(0, 100) } // Truncate for storage
    });

    return true;
  }

  private detectSpamPattern(message: string): boolean {
    const repeatedChars = /(.)\1{4,}/.test(message);
    const excessiveCaps = (message.match(/[A-Z]/g) || []).length / message.length > 0.7;
    const excessivePunctuation = (message.match(/[!@#$%^&*()_+=\[\]{}|;':",./<>?]/g) || []).length > 10;
    
    return repeatedChars || excessiveCaps || excessivePunctuation;
  }

  private recordAction(userId: string, action: any): void {
    if (!this.actionHistory.has(userId)) {
      this.actionHistory.set(userId, []);
    }
    
    const actions = this.actionHistory.get(userId)!;
    actions.push(action);
    
    // Keep only last 100 actions per user
    if (actions.length > 100) {
      actions.splice(0, actions.length - 100);
    }
  }

  private getRecentActions(userId: string, timeWindow: number, type?: string): any[] {
    const actions = this.actionHistory.get(userId) || [];
    const now = Date.now();
    
    return actions.filter(action => {
      const timeMatch = now - action.timestamp < timeWindow;
      const typeMatch = !type || action.type === type;
      return timeMatch && typeMatch;
    });
  }

  private logSecurityEvent(
    type: 'movement' | 'action' | 'chat' | 'trade' | 'login' | 'suspicious',
    severity: 'low' | 'medium' | 'high' | 'critical',
    userId: string,
    data: any
  ): void {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      severity,
      userId,
      timestamp: new Date(),
      data,
      description: this.getEventDescription(type, severity),
      resolved: false
    };

    this.events.push(event);
    this.updatePlayerProfile(userId, event);

    // Create alert for high severity events
    if (severity === 'high' || severity === 'critical') {
      this.createAlert(type, severity, userId, data);
    }

    // Auto-actions based on severity
    if (this.config.autoKick && severity === 'critical') {
      this.kickPlayer(userId, 'Automatic kick due to critical security violation');
    }

    if (this.config.autoBan && this.getPlayerProfile(userId).riskScore > 90) {
      this.banPlayer(userId, this.config.banDuration, 'Automatic ban due to high risk score');
    }
  }

  private createAlert(
    type: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    userId: string,
    data: any
  ): void {
    const alert: SecurityAlert = {
      id: this.generateAlertId(),
      type: type as any,
      severity,
      userId,
      message: this.getEventDescription(type as any, severity),
      timestamp: new Date(),
      data,
      acknowledged: false,
      resolved: false
    };

    this.alerts.push(alert);
  }

  private updatePlayerProfile(userId: string, event: SecurityEvent): void {
    const profile = this.getPlayerProfile(userId);
    
    profile.violations.push(event);
    profile.lastViolation = event.timestamp;
    profile.riskScore = this.calculateRiskScore(profile);
    profile.trustLevel = this.calculateTrustLevel(profile.riskScore);

    this.playerProfiles.set(userId, profile);
  }

  private calculateRiskScore(profile: PlayerSecurityProfile): number {
    let score = 0;
    
    // Base score from violations
    score += profile.violations.length * 5;
    
    // Severity multipliers
    const severityMultipliers = { low: 1, medium: 2, high: 5, critical: 10 };
    profile.violations.forEach(violation => {
      score += severityMultipliers[violation.severity];
    });

    // Recent violations have higher weight
    const recentViolations = profile.violations.filter(
      v => Date.now() - v.timestamp.getTime() < 3600000 // Last hour
    );
    score += recentViolations.length * 10;

    return Math.min(100, score);
  }

  private calculateTrustLevel(riskScore: number): 'trusted' | 'normal' | 'suspicious' | 'banned' {
    if (riskScore >= 90) return 'banned';
    if (riskScore >= 70) return 'suspicious';
    if (riskScore >= 30) return 'normal';
    return 'trusted';
  }

  private kickPlayer(userId: string, reason: string): void {
    console.log(`Kicking player ${userId}: ${reason}`);
    // In a real implementation, this would send a kick command to the game service
  }

  private banPlayer(userId: string, duration: number, reason: string): void {
    const profile = this.getPlayerProfile(userId);
    profile.isBanned = true;
    profile.banExpiry = new Date(Date.now() + duration * 60000);
    profile.trustLevel = 'banned';
    
    console.log(`Banning player ${userId} for ${duration} minutes: ${reason}`);
    // In a real implementation, this would send a ban command to the game service
  }

  private getEventDescription(type: string, severity: string): string {
    const descriptions: Record<string, string> = {
      'movement': 'Movement anomaly detected',
      'action': 'Suspicious action detected',
      'chat': 'Chat violation detected',
      'trade': 'Trading anomaly detected',
      'login': 'Login anomaly detected',
      'suspicious': 'Suspicious behavior detected'
    };
    
    return descriptions[type] || 'Unknown security event';
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getPlayerProfile(userId: string): PlayerSecurityProfile {
    if (!this.playerProfiles.has(userId)) {
      const profile: PlayerSecurityProfile = {
        userId,
        riskScore: 0,
        violations: [],
        warnings: 0,
        kicks: 0,
        bans: 0,
        isBanned: false,
        trustLevel: 'normal',
        behaviorPattern: {
          averageMovementSpeed: 0,
          typicalPlayTime: 0,
          commonActions: [],
          unusualPatterns: []
        }
      };
      this.playerProfiles.set(userId, profile);
    }
    return this.playerProfiles.get(userId)!;
  }

  // Public getters
  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public getRules(): AntiCheatRule[] {
    return [...this.rules];
  }

  public getEvents(): SecurityEvent[] {
    return [...this.events];
  }

  public getAlerts(): SecurityAlert[] {
    return [...this.alerts];
  }

  public getPlayerProfile(userId: string): PlayerSecurityProfile | undefined {
    return this.playerProfiles.get(userId);
  }

  public getStats(): SecurityStats {
    const eventsByType = this.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsBySeverity = this.events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topViolators = Array.from(this.playerProfiles.values())
      .sort((a, b) => b.violations.length - a.violations.length)
      .slice(0, 10)
      .map(profile => ({
        userId: profile.userId,
        violationCount: profile.violations.length,
        riskScore: profile.riskScore
      }));

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      activeBans: Array.from(this.playerProfiles.values()).filter(p => p.isBanned).length,
      activeWarnings: this.alerts.filter(a => !a.resolved).length,
      topViolators,
      recentAlerts: this.alerts.slice(-10)
    };
  }

  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public updateRule(ruleId: string, updates: Partial<AntiCheatRule>): void {
    const ruleIndex = this.rules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex !== -1) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    }
  }
}
