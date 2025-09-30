export interface Guild {
  id: string;
  name: string;
  description: string;
  tag: string; // Short 3-4 character tag
  level: number;
  experience: number;
  maxMembers: number;
  memberCount: number;
  leaderId: string;
  officers: string[]; // User IDs
  members: string[]; // User IDs
  treasury: number; // Guild tokens
  permissions: GuildPermissions;
  settings: GuildSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuildMember {
  userId: string;
  guildId: string;
  role: GuildRole;
  joinedAt: Date;
  contribution: number; // Points contributed to guild
  lastActive: Date;
  permissions: GuildMemberPermissions;
}

export interface GuildPermissions {
  canInvite: boolean;
  canKick: boolean;
  canPromote: boolean;
  canManageTreasury: boolean;
  canEditGuild: boolean;
  canManageEvents: boolean;
  canViewAnalytics: boolean;
}

export interface GuildMemberPermissions {
  canInvite: boolean;
  canKick: boolean;
  canPromote: boolean;
  canManageTreasury: boolean;
  canEditGuild: boolean;
  canManageEvents: boolean;
  canViewAnalytics: boolean;
}

export interface GuildSettings {
  isPublic: boolean;
  allowInvites: boolean;
  requireApproval: boolean;
  minLevel: number;
  language: string;
  timezone: string;
  description: string;
  rules: string[];
  tags: string[];
}

export interface GuildEvent {
  id: string;
  guildId: string;
  name: string;
  description: string;
  type: GuildEventType;
  startTime: Date;
  endTime: Date;
  maxParticipants: number;
  participants: string[];
  rewards: GuildEventReward[];
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface GuildEventReward {
  type: GuildRewardType;
  amount: number;
  metadata?: Record<string, any>;
}

export interface GuildInvite {
  id: string;
  guildId: string;
  inviterId: string;
  inviteeId: string;
  message?: string;
  expiresAt: Date;
  status: GuildInviteStatus;
  createdAt: Date;
}

export interface GuildApplication {
  id: string;
  guildId: string;
  applicantId: string;
  message: string;
  status: GuildApplicationStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface GuildStats {
  totalMembers: number;
  activeMembers: number;
  totalExperience: number;
  treasury: number;
  eventsHosted: number;
  eventsParticipated: number;
  averageContribution: number;
  topContributors: GuildMember[];
  recentActivity: GuildActivity[];
}

export interface GuildActivity {
  id: string;
  guildId: string;
  userId: string;
  type: GuildActivityType;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface GuildRanking {
  guildId: string;
  guildName: string;
  guildTag: string;
  level: number;
  experience: number;
  memberCount: number;
  rank: number;
  change: number; // Position change from last ranking
}

export enum GuildRole {
  MEMBER = 'member',
  OFFICER = 'officer',
  LEADER = 'leader'
}

export enum GuildEventType {
  RAID = 'raid',
  PVP = 'pvp',
  SOCIAL = 'social',
  TRADING = 'trading',
  EXPLORATION = 'exploration',
  CUSTOM = 'custom'
}

export enum GuildRewardType {
  TOKENS = 'tokens',
  XP = 'xp',
  ITEMS = 'items',
  TITLES = 'titles',
  BADGES = 'badges',
  CUSTOMIZATION = 'customization'
}

export enum GuildInviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export enum GuildApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum GuildActivityType {
  MEMBER_JOINED = 'member_joined',
  MEMBER_LEFT = 'member_left',
  MEMBER_PROMOTED = 'member_promoted',
  MEMBER_DEMOTED = 'member_demoted',
  EVENT_CREATED = 'event_created',
  EVENT_COMPLETED = 'event_completed',
  TREASURY_DEPOSIT = 'treasury_deposit',
  TREASURY_WITHDRAWAL = 'treasury_withdrawal',
  GUILD_LEVEL_UP = 'guild_level_up',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked'
}

export interface GuildSearchFilters {
  name?: string;
  tag?: string;
  minLevel?: number;
  maxLevel?: number;
  minMembers?: number;
  maxMembers?: number;
  isPublic?: boolean;
  tags?: string[];
  language?: string;
  sortBy?: 'level' | 'members' | 'experience' | 'created';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

