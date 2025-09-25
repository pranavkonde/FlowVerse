'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sword,
  Shield,
  Zap,
  Heart,
  Target,
  Clock,
  Trophy,
  Users,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  Filter,
  Star,
  Crown,
  Gem,
  Sparkles,
  Activity,
  TrendingUp,
  Award,
  Gamepad2,
  Settings,
  Home,
  User,
  BookOpen,
  ShoppingCart
} from 'lucide-react';
import { 
  Pet,
  PetBattle,
  PetSkill,
  BattleType,
  BattleStatus,
  PetService,
  StatusEffect,
  BattleParticipant
} from '../types/pets';

interface PetBattlesProps {
  userId: string;
  pets: Pet[];
  petService: PetService;
  onClose?: () => void;
}

export default function PetBattles({ userId, pets, petService, onClose }: PetBattlesProps) {
  const [battles, setBattles] = useState<PetBattle[]>([]);
  const [activeBattle, setActiveBattle] = useState<PetBattle | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [battleType, setBattleType] = useState<BattleType>('friendly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<Pet | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  useEffect(() => {
    loadActiveBattles();
    setupEventListeners();
  }, []);

  const loadActiveBattles = async () => {
    try {
      setIsLoading(true);
      const activeBattles = await petService.getActiveBattles();
      setBattles(activeBattles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load battles');
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    petService.on('petBattleStarted', (data) => {
      setBattles(prev => [...prev, data.battle]);
      setActiveBattle(data.battle);
      setBattleLog([`Battle started between ${data.battle.participants.map(p => p.pet.name).join(' vs ')}`]);
    });

    petService.on('petBattleEnded', (data) => {
      setBattles(prev => prev.map(battle => 
        battle.id === data.battle.id ? data.battle : battle
      ));
      if (activeBattle?.id === data.battle.id) {
        setActiveBattle(data.battle);
        const winner = data.battle.participants.find(p => p.id === data.battle.winner);
        if (winner) {
          setBattleLog(prev => [...prev, `Battle ended! ${winner.pet.name} wins!`]);
        }
      }
    });
  };

  const handleStartBattle = async () => {
    if (!selectedPet || !selectedOpponent) return;

    try {
      setIsLoading(true);
      const battle = await petService.startBattle([selectedPet.id, selectedOpponent.id], battleType);
      setActiveBattle(battle);
      setShowBattleModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start battle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteTurn = async (skillId: string, targetId?: string) => {
    if (!activeBattle || !selectedPet) return;

    const participant = activeBattle.participants.find(p => p.petId === selectedPet.id);
    if (!participant) return;

    try {
      const updatedBattle = await petService.executeBattleTurn(
        activeBattle.id,
        participant.id,
        skillId,
        targetId
      );
      if (updatedBattle) {
        setActiveBattle(updatedBattle);
        const skill = selectedPet.skills.find(s => s.id === skillId);
        if (skill) {
          setBattleLog(prev => [...prev, `${selectedPet.name} used ${skill.name}!`]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute turn');
    }
  };

  const getSpeciesEmoji = (species: string): string => {
    const emojis: Record<string, string> = {
      dragon: '🐉',
      phoenix: '🔥',
      wolf: '🐺',
      cat: '🐱',
      dog: '🐶',
      bird: '🐦',
      fish: '🐠',
      butterfly: '🦋',
      unicorn: '🦄',
      griffin: '🦅',
      pegasus: '🐴',
      kraken: '🐙',
      elemental: '⚡',
      spirit: '👻',
      robot: '🤖',
      crystal: '💎',
      shadow: '🌑',
      light: '☀️',
      fire: '🔥',
      water: '💧',
      earth: '🌍',
      air: '💨',
      ice: '❄️',
      thunder: '⚡',
      nature: '🌿',
      cosmic: '🌌',
      void: '🕳️',
      time: '⏰',
      space: '🚀',
      mystic: '🔮'
    };
    return emojis[species] || '🐾';
  };

  const getBattleStatusColor = (status: BattleStatus): string => {
    const colors = {
      waiting: 'text-yellow-600',
      active: 'text-green-600',
      paused: 'text-blue-600',
      completed: 'text-gray-600',
      cancelled: 'text-red-600',
      forfeited: 'text-red-600',
      timeout: 'text-orange-600'
    };
    return colors[status] || colors.waiting;
  };

  const getBattleStatusIcon = (status: BattleStatus) => {
    switch (status) {
      case 'waiting': return <Clock className="h-4 w-4" />;
      case 'active': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <Trophy className="h-4 w-4" />;
      default: return <X className="h-4 w-4" />;
    }
  };

  const canBattle = (pet: Pet): boolean => {
    return pet.level >= 5 && pet.health.current > 0 && !pet.isInBattle;
  };

  const getAvailableSkills = (pet: Pet): PetSkill[] => {
    return pet.skills.filter(skill => skill.isUnlocked && skill.isActive);
  };

  const getOpponents = (): Pet[] => {
    return pets.filter(pet => 
      pet.id !== selectedPet?.id && 
      canBattle(pet) && 
      Math.abs(pet.level - (selectedPet?.level || 0)) <= 5
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Sword className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pet Battles</h2>
            <p className="text-gray-600">Engage in strategic pet combat</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowBattleModal(true)}
            disabled={!selectedPet || !canBattle(selectedPet)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sword className="h-4 w-4" />
            <span>Start Battle</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pet Selection */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Select Your Pet</h3>
            <div className="space-y-2">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  disabled={!canBattle(pet)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedPet?.id === pet.id
                      ? 'bg-red-100 border-2 border-red-500'
                      : canBattle(pet)
                      ? 'bg-white border border-gray-200 hover:bg-gray-50'
                      : 'bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getSpeciesEmoji(pet.species)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{pet.name}</div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Lv.{pet.level}</span>
                        <span>•</span>
                        <span>{pet.stats.health}/{pet.stats.maxHealth} HP</span>
                      </div>
                      {!canBattle(pet) && (
                        <div className="text-xs text-red-600">
                          {pet.level < 5 ? 'Level too low' : 
                           pet.health.current <= 0 ? 'Pet is fainted' :
                           pet.isInBattle ? 'Already in battle' : 'Cannot battle'}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Battle Area */}
        <div className="lg:col-span-2">
          {activeBattle ? (
            <div className="space-y-6">
              {/* Battle Header */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Active Battle</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`font-medium ${getBattleStatusColor(activeBattle.status)}`}>
                        {getBattleStatusIcon(activeBattle.status)}
                      </span>
                      <span className={`text-sm ${getBattleStatusColor(activeBattle.status)}`}>
                        {activeBattle.status.toUpperCase()}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        Turn {activeBattle.currentTurn} / {activeBattle.maxTurns}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Battle Type</div>
                    <div className="text-lg font-semibold text-gray-900 capitalize">
                      {activeBattle.type}
                    </div>
                  </div>
                </div>
              </div>

              {/* Battle Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeBattle.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`bg-white border-2 rounded-lg p-6 ${
                      participant.petId === selectedPet?.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-4xl">{getSpeciesEmoji(participant.pet.species)}</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {participant.pet.name}
                        </h4>
                        <div className="text-sm text-gray-600">
                          Level {participant.pet.level} • {participant.pet.rarity}
                        </div>
                        {participant.isAI && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mt-1">
                            AI
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Health Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Health</span>
                        <span>{participant.currentHealth} / {participant.maxHealth}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            participant.currentHealth > participant.maxHealth * 0.5
                              ? 'bg-green-500'
                              : participant.currentHealth > participant.maxHealth * 0.25
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${(participant.currentHealth / participant.maxHealth) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Status Effects */}
                    {participant.statusEffects.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-2">Status Effects</div>
                        <div className="flex flex-wrap gap-1">
                          {participant.statusEffects.map((effect) => (
                            <span
                              key={effect.id}
                              className={`px-2 py-1 text-xs rounded-full ${
                                effect.isPositive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {effect.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Battle Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Damage Dealt: {participant.stats.damageDealt}</div>
                      <div>Damage Received: {participant.stats.damageReceived}</div>
                      <div>Skills Used: {participant.stats.skillsUsed}</div>
                      <div>Critical Hits: {participant.stats.criticalHits}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Battle Actions */}
              {activeBattle.status === 'active' && selectedPet && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Battle Actions</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Available Skills</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {getAvailableSkills(selectedPet).map((skill) => (
                          <button
                            key={skill.id}
                            onClick={() => handleExecuteTurn(skill.id)}
                            className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                          >
                            <div className="font-medium text-blue-900">{skill.name}</div>
                            <div className="text-xs text-blue-600">
                              Damage: {skill.damage} • Cost: {skill.manaCost} MP
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Battle Log */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Battle Log</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {battleLog.map((log, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚔️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Battle</h3>
              <p className="text-gray-600 mb-6">Select a pet and start a battle to begin!</p>
              <button
                onClick={() => setShowBattleModal(true)}
                disabled={!selectedPet || !canBattle(selectedPet)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start New Battle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Battle Modal */}
      {showBattleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Start New Battle</h3>
            
            <div className="space-y-6">
              {/* Battle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Battle Type
                </label>
                <select
                  value={battleType}
                  onChange={(e) => setBattleType(e.target.value as BattleType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="friendly">Friendly Battle</option>
                  <option value="ranked">Ranked Battle</option>
                  <option value="casual">Casual Battle</option>
                  <option value="training">Training Battle</option>
                </select>
              </div>

              {/* Opponent Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Opponent
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {getOpponents().map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedOpponent(pet)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        selectedOpponent?.id === pet.id
                          ? 'bg-red-100 border-2 border-red-500'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getSpeciesEmoji(pet.species)}</div>
                        <div>
                          <div className="font-medium text-gray-900">{pet.name}</div>
                          <div className="text-sm text-gray-600">
                            Level {pet.level} • {pet.rarity}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBattleModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartBattle}
                disabled={!selectedPet || !selectedOpponent || isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Starting...' : 'Start Battle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

