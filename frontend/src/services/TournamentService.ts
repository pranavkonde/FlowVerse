import { 
  Tournament, 
  TournamentParticipant, 
  TournamentBracket, 
  TournamentRound, 
  TournamentMatch, 
  TournamentRegistration,
  TournamentStats,
  TournamentReward
} from '@/types/tournament';

class TournamentService {
  private tournaments: Tournament[] = [];
  private registrations: TournamentRegistration[] = [];
  private userStats: TournamentStats | null = null;

  constructor() {
    this.loadTournaments();
    this.loadRegistrations();
    this.loadUserStats();
  }

  // Tournament Management
  createTournament(tournamentData: Partial<Tournament>): Tournament {
    const tournament: Tournament = {
      id: Date.now().toString(),
      name: tournamentData.name || 'New Tournament',
      description: tournamentData.description || '',
      type: tournamentData.type || 'bracket',
      status: 'upcoming',
      gameMode: tournamentData.gameMode || 'classic',
      maxParticipants: tournamentData.maxParticipants || 16,
      currentParticipants: 0,
      entryFee: tournamentData.entryFee || 0,
      prizePool: tournamentData.prizePool || 0,
      startDate: tournamentData.startDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
      endDate: tournamentData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      registrationDeadline: tournamentData.registrationDeadline || new Date(Date.now() + 12 * 60 * 60 * 1000),
      rules: tournamentData.rules || [],
      rewards: tournamentData.rewards || [],
      participants: [],
      createdAt: new Date(),
      createdBy: tournamentData.createdBy || 'system'
    };

    this.tournaments.push(tournament);
    this.saveTournaments();
    return tournament;
  }

  getTournaments(): Tournament[] {
    return this.tournaments;
  }

  getTournament(id: string): Tournament | null {
    return this.tournaments.find(t => t.id === id) || null;
  }

  getUpcomingTournaments(): Tournament[] {
    return this.tournaments.filter(t => t.status === 'upcoming');
  }

  getActiveTournaments(): Tournament[] {
    return this.tournaments.filter(t => t.status === 'active');
  }

  getCompletedTournaments(): Tournament[] {
    return this.tournaments.filter(t => t.status === 'completed');
  }

  // Registration Management
  registerForTournament(tournamentId: string, userId: string): boolean {
    const tournament = this.getTournament(tournamentId);
    if (!tournament) return false;

    // Check if already registered
    const existingRegistration = this.registrations.find(
      r => r.tournamentId === tournamentId && r.userId === userId
    );
    if (existingRegistration) return false;

    // Check if tournament is full
    if (tournament.currentParticipants >= tournament.maxParticipants) return false;

    // Check if registration deadline has passed
    if (new Date() > tournament.registrationDeadline) return false;

    const registration: TournamentRegistration = {
      id: Date.now().toString(),
      tournamentId,
      userId,
      registeredAt: new Date(),
      status: 'confirmed',
      entryFeePaid: tournament.entryFee === 0
    };

    this.registrations.push(registration);
    tournament.currentParticipants++;
    tournament.participants.push({
      id: Date.now().toString(),
      userId,
      username: `Player_${userId.slice(-4)}`, // Mock username
      score: 0,
      wins: 0,
      losses: 0,
      joinedAt: new Date(),
      status: 'registered'
    });

    this.saveRegistrations();
    this.saveTournaments();
    return true;
  }

  unregisterFromTournament(tournamentId: string, userId: string): boolean {
    const registration = this.registrations.find(
      r => r.tournamentId === tournamentId && r.userId === userId
    );
    if (!registration) return false;

    const tournament = this.getTournament(tournamentId);
    if (!tournament) return false;

    // Remove registration
    this.registrations = this.registrations.filter(r => r.id !== registration.id);
    
    // Remove participant
    tournament.participants = tournament.participants.filter(p => p.userId !== userId);
    tournament.currentParticipants--;

    this.saveRegistrations();
    this.saveTournaments();
    return true;
  }

  isUserRegistered(tournamentId: string, userId: string): boolean {
    return this.registrations.some(
      r => r.tournamentId === tournamentId && r.userId === userId && r.status === 'confirmed'
    );
  }

  getUserRegistrations(userId: string): TournamentRegistration[] {
    return this.registrations.filter(r => r.userId === userId);
  }

  // Bracket Management
  generateBracket(tournamentId: string): TournamentBracket | null {
    const tournament = this.getTournament(tournamentId);
    if (!tournament || tournament.participants.length < 2) return null;

    const bracket: TournamentBracket = {
      id: Date.now().toString(),
      rounds: [],
      currentRound: 0,
      totalRounds: Math.ceil(Math.log2(tournament.participants.length))
    };

    // Generate rounds based on tournament type
    if (tournament.type === 'bracket') {
      this.generateBracketRounds(bracket, tournament.participants);
    } else if (tournament.type === 'round-robin') {
      this.generateRoundRobinRounds(bracket, tournament.participants);
    }

    tournament.bracket = bracket;
    this.saveTournaments();
    return bracket;
  }

  private generateBracketRounds(bracket: TournamentBracket, participants: TournamentParticipant[]): void {
    let currentParticipants = [...participants];
    let roundNumber = 1;

    while (currentParticipants.length > 1) {
      const round: TournamentRound = {
        id: Date.now().toString() + roundNumber,
        roundNumber,
        name: this.getRoundName(roundNumber, bracket.totalRounds),
        matches: [],
        status: 'upcoming'
      };

      // Create matches for this round
      for (let i = 0; i < currentParticipants.length; i += 2) {
        if (i + 1 < currentParticipants.length) {
          const match: TournamentMatch = {
            id: Date.now().toString() + i,
            roundId: round.id,
            participants: [currentParticipants[i], currentParticipants[i + 1]],
            status: 'upcoming'
          };
          round.matches.push(match);
        } else {
          // Odd number of participants, one gets a bye
          const byeMatch: TournamentMatch = {
            id: Date.now().toString() + i + 'bye',
            roundId: round.id,
            participants: [currentParticipants[i]],
            status: 'completed',
            winner: currentParticipants[i]
          };
          round.matches.push(byeMatch);
        }
      }

      bracket.rounds.push(round);
      currentParticipants = currentParticipants.slice(0, Math.ceil(currentParticipants.length / 2));
      roundNumber++;
    }
  }

  private generateRoundRobinRounds(bracket: TournamentBracket, participants: TournamentParticipant[]): void {
    const round: TournamentRound = {
      id: Date.now().toString(),
      roundNumber: 1,
      name: 'Round Robin',
      matches: [],
      status: 'upcoming'
    };

    // Generate all possible match combinations
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const match: TournamentMatch = {
          id: Date.now().toString() + i + j,
          roundId: round.id,
          participants: [participants[i], participants[j]],
          status: 'upcoming'
        };
        round.matches.push(match);
      }
    }

    bracket.rounds.push(round);
  }

  private getRoundName(roundNumber: number, totalRounds: number): string {
    if (roundNumber === totalRounds) return 'Final';
    if (roundNumber === totalRounds - 1) return 'Semi-Final';
    if (roundNumber === totalRounds - 2) return 'Quarter-Final';
    return `Round ${roundNumber}`;
  }

  // Match Management
  startMatch(tournamentId: string, matchId: string): boolean {
    const tournament = this.getTournament(tournamentId);
    if (!tournament || !tournament.bracket) return false;

    const match = this.findMatch(tournament.bracket, matchId);
    if (!match) return false;

    match.status = 'active';
    match.startTime = new Date();
    this.saveTournaments();
    return true;
  }

  completeMatch(tournamentId: string, matchId: string, winnerId: string, scores: { [participantId: string]: number }): boolean {
    const tournament = this.getTournament(tournamentId);
    if (!tournament || !tournament.bracket) return false;

    const match = this.findMatch(tournament.bracket, matchId);
    if (!match) return false;

    const winner = match.participants.find(p => p.id === winnerId);
    if (!winner) return false;

    match.status = 'completed';
    match.winner = winner;
    match.score = scores;
    match.endTime = new Date();
    match.duration = match.endTime.getTime() - (match.startTime?.getTime() || 0);

    // Update participant stats
    match.participants.forEach(participant => {
      if (participant.id === winnerId) {
        participant.wins++;
      } else {
        participant.losses++;
      }
    });

    this.saveTournaments();
    return true;
  }

  private findMatch(bracket: TournamentBracket, matchId: string): TournamentMatch | null {
    for (const round of bracket.rounds) {
      const match = round.matches.find(m => m.id === matchId);
      if (match) return match;
    }
    return null;
  }

  // Stats and Analytics
  getUserStats(userId: string): TournamentStats {
    if (this.userStats) return this.userStats;

    const userRegistrations = this.getUserRegistrations(userId);
    const completedTournaments = this.getCompletedTournaments();
    
    const userTournaments = completedTournaments.filter(t => 
      t.participants.some(p => p.userId === userId)
    );

    const stats: TournamentStats = {
      totalTournaments: userTournaments.length,
      tournamentsWon: userTournaments.filter(t => 
        t.participants.find(p => p.userId === userId)?.rank === 1
      ).length,
      tournamentsParticipated: userRegistrations.length,
      totalPrizeWon: 0, // Calculate from rewards
      averageRank: 0, // Calculate from participant ranks
      winRate: 0, // Calculate from wins/losses
      favoriteGameMode: 'classic',
      longestWinStreak: 0,
      currentWinStreak: 0
    };

    this.userStats = stats;
    this.saveUserStats();
    return stats;
  }

  // Data Persistence
  private saveTournaments(): void {
    localStorage.setItem('flowverse_tournaments', JSON.stringify(this.tournaments));
  }

  private loadTournaments(): void {
    const saved = localStorage.getItem('flowverse_tournaments');
    if (saved) {
      this.tournaments = JSON.parse(saved).map((t: any) => ({
        ...t,
        startDate: new Date(t.startDate),
        endDate: new Date(t.endDate),
        registrationDeadline: new Date(t.registrationDeadline),
        createdAt: new Date(t.createdAt),
        participants: t.participants.map((p: any) => ({
          ...p,
          joinedAt: new Date(p.joinedAt)
        }))
      }));
    }
  }

  private saveRegistrations(): void {
    localStorage.setItem('flowverse_tournament_registrations', JSON.stringify(this.registrations));
  }

  private loadRegistrations(): void {
    const saved = localStorage.getItem('flowverse_tournament_registrations');
    if (saved) {
      this.registrations = JSON.parse(saved).map((r: any) => ({
        ...r,
        registeredAt: new Date(r.registeredAt)
      }));
    }
  }

  private saveUserStats(): void {
    localStorage.setItem('flowverse_tournament_stats', JSON.stringify(this.userStats));
  }

  private loadUserStats(): void {
    const saved = localStorage.getItem('flowverse_tournament_stats');
    if (saved) {
      this.userStats = JSON.parse(saved);
    }
  }

  // Initialize with sample data
  initializeSampleData(): void {
    if (this.tournaments.length === 0) {
      const sampleTournament = this.createTournament({
        name: 'Weekly Championship',
        description: 'Join our weekly tournament for a chance to win amazing prizes!',
        type: 'bracket',
        gameMode: 'classic',
        maxParticipants: 16,
        entryFee: 10,
        prizePool: 150,
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        rules: [
          'No cheating or exploiting',
          'Respect other players',
          'Follow the game rules',
          'Have fun!'
        ],
        rewards: [
          { id: '1', position: 1, type: 'tokens', amount: 100, description: '1st Place Prize', claimed: false },
          { id: '2', position: 2, type: 'tokens', amount: 50, description: '2nd Place Prize', claimed: false },
          { id: '3', position: 3, type: 'tokens', amount: 25, description: '3rd Place Prize', claimed: false }
        ]
      });

      // Add some sample participants
      for (let i = 0; i < 8; i++) {
        this.registerForTournament(sampleTournament.id, `user_${i}`);
      }
    }
  }
}

export const tournamentService = new TournamentService();
