import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { ArrowLeft, RotateCcw, ArrowRight, Trophy, CheckCircle2, Play, AlertOctagon } from 'lucide-react';
import { GAMES } from '../lib/constants';
import { humiliatingMessages } from '../lib/humiliatingMessages';

interface GameLayoutProps {
  gameId: string;
  children: ReactNode;
  onReset?: () => void;
  statusMessage?: string | ReactNode;
  statusType?: 'info' | 'success' | 'error' | 'warning';
  showReset?: boolean;
}

export const GameLayout = ({ 
  gameId, 
  children, 
  onReset,
  statusMessage,
  statusType = 'info',
  showReset = true
}: GameLayoutProps) => {
  const navigate = useNavigate();
  const { stats, startSession, endSession } = useStore();
  const game = GAMES.find(g => g.id === gameId);
  
  const [showIntro, setShowIntro] = useState(true);
  const [lossMessage, setLossMessage] = useState("");

  const allCompleted = stats.gamesCompleted.length >= GAMES.length;

  useEffect(() => {
    // Reset intro when switching games
    setShowIntro(true);
  }, [gameId]);

  useEffect(() => {
    if (statusType === 'success' && allCompleted) {
      endSession();
    }
  }, [statusType, allCompleted, endSession]);

  useEffect(() => {
    if (statusType === 'error' && !lossMessage) {
      const msg = humiliatingMessages[Math.floor(Math.random() * humiliatingMessages.length)];
      setLossMessage(msg);
    }
    if (statusType !== 'error') {
      setLossMessage("");
    }
  }, [statusType, lossMessage]);

  if (!game) return <div>Game not found</div>;

  const statusColors = {
    info: 'text-blue-400 border-blue-400/30 bg-blue-900/20',
    success: 'text-green-400 border-green-400/30 bg-green-900/20',
    error: 'text-red-400 border-red-400/30 bg-red-900/20',
    warning: 'text-yellow-400 border-yellow-400/30 bg-yellow-900/20'
  };

  const isWin = statusType === 'success';
  const isLoss = statusType === 'error';
  const handleNextGame = () => {
    const currentIndex = GAMES.findIndex(g => g.id === gameId);
    let nextGameIndex = -1;
    
    for (let i = currentIndex + 1; i < GAMES.length; i++) {
      if (!stats.gamesCompleted.includes(GAMES[i].id)) {
        nextGameIndex = i;
        break;
      }
    }
    
    if (nextGameIndex === -1) {
      for (let i = 0; i < currentIndex; i++) {
        if (!stats.gamesCompleted.includes(GAMES[i].id)) {
          nextGameIndex = i;
          break;
        }
      }
    }

    if (nextGameIndex !== -1) {
      navigate(GAMES[nextGameIndex].path);
    } else {
      navigate('/certificate');
    }
  };

  const handleTryAgain = () => {
    if (onReset) onReset();
    setShowIntro(true);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 relative z-10">
      <div className="max-w-4xl w-full mx-auto flex-grow flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Link 
            to="/games" 
            className="flex items-center gap-2 text-zinc-400 hover:text-green-400 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-mono text-sm tracking-wider uppercase">Back to Games</span>
          </Link>
          <div className="font-mono text-zinc-500 text-sm">
            [ GAME {game.number} / {GAMES.length} ]
          </div>
        </header>

        {/* Title Area */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-2 uppercase">
            {game.title}
          </h1>
          <p className="text-zinc-400 font-mono text-sm border-l-2 border-green-500 pl-4 py-1">
            {game.description}
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && !isWin && !isLoss && !showIntro && (
          <div className={`mb-6 p-4 border rounded-md font-mono text-sm flex items-start gap-3 ${statusColors[statusType]} animate-in fade-in slide-in-from-top-4`}>
            <div>{statusMessage}</div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="flex-grow flex flex-col bg-zinc-950/60 border border-zinc-800 rounded-lg p-6 relative overflow-hidden backdrop-blur-sm">
          {!showIntro && children}

          {/* Intro Overlay */}
          {showIntro && !isWin && !isLoss && (
            <div className="absolute inset-0 z-40 bg-zinc-950 flex flex-col items-center justify-center p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-white">Game {game.number}: {game.title}</h2>
              <div className="text-zinc-400 mb-8 max-w-md bg-zinc-900 p-4 border-l-4 border-zinc-600 rounded">
                "{game.description}"
              </div>
              <div className="mb-8 max-w-md">
                <div className="text-sm text-zinc-500 mb-2 uppercase tracking-widest">How to play</div>
                <div className="text-lg text-white font-mono">{game.instruction || 'Figure it out. Good luck.'}</div>
              </div>
              <button 
                onClick={() => {
                  setShowIntro(false);
                  startSession();
                }}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-zinc-200 font-bold tracking-widest rounded transition-transform active:scale-95"
              >
                START GAME <Play size={20} className="fill-current" />
              </button>
            </div>
          )}

          {/* Completion Overlay */}
          {isWin && (
            <div className="absolute inset-0 z-50 bg-zinc-950/90 backdrop-blur flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
              <div className="text-green-500 mb-6 animate-bounce">
                {allCompleted ? <Trophy size={64} /> : <CheckCircle2 size={64} />}
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black tracking-widest text-white mb-2 text-center">
                {allCompleted ? `ALL ${GAMES.length} GAMES COMPLETED` : 'GAME COMPLETE!'}
              </h2>
              
              <p className="text-zinc-400 font-mono text-center mb-8">
                {allCompleted 
                  ? 'You survived every terrible interface.' 
                  : 'You survived another terrible interface.'}
              </p>
              
              <div className="bg-black border border-green-500/30 px-6 py-3 rounded-full font-mono text-green-400 mb-12 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                PROGRESS: {stats.gamesCompleted.length} / {GAMES.length}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                {allCompleted ? (
                  <button 
                    onClick={() => navigate('/certificate')}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-500 text-white font-bold tracking-widest rounded transition-transform active:scale-95"
                  >
                    VIEW CERTIFICATE
                  </button>
                ) : (
                  <button 
                    onClick={handleNextGame}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-500 text-white font-bold tracking-widest rounded transition-transform active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                  >
                    NEXT GAME <ArrowRight size={20} />
                  </button>
                )}
                
                <div className="flex gap-4 sm:w-auto w-full">
                  <button 
                    onClick={handleTryAgain}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-mono text-sm rounded transition-colors"
                  >
                    <RotateCcw size={16} />
                    REPLAY
                  </button>
                  
                  <button 
                    onClick={() => navigate('/games')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-mono text-sm rounded transition-colors"
                  >
                    HUB
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loss Overlay */}
          {isLoss && (
            <div className="absolute inset-0 z-50 bg-zinc-950/90 backdrop-blur flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
              <div className="text-red-500 mb-6">
                <AlertOctagon size={64} />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black tracking-widest text-red-500 mb-8 text-center">
                YOU LOST
              </h2>
              
              <div className="max-w-md text-center p-6 bg-red-950/30 border border-red-900 rounded-lg mb-12 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-900 text-white text-[10px] px-2 py-1 rounded font-bold tracking-widest">PERFORMANCE REVIEW</div>
                <p className="text-zinc-200 font-mono text-lg">"{lossMessage}"</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button 
                  onClick={handleTryAgain}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-zinc-200 hover:bg-white text-black font-bold tracking-widest rounded transition-transform active:scale-95"
                >
                  <RotateCcw size={20} />
                  TRY AGAIN
                </button>
                
                <button 
                  onClick={handleNextGame}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-bold tracking-widest rounded transition-transform active:scale-95"
                >
                  NEXT GAME <ArrowRight size={20} />
                </button>
              </div>
              <button 
                onClick={() => navigate('/games')}
                className="mt-4 text-zinc-500 hover:text-zinc-300 font-mono text-sm"
              >
                BACK TO GAMES
              </button>
            </div>
          )}
        </div>

        {/* Footer / Controls */}
        <footer className="mt-8 flex justify-end">
          {showReset && onReset && !isWin && !isLoss && !showIntro && (
            <button 
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-red-500 hover:text-red-400 text-zinc-300 font-mono text-sm rounded transition-all"
            >
              <RotateCcw size={16} />
              RESET
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
