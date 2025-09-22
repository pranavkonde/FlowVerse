export interface Guild {
  id: string;
  name: string;
  tag: string; // Short 3-4 character tag
  description: string;
  level: number;
  experience: number;
  maxMembers: number;
  currentMembers: number;
  members: GuildMember[];
  leader: GuildMember;
  officers: GuildMember[];
  treasury: number;
  reputation: number;
  theme: string;
  icon: string;
  banner: string;
  color: string;
  createdAt: Date;
  isPublic: boolean;
  requirements: GuildRequirements;
  stats: GuildStats;
  perks: GuildPerk[];
  announcements: GuildAnnouncement[];
  events: GuildEvent[];
}

export interface GuildMember {
  id: string;
  username: string;
  avatar: string;
  role: 'leader' | 'officer' | 'member' | 'recruit';
  joinedAt: Date;
  lastActive: Date;
  contribution: number;
  level: number;
  isOnline: boolean;
  permissions: GuildPermission[];
  stats: MemberStats;
}

export interface GuildRequirements {
  minLevel: number;
  minReputation: number;
  requiredAchievements: string[];
  applicationRequired: boolean;
  autoAccept: boolean;
  maxApplicationsPerDay: number;
}

export interface GuildStats {
  totalMembers: number;
  activeMembers: number;
  totalContribution: number;
  weeklyContribution: number;
  guildLevel: number;
  totalExperience: number;
  warsWon: number;
  warsLost: number;
  eventsCompleted: number;
  averageMemberLevel: number;
  topContributors: GuildMember[];
  recentActivity: GuildActivity[];
}

export interface GuildPerk {
  id: string;
  name: string;
  description: string;
  level: number;
  isUnlocked: boolean;
  cost: number;
  benefits: {
    type: 'experience' | 'coins' | 'items' | 'abilities' | 'access';
    value: string | number;
    description: string;
  }[];
  icon: string;
}

export interface GuildAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  isPinned: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
}

export interface GuildEvent {
  id: string;
  name: string;
  description: string;
  type: 'raid' | 'pvp' | 'social' | 'trading' | 'exploration' | 'custom';
  startTime: Date;
  endTime: Date;
  maxParticipants: number;
  participants: string[]; // member IDs
  rewards: GuildReward[];
  requirements: GuildEventRequirements;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
}

export interface GuildReward {
  type: 'experience' | 'coins' | 'items' | 'reputation' | 'guild_currency';
  value: string | number;
  amount: number;
  description: string;
  icon: string;
}

export interface GuildEventRequirements {
  minLevel: number;
  minContribution: number;
  requiredRoles: string[];
  maxParticipants: number;
}

export interface GuildActivity {
  id: string;
  type: 'member_joined' | 'member_left' | 'level_up' | 'contribution' | 'event_completed' | 'perk_unlocked' | 'announcement';
  memberId: string;
  memberName: string;
  description: string;
  value?: number;
  createdAt: Date;
  icon: string;
}

export interface MemberStats {
  totalContribution: number;
  weeklyContribution: number;
  eventsParticipated: number;
  eventsWon: number;
  timeInGuild: number; // in days
  lastContribution: Date;
  favoriteActivity: string;
  achievements: string[];
}

export interface GuildPermission {
  id: string;
  name: string;
  description: string;
  category: 'management' | 'members' | 'events' | 'treasury' | 'communication';
  level: number;
}

export interface GuildApplication {
  id: string;
  guildId: string;
  playerId: string;
  playerName: string;
  playerLevel: number;
  playerReputation: number;
  message: string;
  appliedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  response?: string;
}

export interface GuildWar {
  id: string;
  guild1Id: string;
  guild2Id: string;
  guild1Name: string;
  guild2Name: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  rules: WarRules;
  score: {
    guild1: number;
    guild2: number;
  };
  winner?: string;
  rewards: GuildReward[];
  participants: WarParticipant[];
}

export interface WarRules {
  maxParticipants: number;
  duration: number; // in minutes
  objectives: WarObjective[];
  allowedItems: string[];
  restrictedItems: string[];
  respawnTime: number; // in seconds
}

export interface WarObjective {
  id: string;
  name: string;
  description: string;
  points: number;
  type: 'capture' | 'defend' | 'eliminate' | 'collect' | 'survive';
  target: string | number;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
}

export interface WarParticipant {
  memberId: string;
  guildId: string;
  kills: number;
  deaths: number;
  assists: number;
  objectivesCompleted: number;
  points: number;
  isActive: boolean;
}

export interface GuildFilters {
  name?: string;
  level?: {
    min: number;
    max: number;
  };
  members?: {
    min: number;
    max: number;
  };
  isPublic?: boolean;
  theme?: string;
  sortBy: 'name' | 'level' | 'members' | 'reputation' | 'created';
  sortOrder: 'asc' | 'desc';
}

export interface GuildNotification {
  id: string;
  type: 'member_joined' | 'member_left' | 'event_starting' | 'announcement' | 'war_declared' | 'perk_unlocked' | 'contribution_milestone';
  guildId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}
