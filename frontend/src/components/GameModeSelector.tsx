'use client';

import { useState } from 'react';
import { Play, Users, Clock, Star, Trophy, Zap, Shield, Target } from 'lucide-react';
import { GameMode, GAME_MODES } from '@/types/gameModes';

interface GameModeSelectorProps {
  isVisible: boolean;
  onToggle: () => void;
  onSelectMode: (mode: GameMode) => void;
}

export default function GameModeSelector({ isVisible, onToggle, onSelectMode }: GameModeSelectorProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Star className="w-4 h-4 text-green-400" />;
      case 'medium': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'hard': return <Shield className="w-4 h-4 text-orange-400" />;
      case 'expert': return <Trophy className="w-4 h-4 text-red-400" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'border-green-400 bg-green-400/10';
      case 'medium': return 'border-yellow-400 bg-yellow-400/10';
      case 'hard': return 'border-orange-400 bg-orange-400/10';
      case 'expert': return 'border-red-400 bg-red-400/10';
      default: return 'border-gray-400 bg-gray-400/10';
    }
  };

  const getDurationText = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const filteredModes = GAME_MODES.filter(mode => {
    const difficultyMatch = selectedDifficulty === 'all' || mode.difficulty === selectedDifficulty;
    const durationMatch = selectedDuration === 'all' || 
      (selectedDuration === 'short' && mode.duration <= 15) ||
      (selectedDuration === 'medium' && mode.duration > 15 && mode.duration <= 30) ||
      (selectedDuration === 'long' && mode.duration > 30);
    
    return difficultyMatch && durationMatch && mode.isActive;
  });

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Play className="w-6 h-6 text-blue-400" />
              <h2 className="text-white text-2xl font-bold">Select Game Mode</h2>
            </div>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-sm">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-slate-600 text-white px-3 py-1 rounded text-sm"
              >
                <option value="all">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-sm">Duration:</span>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="bg-slate-600 text-white px-3 py-1 rounded text-sm"
              >
                <option value="all">All</option>
                <option value="short">Short (≤15m)</option>
                <option value="medium">Medium (16-30m)</option>
                <option value="long">Long (>30m)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Game Modes Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModes.map(mode => (
              <div
                key={mode.id}
                className={`p-6 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer ${getDifficultyColor(mode.difficulty)}`}
                onClick={() => onSelectMode(mode)}
              >
                {/* Mode Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{mode.icon}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg">{mode.name}</h3>
                      <div className="flex items-center gap-2">
                        {getDifficultyIcon(mode.difficulty)}
                        <span className="text-slate-400 text-sm capitalize">
                          {mode.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mode Description */}
                <p className="text-slate-300 text-sm mb-4">
                  {mode.description}
                </p>

                {/* Mode Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{mode.maxPlayers} players</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{getDurationText(mode.duration)}</span>
                  </div>
                </div>

                {/* Objectives Preview */}
                <div className="mb-4">
                  <div className="text-slate-300 text-sm font-medium mb-2">Objectives:</div>
                  <div className="space-y-1">
                    {mode.objectives.slice(0, 2).map(objective => (
                      <div key={objective.id} className="flex items-center gap-2 text-xs text-slate-400">
                        <Target className="w-3 h-3" />
                        <span>{objective.description}</span>
                        <span className="text-yellow-400">+{objective.points}pts</span>
                      </div>
                    ))}
                    {mode.objectives.length > 2 && (
                      <div className="text-xs text-slate-500">
                        +{mode.objectives.length - 2} more objectives
                      </div>
                    )}
                  </div>
                </div>

                {/* Rewards Preview */}
                <div className="mb-4">
                  <div className="text-slate-300 text-sm font-medium mb-2">Rewards:</div>
                  <div className="flex flex-wrap gap-2">
                    {mode.rewards.map((reward, index) => (
                      <div key={index} className="flex items-center gap-1 bg-slate-700 px-2 py-1 rounded text-xs">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="text-slate-300">
                          {reward.type === 'points' ? `${reward.value} pts` :
                           reward.type === 'achievement' ? 'Achievement' :
                           reward.type === 'item' ? 'Item' :
                           reward.type === 'currency' ? `${reward.value} FLOW` : reward.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Play Button */}
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />
                  Play Mode
                </button>
              </div>
            ))}
          </div>

          {filteredModes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-2">No game modes found</div>
              <div className="text-slate-500 text-sm">
                Try adjusting your filters to see more modes
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-700/50 p-4 border-t border-slate-600">
          <div className="text-center text-slate-400 text-sm">
            Choose a game mode to start your adventure in Free Flow!
          </div>
        </div>
      </div>
    </div>
  );
}
