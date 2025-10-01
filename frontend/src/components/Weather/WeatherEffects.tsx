import React, { useEffect, useRef } from 'react';
import { useWeatherEffects } from '../../hooks/useWeatherEffects';
import {
  WeatherType,
  WeatherEffect,
  ParticleConfig,
  BlendMode
} from '../../types/weather';

const WEATHER_ICONS = {
  CLEAR: '☀️',
  CLOUDY: '☁️',
  RAIN: '🌧️',
  STORM: '⛈️',
  SNOW: '❄️',
  FOG: '🌫️',
  WINDY: '💨',
  SANDSTORM: '🌪️',
  AURORA: '🌌',
  MAGICAL: '✨'
};

const WEATHER_COLORS = {
  CLEAR: '#87CEEB',
  CLOUDY: '#B8B8B8',
  RAIN: '#4A6FA5',
  STORM: '#37474F',
  SNOW: '#FFFFFF',
  FOG: '#C8C8C8',
  WINDY: '#E0E0E0',
  SANDSTORM: '#D4B483',
  AURORA: '#71B280',
  MAGICAL: '#9C27B0'
};

const EFFECT_ICONS = {
  MOVEMENT_SPEED: '👣',
  VISIBILITY_RANGE: '👁️',
  COMBAT_ACCURACY: '🎯',
  FISHING_SUCCESS: '🎣',
  FARMING_GROWTH: '🌱',
  RESOURCE_YIELD: '⛏️',
  MAGIC_POWER: '✨',
  STAMINA_DRAIN: '💨',
  HEALTH_REGEN: '❤️',
  SPECIAL_SPAWN: '🌟'
};

export function WeatherEffects() {
  const {
    currentWeather,
    forecast,
    zones,
    stats,
    loading,
    error
  } = useWeatherEffects();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemsRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!canvasRef.current || !currentWeather) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particle systems for current weather effects
    currentWeather.effects.forEach(effect => {
      if (effect.particles) {
        initializeParticleSystem(effect.particles);
      }
    });

    // Animation loop
    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and render particle systems
      for (const [key, system] of particleSystemsRef.current) {
        system.update();
        system.render(ctx);
      }

      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
      particleSystemsRef.current.clear();
    };
  }, [currentWeather]);

  const initializeParticleSystem = (config: ParticleConfig) => {
    // Implementation would depend on your particle system library
    // This is a placeholder for the particle system initialization
    console.log('Initializing particle system with config:', config);
  };

  if (loading) {
    return <div className="p-4">Loading weather effects...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!currentWeather || !forecast) {
    return <div className="p-4">No weather data available</div>;
  }

  const renderWeatherInfo = () => (
    <div className="bg-gray-800 bg-opacity-80 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Current Weather</h2>
        <div
          className="text-4xl"
          style={{ color: WEATHER_COLORS[currentWeather.type] }}
        >
          {WEATHER_ICONS[currentWeather.type]}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {Math.round(currentWeather.temperature)}°C
          </div>
          <div className="text-sm text-gray-400">Temperature</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {Math.round(currentWeather.wind.speed)} km/h
          </div>
          <div className="text-sm text-gray-400">Wind Speed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {currentWeather.wind.direction}
          </div>
          <div className="text-sm text-gray-400">Wind Direction</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {Math.round(currentWeather.visibility * 100)}%
          </div>
          <div className="text-sm text-gray-400">Visibility</div>
        </div>
      </div>

      {currentWeather.effects.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            Active Effects
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {currentWeather.effects.map((effect, index) => (
              <div
                key={index}
                className="bg-gray-700 rounded p-2 flex items-center"
              >
                <span className="text-xl mr-2">
                  {EFFECT_ICONS[effect.type]}
                </span>
                <div>
                  <div className="text-white">
                    {effect.type.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-gray-400">
                    {effect.value > 1 ? '+' : ''}
                    {Math.round((effect.value - 1) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderForecast = () => (
    <div className="bg-gray-800 bg-opacity-80 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Weather Forecast</h2>
      <div className="grid grid-cols-3 gap-4">
        {forecast.upcoming.map((weather, index) => (
          <div
            key={index}
            className="bg-gray-700 rounded p-2 text-center"
          >
            <div
              className="text-2xl mb-2"
              style={{ color: WEATHER_COLORS[weather.type] }}
            >
              {WEATHER_ICONS[weather.type]}
            </div>
            <div className="text-white">
              {new Date(weather.startedAt).toLocaleTimeString()}
            </div>
            <div className="text-sm text-gray-400">
              {Math.round(weather.temperature)}°C
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderZones = () => (
    <div className="bg-gray-800 bg-opacity-80 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">Weather Zones</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map(zone => (
          <div
            key={zone.id}
            className="bg-gray-700 rounded p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-white">
                {zone.name}
              </h3>
              <span className="text-sm text-gray-400">
                {zone.type}
              </span>
            </div>

            <div className="text-gray-300 mb-2">
              Base Weather: {WEATHER_ICONS[zone.baseWeather]}
            </div>

            <div className="flex flex-wrap gap-2">
              {zone.possibleWeathers.map(weather => (
                <span
                  key={weather}
                  className="text-2xl"
                  style={{ color: WEATHER_COLORS[weather] }}
                >
                  {WEATHER_ICONS[weather]}
                </span>
              ))}
            </div>

            {zone.effects.length > 0 && (
              <div className="mt-2">
                <div className="text-sm text-gray-400">Zone Effects:</div>
                <div className="flex flex-wrap gap-2">
                  {zone.effects.map((effect, index) => (
                    <span
                      key={index}
                      className="text-xl"
                      title={`${effect.type}: ${effect.value > 1 ? '+' : ''}${Math.round((effect.value - 1) * 100)}%`}
                    >
                      {EFFECT_ICONS[effect.type]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative p-4">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${WEATHER_COLORS[currentWeather.type]}22, transparent)`
        }}
      />

      <div className="relative z-10">
        {renderWeatherInfo()}
        {renderForecast()}
        {renderZones()}
      </div>
    </div>
  );
}