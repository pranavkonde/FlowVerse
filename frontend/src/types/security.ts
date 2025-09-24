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
    timeWindow?: number; // in seconds
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
    movement: number; // actions per second
    chat: number; // messages per minute
    trade: number; // trades per hour
    login: number; // login attempts per minute
  };
  suspiciousActivityThreshold: number;
  banDuration: number; // in minutes
  kickThreshold: number;
}

export interface PlayerSecurityProfile {
  userId: string;
  riskScore: number; // 0-100
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
    commonActions: string[];
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

export interface MovementValidation {
  isValid: boolean;
  violations: string[];
  speed: number;
  distance: number;
  timeDelta: number;
  expectedPosition: {
    x: number;
    y: number;
  };
  actualPosition: {
    x: number;
    y: number;
  };
}

export interface ActionValidation {
  isValid: boolean;
  violations: string[];
  actionType: string;
  cooldownRemaining: number;
  rateLimitExceeded: boolean;
  suspiciousPattern: boolean;
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

export const SECURITY_EVENTS = {
  MOVEMENT_ANOMALY: 'movement_anomaly',
  SPEED_HACK_DETECTED: 'speed_hack_detected',
  TELEPORT_DETECTED: 'teleport_detected',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SUSPICIOUS_PATTERN: 'suspicious_pattern',
  CHAT_SPAM: 'chat_spam',
  TRADE_ANOMALY: 'trade_anomaly',
  LOGIN_ANOMALY: 'login_anomaly',
  MULTI_ACCOUNT_DETECTED: 'multi_account_detected',
  BOT_DETECTED: 'bot_detected'
} as const;

export type SecurityEventType = typeof SECURITY_EVENTS[keyof typeof SECURITY_EVENTS];

export const DEFAULT_ANTI_CHEAT_RULES: AntiCheatRule[] = [
  {
    id: 'movement_speed',
    name: 'Movement Speed Validation',
    description: 'Detects players moving faster than physically possible',
    type: 'movement',
    enabled: true,
    severity: 'warning',
    conditions: {
      threshold: 500, // pixels per second
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
      threshold: 1000, // pixels
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
      threshold: 10, // messages per minute
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
      threshold: 20, // actions per second
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