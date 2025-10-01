export interface WeatherState {
  type: WeatherType;
  intensity: number;
  temperature: number;
  wind: WindData;
  visibility: number;
  effects: WeatherEffect[];
  duration: number;
  startedAt: string;
  endsAt: string;
}

export type WeatherType =
  | 'CLEAR'
  | 'CLOUDY'
  | 'RAIN'
  | 'STORM'
  | 'SNOW'
  | 'FOG'
  | 'WINDY'
  | 'SANDSTORM'
  | 'AURORA'
  | 'MAGICAL';

export interface WindData {
  speed: number;
  direction: WindDirection;
  gusts: number;
}

export type WindDirection =
  | 'N'
  | 'NE'
  | 'E'
  | 'SE'
  | 'S'
  | 'SW'
  | 'W'
  | 'NW';

export interface WeatherEffect {
  type: EffectType;
  value: number;
  duration: number;
  area?: {
    x: number;
    y: number;
    radius: number;
  };
  particles?: ParticleConfig;
}

export type EffectType =
  | 'MOVEMENT_SPEED'
  | 'VISIBILITY_RANGE'
  | 'COMBAT_ACCURACY'
  | 'FISHING_SUCCESS'
  | 'FARMING_GROWTH'
  | 'RESOURCE_YIELD'
  | 'MAGIC_POWER'
  | 'STAMINA_DRAIN'
  | 'HEALTH_REGEN'
  | 'SPECIAL_SPAWN';

export interface ParticleConfig {
  type: ParticleType;
  count: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
  lifetime: number;
  blendMode: BlendMode;
  emitterConfig?: EmitterConfig;
}

export type ParticleType =
  | 'RAIN'
  | 'SNOW'
  | 'LEAF'
  | 'DUST'
  | 'SPARK'
  | 'MIST'
  | 'MAGIC'
  | 'CUSTOM';

export type BlendMode =
  | 'NORMAL'
  | 'ADD'
  | 'MULTIPLY'
  | 'SCREEN';

export interface EmitterConfig {
  frequency: number;
  shape: EmitterShape;
  area: {
    width: number;
    height: number;
  };
  angle: {
    min: number;
    max: number;
  };
  lifespan: {
    min: number;
    max: number;
  };
  scale: {
    start: number;
    end: number;
  };
  alpha: {
    start: number;
    end: number;
  };
  tint?: number[];
}

export type EmitterShape =
  | 'POINT'
  | 'CIRCLE'
  | 'RECTANGLE'
  | 'EDGE'
  | 'CUSTOM';

export interface WeatherZone {
  id: string;
  name: string;
  type: ZoneType;
  baseWeather: WeatherType;
  possibleWeathers: WeatherType[];
  transitionTime: number;
  updateFrequency: number;
  effects: WeatherEffect[];
  boundaries: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type ZoneType =
  | 'FOREST'
  | 'DESERT'
  | 'MOUNTAIN'
  | 'COAST'
  | 'PLAINS'
  | 'SWAMP'
  | 'MAGICAL'
  | 'DUNGEON';

export interface WeatherForecast {
  current: WeatherState;
  upcoming: WeatherState[];
  zones: {
    zoneId: string;
    current: WeatherState;
    upcoming: WeatherState[];
  }[];
}

export interface WeatherStats {
  weatherHistory: {
    type: WeatherType;
    duration: number;
    intensity: number;
    timestamp: string;
  }[];
  zoneHistory: {
    zoneId: string;
    weatherType: WeatherType;
    duration: number;
    timestamp: string;
  }[];
  extremeWeatherEvents: {
    type: WeatherType;
    intensity: number;
    duration: number;
    effects: WeatherEffect[];
    timestamp: string;
  }[];
}

