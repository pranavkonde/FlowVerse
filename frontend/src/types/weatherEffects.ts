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
    visibility: number;
    movementSpeed: number;
    resourceGatheringRate: number;
    fishingSuccess: number;
    combatModifiers: {
      accuracy: number;
      damage: number;
      elementalBonus?: {
        type: string;
        multiplier: number;
      };
    };
  };
  duration: number;
  transitionTime: number;
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

export const WEATHER_TYPE_ICONS = {
  rain: '🌧️',
  snow: '🌨️',
  storm: '⛈️',
  fog: '🌫️',
  clear: '☀️',
  wind: '💨',
  sandstorm: '🌪️',
  rainbow: '🌈'
} as const;

export const WEATHER_INTENSITY_LABELS = {
  light: 'Light',
  medium: 'Moderate',
  heavy: 'Heavy'
} as const;

export const WEATHER_TYPE_COLORS = {
  rain: 'blue',
  snow: 'white',
  storm: 'purple',
  fog: 'gray',
  clear: 'yellow',
  wind: 'teal',
  sandstorm: 'orange',
  rainbow: 'pink'
} as const;

export const ELEMENT_TYPE_ICONS = {
  water: '💧',
  ice: '❄️',
  lightning: '⚡',
  fire: '🔥',
  earth: '🌎',
  wind: '💨',
  light: '✨',
  dark: '🌑',
  all: '🌟'
} as const;
