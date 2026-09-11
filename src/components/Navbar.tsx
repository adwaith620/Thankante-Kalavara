import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GAMES } from '../lib/constants';
import { useStore } from '../lib/store';
import { syncLeaderboard } from '../lib/leaderboard';
import { RotateCcw } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stats, resetAll } = useStore();
  
  const handleRandom = () => {
    const uncompleted = GAMES.filter(g => !stats.gamesCompleted.includes(g.id));
    const targetList = uncompleted.length > 0 ? uncompleted : GAMES;
    const randomGame = targetList[Math.floor(Math.random() * targetList.length)];
    navigate(randomGame.path);
  };

  useEffect(() => {
    if (stats.sessionStartTime && stats.gamesCompleted.length > 0) {
      const timeMs = stats.sessionEndTime 
        ? (stats.sessionEndTime - stats.sessionStartTime) 
        : (Date.now() - stats.sessionStartTime);
      syncLeaderboard(stats.sessionId, stats.playerName, timeMs, stats.gamesCompleted.length).catch(console.error);
    }
  }, [stats.gamesCompleted.length, stats.sessionEndTime, stats.playerName, stats.sessionId, stats.sessionStartTime]);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-black tracking-tighter text-xl flex items-center gap-2">
          <span className="text-green-500">{"{"}</span>
          THANKANTE KALAVARA
          <span className="text-green-500">{"}"}</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 font-mono text-sm">
          <Link 
            to="/" 
            className={`hover:text-green-400 transition-colors ${location.pathname === '/' ? 'text-green-500' : 'text-zinc-400'}`}
          >
            HOME
          </Link>
          <Link 
            to="/games" 
            className={`hover:text-green-400 transition-colors ${location.pathname === '/games' ? 'text-green-500' : 'text-zinc-400'}`}
          >
            GAMES
          </Link>
          <Link 
            to="/certificate" 
            className={`hover:text-green-400 transition-colors ${location.pathname === '/certificate' ? 'text-green-500' : 'text-zinc-400'}`}
          >
            CERTIFICATE
          </Link>
          <Link 
            to="/leaderboard" 
            className={`hover:text-green-400 transition-colors ${location.pathname === '/leaderboard' ? 'text-green-500' : 'text-zinc-400'}`}
          >
            LEADERBOARD
          </Link>
          
          <button 
            onClick={handleRandom}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors"
          >
            RANDOM
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to reset EVERYTHING? Time, progress, and trophies will be lost.')) {
                resetAll();
                navigate('/');
              }
            }}
            className="hidden md:flex items-center gap-1 font-mono text-xs px-2 py-1 bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50 rounded transition-colors"
            title="Reset everything"
          >
            <RotateCcw size={12} /> RESET
          </button>
          {(stats.sessionStartTime) && (
            <div className="font-mono text-xs text-zinc-400">
              TIME: <TimerDisplay startTime={stats.sessionStartTime} endTime={stats.sessionEndTime} />
            </div>
          )}
          <div className="font-mono text-xs border border-zinc-800 px-3 py-1.5 rounded-full bg-black">
            <span className="text-zinc-500 mr-2">TROPHIES:</span>
            <span className={stats.gamesCompleted.length === GAMES.length ? 'text-green-400' : 'text-white'}>
              {stats.gamesCompleted.length}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

const TimerDisplay = ({ startTime, endTime }: { startTime: number, endTime: number | null }) => {
  const [now, setNow] = useState(endTime || Date.now());

  useEffect(() => {
    if (endTime) {
      setNow(endTime);
      return;
    }
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, [endTime]);

  const elapsed = Math.floor((now - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');
  
  return <span className="text-white">{minutes}:{seconds}</span>;
};
