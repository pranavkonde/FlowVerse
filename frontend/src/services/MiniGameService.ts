import { 
  MiniGame, 
  MiniGameScore, 
  MiniGameLeaderboard, 
  MiniGameSession, 
  MiniGameStats,
  MemoryGameData,
  PuzzleGameData,
  ReactionGameData,
  MINI_GAMES,
  MINI_GAME_EVENTS,
  MiniGameEventType
} from '@/types/minigames';

export class MiniGameService {
  private games: Map<string, MiniGame> = new Map();
  private scores: Map<string, MiniGameScore[]> = new Map(); // gameId -> scores
  private leaderboards: Map<string, MiniGameLeaderboard> = new Map();
  private currentSession: MiniGameSession | null = null;
  private stats: MiniGameStats;
  private eventListeners: Map<MiniGameEventType, Function[]> = new Map();

  constructor() {
    this.initializeGames();
    this.initializeEventListeners();
    this.loadStats();
    this.loadScores();
  }

  private initializeGames(): void {
    MINI_GAMES.forEach(game => {
      this.games.set(game.id, { ...game });
    });
  }

  private initializeEventListeners(): void {
    Object.values(MINI_GAME_EVENTS).forEach(event => {
      this.eventListeners.set(event, []);
    });
  }

  private loadStats(): void {
    const defaultStats: MiniGameStats = {
      totalGamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      bestScores: {},
      achievements: [],
      timeSpent: 0,
      winRate: 0
    };

    const stored = localStorage.getItem('freeflow_minigame_stats');
    if (stored) {
      try {
        this.stats = { ...defaultStats, ...JSON.parse(stored) };
      } catch (error) {
        console.error('Failed to load mini-game stats:', error);
        this.stats = defaultStats;
      }
    } else {
      this.stats = defaultStats;
    }
  }

  private saveStats(): void {
    localStorage.setItem('freeflow_minigame_stats', JSON.stringify(this.stats));
  }

  private loadScores(): void {
    const stored = localStorage.getItem('freeflow_minigame_scores');
    if (stored) {
      try {
        const scoresData = JSON.parse(stored);
        Object.entries(scoresData).forEach(([gameId, scores]) => {
          this.scores.set(gameId, (scores as MiniGameScore[]).map(score => ({
            ...score,
            timestamp: new Date(score.timestamp)
          })));
        });
      } catch (error) {
        console.error('Failed to load mini-game scores:', error);
      }
    }
  }

  private saveScores(): void {
    const scoresData: Record<string, MiniGameScore[]> = {};
    this.scores.forEach((scores, gameId) => {
      scoresData[gameId] = scores;
    });
    localStorage.setItem('freeflow_minigame_scores', JSON.stringify(scoresData));
  }

  public startGame(gameId: string, userId: string): MiniGameSession {
    const game = this.games.get(gameId);
    if (!game || !game.isActive) {
      throw new Error('Game not found or inactive');
    }

    if (this.currentSession) {
      throw new Error('A game is already in progress');
    }

    const session: MiniGameSession = {
      id: this.generateSessionId(),
      userId,
      gameId,
      startTime: new Date(),
      score: 0,
      level: 1,
      isCompleted: false,
      data: this.initializeGameData(game.type)
    };

    this.currentSession = session;
    this.emit(MINI_GAME_EVENTS.GAME_STARTED, session);
    return session;
  }

  public completeGame(score: number, time: number, accuracy?: number): MiniGameScore | null {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }

    const game = this.games.get(this.currentSession.gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const gameScore: MiniGameScore = {
      id: this.generateScoreId(),
      userId: this.currentSession.userId,
      username: 'Player', // This should come from auth
      gameId: this.currentSession.gameId,
      score,
      time,
      accuracy,
      level: this.currentSession.level,
      timestamp: new Date(),
      isHighScore: false
    };

    // Check if it's a high score
    const existingScores = this.scores.get(gameScore.gameId) || [];
    const isHighScore = existingScores.length === 0 || score > Math.max(...existingScores.map(s => s.score));
    gameScore.isHighScore = isHighScore;

    // Add score
    existingScores.push(gameScore);
    existingScores.sort((a, b) => b.score - a.score); // Sort by score descending
    this.scores.set(gameScore.gameId, existingScores);

    // Update stats
    this.updateStats(gameScore);

    // Update leaderboard
    this.updateLeaderboard(gameScore.gameId);

    // Complete session
    this.currentSession.endTime = new Date();
    this.currentSession.isCompleted = true;
    this.currentSession.score = score;

    this.emit(MINI_GAME_EVENTS.GAME_COMPLETED, { session: this.currentSession, score: gameScore });
    this.emit(MINI_GAME_EVENTS.SCORE_UPDATED, gameScore);

    const completedSession = this.currentSession;
    this.currentSession = null;

    this.saveScores();
    this.saveStats();

    return gameScore;
  }

  public pauseGame(): void {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }
    this.emit(MINI_GAME_EVENTS.GAME_PAUSED, this.currentSession);
  }

  public resumeGame(): void {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }
    this.emit(MINI_GAME_EVENTS.GAME_RESUMED, this.currentSession);
  }

  public updateScore(score: number): void {
    if (!this.currentSession) {
      return;
    }
    this.currentSession.score = score;
    this.emit(MINI_GAME_EVENTS.SCORE_UPDATED, { session: this.currentSession, score });
  }

  public completeLevel(): void {
    if (!this.currentSession) {
      return;
    }
    this.currentSession.level++;
    this.emit(MINI_GAME_EVENTS.LEVEL_COMPLETED, this.currentSession);
  }

  private initializeGameData(gameType: string): any {
    switch (gameType) {
      case 'memory':
        return this.initializeMemoryGame();
      case 'puzzle':
        return this.initializePuzzleGame();
      case 'reaction':
        return this.initializeReactionGame();
      default:
        return {};
    }
  }

  private initializeMemoryGame(): MemoryGameData {
    const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎨'];
    const cards = [...symbols, ...symbols].map((symbol, index) => ({
      id: `card_${index}`,
      value: symbol,
      isFlipped: false,
      isMatched: false
    }));

    // Shuffle cards
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return {
      cards,
      moves: 0,
      matches: 0,
      timeLimit: 120
    };
  }

  private initializePuzzleGame(): PuzzleGameData {
    const pieces = [];
    const gridSize = 3;
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        pieces.push({
          id: `piece_${x}_${y}`,
          position: { x: Math.random() * 300, y: Math.random() * 300 },
          correctPosition: { x: x * 100, y: y * 100 },
          isPlaced: false
        });
      }
    }

    return {
      pieces,
      moves: 0,
      timeLimit: 180
    };
  }

  private initializeReactionGame(): ReactionGameData {
    return {
      targets: [],
      hits: 0,
      misses: 0,
      averageReactionTime: 0,
      timeLimit: 60
    };
  }

  private updateStats(score: MiniGameScore): void {
    this.stats.totalGamesPlayed++;
    this.stats.totalScore += score.score;
    this.stats.averageScore = this.stats.totalScore / this.stats.totalGamesPlayed;

    // Update best score for this game
    const currentBest = this.stats.bestScores[score.gameId] || 0;
    if (score.score > currentBest) {
      this.stats.bestScores[score.gameId] = score.score;
    }

    // Update time spent (rough estimate)
    this.stats.timeSpent += score.time / 60; // Convert to minutes

    // Update win rate (simplified - consider high score as win)
    const gameScores = this.scores.get(score.gameId) || [];
    const totalScores = gameScores.length;
    const highScores = gameScores.filter(s => s.isHighScore).length;
    this.stats.winRate = totalScores > 0 ? (highScores / totalScores) * 100 : 0;
  }

  private updateLeaderboard(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    const scores = this.scores.get(gameId) || [];
    const topScores = scores.slice(0, 10); // Top 10

    const leaderboard: MiniGameLeaderboard = {
      gameId,
      gameName: game.name,
      scores: topScores,
      timeRange: 'all-time',
      lastUpdated: new Date()
    };

    this.leaderboards.set(gameId, leaderboard);
    this.emit(MINI_GAME_EVENTS.LEADERBOARD_UPDATED, leaderboard);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateScoreId(): string {
    return `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public getters
  public getGames(): MiniGame[] {
    return Array.from(this.games.values()).filter(game => game.isActive);
  }

  public getGame(gameId: string): MiniGame | undefined {
    return this.games.get(gameId);
  }

  public getCurrentSession(): MiniGameSession | null {
    return this.currentSession;
  }

  public getScores(gameId: string): MiniGameScore[] {
    return this.scores.get(gameId) || [];
  }

  public getLeaderboard(gameId: string): MiniGameLeaderboard | undefined {
    return this.leaderboards.get(gameId);
  }

  public getAllLeaderboards(): MiniGameLeaderboard[] {
    return Array.from(this.leaderboards.values());
  }

  public getStats(): MiniGameStats {
    return { ...this.stats };
  }

  public getBestScore(gameId: string): number {
    return this.stats.bestScores[gameId] || 0;
  }

  public getRank(gameId: string, score: number): number {
    const scores = this.scores.get(gameId) || [];
    const betterScores = scores.filter(s => s.score > score).length;
    return betterScores + 1;
  }

  // Event system
  public on(event: MiniGameEventType, callback: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(callback);
    this.eventListeners.set(event, listeners);
  }

  public off(event: MiniGameEventType, callback: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    this.eventListeners.set(event, listeners);
  }

  private emit(event: MiniGameEventType, data?: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  public resetStats(): void {
    this.stats = {
      totalGamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      bestScores: {},
      achievements: [],
      timeSpent: 0,
      winRate: 0
    };
    this.saveStats();
  }

  public resetScores(): void {
    this.scores.clear();
    this.leaderboards.clear();
    this.saveScores();
  }
}

// Singleton instance
export const miniGameService = new MiniGameService();
