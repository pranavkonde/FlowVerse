import { WeatherData, WeatherEffect, WeatherType, WeatherIntensity } from '../types/weather';

class WeatherService {
  private currentWeather: WeatherData | null = null;
  private weatherHistory: WeatherData[] = [];
  private weatherEffects: WeatherEffect[] = [];

  constructor() {
    this.initializeMockData();
    this.startWeatherSimulation();
  }

  private initializeMockData() {
    // Mock weather effects
    this.weatherEffects = [
      {
        id: 'rain_light',
        name: 'Light Rain',
        description: 'Gentle rainfall affecting visibility',
        icon: '🌧️',
        type: 'rainy',
        intensity: 'light',
        duration: 30,
        probability: 0.3,
        gameEffects: {
          speedModifier: 0.95,
          visibilityModifier: 0.9,
          damageModifier: 1.0,
          experienceModifier: 1.05,
          coinModifier: 1.0,
          dropRateModifier: 1.1
        },
        visualEffects: {
          particles: 'rain',
          color: '#4A90E2',
          opacity: 0.6
        },
        soundEffects: {
          ambient: 'rain_light.wav',
          volume: 0.3
        }
      },
      {
        id: 'rain_heavy',
        name: 'Heavy Rain',
        description: 'Heavy rainfall with strong winds',
        icon: '⛈️',
        type: 'rainy',
        intensity: 'heavy',
        duration: 45,
        probability: 0.15,
        gameEffects: {
          speedModifier: 0.85,
          visibilityModifier: 0.7,
          damageModifier: 1.0,
          experienceModifier: 1.1,
          coinModifier: 1.05,
          dropRateModifier: 1.2
        },
        visualEffects: {
          particles: 'rain_heavy',
          color: '#2E5BBA',
          opacity: 0.8
        },
        soundEffects: {
          ambient: 'rain_heavy.wav',
          volume: 0.6
        }
      },
      {
        id: 'sunny_clear',
        name: 'Clear Sky',
        description: 'Bright sunshine with clear visibility',
        icon: '☀️',
        type: 'sunny',
        intensity: 'light',
        duration: 60,
        probability: 0.4,
        gameEffects: {
          speedModifier: 1.05,
          visibilityModifier: 1.1,
          damageModifier: 1.0,
          experienceModifier: 1.0,
          coinModifier: 1.0,
          dropRateModifier: 1.0
        },
        visualEffects: {
          particles: 'sunshine',
          color: '#FFD700',
          opacity: 0.4
        },
        soundEffects: {
          ambient: 'birds.wav',
          volume: 0.2
        }
      },
      {
        id: 'storm_thunder',
        name: 'Thunderstorm',
        description: 'Heavy thunderstorms with lightning',
        icon: '⚡',
        type: 'stormy',
        intensity: 'heavy',
        duration: 20,
        probability: 0.1,
        gameEffects: {
          speedModifier: 0.8,
          visibilityModifier: 0.6,
          damageModifier: 1.2,
          experienceModifier: 1.15,
          coinModifier: 1.1,
          dropRateModifier: 1.3
        },
        visualEffects: {
          particles: 'lightning',
          color: '#8A2BE2',
          opacity: 0.9
        },
        soundEffects: {
          ambient: 'thunder.wav',
          volume: 0.8
        }
      },
      {
        id: 'fog_dense',
        name: 'Dense Fog',
        description: 'Thick fog reducing visibility significantly',
        icon: '🌫️',
        type: 'foggy',
        intensity: 'heavy',
        duration: 40,
        probability: 0.2,
        gameEffects: {
          speedModifier: 0.9,
          visibilityModifier: 0.5,
          damageModifier: 0.9,
          experienceModifier: 1.08,
          coinModifier: 1.02,
          dropRateModifier: 1.15
        },
        visualEffects: {
          particles: 'fog',
          color: '#C0C0C0',
          opacity: 0.7
        },
        soundEffects: {
          ambient: 'fog.wav',
          volume: 0.4
        }
      }
    ];
  }

  private startWeatherSimulation() {
    // Simulate weather changes every 5 minutes
    setInterval(() => {
      this.updateWeather();
    }, 5 * 60 * 1000);

    // Initialize with random weather
    this.updateWeather();
  }

  private updateWeather() {
    const randomEffect = this.getRandomWeatherEffect();
    const now = new Date();

    const newWeather: WeatherData = {
      type: randomEffect.type,
      temperature: this.getRandomTemperature(randomEffect.type),
      humidity: this.getRandomHumidity(randomEffect.type),
      windSpeed: this.getRandomWindSpeed(randomEffect.type),
      visibility: this.getRandomVisibility(randomEffect.type),
      pressure: this.getRandomPressure(randomEffect.type),
      description: randomEffect.description,
      effects: [randomEffect],
      timestamp: now,
      duration: randomEffect.duration,
      intensity: randomEffect.intensity
    };

    this.currentWeather = newWeather;
    this.weatherHistory.push(newWeather);

    // Keep only last 24 hours of history
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    this.weatherHistory = this.weatherHistory.filter(weather => 
      weather.timestamp > oneDayAgo
    );
  }

  private getRandomWeatherEffect(): WeatherEffect {
    const totalProbability = this.weatherEffects.reduce((sum, effect) => sum + effect.probability, 0);
    let random = Math.random() * totalProbability;

    for (const effect of this.weatherEffects) {
      random -= effect.probability;
      if (random <= 0) {
        return effect;
      }
    }

    return this.weatherEffects[0];
  }

  private getRandomTemperature(type: WeatherType): number {
    const baseTemps = {
      sunny: 25,
      cloudy: 20,
      rainy: 18,
      snowy: 5,
      stormy: 16,
      foggy: 15
    };

    const base = baseTemps[type];
    const variation = Math.random() * 10 - 5; // ±5 degrees
    return Math.round(base + variation);
  }

  private getRandomHumidity(type: WeatherType): number {
    const baseHumidity = {
      sunny: 40,
      cloudy: 60,
      rainy: 85,
      snowy: 70,
      stormy: 90,
      foggy: 95
    };

    const base = baseHumidity[type];
    const variation = Math.random() * 20 - 10; // ±10%
    return Math.max(0, Math.min(100, Math.round(base + variation)));
  }

  private getRandomWindSpeed(type: WeatherType): number {
    const baseWind = {
      sunny: 5,
      cloudy: 10,
      rainy: 15,
      snowy: 8,
      stormy: 25,
      foggy: 3
    };

    const base = baseWind[type];
    const variation = Math.random() * 10 - 5; // ±5 km/h
    return Math.max(0, Math.round(base + variation));
  }

  private getRandomVisibility(type: WeatherType): number {
    const baseVisibility = {
      sunny: 100,
      cloudy: 80,
      rainy: 60,
      snowy: 70,
      stormy: 40,
      foggy: 30
    };

    const base = baseVisibility[type];
    const variation = Math.random() * 20 - 10; // ±10%
    return Math.max(10, Math.min(100, Math.round(base + variation)));
  }

  private getRandomPressure(type: WeatherType): number {
    const basePressure = {
      sunny: 1020,
      cloudy: 1015,
      rainy: 1005,
      snowy: 1010,
      stormy: 995,
      foggy: 1000
    };

    const base = basePressure[type];
    const variation = Math.random() * 20 - 10; // ±10 hPa
    return Math.round(base + variation);
  }

  // Public methods
  getCurrentWeather(): WeatherData | null {
    return this.currentWeather;
  }

  getWeatherHistory(): WeatherData[] {
    return this.weatherHistory;
  }

  getWeatherForecast(hours: number = 24): WeatherData[] {
    const forecast: WeatherData[] = [];
    const now = new Date();

    for (let i = 1; i <= hours; i++) {
      const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      const randomEffect = this.getRandomWeatherEffect();

      const forecastWeather: WeatherData = {
        type: randomEffect.type,
        temperature: this.getRandomTemperature(randomEffect.type),
        humidity: this.getRandomHumidity(randomEffect.type),
        windSpeed: this.getRandomWindSpeed(randomEffect.type),
        visibility: this.getRandomVisibility(randomEffect.type),
        pressure: this.getRandomPressure(randomEffect.type),
        description: randomEffect.description,
        effects: [randomEffect],
        timestamp: futureTime,
        duration: randomEffect.duration,
        intensity: randomEffect.intensity
      };

      forecast.push(forecastWeather);
    }

    return forecast;
  }

  getWeatherEffects(): WeatherEffect[] {
    return this.weatherEffects;
  }

  getWeatherEffectById(id: string): WeatherEffect | null {
    return this.weatherEffects.find(effect => effect.id === id) || null;
  }

  getWeatherStats(): {
    totalWeatherChanges: number;
    mostCommonType: WeatherType;
    averageTemperature: number;
    averageHumidity: number;
    averageWindSpeed: number;
    averageVisibility: number;
    averagePressure: number;
  } {
    if (this.weatherHistory.length === 0) {
      return {
        totalWeatherChanges: 0,
        mostCommonType: 'sunny',
        averageTemperature: 20,
        averageHumidity: 60,
        averageWindSpeed: 10,
        averageVisibility: 80,
        averagePressure: 1013
      };
    }

    const typeCounts = this.weatherHistory.reduce((acc, weather) => {
      acc[weather.type] = (acc[weather.type] || 0) + 1;
      return acc;
    }, {} as Record<WeatherType, number>);

    const mostCommonType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as WeatherType || 'sunny';

    const averageTemperature = this.weatherHistory.reduce((sum, weather) => sum + weather.temperature, 0) / this.weatherHistory.length;
    const averageHumidity = this.weatherHistory.reduce((sum, weather) => sum + weather.humidity, 0) / this.weatherHistory.length;
    const averageWindSpeed = this.weatherHistory.reduce((sum, weather) => sum + weather.windSpeed, 0) / this.weatherHistory.length;
    const averageVisibility = this.weatherHistory.reduce((sum, weather) => sum + weather.visibility, 0) / this.weatherHistory.length;
    const averagePressure = this.weatherHistory.reduce((sum, weather) => sum + weather.pressure, 0) / this.weatherHistory.length;

    return {
      totalWeatherChanges: this.weatherHistory.length,
      mostCommonType,
      averageTemperature: Math.round(averageTemperature),
      averageHumidity: Math.round(averageHumidity),
      averageWindSpeed: Math.round(averageWindSpeed),
      averageVisibility: Math.round(averageVisibility),
      averagePressure: Math.round(averagePressure)
    };
  }

  // Force weather change (for testing or admin purposes)
  forceWeatherChange(type: WeatherType, intensity: WeatherIntensity = 'medium'): void {
    const effect = this.weatherEffects.find(e => e.type === type && e.intensity === intensity);
    if (!effect) return;

    const now = new Date();
    const newWeather: WeatherData = {
      type: effect.type,
      temperature: this.getRandomTemperature(effect.type),
      humidity: this.getRandomHumidity(effect.type),
      windSpeed: this.getRandomWindSpeed(effect.type),
      visibility: this.getRandomVisibility(effect.type),
      pressure: this.getRandomPressure(effect.type),
      description: effect.description,
      effects: [effect],
      timestamp: now,
      duration: effect.duration,
      intensity: effect.intensity
    };

    this.currentWeather = newWeather;
    this.weatherHistory.push(newWeather);
  }
}

export const weatherService = new WeatherService();
