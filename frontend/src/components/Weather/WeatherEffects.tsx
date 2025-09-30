import React from 'react';
import {
  WeatherEffect,
  WeatherZone,
  WEATHER_TYPE_ICONS,
  WEATHER_INTENSITY_LABELS,
  WEATHER_TYPE_COLORS,
  ELEMENT_TYPE_ICONS
} from '../../types/weatherEffects';
import { useWeatherEffects } from '../../hooks/useWeatherEffects';

export const WeatherEffects: React.FC = () => {
  const {
    playerWeather,
    zones,
    loading,
    error
  } = useWeatherEffects();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading weather effects: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Current Weather</h3>
          {playerWeather.zoneId ? (
            <CurrentWeather
              zone={zones.find(z => z.id === playerWeather.zoneId)!}
            />
          ) : (
            <div className="text-gray-400">
              No weather effects in current area
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Weather Zones</h3>
          <div className="space-y-4">
            {zones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                isPlayerZone={zone.id === playerWeather.zoneId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CurrentWeather: React.FC<{
  zone: WeatherZone;
}> = ({ zone }) => {
  const effect = zone.currentEffect;
  if (!effect) return null;

  const nextEffect = zone.nextEffect;
  const transitionProgress = zone.transitionProgress * 100;

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-white">{zone.name}</h4>
          <div className="flex items-center mt-2">
            <span className="text-3xl mr-2">
              {WEATHER_TYPE_ICONS[effect.type]}
            </span>
            <div>
              <div className="text-white">
                {WEATHER_INTENSITY_LABELS[effect.intensity]} {effect.type}
              </div>
              <div className="text-sm text-gray-400">
                Visibility: {effect.gameplayEffects.visibility}%
              </div>
            </div>
          </div>
        </div>

        {nextEffect && (
          <div className="text-right">
            <div className="text-sm text-gray-400">Changing to:</div>
            <div className="flex items-center mt-1">
              <span className="text-2xl mr-2">
                {WEATHER_TYPE_ICONS[nextEffect.type]}
              </span>
              <div className="text-white">
                {WEATHER_INTENSITY_LABELS[nextEffect.intensity]} {nextEffect.type}
              </div>
            </div>
            <div className="w-32 bg-gray-600 rounded-full h-1 mt-2">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${transitionProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <EffectCard
          title="Movement"
          value={`${Math.round(effect.gameplayEffects.movementSpeed * 100)}%`}
          color={effect.gameplayEffects.movementSpeed >= 1 ? 'green' : 'red'}
        />
        <EffectCard
          title="Resource Gathering"
          value={`${Math.round(effect.gameplayEffects.resourceGatheringRate * 100)}%`}
          color={effect.gameplayEffects.resourceGatheringRate >= 1 ? 'green' : 'red'}
        />
        <EffectCard
          title="Fishing Success"
          value={`${Math.round(effect.gameplayEffects.fishingSuccess * 100)}%`}
          color={effect.gameplayEffects.fishingSuccess >= 1 ? 'green' : 'red'}
        />
        <EffectCard
          title="Combat Accuracy"
          value={`${Math.round(effect.gameplayEffects.combatModifiers.accuracy * 100)}%`}
          color={effect.gameplayEffects.combatModifiers.accuracy >= 1 ? 'green' : 'red'}
        />
      </div>

      {effect.gameplayEffects.combatModifiers.elementalBonus && (
        <div className="mt-4 flex items-center">
          <span className="text-gray-400 mr-2">Elemental Bonus:</span>
          <span className="text-2xl mr-1">
            {ELEMENT_TYPE_ICONS[effect.gameplayEffects.combatModifiers.elementalBonus.type as keyof typeof ELEMENT_TYPE_ICONS]}
          </span>
          <span className="text-green-400">
            +{Math.round((effect.gameplayEffects.combatModifiers.elementalBonus.multiplier - 1) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

const ZoneCard: React.FC<{
  zone: WeatherZone;
  isPlayerZone: boolean;
}> = ({ zone, isPlayerZone }) => {
  const effect = zone.currentEffect;
  const nextEffect = zone.nextEffect;

  return (
    <div
      className={`bg-gray-700 rounded-lg p-4 ${
        isPlayerZone ? 'border-2 border-primary' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-white flex items-center">
            {zone.name}
            {isPlayerZone && (
              <span className="ml-2 text-sm text-primary">(Current)</span>
            )}
          </h4>
          <div className="text-sm text-gray-400">
            {zone.affectedPlayers.length} players in zone
          </div>
        </div>

        {effect && (
          <div className="flex items-center">
            <span className="text-2xl">
              {WEATHER_TYPE_ICONS[effect.type]}
            </span>
            <div className="ml-2">
              <div
                className={`text-${WEATHER_TYPE_COLORS[effect.type]}-400`}
              >
                {WEATHER_INTENSITY_LABELS[effect.intensity]}
              </div>
            </div>
          </div>
        )}
      </div>

      {nextEffect && (
        <div className="mt-2">
          <div className="text-sm text-gray-400">Changing to:</div>
          <div className="flex items-center mt-1">
            <span className="text-2xl mr-2">
              {WEATHER_TYPE_ICONS[nextEffect.type]}
            </span>
            <div
              className={`text-${WEATHER_TYPE_COLORS[nextEffect.type]}-400`}
            >
              {WEATHER_INTENSITY_LABELS[nextEffect.intensity]}
            </div>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${zone.transitionProgress * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const EffectCard: React.FC<{
  title: string;
  value: string;
  color: string;
}> = ({ title, value, color }) => {
  return (
    <div className="bg-gray-600 rounded p-2">
      <div className="text-sm text-gray-300">{title}</div>
      <div className={`text-${color}-400 font-medium`}>{value}</div>
    </div>
  );
};
