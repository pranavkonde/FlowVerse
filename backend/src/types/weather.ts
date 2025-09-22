export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'foggy';
export type WeatherIntensity = 'light' | 'medium' | 'heavy';

export interface WeatherData {
  type: WeatherType;
  temperature: number; // in Celsius
  humidity: number; // percentage
  windSpeed: number; // km/h
  visibility: number; // percentage
  pressure: number; // hPa
  description: string;
  effects: WeatherEffect[];
  timestamp: Date;
  duration: number; // in minutes
  intensity: WeatherIntensity;
}

export interface WeatherEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: WeatherType;
  intensity: WeatherIntensity;
  duration: number; // in minutes
  probability: number; // 0-1
  gameEffects: {
    speedModifier: number;
    visibilityModifier: number;
    damageModifier: number;
    experienceModifier: number;
    coinModifier: number;
    dropRateModifier: number;
  };
  visualEffects: {
    particles: string;
    color: string;
    opacity: number;
  };
  soundEffects: {
    ambient: string;
    volume: number;
  };
}

export interface WeatherStats {
  totalWeatherChanges: number;
  mostCommonType: WeatherType;
  averageTemperature: number;
  averageHumidity: number;
  averageWindSpeed: number;
  averageVisibility: number;
  averagePressure: number;
}

export interface WeatherForecast {
  current: WeatherData;
  hourly: WeatherData[];
  daily: WeatherData[];
  alerts: WeatherAlert[];
}

export interface WeatherAlert {
  id: string;
  type: 'warning' | 'advisory' | 'watch';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  startTime: Date;
  endTime: Date;
  affectedAreas: string[];
  recommendations: string[];
}
