import { 
  SecurityEvent, 
  AntiCheatRule, 
  SecurityConfig, 
  PlayerSecurityProfile,
  SecurityAlert,
  MovementValidation,
  ActionValidation,
  SecurityStats,
  SECURITY_EVENTS,
  SecurityEventType,
  DEFAULT_ANTI_CHEAT_RULES
} from '@/types/security';

export class SecurityService {
  private config: SecurityConfig;
  private rules: AntiCheatRule[];
  private events: SecurityEvent[] = [];
  private alerts: SecurityAlert[] = [];
  private playerProfiles: Map<string, PlayerSecurityProfile> = new Map();

  constructor() {
    this.config = this.getDefaultConfig();
    this.rules = [...DEFAULT_ANTI_CHEAT_RULES];
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

  public validateMovement(
    userId: string, 
    fromX: number, 
    fromY: number, 
    toX: number, 
    toY: number, 
    timestamp: number
  ): MovementValidation {
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const timeDelta = (Date.now() - timestamp) / 1000;
    const speed = timeDelta > 0 ? distance / timeDelta : 0;

    const validation: MovementValidation = {
      isValid: true,
      violations: [],
      speed,
      distance,
      timeDelta,
      expectedPosition: { x: toX, y: toY },
      actualPosition: { x: toX, y: toY }
    };

    const speedRule = this.rules.find(rule => rule.id === 'movement_speed');
    if (speedRule && speedRule.enabled && speed > speedRule.conditions.threshold!) {
      validation.isValid = false;
      validation.violations.push('Movement speed exceeds maximum allowed');
      this.logSecurityEvent(SECURITY_EVENTS.SPEED_HACK_DETECTED, 'high', userId, {
        speed,
        threshold: speedRule.conditions.threshold
      });
    }

    return validation;
  }

  public validateAction(
    userId: string, 
    actionType: string, 
    timestamp: number
  ): ActionValidation {
    const validation: ActionValidation = {
      isValid: true,
      violations: [],
      actionType,
      cooldownRemaining: 0,
      rateLimitExceeded: false,
      suspiciousPattern: false
    };

    const spamRule = this.rules.find(rule => rule.id === 'action_spam');
    if (spamRule && spamRule.enabled) {
      // Simplified rate limiting check
      const recentActions = this.getRecentActions(userId, 1000);
      if (recentActions.length > spamRule.conditions.threshold!) {
        validation.isValid = false;
        validation.rateLimitExceeded = true;
        validation.violations.push('Action rate limit exceeded');
      }
    }

    return validation;
  }

  public validateChatMessage(userId: string, message: string): boolean {
    const chatRule = this.rules.find(rule => rule.id === 'chat_rate_limit');
    if (chatRule && chatRule.enabled) {
      const recentMessages = this.getRecentActions(userId, 60000, 'chat');
      if (recentMessages.length > chatRule.conditions.threshold!) {
        this.logSecurityEvent(SECURITY_EVENTS.CHAT_SPAM, 'low', userId, {
          messageCount: recentMessages.length
        });
    return false;
  }
    }

    if (this.detectSpamPattern(message)) {
      this.logSecurityEvent(SECURITY_EVENTS.CHAT_SPAM, 'medium', userId, {
        message
      });
    return false;
  }

      return true;
  }

  private detectSpamPattern(message: string): boolean {
    const repeatedChars = /(.)\1{4,}/.test(message);
    const excessiveCaps = (message.match(/[A-Z]/g) || []).length / message.length > 0.7;
    return repeatedChars || excessiveCaps;
  }

  private logSecurityEvent(
    type: SecurityEventType, 
    severity: 'low' | 'medium' | 'high' | 'critical', 
    userId: string, 
    data: any
  ): void {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type: type.split('_')[0] as any,
      severity,
      userId,
      timestamp: new Date(),
      data,
      description: this.getEventDescription(type),
      resolved: false
    };

    this.events.push(event);
    this.updatePlayerProfile(userId, event);
  }

  private updatePlayerProfile(userId: string, event: SecurityEvent): void {
    const profile = this.getPlayerProfile(userId);
    profile.violations.push(event);
    profile.lastViolation = event.timestamp;
    profile.riskScore = this.calculateRiskScore(profile);
    this.playerProfiles.set(userId, profile);
  }

  private calculateRiskScore(profile: PlayerSecurityProfile): number {
    let score = profile.violations.length * 5;
    const severityMultipliers = { low: 1, medium: 2, high: 5, critical: 10 };
    profile.violations.forEach(violation => {
      score += severityMultipliers[violation.severity];
    });
    return Math.min(100, score);
  }

  private getRecentActions(userId: string, timeWindow: number, type?: string): any[] {
    const profile = this.getPlayerProfile(userId);
    const now = Date.now();
    return profile.behaviorPattern.commonActions.filter(action => {
      const timeMatch = now - action.timestamp < timeWindow;
      const typeMatch = !type || action.type === type;
      return timeMatch && typeMatch;
    });
  }

  private getEventDescription(type: SecurityEventType): string {
    const descriptions = {
      [SECURITY_EVENTS.SPEED_HACK_DETECTED]: 'Player moving faster than possible',
      [SECURITY_EVENTS.TELEPORT_DETECTED]: 'Impossible position change detected',
      [SECURITY_EVENTS.RATE_LIMIT_EXCEEDED]: 'Action rate limit exceeded',
      [SECURITY_EVENTS.CHAT_SPAM]: 'Chat spam detected'
    };
    return descriptions[type] || 'Unknown security event';
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public getRules(): AntiCheatRule[] {
    return [...this.rules];
  }

  public getEvents(): SecurityEvent[] {
    return [...this.events];
  }

  public getStats(): SecurityStats {
    return {
      totalEvents: this.events.length,
      eventsByType: {},
      eventsBySeverity: {},
      activeBans: 0,
      activeWarnings: 0,
      topViolators: [],
      recentAlerts: []
    };
  }
}

export const securityService = new SecurityService();