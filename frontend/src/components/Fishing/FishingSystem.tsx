import React, { useState } from 'react';
import {
  Fish,
  FishingSpot,
  FishingSession,
  RARITY_COLORS,
  HABITAT_ICONS,
  TIME_ICONS,
  SEASON_ICONS
} from '../../types/fishing';
import { useFishing } from '../../hooks/useFishing';

export const FishingSystem: React.FC = () => {
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [activeSession, setActiveSession] = useState<FishingSession | null>(null);
  const {
    spots,
    availableFish,
    stats,
    loading,
    error,
    startFishing,
    cast,
    hook,
    updateMinigame
  } = useFishing();

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
        Error loading fishing system: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Fishing</h2>
          <p className="text-gray-400">Level {stats?.skillLevel || 1}</p>
        </div>
        <div className="text-right">
          <div className="text-white">Total Catches: {stats?.totalCatches || 0}</div>
          <div className="text-gray-400">XP: {stats?.experience || 0}</div>
        </div>
      </div>

      {activeSession ? (
        <FishingMinigame
          session={activeSession}
          onHook={hook}
          onUpdateProgress={updateMinigame}
          onComplete={() => setActiveSession(null)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Fishing Spots</h3>
            <div className="grid grid-cols-1 gap-4">
              {spots.map((spot) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  onClick={() => setSelectedSpot(spot)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Fish Collection</h3>
            <div className="grid grid-cols-2 gap-4">
              {availableFish.map((fish) => (
                <FishCard key={fish.id} fish={fish} />
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedSpot && !activeSession && (
        <SpotModal
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          onStart={async (rodId, baitId) => {
            const session = await startFishing(selectedSpot.id, rodId, baitId);
            setActiveSession(session);
            setSelectedSpot(null);
          }}
        />
      )}
    </div>
  );
};

const SpotCard: React.FC<{
  spot: FishingSpot;
  onClick: () => void;
}> = ({ spot, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors ${
        !spot.isActive ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-white">{spot.name}</h4>
          <p className="text-sm text-gray-400">{spot.description}</p>
        </div>
        <span className="text-2xl">{HABITAT_ICONS[spot.habitat]}</span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Fishers:</span>
          <span className="text-white">
            {spot.currentFishers.length} / {spot.maxFishers}
          </span>
        </div>
        {spot.requirements.level > 1 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Required Level:</span>
            <span className="text-white">{spot.requirements.level}</span>
          </div>
        )}
        {!spot.isActive && (
          <div className="text-sm text-yellow-500">
            Respawning in {Math.ceil((spot.respawnTime - (Date.now() - new Date(spot.lastRespawn).getTime())) / 1000)}s
          </div>
        )}
      </div>
    </div>
  );
};

const FishCard: React.FC<{
  fish: Fish;
}> = ({ fish }) => {
  const rarityColor = RARITY_COLORS[fish.rarity];
  
  return (
    <div
      className={`bg-gray-700 rounded-lg p-4 border-2 border-${rarityColor}-500`}
    >
      <div className="flex justify-between items-start">
        <h4 className="text-lg font-semibold text-white">{fish.name}</h4>
        <div className="flex space-x-1">
          {SEASON_ICONS[fish.season]}
          {TIME_ICONS[fish.timeOfDay]}
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-1">{fish.description}</p>

      <div className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Size:</span>
          <span className="text-white">
            {fish.size.min}-{fish.size.max}cm
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Weight:</span>
          <span className="text-white">
            {fish.weight.min}-{fish.weight.max}kg
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Value:</span>
          <span className="text-yellow-400">{fish.value} coins</span>
        </div>
      </div>

      {fish.requirements.level > 1 && (
        <div className="mt-2 text-sm text-red-400">
          Requires Level {fish.requirements.level}
        </div>
      )}
    </div>
  );
};

const SpotModal: React.FC<{
  spot: FishingSpot;
  onClose: () => void;
  onStart: (rodId?: string, baitId?: string) => Promise<void>;
}> = ({ spot, onClose, onStart }) => {
  const [selectedRod, setSelectedRod] = useState<string>();
  const [selectedBait, setSelectedBait] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await onStart(selectedRod, selectedBait);
    } catch (error) {
      console.error('Failed to start fishing:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">{spot.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Fishing Rod
            </label>
            <select
              value={selectedRod}
              onChange={(e) => setSelectedRod(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            >
              <option value="">No Rod</option>
              <option value="basic_rod">Basic Rod</option>
              <option value="quality_rod">Quality Rod</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Bait
            </label>
            <select
              value={selectedBait}
              onChange={(e) => setSelectedBait(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            >
              <option value="">No Bait</option>
              <option value="worm">Worm</option>
              <option value="special_bait">Special Bait</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Fishing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FishingMinigame: React.FC<{
  session: FishingSession;
  onHook: (sessionId: string) => Promise<void>;
  onUpdateProgress: (sessionId: string, progress: number) => Promise<{ completed: boolean; success: boolean }>;
  onComplete: () => void;
}> = ({ session, onHook, onUpdateProgress, onComplete }) => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleCast = async () => {
    if (session.status === 'casting') {
      try {
        await onHook(session.id);
        setGameStarted(true);
      } catch (error) {
        console.error('Failed to hook fish:', error);
      }
    }
  };

  const handlePull = async () => {
    if (session.status === 'minigame') {
      try {
        const result = await onUpdateProgress(
          session.id,
          session.progress + 10
        );
        if (result.completed) {
          onComplete();
        }
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-6 text-center">
      {session.status === 'casting' && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Ready to Cast!
          </h3>
          <button
            onClick={handleCast}
            className="px-6 py-3 bg-primary text-white rounded-lg text-lg hover:bg-primary-dark"
          >
            Cast Line
          </button>
        </div>
      )}

      {session.status === 'waiting' && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Waiting for a bite...
          </h3>
          <div className="animate-pulse text-6xl mb-4">🎣</div>
          <p className="text-gray-400">Stay alert!</p>
        </div>
      )}

      {session.status === 'minigame' && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Fish On! Keep it steady!
          </h3>
          <div className="w-full bg-gray-600 rounded-full h-4 mb-4">
            <div
              className="bg-primary h-4 rounded-full transition-all duration-300"
              style={{ width: `${session.progress}%` }}
            />
          </div>
          <button
            onClick={handlePull}
            className="px-6 py-3 bg-primary text-white rounded-lg text-lg hover:bg-primary-dark"
          >
            Pull!
          </button>
        </div>
      )}

      {(session.status === 'completed' || session.status === 'failed') && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            {session.status === 'completed' ? 'Fish Caught!' : 'Fish Got Away!'}
          </h3>
          <button
            onClick={onComplete}
            className="px-6 py-3 bg-primary text-white rounded-lg text-lg hover:bg-primary-dark"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};
