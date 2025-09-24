export interface WorldObject {
  id: string;
  name: string;
  type: ObjectType;
  position: Position;
  size: Size;
  properties: ObjectProperties;
  interactions: Interaction[];
  state: ObjectState;
  metadata: ObjectMetadata;
}

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface Size {
  width: number;
  height: number;
  depth?: number;
}

export interface ObjectProperties {
  isInteractive: boolean;
  isMovable: boolean;
  isCollidable: boolean;
  isVisible: boolean;
  isAnimated: boolean;
  health?: number;
  maxHealth?: number;
  durability?: number;
  maxDurability?: number;
  value?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Interaction {
  id: string;
  type: InteractionType;
  name: string;
  description: string;
  requirements: InteractionRequirement[];
  effects: InteractionEffect[];
  cooldown?: number;
  lastUsed?: Date;
}

export interface InteractionRequirement {
  type: RequirementType;
  value: number;
  itemId?: string;
  description: string;
}

export interface InteractionEffect {
  type: EffectType;
  value: number;
  duration?: number;
  target: 'player' | 'object' | 'world';
  description: string;
}

export interface ObjectState {
  isActive: boolean;
  isBroken: boolean;
  isLocked: boolean;
  currentHealth: number;
  currentDurability: number;
  lastInteraction: Date;
  interactionCount: number;
  customData: Record<string, any>;
}

export interface ObjectMetadata {
  category: string;
  tags: string[];
  description: string;
  lore?: string;
  imageUrl?: string;
  soundEffects?: string[];
  particleEffects?: string[];
  animationData?: AnimationData;
}

export interface AnimationData {
  idle: string;
  interaction: string;
  broken: string;
  custom?: Record<string, string>;
}

export interface WorldEvent {
  id: string;
  name: string;
  type: WorldEventType;
  description: string;
  trigger: EventTrigger;
  effects: WorldEventEffect[];
  duration?: number;
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  participants: string[];
  metadata: WorldEventMetadata;
}

export interface EventTrigger {
  type: TriggerType;
  conditions: TriggerCondition[];
  cooldown?: number;
  lastTriggered?: Date;
}

export interface TriggerCondition {
  type: ConditionType;
  value: number;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  description: string;
}

export interface WorldEventEffect {
  type: WorldEffectType;
  target: 'player' | 'object' | 'area' | 'world';
  value: number;
  duration?: number;
  area?: Area;
  description: string;
}

export interface Area {
  center: Position;
  radius: number;
  shape: 'circle' | 'rectangle' | 'polygon';
  points?: Position[];
}

export interface WorldEventMetadata {
  theme: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  tags: string[];
  imageUrl?: string;
  backgroundMusic?: string;
  specialEffects?: string[];
}

export interface EnvironmentalStory {
  id: string;
  title: string;
  description: string;
  type: StoryType;
  objects: string[];
  events: string[];
  requirements: StoryRequirement[];
  rewards: StoryReward[];
  isCompleted: boolean;
  completionDate?: Date;
  metadata: StoryMetadata;
}

export interface StoryRequirement {
  type: RequirementType;
  value: number;
  objectId?: string;
  eventId?: string;
  description: string;
}

export interface StoryReward {
  id: string;
  type: RewardType;
  amount: number;
  itemId?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

export interface StoryMetadata {
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedTime: number;
  imageUrl?: string;
  audioUrl?: string;
}

export interface WorldInteraction {
  id: string;
  playerId: string;
  objectId: string;
  interactionId: string;
  timestamp: Date;
  result: InteractionResult;
  effects: InteractionEffect[];
}

export interface InteractionResult {
  success: boolean;
  message: string;
  rewards?: StoryReward[];
  newState?: Partial<ObjectState>;
}

export interface WorldStats {
  totalObjects: number;
  interactiveObjects: number;
  activeEvents: number;
  completedStories: number;
  totalInteractions: number;
  popularObjects: { objectId: string; interactionCount: number }[];
  eventTypes: { type: WorldEventType; count: number }[];
}

export type ObjectType = 
  | 'decoration'
  | 'furniture'
  | 'machine'
  | 'container'
  | 'portal'
  | 'collectible'
  | 'tool'
  | 'weapon'
  | 'armor'
  | 'consumable'
  | 'building'
  | 'nature'
  | 'artifact'
  | 'mystery';

export type InteractionType = 
  | 'examine'
  | 'use'
  | 'collect'
  | 'activate'
  | 'repair'
  | 'upgrade'
  | 'trade'
  | 'craft'
  | 'destroy'
  | 'move'
  | 'custom';

export type EffectType = 
  | 'heal'
  | 'damage'
  | 'buff'
  | 'debuff'
  | 'teleport'
  | 'spawn'
  | 'despawn'
  | 'transform'
  | 'reward'
  | 'unlock'
  | 'custom';

export type WorldEventType = 
  | 'environmental'
  | 'seasonal'
  | 'story_driven'
  | 'player_triggered'
  | 'time_based'
  | 'random'
  | 'chain_reaction'
  | 'world_state';

export type TriggerType = 
  | 'proximity'
  | 'interaction'
  | 'time'
  | 'condition'
  | 'random'
  | 'manual'
  | 'chain';

export type ConditionType = 
  | 'player_count'
  | 'object_state'
  | 'time_of_day'
  | 'weather'
  | 'player_level'
  | 'item_owned'
  | 'quest_completed'
  | 'custom';

export type WorldEffectType = 
  | 'spawn_object'
  | 'despawn_object'
  | 'change_weather'
  | 'modify_lighting'
  | 'play_sound'
  | 'show_effect'
  | 'teleport_player'
  | 'modify_object'
  | 'trigger_event'
  | 'custom';

export type StoryType = 
  | 'lore'
  | 'quest'
  | 'mystery'
  | 'collection'
  | 'exploration'
  | 'puzzle'
  | 'social'
  | 'achievement';

export type RequirementType = 
  | 'level'
  | 'item'
  | 'achievement'
  | 'quest'
  | 'time'
  | 'location'
  | 'interaction_count'
  | 'custom';

export type RewardType = 
  | 'experience'
  | 'item'
  | 'currency'
  | 'achievement'
  | 'unlock'
  | 'cosmetic'
  | 'custom';
