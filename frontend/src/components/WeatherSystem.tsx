'use client';

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Zap, Eye, Thermometer, Droplets, Gauge } from 'lucide-react';

interface WeatherData {
  type: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'foggy';
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  description: string;
  effects: WeatherEffect[];
}

interface WeatherEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
  intensity: 'light' | 'medium' | 'heavy';
  duration: number; // in minutes
  gameEffects: {
    speedModifier: number;
    visibilityModifier: number;
    damageModifier: number;
    experienceModifier: number;
  };
}

interface WeatherSystemProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function WeatherSystem({ isVisible, onToggle }: WeatherSystemProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [selectedEffect, setSelectedEffect] = useState<WeatherEffect | null>(null);

  useEffect(() => {
    if (isVisible) {
      loadWeatherData();
    }
  }, [isVisible]);

  const loadWeatherData = () => {
    // Mock weather data
    const currentWeather: WeatherData = {
      type: 'rainy',
      temperature: 18,
      humidity: 85,
      windSpeed: 15,
      visibility: 60,
      pressure: 1013,
      description: 'Light rain with moderate winds',
      effects: [
        {
          id: 'rain_1',
          name: 'Light Rain',
          description: 'Gentle rainfall affecting visibility',
          icon: '🌧️',
          intensity: 'light',
          duration: 30,
          gameEffects: {
            speedModifier: 0.95,
            visibilityModifier: 0.9,
            damageModifier: 1.0,
            experienceModifier: 1.05
          }
        },
        {
          id: 'wind_1',
          name: 'Moderate Winds',
          description: 'Strong winds affecting movement',
          icon: '💨',
          intensity: 'medium',
          duration: 45,
          gameEffects: {
            speedModifier: 0.9,
            visibilityModifier: 1.0,
            damageModifier: 1.0,
            experienceModifier: 1.0
          }
        }
      ]
    };

    const weatherForecast: WeatherData[] = [
      {
        type: 'sunny',
        temperature: 25,
        humidity: 60,
        windSpeed: 8,
        visibility: 100,
        pressure: 1020,
        description: 'Clear skies with bright sunshine',
        effects: []
      },
      {
        type: 'cloudy',
        temperature: 22,
        humidity: 70,
        windSpeed: 12,
        visibility: 80,
        pressure: 1015,
        description: 'Overcast with scattered clouds',
        effects: []
      },
      {
        type: 'stormy',
        temperature: 16,
        humidity: 90,
        windSpeed: 25,
        visibility: 40,
        pressure: 1005,
        description: 'Heavy thunderstorms with lightning',
        effects: []
      }
    ];

    setWeather(currentWeather);
    setForecast(weatherForecast);
  };

  const getWeatherIcon = (type: string) => {
    switch (type) {
      case 'sunny': return <Sun className="w-8 h-8 text-yellow-400" />;
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-400" />;
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'snowy': return <CloudSnow className="w-8 h-8 text-blue-200" />;
      case 'stormy': return <Zap className="w-8 h-8 text-purple-400" />;
      case 'foggy': return <Eye className="w-8 h-8 text-gray-300" />;
      default: return <Sun className="w-8 h-8 text-yellow-400" />;
    }
  };

  const getWeatherColor = (type: string) => {
    switch (type) {
      case 'sunny': return 'border-yellow-400 bg-yellow-400/10';
      case 'cloudy': return 'border-gray-400 bg-gray-400/10';
      case 'rainy': return 'border-blue-400 bg-blue-400/10';
      case 'snowy': return 'border-blue-200 bg-blue-200/10';
      case 'stormy': return 'border-purple-400 bg-purple-400/10';
      case 'foggy': return 'border-gray-300 bg-gray-300/10';
      default: return 'border-slate-400 bg-slate-400/10';
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'light': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'heavy': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getModifierColor = (modifier: number) => {
    if (modifier > 1.0) return 'text-green-400';
    if (modifier < 1.0) return 'text-red-400';
    return 'text-slate-400';
  };

  const formatModifier = (modifier: number) => {
    const percentage = ((modifier - 1) * 100).toFixed(1);
    return modifier > 1.0 ? `+${percentage}%` : `${percentage}%`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Cloud className="w-6 h-6 text-blue-400" />
              <h2 className="text-white text-2xl font-bold">Weather System</h2>
            </div>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-96">
          {/* Current Weather */}
          <div className="flex-1 p-6 overflow-y-auto">
            {weather && (
              <div className="space-y-6">
                {/* Current Weather Card */}
                <div className={`p-6 rounded-lg border-2 ${getWeatherColor(weather.type)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(weather.type)}
                      <div>
                        <h3 className="text-white text-xl font-bold capitalize">{weather.type}</h3>
                        <p className="text-slate-300">{weather.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-3xl font-bold">{weather.temperature}°C</div>
                      <div className="text-slate-400 text-sm">Current</div>
                    </div>
                  </div>

                  {/* Weather Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-white font-medium">{weather.temperature}°C</div>
                        <div className="text-slate-400 text-xs">Temperature</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-white font-medium">{weather.humidity}%</div>
                        <div className="text-slate-400 text-xs">Humidity</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-white font-medium">{weather.windSpeed} km/h</div>
                        <div className="text-slate-400 text-xs">Wind Speed</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-white font-medium">{weather.visibility}%</div>
                        <div className="text-slate-400 text-xs">Visibility</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weather Effects */}
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-bold">Active Weather Effects</h3>
                  {weather.effects.map((effect) => (
                    <div
                      key={effect.id}
                      className={`p-4 rounded-lg border-2 ${
                        selectedEffect?.id === effect.id 
                          ? 'border-blue-400 bg-blue-400/20' 
                          : 'border-slate-600 bg-slate-700/50'
                      } cursor-pointer transition-colors`}
                      onClick={() => setSelectedEffect(effect)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{effect.icon}</span>
                          <div>
                            <h4 className="text-white font-medium">{effect.name}</h4>
                            <p className="text-slate-400 text-sm">{effect.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getIntensityColor(effect.intensity)}`}>
                            {effect.intensity.toUpperCase()}
                          </div>
                          <div className="text-slate-400 text-xs">{effect.duration} min</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weather Forecast */}
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-bold">Weather Forecast</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {forecast.map((forecastItem, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${getWeatherColor(forecastItem.type)}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {getWeatherIcon(forecastItem.type)}
                          <div>
                            <h4 className="text-white font-medium capitalize">{forecastItem.type}</h4>
                            <p className="text-slate-400 text-sm">{forecastItem.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-xl font-bold">{forecastItem.temperature}°C</div>
                          <div className="text-slate-400 text-xs">
                            {index === 0 ? 'Next Hour' : index === 1 ? 'Next 3 Hours' : 'Next 6 Hours'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Weather Effects Details */}
          {selectedEffect && (
            <div className="w-80 bg-slate-700/50 p-6 border-l border-slate-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-bold">Effect Details</h3>
                <button
                  onClick={() => setSelectedEffect(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedEffect.icon}</span>
                  <div>
                    <h4 className="text-white font-medium">{selectedEffect.name}</h4>
                    <p className="text-slate-400 text-sm">{selectedEffect.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-white font-medium">Game Effects</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">Speed</span>
                      <span className={`text-sm font-medium ${getModifierColor(selectedEffect.gameEffects.speedModifier)}`}>
                        {formatModifier(selectedEffect.gameEffects.speedModifier)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">Visibility</span>
                      <span className={`text-sm font-medium ${getModifierColor(selectedEffect.gameEffects.visibilityModifier)}`}>
                        {formatModifier(selectedEffect.gameEffects.visibilityModifier)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">Damage</span>
                      <span className={`text-sm font-medium ${getModifierColor(selectedEffect.gameEffects.damageModifier)}`}>
                        {formatModifier(selectedEffect.gameEffects.damageModifier)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">Experience</span>
                      <span className={`text-sm font-medium ${getModifierColor(selectedEffect.gameEffects.experienceModifier)}`}>
                        {formatModifier(selectedEffect.gameEffects.experienceModifier)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Duration</span>
                    <span className="text-white text-sm font-medium">{selectedEffect.duration} minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Intensity</span>
                    <span className={`text-sm font-medium ${getIntensityColor(selectedEffect.intensity)}`}>
                      {selectedEffect.intensity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-700/50 p-4 border-t border-slate-600">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              Weather affects gameplay - plan your activities accordingly!
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors">
                Weather History
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
