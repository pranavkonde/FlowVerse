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
  Package,
  Droplets,
  Utensils,
  Stethoscope,
  Dumbbell,
  GamepadIcon,
  Bed,
  Users2,
  GraduationCap,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { 
  Pet,
  PetCare,
  CareType,
  CareStatus,
  PetService
} from '../types/pets';

interface PetCareProps {
  userId: string;
  pets: Pet[];
  petService: PetService;
  onClose?: () => void;
}

export default function PetCare({ userId, pets, petService, onClose }: PetCareProps) {
  const [careSessions, setCareSessions] = useState<PetCare[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [activeCare, setActiveCare] = useState<PetCare | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCareModal, setShowCareModal] = useState(false);
  const [selectedCareType, setSelectedCareType] = useState<CareType>('feeding');
  const [careDuration, setCareDuration] = useState(30);

  useEffect(() => {
    loadCareSessions();
    setupEventListeners();
  }, []);

  const loadCareSessions = async () => {
    try {
      setIsLoading(true);
      const sessions = await petService.getCareSessions();
      setCareSessions(sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load care sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    petService.on('petCareStarted', (data) => {
      setCareSessions(prev => [...prev, data.care]);
      setActiveCare(data.care);
    });

    petService.on('petCareCompleted', (data) => {
      setCareSessions(prev => prev.map(care => 
        care.id === data.care.id ? data.care : care
      ));
      if (activeCare?.id === data.care.id) {
        setActiveCare(null);
      }
    });
  };

  const handleStartCare = async () => {
    if (!selectedPet) return;

    try {
      setIsLoading(true);
      const care = await petService.startCare(selectedPet.id, selectedCareType, careDuration);
      setShowCareModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start care');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteCare = async (careId: string) => {
    try {
      setIsLoading(true);
      await petService.completeCare(careId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete care');
    } finally {
      setIsLoading(false);
    }
  };

  const getCareIcon = (type: CareType) => {
    const icons = {
      feeding: Utensils,
      grooming: Scissors,
      medical: Stethoscope,
      exercise: Dumbbell,
      play: GamepadIcon,
      rest: Bed,
      socialization: Users2,
      training: GraduationCap,
      checkup: Calendar,
      emergency: AlertTriangle
    };
    return icons[type] || Heart;
  };

  const getCareColor = (type: CareType): string => {
    const colors = {
      feeding: 'text-orange-600',
      grooming: 'text-blue-600',
      medical: 'text-red-600',
      exercise: 'text-green-600',
      play: 'text-purple-600',
      rest: 'text-gray-600',
      socialization: 'text-pink-600',
      training: 'text-indigo-600',
      checkup: 'text-cyan-600',
      emergency: 'text-red-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const getCareBgColor = (type: CareType): string => {
    const colors = {
      feeding: 'bg-orange-100',
      grooming: 'bg-blue-100',
      medical: 'bg-red-100',
      exercise: 'bg-green-100',
      play: 'bg-purple-100',
      rest: 'bg-gray-100',
      socialization: 'bg-pink-100',
      training: 'bg-indigo-100',
      checkup: 'bg-cyan-100',
      emergency: 'bg-red-100'
    };
    return colors[type] || 'bg-gray-100';
  };

  const getCareStatusColor = (status: CareStatus): string => {
    const colors = {
      scheduled: 'text-blue-600',
      in_progress: 'text-green-600',
      completed: 'text-gray-600',
      cancelled: 'text-red-600',
      overdue: 'text-orange-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const getCareStatusIcon = (status: CareStatus) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'completed': return <Trophy className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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

  const getPetCareStatus = (pet: Pet) => {
    const careTypes: CareType[] = [];
    let needsCare = false;

    if (pet.hunger < 30) {
      careTypes.push('feeding');
      needsCare = true;
    }

    if (pet.cleanliness < 40) {
      careTypes.push('grooming');
      needsCare = true;
    }

    if (pet.health.current < pet.health.maximum * 0.5) {
      careTypes.push('medical');
      needsCare = true;
    }

    if (pet.energy < 20) {
      careTypes.push('rest');
      needsCare = true;
    }

    if (pet.happiness < 30) {
      careTypes.push('play');
      needsCare = true;
    }

    return { needsCare, careTypes };
  };

  const getCareDurationOptions = (type: CareType) => {
    const durations = {
      feeding: [15, 30, 45, 60],
      grooming: [30, 45, 60, 90],
      medical: [60, 90, 120, 180],
      exercise: [30, 45, 60, 90],
      play: [15, 30, 45, 60],
      rest: [60, 120, 180, 240],
      socialization: [45, 60, 90, 120],
      training: [60, 90, 120, 180],
      checkup: [30, 45, 60, 90],
      emergency: [15, 30, 45, 60]
    };
    return durations[type] || [30, 45, 60, 90];
  };

  const getCareDescription = (type: CareType): string => {
    const descriptions = {
      feeding: 'Provide nutritious food to restore hunger and boost happiness',
      grooming: 'Clean and groom your pet to improve cleanliness and appearance',
      medical: 'Treat health issues and restore your pet\'s vitality',
      exercise: 'Engage in physical activities to boost energy and stamina',
      play: 'Have fun with your pet to increase happiness and bonding',
      rest: 'Allow your pet to rest and recover energy',
      socialization: 'Help your pet interact with others to improve social skills',
      training: 'Teach your pet new skills and behaviors',
      checkup: 'Regular health checkup to maintain optimal condition',
      emergency: 'Urgent medical attention for critical health issues'
    };
    return descriptions[type] || 'Care for your pet';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Heart className="h-6 w-6 text-pink-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pet Care</h2>
            <p className="text-gray-600">Take care of your beloved companions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCareModal(true)}
            disabled={!selectedPet}
            className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Start Care</span>
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
            <h3 className="font-semibold text-gray-900 mb-3">Select Pet</h3>
            <div className="space-y-2">
              {pets.map((pet) => {
                const careStatus = getPetCareStatus(pet);
                return (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedPet?.id === pet.id
                        ? 'bg-pink-100 border-2 border-pink-500'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getSpeciesEmoji(pet.species)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{pet.name}</div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>Lv.{pet.level}</span>
                          <span>•</span>
                          <span>{pet.rarity}</span>
                        </div>
                        {careStatus.needsCare && (
                          <div className="text-xs text-red-600 mt-1">
                            Needs: {careStatus.careTypes.join(', ')}
                          </div>
                        )}
                      </div>
                      {careStatus.needsCare && (
                        <div className="text-red-500">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Care Area */}
        <div className="lg:col-span-2">
          {selectedPet ? (
            <div className="space-y-6">
              {/* Pet Care Status */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{getSpeciesEmoji(selectedPet.species)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedPet.name}</h3>
                      <div className="text-sm text-gray-600">
                        Level {selectedPet.level} • {selectedPet.rarity} {selectedPet.species}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Care Status</div>
                    <div className={`text-lg font-semibold ${
                      getPetCareStatus(selectedPet).needsCare ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {getPetCareStatus(selectedPet).needsCare ? 'Needs Care' : 'Healthy'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Care Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'happiness', label: 'Happiness', value: selectedPet.happiness, color: 'bg-pink-500', icon: Heart },
                  { key: 'hunger', label: 'Hunger', value: selectedPet.hunger, color: 'bg-orange-500', icon: Utensils },
                  { key: 'energy', label: 'Energy', value: selectedPet.energy, color: 'bg-yellow-500', icon: Zap },
                  { key: 'cleanliness', label: 'Cleanliness', value: selectedPet.cleanliness, color: 'bg-blue-500', icon: Droplets }
                ].map((stat) => (
                  <div key={stat.key} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <stat.icon className={`h-4 w-4 ${stat.color.replace('bg-', 'text-')}`} />
                      <span className="text-sm text-gray-600">{stat.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
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

              {/* Care Types */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Available Care Types</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    'feeding', 'grooming', 'medical', 'exercise', 'play',
                    'rest', 'socialization', 'training', 'checkup', 'emergency'
                  ].map((type) => {
                    const careType = type as CareType;
                    const Icon = getCareIcon(careType);
                    const isRecommended = getPetCareStatus(selectedPet).careTypes.includes(careType);
                    
                    return (
                      <button
                        key={careType}
                        onClick={() => {
                          setSelectedCareType(careType);
                          setShowCareModal(true);
                        }}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          isRecommended
                            ? 'border-red-300 bg-red-50 hover:bg-red-100'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`mx-auto mb-2 p-2 rounded-lg ${getCareBgColor(careType)}`}>
                            <Icon className={`h-6 w-6 ${getCareColor(careType)}`} />
                          </div>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {careType.replace('_', ' ')}
                          </div>
                          {isRecommended && (
                            <div className="text-xs text-red-600 mt-1">Recommended</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Care Sessions */}
              {activeCare && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Active Care Session</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getCareBgColor(activeCare.type)}`}>
                        {React.createElement(getCareIcon(activeCare.type), {
                          className: `h-6 w-6 ${getCareColor(activeCare.type)}`
                        })}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {activeCare.type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getCareDescription(activeCare.type)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Progress</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {Math.round((activeCare.progress / activeCare.maxProgress) * 100)}%
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(activeCare.progress / activeCare.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Care History */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Recent Care Sessions</h4>
                <div className="space-y-3">
                  {careSessions
                    .filter(care => care.petId === selectedPet.id)
                    .slice(0, 5)
                    .map((care) => (
                      <div key={care.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getCareBgColor(care.type)}`}>
                            {React.createElement(getCareIcon(care.type), {
                              className: `h-4 w-4 ${getCareColor(care.type)}`
                            })}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 capitalize">
                              {care.type.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(care.startedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${getCareStatusColor(care.status)}`}>
                            {getCareStatusIcon(care.status)}
                          </span>
                          <span className={`text-sm font-medium ${getCareStatusColor(care.status)}`}>
                            {care.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Pet</h3>
              <p className="text-gray-600 mb-6">Choose a pet from the list to start caring for them</p>
            </div>
          )}
        </div>
      </div>

      {/* Care Modal */}
      {showCareModal && selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Care Session</h3>
            
            <div className="space-y-4">
              {/* Pet Info */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{getSpeciesEmoji(selectedPet.species)}</div>
                <div>
                  <div className="font-medium text-gray-900">{selectedPet.name}</div>
                  <div className="text-sm text-gray-600">
                    Level {selectedPet.level} • {selectedPet.rarity}
                  </div>
                </div>
              </div>

              {/* Care Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Care Type
                </label>
                <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg">
                  <div className={`p-2 rounded-lg ${getCareBgColor(selectedCareType)}`}>
                    {React.createElement(getCareIcon(selectedCareType), {
                      className: `h-5 w-5 ${getCareColor(selectedCareType)}`
                    })}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {selectedCareType.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getCareDescription(selectedCareType)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={careDuration}
                  onChange={(e) => setCareDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {getCareDurationOptions(selectedCareType).map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} minutes
                    </option>
                  ))}
                </select>
              </div>

              {/* Cost */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600">
                  <strong>Cost:</strong> {Math.ceil(careDuration / 60) * 10} FFT tokens
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCareModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartCare}
                disabled={isLoading}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Starting...' : 'Start Care'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


