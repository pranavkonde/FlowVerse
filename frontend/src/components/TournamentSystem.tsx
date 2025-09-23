'use client';

import { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, DollarSign, Clock, Play, Pause, CheckCircle, X, Star, Award, Target } from 'lucide-react';
import { Tournament, TournamentParticipant, TournamentBracket, TournamentMatch } from '@/types/tournament';
import { tournamentService } from '@/services/TournamentService';

interface TournamentSystemProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function TournamentSystem({ isVisible, onToggle }: TournamentSystemProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed' | 'bracket'>('upcoming');
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentUserId] = useState('user_123'); // Mock user ID

  useEffect(() => {
    tournamentService.init();
    tournamentService.initializeSampleData();
    setTournaments(tournamentService.getTournaments());
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-400/10 border-blue-400';
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400';
      case 'completed': return 'text-gray-400 bg-gray-400/10 border-gray-400';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'active': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleRegister = async (tournamentId: string) => {
    setIsRegistering(true);
    try {
      const success = tournamentService.registerForTournament(tournamentId, currentUserId);
      if (success) {
        setTournaments(tournamentService.getTournaments());
        setSelectedTournament(tournamentService.getTournament(tournamentId));
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async (tournamentId: string) => {
    const success = tournamentService.unregisterFromTournament(tournamentId, currentUserId);
    if (success) {
      setTournaments(tournamentService.getTournaments());
      setSelectedTournament(tournamentService.getTournament(tournamentId));
    }
  };

  const isUserRegistered = (tournamentId: string) => {
    return tournamentService.isUserRegistered(tournamentId, currentUserId);
  };

  const canRegister = (tournament: Tournament) => {
    return tournament.status === 'upcoming' && 
           tournament.currentParticipants < tournament.maxParticipants &&
           new Date() < tournament.registrationDeadline;
  };

  const renderTournamentCard = (tournament: Tournament) => (
    <div key={tournament.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-medium text-lg mb-1">{tournament.name}</h3>
          <p className="text-slate-300 text-sm mb-2">{tournament.description}</p>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>{tournament.prizePool} tokens</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(tournament.status)}`}>
          {getStatusIcon(tournament.status)}
          <span className="text-sm font-medium capitalize">{tournament.status}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Entry Fee: {tournament.entryFee} tokens</span>
          <span>•</span>
          <span>Mode: {tournament.gameMode}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTournament(tournament)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            View Details
          </button>
          {canRegister(tournament) && (
            <button
              onClick={() => isUserRegistered(tournament.id) ? handleUnregister(tournament.id) : handleRegister(tournament.id)}
              disabled={isRegistering}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isUserRegistered(tournament.id)
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              }`}
            >
              {isUserRegistered(tournament.id) ? 'Unregister' : 'Register'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderBracket = (tournament: Tournament) => {
    if (!tournament.bracket) {
      return (
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">Bracket will be generated when tournament starts</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {tournament.bracket.rounds.map((round, roundIndex) => (
          <div key={round.id} className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-white font-medium text-lg mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              {round.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {round.matches.map((match) => (
                <div key={match.id} className="bg-slate-800 p-3 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      match.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      match.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {match.status}
                    </span>
                    {match.winner && (
                      <Award className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    {match.participants.map((participant, index) => (
                      <div key={participant.id} className={`flex items-center justify-between p-2 rounded ${
                        match.winner?.id === participant.id ? 'bg-yellow-500/20' : 'bg-slate-700/50'
                      }`}>
                        <span className="text-sm text-white">{participant.username}</span>
                        {match.score && (
                          <span className="text-sm font-medium text-slate-300">
                            {match.score[participant.id] || 0}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTournamentDetails = (tournament: Tournament) => (
    <div className="space-y-6">
      <div className="bg-slate-700/50 p-6 rounded-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">{tournament.name}</h2>
            <p className="text-slate-300">{tournament.description}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(tournament.status)}`}>
            {getStatusIcon(tournament.status)}
            <span className="font-medium capitalize">{tournament.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded-lg text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-white font-bold text-xl">{tournament.currentParticipants}</div>
            <div className="text-slate-400 text-sm">Participants</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-white font-bold text-xl">{tournament.prizePool}</div>
            <div className="text-slate-400 text-sm">Prize Pool</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg text-center">
            <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-white font-bold text-xl">{tournament.entryFee}</div>
            <div className="text-slate-400 text-sm">Entry Fee</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-white font-bold text-xl">{tournament.type}</div>
            <div className="text-slate-400 text-sm">Format</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            <div>Starts: {new Date(tournament.startDate).toLocaleString()}</div>
            <div>Registration Deadline: {new Date(tournament.registrationDeadline).toLocaleString()}</div>
          </div>
          {canRegister(tournament) && (
            <button
              onClick={() => isUserRegistered(tournament.id) ? handleUnregister(tournament.id) : handleRegister(tournament.id)}
              disabled={isRegistering}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isUserRegistered(tournament.id)
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isUserRegistered(tournament.id) ? 'Unregister' : 'Register Now'}
            </button>
          )}
        </div>
      </div>

      {tournament.rules.length > 0 && (
        <div className="bg-slate-700/50 p-6 rounded-lg">
          <h3 className="text-white font-medium text-lg mb-4">Tournament Rules</h3>
          <ul className="space-y-2">
            {tournament.rules.map((rule, index) => (
              <li key={index} className="flex items-start gap-2 text-slate-300">
                <span className="text-blue-400 mt-1">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tournament.rewards.length > 0 && (
        <div className="bg-slate-700/50 p-6 rounded-lg">
          <h3 className="text-white font-medium text-lg mb-4">Prizes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tournament.rewards.map((reward) => (
              <div key={reward.id} className="bg-slate-800 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">
                  {reward.position === 1 ? '🥇' : reward.position === 2 ? '🥈' : '🥉'}
                </div>
                <div className="text-white font-bold">{reward.amount} {reward.type}</div>
                <div className="text-slate-400 text-sm">{reward.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-white text-xl font-bold">Tournaments</h2>
          </div>
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-96">
          {/* Sidebar */}
          <div className="w-64 bg-slate-700/50 p-4 border-r border-slate-600">
            <div className="space-y-2">
              {['upcoming', 'active', 'completed', 'bracket'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`w-full text-left p-3 rounded transition-colors capitalize ${
                    activeTab === tab 
                      ? 'bg-blue-500 text-white' 
                      : 'text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {tab === 'bracket' ? 'Tournament Bracket' : `${tab} Tournaments`}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'bracket' && selectedTournament ? (
              renderBracket(selectedTournament)
            ) : selectedTournament && activeTab !== 'bracket' ? (
              renderTournamentDetails(selectedTournament)
            ) : (
              <div className="space-y-4">
                {tournaments
                  .filter(t => {
                    if (activeTab === 'upcoming') return t.status === 'upcoming';
                    if (activeTab === 'active') return t.status === 'active';
                    if (activeTab === 'completed') return t.status === 'completed';
                    return true;
                  })
                  .map(renderTournamentCard)}
                
                {tournaments.filter(t => {
                  if (activeTab === 'upcoming') return t.status === 'upcoming';
                  if (activeTab === 'active') return t.status === 'active';
                  if (activeTab === 'completed') return t.status === 'completed';
                  return true;
                }).length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No {activeTab} tournaments found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
