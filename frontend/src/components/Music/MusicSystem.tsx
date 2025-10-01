import React, { useState, useEffect } from 'react';
import { useMusic } from '../../hooks/useMusic';
import {
  Instrument,
  Song,
  Performance,
  InstrumentType,
  ReactionType
} from '../../types/music';

const INSTRUMENT_ICONS = {
  PIANO: '🎹',
  GUITAR: '🎸',
  DRUMS: '🥁',
  VIOLIN: '🎻',
  FLUTE: '🎵',
  HARP: '🎼',
  LUTE: '🪕',
  HORN: '📯',
  BELLS: '🔔',
  MAGICAL: '✨'
};

const REACTION_ICONS = {
  APPLAUSE: '👏',
  CHEER: '🎉',
  DANCE: '💃',
  ENCORE: '⭐',
  TIP: '💰'
};

export function MusicSystem() {
  const {
    instruments,
    songs,
    currentPerformance,
    stats,
    settings,
    loading,
    error,
    audioContext,
    startPerformance,
    endPerformance,
    playNote,
    addReaction,
    joinAudience,
    updateSettings
  } = useMusic();

  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Request audio context activation on first interaction
    const handleFirstInteraction = () => {
      if (audioContext?.state === 'suspended') {
        audioContext.resume();
      }
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, [audioContext]);

  if (loading) {
    return <div className="p-4">Loading music system...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const handleStartPerformance = async () => {
    if (!selectedInstrument || !selectedSong) return;

    try {
      await startPerformance(selectedInstrument.id, selectedSong.id);
    } catch (err) {
      console.error('Failed to start performance:', err);
    }
  };

  const handleEndPerformance = async () => {
    if (!currentPerformance) return;

    try {
      await endPerformance({
        score: 100, // Calculate based on actual performance
        accuracy: 95,
        combo: 10
      });
    } catch (err) {
      console.error('Failed to end performance:', err);
    }
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Musician Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalPerformances}
            </div>
            <div className="text-sm text-gray-400">Total Performances</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.songsLearned}
            </div>
            <div className="text-sm text-gray-400">Songs Learned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {Math.round(stats.averageAccuracy)}%
            </div>
            <div className="text-sm text-gray-400">Average Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.highestCombo}
            </div>
            <div className="text-sm text-gray-400">Highest Combo</div>
          </div>
        </div>

        {stats.specialAchievements.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Achievements
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.specialAchievements.map(achievement => (
                <div
                  key={achievement}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm"
                >
                  🏆 {achievement}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInstruments = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Instruments</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {instruments.map(instrument => (
          <div
            key={instrument.id}
            className={`
              bg-gray-700 rounded-lg p-4 cursor-pointer
              ${selectedInstrument?.id === instrument.id ? 'ring-2 ring-blue-500' : ''}
              hover:bg-gray-600 transition-colors
            `}
            onClick={() => setSelectedInstrument(instrument)}
          >
            <div className="text-center mb-2">
              <span className="text-4xl">
                {INSTRUMENT_ICONS[instrument.type]}
              </span>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">
                {instrument.name}
              </div>
              <div className="text-sm text-gray-400">
                {instrument.category}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1 text-sm text-gray-300">
              <div>Power: {instrument.stats.power}</div>
              <div>Control: {instrument.stats.control}</div>
              <div>Harmony: {instrument.stats.harmony}</div>
              <div>Resonance: {instrument.stats.resonance}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSongs = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Available Songs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {songs.map(song => (
          <div
            key={song.id}
            className={`
              bg-gray-700 rounded-lg p-4 cursor-pointer
              ${selectedSong?.id === song.id ? 'ring-2 ring-blue-500' : ''}
              hover:bg-gray-600 transition-colors
            `}
            onClick={() => setSelectedSong(song)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {song.title}
                </h3>
                <div className="text-sm text-gray-400">
                  by {song.composer}
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {Math.round(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
              <span>BPM: {song.bpm}</span>
              <span>•</span>
              <span>Difficulty: {song.difficulty}</span>
            </div>

            <div className="text-sm text-gray-400">
              Required Instruments:
              <div className="flex space-x-1 mt-1">
                {song.requirements.instrument.map(type => (
                  <span key={type} className="text-xl" title={type}>
                    {INSTRUMENT_ICONS[type]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPerformance = () => {
    if (!currentPerformance) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Current Performance</h2>
          <button
            onClick={handleEndPerformance}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            End Performance
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-700 rounded p-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Performance Details
            </h3>
            <div className="space-y-2 text-gray-300">
              <div>Song: {currentPerformance.song.title}</div>
              <div>Started: {new Date(currentPerformance.startedAt).toLocaleTimeString()}</div>
              <div>Audience: {currentPerformance.audience.length}</div>
            </div>
          </div>

          <div className="bg-gray-700 rounded p-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Reactions
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(REACTION_ICONS).map(([type, icon]) => (
                <button
                  key={type}
                  onClick={() => addReaction(type as ReactionType)}
                  className="text-2xl hover:scale-110 transition-transform"
                  title={type}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-1">
          {['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C5'].map(note => (
            <button
              key={note}
              onMouseDown={() => playNote(note)}
              className="bg-white h-32 rounded-b border border-gray-300 hover:bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Master Volume
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.volume.master}
            onChange={e => updateSettings({
              volume: {
                ...settings.volume,
                master: parseFloat(e.target.value)
              }
            })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Instrument Volume
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.volume.instruments}
            onChange={e => updateSettings({
              volume: {
                ...settings.volume,
                instruments: parseFloat(e.target.value)
              }
            })}
            className="w-full"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.visualEffects}
            onChange={e => updateSettings({
              visualEffects: e.target.checked
            })}
          />
          <label className="text-gray-300">
            Enable Visual Effects
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.showNoteNames}
            onChange={e => updateSettings({
              showNoteNames: e.target.checked
            })}
          />
          <label className="text-gray-300">
            Show Note Names
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.midiEnabled}
            onChange={e => updateSettings({
              midiEnabled: e.target.checked
            })}
          />
          <label className="text-gray-300">
            Enable MIDI Input
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Music System</h1>
        <div className="space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            {showSettings ? 'Hide Settings' : 'Settings'}
          </button>
          {selectedInstrument && selectedSong && !currentPerformance && (
            <button
              onClick={handleStartPerformance}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Start Performance
            </button>
          )}
        </div>
      </div>

      {renderStats()}
      {showSettings && renderSettings()}
      {currentPerformance ? renderPerformance() : (
        <>
          {renderInstruments()}
          {renderSongs()}
        </>
      )}
    </div>
  );
}