import { Server as SocketIOServer } from 'socket.io';
import {
  Pet,
  PetStats,
  PetSkill,
  PetBattle,
  PetTraining,
  PetCare,
  PetAchievement,
  PetMarketplace,
  PetCollection,
  PetSpecies,
  PetRarity,
  PetMood,
  BattleType,
  BattleStatus,
  TrainingType,
  TrainingStatus,
  CareType,
  CareStatus,
  AchievementCategory,
  MarketplaceType,
  MarketplaceStatus,
  RewardType,
  EffectType,
  PET_EVENTS,
  PET_NOTIFICATIONS
} from '../types/pets';

export class PetService {
  private pets: Map<string, Pet> = new Map();
  private battles: Map<string, PetBattle> = new Map();
  private trainings: Map<string, PetTraining> = new Map();
  private careSessions: Map<string, PetCare> = new Map();
  private achievements: Map<string, PetAchievement> = new Map();
  private marketplace: Map<string, PetMarketplace> = new Map();
  private collections: Map<string, PetCollection> = new Map();
  private userPets: Map<string, string[]> = new Map();
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.initializeDefaultData();
    this.startPetCareScheduler();
    this.startBattleScheduler();
  }

  // Pet Management
  async adoptPet(userId: string, species: PetSpecies, name: string): Promise<Pet> {
    const pet = this.createPet(userId, species, name);
    this.pets.set(pet.id, pet);
    
    if (!this.userPets.has(userId)) {
      this.userPets.set(userId, []);
    }
    this.userPets.get(userId)!.push(pet.id);

    this.io.emit(PET_EVENTS.PET_ADOPTED, { pet, userId });
    return pet;
  }

  async getPet(petId: string): Promise<Pet | null> {
    return this.pets.get(petId) || null;
  }

  async getUserPets(userId: string): Promise<Pet[]> {
    const petIds = this.userPets.get(userId) || [];
    return petIds.map(id => this.pets.get(id)).filter(Boolean) as Pet[];
  }

  async updatePetStats(petId: string, stats: Partial<PetStats>): Promise<Pet | null> {
    const pet = this.pets.get(petId);
    if (!pet) return null;

    pet.stats = { ...pet.stats, ...stats };
    pet.lastModified = new Date();
    this.pets.set(petId, pet);

    this.io.emit(PET_EVENTS.PET_HEALTH_CHANGED, { petId, stats });
    return pet;
  }

  // Pet Care System
  async startCare(petId: string, type: CareType, duration: number): Promise<PetCare> {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error('Pet not found');

    const care: PetCare = {
      id: this.generateId(),
      petId,
      type,
      duration,
      progress: 0,
      maxProgress: duration,
      status: 'in_progress' as CareStatus,
      startedAt: new Date(),
      effects: [],
      cost: this.calculateCareCost(type, duration),
      requirements: [],
      metadata: {
        category: type,
        location: 'pet_care_center',
        equipment: [],
        notes: '',
        isEmergency: false
      }
    };

    this.careSessions.set(care.id, care);
    this.io.emit(PET_EVENTS.PET_CARE_STARTED, { care, petId });
    return care;
  }

  async completeCare(careId: string): Promise<PetCare | null> {
    const care = this.careSessions.get(careId);
    if (!care) return null;

    care.status = 'completed' as CareStatus;
    care.completedAt = new Date();
    care.progress = care.maxProgress;

    const pet = this.pets.get(care.petId);
    if (pet) {
      this.applyCareEffects(pet, care);
      this.pets.set(care.petId, pet);
    }

    this.careSessions.set(careId, care);
    this.io.emit(PET_EVENTS.PET_CARE_COMPLETED, { care, petId: care.petId });
    return care;
  }

  // Pet Training System
  async startTraining(petId: string, skillId: string, type: TrainingType): Promise<PetTraining> {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error('Pet not found');

    const training: PetTraining = {
      id: this.generateId(),
      petId,
      skillId,
      type,
      duration: this.calculateTrainingDuration(type),
      progress: 0,
      maxProgress: this.calculateTrainingDuration(type),
      status: 'in_progress' as TrainingStatus,
      startedAt: new Date(),
      rewards: [],
      requirements: [],
      metadata: {
        difficulty: 'beginner',
        category: type,
        location: 'training_ground',
        equipment: [],
        notes: ''
      }
    };

    this.trainings.set(training.id, training);
    this.io.emit(PET_EVENTS.PET_TRAINING_STARTED, { training, petId });
    return training;
  }

  async completeTraining(trainingId: string): Promise<PetTraining | null> {
    const training = this.trainings.get(trainingId);
    if (!training) return null;

    training.status = 'completed' as TrainingStatus;
    training.completedAt = new Date();
    training.progress = training.maxProgress;

    const pet = this.pets.get(training.petId);
    if (pet) {
      this.applyTrainingRewards(pet, training);
      this.pets.set(training.petId, pet);
    }

    this.trainings.set(trainingId, training);
    this.io.emit(PET_EVENTS.PET_TRAINING_COMPLETED, { training, petId: training.petId });
    return training;
  }

  // Pet Battle System
  async startBattle(participants: string[], type: BattleType): Promise<PetBattle> {
    const battle: PetBattle = {
      id: this.generateId(),
      type,
      participants: [],
      currentTurn: 0,
      maxTurns: 50,
      status: 'active' as BattleStatus,
      rewards: [],
      startedAt: new Date(),
      metadata: {
        arena: 'default_arena',
        specialRules: [],
        spectators: [],
        isRanked: type === 'ranked'
      }
    };

    for (const petId of participants) {
      const pet = this.pets.get(petId);
      if (pet) {
        battle.participants.push({
          id: this.generateId(),
          petId,
          pet,
          playerId: pet.ownerId,
          playerName: `Player_${pet.ownerId}`,
          isAI: false,
          isActive: true,
          currentHealth: pet.stats.health,
          maxHealth: pet.stats.maxHealth,
          statusEffects: [],
          availableSkills: pet.skills,
          usedSkills: [],
          turnOrder: battle.participants.length,
          stats: {
            damageDealt: 0,
            damageReceived: 0,
            skillsUsed: 0,
            criticalHits: 0,
            misses: 0,
            statusEffectsApplied: 0,
            statusEffectsReceived: 0,
            turnsTaken: 0
          }
        });
      }
    }

    this.battles.set(battle.id, battle);
    this.io.emit(PET_EVENTS.PET_BATTLE_STARTED, { battle });
    return battle;
  }

  async executeBattleTurn(battleId: string, participantId: string, skillId: string, targetId?: string): Promise<PetBattle | null> {
    const battle = this.battles.get(battleId);
    if (!battle || battle.status !== 'active') return null;

    const participant = battle.participants.find(p => p.id === participantId);
    if (!participant || !participant.isActive) return null;

    const skill = participant.availableSkills.find(s => s.id === skillId);
    if (!skill) return null;

    // Execute skill
    const damage = this.calculateDamage(participant, skill);
    if (targetId) {
      const target = battle.participants.find(p => p.id === targetId);
      if (target) {
        target.currentHealth = Math.max(0, target.currentHealth - damage);
        participant.stats.damageDealt += damage;
        target.stats.damageReceived += damage;
      }
    }

    participant.stats.skillsUsed++;
    participant.usedSkills.push(skillId);

    // Check for battle end
    const aliveParticipants = battle.participants.filter(p => p.currentHealth > 0);
    if (aliveParticipants.length <= 1) {
      battle.status = 'completed' as BattleStatus;
      battle.endedAt = new Date();
      battle.duration = battle.endedAt.getTime() - battle.startedAt.getTime();
      battle.winner = aliveParticipants[0]?.id;
      this.distributeBattleRewards(battle);
    }

    this.battles.set(battleId, battle);
    this.io.emit(PET_EVENTS.PET_BATTLE_ENDED, { battle });
    return battle;
  }

  // Marketplace System
  async listPet(petId: string, sellerId: string, price: number, type: MarketplaceType): Promise<PetMarketplace> {
    const pet = this.pets.get(petId);
    if (!pet || pet.ownerId !== sellerId) throw new Error('Pet not found or not owned');

    const listing: PetMarketplace = {
      id: this.generateId(),
      petId,
      sellerId,
      sellerName: `Player_${sellerId}`,
      price,
      currency: 'FFT',
      type,
      status: 'active' as MarketplaceStatus,
      description: `Level ${pet.level} ${pet.rarity} ${pet.species}`,
      requirements: [],
      createdAt: new Date(),
      metadata: {
        category: 'pets',
        tags: [pet.species, pet.rarity],
        images: [],
        isFeatured: false,
        isUrgent: false,
        specialOffers: [],
        location: 'marketplace'
      }
    };

    this.marketplace.set(listing.id, listing);
    this.io.emit(PET_EVENTS.PET_MARKETPLACE_LISTED, { listing });
    return listing;
  }

  async purchasePet(listingId: string, buyerId: string): Promise<PetMarketplace | null> {
    const listing = this.marketplace.get(listingId);
    if (!listing || listing.status !== 'active') return null;

    listing.status = 'sold' as MarketplaceStatus;
    listing.soldAt = new Date();
    listing.buyerId = buyerId;
    listing.buyerName = `Player_${buyerId}`;

    const pet = this.pets.get(listing.petId);
    if (pet) {
      pet.ownerId = buyerId;
      this.pets.set(listing.petId, pet);
    }

    this.marketplace.set(listingId, listing);
    this.io.emit(PET_EVENTS.PET_MARKETPLACE_SOLD, { listing });
    return listing;
  }

  // Achievement System
  async checkAchievements(petId: string): Promise<PetAchievement[]> {
    const pet = this.pets.get(petId);
    if (!pet) return [];

    const unlockedAchievements: PetAchievement[] = [];
    
    for (const achievement of this.achievements.values()) {
      if (achievement.isUnlocked) continue;
      
      let progress = 0;
      let maxProgress = 0;
      let allRequirementsMet = true;

      for (const requirement of achievement.requirements) {
        maxProgress += requirement.value;
        const currentValue = this.getRequirementValue(pet, requirement);
        progress += Math.min(currentValue, requirement.value);
        
        if (currentValue < requirement.value) {
          allRequirementsMet = false;
        }
      }

      achievement.progress = progress;
      achievement.maxProgress = maxProgress;

      if (allRequirementsMet && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
        unlockedAchievements.push(achievement);
        this.io.emit(PET_EVENTS.PET_ACHIEVEMENT_UNLOCKED, { achievement, petId });
      }
    }

    return unlockedAchievements;
  }

  // Helper Methods
  private createPet(userId: string, species: PetSpecies, name: string): Pet {
    const baseStats = this.getBaseStatsForSpecies(species);
    const rarity = this.determineRarity();
    
    return {
      id: this.generateId(),
      name,
      species,
      breed: this.generateBreed(species),
      rarity,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      maxLevel: 100,
      stats: baseStats,
      skills: this.getInitialSkills(species),
      appearance: this.generateAppearance(species, rarity),
      personality: this.generatePersonality(),
      health: {
        current: baseStats.health,
        maximum: baseStats.maxHealth,
        status: ['healthy'],
        lastCheckup: new Date(),
        nextCheckup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        medicalHistory: [],
        isHealthy: true,
        needsAttention: false
      },
      happiness: 100,
      hunger: 100,
      energy: 100,
      cleanliness: 100,
      lastFed: new Date(),
      lastPlayed: new Date(),
      lastCleaned: new Date(),
      isActive: true,
      isInBattle: false,
      ownerId: userId,
      createdAt: new Date(),
      lastModified: new Date(),
      metadata: {
        description: `A ${rarity} ${species} pet`,
        tags: [species, rarity],
        isTradeable: true,
        isSellable: true,
        baseValue: this.calculateBaseValue(rarity),
        category: 'pet',
        source: 'adoption'
      }
    };
  }

  private getBaseStatsForSpecies(species: PetSpecies): PetStats {
    const baseStats: Record<PetSpecies, PetStats> = {
      dragon: { health: 120, maxHealth: 120, attack: 15, defense: 12, speed: 8, intelligence: 14, loyalty: 10, agility: 9, stamina: 11, magic: 16 },
      phoenix: { health: 100, maxHealth: 100, attack: 14, defense: 10, speed: 12, intelligence: 15, loyalty: 12, agility: 13, stamina: 10, magic: 18 },
      wolf: { health: 110, maxHealth: 110, attack: 13, defense: 11, speed: 14, intelligence: 10, loyalty: 15, agility: 12, stamina: 13, magic: 5 },
      cat: { health: 80, maxHealth: 80, attack: 10, defense: 8, speed: 16, intelligence: 12, loyalty: 8, agility: 15, stamina: 9, magic: 7 },
      dog: { health: 100, maxHealth: 100, attack: 12, defense: 10, speed: 12, intelligence: 9, loyalty: 18, agility: 11, stamina: 12, magic: 4 },
      bird: { health: 70, maxHealth: 70, attack: 8, defense: 6, speed: 18, intelligence: 11, loyalty: 7, agility: 17, stamina: 8, magic: 9 },
      fish: { health: 60, maxHealth: 60, attack: 6, defense: 8, speed: 10, intelligence: 8, loyalty: 6, agility: 9, stamina: 7, magic: 6 },
      butterfly: { health: 50, maxHealth: 50, attack: 4, defense: 4, speed: 20, intelligence: 9, loyalty: 5, agility: 19, stamina: 6, magic: 8 },
      unicorn: { health: 130, maxHealth: 130, attack: 16, defense: 14, speed: 15, intelligence: 16, loyalty: 14, agility: 14, stamina: 15, magic: 20 },
      griffin: { health: 140, maxHealth: 140, attack: 18, defense: 16, speed: 13, intelligence: 13, loyalty: 11, agility: 13, stamina: 16, magic: 12 },
      pegasus: { health: 120, maxHealth: 120, attack: 14, defense: 12, speed: 17, intelligence: 14, loyalty: 13, agility: 16, stamina: 14, magic: 15 },
      kraken: { health: 160, maxHealth: 160, attack: 20, defense: 18, speed: 6, intelligence: 12, loyalty: 9, agility: 7, stamina: 18, magic: 14 },
      elemental: { health: 100, maxHealth: 100, attack: 12, defense: 10, speed: 10, intelligence: 15, loyalty: 8, agility: 10, stamina: 10, magic: 22 },
      spirit: { health: 90, maxHealth: 90, attack: 10, defense: 8, speed: 12, intelligence: 18, loyalty: 10, agility: 12, stamina: 9, magic: 25 },
      robot: { health: 110, maxHealth: 110, attack: 13, defense: 15, speed: 8, intelligence: 20, loyalty: 12, agility: 8, stamina: 14, magic: 3 },
      crystal: { health: 120, maxHealth: 120, attack: 11, defense: 17, speed: 7, intelligence: 14, loyalty: 11, agility: 7, stamina: 12, magic: 19 },
      shadow: { health: 100, maxHealth: 100, attack: 15, defense: 9, speed: 14, intelligence: 13, loyalty: 7, agility: 15, stamina: 11, magic: 17 },
      light: { health: 110, maxHealth: 110, attack: 12, defense: 13, speed: 11, intelligence: 16, loyalty: 16, agility: 11, stamina: 12, magic: 21 },
      fire: { health: 105, maxHealth: 105, attack: 17, defense: 8, speed: 12, intelligence: 11, loyalty: 9, agility: 12, stamina: 13, magic: 18 },
      water: { health: 115, maxHealth: 115, attack: 10, defense: 14, speed: 9, intelligence: 12, loyalty: 10, agility: 9, stamina: 15, magic: 16 },
      earth: { health: 125, maxHealth: 125, attack: 14, defense: 16, speed: 6, intelligence: 10, loyalty: 12, agility: 6, stamina: 17, magic: 13 },
      air: { health: 95, maxHealth: 95, attack: 9, defense: 7, speed: 19, intelligence: 14, loyalty: 8, agility: 18, stamina: 10, magic: 15 },
      ice: { health: 110, maxHealth: 110, attack: 11, defense: 15, speed: 8, intelligence: 13, loyalty: 9, agility: 8, stamina: 13, magic: 17 },
      thunder: { health: 100, maxHealth: 100, attack: 16, defense: 9, speed: 15, intelligence: 12, loyalty: 8, agility: 15, stamina: 11, magic: 19 },
      nature: { health: 120, maxHealth: 120, attack: 12, defense: 13, speed: 10, intelligence: 15, loyalty: 13, agility: 10, stamina: 14, magic: 16 },
      cosmic: { health: 150, maxHealth: 150, attack: 18, defense: 15, speed: 11, intelligence: 19, loyalty: 12, agility: 11, stamina: 16, magic: 24 },
      void: { health: 140, maxHealth: 140, attack: 19, defense: 12, speed: 13, intelligence: 17, loyalty: 6, agility: 13, stamina: 15, magic: 22 },
      time: { health: 130, maxHealth: 130, attack: 15, defense: 14, speed: 16, intelligence: 21, loyalty: 10, agility: 16, stamina: 14, magic: 23 },
      space: { health: 145, maxHealth: 145, attack: 17, defense: 16, speed: 14, intelligence: 20, loyalty: 11, agility: 14, stamina: 16, magic: 21 },
      mystic: { health: 135, maxHealth: 135, attack: 16, defense: 13, speed: 12, intelligence: 22, loyalty: 13, agility: 12, stamina: 15, magic: 25 }
    };

    return baseStats[species] || baseStats.cat;
  }

  private determineRarity(): PetRarity {
    const rand = Math.random();
    if (rand < 0.5) return 'common';
    if (rand < 0.75) return 'uncommon';
    if (rand < 0.9) return 'rare';
    if (rand < 0.98) return 'epic';
    if (rand < 0.999) return 'legendary';
    return 'mythic';
  }

  private generateBreed(species: PetSpecies): string {
    const breeds: Record<PetSpecies, string[]> = {
      dragon: ['Fire Dragon', 'Ice Dragon', 'Storm Dragon', 'Shadow Dragon'],
      phoenix: ['Flame Phoenix', 'Ice Phoenix', 'Storm Phoenix', 'Golden Phoenix'],
      wolf: ['Arctic Wolf', 'Timber Wolf', 'Shadow Wolf', 'Spirit Wolf'],
      cat: ['Persian', 'Siamese', 'Maine Coon', 'Ragdoll'],
      dog: ['Golden Retriever', 'German Shepherd', 'Labrador', 'Husky'],
      bird: ['Eagle', 'Hawk', 'Falcon', 'Owl'],
      fish: ['Goldfish', 'Koi', 'Angelfish', 'Betta'],
      butterfly: ['Monarch', 'Swallowtail', 'Morpho', 'Luna'],
      unicorn: ['Crystal Unicorn', 'Rainbow Unicorn', 'Moon Unicorn', 'Star Unicorn'],
      griffin: ['Golden Griffin', 'Silver Griffin', 'Bronze Griffin', 'Crystal Griffin'],
      pegasus: ['White Pegasus', 'Black Pegasus', 'Golden Pegasus', 'Silver Pegasus'],
      kraken: ['Deep Kraken', 'Storm Kraken', 'Crystal Kraken', 'Shadow Kraken'],
      elemental: ['Fire Elemental', 'Water Elemental', 'Earth Elemental', 'Air Elemental'],
      spirit: ['Light Spirit', 'Dark Spirit', 'Nature Spirit', 'Cosmic Spirit'],
      robot: ['Steel Robot', 'Cyber Robot', 'Quantum Robot', 'Nano Robot'],
      crystal: ['Diamond Crystal', 'Ruby Crystal', 'Sapphire Crystal', 'Emerald Crystal'],
      shadow: ['Dark Shadow', 'Void Shadow', 'Night Shadow', 'Mystic Shadow'],
      light: ['Bright Light', 'Golden Light', 'Silver Light', 'Crystal Light'],
      fire: ['Flame Fire', 'Inferno Fire', 'Blaze Fire', 'Ember Fire'],
      water: ['Ocean Water', 'River Water', 'Lake Water', 'Spring Water'],
      earth: ['Mountain Earth', 'Forest Earth', 'Desert Earth', 'Valley Earth'],
      air: ['Wind Air', 'Storm Air', 'Breeze Air', 'Gale Air'],
      ice: ['Glacier Ice', 'Frost Ice', 'Crystal Ice', 'Polar Ice'],
      thunder: ['Lightning Thunder', 'Storm Thunder', 'Bolt Thunder', 'Shock Thunder'],
      nature: ['Forest Nature', 'Garden Nature', 'Wild Nature', 'Sacred Nature'],
      cosmic: ['Star Cosmic', 'Galaxy Cosmic', 'Nebula Cosmic', 'Void Cosmic'],
      void: ['Dark Void', 'Empty Void', 'Infinite Void', 'Mystic Void'],
      time: ['Past Time', 'Present Time', 'Future Time', 'Eternal Time'],
      space: ['Deep Space', 'Infinite Space', 'Void Space', 'Cosmic Space'],
      mystic: ['Ancient Mystic', 'Sacred Mystic', 'Divine Mystic', 'Eternal Mystic']
    };

    const speciesBreeds = breeds[species] || ['Unknown'];
    return speciesBreeds[Math.floor(Math.random() * speciesBreeds.length)];
  }

  private generateAppearance(species: PetSpecies, rarity: PetRarity) {
    return {
      color: this.getRandomColor(),
      pattern: this.getRandomPattern(),
      size: this.getRandomSize(),
      accessories: [],
      customizations: [],
      animations: [],
      isShiny: rarity === 'legendary' || rarity === 'mythic',
      variant: this.getRandomVariant()
    };
  }

  private generatePersonality() {
    const traits = ['loyal', 'playful', 'curious', 'brave', 'calm', 'energetic', 'intelligent', 'friendly'];
    return {
      traits: traits.slice(0, Math.floor(Math.random() * 4) + 2),
      mood: 'happy' as PetMood,
      friendliness: Math.floor(Math.random() * 100),
      playfulness: Math.floor(Math.random() * 100),
      loyalty: Math.floor(Math.random() * 100),
      independence: Math.floor(Math.random() * 100),
      curiosity: Math.floor(Math.random() * 100),
      bravery: Math.floor(Math.random() * 100),
      intelligence: Math.floor(Math.random() * 100),
      adaptability: Math.floor(Math.random() * 100)
    };
  }

  private getInitialSkills(species: PetSpecies): PetSkill[] {
    return [
      {
        id: this.generateId(),
        name: 'Basic Attack',
        description: 'A basic attack move',
        type: 'attack',
        level: 1,
        maxLevel: 10,
        experience: 0,
        experienceToNext: 100,
        cooldown: 0,
        manaCost: 0,
        damage: 10,
        effects: [],
        requirements: [],
        isUnlocked: true,
        isActive: true,
        metadata: {
          icon: '⚔️',
          animation: 'attack',
          category: 'combat',
          tags: ['basic', 'attack']
        }
      }
    ];
  }

  private calculateBaseValue(rarity: PetRarity): number {
    const values = {
      common: 100,
      uncommon: 250,
      rare: 500,
      epic: 1000,
      legendary: 2500,
      mythic: 5000,
      divine: 10000,
      ancient: 25000
    };
    return values[rarity] || 100;
  }

  private calculateCareCost(type: CareType, duration: number): number {
    const baseCosts = {
      feeding: 10,
      grooming: 15,
      medical: 50,
      exercise: 20,
      play: 5,
      rest: 0,
      socialization: 25,
      training: 30,
      checkup: 40,
      emergency: 100
    };
    return (baseCosts[type] || 10) * Math.ceil(duration / 60);
  }

  private calculateTrainingDuration(type: TrainingType): number {
    const durations = {
      skill: 3600,
      stat: 1800,
      behavior: 2400,
      trick: 1200,
      obedience: 3000,
      agility: 1800,
      intelligence: 2400,
      socialization: 3600,
      specialization: 4800,
      mastery: 7200
    };
    return durations[type] || 1800;
  }

  private calculateDamage(participant: any, skill: PetSkill): number {
    const baseDamage = skill.damage;
    const attack = participant.pet.stats.attack;
    const critical = Math.random() < 0.1 ? 2 : 1;
    return Math.floor(baseDamage * (attack / 10) * critical);
  }

  private applyCareEffects(pet: Pet, care: PetCare): void {
    switch (care.type) {
      case 'feeding':
        pet.hunger = Math.min(100, pet.hunger + 30);
        pet.happiness = Math.min(100, pet.happiness + 10);
        break;
      case 'grooming':
        pet.cleanliness = Math.min(100, pet.cleanliness + 40);
        pet.happiness = Math.min(100, pet.happiness + 15);
        break;
      case 'medical':
        pet.health.current = Math.min(pet.health.maximum, pet.health.current + 50);
        pet.health.isHealthy = true;
        break;
      case 'exercise':
        pet.energy = Math.min(100, pet.energy + 20);
        pet.stats.stamina = Math.min(100, pet.stats.stamina + 1);
        break;
      case 'play':
        pet.happiness = Math.min(100, pet.happiness + 25);
        pet.energy = Math.max(0, pet.energy - 10);
        break;
    }
  }

  private applyTrainingRewards(pet: Pet, training: PetTraining): void {
    const skill = pet.skills.find(s => s.id === training.skillId);
    if (skill) {
      skill.experience += 100;
      if (skill.experience >= skill.experienceToNext) {
        skill.level = Math.min(skill.maxLevel, skill.level + 1);
        skill.experience = 0;
        skill.experienceToNext = Math.floor(skill.experienceToNext * 1.2);
      }
    }
    
    pet.experience += 50;
    if (pet.experience >= pet.experienceToNext) {
      pet.level = Math.min(pet.maxLevel, pet.level + 1);
      pet.experience = 0;
      pet.experienceToNext = Math.floor(pet.experienceToNext * 1.5);
      
      // Increase stats on level up
      pet.stats.health += 5;
      pet.stats.maxHealth += 5;
      pet.stats.attack += 1;
      pet.stats.defense += 1;
    }
  }

  private distributeBattleRewards(battle: PetBattle): void {
    const winner = battle.participants.find(p => p.id === battle.winner);
    if (winner) {
      battle.rewards.push({
        type: 'experience',
        amount: 100,
        rarity: 'common',
        description: 'Battle victory experience',
        isClaimed: false
      });
    }
  }

  private getRequirementValue(pet: Pet, requirement: any): number {
    switch (requirement.type) {
      case 'pet_level':
        return pet.level;
      case 'battle_wins':
        return 0; // Would need to track this
      case 'training_hours':
        return 0; // Would need to track this
      default:
        return 0;
    }
  }

  private getRandomColor(): string {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gray', 'silver', 'gold'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getRandomPattern(): string {
    const patterns = ['solid', 'striped', 'spotted', 'marbled', 'gradient', 'metallic', 'iridescent', 'glowing'];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private getRandomSize(): string {
    const sizes = ['tiny', 'small', 'medium', 'large', 'huge'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  private getRandomVariant(): string {
    const variants = ['standard', 'albino', 'melanistic', 'piebald', 'leucistic', 'erythristic', 'axanthic'];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private initializeDefaultData(): void {
    // Initialize default achievements
    const defaultAchievements: PetAchievement[] = [
      {
        id: 'first_pet',
        name: 'First Pet',
        description: 'Adopt your first pet',
        category: 'milestones',
        rarity: 'common',
        requirements: [{ type: 'pet_level', value: 1, description: 'Have a pet', isMet: false }],
        rewards: [{ type: 'experience', amount: 100, rarity: 'common', description: 'First pet bonus' }],
        isUnlocked: false,
        progress: 0,
        maxProgress: 1,
        metadata: {
          imageUrl: '/achievements/first_pet.png',
          tags: ['milestone', 'first'],
          category: 'milestones',
          isTradeable: false,
          isSellable: false,
          baseValue: 0
        }
      }
    ];

    defaultAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  private startPetCareScheduler(): void {
    setInterval(() => {
      // Decrease pet stats over time
      for (const pet of this.pets.values()) {
        const now = new Date();
        const timeSinceLastFed = now.getTime() - pet.lastFed.getTime();
        const timeSinceLastPlayed = now.getTime() - pet.lastPlayed.getTime();
        const timeSinceLastCleaned = now.getTime() - pet.lastCleaned.getTime();

        // Decrease hunger every hour
        if (timeSinceLastFed > 3600000) {
          pet.hunger = Math.max(0, pet.hunger - 5);
          pet.lastFed = now;
        }

        // Decrease happiness every 2 hours
        if (timeSinceLastPlayed > 7200000) {
          pet.happiness = Math.max(0, pet.happiness - 3);
          pet.lastPlayed = now;
        }

        // Decrease cleanliness every 3 hours
        if (timeSinceLastCleaned > 10800000) {
          pet.cleanliness = Math.max(0, pet.cleanliness - 4);
          pet.lastCleaned = now;
        }

        this.pets.set(pet.id, pet);
      }
    }, 300000); // Run every 5 minutes
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
            this.io.emit(PET_EVENTS.PET_BATTLE_ENDED, { battle });
          }
        }
      }
    }, 60000); // Run every minute
  }
}


