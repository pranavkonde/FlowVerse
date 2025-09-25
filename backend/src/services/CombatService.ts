import { Server as SocketIOServer } from 'socket.io';
import {
  CombatBattle,
  CombatParticipant,
  CombatCharacter,
  CombatSkill,
  Equipment,
  EquipmentSet,
  StatusEffect,
  BattleReward,
  CombatArena,
  WeatherEffect,
  SpecialRule,
  CombatStats,
  CharacterStats,
  ResistanceStats,
  BattleType,
  BattleStatus,
  CharacterClass,
  SkillType,
  EffectType,
  EffectTarget,
  ItemRarity,
  COMBAT_EVENTS,
  COMBAT_NOTIFICATIONS
} from '../types/combat';

export class CombatService {
  private battles: Map<string, CombatBattle> = new Map();
  private characters: Map<string, CombatCharacter> = new Map();
  private skills: Map<string, CombatSkill> = new Map();
  private equipment: Map<string, Equipment> = new Map();
  private arenas: Map<string, CombatArena> = new Map();
  private userCharacters: Map<string, string[]> = new Map();
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.initializeDefaultData();
    this.startBattleScheduler();
  }

  // Character Management
  async createCharacter(userId: string, name: string, characterClass: CharacterClass): Promise<CombatCharacter> {
    const character = this.createCharacter(userId, name, characterClass);
    this.characters.set(character.id, character);
    
    if (!this.userCharacters.has(userId)) {
      this.userCharacters.set(userId, []);
    }
    this.userCharacters.get(userId)!.push(character.id);

    this.io.emit(COMBAT_EVENTS.CHARACTER_LEVELED_UP, { character, userId });
    return character;
  }

  async getCharacter(characterId: string): Promise<CombatCharacter | null> {
    return this.characters.get(characterId) || null;
  }

  async getUserCharacters(userId: string): Promise<CombatCharacter[]> {
    const characterIds = this.userCharacters.get(userId) || [];
    return characterIds.map(id => this.characters.get(id)).filter(Boolean) as CombatCharacter[];
  }

  async updateCharacterStats(characterId: string, stats: Partial<CharacterStats>): Promise<CombatCharacter | null> {
    const character = this.characters.get(characterId);
    if (!character) return null;

    character.stats = { ...character.stats, ...stats };
    character.lastModified = new Date();
    this.characters.set(characterId, character);

    this.io.emit(COMBAT_EVENTS.CHARACTER_LEVELED_UP, { characterId, stats });
    return character;
  }

  // Battle Management
  async startBattle(participants: string[], type: BattleType, arenaId?: string): Promise<CombatBattle> {
    const battle: CombatBattle = {
      id: this.generateId(),
      type,
      participants: [],
      currentTurn: 0,
      maxTurns: 100,
      status: 'active' as BattleStatus,
      rewards: [],
      startedAt: new Date(),
      arena: arenaId ? this.arenas.get(arenaId) || this.getDefaultArena() : this.getDefaultArena(),
      weather: this.getDefaultWeather(),
      specialRules: [],
      spectators: [],
      isRanked: type === 'ranked',
      metadata: {
        category: 'combat',
        tags: [type],
        isFeatured: false,
        isUrgent: false,
        specialOffers: [],
        location: 'combat_arena',
        difficulty: 'normal',
        recommendedLevel: 1,
        estimatedDuration: 300
      }
    };

    for (const characterId of participants) {
      const character = this.characters.get(characterId);
      if (character) {
        const participant: CombatParticipant = {
          id: this.generateId(),
          playerId: character.id,
          playerName: `Player_${character.id}`,
          character,
          isAI: false,
          isActive: true,
          currentHealth: character.stats.health,
          maxHealth: character.stats.maxHealth,
          currentMana: character.stats.mana,
          maxMana: character.stats.maxMana,
          currentStamina: character.stats.stamina,
          maxStamina: character.stats.maxStamina,
          statusEffects: [],
          availableSkills: character.skills,
          usedSkills: [],
          turnOrder: battle.participants.length,
          stats: this.createEmptyCombatStats(),
          equipment: character.equipment,
          position: { x: 0, y: 0, z: 0, facing: 'east' }
        };
        battle.participants.push(participant);
      }
    }

    // Sort participants by speed for turn order
    battle.participants.sort((a, b) => b.character.stats.speed - a.character.stats.speed);
    battle.participants.forEach((participant, index) => {
      participant.turnOrder = index;
    });

    this.battles.set(battle.id, battle);
    this.io.emit(COMBAT_EVENTS.BATTLE_STARTED, { battle });
    return battle;
  }

  async executeBattleTurn(battleId: string, participantId: string, skillId: string, targetId?: string): Promise<CombatBattle | null> {
    const battle = this.battles.get(battleId);
    if (!battle || battle.status !== 'active') return null;

    const participant = battle.participants.find(p => p.id === participantId);
    if (!participant || !participant.isActive) return null;

    const skill = participant.availableSkills.find(s => s.id === skillId);
    if (!skill) return null;

    // Check if it's the participant's turn
    const currentParticipant = battle.participants[battle.currentTurn % battle.participants.length];
    if (currentParticipant.id !== participantId) return null;

    // Execute skill
    const result = this.executeSkill(participant, skill, targetId ? battle.participants.find(p => p.id === targetId) : undefined);
    
    // Update participant stats
    participant.stats.skillsUsed++;
    participant.usedSkills.push(skillId);
    participant.currentMana = Math.max(0, participant.currentMana - skill.manaCost);
    participant.currentStamina = Math.max(0, participant.currentStamina - skill.staminaCost);

    // Apply damage/healing
    if (result.target && result.damage > 0) {
      result.target.currentHealth = Math.max(0, result.target.currentHealth - result.damage);
      participant.stats.damageDealt += result.damage;
      result.target.stats.damageReceived += result.damage;
    }

    if (result.healing > 0) {
      participant.currentHealth = Math.min(participant.maxHealth, participant.currentHealth + result.healing);
      participant.stats.healingDone += result.healing;
    }

    // Apply status effects
    if (result.statusEffects.length > 0) {
      result.statusEffects.forEach(effect => {
        if (result.target) {
          result.target.statusEffects.push(effect);
          participant.stats.statusEffectsApplied++;
          result.target.stats.statusEffectsReceived++;
        }
      });
    }

    // Check for battle end
    const aliveParticipants = battle.participants.filter(p => p.currentHealth > 0);
    if (aliveParticipants.length <= 1) {
      battle.status = 'completed' as BattleStatus;
      battle.endedAt = new Date();
      battle.duration = battle.endedAt.getTime() - battle.startedAt.getTime();
      battle.winner = aliveParticipants[0]?.id;
      this.distributeBattleRewards(battle);
    } else {
      battle.currentTurn++;
    }

    this.battles.set(battleId, battle);
    this.io.emit(COMBAT_EVENTS.BATTLE_ENDED, { battle });
    return battle;
  }

  async getBattle(battleId: string): Promise<CombatBattle | null> {
    return this.battles.get(battleId) || null;
  }

  async getActiveBattles(): Promise<CombatBattle[]> {
    return Array.from(this.battles.values()).filter(battle => battle.status === 'active');
  }

  // Equipment Management
  async equipItem(characterId: string, equipmentId: string, slot: keyof EquipmentSet): Promise<CombatCharacter | null> {
    const character = this.characters.get(characterId);
    const item = this.equipment.get(equipmentId);
    
    if (!character || !item) return null;

    // Check requirements
    if (!this.checkEquipmentRequirements(character, item)) return null;

    // Unequip current item in slot
    const currentItem = character.equipment[slot];
    if (currentItem) {
      currentItem.isEquipped = false;
    }

    // Equip new item
    item.isEquipped = true;
    character.equipment[slot] = item;
    character.lastModified = new Date();

    // Apply equipment stats
    this.applyEquipmentStats(character, item);

    this.characters.set(characterId, character);
    this.io.emit(COMBAT_EVENTS.EQUIPMENT_EQUIPPED, { characterId, equipmentId, slot });
    return character;
  }

  async unequipItem(characterId: string, slot: keyof EquipmentSet): Promise<CombatCharacter | null> {
    const character = this.characters.get(characterId);
    if (!character) return null;

    const item = character.equipment[slot];
    if (item) {
      item.isEquipped = false;
      character.equipment[slot] = null;
      character.lastModified = new Date();

      // Remove equipment stats
      this.removeEquipmentStats(character, item);

      this.characters.set(characterId, character);
      this.io.emit(COMBAT_EVENTS.EQUIPMENT_UNEQUIPPED, { characterId, slot });
    }

    return character;
  }

  // Skill Management
  async learnSkill(characterId: string, skillId: string): Promise<CombatCharacter | null> {
    const character = this.characters.get(characterId);
    const skill = this.skills.get(skillId);
    
    if (!character || !skill) return null;

    // Check if already learned
    if (character.skills.find(s => s.id === skillId)) return character;

    // Check requirements
    if (!this.checkSkillRequirements(character, skill)) return null;

    // Add skill to character
    character.skills.push({ ...skill });
    character.lastModified = new Date();

    this.characters.set(characterId, character);
    this.io.emit(COMBAT_EVENTS.SKILL_LEARNED, { characterId, skillId });
    return character;
  }

  async levelUpSkill(characterId: string, skillId: string): Promise<CombatCharacter | null> {
    const character = this.characters.get(characterId);
    if (!character) return null;

    const skill = character.skills.find(s => s.id === skillId);
    if (!skill || skill.level >= skill.maxLevel) return null;

    // Check if enough experience
    if (skill.experience < skill.experienceToNext) return null;

    // Level up skill
    skill.level++;
    skill.experience = 0;
    skill.experienceToNext = Math.floor(skill.experienceToNext * 1.5);
    
    // Increase skill effectiveness
    skill.damage = Math.floor(skill.damage * 1.2);
    skill.healing = Math.floor(skill.healing * 1.2);

    character.lastModified = new Date();
    this.characters.set(characterId, character);
    this.io.emit(COMBAT_EVENTS.SKILL_LEVELED_UP, { characterId, skillId, level: skill.level });
    return character;
  }

  // Helper Methods
  private createCharacter(userId: string, name: string, characterClass: CharacterClass): CombatCharacter {
    const baseStats = this.getBaseStatsForClass(characterClass);
    
    return {
      id: this.generateId(),
      name,
      level: 1,
      class: characterClass,
      stats: baseStats,
      skills: this.getInitialSkills(characterClass),
      equipment: this.getEmptyEquipmentSet(),
      appearance: this.generateAppearance(characterClass),
      isPlayer: true,
      createdAt: new Date(),
      lastModified: new Date()
    };
  }

  private getBaseStatsForClass(characterClass: CharacterClass): CharacterStats {
    const baseStats: Record<CharacterClass, CharacterStats> = {
      warrior: {
        health: 120, maxHealth: 120, mana: 50, maxMana: 50, stamina: 100, maxStamina: 100,
        attack: 15, defense: 12, speed: 8, intelligence: 6, strength: 16, agility: 8,
        vitality: 14, wisdom: 6, luck: 8, criticalChance: 5, criticalDamage: 150,
        dodgeChance: 3, blockChance: 8, accuracy: 85, resistance: this.getDefaultResistance()
      },
      mage: {
        health: 80, maxHealth: 80, mana: 120, maxMana: 120, stamina: 60, maxStamina: 60,
        attack: 8, defense: 6, speed: 10, intelligence: 18, strength: 6, agility: 10,
        vitality: 8, wisdom: 16, luck: 10, criticalChance: 8, criticalDamage: 200,
        dodgeChance: 5, blockChance: 2, accuracy: 90, resistance: this.getDefaultResistance()
      },
      archer: {
        health: 90, maxHealth: 90, mana: 70, maxMana: 70, stamina: 90, maxStamina: 90,
        attack: 14, defense: 8, speed: 14, intelligence: 10, strength: 12, agility: 16,
        vitality: 10, wisdom: 8, luck: 12, criticalChance: 12, criticalDamage: 180,
        dodgeChance: 8, blockChance: 4, accuracy: 95, resistance: this.getDefaultResistance()
      },
      rogue: {
        health: 85, maxHealth: 85, mana: 60, maxMana: 60, stamina: 110, maxStamina: 110,
        attack: 13, defense: 7, speed: 16, intelligence: 12, strength: 10, agility: 18,
        vitality: 9, wisdom: 8, luck: 14, criticalChance: 15, criticalDamage: 220,
        dodgeChance: 12, blockChance: 3, accuracy: 90, resistance: this.getDefaultResistance()
      },
      paladin: {
        health: 110, maxHealth: 110, mana: 80, maxMana: 80, stamina: 85, maxStamina: 85,
        attack: 12, defense: 14, speed: 7, intelligence: 10, strength: 14, agility: 7,
        vitality: 13, wisdom: 12, luck: 8, criticalChance: 6, criticalDamage: 160,
        dodgeChance: 4, blockChance: 10, accuracy: 85, resistance: this.getDefaultResistance()
      },
      priest: {
        health: 75, maxHealth: 75, mana: 100, maxMana: 100, stamina: 70, maxStamina: 70,
        attack: 6, defense: 8, speed: 9, intelligence: 16, strength: 6, agility: 8,
        vitality: 8, wisdom: 18, luck: 10, criticalChance: 7, criticalDamage: 180,
        dodgeChance: 4, blockChance: 6, accuracy: 85, resistance: this.getDefaultResistance()
      },
      monk: {
        health: 95, maxHealth: 95, mana: 70, maxMana: 70, stamina: 120, maxStamina: 120,
        attack: 11, defense: 10, speed: 12, intelligence: 10, strength: 13, agility: 14,
        vitality: 12, wisdom: 12, luck: 9, criticalChance: 8, criticalDamage: 170,
        dodgeChance: 10, blockChance: 6, accuracy: 88, resistance: this.getDefaultResistance()
      },
      berserker: {
        health: 130, maxHealth: 130, mana: 40, maxMana: 40, stamina: 110, maxStamina: 110,
        attack: 18, defense: 8, speed: 9, intelligence: 4, strength: 18, agility: 9,
        vitality: 16, wisdom: 4, luck: 6, criticalChance: 10, criticalDamage: 200,
        dodgeChance: 6, blockChance: 4, accuracy: 80, resistance: this.getDefaultResistance()
      },
      assassin: {
        health: 80, maxHealth: 80, mana: 70, maxMana: 70, stamina: 100, maxStamina: 100,
        attack: 16, defense: 6, speed: 18, intelligence: 12, strength: 11, agility: 20,
        vitality: 8, wisdom: 8, luck: 16, criticalChance: 20, criticalDamage: 250,
        dodgeChance: 15, blockChance: 2, accuracy: 92, resistance: this.getDefaultResistance()
      },
      necromancer: {
        health: 85, maxHealth: 85, mana: 110, maxMana: 110, stamina: 65, maxStamina: 65,
        attack: 9, defense: 7, speed: 8, intelligence: 17, strength: 7, agility: 8,
        vitality: 9, wisdom: 15, luck: 12, criticalChance: 9, criticalDamage: 190,
        dodgeChance: 5, blockChance: 3, accuracy: 88, resistance: this.getDefaultResistance()
      },
      elementalist: {
        health: 82, maxHealth: 82, mana: 115, maxMana: 115, stamina: 68, maxStamina: 68,
        attack: 8, defense: 7, speed: 9, intelligence: 17, strength: 7, agility: 9,
        vitality: 8, wisdom: 16, luck: 11, criticalChance: 8, criticalDamage: 185,
        dodgeChance: 6, blockChance: 3, accuracy: 89, resistance: this.getDefaultResistance()
      },
      bard: {
        health: 88, maxHealth: 88, mana: 90, maxMana: 90, stamina: 80, maxStamina: 80,
        attack: 10, defense: 8, speed: 11, intelligence: 14, strength: 9, agility: 12,
        vitality: 9, wisdom: 13, luck: 13, criticalChance: 7, criticalDamage: 175,
        dodgeChance: 7, blockChance: 5, accuracy: 87, resistance: this.getDefaultResistance()
      },
      druid: {
        health: 92, maxHealth: 92, mana: 95, maxMana: 95, stamina: 85, maxStamina: 85,
        attack: 9, defense: 9, speed: 10, intelligence: 15, strength: 10, agility: 11,
        vitality: 11, wisdom: 15, luck: 10, criticalChance: 8, criticalDamage: 180,
        dodgeChance: 6, blockChance: 6, accuracy: 86, resistance: this.getDefaultResistance()
      },
      ranger: {
        health: 94, maxHealth: 94, mana: 75, maxMana: 75, stamina: 95, maxStamina: 95,
        attack: 13, defense: 9, speed: 13, intelligence: 11, strength: 12, agility: 15,
        vitality: 10, wisdom: 10, luck: 11, criticalChance: 11, criticalDamage: 185,
        dodgeChance: 9, blockChance: 5, accuracy: 93, resistance: this.getDefaultResistance()
      },
      knight: {
        health: 115, maxHealth: 115, mana: 70, maxMana: 70, stamina: 90, maxStamina: 90,
        attack: 13, defense: 15, speed: 6, intelligence: 8, strength: 15, agility: 6,
        vitality: 14, wisdom: 8, luck: 7, criticalChance: 5, criticalDamage: 155,
        dodgeChance: 3, blockChance: 12, accuracy: 82, resistance: this.getDefaultResistance()
      },
      warlock: {
        health: 78, maxHealth: 78, mana: 105, maxMana: 105, stamina: 62, maxStamina: 62,
        attack: 7, defense: 6, speed: 8, intelligence: 16, strength: 6, agility: 8,
        vitality: 8, wisdom: 14, luck: 13, criticalChance: 8, criticalDamage: 195,
        dodgeChance: 5, blockChance: 3, accuracy: 87, resistance: this.getDefaultResistance()
      },
      shaman: {
        health: 90, maxHealth: 90, mana: 85, maxMana: 85, stamina: 75, maxStamina: 75,
        attack: 8, defense: 8, speed: 9, intelligence: 14, strength: 9, agility: 9,
        vitality: 10, wisdom: 14, luck: 12, criticalChance: 7, criticalDamage: 175,
        dodgeChance: 6, blockChance: 5, accuracy: 85, resistance: this.getDefaultResistance()
      },
      hunter: {
        health: 96, maxHealth: 96, mana: 72, maxMana: 72, stamina: 92, maxStamina: 92,
        attack: 12, defense: 8, speed: 12, intelligence: 10, strength: 11, agility: 14,
        vitality: 10, wisdom: 9, luck: 12, criticalChance: 10, criticalDamage: 180,
        dodgeChance: 8, blockChance: 4, accuracy: 91, resistance: this.getDefaultResistance()
      },
      guardian: {
        health: 125, maxHealth: 125, mana: 65, maxMana: 65, stamina: 95, maxStamina: 95,
        attack: 11, defense: 16, speed: 5, intelligence: 7, strength: 14, agility: 5,
        vitality: 15, wisdom: 7, luck: 6, criticalChance: 4, criticalDamage: 150,
        dodgeChance: 2, blockChance: 15, accuracy: 80, resistance: this.getDefaultResistance()
      },
      templar: {
        health: 108, maxHealth: 108, mana: 75, maxMana: 75, stamina: 88, maxStamina: 88,
        attack: 12, defense: 13, speed: 7, intelligence: 9, strength: 13, agility: 7,
        vitality: 12, wisdom: 10, luck: 8, criticalChance: 6, criticalDamage: 165,
        dodgeChance: 4, blockChance: 9, accuracy: 83, resistance: this.getDefaultResistance()
      }
    };

    return baseStats[characterClass] || baseStats.warrior;
  }

  private getDefaultResistance(): ResistanceStats {
    return {
      fire: 0, water: 0, earth: 0, air: 0, ice: 0, thunder: 0,
      light: 0, dark: 0, physical: 0, magical: 0
    };
  }

  private getInitialSkills(characterClass: CharacterClass): CombatSkill[] {
    const basicAttack: CombatSkill = {
      id: this.generateId(),
      name: 'Basic Attack',
      description: 'A basic attack move',
      type: 'attack',
      category: 'combat',
      level: 1,
      maxLevel: 10,
      experience: 0,
      experienceToNext: 100,
      cooldown: 0,
      manaCost: 0,
      staminaCost: 10,
      damage: 10,
      healing: 0,
      range: 1,
      areaOfEffect: 0,
      effects: [],
      requirements: [],
      isUnlocked: true,
      isActive: true,
      metadata: {
        icon: '⚔️',
        animation: 'attack',
        category: 'combat',
        tags: ['basic', 'attack'],
        rarity: 'common',
        source: 'starting'
      }
    };

    return [basicAttack];
  }

  private getEmptyEquipmentSet(): EquipmentSet {
    return {
      weapon: null,
      armor: null,
      helmet: null,
      boots: null,
      gloves: null,
      accessory: null,
      ring: null,
      amulet: null,
      shield: null
    };
  }

  private generateAppearance(characterClass: CharacterClass) {
    return {
      avatar: this.getAvatarForClass(characterClass),
      color: this.getRandomColor(),
      size: 'medium',
      accessories: [],
      customizations: [],
      animations: [],
      isShiny: false,
      variant: 'standard'
    };
  }

  private getAvatarForClass(characterClass: CharacterClass): string {
    const avatars: Record<CharacterClass, string> = {
      warrior: '🛡️',
      mage: '🧙‍♂️',
      archer: '🏹',
      rogue: '🗡️',
      paladin: '⚔️',
      priest: '⛪',
      monk: '🥋',
      berserker: '⚡',
      assassin: '🗡️',
      necromancer: '💀',
      elementalist: '🔥',
      bard: '🎵',
      druid: '🌿',
      ranger: '🏹',
      knight: '🛡️',
      warlock: '👹',
      shaman: '🔮',
      hunter: '🏹',
      guardian: '🛡️',
      templar: '⚔️'
    };
    return avatars[characterClass] || '⚔️';
  }

  private getRandomColor(): string {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gray', 'silver', 'gold'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getDefaultArena(): CombatArena {
    return {
      id: 'default_arena',
      name: 'Training Grounds',
      description: 'A basic training arena for combat practice',
      size: 'medium',
      terrain: 'grassland',
      obstacles: [],
      effects: [],
      isActive: true,
      metadata: {
        imageUrl: '/arenas/default.png',
        tags: ['training', 'basic'],
        category: 'training',
        isActive: true,
        baseValue: 0
      }
    };
  }

  private getDefaultWeather(): WeatherEffect {
    return {
      type: 'clear',
      intensity: 0,
      effects: [],
      duration: 0,
      remainingTurns: 0,
      isActive: false,
      metadata: {
        icon: '☀️',
        color: 'yellow',
        category: 'weather',
        tags: ['clear', 'normal']
      }
    };
  }

  private createEmptyCombatStats(): CombatStats {
    return {
      damageDealt: 0,
      damageReceived: 0,
      healingDone: 0,
      healingReceived: 0,
      skillsUsed: 0,
      criticalHits: 0,
      misses: 0,
      dodges: 0,
      blocks: 0,
      statusEffectsApplied: 0,
      statusEffectsReceived: 0,
      turnsTaken: 0,
      timeSpent: 0,
      kills: 0,
      deaths: 0,
      assists: 0
    };
  }

  private executeSkill(participant: CombatParticipant, skill: CombatSkill, target?: CombatParticipant): {
    damage: number;
    healing: number;
    statusEffects: StatusEffect[];
  } {
    let damage = 0;
    let healing = 0;
    const statusEffects: StatusEffect[] = [];

    // Calculate base damage/healing
    if (skill.damage > 0) {
      damage = this.calculateDamage(participant, skill, target);
    }
    if (skill.healing > 0) {
      healing = this.calculateHealing(participant, skill);
    }

    // Apply skill effects
    skill.effects.forEach(effect => {
      if (effect.type === 'damage' && target) {
        damage += effect.value;
      } else if (effect.type === 'healing') {
        healing += effect.value;
      } else if (effect.type === 'status' && target) {
        statusEffects.push({
          id: this.generateId(),
          name: effect.description,
          description: effect.description,
          type: effect.type,
          value: effect.value,
          duration: effect.duration,
          remainingTurns: effect.duration,
          isPositive: effect.value > 0,
          canStack: false,
          currentStacks: 1,
          maxStacks: 1,
          source: skill.name,
          sourceId: skill.id,
          metadata: {
            icon: '✨',
            color: effect.value > 0 ? 'green' : 'red',
            category: 'status',
            tags: ['effect']
          }
        });
      }
    });

    return { damage, healing, statusEffects };
  }

  private calculateDamage(attacker: CombatParticipant, skill: CombatSkill, target?: CombatParticipant): number {
    if (!target) return 0;

    const baseDamage = skill.damage;
    const attack = attacker.character.stats.attack;
    const defense = target.character.stats.defense;
    
    // Calculate critical hit
    const criticalChance = attacker.character.stats.criticalChance;
    const isCritical = Math.random() < (criticalChance / 100);
    const criticalMultiplier = isCritical ? (attacker.character.stats.criticalDamage / 100) : 1;
    
    if (isCritical) {
      attacker.stats.criticalHits++;
    }

    // Calculate final damage
    const damage = Math.floor(baseDamage * (attack / 10) * criticalMultiplier * (100 / (100 + defense)));
    
    return Math.max(1, damage);
  }

  private calculateHealing(healer: CombatParticipant, skill: CombatSkill): number {
    const baseHealing = skill.healing;
    const intelligence = healer.character.stats.intelligence;
    
    return Math.floor(baseHealing * (intelligence / 10));
  }

  private distributeBattleRewards(battle: CombatBattle): void {
    const winner = battle.participants.find(p => p.id === battle.winner);
    if (winner) {
      battle.rewards.push({
        type: 'experience',
        amount: 100,
        rarity: 'common',
        description: 'Battle victory experience',
        isClaimed: false,
        metadata: {
          source: 'battle_victory',
          category: 'experience',
          tags: ['victory', 'experience'],
          isTradeable: false,
          isSellable: false,
          baseValue: 0
        }
      });
    }
  }

  private checkEquipmentRequirements(character: CombatCharacter, equipment: Equipment): boolean {
    return equipment.requirements.every(req => {
      switch (req.type) {
        case 'character_level':
          return character.level >= req.value;
        case 'stat_value':
          // This would need to be more specific based on the requirement
          return true;
        default:
          return true;
      }
    });
  }

  private checkSkillRequirements(character: CombatCharacter, skill: CombatSkill): boolean {
    return skill.requirements.every(req => {
      switch (req.type) {
        case 'character_level':
          return character.level >= req.value;
        case 'skill_level':
          // Check if character has required skill level
          return true;
        default:
          return true;
      }
    });
  }

  private applyEquipmentStats(character: CombatCharacter, equipment: Equipment): void {
    const stats = character.stats;
    const equipmentStats = equipment.stats;

    stats.health += equipmentStats.health;
    stats.maxHealth += equipmentStats.health;
    stats.mana += equipmentStats.mana;
    stats.maxMana += equipmentStats.mana;
    stats.stamina += equipmentStats.stamina;
    stats.maxStamina += equipmentStats.stamina;
    stats.attack += equipmentStats.attack;
    stats.defense += equipmentStats.defense;
    stats.speed += equipmentStats.speed;
    stats.intelligence += equipmentStats.intelligence;
    stats.strength += equipmentStats.strength;
    stats.agility += equipmentStats.agility;
    stats.vitality += equipmentStats.vitality;
    stats.wisdom += equipmentStats.wisdom;
    stats.luck += equipmentStats.luck;
    stats.criticalChance += equipmentStats.criticalChance;
    stats.criticalDamage += equipmentStats.criticalDamage;
    stats.dodgeChance += equipmentStats.dodgeChance;
    stats.blockChance += equipmentStats.blockChance;
    stats.accuracy += equipmentStats.accuracy;
  }

  private removeEquipmentStats(character: CombatCharacter, equipment: Equipment): void {
    const stats = character.stats;
    const equipmentStats = equipment.stats;

    stats.health -= equipmentStats.health;
    stats.maxHealth -= equipmentStats.health;
    stats.mana -= equipmentStats.mana;
    stats.maxMana -= equipmentStats.mana;
    stats.stamina -= equipmentStats.stamina;
    stats.maxStamina -= equipmentStats.stamina;
    stats.attack -= equipmentStats.attack;
    stats.defense -= equipmentStats.defense;
    stats.speed -= equipmentStats.speed;
    stats.intelligence -= equipmentStats.intelligence;
    stats.strength -= equipmentStats.strength;
    stats.agility -= equipmentStats.agility;
    stats.vitality -= equipmentStats.vitality;
    stats.wisdom -= equipmentStats.wisdom;
    stats.luck -= equipmentStats.luck;
    stats.criticalChance -= equipmentStats.criticalChance;
    stats.criticalDamage -= equipmentStats.criticalDamage;
    stats.dodgeChance -= equipmentStats.dodgeChance;
    stats.blockChance -= equipmentStats.blockChance;
    stats.accuracy -= equipmentStats.accuracy;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private initializeDefaultData(): void {
    // Initialize default skills
    const defaultSkills: CombatSkill[] = [
      {
        id: 'fireball',
        name: 'Fireball',
        description: 'Launch a fireball at your enemy',
        type: 'attack',
        category: 'magic',
        level: 1,
        maxLevel: 10,
        experience: 0,
        experienceToNext: 100,
        cooldown: 2,
        manaCost: 20,
        staminaCost: 0,
        damage: 25,
        healing: 0,
        range: 3,
        areaOfEffect: 1,
        effects: [],
        requirements: [{ type: 'character_level', value: 5, description: 'Level 5 required', isMet: false }],
        isUnlocked: false,
        isActive: true,
        metadata: {
          icon: '🔥',
          animation: 'fireball',
          category: 'magic',
          tags: ['fire', 'ranged', 'magic'],
          rarity: 'common',
          source: 'skill_book'
        }
      }
    ];

    defaultSkills.forEach(skill => {
      this.skills.set(skill.id, skill);
    });
  }

  private startBattleScheduler(): void {
    setInterval(() => {
      // Process ongoing battles
      for (const battle of this.battles.values()) {
        if (battle.status === 'active') {
          const now = new Date();
          const battleDuration = now.getTime() - battle.startedAt.getTime();
          
          // Auto-end battles after 30 minutes
          if (battleDuration > 1800000) {
            battle.status = 'timeout' as BattleStatus;
            battle.endedAt = now;
            battle.duration = battleDuration;
            this.battles.set(battle.id, battle);
            this.io.emit(COMBAT_EVENTS.BATTLE_ENDED, { battle });
          }
        }
      }
    }, 60000); // Run every minute
  }
}
