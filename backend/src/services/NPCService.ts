import { NPC, NPCConversation, NPCInteraction, NPCBehavior, NPCAIState } from '../types/npcs';

export class NPCService {
  private npcs: Map<string, NPC> = new Map();
  private conversations: Map<string, NPCConversation> = new Map();
  private interactions: NPCInteraction[] = [];
  private behaviors: Map<string, NPCBehavior[]> = new Map();
  private aiStates: Map<string, NPCAIState> = new Map();

  constructor() {
    this.initializeNPCs();
    this.initializeBehaviors();
    this.initializeAIStates();
    this.startBehaviorLoop();
  }

  private initializeNPCs(): void {
    const sampleNPCs: NPC[] = [
      {
        id: 'merchant_001',
        name: 'Gareth the Trader',
        type: 'merchant',
        personality: {
          traits: ['greedy', 'friendly', 'talkative'],
          mood: 'happy',
          friendliness: 75,
          intelligence: 60,
          humor: 40
        },
        appearance: {
          avatar: '🧙‍♂️',
          color: '#8B4513',
          size: 'medium',
          accessories: ['hat', 'bag']
        },
        location: {
          x: 200,
          y: 150,
          area: 'marketplace',
          isStationary: true
        },
        dialogue: {
          greetings: [
            'Welcome, traveler! What can I sell you today?',
            'Ah, a new face! Come, browse my wares!',
            'Greetings! I have the finest goods in all the land!'
          ],
          farewells: [
            'Safe travels, friend!',
            'Come back soon!',
            'May your journey be profitable!'
          ],
          topics: [
            {
              id: 'trading',
              name: 'Trading',
              description: 'Discuss buying and selling items',
              responses: [
                'I have many fine items for sale!',
                'What are you looking to buy?',
                'My prices are very reasonable!'
              ],
              triggers: {
                keywords: ['buy', 'sell', 'trade', 'price', 'item'],
                emotions: ['curious', 'interested']
              }
            }
          ]
        },
        quests: [],
        inventory: [
          {
            id: 'health_potion',
            name: 'Health Potion',
            description: 'Restores 50 health points',
            type: 'consumable',
            rarity: 'common',
            price: 25,
            quantity: 10,
            effects: ['heal_50']
          }
        ],
        stats: {
          level: 5,
          experience: 1000,
          health: 100,
          maxHealth: 100
        },
        behavior: {
          movementPattern: 'stationary',
          reactionRadius: 50,
          interactionCooldown: 5
        },
        isActive: true,
        createdAt: new Date(),
        lastSeen: new Date()
      },
      {
        id: 'quest_giver_001',
        name: 'Elder Marcus',
        type: 'quest_giver',
        personality: {
          traits: ['wise', 'patient', 'mysterious'],
          mood: 'neutral',
          friendliness: 85,
          intelligence: 95,
          humor: 20
        },
        appearance: {
          avatar: '🧙‍♂️',
          color: '#4B0082',
          size: 'large',
          accessories: ['staff', 'robe']
        },
        location: {
          x: 100,
          y: 200,
          area: 'temple',
          isStationary: true
        },
        dialogue: {
          greetings: [
            'Greetings, young one. I sense great potential in you.',
            'Welcome to the temple. I have been expecting you.',
            'Ah, another seeker of knowledge. How may I help?'
          ],
          farewells: [
            'May wisdom guide your path.',
            'Return when you are ready for more challenges.',
            'The journey of a thousand miles begins with a single step.'
          ],
          topics: [
            {
              id: 'quests',
              name: 'Quests',
              description: 'Discuss available quests and missions',
              responses: [
                'I have several tasks that need completion.',
                'There are many challenges awaiting brave souls.',
                'The realm needs heroes like you.'
              ],
              triggers: {
                keywords: ['quest', 'mission', 'task', 'challenge', 'help'],
                emotions: ['determined', 'curious']
              }
            }
          ]
        },
        quests: [
          {
            id: 'first_quest',
            title: 'The First Step',
            description: 'Prove your worth by collecting 5 herbs from the nearby forest.',
            type: 'fetch',
            difficulty: 'easy',
            rewards: {
              experience: 100,
              tokens: 50,
              items: ['health_potion']
            },
            requirements: {
              level: 1
            },
            objectives: [
              {
                id: 'collect_herbs',
                description: 'Collect 5 healing herbs',
                type: 'collect',
                target: 'healing_herb',
                quantity: 5,
                current: 0,
                isCompleted: false
              }
            ],
            status: 'available',
            createdAt: new Date()
          }
        ],
        inventory: [],
        stats: {
          level: 20,
          experience: 50000,
          health: 200,
          maxHealth: 200
        },
        behavior: {
          movementPattern: 'stationary',
          reactionRadius: 80,
          interactionCooldown: 10
        },
        isActive: true,
        createdAt: new Date(),
        lastSeen: new Date()
      }
    ];

    sampleNPCs.forEach(npc => {
      this.npcs.set(npc.id, npc);
    });
  }

  private initializeBehaviors(): void {
    const behaviors: NPCBehavior[] = [
      {
        id: 'merchant_greeting',
        npcId: 'merchant_001',
        type: 'dialogue',
        trigger: {
          playerProximity: 30
        },
        action: {
          type: 'greet_player',
          parameters: { greetingType: 'friendly' }
        },
        cooldown: 30,
        isActive: true
      },
      {
        id: 'quest_giver_quest_check',
        npcId: 'quest_giver_001',
        type: 'quest_generation',
        trigger: {
          time: 300 // Every 5 minutes
        },
        action: {
          type: 'check_quest_availability',
          parameters: {}
        },
        cooldown: 300,
        isActive: true
      }
    ];

    behaviors.forEach(behavior => {
      const npcBehaviors = this.behaviors.get(behavior.npcId) || [];
      npcBehaviors.push(behavior);
      this.behaviors.set(behavior.npcId, npcBehaviors);
    });
  }

  private initializeAIStates(): void {
    this.npcs.forEach(npc => {
      const aiState: NPCAIState = {
        npcId: npc.id,
        currentGoal: 'idle',
        emotionalState: npc.personality.mood,
        memory: [],
        relationships: {},
        knowledge: {
          topics: npc.dialogue.topics.map(t => t.name),
          secrets: [],
          rumors: []
        }
      };
      this.aiStates.set(npc.id, aiState);
    });
  }

  private startBehaviorLoop(): void {
    setInterval(() => {
      this.processBehaviors();
    }, 1000); // Check every second
  }

  private processBehaviors(): void {
    this.behaviors.forEach((behaviors, npcId) => {
      behaviors.forEach(behavior => {
        if (!behavior.isActive) return;
        
        const now = new Date();
        const lastExecuted = behavior.lastExecuted;
        
        // Check cooldown
        if (lastExecuted && (now.getTime() - lastExecuted.getTime()) < behavior.cooldown * 1000) {
          return;
        }

        // Check trigger conditions
        if (this.checkBehaviorTrigger(behavior)) {
          this.executeBehavior(behavior);
          behavior.lastExecuted = now;
        }
      });
    });
  }

  private checkBehaviorTrigger(behavior: NPCBehavior): boolean {
    const trigger = behavior.trigger;
    
    if (trigger.time) {
      // Time-based trigger
      return true; // Simplified - would check actual time conditions
    }
    
    if (trigger.playerProximity) {
      // Player proximity trigger
      return this.checkPlayerProximity(behavior.npcId, trigger.playerProximity);
    }
    
    if (trigger.event) {
      // Event-based trigger
      return this.checkEventTrigger(trigger.event);
    }
    
    return false;
  }

  private checkPlayerProximity(npcId: string, radius: number): boolean {
    // Simplified - in a real implementation, this would check actual player positions
    return Math.random() < 0.1; // 10% chance for demo
  }

  private checkEventTrigger(event: string): boolean {
    // Check if the specified event has occurred
    return false; // Simplified
  }

  private executeBehavior(behavior: NPCBehavior): void {
    const npc = this.npcs.get(behavior.npcId);
    if (!npc) return;

    switch (behavior.action.type) {
      case 'greet_player':
        this.greetPlayer(npc);
        break;
      case 'check_quest_availability':
        this.checkQuestAvailability(npc);
        break;
      case 'change_mood':
        this.changeNPCMood(npc, behavior.action.parameters.mood);
        break;
      case 'move_to_location':
        this.moveNPC(npc, behavior.action.parameters.x, behavior.action.parameters.y);
        break;
    }
  }

  private greetPlayer(npc: NPC): void {
    const greeting = npc.dialogue.greetings[Math.floor(Math.random() * npc.dialogue.greetings.length)];
    console.log(`${npc.name}: ${greeting}`);
  }

  private checkQuestAvailability(npc: NPC): void {
    const availableQuests = npc.quests.filter(quest => quest.status === 'available');
    if (availableQuests.length > 0) {
      console.log(`${npc.name} has ${availableQuests.length} quests available`);
    }
  }

  private changeNPCMood(npc: NPC, mood: string): void {
    npc.personality.mood = mood as any;
    console.log(`${npc.name} mood changed to ${mood}`);
  }

  private moveNPC(npc: NPC, x: number, y: number): void {
    npc.location.x = x;
    npc.location.y = y;
    console.log(`${npc.name} moved to (${x}, ${y})`);
  }

  public getNPCs(): NPC[] {
    return Array.from(this.npcs.values()).filter(npc => npc.isActive);
  }

  public getNPC(npcId: string): NPC | undefined {
    return this.npcs.get(npcId);
  }

  public getNPCsInArea(area: string): NPC[] {
    return this.getNPCs().filter(npc => npc.location.area === area);
  }

  public getNPCsNearPosition(x: number, y: number, radius: number): NPC[] {
    return this.getNPCs().filter(npc => {
      const distance = Math.sqrt(
        Math.pow(npc.location.x - x, 2) + Math.pow(npc.location.y - y, 2)
      );
      return distance <= radius;
    });
  }

  public startConversation(npcId: string, playerId: string): NPCConversation {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      throw new Error('NPC not found');
    }

    // Check interaction cooldown
    const now = new Date();
    if (npc.behavior.lastInteraction) {
      const timeSinceLastInteraction = now.getTime() - npc.behavior.lastInteraction.getTime();
      if (timeSinceLastInteraction < npc.behavior.interactionCooldown * 1000) {
        throw new Error('NPC is not ready for interaction');
      }
    }

    const conversation: NPCConversation = {
      id: this.generateConversationId(),
      npcId,
      playerId,
      startTime: now,
      messages: [],
      mood: npc.personality.mood,
      isActive: true
    };

    this.conversations.set(conversation.id, conversation);
    npc.behavior.lastInteraction = now;

    return conversation;
  }

  public endConversation(conversationId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    conversation.endTime = new Date();
    conversation.isActive = false;

    // Log interaction
    const interaction: NPCInteraction = {
      id: this.generateInteractionId(),
      npcId: conversation.npcId,
      playerId: conversation.playerId,
      type: 'talk',
      timestamp: conversation.startTime,
      duration: conversation.endTime.getTime() - conversation.startTime.getTime(),
      outcome: 'success',
      data: {
        messageCount: conversation.messages.length,
        topics: conversation.messages.map(m => m.topic).filter(Boolean)
      }
    };

    this.interactions.push(interaction);
  }

  public sendMessage(conversationId: string, message: string, speaker: 'npc' | 'player'): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    const conversationMessage = {
      id: this.generateMessageId(),
      speaker,
      message,
      timestamp: new Date()
    };

    conversation.messages.push(conversationMessage);

    if (speaker === 'player') {
      // Process NPC response
      this.processPlayerMessage(conversation, message);
    }
  }

  private processPlayerMessage(conversation: NPCConversation, message: string): void {
    const npc = this.npcs.get(conversation.npcId);
    if (!npc) return;

    // Simple keyword matching for responses
    const lowerMessage = message.toLowerCase();
    let response = "I'm not sure what you mean.";

    for (const topic of npc.dialogue.topics) {
      for (const keyword of topic.triggers.keywords) {
        if (lowerMessage.includes(keyword)) {
          response = topic.responses[Math.floor(Math.random() * topic.responses.length)];
          conversation.currentTopic = topic.name;
          break;
        }
      }
      if (response !== "I'm not sure what you mean.") break;
    }

    // Add response to conversation
    setTimeout(() => {
      this.sendMessage(conversation.id, response, 'npc');
    }, 1000 + Math.random() * 2000);
  }

  public getConversation(conversationId: string): NPCConversation | undefined {
    return this.conversations.get(conversationId);
  }

  public getActiveConversations(playerId: string): NPCConversation[] {
    return Array.from(this.conversations.values())
      .filter(conv => conv.playerId === playerId && conv.isActive);
  }

  public getAIState(npcId: string): NPCAIState | undefined {
    return this.aiStates.get(npcId);
  }

  public getInteractions(playerId?: string): NPCInteraction[] {
    if (playerId) {
      return this.interactions.filter(interaction => interaction.playerId === playerId);
    }
    return this.interactions;
  }

  public getStats(): {
    totalNPCs: number;
    activeNPCs: number;
    totalConversations: number;
    activeConversations: number;
    totalInteractions: number;
  } {
    return {
      totalNPCs: this.npcs.size,
      activeNPCs: this.getNPCs().length,
      totalConversations: this.conversations.size,
      activeConversations: Array.from(this.conversations.values()).filter(conv => conv.isActive).length,
      totalInteractions: this.interactions.length
    };
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInteractionId(): string {
    return `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
