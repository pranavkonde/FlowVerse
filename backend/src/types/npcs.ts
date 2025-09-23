export interface NPC {
  id: string;
  name: string;
  type: 'merchant' | 'quest_giver' | 'guard' | 'citizen' | 'guide';
  personality: {
    traits: string[];
    mood: 'happy' | 'neutral' | 'sad' | 'angry' | 'excited';
    friendliness: number; // 0-100
    intelligence: number; // 0-100
    humor: number; // 0-100
  };
  appearance: {
    avatar: string;
    color: string;
    size: 'small' | 'medium' | 'large';
    accessories: string[];
  };
  location: {
    x: number;
    y: number;
    area: string;
    isStationary: boolean;
    patrolPath?: Array<{ x: number; y: number }>;
  };
  dialogue: {
    greetings: string[];
    farewells: string[];
    topics: NPCTopic[];
    currentConversation?: NPCConversation;
  };
  quests: NPCQuest[];
  inventory: NPCItem[];
  stats: {
    level: number;
    experience: number;
    health: number;
    maxHealth: number;
  };
  behavior: {
    movementPattern: 'stationary' | 'patrol' | 'wander' | 'follow';
    reactionRadius: number;
    interactionCooldown: number; // in seconds
    lastInteraction?: Date;
  };
  isActive: boolean;
  createdAt: Date;
  lastSeen: Date;
}

export interface NPCTopic {
  id: string;
  name: string;
  description: string;
  responses: string[];
  conditions?: {
    playerLevel?: number;
    completedQuests?: string[];
    hasItems?: string[];
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  triggers: {
    keywords: string[];
    emotions: string[];
  };
}

export interface NPCConversation {
  id: string;
  npcId: string;
  playerId: string;
  startTime: Date;
  endTime?: Date;
  messages: NPCConversationMessage[];
  currentTopic?: string;
  mood: string;
  isActive: boolean;
}

export interface NPCConversationMessage {
  id: string;
  speaker: 'npc' | 'player';
  message: string;
  timestamp: Date;
  emotion?: string;
  topic?: string;
}

export interface NPCQuest {
  id: string;
  title: string;
  description: string;
  type: 'fetch' | 'kill' | 'explore' | 'talk' | 'craft';
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  rewards: {
    experience: number;
    tokens: number;
    items: string[];
    reputation?: number;
  };
  requirements: {
    level?: number;
    completedQuests?: string[];
    items?: Array<{ id: string; quantity: number }>;
  };
  objectives: NPCQuestObjective[];
  status: 'available' | 'active' | 'completed' | 'failed';
  timeLimit?: number; // in minutes
  createdAt: Date;
}

export interface NPCQuestObjective {
  id: string;
  description: string;
  type: 'collect' | 'defeat' | 'reach' | 'talk' | 'use';
  target: string;
  quantity: number;
  current: number;
  isCompleted: boolean;
}

export interface NPCItem {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'misc' | 'quest';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  price: number;
  quantity: number;
  stats?: {
    damage?: number;
    defense?: number;
    health?: number;
    mana?: number;
  };
  effects?: string[];
}

export interface NPCInteraction {
  id: string;
  npcId: string;
  playerId: string;
  type: 'talk' | 'trade' | 'quest' | 'combat' | 'gift';
  timestamp: Date;
  duration: number; // in seconds
  outcome: 'success' | 'failure' | 'neutral';
  data: any;
}

export interface NPCBehavior {
  id: string;
  npcId: string;
  type: 'movement' | 'dialogue' | 'quest_generation' | 'mood_change';
  trigger: {
    time?: number; // seconds
    playerProximity?: number;
    event?: string;
    condition?: any;
  };
  action: {
    type: string;
    parameters: any;
  };
  cooldown: number; // in seconds
  lastExecuted?: Date;
  isActive: boolean;
}

export interface NPCAIState {
  npcId: string;
  currentGoal: string;
  emotionalState: string;
  memory: Array<{
    event: string;
    timestamp: Date;
    importance: number; // 0-100
    details: any;
  }>;
  relationships: Record<string, {
    playerId: string;
    relationship: 'stranger' | 'acquaintance' | 'friend' | 'ally' | 'enemy';
    trust: number; // 0-100
    lastInteraction: Date;
    interactionCount: number;
  }>;
  knowledge: {
    topics: string[];
    secrets: string[];
    rumors: string[];
  };
}
