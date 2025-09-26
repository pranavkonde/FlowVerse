export interface SocialHub {
  id: string;
  name: string;
  description: string;
  type: HubType;
  capacity: number;
  currentUsers: number;
  location: HubLocation;
  features: HubFeature[];
  isActive: boolean;
  isPublic: boolean;
  ownerId?: string;
  moderators: string[];
  rules: HubRule[];
  events: string[];
  createdAt: Date;
  lastModified: Date;
  metadata: HubMetadata;
}

export interface HubLocation {
  x: number;
  y: number;
  z: number;
  world: string;
  region: string;
  coordinates: string;
}

export interface HubFeature {
  id: string;
  name: string;
  type: FeatureType;
  description: string;
  isActive: boolean;
  capacity?: number;
  currentUsers?: number;
  requirements: FeatureRequirement[];
  effects: FeatureEffect[];
  metadata: FeatureMetadata;
}

export interface HubRule {
  id: string;
  title: string;
  description: string;
  type: RuleType;
  severity: RuleSeverity;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface HubMetadata {
  imageUrl?: string;
  backgroundMusic?: string;
  ambientSounds?: string[];
  lighting: LightingType;
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
  specialEffects?: string[];
  customizations: HubCustomization[];
}

export interface HubCustomization {
  id: string;
  type: CustomizationType;
  value: string;
  cost: number;
  isApplied: boolean;
  description: string;
}

export interface SocialEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  category: EventCategory;
  hubId: string;
  organizerId: string;
  organizerName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  participants: EventParticipant[];
  status: EventStatus;
  requirements: EventRequirement[];
  rewards: EventReward[];
  activities: EventActivity[];
  rules: EventRule[];
  isPublic: boolean;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  createdAt: Date;
  lastModified: Date;
  metadata: EventMetadata;
}

export interface EventParticipant {
  userId: string;
  username: string;
  avatar?: string;
  joinedAt: Date;
  status: ParticipantStatus;
  role: ParticipantRole;
  contributions: number;
  rewards: EventReward[];
  activities: string[];
}

export interface EventActivity {
  id: string;
  name: string;
  type: ActivityType;
  description: string;
  startTime: Date;
  endTime: Date;
  maxParticipants: number;
  currentParticipants: number;
  participants: string[];
  requirements: ActivityRequirement[];
  rewards: ActivityReward[];
  status: ActivityStatus;
  metadata: ActivityMetadata;
}

export interface EventReward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  amount: number;
  rarity: RewardRarity;
  requirements: RewardRequirement[];
  isClaimed: boolean;
  claimedBy?: string;
  claimedAt?: Date;
  metadata: RewardMetadata;
}

export interface EventRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
  userId?: string;
}

export interface EventRule {
  id: string;
  title: string;
  description: string;
  type: RuleType;
  severity: RuleSeverity;
  isActive: boolean;
  violations: RuleViolation[];
}

export interface RuleViolation {
  id: string;
  userId: string;
  username: string;
  ruleId: string;
  description: string;
  severity: RuleSeverity;
  reportedBy: string;
  reportedAt: Date;
  status: ViolationStatus;
  action?: ViolationAction;
  actionTakenBy?: string;
  actionTakenAt?: Date;
}

export interface ViolationAction {
  type: ActionType;
  description: string;
  duration?: number;
  reason: string;
}

export interface RecurrencePattern {
  type: RecurrenceType;
  interval: number;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  endDate?: Date;
  maxOccurrences?: number;
}

export interface EventMetadata {
  imageUrl?: string;
  bannerUrl?: string;
  tags: string[];
  category: string;
  isFeatured: boolean;
  isUrgent: boolean;
  specialOffers: string[];
  location: string;
  difficulty: EventDifficulty;
  recommendedLevel: number;
  estimatedDuration: number;
  customizations: EventCustomization[];
}

export interface EventCustomization {
  id: string;
  type: CustomizationType;
  value: string;
  cost: number;
  isApplied: boolean;
  description: string;
}

export interface Party {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  leaderName: string;
  members: PartyMember[];
  maxMembers: number;
  isPublic: boolean;
  isRecruiting: boolean;
  requirements: PartyRequirement[];
  activities: string[];
  status: PartyStatus;
  createdAt: Date;
  lastModified: Date;
  metadata: PartyMetadata;
}

export interface PartyMember {
  userId: string;
  username: string;
  avatar?: string;
  role: PartyRole;
  joinedAt: Date;
  contributions: number;
  status: MemberStatus;
  permissions: PartyPermission[];
}

export interface PartyRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface PartyMetadata {
  imageUrl?: string;
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
  customizations: PartyCustomization[];
}

export interface PartyCustomization {
  id: string;
  type: CustomizationType;
  value: string;
  cost: number;
  isApplied: boolean;
  description: string;
}

export interface SocialInteraction {
  id: string;
  type: InteractionType;
  fromUserId: string;
  toUserId: string;
  hubId?: string;
  eventId?: string;
  partyId?: string;
  content: string;
  timestamp: Date;
  isPublic: boolean;
  reactions: InteractionReaction[];
  replies: SocialInteraction[];
  metadata: InteractionMetadata;
}

export interface InteractionReaction {
  userId: string;
  username: string;
  type: ReactionType;
  timestamp: Date;
}

export interface InteractionMetadata {
  imageUrl?: string;
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
}

export interface SocialStats {
  userId: string;
  totalEventsAttended: number;
  totalEventsOrganized: number;
  totalPartiesJoined: number;
  totalPartiesCreated: number;
  totalInteractions: number;
  totalReactions: number;
  totalRewards: number;
  favoriteHub: string;
  favoriteEventType: EventType;
  reputation: number;
  level: number;
  experience: number;
  achievements: string[];
  badges: string[];
  lastActive: Date;
  metadata: SocialStatsMetadata;
}

export interface SocialStatsMetadata {
  imageUrl?: string;
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
}

// Enums and Types
export type HubType = 
  | 'public'
  | 'private'
  | 'guild'
  | 'event'
  | 'party'
  | 'trading'
  | 'gaming'
  | 'social'
  | 'educational'
  | 'entertainment';

export type FeatureType = 
  | 'chat'
  | 'voice'
  | 'video'
  | 'gaming'
  | 'trading'
  | 'events'
  | 'parties'
  | 'minigames'
  | 'music'
  | 'streaming'
  | 'collaboration'
  | 'education'
  | 'entertainment';

export type RuleType = 
  | 'behavior'
  | 'language'
  | 'content'
  | 'spam'
  | 'harassment'
  | 'cheating'
  | 'exploitation'
  | 'privacy'
  | 'safety'
  | 'community';

export type RuleSeverity = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type LightingType = 
  | 'bright'
  | 'normal'
  | 'dim'
  | 'dark'
  | 'colored'
  | 'dynamic'
  | 'custom';

export type WeatherType = 
  | 'clear'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'foggy'
  | 'windy'
  | 'custom';

export type TimeOfDay = 
  | 'dawn'
  | 'morning'
  | 'noon'
  | 'afternoon'
  | 'evening'
  | 'night'
  | 'midnight'
  | 'custom';

export type CustomizationType = 
  | 'color'
  | 'texture'
  | 'lighting'
  | 'sound'
  | 'music'
  | 'decoration'
  | 'furniture'
  | 'background'
  | 'effect'
  | 'theme';

export type EventType = 
  | 'party'
  | 'tournament'
  | 'contest'
  | 'workshop'
  | 'meetup'
  | 'celebration'
  | 'competition'
  | 'collaboration'
  | 'education'
  | 'entertainment'
  | 'social'
  | 'gaming'
  | 'trading'
  | 'community';

export type EventCategory = 
  | 'social'
  | 'gaming'
  | 'educational'
  | 'entertainment'
  | 'competitive'
  | 'collaborative'
  | 'creative'
  | 'business'
  | 'charity'
  | 'seasonal';

export type EventStatus = 
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export type ParticipantStatus = 
  | 'invited'
  | 'joined'
  | 'active'
  | 'inactive'
  | 'left'
  | 'removed';

export type ParticipantRole = 
  | 'organizer'
  | 'moderator'
  | 'participant'
  | 'spectator'
  | 'volunteer';

export type ActivityType = 
  | 'game'
  | 'quiz'
  | 'contest'
  | 'discussion'
  | 'presentation'
  | 'workshop'
  | 'collaboration'
  | 'entertainment'
  | 'social'
  | 'competitive';

export type ActivityStatus = 
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type RewardType = 
  | 'experience'
  | 'currency'
  | 'item'
  | 'badge'
  | 'title'
  | 'access'
  | 'privilege'
  | 'cosmetic'
  | 'achievement';

export type RewardRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type RequirementType = 
  | 'level'
  | 'reputation'
  | 'achievement'
  | 'item'
  | 'currency'
  | 'time_played'
  | 'events_attended'
  | 'parties_joined'
  | 'interactions'
  | 'reactions';

export type ViolationStatus = 
  | 'reported'
  | 'investigating'
  | 'resolved'
  | 'dismissed'
  | 'escalated';

export type ActionType = 
  | 'warning'
  | 'timeout'
  | 'ban'
  | 'kick'
  | 'mute'
  | 'restriction'
  | 'education';

export type RecurrenceType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom';

export type EventDifficulty = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'master';

export type PartyStatus = 
  | 'recruiting'
  | 'active'
  | 'full'
  | 'inactive'
  | 'disbanded';

export type PartyRole = 
  | 'leader'
  | 'officer'
  | 'member'
  | 'recruit';

export type MemberStatus = 
  | 'active'
  | 'inactive'
  | 'away'
  | 'busy'
  | 'offline';

export type PartyPermission = 
  | 'invite'
  | 'kick'
  | 'moderate'
  | 'organize'
  | 'manage'
  | 'view_private';

export type InteractionType = 
  | 'message'
  | 'emote'
  | 'gesture'
  | 'reaction'
  | 'gift'
  | 'invitation'
  | 'announcement'
  | 'poll'
  | 'question'
  | 'answer';

export type ReactionType = 
  | 'like'
  | 'love'
  | 'laugh'
  | 'wow'
  | 'sad'
  | 'angry'
  | 'celebrate'
  | 'support'
  | 'disagree'
  | 'custom';

// Interfaces for feature requirements and effects
export interface FeatureRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface FeatureEffect {
  type: EffectType;
  value: number;
  duration: number;
  description: string;
}

export interface FeatureMetadata {
  icon: string;
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
}

export interface ActivityRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface ActivityReward {
  type: RewardType;
  amount: number;
  description: string;
  isClaimed: boolean;
}

export interface ActivityMetadata {
  icon: string;
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
}

export interface RewardRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface RewardMetadata {
  icon: string;
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
}

export type EffectType = 
  | 'buff'
  | 'debuff'
  | 'healing'
  | 'damage'
  | 'experience'
  | 'currency'
  | 'reputation'
  | 'access'
  | 'privilege'
  | 'cosmetic';

// Constants
export const SOCIAL_EVENTS = {
  HUB_CREATED: 'social:hub_created',
  HUB_UPDATED: 'social:hub_updated',
  HUB_DELETED: 'social:hub_deleted',
  HUB_JOINED: 'social:hub_joined',
  HUB_LEFT: 'social:hub_left',
  EVENT_CREATED: 'social:event_created',
  EVENT_UPDATED: 'social:event_updated',
  EVENT_DELETED: 'social:event_deleted',
  EVENT_STARTED: 'social:event_started',
  EVENT_ENDED: 'social:event_ended',
  EVENT_JOINED: 'social:event_joined',
  EVENT_LEFT: 'social:event_left',
  PARTY_CREATED: 'social:party_created',
  PARTY_UPDATED: 'social:party_updated',
  PARTY_DELETED: 'social:party_deleted',
  PARTY_JOINED: 'social:party_joined',
  PARTY_LEFT: 'social:party_left',
  INTERACTION_CREATED: 'social:interaction_created',
  INTERACTION_UPDATED: 'social:interaction_updated',
  INTERACTION_DELETED: 'social:interaction_deleted',
  REACTION_ADDED: 'social:reaction_added',
  REACTION_REMOVED: 'social:reaction_removed',
  RULE_VIOLATION: 'social:rule_violation',
  RULE_ACTION: 'social:rule_action',
  REWARD_CLAIMED: 'social:reward_claimed',
  ACHIEVEMENT_UNLOCKED: 'social:achievement_unlocked',
  STATS_UPDATED: 'social:stats_updated'
} as const;

export const SOCIAL_NOTIFICATIONS = {
  HUB_INVITATION: 'hub_invitation',
  EVENT_INVITATION: 'event_invitation',
  PARTY_INVITATION: 'party_invitation',
  EVENT_STARTING: 'event_starting',
  EVENT_ENDING: 'event_ending',
  PARTY_UPDATE: 'party_update',
  REWARD_AVAILABLE: 'reward_available',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  RULE_VIOLATION: 'rule_violation',
  RULE_ACTION: 'rule_action',
  INTERACTION_RECEIVED: 'interaction_received',
  REACTION_RECEIVED: 'reaction_received'
} as const;
