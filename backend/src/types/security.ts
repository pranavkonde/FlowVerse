export interface SecurityEvent {
  id: string;
  type: 'movement' | 'action' | 'chat' | 'trade' | 'login' | 'suspicious';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  timestamp: Date;
  data: any;
  location?: {
    x: number;
    y: number;
    area: string;
  };
  description: string;
  resolved: boolean;
}

export interface AntiCheatRule {
  id: string;
  name: string;
  description: string;
  type: 'movement' | 'action' | 'rate_limit' | 'pattern' | 'statistical';
  enabled: boolean;
  severity: 'warning' | 'kick' | 'ban' | 'investigate';
  conditions: {
    threshold?: number;
    timeWindow?: number;
    pattern?: string;
    minOccurrences?: number;
  };
  actions: {
    log: boolean;
    alert: boolean;
    autoAction: boolean;
    notifyAdmins: boolean;
  };
}

export interface SecurityConfig {
  enabled: boolean;
  strictMode: boolean;
  autoKick: boolean;
  autoBan: boolean;
  logLevel: 'minimal' | 'standard' | 'verbose';
  rateLimits: {
    movement: number;
    chat: number;
    trade: number;
    login: number;
  };
  suspiciousActivityThreshold: number;
  banDuration: number;
  kickThreshold: number;
}

export interface PlayerSecurityProfile {
  userId: string;
  riskScore: number;
  violations: SecurityEvent[];
  warnings: number;
  kicks: number;
  bans: number;
  lastViolation?: Date;
  isBanned: boolean;
  banExpiry?: Date;
  trustLevel: 'trusted' | 'normal' | 'suspicious' | 'banned';
  behaviorPattern: {
    averageMovementSpeed: number;
    typicalPlayTime: number;
    commonActions: any[];
    unusualPatterns: string[];
  };
}

export interface SecurityAlert {
  id: string;
  type: 'cheat_detected' | 'suspicious_activity' | 'rate_limit_exceeded' | 'pattern_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  message: string;
  timestamp: Date;
  data: any;
  acknowledged: boolean;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface SecurityStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  activeBans: number;
  activeWarnings: number;
  topViolators: Array<{
    userId: string;
    violationCount: number;
    riskScore: number;
  }>;
  recentAlerts: SecurityAlert[];
}
