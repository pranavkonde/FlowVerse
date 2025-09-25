export interface CombatParticipant {
  id: string;
  playerId: string;
  playerName: string;
  character: CombatCharacter;
  isAI: boolean;
  isActive: boolean;
  currentHealth: number;
  maxHealth: number;
  currentMana: number;
  maxMana: number;
  currentStamina: number;
  maxStamina: number;
  statusEffects: StatusEffect[];
  availableSkills: CombatSkill[];
  usedSkills: string[];
  turnOrder: number;
  stats: CombatStats;
  equipment: EquipmentSet;
  position: CombatPosition;
}

export interface CombatCharacter {
  id: string;
  name: string;
  level: number;
  class: CharacterClass;
  stats: CharacterStats;
  skills: CombatSkill[];
  equipment: EquipmentSet;
  appearance: CharacterAppearance;
  isPlayer: boolean;
  createdAt: Date;
  lastModified: Date;
}

export interface CharacterStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  strength: number;
  agility: number;
  vitality: number;
  wisdom: number;
  luck: number;
  criticalChance: number;
  criticalDamage: number;
  dodgeChance: number;
  blockChance: number;
  accuracy: number;
  resistance: ResistanceStats;
}

export interface ResistanceStats {
  fire: number;
  water: number;
  earth: number;
  air: number;
  ice: number;
  thunder: number;
  light: number;
  dark: number;
  physical: number;
  magical: number;
}

export interface CombatSkill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  category: SkillCategory;
  level: number;
  maxLevel: number;
  experience: number;
  experienceToNext: number;
  cooldown: number;
  manaCost: number;
  staminaCost: number;
  damage: number;
  healing: number;
  range: number;
  areaOfEffect: number;
  effects: SkillEffect[];
  requirements: SkillRequirement[];
  isUnlocked: boolean;
  isActive: boolean;
  metadata: SkillMetadata;
}

export interface SkillEffect {
  type: EffectType;
  value: number;
  duration: number;
  target: EffectTarget;
  description: string;
  isPositive: boolean;
  canStack: boolean;
  maxStacks: number;
}

export interface SkillRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface SkillMetadata {
  icon: string;
  animation: string;
  soundEffect?: string;
  visualEffect?: string;
  category: string;
  tags: string[];
  rarity: ItemRarity;
  source: string;
}

export interface EquipmentSet {
  weapon: Equipment | null;
  armor: Equipment | null;
  helmet: Equipment | null;
  boots: Equipment | null;
  gloves: Equipment | null;
  accessory: Equipment | null;
  ring: Equipment | null;
  amulet: Equipment | null;
  shield: Equipment | null;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  type: EquipmentType;
  rarity: ItemRarity;
  level: number;
  stats: EquipmentStats;
  effects: EquipmentEffect[];
  requirements: EquipmentRequirement[];
  durability: number;
  maxDurability: number;
  isEquipped: boolean;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
  metadata: EquipmentMetadata;
}

export interface EquipmentStats {
  health: number;
  mana: number;
  stamina: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  strength: number;
  agility: number;
  vitality: number;
  wisdom: number;
  luck: number;
  criticalChance: number;
  criticalDamage: number;
  dodgeChance: number;
  blockChance: number;
  accuracy: number;
  resistance: Partial<ResistanceStats>;
}

export interface EquipmentEffect {
  type: EffectType;
  value: number;
  duration: number;
  description: string;
  isActive: boolean;
  trigger: EffectTrigger;
  condition: EffectCondition;
}

export interface EquipmentRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface EquipmentMetadata {
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  tags: string[];
  category: string;
  source: string;
  seasonalAvailability?: string[];
  weatherDependency?: string[];
}

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  type: EffectType;
  value: number;
  duration: number;
  remainingTurns: number;
  isPositive: boolean;
  canStack: boolean;
  currentStacks: number;
  maxStacks: number;
  source: string;
  sourceId: string;
  metadata: StatusEffectMetadata;
}

export interface StatusEffectMetadata {
  icon: string;
  color: string;
  animation?: string;
  soundEffect?: string;
  visualEffect?: string;
  category: string;
  tags: string[];
}

export interface CombatBattle {
  id: string;
  type: BattleType;
  participants: CombatParticipant[];
  currentTurn: number;
  maxTurns: number;
  status: BattleStatus;
  winner?: string;
  rewards: BattleReward[];
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  arena: CombatArena;
  weather: WeatherEffect;
  specialRules: SpecialRule[];
  spectators: string[];
  isRanked: boolean;
  ratingChange?: number;
  tournamentId?: string;
  metadata: BattleMetadata;
}

export interface CombatArena {
  id: string;
  name: string;
  description: string;
  size: ArenaSize;
  terrain: TerrainType;
  obstacles: ArenaObstacle[];
  effects: ArenaEffect[];
  isActive: boolean;
  metadata: ArenaMetadata;
}

export interface ArenaObstacle {
  id: string;
  name: string;
  type: ObstacleType;
  position: CombatPosition;
  size: ObstacleSize;
  effects: ObstacleEffect[];
  isDestructible: boolean;
  health: number;
  maxHealth: number;
  metadata: ObstacleMetadata;
}

export interface ArenaEffect {
  type: EffectType;
  value: number;
  duration: number;
  area: EffectArea;
  description: string;
  isActive: boolean;
  trigger: EffectTrigger;
}

export interface WeatherEffect {
  type: WeatherType;
  intensity: number;
  effects: WeatherEffectDetail[];
  duration: number;
  remainingTurns: number;
  isActive: boolean;
  metadata: WeatherMetadata;
}

export interface WeatherEffectDetail {
  type: EffectType;
  value: number;
  description: string;
  affects: string[];
}

export interface SpecialRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  effects: RuleEffect[];
  conditions: RuleCondition[];
  isActive: boolean;
  metadata: RuleMetadata;
}

export interface RuleEffect {
  type: EffectType;
  value: number;
  description: string;
  target: EffectTarget;
}

export interface RuleCondition {
  type: ConditionType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface CombatPosition {
  x: number;
  y: number;
  z: number;
  facing: Direction;
}

export interface CombatStats {
  damageDealt: number;
  damageReceived: number;
  healingDone: number;
  healingReceived: number;
  skillsUsed: number;
  criticalHits: number;
  misses: number;
  dodges: number;
  blocks: number;
  statusEffectsApplied: number;
  statusEffectsReceived: number;
  turnsTaken: number;
  timeSpent: number;
  kills: number;
  deaths: number;
  assists: number;
}

export interface BattleReward {
  type: RewardType;
  itemId?: string;
  amount: number;
  rarity: ItemRarity;
  description: string;
  isClaimed: boolean;
  metadata: RewardMetadata;
}

export interface RewardMetadata {
  source: string;
  category: string;
  tags: string[];
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
}

export interface BattleMetadata {
  category: string;
  tags: string[];
  isFeatured: boolean;
  isUrgent: boolean;
  specialOffers: string[];
  location: string;
  difficulty: BattleDifficulty;
  recommendedLevel: number;
  estimatedDuration: number;
}

export interface CharacterAppearance {
  avatar: string;
  color: string;
  size: CharacterSize;
  accessories: string[];
  customizations: CharacterCustomization[];
  animations: CharacterAnimation[];
  isShiny: boolean;
  variant: string;
}

export interface CharacterCustomization {
  id: string;
  type: CustomizationType;
  value: string;
  cost: number;
  isApplied: boolean;
  description: string;
}

export interface CharacterAnimation {
  id: string;
  name: string;
  type: AnimationType;
  duration: number;
  loop: boolean;
  trigger: AnimationTrigger;
  metadata: AnimationMetadata;
}

export interface AnimationMetadata {
  duration: number;
  loop: boolean;
  frameRate: number;
  soundEffect?: string;
  visualEffect?: string;
  category: string;
  tags: string[];
}

export interface ObstacleEffect {
  type: EffectType;
  value: number;
  duration: number;
  description: string;
  isActive: boolean;
}

export interface ObstacleMetadata {
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  tags: string[];
  category: string;
  isDestructible: boolean;
  baseValue: number;
}

export interface ArenaMetadata {
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  tags: string[];
  category: string;
  isActive: boolean;
  baseValue: number;
}

export interface WeatherMetadata {
  icon: string;
  color: string;
  animation?: string;
  soundEffect?: string;
  visualEffect?: string;
  category: string;
  tags: string[];
}

export interface RuleMetadata {
  icon: string;
  color: string;
  category: string;
  tags: string[];
  isActive: boolean;
}

export interface CombatTraining {
  id: string;
  participantId: string;
  skillId: string;
  type: TrainingType;
  duration: number;
  progress: number;
  maxProgress: number;
  status: TrainingStatus;
  startedAt: Date;
  completedAt?: Date;
  rewards: TrainingReward[];
  requirements: TrainingRequirement[];
  metadata: TrainingMetadata;
}

export interface TrainingReward {
  type: RewardType;
  amount: number;
  description: string;
  isClaimed: boolean;
}

export interface TrainingRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface TrainingMetadata {
  difficulty: TrainingDifficulty;
  category: string;
  instructor?: string;
  location: string;
  equipment: string[];
  notes: string;
}

export interface CombatAchievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: ItemRarity;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  metadata: AchievementMetadata;
}

export interface AchievementRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface AchievementReward {
  type: RewardType;
  itemId?: string;
  amount: number;
  rarity: ItemRarity;
  description: string;
}

export interface AchievementMetadata {
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

export interface CombatLeaderboard {
  id: string;
  name: string;
  description: string;
  type: LeaderboardType;
  category: LeaderboardCategory;
  timeFrame: TimeFrame;
  entries: LeaderboardEntry[];
  lastUpdated: Date;
  isActive: boolean;
  metadata: LeaderboardMetadata;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  stats: CombatStats;
  character: CombatCharacter;
  lastActivity: Date;
  metadata: EntryMetadata;
}

export interface EntryMetadata {
  avatar: string;
  level: number;
  class: CharacterClass;
  achievements: string[];
  isOnline: boolean;
  lastSeen: Date;
}

export interface LeaderboardMetadata {
  category: string;
  tags: string[];
  isActive: boolean;
  updateFrequency: number;
  maxEntries: number;
}

export interface CombatTournament {
  id: string;
  name: string;
  description: string;
  type: TournamentType;
  status: TournamentStatus;
  participants: TournamentParticipant[];
  brackets: TournamentBracket[];
  currentRound: number;
  maxRounds: number;
  rewards: TournamentReward[];
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  metadata: TournamentMetadata;
}

export interface TournamentParticipant {
  id: string;
  playerId: string;
  playerName: string;
  character: CombatCharacter;
  seed: number;
  wins: number;
  losses: number;
  isEliminated: boolean;
  currentRound: number;
  stats: CombatStats;
  metadata: ParticipantMetadata;
}

export interface TournamentBracket {
  id: string;
  round: number;
  matches: TournamentMatch[];
  isComplete: boolean;
  metadata: BracketMetadata;
}

export interface TournamentMatch {
  id: string;
  participants: string[];
  winner?: string;
  battleId?: string;
  status: MatchStatus;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  metadata: MatchMetadata;
}

export interface TournamentReward {
  type: RewardType;
  itemId?: string;
  amount: number;
  rarity: ItemRarity;
  description: string;
  position: number;
  isClaimed: boolean;
  metadata: RewardMetadata;
}

export interface ParticipantMetadata {
  avatar: string;
  level: number;
  class: CharacterClass;
  achievements: string[];
  isOnline: boolean;
  lastSeen: Date;
}

export interface BracketMetadata {
  round: number;
  isComplete: boolean;
  totalMatches: number;
  completedMatches: number;
}

export interface MatchMetadata {
  category: string;
  tags: string[];
  isFeatured: boolean;
  isUrgent: boolean;
  specialOffers: string[];
  location: string;
  difficulty: BattleDifficulty;
  estimatedDuration: number;
}

export interface TournamentMetadata {
  category: string;
  tags: string[];
  isFeatured: boolean;
  isUrgent: boolean;
  specialOffers: string[];
  location: string;
  difficulty: BattleDifficulty;
  recommendedLevel: number;
  estimatedDuration: number;
  maxParticipants: number;
  entryFee: number;
  prizePool: number;
}

// Enums and Types
export type CharacterClass = 
  | 'warrior'
  | 'mage'
  | 'archer'
  | 'rogue'
  | 'paladin'
  | 'priest'
  | 'monk'
  | 'berserker'
  | 'assassin'
  | 'necromancer'
  | 'elementalist'
  | 'bard'
  | 'druid'
  | 'ranger'
  | 'knight'
  | 'warlock'
  | 'shaman'
  | 'hunter'
  | 'guardian'
  | 'templar';

export type SkillType = 
  | 'attack'
  | 'defense'
  | 'healing'
  | 'buff'
  | 'debuff'
  | 'utility'
  | 'special'
  | 'ultimate'
  | 'passive'
  | 'aura';

export type SkillCategory = 
  | 'combat'
  | 'magic'
  | 'support'
  | 'movement'
  | 'survival'
  | 'social'
  | 'crafting'
  | 'exploration'
  | 'specialization'
  | 'mastery';

export type EffectType = 
  | 'damage'
  | 'healing'
  | 'buff'
  | 'debuff'
  | 'status'
  | 'environmental'
  | 'special'
  | 'movement'
  | 'resource'
  | 'cooldown';

export type EffectTarget = 
  | 'self'
  | 'enemy'
  | 'ally'
  | 'all_enemies'
  | 'all_allies'
  | 'random'
  | 'area'
  | 'line'
  | 'cone'
  | 'chain';

export type EffectTrigger = 
  | 'on_hit'
  | 'on_crit'
  | 'on_kill'
  | 'on_damage'
  | 'on_heal'
  | 'on_death'
  | 'on_spawn'
  | 'on_turn_start'
  | 'on_turn_end'
  | 'on_skill_use'
  | 'on_equipment_change'
  | 'on_level_up'
  | 'passive';

export type EffectCondition = 
  | 'always'
  | 'health_below'
  | 'health_above'
  | 'mana_below'
  | 'mana_above'
  | 'stamina_below'
  | 'stamina_above'
  | 'has_status'
  | 'no_status'
  | 'enemy_count'
  | 'ally_count'
  | 'turn_count'
  | 'skill_count';

export type EffectArea = 
  | 'single'
  | 'line'
  | 'cone'
  | 'circle'
  | 'square'
  | 'cross'
  | 'diamond'
  | 'all';

export type RequirementType = 
  | 'level'
  | 'skill_level'
  | 'item_owned'
  | 'achievement'
  | 'reputation'
  | 'quest_completion'
  | 'time_played'
  | 'character_level'
  | 'class_level'
  | 'battle_wins'
  | 'training_hours'
  | 'care_hours'
  | 'equipment_owned'
  | 'stat_value'
  | 'currency_amount';

export type EquipmentType = 
  | 'weapon'
  | 'armor'
  | 'helmet'
  | 'boots'
  | 'gloves'
  | 'accessory'
  | 'ring'
  | 'amulet'
  | 'shield'
  | 'consumable'
  | 'material'
  | 'tool'
  | 'special';

export type ItemRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'divine'
  | 'ancient'
  | 'artifact'
  | 'unique';

export type BattleType = 
  | 'pvp'
  | 'pve'
  | 'tournament'
  | 'training'
  | 'friendly'
  | 'ranked'
  | 'casual'
  | 'boss'
  | 'raid'
  | 'guild_war'
  | 'duel'
  | 'team_battle'
  | 'battle_royale'
  | 'capture_the_flag'
  | 'king_of_the_hill';

export type BattleStatus = 
  | 'waiting'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'forfeited'
  | 'timeout'
  | 'disconnected'
  | 'error';

export type BattleDifficulty = 
  | 'beginner'
  | 'easy'
  | 'normal'
  | 'hard'
  | 'expert'
  | 'master'
  | 'nightmare'
  | 'hell'
  | 'inferno';

export type ArenaSize = 
  | 'small'
  | 'medium'
  | 'large'
  | 'huge'
  | 'massive';

export type TerrainType = 
  | 'grassland'
  | 'forest'
  | 'desert'
  | 'mountain'
  | 'swamp'
  | 'tundra'
  | 'volcanic'
  | 'crystal'
  | 'void'
  | 'cosmic'
  | 'underwater'
  | 'underground'
  | 'sky'
  | 'space';

export type ObstacleType = 
  | 'wall'
  | 'pillar'
  | 'rock'
  | 'tree'
  | 'water'
  | 'fire'
  | 'ice'
  | 'electric'
  | 'poison'
  | 'magic'
  | 'crystal'
  | 'portal'
  | 'trap'
  | 'barrier';

export type ObstacleSize = 
  | 'tiny'
  | 'small'
  | 'medium'
  | 'large'
  | 'huge'
  | 'gigantic';

export type WeatherType = 
  | 'clear'
  | 'rain'
  | 'snow'
  | 'fog'
  | 'storm'
  | 'sandstorm'
  | 'blizzard'
  | 'heatwave'
  | 'aurora'
  | 'meteor_shower'
  | 'solar_flare'
  | 'cosmic_storm'
  | 'void_rift'
  | 'magical_anomaly';

export type RuleType = 
  | 'damage_modifier'
  | 'healing_modifier'
  | 'cooldown_modifier'
  | 'mana_cost_modifier'
  | 'stamina_cost_modifier'
  | 'movement_restriction'
  | 'skill_restriction'
  | 'equipment_restriction'
  | 'time_limit'
  | 'turn_limit'
  | 'special_condition';

export type ConditionType = 
  | 'health_threshold'
  | 'mana_threshold'
  | 'stamina_threshold'
  | 'turn_count'
  | 'skill_count'
  | 'damage_dealt'
  | 'damage_received'
  | 'healing_done'
  | 'status_effect_count'
  | 'enemy_count'
  | 'ally_count'
  | 'equipment_count'
  | 'level_difference'
  | 'class_restriction';

export type Direction = 
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'northeast'
  | 'northwest'
  | 'southeast'
  | 'southwest'
  | 'up'
  | 'down';

export type RewardType = 
  | 'experience'
  | 'gold'
  | 'item'
  | 'achievement'
  | 'skill_point'
  | 'buff'
  | 'cosmetic'
  | 'currency'
  | 'equipment'
  | 'material'
  | 'consumable'
  | 'title'
  | 'badge'
  | 'emote'
  | 'mount'
  | 'pet';

export type CustomizationType = 
  | 'color'
  | 'pattern'
  | 'size'
  | 'texture'
  | 'material'
  | 'finish'
  | 'accessory'
  | 'animation'
  | 'sound'
  | 'effect'
  | 'emote'
  | 'voice'
  | 'personality'
  | 'behavior';

export type AnimationType = 
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'attack'
  | 'defend'
  | 'heal'
  | 'cast'
  | 'dodge'
  | 'block'
  | 'parry'
  | 'crit'
  | 'miss'
  | 'death'
  | 'victory'
  | 'defeat'
  | 'emote'
  | 'special';

export type AnimationTrigger = 
  | 'automatic'
  | 'manual'
  | 'battle'
  | 'interaction'
  | 'emotion'
  | 'skill'
  | 'environmental'
  | 'time_based'
  | 'health_based'
  | 'mana_based'
  | 'stamina_based';

export type CharacterSize = 
  | 'tiny'
  | 'small'
  | 'medium'
  | 'large'
  | 'huge'
  | 'gigantic';

export type TrainingType = 
  | 'skill'
  | 'stat'
  | 'behavior'
  | 'trick'
  | 'obedience'
  | 'agility'
  | 'intelligence'
  | 'socialization'
  | 'specialization'
  | 'mastery'
  | 'combat'
  | 'magic'
  | 'survival'
  | 'crafting';

export type TrainingStatus = 
  | 'not_started'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TrainingDifficulty = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'master'
  | 'grandmaster'
  | 'legendary'
  | 'mythic';

export type AchievementCategory = 
  | 'battle'
  | 'training'
  | 'care'
  | 'collection'
  | 'social'
  | 'exploration'
  | 'breeding'
  | 'special_events'
  | 'milestones'
  | 'mastery'
  | 'combat'
  | 'pvp'
  | 'pve'
  | 'tournament'
  | 'guild'
  | 'quest'
  | 'crafting'
  | 'trading';

export type LeaderboardType = 
  | 'overall'
  | 'weekly'
  | 'monthly'
  | 'seasonal'
  | 'all_time'
  | 'class_specific'
  | 'level_specific'
  | 'guild_specific'
  | 'tournament_specific';

export type LeaderboardCategory = 
  | 'combat'
  | 'pvp'
  | 'pve'
  | 'tournament'
  | 'guild_war'
  | 'duel'
  | 'team_battle'
  | 'battle_royale'
  | 'capture_the_flag'
  | 'king_of_the_hill'
  | 'training'
  | 'achievements'
  | 'experience'
  | 'wealth'
  | 'social';

export type TimeFrame = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'seasonal'
  | 'yearly'
  | 'all_time'
  | 'custom';

export type TournamentType = 
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss'
  | 'battle_royale'
  | 'team_based'
  | 'class_restricted'
  | 'level_restricted'
  | 'open'
  | 'invitational'
  | 'qualifier'
  | 'championship';

export type TournamentStatus = 
  | 'upcoming'
  | 'registration_open'
  | 'registration_closed'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'paused'
  | 'postponed';

export type MatchStatus = 
  | 'scheduled'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'forfeited'
  | 'disconnected'
  | 'error';

// Constants
export const COMBAT_EVENTS = {
  BATTLE_STARTED: 'combat:battle_started',
  BATTLE_ENDED: 'combat:battle_ended',
  TURN_STARTED: 'combat:turn_started',
  TURN_ENDED: 'combat:turn_ended',
  SKILL_USED: 'combat:skill_used',
  DAMAGE_DEALT: 'combat:damage_dealt',
  HEALING_DONE: 'combat:healing_done',
  STATUS_EFFECT_APPLIED: 'combat:status_effect_applied',
  STATUS_EFFECT_REMOVED: 'combat:status_effect_removed',
  PARTICIPANT_ELIMINATED: 'combat:participant_eliminated',
  CRITICAL_HIT: 'combat:critical_hit',
  MISS: 'combat:miss',
  DODGE: 'combat:dodge',
  BLOCK: 'combat:block',
  PARRY: 'combat:parry',
  EQUIPMENT_EQUIPPED: 'combat:equipment_equipped',
  EQUIPMENT_UNEQUIPPED: 'combat:equipment_unequipped',
  SKILL_LEARNED: 'combat:skill_learned',
  SKILL_LEVELED_UP: 'combat:skill_leveled_up',
  CHARACTER_LEVELED_UP: 'combat:character_leveled_up',
  ACHIEVEMENT_UNLOCKED: 'combat:achievement_unlocked',
  TOURNAMENT_STARTED: 'combat:tournament_started',
  TOURNAMENT_ENDED: 'combat:tournament_ended',
  MATCH_STARTED: 'combat:match_started',
  MATCH_ENDED: 'combat:match_ended',
  LEADERBOARD_UPDATED: 'combat:leaderboard_updated'
} as const;

export const COMBAT_NOTIFICATIONS = {
  BATTLE_INVITATION: 'combat_battle_invitation',
  TOURNAMENT_REGISTRATION: 'combat_tournament_registration',
  TOURNAMENT_STARTED: 'combat_tournament_started',
  TOURNAMENT_ENDED: 'combat_tournament_ended',
  MATCH_SCHEDULED: 'combat_match_scheduled',
  MATCH_STARTED: 'combat_match_started',
  MATCH_ENDED: 'combat_match_ended',
  ACHIEVEMENT_UNLOCKED: 'combat_achievement_unlocked',
  SKILL_LEARNED: 'combat_skill_learned',
  EQUIPMENT_EQUIPPED: 'combat_equipment_equipped',
  LEADERBOARD_UPDATE: 'combat_leaderboard_update',
  RANK_CHANGE: 'combat_rank_change',
  REWARD_CLAIMED: 'combat_reward_claimed'
} as const;
