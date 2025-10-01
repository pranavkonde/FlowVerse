import { EventEmitter } from 'events';
import {
  FishingSpot,
  Fish,
  FishingEquipment,
  FishingAttempt,
  FishingResult,
  FishingStats,
  Season,
  TimeOfDay,
  WeatherEffect,
  AttemptStatus,
  CatchQuality
} from '../types/fishing';

export class FishingService extends EventEmitter {
  private spots: Map<string, FishingSpot> = new Map();
  private fish: Map<string, Fish> = new Map();
  private equipment: Map<string, FishingEquipment> = new Map();
  private attempts: Map<string, FishingAttempt> = new Map();
  private userStats: Map<string, FishingStats> = new Map();
  private currentSeason: Season;
  private currentTime: TimeOfDay;
  private currentWeather: WeatherEffect;

  constructor() {
    super();
    this.currentSeason = this.calculateSeason();
    this.currentTime = this.calculateTimeOfDay();
    this.currentWeather = 'CLEAR';
    this.initializeFishData();
    this.initializeSpots();
    this.startTimeAndWeatherCycle();
  }

  private calculateSeason(): Season {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'SPRING';
    if (month >= 5 && month <= 7) return 'SUMMER';
    if (month >= 8 && month <= 10) return 'FALL';
    return 'WINTER';
  }

  private calculateTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) return 'DAWN';
    if (hour >= 8 && hour < 17) return 'DAY';
    if (hour >= 17 && hour < 20) return 'DUSK';
    return 'NIGHT';
  }

  private startTimeAndWeatherCycle(): void {
    // Update time of day every hour
    setInterval(() => {
      this.currentTime = this.calculateTimeOfDay();
      this.emit('time:changed', { time: this.currentTime });
    }, 3600000);

    // Update weather randomly every 3 hours
    setInterval(() => {
      const weathers: WeatherEffect[] = ['CLEAR', 'CLOUDY', 'RAIN', 'STORM', 'WINDY', 'FOG'];
      this.currentWeather = weathers[Math.floor(Math.random() * weathers.length)];
      this.emit('weather:changed', { weather: this.currentWeather });
    }, 10800000);

    // Check season daily
    setInterval(() => {
      const newSeason = this.calculateSeason();
      if (newSeason !== this.currentSeason) {
        this.currentSeason = newSeason;
        this.emit('season:changed', { season: this.currentSeason });
      }
    }, 86400000);
  }

  private initializeFishData(): void {
    const fishData: Fish[] = [
      {
        id: 'FISH-1',
        name: 'Common Carp',
        type: 'COMMON',
        rarity: 'COMMON',
        size: { min: 30, max: 60 },
        weight: { min: 2, max: 8 },
        value: 10,
        season: ['SPRING', 'SUMMER', 'FALL'],
        timeOfDay: ['DAY', 'DUSK'],
        catchDifficulty: 1,
        specialEffects: [],
        description: 'A common freshwater fish found in lakes and ponds',
        imageUrl: '/images/fish/common-carp.png'
      },
      // Add more fish...
    ];

    fishData.forEach(fish => this.fish.set(fish.id, fish));
  }

  private initializeSpots(): void {
    const spots: FishingSpot[] = [
      {
        id: 'SPOT-1',
        name: 'Tranquil Lake',
        type: 'LAKE',
        difficulty: 1,
        availableFish: Array.from(this.fish.values()).filter(f => f.type === 'COMMON'),
        requiredLevel: 1,
        requiredEquipment: ['BASIC_ROD'],
        weatherEffects: ['CLEAR', 'RAIN'],
        seasonalBonus: ['SPRING', 'SUMMER'],
        position: { x: 100, y: 100 }
      },
      // Add more spots...
    ];

    spots.forEach(spot => this.spots.set(spot.id, spot));
  }

  public async startFishing(
    userId: string,
    spotId: string,
    equipment: {
      rod?: string;
      reel?: string;
      line?: string;
      bait?: string;
      lure?: string;
    }
  ): Promise<FishingAttempt> {
    const spot = this.spots.get(spotId);
    if (!spot) {
      throw new Error('Fishing spot not found');
    }

    // Check cooldown
    if (
      spot.cooldown &&
      spot.lastFished &&
      Date.now() - new Date(spot.lastFished).getTime() < spot.cooldown
    ) {
      throw new Error('Fishing spot is on cooldown');
    }

    const attempt: FishingAttempt = {
      id: `ATTEMPT-${Date.now()}`,
      userId,
      spotId,
      equipment,
      startedAt: new Date().toISOString(),
      status: 'CASTING',
      progress: 0,
      difficulty: this.calculateDifficulty(spot)
    };

    this.attempts.set(attempt.id, attempt);
    this.emit('fishing:started', { attemptId: attempt.id });

    // Simulate fishing process
    this.simulateFishing(attempt);

    return attempt;
  }

  private calculateDifficulty(spot: FishingSpot): number {
    let difficulty = spot.difficulty;

    // Weather effects
    if (this.currentWeather === 'STORM') difficulty *= 1.5;
    if (this.currentWeather === 'RAIN') difficulty *= 0.8;

    // Time of day effects
    if (this.currentTime === 'DAWN' || this.currentTime === 'DUSK') {
      difficulty *= 0.9;
    }
    if (this.currentTime === 'NIGHT') difficulty *= 1.2;

    return difficulty;
  }

  private async simulateFishing(attempt: FishingAttempt): Promise<void> {
    // Casting phase
    setTimeout(() => {
      attempt.status = 'WAITING';
      this.attempts.set(attempt.id, attempt);
      this.emit('fishing:status-changed', { attemptId: attempt.id, status: 'WAITING' });

      // Random wait time for fish to bite (3-10 seconds)
      const biteTime = 3000 + Math.random() * 7000;
      setTimeout(() => {
        attempt.status = 'BITING';
        this.attempts.set(attempt.id, attempt);
        this.emit('fishing:status-changed', { attemptId: attempt.id, status: 'BITING' });

        // Give player 2 seconds to respond to bite
        setTimeout(() => {
          if (attempt.status === 'BITING') {
            this.failAttempt(attempt);
          }
        }, 2000);
      }, biteTime);
    }, 1000);
  }

  public async respondToBite(attemptId: string): Promise<FishingAttempt> {
    const attempt = this.attempts.get(attemptId);
    if (!attempt || attempt.status !== 'BITING') {
      throw new Error('Invalid attempt or wrong status');
    }

    attempt.status = 'REELING';
    this.attempts.set(attemptId, attempt);
    this.emit('fishing:status-changed', { attemptId, status: 'REELING' });

    // Start reeling minigame
    this.startReelingMinigame(attempt);

    return attempt;
  }

  private startReelingMinigame(attempt: FishingAttempt): void {
    let progress = 0;
    const progressInterval = setInterval(() => {
      if (attempt.status !== 'REELING') {
        clearInterval(progressInterval);
        return;
      }

      progress += Math.random() * 10;
      attempt.progress = Math.min(100, progress);
      this.attempts.set(attempt.id, attempt);
      this.emit('fishing:progress', {
        attemptId: attempt.id,
        progress: attempt.progress
      });

      if (attempt.progress >= 100) {
        clearInterval(progressInterval);
        this.completeAttempt(attempt);
      }
    }, 500);
  }

  private async completeAttempt(attempt: FishingAttempt): Promise<void> {
    const spot = this.spots.get(attempt.spotId);
    if (!spot) return;

    // Calculate catch result
    const result = this.calculateCatchResult(spot);
    attempt.status = 'COMPLETED';
    attempt.endedAt = new Date().toISOString();
    attempt.result = result;

    // Update spot cooldown
    spot.lastFished = new Date().toISOString();
    this.spots.set(spot.id, spot);

    // Update user stats
    if (result.success) {
      this.updateUserStats(attempt.userId, result);
    }

    this.attempts.set(attempt.id, attempt);
    this.emit('fishing:completed', { attemptId: attempt.id, result });
  }

  private failAttempt(attempt: FishingAttempt): void {
    attempt.status = 'FAILED';
    attempt.endedAt = new Date().toISOString();
    attempt.result = {
      success: false,
      experience: 1
    };

    this.attempts.set(attempt.id, attempt);
    this.emit('fishing:failed', { attemptId: attempt.id });
  }

  private calculateCatchResult(spot: FishingSpot): FishingResult {
    const availableFish = spot.availableFish.filter(fish =>
      fish.season.includes(this.currentSeason) &&
      fish.timeOfDay.includes(this.currentTime)
    );

    if (availableFish.length === 0) {
      return { success: false, experience: 1 };
    }

    // Calculate catch probabilities based on rarity
    const rarityWeights = {
      COMMON: 100,
      UNCOMMON: 60,
      RARE: 30,
      EPIC: 15,
      LEGENDARY: 5,
      MYTHICAL: 1
    };

    const weightedFish = availableFish.map(fish => ({
      fish,
      weight: rarityWeights[fish.rarity]
    }));

    const totalWeight = weightedFish.reduce((sum, f) => sum + f.weight, 0);
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    const caughtFish = weightedFish.find(({ weight }) => {
      currentWeight += weight;
      return random <= currentWeight;
    })?.fish;

    if (!caughtFish) {
      return { success: false, experience: 1 };
    }

    // Calculate size and weight
    const size = caughtFish.size.min +
      Math.random() * (caughtFish.size.max - caughtFish.size.min);
    const weight = caughtFish.weight.min +
      Math.random() * (caughtFish.weight.max - caughtFish.weight.min);

    // Calculate quality
    let quality: CatchQuality = 'NORMAL';
    const qualityRoll = Math.random();
    if (qualityRoll > 0.95) quality = 'PERFECT';
    else if (qualityRoll > 0.85) quality = 'GREAT';
    else if (qualityRoll > 0.70) quality = 'GOOD';
    else if (qualityRoll < 0.15) quality = 'POOR';

    // Calculate experience
    const baseExperience = caughtFish.value;
    const qualityMultiplier = {
      POOR: 0.5,
      NORMAL: 1,
      GOOD: 1.2,
      GREAT: 1.5,
      PERFECT: 2
    }[quality];

    return {
      success: true,
      fish: caughtFish,
      size,
      weight,
      quality,
      experience: Math.round(baseExperience * qualityMultiplier)
    };
  }

  private updateUserStats(
    userId: string,
    result: FishingResult
  ): void {
    if (!result.success || !result.fish) return;

    let stats = this.userStats.get(userId);
    if (!stats) {
      stats = {
        totalCatches: 0,
        rarityCount: {} as Record<string, number>,
        typeCount: {} as Record<string, number>,
        biggestCatch: {
          fish: result.fish,
          size: result.size!,
          weight: result.weight!
        },
        totalValue: 0,
        perfectCatches: 0,
        specialCatches: 0,
        achievements: []
      };
    }

    stats.totalCatches++;
    stats.rarityCount[result.fish.rarity] =
      (stats.rarityCount[result.fish.rarity] || 0) + 1;
    stats.typeCount[result.fish.type] =
      (stats.typeCount[result.fish.type] || 0) + 1;
    stats.totalValue += result.fish.value;

    if (result.quality === 'PERFECT') {
      stats.perfectCatches++;
    }

    if (result.fish.specialEffects.length > 0) {
      stats.specialCatches++;
    }

    if (
      result.size! > stats.biggestCatch.size ||
      (result.size! === stats.biggestCatch.size &&
        result.weight! > stats.biggestCatch.weight)
    ) {
      stats.biggestCatch = {
        fish: result.fish,
        size: result.size!,
        weight: result.weight!
      };
    }

    // Check for achievements
    this.checkAchievements(stats);

    this.userStats.set(userId, stats);
  }

  private checkAchievements(stats: FishingStats): void {
    const newAchievements: string[] = [];

    if (stats.totalCatches >= 100 && !stats.achievements.includes('CENTURY_FISHER')) {
      newAchievements.push('CENTURY_FISHER');
    }

    if (stats.perfectCatches >= 10 && !stats.achievements.includes('PERFECT_FISHER')) {
      newAchievements.push('PERFECT_FISHER');
    }

    if (
      stats.rarityCount['LEGENDARY'] >= 1 &&
      !stats.achievements.includes('LEGENDARY_CATCH')
    ) {
      newAchievements.push('LEGENDARY_CATCH');
    }

    stats.achievements.push(...newAchievements);
  }

  public async getSpots(): Promise<FishingSpot[]> {
    return Array.from(this.spots.values());
  }

  public async getAttempt(attemptId: string): Promise<FishingAttempt | undefined> {
    return this.attempts.get(attemptId);
  }

  public async getUserStats(userId: string): Promise<FishingStats> {
    return (
      this.userStats.get(userId) || {
        totalCatches: 0,
        rarityCount: {},
        typeCount: {},
        biggestCatch: null,
        totalValue: 0,
        perfectCatches: 0,
        specialCatches: 0,
        achievements: []
      }
    );
  }

  public getCurrentConditions(): {
    season: Season;
    time: TimeOfDay;
    weather: WeatherEffect;
  } {
    return {
      season: this.currentSeason,
      time: this.currentTime,
      weather: this.currentWeather
    };
  }
}