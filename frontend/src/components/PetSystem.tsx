'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart,
  Star,
  Zap,
  Shield,
  Sword,
  Crown,
  Gem,
  Sparkles,
  Plus,
  Settings,
  Trophy,
  Target,
  BookOpen,
  ShoppingCart,
  Users,
  Award,
  TrendingUp,
  Activity,
  Clock,
  MapPin,
  Filter,
  Search,
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Home,
  User,
  Gamepad2,
  Scissors,
  Wrench,
  Flask,
  Leaf,
  TreePine,
  Pickaxe,
  Hammer,
  Package
} from 'lucide-react';
import { 
  Pet,
  PetSpecies,
  PetRarity,
  PetMood,
  PetService,
  CareType,
  TrainingType,
  BattleType,
  MarketplaceType
} from '../types/pets';

interface PetSystemProps {
  userId: string;
  onClose?: () => void;
  onToggle?: () => void;
}

export default function PetSystem({ userId, onClose, onToggle }: PetSystemProps) {
  const [petService] = useState(() => new PetService());
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'care' | 'training' | 'battle' | 'marketplace' | 'achievements'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptSpecies, setAdoptSpecies] = useState<PetSpecies>('cat');
  const [adoptName, setAdoptName] = useState('');

  useEffect(() => {
    loadUserPets();
    setupEventListeners();
    
    return () => {
      petService.disconnect();
    };
  }, [userId]);

  const loadUserPets = async () => {
    try {
      setIsLoading(true);
      const userPets = await petService.getUserPets(userId);
      setPets(userPets);
      if (userPets.length > 0 && !selectedPet) {
        setSelectedPet(userPets[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pets');
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    petService.on('petAdopted', (data) => {
      setPets(prev => [...prev, data.pet]);
      setSelectedPet(data.pet);
      setShowAdoptModal(false);
    });

    petService.on('petLeveledUp', (data) => {
      setPets(prev => prev.map(pet => 
        pet.id === data.pet.id ? data.pet : pet
      ));
      if (selectedPet?.id === data.pet.id) {
        setSelectedPet(data.pet);
      }
    });

    petService.on('petHealthChanged', (data) => {
      setPets(prev => prev.map(pet => 
        pet.id === data.petId ? { ...pet, stats: { ...pet.stats, ...data.stats } } : pet
      ));
    });

    petService.on('petMoodChanged', (data) => {
      setPets(prev => prev.map(pet => 
        pet.id === data.petId ? { ...pet, personality: { ...pet.personality, mood: data.mood } } : pet
      ));
    });
  };

  const handleAdoptPet = async () => {
    if (!adoptName.trim()) return;
    
    try {
      setIsLoading(true);
      await petService.adoptPet(adoptSpecies, adoptName.trim());
      setAdoptName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adopt pet');
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: PetRarity): string => {
    const colors = {
      common: 'text-gray-500',
      uncommon: 'text-green-500',
      rare: 'text-blue-500',
      epic: 'text-purple-500',
      legendary: 'text-orange-500',
      mythic: 'text-pink-500',
      divine: 'text-yellow-500',
      ancient: 'text-red-500'
    };
    return colors[rarity] || colors.common;
  };

  const getMoodEmoji = (mood: PetMood): string => {
    const emojis = {
      happy: '😊',
      content: '😌',
      neutral: '😐',
      sad: '😢',
      angry: '😠',
      excited: '🤩',
      sleepy: '😴',
      playful: '😄',
      curious: '🤔',
      scared: '😨',
      confused: '😕',
      lonely: '😔'
    };
    return emojis[mood] || emojis.neutral;
  };

  const getSpeciesEmoji = (species: PetSpecies): string => {
    const emojis = {
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

  if (isLoading && pets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Heart className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pet System</h2>
            <p className="text-gray-600">Manage your beloved companions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdoptModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Adopt Pet</span>
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

      {pets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pets Yet</h3>
          <p className="text-gray-600 mb-6">Adopt your first pet to start your journey!</p>
          <button
            onClick={() => setShowAdoptModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Adopt Your First Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Pet List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Your Pets</h3>
              <div className="space-y-2">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedPet?.id === pet.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getSpeciesEmoji(pet.species)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{pet.name}</div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className={`font-medium ${getRarityColor(pet.rarity)}`}>
                            {pet.rarity}
                          </span>
                          <span>•</span>
                          <span>Lv.{pet.level}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <span>{getMoodEmoji(pet.personality.mood)}</span>
                          <span>{pet.personality.mood}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pet Details */}
          <div className="lg:col-span-3">
            {selectedPet ? (
              <div className="space-y-6">
                {/* Pet Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-6xl">{getSpeciesEmoji(selectedPet.species)}</div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{selectedPet.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className={`font-medium ${getRarityColor(selectedPet.rarity)}`}>
                            {selectedPet.rarity} {selectedPet.species}
                          </span>
                          <span>•</span>
                          <span>Level {selectedPet.level}</span>
                          <span>•</span>
                          <span>{selectedPet.breed}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-lg">{getMoodEmoji(selectedPet.personality.mood)}</span>
                          <span className="text-sm text-gray-600">{selectedPet.personality.mood}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Experience</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedPet.experience} / {selectedPet.experienceToNext}
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(selectedPet.experience / selectedPet.experienceToNext) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'overview', label: 'Overview', icon: Home },
                      { id: 'care', label: 'Care', icon: Heart },
                      { id: 'training', label: 'Training', icon: BookOpen },
                      { id: 'battle', label: 'Battle', icon: Sword },
                      { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
                      { id: 'achievements', label: 'Achievements', icon: Trophy }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="min-h-96">
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Stats */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Stats</h4>
                        <div className="space-y-3">
                          {Object.entries(selectedPet.stats).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(100, (value / 20) * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8 text-right">
                                  {value}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Care Status */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Care Status</h4>
                        <div className="space-y-3">
                          {[
                            { key: 'happiness', label: 'Happiness', value: selectedPet.happiness, color: 'bg-pink-500' },
                            { key: 'hunger', label: 'Hunger', value: selectedPet.hunger, color: 'bg-orange-500' },
                            { key: 'energy', label: 'Energy', value: selectedPet.energy, color: 'bg-yellow-500' },
                            { key: 'cleanliness', label: 'Cleanliness', value: selectedPet.cleanliness, color: 'bg-blue-500' }
                          ].map((stat) => (
                            <div key={stat.key} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{stat.label}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`${stat.color} h-2 rounded-full`}
                                    style={{ width: `${stat.value}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8 text-right">
                                  {stat.value}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Skills</h4>
                        <div className="space-y-3">
                          {selectedPet.skills.map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{skill.name}</div>
                                <div className="text-sm text-gray-600">Level {skill.level}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">
                                  {skill.experience} / {skill.experienceToNext} XP
                                </div>
                                <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                                  <div 
                                    className="bg-green-500 h-1 rounded-full"
                                    style={{ width: `${(skill.experience / skill.experienceToNext) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Personality */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Personality</h4>
                        <div className="space-y-3">
                          {selectedPet.personality.traits.map((trait) => (
                            <span
                              key={trait}
                              className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mr-2 mb-2"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'care' && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">🛁</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Pet Care</h3>
                      <p className="text-gray-600 mb-6">Care system coming soon!</p>
                    </div>
                  )}

                  {activeTab === 'training' && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">📚</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Pet Training</h3>
                      <p className="text-gray-600 mb-6">Training system coming soon!</p>
                    </div>
                  )}

                  {activeTab === 'battle' && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">⚔️</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Pet Battles</h3>
                      <p className="text-gray-600 mb-6">Battle system coming soon!</p>
                    </div>
                  )}

                  {activeTab === 'marketplace' && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">🛒</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Pet Marketplace</h3>
                      <p className="text-gray-600 mb-6">Marketplace coming soon!</p>
                    </div>
                  )}

                  {activeTab === 'achievements' && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">🏆</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Pet Achievements</h3>
                      <p className="text-gray-600 mb-6">Achievements coming soon!</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🐾</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Pet</h3>
                <p className="text-gray-600">Choose a pet from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adopt Pet Modal */}
      {showAdoptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Adopt a New Pet</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Name
                </label>
                <input
                  type="text"
                  value={adoptName}
                  onChange={(e) => setAdoptName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter pet name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species
                </label>
                <select
                  value={adoptSpecies}
                  onChange={(e) => setAdoptSpecies(e.target.value as PetSpecies)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cat">🐱 Cat</option>
                  <option value="dog">🐶 Dog</option>
                  <option value="dragon">🐉 Dragon</option>
                  <option value="phoenix">🔥 Phoenix</option>
                  <option value="wolf">🐺 Wolf</option>
                  <option value="bird">🐦 Bird</option>
                  <option value="fish">🐠 Fish</option>
                  <option value="butterfly">🦋 Butterfly</option>
                  <option value="unicorn">🦄 Unicorn</option>
                  <option value="griffin">🦅 Griffin</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAdoptModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdoptPet}
                disabled={!adoptName.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Adopting...' : 'Adopt Pet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

