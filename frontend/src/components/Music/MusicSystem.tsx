import React, { useState } from 'react';
import {
  Instrument,
  MusicScore,
  Performance,
  INSTRUMENT_TYPE_ICONS,
  INSTRUMENT_DIFFICULTY_LABELS,
  REACTION_TYPES,
  MASTERY_LEVELS
} from '../../types/music';
import { useMusic } from '../../hooks/useMusic';

export const MusicSystem: React.FC = () => {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [selectedScore, setSelectedScore] = useState<MusicScore | null>(null);
  const [activePerformance, setActivePerformance] = useState<Performance | null>(null);
  const {
    instruments,
    scores,
    activePerformances,
    stats,
    loading,
    error,
    startPerformance,
    playNote,
    endPerformance,
    listenToPerformance,
    addReaction
  } = useMusic();

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
        Error loading music system: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Music System</h2>
          <p className="text-gray-400">
            {stats?.totalPerformances || 0} performances • {Object.keys(stats?.instrumentMastery || {}).length} instruments mastered
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!activePerformance ? (
          <>
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Your Instruments</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {instruments.map((instrument) => (
                  <InstrumentCard
                    key={instrument.id}
                    instrument={instrument}
                    mastery={stats?.instrumentMastery[instrument.id] || 0}
                    isSelected={selectedInstrument?.id === instrument.id}
                    onClick={() => setSelectedInstrument(instrument)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Available Scores</h3>
              <div className="grid grid-cols-1 gap-4">
                {scores.map((score) => (
                  <ScoreCard
                    key={score.id}
                    score={score}
                    instruments={instruments}
                    isSelected={selectedScore?.id === score.id}
                    onClick={() => setSelectedScore(score)}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <PerformanceView
            performance={activePerformance}
            instrument={instruments.find(i => i.id === activePerformance.instrumentId)!}
            score={scores.find(s => s.id === activePerformance.scoreId)!}
            onPlayNote={playNote}
            onEnd={() => {
              endPerformance(activePerformance.id);
              setActivePerformance(null);
            }}
          />
        )}

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Live Performances</h3>
          <div className="space-y-4">
            {activePerformances
              .filter(p => p.id !== activePerformance?.id)
              .map((performance) => (
                <LivePerformanceCard
                  key={performance.id}
                  performance={performance}
                  instrument={instruments.find(i => i.id === performance.instrumentId)!}
                  score={scores.find(s => s.id === performance.scoreId)!}
                  onListen={() => listenToPerformance(performance.id)}
                  onReact={(type) => addReaction(performance.id, type)}
                />
              ))}
          </div>
        </div>
      </div>

      {selectedInstrument && selectedScore && !activePerformance && (
        <StartPerformanceModal
          instrument={selectedInstrument}
          score={selectedScore}
          onStart={async () => {
            const performance = await startPerformance(
              selectedScore.id,
              selectedInstrument.id
            );
            setActivePerformance(performance);
            setSelectedInstrument(null);
            setSelectedScore(null);
          }}
          onClose={() => {
            setSelectedInstrument(null);
            setSelectedScore(null);
          }}
        />
      )}
    </div>
  );
};

const InstrumentCard: React.FC<{
  instrument: Instrument;
  mastery: number;
  isSelected: boolean;
  onClick: () => void;
}> = ({ instrument, mastery, isSelected, onClick }) => {
  const masteryLevel = Object.entries(MASTERY_LEVELS).find(
    ([_, { min, max }]) => mastery >= min && mastery <= max
  )?.[0];

  return (
    <div
      onClick={onClick}
      className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-colors ${
        isSelected ? 'ring-2 ring-primary' : 'hover:bg-gray-600'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-white">{instrument.name}</h4>
          <p className="text-sm text-gray-400">{instrument.description}</p>
        </div>
        <span className="text-2xl">{INSTRUMENT_TYPE_ICONS[instrument.type]}</span>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Difficulty:</span>
          <span className="text-white">
            {INSTRUMENT_DIFFICULTY_LABELS[instrument.difficulty]}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Mastery:</span>
          <span className={`text-${MASTERY_LEVELS[masteryLevel || 'novice'].color}-400`}>
            {Math.round(mastery)}%
          </span>
        </div>
      </div>
    </div>
  );
};

const ScoreCard: React.FC<{
  score: MusicScore;
  instruments: Instrument[];
  isSelected: boolean;
  onClick: () => void;
}> = ({ score, instruments, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-colors ${
        isSelected ? 'ring-2 ring-primary' : 'hover:bg-gray-600'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-white">{score.title}</h4>
          <p className="text-sm text-gray-400">By {score.composer}</p>
        </div>
        <div className="flex space-x-1">
          {score.instruments.map((instrumentId) => {
            const instrument = instruments.find(i => i.id === instrumentId);
            return instrument ? (
              <span key={instrumentId} className="text-xl">
                {INSTRUMENT_TYPE_ICONS[instrument.type]}
              </span>
            ) : null;
          })}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Difficulty:</span>
          <span className="text-white">
            {INSTRUMENT_DIFFICULTY_LABELS[score.difficulty]}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Duration:</span>
          <span className="text-white">
            {Math.round(score.duration / 1000)}s
          </span>
        </div>
      </div>

      {score.metadata.tags && (
        <div className="mt-3 flex flex-wrap gap-2">
          {score.metadata.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded bg-gray-600 text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const PerformanceView: React.FC<{
  performance: Performance;
  instrument: Instrument;
  score: MusicScore;
  onPlayNote: (performanceId: string, note: { pitch: string; velocity: number; timestamp: number }) => Promise<void>;
  onEnd: () => void;
}> = ({ performance, instrument, score, onPlayNote, onEnd }) => {
  const [currentTime, setCurrentTime] = useState(0);

  // This would be replaced with actual audio playback and note visualization
  const handleKeyPress = async (pitch: string) => {
    await onPlayNote(performance.id, {
      pitch,
      velocity: 80,
      timestamp: currentTime
    });
  };

  return (
    <div className="col-span-2 bg-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">{score.title}</h3>
          <p className="text-gray-400">Playing {instrument.name}</p>
        </div>
        <button
          onClick={onEnd}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          End Performance
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-400 mb-1">Progress</div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(currentTime / score.duration) * 100}%`
              }}
            />
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">Accuracy</div>
          <div className="text-2xl font-bold text-white">
            {Math.round(performance.accuracy)}%
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">Listeners</div>
          <div className="text-lg text-white">
            {performance.listeners.length} listening
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">Available Notes</div>
          <div className="grid grid-cols-4 gap-2">
            {instrument.soundSet.notes.map(({ pitch }) => (
              <button
                key={pitch}
                onClick={() => handleKeyPress(pitch)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                {pitch}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LivePerformanceCard: React.FC<{
  performance: Performance;
  instrument: Instrument;
  score: MusicScore;
  onListen: () => void;
  onReact: (type: string) => void;
}> = ({ performance, instrument, score, onListen, onReact }) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-white">{score.title}</h4>
          <p className="text-sm text-gray-400">
            Playing {instrument.name} • {performance.listeners.length} listening
          </p>
        </div>
        <span className="text-2xl">{INSTRUMENT_TYPE_ICONS[instrument.type]}</span>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Accuracy:</span>
          <span className="text-white">{Math.round(performance.accuracy)}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Rating:</span>
          <span className="text-white">{Math.round(performance.rating)}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          onClick={onListen}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Listen
        </button>
        <div className="flex space-x-2">
          {Object.entries(REACTION_TYPES).map(([type, emoji]) => (
            <button
              key={type}
              onClick={() => onReact(type)}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-600"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const StartPerformanceModal: React.FC<{
  instrument: Instrument;
  score: MusicScore;
  onStart: () => Promise<void>;
  onClose: () => void;
}> = ({ instrument, score, onStart, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await onStart();
    } catch (error) {
      console.error('Failed to start performance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">Start Performance</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-300 mb-1">
              Instrument
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">
                {INSTRUMENT_TYPE_ICONS[instrument.type]}
              </span>
              <span className="text-white">{instrument.name}</span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-300 mb-1">
              Score
            </div>
            <div className="text-white">{score.title}</div>
            <div className="text-sm text-gray-400">By {score.composer}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-300 mb-1">
              Duration
            </div>
            <div className="text-white">
              {Math.round(score.duration / 1000)} seconds
            </div>
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
              {loading ? 'Starting...' : 'Start Performance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
