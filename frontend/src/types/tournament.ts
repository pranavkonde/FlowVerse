export interface Tournament {
  id: string;
  name: string;
  description: string;
  type: 'bracket' | 'round-robin' | 'elimination' | 'custom';
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  gameMode: string;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  prizePool: number;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  rules: string[];
  rewards: TournamentReward[];
  bracket?: TournamentBracket;
  participants: TournamentParticipant[];
  createdAt: Date;
  createdBy: string;
}

export interface TournamentParticipant {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  wins: number;
  losses: number;
  rank?: number;
  joinedAt: Date;
  status: 'registered' | 'active' | 'eliminated' | 'disqualified';
}

export interface TournamentBracket {
  id: string;
  rounds: TournamentRound[];
  currentRound: number;
  totalRounds: number;
}

export interface TournamentRound {
  id: string;
  roundNumber: number;
  name: string;
  matches: TournamentMatch[];
  status: 'upcoming' | 'active' | 'completed';
  startTime?: Date;
  endTime?: Date;
}

export interface TournamentMatch {
  id: string;
  roundId: string;
  participants: TournamentParticipant[];
  winner?: TournamentParticipant;
  status: 'upcoming' | 'active' | 'completed';
  score?: { [participantId: string]: number };
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

export interface TournamentReward {
  id: string;
  position: number;
  type: 'tokens' | 'nft' | 'badge' | 'experience';
  amount: number;
  description: string;
  claimed: boolean;
  claimedBy?: string;
  claimedAt?: Date;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  userId: string;
  registeredAt: Date;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  entryFeePaid: boolean;
  paymentTxHash?: string;
}

export interface TournamentStats {
  totalTournaments: number;
  tournamentsWon: number;
  tournamentsParticipated: number;
  totalPrizeWon: number;
  averageRank: number;
  winRate: number;
  favoriteGameMode: string;
  longestWinStreak: number;
  currentWinStreak: number;
}

export const TOURNAMENT_TYPES = [
  {
    id: 'bracket',
    name: 'Single Elimination',
    description: 'Players are eliminated after one loss',
    icon: '🏆',
    maxParticipants: 32
  },
  {
    id: 'round-robin',
    name: 'Round Robin',
    description: 'Every player plays against every other player',
    icon: '🔄',
    maxParticipants: 16
  },
  {
    id: 'elimination',
    name: 'Double Elimination',
    description: 'Players need to lose twice to be eliminated',
    icon: '⚔️',
    maxParticipants: 32
  },
  {
    id: 'custom',
    name: 'Custom Format',
    description: 'Custom tournament format',
    icon: '🎯',
    maxParticipants: 64
  }
];

export const TOURNAMENT_STATUSES = [
  { id: 'upcoming', name: 'Upcoming', color: 'blue' },
  { id: 'active', name: 'Active', color: 'green' },
  { id: 'completed', name: 'Completed', color: 'gray' },
  { id: 'cancelled', name: 'Cancelled', color: 'red' }
];
