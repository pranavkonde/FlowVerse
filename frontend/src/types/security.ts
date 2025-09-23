export interface SecurityEvent {
  id: string;
  type: 'cheat_detected' | 'suspicious_activity' | 'security_violation' | 'login_attempt' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  description: string;
  details: any;
  resolved: boolean;
  actionTaken?: string;
}

export interface CheatDetection {
  id: string;
  userId: string;
  type: 'speed_hack' | 'aimbot' | 'wallhack' | 'infinite_health' | 'score_manipulation' | 'time_manipulation' | 'inventory_duplication';
  confidence: number; // 0-100
  evidence: CheatEvidence[];
  detectedAt: Date;
  gameSession: string;
  status: 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
  penalty?: SecurityPenalty;
}

export interface CheatEvidence {
  type: 'behavioral' | 'statistical' | 'technical' | 'network';
  description: string;
  data: any;
  weight: number; // 0-1
  timestamp: Date;
}

export interface SecurityPenalty {
  type: 'warning' | 'temporary_ban' | 'permanent_ban' | 'score_reset' | 'inventory_wipe';
  duration?: number; // in minutes
  reason: string;
  appliedAt: Date;
  expiresAt?: Date;
  appliedBy: string;
}

export interface SecurityMetrics {
  totalEvents: number;
  eventsByType: { [type: string]: number };
  eventsBySeverity: { [severity: string]: number };
  cheatsDetected: number;
  falsePositives: number;
  averageDetectionTime: number;
  systemUptime: number;
  lastIncident: Date;
}

export interface UserSecurityProfile {
  userId: string;
  riskScore: number; // 0-100
  trustLevel: 'low' | 'medium' | 'high' | 'verified';
  violations: SecurityViolation[];
  lastSecurityCheck: Date;
  deviceFingerprint: string;
  behaviorPattern: BehaviorPattern;
  whitelisted: boolean;
  blacklisted: boolean;
}

export interface SecurityViolation {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  resolved: boolean;
  penalty?: SecurityPenalty;
}

export interface BehaviorPattern {
  averageSessionTime: number;
  typicalPlayHours: number[];
  commonLocations: string[];
  interactionPatterns: { [key: string]: number };
  deviceConsistency: number;
  networkStability: number;
  anomalyScore: number;
}

export interface AntiCheatConfig {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  realTimeDetection: boolean;
  machineLearning: boolean;
  behavioralAnalysis: boolean;
  networkAnalysis: boolean;
  autoPenalty: boolean;
  thresholds: {
    speedHack: number;
    aimbot: number;
    wallhack: number;
    scoreManipulation: number;
    timeManipulation: number;
  };
  whitelist: string[];
  blacklist: string[];
}

export interface SecurityAlert {
  id: string;
  type: 'cheat' | 'suspicious' | 'violation' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId?: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  actions: SecurityAction[];
}

export interface SecurityAction {
  id: string;
  type: 'investigate' | 'warn' | 'ban' | 'reset' | 'monitor';
  description: string;
  executed: boolean;
  executedAt?: Date;
  executedBy?: string;
  result?: string;
}

export interface DeviceFingerprint {
  id: string;
  userId: string;
  deviceId: string;
  fingerprint: string;
  components: {
    screen: string;
    timezone: string;
    language: string;
    platform: string;
    userAgent: string;
    canvas: string;
    webgl: string;
    audio: string;
    fonts: string[];
    plugins: string[];
  };
  createdAt: Date;
  lastSeen: Date;
  trusted: boolean;
}

export interface NetworkAnalysis {
  userId: string;
  sessionId: string;
  latency: number;
  packetLoss: number;
  jitter: number;
  bandwidth: number;
  anomalies: NetworkAnomaly[];
  suspiciousPatterns: string[];
  riskScore: number;
  timestamp: Date;
}

export interface NetworkAnomaly {
  type: 'high_latency' | 'packet_loss' | 'jitter_spike' | 'bandwidth_anomaly' | 'connection_drop';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: Date;
  duration: number;
  impact: string;
}

export interface SecurityDashboard {
  metrics: SecurityMetrics;
  recentEvents: SecurityEvent[];
  activeAlerts: SecurityAlert[];
  topThreats: CheatDetection[];
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdate: Date;
}

export interface SecurityReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'incident';
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalEvents: number;
    cheatsDetected: number;
    falsePositives: number;
    averageResponseTime: number;
    systemUptime: number;
  };
  details: {
    eventsByType: { [type: string]: number };
    eventsBySeverity: { [severity: string]: number };
    topViolators: { userId: string; violations: number }[];
    systemPerformance: any;
  };
  recommendations: string[];
  generatedAt: Date;
  generatedBy: string;
}

export const CHEAT_TYPES = [
  { id: 'speed_hack', name: 'Speed Hack', description: 'Moving faster than possible', icon: '🏃' },
  { id: 'aimbot', name: 'Aimbot', description: 'Automated aiming assistance', icon: '🎯' },
  { id: 'wallhack', name: 'Wallhack', description: 'Seeing through walls', icon: '👁️' },
  { id: 'infinite_health', name: 'Infinite Health', description: 'Unlimited health points', icon: '❤️' },
  { id: 'score_manipulation', name: 'Score Manipulation', description: 'Artificially inflated scores', icon: '📊' },
  { id: 'time_manipulation', name: 'Time Manipulation', description: 'Altering game time', icon: '⏰' },
  { id: 'inventory_duplication', name: 'Inventory Duplication', description: 'Duplicating items', icon: '📦' }
];

export const SECURITY_EVENTS = {
  CHEAT_DETECTED: 'cheat_detected',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  SECURITY_VIOLATION: 'security_violation',
  LOGIN_ATTEMPT: 'login_attempt',
  DATA_BREACH: 'data_breach',
  SYSTEM_ALERT: 'system_alert'
};

export const PENALTY_TYPES = [
  { id: 'warning', name: 'Warning', description: 'First offense warning', duration: 0 },
  { id: 'temporary_ban', name: 'Temporary Ban', description: 'Temporary account suspension', duration: 1440 }, // 24 hours
  { id: 'permanent_ban', name: 'Permanent Ban', description: 'Permanent account suspension', duration: -1 },
  { id: 'score_reset', name: 'Score Reset', description: 'Reset player scores', duration: 0 },
  { id: 'inventory_wipe', name: 'Inventory Wipe', description: 'Remove all items', duration: 0 }
];
