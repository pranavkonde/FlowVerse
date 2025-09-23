'use client';

import { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Clock, 
  Star, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Target, 
  Zap,
  Brain,
  Puzzle,
  Coins,
  Award,
  TrendingUp,
  Users
} from 'lucide-react';
import { 
  MiniGame, 
  MiniGameScore, 
  MiniGameLeaderboard, 
  MiniGameSession,
  MINI_GAME_EVENTS 
} from '@/types/minigames';
import { miniGameService } from '@/services/MiniGameService';

interface MiniGamesProps {
  isVisible: boolean;
  onToggle: () => void;
  userId: string;
}

export default function MiniGames({ isVisible, onToggle, userId }: MiniGamesProps) {
  const [games, setGames] = useState<MiniGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [currentSession, setCurrentSession] = useState<MiniGameSession | null>(null);
  const [leaderboards, setLeaderboards] = useState<MiniGameLeaderboard[]>([]);
  const [activeTab, setActiveTab] = useState<'games' | 'leaderboard' | 'play'>('games');
  const [gameData, setGameData] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setGames(miniGameService.getGames());
    setLeaderboards(miniGameService.getAllLeaderboards());
    
    // Set up event listeners
    const handleGameStarted = (session: MiniGameSession) => {
      setCurrentSession(session);
      setGameData(session.data);
      setScore(0);
      setTimeLeft(session.data.timeLimit || 60);
      setIsPlaying(true);
      setActiveTab('play');
    };

    const handleGameCompleted = (data: { session: MiniGameSession; score: MiniGameScore }) => {
      setCurrentSession(null);
      setGameData(null);
      setIsPlaying(false);
      setActiveTab('leaderboard');
      setLeaderboards(miniGameService.getAllLeaderboards());
    };

    const handleScoreUpdated = (data: { session: MiniGameSession; score: number }) => {
      setScore(data.score);
    };

    const handleLeaderboardUpdated = (leaderboard: MiniGameLeaderboard) => {
      setLeaderboards(miniGameService.getAllLeaderboards());
    };

    miniGameService.on(MINI_GAME_EVENTS.GAME_STARTED, handleGameStarted);
    miniGameService.on(MINI_GAME_EVENTS.GAME_COMPLETED, handleGameCompleted);
    miniGameService.on(MINI_GAME_EVENTS.SCORE_UPDATED, handleScoreUpdated);
    miniGameService.on(MINI_GAME_EVENTS.LEADERBOARD_UPDATED, handleLeaderboardUpdated);

    return () => {
      miniGameService.off(MINI_GAME_EVENTS.GAME_STARTED, handleGameStarted);
      miniGameService.off(MINI_GAME_EVENTS.GAME_COMPLETED, handleGameCompleted);
      miniGameService.off(MINI_GAME_EVENTS.SCORE_UPDATED, handleScoreUpdated);
      miniGameService.off(MINI_GAME_EVENTS.LEADERBOARD_UPDATED, handleLeaderboardUpdated);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleGameEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const handleStartGame = (game: MiniGame) => {
    try {
      miniGameService.startGame(game.id, userId);
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const handleGameEnd = () => {
    if (currentSession) {
      miniGameService.completeGame(score, currentSession.data.timeLimit - timeLeft);
    }
  };

  const handlePauseGame = () => {
    miniGameService.pauseGame();
    setIsPlaying(false);
  };

  const handleResumeGame = () => {
    miniGameService.resumeGame();
    setIsPlaying(true);
  };

  const getGameIcon = (type: string) => {
    switch (type) {
      case 'memory': return <Brain className="w-6 h-6" />;
      case 'puzzle': return <Puzzle className="w-6 h-6" />;
      case 'reaction': return <Zap className="w-6 h-6" />;
      case 'trivia': return <Target className="w-6 h-6" />;
      default: return <Gamepad2 className="w-6 h-6" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderGameCard = (game: MiniGame) => (
    <div key={game.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{game.icon}</div>
          <div>
            <h3 className="text-white font-medium text-lg">{game.name}</h3>
            <p className="text-slate-300 text-sm">{game.description}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${getDifficultyColor(game.difficulty)}`}>
          <span className="capitalize">{game.difficulty}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{formatTime(game.duration)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4" />
          <span>Max: {game.maxScore}</span>
        </div>
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4" />
          <span>{game.rewards.tokens} tokens</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Best Score: {miniGameService.getBestScore(game.id) || 0}
        </div>
        <button
          onClick={() => handleStartGame(game)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Play
        </button>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-6">
      {leaderboards.map(leaderboard => (
        <div key={leaderboard.gameId} className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white font-medium text-lg">{leaderboard.gameName}</h3>
          </div>
          
          <div className="space-y-2">
            {leaderboard.scores.slice(0, 5).map((score, index) => (
              <div key={score.id} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-white text-sm">{score.username}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-300">{score.score}</span>
                  <span className="text-slate-400">{formatTime(score.time)}</span>
                  {score.isHighScore && <Award className="w-4 h-4 text-yellow-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderGamePlay = () => {
    if (!currentSession || !gameData) return null;

    const game = miniGameService.getGame(currentSession.gameId);
    if (!game) return null;

    return (
      <div className="space-y-4">
        {/* Game Header */}
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{game.icon}</div>
              <div>
                <h3 className="text-white font-medium text-lg">{game.name}</h3>
                <p className="text-slate-300 text-sm">Level {currentSession.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-white font-bold text-xl">{score}</div>
                <div className="text-slate-400 text-xs">Score</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-xl">{formatTime(timeLeft)}</div>
                <div className="text-slate-400 text-xs">Time</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <button
                onClick={handlePauseGame}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            ) : (
              <button
                onClick={handleResumeGame}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
              >
                <Play className="w-4 h-4" />
                Resume
              </button>
            )}
            <button
              onClick={handleGameEnd}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              End Game
            </button>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-slate-800 p-6 rounded-lg min-h-96">
          {game.type === 'memory' && renderMemoryGame()}
          {game.type === 'puzzle' && renderPuzzleGame()}
          {game.type === 'reaction' && renderReactionGame()}
          {game.type === 'trivia' && renderTriviaGame()}
        </div>
      </div>
    );
  };

  const renderMemoryGame = () => {
    if (!gameData) return null;
    
    return (
      <div className="grid grid-cols-4 gap-2">
        {gameData.cards.map((card: any) => (
          <button
            key={card.id}
            onClick={() => handleMemoryCardClick(card)}
            className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl transition-all ${
              card.isFlipped 
                ? 'bg-blue-500 border-blue-400' 
                : 'bg-slate-700 border-slate-600 hover:border-slate-500'
            }`}
          >
            {card.isFlipped && card.value}
          </button>
        ))}
      </div>
    );
  };

  const renderPuzzleGame = () => {
    if (!gameData) return null;
    
    return (
      <div className="space-y-4">
        <div className="text-center text-slate-300">
          Drag pieces to their correct positions
        </div>
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {gameData.pieces.map((piece: any) => (
            <div
              key={piece.id}
              className={`w-20 h-20 border-2 rounded ${
                piece.isPlaced 
                  ? 'bg-green-500 border-green-400' 
                  : 'bg-slate-600 border-slate-500'
              }`}
            >
              {piece.id}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReactionGame = () => {
    if (!gameData) return null;
    
    return (
      <div className="text-center space-y-4">
        <div className="text-slate-300">
          Click targets as they appear!
        </div>
        <div className="relative w-64 h-64 mx-auto bg-slate-700 rounded-lg">
          {gameData.targets.map((target: any) => (
            <button
              key={target.id}
              onClick={() => handleReactionTargetClick(target)}
              className={`absolute w-8 h-8 rounded-full ${target.color} border-2 border-white`}
              style={{
                left: target.position.x,
                top: target.position.y
              }}
            />
          ))}
        </div>
        <div className="text-slate-400 text-sm">
          Hits: {gameData.hits} | Misses: {gameData.misses}
        </div>
      </div>
    );
  };

  const renderTriviaGame = () => {
    return (
      <div className="text-center text-slate-300">
        Trivia game implementation coming soon!
      </div>
    );
  };

  const handleMemoryCardClick = (card: any) => {
    // Simplified memory game logic
    if (!card.isFlipped && !card.isMatched) {
      card.isFlipped = true;
      setGameData({ ...gameData });
      setScore(score + 10);
      miniGameService.updateScore(score + 10);
    }
  };

  const handleReactionTargetClick = (target: any) => {
    // Simplified reaction game logic
    setScore(score + 50);
    miniGameService.updateScore(score + 50);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-xl font-bold">Mini Games</h2>
          </div>
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-slate-700/50 p-4 border-b border-slate-600">
          <div className="flex gap-2">
            {['games', 'leaderboard', 'play'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tab === 'play' ? 'Playing' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'games' && (
            <div className="space-y-4">
              {games.map(renderGameCard)}
            </div>
          )}
          
          {activeTab === 'leaderboard' && renderLeaderboard()}
          
          {activeTab === 'play' && renderGamePlay()}
        </div>
      </div>
    </div>
  );
}
