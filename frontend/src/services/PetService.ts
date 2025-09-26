import { io, Socket } from 'socket.io-client';
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
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();
  private pets: Map<string, Pet> = new Map();
  private battles: Map<string, PetBattle> = new Map();
  private trainings: Map<string, PetTraining> = new Map();
  private careSessions: Map<string, PetCare> = new Map();
  private achievements: Map<string, PetAchievement> = new Map();
  private marketplace: Map<string, PetMarketplace> = new Map();
  private collections: Map<string, PetCollection> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';
    this.socket = io(socketUrl);

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('PetService connected to server');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('PetService disconnected from server');
    });

    // Pet Events
    this.socket.on(PET_EVENTS.PET_ADOPTED, (data) => {
      this.pets.set(data.pet.id, data.pet);
      this.emit('petAdopted', data);
    });

    this.socket.on(PET_EVENTS.PET_LEVELED_UP, (data) => {
      this.pets.set(data.pet.id, data.pet);
      this.emit('petLeveledUp', data);
    });

    this.socket.on(PET_EVENTS.PET_SKILL_LEARNED, (data) => {
      this.pets.set(data.pet.id, data.pet);
      this.emit('petSkillLearned', data);
    });

    this.socket.on(PET_EVENTS.PET_BATTLE_STARTED, (data) => {
      this.battles.set(data.battle.id, data.battle);
      this.emit('petBattleStarted', data);
    });

    this.socket.on(PET_EVENTS.PET_BATTLE_ENDED, (data) => {
      this.battles.set(data.battle.id, data.battle);
      this.emit('petBattleEnded', data);
    });

    this.socket.on(PET_EVENTS.PET_TRAINING_STARTED, (data) => {
      this.trainings.set(data.training.id, data.training);
      this.emit('petTrainingStarted', data);
    });

    this.socket.on(PET_EVENTS.PET_TRAINING_COMPLETED, (data) => {
      this.trainings.set(data.training.id, data.training);
      this.emit('petTrainingCompleted', data);
    });

    this.socket.on(PET_EVENTS.PET_CARE_STARTED, (data) => {
      this.careSessions.set(data.care.id, data.care);
      this.emit('petCareStarted', data);
    });

    this.socket.on(PET_EVENTS.PET_CARE_COMPLETED, (data) => {
      this.careSessions.set(data.care.id, data.care);
      this.emit('petCareCompleted', data);
    });

    this.socket.on(PET_EVENTS.PET_ACHIEVEMENT_UNLOCKED, (data) => {
      this.achievements.set(data.achievement.id, data.achievement);
      this.emit('petAchievementUnlocked', data);
    });

    this.socket.on(PET_EVENTS.PET_MARKETPLACE_LISTED, (data) => {
      this.marketplace.set(data.listing.id, data.listing);
      this.emit('petMarketplaceListed', data);
    });

    this.socket.on(PET_EVENTS.PET_MARKETPLACE_SOLD, (data) => {
      this.marketplace.set(data.listing.id, data.listing);
      this.emit('petMarketplaceSold', data);
    });

    this.socket.on(PET_EVENTS.PET_HEALTH_CHANGED, (data) => {
      const pet = this.pets.get(data.petId);
      if (pet) {
        pet.stats = { ...pet.stats, ...data.stats };
        this.pets.set(data.petId, pet);
        this.emit('petHealthChanged', data);
      }
    });

    this.socket.on(PET_EVENTS.PET_MOOD_CHANGED, (data) => {
      const pet = this.pets.get(data.petId);
      if (pet) {
        pet.personality.mood = data.mood;
        this.pets.set(data.petId, pet);
        this.emit('petMoodChanged', data);
      }
    });
  }

  // Event Management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Pet Management
  async adoptPet(species: PetSpecies, name: string): Promise<Pet> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('adoptPet', { species, name }, (response: any) => {
        if (response.success) {
          this.pets.set(response.pet.id, response.pet);
          resolve(response.pet);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getPet(petId: string): Promise<Pet | null> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('getPet', { petId }, (response: any) => {
        if (response.success) {
          this.pets.set(response.pet.id, response.pet);
          resolve(response.pet);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getUserPets(userId: string): Promise<Pet[]> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('getUserPets', { userId }, (response: any) => {
        if (response.success) {
          response.pets.forEach((pet: Pet) => {
            this.pets.set(pet.id, pet);
          });
          resolve(response.pets);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async updatePetStats(petId: string, stats: Partial<PetStats>): Promise<Pet | null> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('updatePetStats', { petId, stats }, (response: any) => {
        if (response.success) {
          this.pets.set(response.pet.id, response.pet);
          resolve(response.pet);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Pet Care System
  async startCare(petId: string, type: CareType, duration: number): Promise<PetCare> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('startPetCare', { petId, type, duration }, (response: any) => {
        if (response.success) {
          this.careSessions.set(response.care.id, response.care);
          resolve(response.care);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async completeCare(careId: string): Promise<PetCare | null> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('completePetCare', { careId }, (response: any) => {
        if (response.success) {
          this.careSessions.set(response.care.id, response.care);
          resolve(response.care);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getCareSessions(petId?: string): Promise<PetCare[]> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('getPetCareSessions', { petId }, (response: any) => {
        if (response.success) {
          response.careSessions.forEach((care: PetCare) => {
            this.careSessions.set(care.id, care);
          });
          resolve(response.careSessions);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Pet Training System
  async startTraining(petId: string, skillId: string, type: TrainingType): Promise<PetTraining> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('startPetTraining', { petId, skillId, type }, (response: any) => {
        if (response.success) {
          this.trainings.set(response.training.id, response.training);
          resolve(response.training);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async completeTraining(trainingId: string): Promise<PetTraining | null> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('completePetTraining', { trainingId }, (response: any) => {
        if (response.success) {
          this.trainings.set(response.training.id, response.training);
          resolve(response.training);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getTrainingSessions(petId?: string): Promise<PetTraining[]> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('getPetTrainingSessions', { petId }, (response: any) => {
        if (response.success) {
          response.trainings.forEach((training: PetTraining) => {
            this.trainings.set(training.id, training);
          });
          resolve(response.trainings);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Pet Battle System
  async startBattle(participants: string[], type: BattleType): Promise<PetBattle> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('startPetBattle', { participants, type }, (response: any) => {
        if (response.success) {
          this.battles.set(response.battle.id, response.battle);
          resolve(response.battle);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async executeBattleTurn(battleId: string, participantId: string, skillId: string, targetId?: string): Promise<PetBattle | null> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('executeBattleTurn', { battleId, participantId, skillId, targetId }, (response: any) => {
        if (response.success) {
          this.battles.set(response.battle.id, response.battle);
          resolve(response.battle);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getBattle(battleId: string): Promise<PetBattle | null> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('getPetBattle', { battleId }, (response: any) => {
        if (response.success) {
          this.battles.set(response.battle.id, response.battle);
          resolve(response.battle);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getActiveBattles(): Promise<PetBattle[]> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('getActivePetBattles', {}, (response: any) => {
        if (response.success) {
          response.battles.forEach((battle: PetBattle) => {
            this.battles.set(battle.id, battle);
          });
          resolve(response.battles);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Marketplace System
  async listPet(petId: string, price: number, type: MarketplaceType): Promise<PetMarketplace> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('listPet', { petId, price, type }, (response: any) => {
        if (response.success) {
          this.marketplace.set(response.listing.id, response.listing);
          resolve(response.listing);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async purchasePet(listingId: string): Promise<PetMarketplace | null> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('purchasePet', { listingId }, (response: any) => {
        if (response.success) {
          this.marketplace.set(response.listing.id, response.listing);
          resolve(response.listing);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getMarketplaceListings(filters?: any): Promise<PetMarketplace[]> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('getPetMarketplaceListings', { filters }, (response: any) => {
        if (response.success) {
          response.listings.forEach((listing: PetMarketplace) => {
            this.marketplace.set(listing.id, listing);
          });
          resolve(response.listings);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Achievement System
  async checkAchievements(petId: string): Promise<PetAchievement[]> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('checkPetAchievements', { petId }, (response: any) => {
        if (response.success) {
          response.achievements.forEach((achievement: PetAchievement) => {
            this.achievements.set(achievement.id, achievement);
          });
          resolve(response.achievements);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getAchievements(category?: AchievementCategory): Promise<PetAchievement[]> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('getPetAchievements', { category }, (response: any) => {
        if (response.success) {
          response.achievements.forEach((achievement: PetAchievement) => {
            this.achievements.set(achievement.id, achievement);
          });
          resolve(response.achievements);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Collection System
  async createCollection(name: string, description: string, petIds: string[]): Promise<PetCollection> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('createPetCollection', { name, description, petIds }, (response: any) => {
        if (response.success) {
          this.collections.set(response.collection.id, response.collection);
          resolve(response.collection);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getCollections(userId?: string): Promise<PetCollection[]> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('getPetCollections', { userId }, (response: any) => {
        if (response.success) {
          response.collections.forEach((collection: PetCollection) => {
            this.collections.set(collection.id, collection);
          });
          resolve(response.collections);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Utility Methods
  getPet(petId: string): Pet | null {
    return this.pets.get(petId) || null;
  }

  getBattle(battleId: string): PetBattle | null {
    return this.battles.get(battleId) || null;
  }

  getTraining(trainingId: string): PetTraining | null {
    return this.trainings.get(trainingId) || null;
  }

  getCare(careId: string): PetCare | null {
    return this.careSessions.get(careId) || null;
  }

  getAchievement(achievementId: string): PetAchievement | null {
    return this.achievements.get(achievementId) || null;
  }

  getMarketplaceListing(listingId: string): PetMarketplace | null {
    return this.marketplace.get(listingId) || null;
  }

  getCollection(collectionId: string): PetCollection | null {
    return this.collections.get(collectionId) || null;
  }

  getAllPets(): Pet[] {
    return Array.from(this.pets.values());
  }

  getAllBattles(): PetBattle[] {
    return Array.from(this.battles.values());
  }

  getAllTrainings(): PetTraining[] {
    return Array.from(this.trainings.values());
  }

  getAllCareSessions(): PetCare[] {
    return Array.from(this.careSessions.values());
  }

  getAllAchievements(): PetAchievement[] {
    return Array.from(this.achievements.values());
  }

  getAllMarketplaceListings(): PetMarketplace[] {
    return Array.from(this.marketplace.values());
  }

  getAllCollections(): PetCollection[] {
    return Array.from(this.collections.values());
  }

  // Pet Care Status
  getPetCareStatus(pet: Pet): { needsCare: boolean; careTypes: CareType[] } {
    const careTypes: CareType[] = [];
    let needsCare = false;

    if (pet.hunger < 30) {
      careTypes.push('feeding');
      needsCare = true;
    }

    if (pet.cleanliness < 40) {
      careTypes.push('grooming');
      needsCare = true;
    }

    if (pet.health.current < pet.health.maximum * 0.5) {
      careTypes.push('medical');
      needsCare = true;
    }

    if (pet.energy < 20) {
      careTypes.push('rest');
      needsCare = true;
    }

    if (pet.happiness < 30) {
      careTypes.push('play');
      needsCare = true;
    }

    return { needsCare, careTypes };
  }

  // Pet Training Status
  getPetTrainingStatus(pet: Pet): { canTrain: boolean; availableSkills: PetSkill[] } {
    const availableSkills = pet.skills.filter(skill => 
      skill.level < skill.maxLevel && skill.isUnlocked
    );
    
    return {
      canTrain: availableSkills.length > 0,
      availableSkills
    };
  }

  // Pet Battle Status
  getPetBattleStatus(pet: Pet): { canBattle: boolean; battleReady: boolean } {
    const canBattle = pet.level >= 5 && pet.health.current > 0;
    const battleReady = pet.health.current > pet.health.maximum * 0.8 && pet.energy > 50;
    
    return { canBattle, battleReady };
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}


