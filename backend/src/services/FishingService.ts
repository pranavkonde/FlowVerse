import { EventEmitter } from 'events';
import { CraftingService } from './CraftingService';
import { MiniGameService } from './MiniGameService';
import { InventoryService } from './InventoryService';

export interface Fish {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  size: {
    min: number;
    max: number;
  };
  weight: {
    min: number;
    max: number;
  };
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all';
  timeOfDay: 'any' | 'day' | 'night' | 'dawn' | 'dusk';
  habitat: 'river' | 'lake' | 'ocean' | 'pond';
  difficulty: number; // 1-10
  value: number;
  experience: number;
  catchTime: {
    min: number;
    max: number;
  };
  requirements: {
    level: number;
    rod?: string;
    bait?: string;
  };
  specialEffects?: {
    type: string;
    value: number;
  }[];
}

export interface FishingSpot {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  habitat: Fish['habitat'];
  availableFish: string[]; // Fish IDs
  maxFishers: number;
  currentFishers: string[]; // User IDs
  respawnTime: number;
  lastRespawn: Date;
  isActive: boolean;
  requirements: {
    level: number;
    quest?: string;
    item?: string;
  };
}

export interface FishingSession {
  id: string;
  userId: string;
  spotId: string;
  fishId?: string;
  startTime: Date;
  endTime?: Date;
  status: 'casting' | 'waiting' | 'minigame' | 'completed' | 'failed';
  progress: number;
  difficulty: number;
  rodId?: string;
  baitId?: string;
  catchTime?: number;
}

export interface FishingStats {
  totalCatches: number;
  rarityCount: Record<string, number>;
  biggestCatch: {
    fishId: string;
    size: number;
    weight: number;
    timestamp: Date;
  };
  favoriteSpot: {
    spotId: string;
    visits: number;
  };
  skillLevel: number;
  experience: number;
  achievements: string[];
}

export class FishingService extends EventEmitter {
  private static instance: FishingService;
  private fish: Map<string, Fish> = new Map();
  private spots: Map<string, FishingSpot> = new Map();
  private sessions: Map<string, FishingSession> = new Map();
  private userStats: Map<string, FishingStats> = new Map();

  private constructor(
    private craftingService: CraftingService,
    private miniGameService: MiniGameService,
    private inventoryService: InventoryService
  ) {
    super();
    this.initializeDefaultFish();
    this.initializeFishingSpots();
    this.startSpotRespawnTimer();
  }

  static getInstance(
    craftingService: CraftingService,
    miniGameService: MiniGameService,
    inventoryService: InventoryService
  ): FishingService {
    if (!FishingService.instance) {
      FishingService.instance = new FishingService(
        craftingService,
        miniGameService,
        inventoryService
      );
    }
    return FishingService.instance;
  }

  private initializeDefaultFish() {
    const defaultFish: Fish[] = [
      {
        id: 'common_carp',
        name: 'Common Carp',
        description: 'A hardy freshwater fish found in most rivers and lakes',
        rarity: 'common',
        size: { min: 30, max: 60 },
        weight: { min: 2, max: 8 },
        season: 'all',
        timeOfDay: 'any',
        habitat: 'river',
        difficulty: 2,
        value: 10,
        experience: 20,
        catchTime: { min: 5000, max: 10000 },
        requirements: { level: 1 }
      },
      {
        id: 'rainbow_trout',
        name: 'Rainbow Trout',
        description: 'A colorful fish known for its fighting spirit',
        rarity: 'uncommon',
        size: { min: 20, max: 40 },
        weight: { min: 1, max: 4 },
        season: 'spring',
        timeOfDay: 'dawn',
        habitat: 'river',
        difficulty: 4,
        value: 25,
        experience: 40,
        catchTime: { min: 8000, max: 15000 },
        requirements: {
          level: 5,
          rod: 'basic_rod',
          bait: 'worm'
        }
      },
      {
        id: 'golden_koi',
        name: 'Golden Koi',
        description: 'A rare and beautiful ornamental fish',
        rarity: 'rare',
        size: { min: 40, max: 80 },
        weight: { min: 3, max: 10 },
        season: 'summer',
        timeOfDay: 'day',
        habitat: 'pond',
        difficulty: 6,
        value: 100,
        experience: 80,
        catchTime: { min: 12000, max: 20000 },
        requirements: {
          level: 10,
          rod: 'quality_rod',
          bait: 'special_bait'
        },
        specialEffects: [
          { type: 'luck_boost', value: 5 },
          { type: 'gold_bonus', value: 10 }
        ]
      }
      // Add more fish as needed
    ];

    defaultFish.forEach(fish => this.fish.set(fish.id, fish));
  }

  private initializeFishingSpots() {
    const defaultSpots: FishingSpot[] = [
      {
        id: 'riverside_spot',
        name: 'Peaceful Riverside',
        description: 'A calm spot by the river, perfect for beginners',
        position: { x: 100, y: 100 },
        habitat: 'river',
        availableFish: ['common_carp', 'rainbow_trout'],
        maxFishers: 3,
        currentFishers: [],
        respawnTime: 300000, // 5 minutes
        lastRespawn: new Date(),
        isActive: true,
        requirements: { level: 1 }
      },
      {
        id: 'koi_pond',
        name: 'Sacred Koi Pond',
        description: 'A serene pond known for its rare koi fish',
        position: { x: 200, y: 200 },
        habitat: 'pond',
        availableFish: ['golden_koi'],
        maxFishers: 2,
        currentFishers: [],
        respawnTime: 600000, // 10 minutes
        lastRespawn: new Date(),
        isActive: true,
        requirements: {
          level: 10,
          quest: 'pond_access'
        }
      }
      // Add more spots as needed
    ];

    defaultSpots.forEach(spot => this.spots.set(spot.id, spot));
  }

  private startSpotRespawnTimer() {
    setInterval(() => {
      const now = new Date();
      this.spots.forEach((spot, spotId) => {
        if (!spot.isActive && (now.getTime() - spot.lastRespawn.getTime()) >= spot.respawnTime) {
          spot.isActive = true;
          this.spots.set(spotId, spot);
          this.emit('spotRespawned', spot);
        }
      });
    }, 60000); // Check every minute
  }

  async startFishing(
    userId: string,
    spotId: string,
    rodId?: string,
    baitId?: string
  ): Promise<FishingSession> {
    const spot = this.spots.get(spotId);
    if (!spot || !spot.isActive) {
      throw new Error('Fishing spot not available');
    }

    if (spot.currentFishers.length >= spot.maxFishers) {
      throw new Error('Fishing spot is full');
    }

    const stats = await this.getStats(userId);
    if (stats.skillLevel < spot.requirements.level) {
      throw new Error('Insufficient fishing level');
    }

    // Check if user has required items
    // This would integrate with your inventory system

    const session: FishingSession = {
      id: crypto.randomUUID(),
      userId,
      spotId,
      startTime: new Date(),
      status: 'casting',
      progress: 0,
      difficulty: 1,
      rodId,
      baitId
    };

    spot.currentFishers.push(userId);
    this.spots.set(spotId, spot);
    this.sessions.set(session.id, session);

    this.emit('fishingStarted', { session, spot });
    return session;
  }

  async cast(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'casting') {
      throw new Error('Invalid fishing session');
    }

    const spot = this.spots.get(session.spotId);
    if (!spot) {
      throw new Error('Fishing spot not found');
    }

    // Calculate which fish is caught based on various factors
    const fish = await this.calculateCatch(spot, session);
    if (!fish) {
      session.status = 'failed';
      this.sessions.set(sessionId, session);
      this.emit('fishingFailed', { session, reason: 'No fish bit' });
      return;
    }

    session.fishId = fish.id;
    session.status = 'waiting';
    session.difficulty = fish.difficulty;
    session.catchTime = Math.floor(
      Math.random() * (fish.catchTime.max - fish.catchTime.min) + fish.catchTime.min
    );

    this.sessions.set(sessionId, session);
    this.emit('fishBit', { session, fish });

    // Start catch timer
    setTimeout(() => {
      if (session.status === 'waiting') {
        session.status = 'failed';
        this.sessions.set(sessionId, session);
        this.emit('fishingFailed', { session, reason: 'Too slow' });
      }
    }, 3000); // 3 seconds to react
  }

  async hook(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'waiting') {
      throw new Error('Invalid fishing session');
    }

    const fish = this.fish.get(session.fishId!);
    if (!fish) {
      throw new Error('Fish not found');
    }

    session.status = 'minigame';
    this.sessions.set(sessionId, session);
    this.emit('fishingMinigameStarted', { session, fish });
  }

  async updateMinigame(
    sessionId: string,
    progress: number
  ): Promise<{ completed: boolean; success: boolean }> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'minigame') {
      throw new Error('Invalid fishing session');
    }

    const fish = this.fish.get(session.fishId!);
    if (!fish) {
      throw new Error('Fish not found');
    }

    session.progress = Math.min(100, Math.max(0, progress));
    this.sessions.set(sessionId, session);

    if (session.progress >= 100) {
      await this.completeFishing(sessionId, true);
      return { completed: true, success: true };
    } else if (session.progress <= 0) {
      await this.completeFishing(sessionId, false);
      return { completed: true, success: false };
    }

    return { completed: false, success: false };
  }

  private async completeFishing(sessionId: string, success: boolean): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const spot = this.spots.get(session.spotId);
    if (!spot) {
      throw new Error('Spot not found');
    }

    session.status = success ? 'completed' : 'failed';
    session.endTime = new Date();
    this.sessions.set(sessionId, session);

    // Remove user from spot
    spot.currentFishers = spot.currentFishers.filter(id => id !== session.userId);
    this.spots.set(spot.id, spot);

    if (success && session.fishId) {
      const fish = this.fish.get(session.fishId);
      if (fish) {
        // Add fish to inventory
        // This would integrate with your inventory system

        // Update user stats
        await this.updateStats(session.userId, fish);

        this.emit('fishingCompleted', { session, fish });
      }
    } else {
      this.emit('fishingFailed', { session, reason: 'Minigame failed' });
    }
  }

  private async calculateCatch(spot: FishingSpot, session: FishingSession): Promise<Fish | null> {
    const availableFish = spot.availableFish
      .map(id => this.fish.get(id))
      .filter((fish): fish is Fish => fish !== undefined)
      .filter(fish => {
        // Check season
        const currentSeason = this.getCurrentSeason();
        if (fish.season !== 'all' && fish.season !== currentSeason) {
          return false;
        }

        // Check time of day
        const currentTime = this.getTimeOfDay();
        if (fish.timeOfDay !== 'any' && fish.timeOfDay !== currentTime) {
          return false;
        }

        // Check requirements
        const stats = this.userStats.get(session.userId);
        if (!stats || stats.skillLevel < fish.requirements.level) {
          return false;
        }

        if (fish.requirements.rod && session.rodId !== fish.requirements.rod) {
          return false;
        }

        if (fish.requirements.bait && session.baitId !== fish.requirements.bait) {
          return false;
        }

        return true;
      });

    if (availableFish.length === 0) {
      return null;
    }

    // Calculate catch chances based on rarity and other factors
    const totalWeight = availableFish.reduce((sum, fish) => {
      let weight = 1;
      switch (fish.rarity) {
        case 'common': weight = 100; break;
        case 'uncommon': weight = 50; break;
        case 'rare': weight = 20; break;
        case 'epic': weight = 5; break;
        case 'legendary': weight = 1; break;
      }
      return sum + weight;
    }, 0);

    let random = Math.random() * totalWeight;
    for (const fish of availableFish) {
      let weight = 1;
      switch (fish.rarity) {
        case 'common': weight = 100; break;
        case 'uncommon': weight = 50; break;
        case 'rare': weight = 20; break;
        case 'epic': weight = 5; break;
        case 'legendary': weight = 1; break;
      }
      random -= weight;
      if (random <= 0) {
        return fish;
      }
    }

    return availableFish[0];
  }

  private getCurrentSeason(): Fish['season'] {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private getTimeOfDay(): Fish['timeOfDay'] {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 18) return 'day';
    if (hour >= 18 && hour < 20) return 'dusk';
    return 'night';
  }

  private async updateStats(userId: string, fish: Fish): Promise<void> {
    let stats = this.userStats.get(userId);
    if (!stats) {
      stats = {
        totalCatches: 0,
        rarityCount: {},
        biggestCatch: {
          fishId: fish.id,
          size: fish.size.min,
          weight: fish.weight.min,
          timestamp: new Date()
        },
        favoriteSpot: {
          spotId: '',
          visits: 0
        },
        skillLevel: 1,
        experience: 0,
        achievements: []
      };
    }

    stats.totalCatches++;
    stats.rarityCount[fish.rarity] = (stats.rarityCount[fish.rarity] || 0) + 1;
    stats.experience += fish.experience;

    // Update skill level
    const newLevel = Math.floor(Math.sqrt(stats.experience / 100)) + 1;
    if (newLevel > stats.skillLevel) {
      stats.skillLevel = newLevel;
      this.emit('levelUp', { userId, level: newLevel });
    }

    // Update biggest catch if applicable
    const size = Math.random() * (fish.size.max - fish.size.min) + fish.size.min;
    const weight = Math.random() * (fish.weight.max - fish.weight.min) + fish.weight.min;
    if (size > stats.biggestCatch.size || weight > stats.biggestCatch.weight) {
      stats.biggestCatch = {
        fishId: fish.id,
        size,
        weight,
        timestamp: new Date()
      };
    }

    this.userStats.set(userId, stats);
    this.emit('statsUpdated', { userId, stats });
  }

  async getStats(userId: string): Promise<FishingStats> {
    return (
      this.userStats.get(userId) || {
        totalCatches: 0,
        rarityCount: {},
        biggestCatch: {
          fishId: '',
          size: 0,
          weight: 0,
          timestamp: new Date()
        },
        favoriteSpot: {
          spotId: '',
          visits: 0
        },
        skillLevel: 1,
        experience: 0,
        achievements: []
      }
    );
  }

  async getFishingSpots(): Promise<FishingSpot[]> {
    return Array.from(this.spots.values());
  }

  async getAvailableFish(): Promise<Fish[]> {
    return Array.from(this.fish.values());
  }

  async getSession(sessionId: string): Promise<FishingSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  onFishingStarted(callback: (data: { session: FishingSession; spot: FishingSpot }) => void) {
    this.on('fishingStarted', callback);
  }

  onFishBit(callback: (data: { session: FishingSession; fish: Fish }) => void) {
    this.on('fishBit', callback);
  }

  onFishingMinigameStarted(callback: (data: { session: FishingSession; fish: Fish }) => void) {
    this.on('fishingMinigameStarted', callback);
  }

  onFishingCompleted(callback: (data: { session: FishingSession; fish: Fish }) => void) {
    this.on('fishingCompleted', callback);
  }

  onFishingFailed(callback: (data: { session: FishingSession; reason: string }) => void) {
    this.on('fishingFailed', callback);
  }

  onSpotRespawned(callback: (spot: FishingSpot) => void) {
    this.on('spotRespawned', callback);
  }

  onLevelUp(callback: (data: { userId: string; level: number }) => void) {
    this.on('levelUp', callback);
  }

  onStatsUpdated(callback: (data: { userId: string; stats: FishingStats }) => void) {
    this.on('statsUpdated', callback);
  }
}

export const fishingService = FishingService.getInstance(
  new CraftingService(null as any), // Pass proper SocketIO instance
  new MiniGameService(),
  new InventoryService()
);
