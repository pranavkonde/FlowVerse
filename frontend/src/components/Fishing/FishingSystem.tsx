import React, { useState, useEffect } from 'react';
import { useFishing } from '../../hooks/useFishing';
import {
  FishingSpot,
  FishingAttempt,
  Fish,
  FishRarity,
  AttemptStatus
} from '../../types/fishing';

const RARITY_COLORS = {
  COMMON: 'bg-gray-500',
  UNCOMMON: 'bg-green-500',
  RARE: 'bg-blue-500',
  EPIC: 'bg-purple-500',
  LEGENDARY: 'bg-yellow-500',
  MYTHICAL: 'bg-red-500'
};

const WEATHER_ICONS = {
  CLEAR: '☀️',
  CLOUDY: '☁️',
  RAIN: '🌧️',
  STORM: '⛈️',
  WINDY: '💨',
  FOG: '🌫️'
};

const TIME_ICONS = {
  DAWN: '🌅',
  DAY: '🌞',
  DUSK: '🌇',
  NIGHT: '🌙'
};

const SEASON_ICONS = {
  SPRING: '🌸',
  SUMMER: '☀️',
  FALL: '🍁',
  WINTER: '❄️'
};

export function FishingSystem() {
  const {
    spots,
    currentAttempt,
    stats,
    conditions,
    loading,
    error,
    startFishing,
    respondToBite,
    refreshSpots
  } = useFishing();

  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (
      currentAttempt?.status === 'BITING' &&
      !document.hidden
    ) {
      // Play sound effect
      const audio = new Audio('/sounds/fish-bite.mp3');
      audio.play();
    }
  }, [currentAttempt?.status]);

  if (loading) {
    return <div className="p-4">Loading fishing system...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const handleStartFishing = async (spot: FishingSpot) => {
    try {
      await startFishing(spot.id, {
        rod: 'BASIC_ROD', // Use basic equipment for now
        reel: 'BASIC_REEL',
        line: 'BASIC_LINE',
        bait: 'WORM'
      });
      setSelectedSpot(spot);
    } catch (err) {
      console.error('Failed to start fishing:', err);
    }
  };

  const handleBite = async () => {
    try {
      await respondToBite();
    } catch (err) {
      console.error('Failed to respond to bite:', err);
    }
  };

  const renderConditions = () => {
    if (!conditions) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Current Conditions</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-4xl mb-2">
              {SEASON_ICONS[conditions.season]}
            </div>
            <div className="text-white">{conditions.season}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">
              {TIME_ICONS[conditions.time]}
            </div>
            <div className="text-white">{conditions.time}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">
              {WEATHER_ICONS[conditions.weather]}
            </div>
            <div className="text-white">{conditions.weather}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Fishing Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalCatches}
            </div>
            <div className="text-sm text-gray-400">Total Catches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.perfectCatches}
            </div>
            <div className="text-sm text-gray-400">Perfect Catches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.specialCatches}
            </div>
            <div className="text-sm text-gray-400">Special Catches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalValue}
            </div>
            <div className="text-sm text-gray-400">Total Value</div>
          </div>
        </div>

        {stats.biggestCatch && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Biggest Catch
            </h3>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-white">
                {stats.biggestCatch.fish.name}
              </div>
              <div className="text-sm text-gray-400">
                Size: {stats.biggestCatch.size}cm
                Weight: {stats.biggestCatch.weight}kg
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSpot = (spot: FishingSpot) => (
    <div
      key={spot.id}
      className={`
        bg-gray-700 rounded-lg p-4 cursor-pointer
        ${selectedSpot?.id === spot.id ? 'ring-2 ring-blue-500' : ''}
        hover:bg-gray-600 transition-colors
      `}
      onClick={() => setSelectedSpot(spot)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-white">
          {spot.name}
        </h3>
        <span className="text-sm text-gray-400">
          Level {spot.requiredLevel}+
        </span>
      </div>

      <div className="text-sm text-gray-300 mb-2">
        Type: {spot.type}
      </div>

      <div className="space-y-1">
        <div className="text-sm text-gray-400">
          Available Fish:
        </div>
        <div className="flex flex-wrap gap-1">
          {spot.availableFish.map(fish => (
            <span
              key={fish.id}
              className={`
                ${RARITY_COLORS[fish.rarity]}
                px-2 py-1 rounded text-xs text-white
              `}
            >
              {fish.name}
            </span>
          ))}
        </div>
      </div>

      {!currentAttempt && (
        <button
          onClick={() => handleStartFishing(spot)}
          className="mt-4 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start Fishing
        </button>
      )}
    </div>
  );

  const renderAttempt = () => {
    if (!currentAttempt) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Current Fishing Attempt
        </h2>

        <div className="space-y-4">
          <div className="text-center text-2xl text-white">
            {currentAttempt.status === 'CASTING' && '🎣 Casting...'}
            {currentAttempt.status === 'WAITING' && '⏳ Waiting for fish...'}
            {currentAttempt.status === 'BITING' && (
              <button
                onClick={handleBite}
                className="animate-pulse px-8 py-4 bg-green-500 rounded-lg hover:bg-green-600"
              >
                🎣 FISH ON! CLICK TO REEL!
              </button>
            )}
            {currentAttempt.status === 'REELING' && (
              <div className="space-y-2">
                <div>🎣 Reeling in...</div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-blue-500 rounded-full h-4 transition-all duration-200"
                    style={{ width: `${currentAttempt.progress}%` }}
                  />
                </div>
              </div>
            )}
            {currentAttempt.status === 'COMPLETED' && currentAttempt.result && (
              <div className="space-y-2">
                {currentAttempt.result.success ? (
                  <>
                    <div className="text-green-500">🎣 Caught a fish!</div>
                    <div className="bg-gray-700 rounded p-4">
                      <div className="text-xl mb-2">
                        {currentAttempt.result.fish!.name}
                      </div>
                      <div className="text-sm text-gray-300">
                        Size: {currentAttempt.result.size}cm
                        <br />
                        Weight: {currentAttempt.result.weight}kg
                        <br />
                        Quality: {currentAttempt.result.quality}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSpot(null);
                        refreshSpots();
                      }}
                      className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Continue Fishing
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-red-500">😢 The fish got away!</div>
                    <button
                      onClick={() => {
                        setSelectedSpot(null);
                        refreshSpots();
                      }}
                      className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Try Again
                    </button>
                  </>
                )}
              </div>
            )}
            {currentAttempt.status === 'FAILED' && (
              <div className="space-y-2">
                <div className="text-red-500">
                  😢 You weren't quick enough!
                </div>
                <button
                  onClick={() => {
                    setSelectedSpot(null);
                    refreshSpots();
                  }}
                  className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Fishing</h1>
        <button
          onClick={() => setShowStats(!showStats)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {showStats && renderStats()}
      {renderConditions()}
      {renderAttempt()}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spots.map(renderSpot)}
      </div>
    </div>
  );
}