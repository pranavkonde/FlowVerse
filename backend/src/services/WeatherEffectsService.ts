import { EventEmitter } from 'events';
import { WeatherService } from './WeatherService';
import { CombatService } from './CombatService';
import { FarmingService } from './FarmingService';
import { FishingService } from './FishingService';

export interface WeatherEffect {
  id: string;
  type: 'rain' | 'snow' | 'storm' | 'fog' | 'clear' | 'wind' | 'sandstorm' | 'rainbow';
  intensity: 'light' | 'medium' | 'heavy';
  visualEffects: {
    particleSystem: string;
    ambientLight: string;
    skybox: string;
    postProcessing?: string[];
    animations?: string[];
  };
  soundEffects: {
    ambient: string;
    oneShot?: string[];
    volume: number;
  };
  gameplayEffects: {
    visibility: number; // 0-100
    movementSpeed: number; // Multiplier
    resourceGatheringRate: number; // Multiplier
    fishingSuccess: number; // Multiplier
    combatModifiers: {
      accuracy: number; // Multiplier
      damage: number; // Multiplier
      elementalBonus?: {
        type: string;
        multiplier: number;
      };
    };
  };
  duration: number; // in milliseconds
  transitionTime: number; // in milliseconds
}

export interface WeatherZone {
  id: string;
  name: string;
  position: { x: number; y: number };
  radius: number;
  currentEffect: WeatherEffect | null;
  nextEffect: WeatherEffect | null;
  transitionProgress: number;
  affectedPlayers: string[];
}

export class WeatherEffectsService extends EventEmitter {
  private static instance: WeatherEffectsService;
  private effects: Map<string, WeatherEffect> = new Map();
  private zones: Map<string, WeatherZone> = new Map();
  private playerZones: Map<string, string> = new Map(); // userId -> zoneId

  private readonly DEFAULT_EFFECTS: WeatherEffect[] = [
    {
      id: 'light_rain',
      type: 'rain',
      intensity: 'light',
      visualEffects: {
        particleSystem: 'rain_light',
        ambientLight: '#8899aa',
        skybox: 'cloudy_light',
        postProcessing: ['rain_drops']
      },
      soundEffects: {
        ambient: 'rain_light.mp3',
        volume: 0.3
      },
      gameplayEffects: {
        visibility: 80,
        movementSpeed: 0.9,
        resourceGatheringRate: 1.1,
        fishingSuccess: 1.2,
        combatModifiers: {
          accuracy: 0.95,
          damage: 1,
          elementalBonus: {
            type: 'water',
            multiplier: 1.2
          }
        }
      },
      duration: 300000, // 5 minutes
      transitionTime: 10000 // 10 seconds
    },
    {
      id: 'heavy_rain',
      type: 'rain',
      intensity: 'heavy',
      visualEffects: {
        particleSystem: 'rain_heavy',
        ambientLight: '#667788',
        skybox: 'cloudy_heavy',
        postProcessing: ['rain_drops', 'blur_light']
      },
      soundEffects: {
        ambient: 'rain_heavy.mp3',
        oneShot: ['thunder_distant.mp3'],
        volume: 0.6
      },
      gameplayEffects: {
        visibility: 60,
        movementSpeed: 0.8,
        resourceGatheringRate: 1.2,
        fishingSuccess: 1.5,
        combatModifiers: {
          accuracy: 0.8,
          damage: 0.9,
          elementalBonus: {
            type: 'water',
            multiplier: 1.5
          }
        }
      },
      duration: 180000, // 3 minutes
      transitionTime: 15000 // 15 seconds
    },
    {
      id: 'light_snow',
      type: 'snow',
      intensity: 'light',
      visualEffects: {
        particleSystem: 'snow_light',
        ambientLight: '#eeeeff',
        skybox: 'winter_light',
        postProcessing: ['snow_particles']
      },
      soundEffects: {
        ambient: 'wind_light.mp3',
        volume: 0.2
      },
      gameplayEffects: {
        visibility: 85,
        movementSpeed: 0.95,
        resourceGatheringRate: 0.9,
        fishingSuccess: 0.8,
        combatModifiers: {
          accuracy: 0.9,
          damage: 1,
          elementalBonus: {
            type: 'ice',
            multiplier: 1.2
          }
        }
      },
      duration: 360000, // 6 minutes
      transitionTime: 20000 // 20 seconds
    },
    {
      id: 'heavy_snow',
      type: 'snow',
      intensity: 'heavy',
      visualEffects: {
        particleSystem: 'snow_heavy',
        ambientLight: '#ccccff',
        skybox: 'winter_heavy',
        postProcessing: ['snow_particles', 'blur_medium']
      },
      soundEffects: {
        ambient: 'wind_heavy.mp3',
        volume: 0.4
      },
      gameplayEffects: {
        visibility: 50,
        movementSpeed: 0.7,
        resourceGatheringRate: 0.7,
        fishingSuccess: 0.6,
        combatModifiers: {
          accuracy: 0.7,
          damage: 0.8,
          elementalBonus: {
            type: 'ice',
            multiplier: 1.5
          }
        }
      },
      duration: 240000, // 4 minutes
      transitionTime: 25000 // 25 seconds
    },
    {
      id: 'storm',
      type: 'storm',
      intensity: 'heavy',
      visualEffects: {
        particleSystem: 'storm',
        ambientLight: '#445566',
        skybox: 'storm',
        postProcessing: ['rain_heavy', 'blur_heavy', 'lightning'],
        animations: ['lightning_flash', 'wind_sway']
      },
      soundEffects: {
        ambient: 'storm.mp3',
        oneShot: ['thunder_close.mp3', 'lightning_strike.mp3'],
        volume: 0.8
      },
      gameplayEffects: {
        visibility: 40,
        movementSpeed: 0.6,
        resourceGatheringRate: 0.5,
        fishingSuccess: 0.3,
        combatModifiers: {
          accuracy: 0.6,
          damage: 1.2,
          elementalBonus: {
            type: 'lightning',
            multiplier: 2.0
          }
        }
      },
      duration: 120000, // 2 minutes
      transitionTime: 30000 // 30 seconds
    },
    {
      id: 'rainbow',
      type: 'rainbow',
      intensity: 'light',
      visualEffects: {
        particleSystem: 'rainbow_sparkles',
        ambientLight: '#ffffff',
        skybox: 'clear_rainbow',
        postProcessing: ['bloom_light'],
        animations: ['rainbow_shimmer']
      },
      soundEffects: {
        ambient: 'peaceful.mp3',
        volume: 0.2
      },
      gameplayEffects: {
        visibility: 100,
        movementSpeed: 1.1,
        resourceGatheringRate: 1.5,
        fishingSuccess: 1.5,
        combatModifiers: {
          accuracy: 1.2,
          damage: 1.2,
          elementalBonus: {
            type: 'all',
            multiplier: 1.2
          }
        }
      },
      duration: 300000, // 5 minutes
      transitionTime: 20000 // 20 seconds
    }
  ];

  private constructor(
    private weatherService: WeatherService,
    private combatService: CombatService,
    private farmingService: FarmingService,
    private fishingService: FishingService
  ) {
    super();
    this.initializeEffects();
    this.initializeZones();
    this.startWeatherCycle();
  }

  static getInstance(
    weatherService: WeatherService,
    combatService: CombatService,
    farmingService: FarmingService,
    fishingService: FishingService
  ): WeatherEffectsService {
    if (!WeatherEffectsService.instance) {
      WeatherEffectsService.instance = new WeatherEffectsService(
        weatherService,
        combatService,
        farmingService,
        fishingService
      );
    }
    return WeatherEffectsService.instance;
  }

  private initializeEffects() {
    this.DEFAULT_EFFECTS.forEach(effect => this.effects.set(effect.id, effect));
  }

  private initializeZones() {
    const defaultZones: WeatherZone[] = [
      {
        id: 'central_plains',
        name: 'Central Plains',
        position: { x: 0, y: 0 },
        radius: 1000,
        currentEffect: null,
        nextEffect: null,
        transitionProgress: 0,
        affectedPlayers: []
      },
      {
        id: 'northern_mountains',
        name: 'Northern Mountains',
        position: { x: 0, y: 1000 },
        radius: 800,
        currentEffect: null,
        nextEffect: null,
        transitionProgress: 0,
        affectedPlayers: []
      },
      {
        id: 'coastal_region',
        name: 'Coastal Region',
        position: { x: 1000, y: 0 },
        radius: 600,
        currentEffect: null,
        nextEffect: null,
        transitionProgress: 0,
        affectedPlayers: []
      }
    ];

    defaultZones.forEach(zone => this.zones.set(zone.id, zone));
  }

  private startWeatherCycle() {
    // Update weather effects every second
    setInterval(() => {
      this.zones.forEach((zone, zoneId) => {
        // Update transition progress
        if (zone.nextEffect) {
          zone.transitionProgress = Math.min(
            1,
            zone.transitionProgress + 1000 / zone.nextEffect.transitionTime
          );

          if (zone.transitionProgress >= 1) {
            zone.currentEffect = zone.nextEffect;
            zone.nextEffect = null;
            zone.transitionProgress = 0;
            this.emit('weatherChanged', { zoneId, effect: zone.currentEffect });
          }
        }

        // Check if current effect should end
        if (zone.currentEffect && !zone.nextEffect) {
          const effectDuration = Date.now() - zone.currentEffect.duration;
          if (effectDuration <= 0) {
            this.setNextWeatherEffect(zoneId);
          }
        }

        // Apply gameplay effects to affected players
        zone.affectedPlayers.forEach(playerId => {
          this.applyGameplayEffects(playerId, zone);
        });
      });
    }, 1000);

    // Initialize weather in each zone
    this.zones.forEach((_, zoneId) => this.setNextWeatherEffect(zoneId));
  }

  private setNextWeatherEffect(zoneId: string) {
    const zone = this.zones.get(zoneId);
    if (!zone) return;

    // Get current season from weather service
    const currentSeason = this.weatherService.getCurrentSeason();
    
    // Filter effects by season and get random effect
    const availableEffects = Array.from(this.effects.values()).filter(effect => {
      switch (currentSeason) {
        case 'winter':
          return ['snow', 'clear', 'wind'].includes(effect.type);
        case 'spring':
          return ['rain', 'clear', 'rainbow'].includes(effect.type);
        case 'summer':
          return ['clear', 'storm', 'rain'].includes(effect.type);
        case 'fall':
          return ['rain', 'wind', 'clear'].includes(effect.type);
        default:
          return true;
      }
    });

    const randomEffect = availableEffects[Math.floor(Math.random() * availableEffects.length)];
    zone.nextEffect = randomEffect;
    zone.transitionProgress = 0;
    this.zones.set(zoneId, zone);

    this.emit('weatherTransitionStarted', {
      zoneId,
      fromEffect: zone.currentEffect,
      toEffect: randomEffect
    });
  }

  private applyGameplayEffects(playerId: string, zone: WeatherZone) {
    if (!zone.currentEffect) return;

    const effects = zone.currentEffect.gameplayEffects;
    const transitionMultiplier = zone.nextEffect
      ? 1 - zone.transitionProgress
      : 1;

    // Apply movement speed
    this.emit('playerSpeedModified', {
      playerId,
      multiplier: effects.movementSpeed * transitionMultiplier
    });

    // Apply combat modifiers
    this.emit('combatModifiersUpdated', {
      playerId,
      modifiers: {
        accuracy: effects.combatModifiers.accuracy * transitionMultiplier,
        damage: effects.combatModifiers.damage * transitionMultiplier,
        elementalBonus: effects.combatModifiers.elementalBonus
      }
    });

    // Apply resource gathering rate
    this.emit('resourceGatheringModified', {
      playerId,
      multiplier: effects.resourceGatheringRate * transitionMultiplier
    });

    // Apply fishing success rate
    this.emit('fishingSuccessModified', {
      playerId,
      multiplier: effects.fishingSuccess * transitionMultiplier
    });
  }

  async updatePlayerPosition(
    playerId: string,
    position: { x: number; y: number }
  ): Promise<void> {
    // Find zone containing player
    let newZoneId: string | null = null;
    for (const [zoneId, zone] of this.zones.entries()) {
      const distance = Math.sqrt(
        Math.pow(position.x - zone.position.x, 2) +
        Math.pow(position.y - zone.position.y, 2)
      );
      if (distance <= zone.radius) {
        newZoneId = zoneId;
        break;
      }
    }

    const currentZoneId = this.playerZones.get(playerId);
    if (currentZoneId === newZoneId) return;

    // Remove player from current zone
    if (currentZoneId) {
      const currentZone = this.zones.get(currentZoneId);
      if (currentZone) {
        currentZone.affectedPlayers = currentZone.affectedPlayers.filter(
          id => id !== playerId
        );
        this.zones.set(currentZoneId, currentZone);
      }
    }

    // Add player to new zone
    if (newZoneId) {
      const newZone = this.zones.get(newZoneId);
      if (newZone) {
        newZone.affectedPlayers.push(playerId);
        this.zones.set(newZoneId, newZone);
        this.playerZones.set(playerId, newZoneId);

        // Apply immediate weather effects
        if (newZone.currentEffect) {
          this.emit('playerEnteredWeatherZone', {
            playerId,
            zoneId: newZoneId,
            effect: newZone.currentEffect
          });
        }
      }
    } else {
      this.playerZones.delete(playerId);
      this.emit('playerLeftWeatherZone', { playerId });
    }
  }

  async getZoneWeather(zoneId: string): Promise<{
    currentEffect: WeatherEffect | null;
    nextEffect: WeatherEffect | null;
    transitionProgress: number;
  }> {
    const zone = this.zones.get(zoneId);
    if (!zone) {
      throw new Error('Zone not found');
    }

    return {
      currentEffect: zone.currentEffect,
      nextEffect: zone.nextEffect,
      transitionProgress: zone.transitionProgress
    };
  }

  async getPlayerWeather(playerId: string): Promise<{
    zoneId: string | null;
    effect: WeatherEffect | null;
    nextEffect: WeatherEffect | null;
    transitionProgress: number;
  }> {
    const zoneId = this.playerZones.get(playerId);
    if (!zoneId) {
      return {
        zoneId: null,
        effect: null,
        nextEffect: null,
        transitionProgress: 0
      };
    }

    const zone = this.zones.get(zoneId);
    if (!zone) {
      return {
        zoneId: null,
        effect: null,
        nextEffect: null,
        transitionProgress: 0
      };
    }

    return {
      zoneId,
      effect: zone.currentEffect,
      nextEffect: zone.nextEffect,
      transitionProgress: zone.transitionProgress
    };
  }

  async getAllZones(): Promise<WeatherZone[]> {
    return Array.from(this.zones.values());
  }

  onWeatherChanged(callback: (data: { zoneId: string; effect: WeatherEffect }) => void) {
    this.on('weatherChanged', callback);
  }

  onWeatherTransitionStarted(
    callback: (data: {
      zoneId: string;
      fromEffect: WeatherEffect | null;
      toEffect: WeatherEffect;
    }) => void
  ) {
    this.on('weatherTransitionStarted', callback);
  }

  onPlayerEnteredWeatherZone(
    callback: (data: {
      playerId: string;
      zoneId: string;
      effect: WeatherEffect;
    }) => void
  ) {
    this.on('playerEnteredWeatherZone', callback);
  }

  onPlayerLeftWeatherZone(callback: (data: { playerId: string }) => void) {
    this.on('playerLeftWeatherZone', callback);
  }

  onPlayerSpeedModified(callback: (data: { playerId: string; multiplier: number }) => void) {
    this.on('playerSpeedModified', callback);
  }

  onCombatModifiersUpdated(
    callback: (data: {
      playerId: string;
      modifiers: WeatherEffect['gameplayEffects']['combatModifiers'];
    }) => void
  ) {
    this.on('combatModifiersUpdated', callback);
  }

  onResourceGatheringModified(callback: (data: { playerId: string; multiplier: number }) => void) {
    this.on('resourceGatheringModified', callback);
  }

  onFishingSuccessModified(callback: (data: { playerId: string; multiplier: number }) => void) {
    this.on('fishingSuccessModified', callback);
  }
}

export const weatherEffectsService = WeatherEffectsService.getInstance(
  new WeatherService(),
  new CombatService(null as any), // Pass proper SocketIO instance
  new FarmingService(null as any), // Pass proper SocketIO instance
  new FishingService()
);
