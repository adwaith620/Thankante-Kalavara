import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';
import { Volume2, VolumeX } from 'lucide-react';

export const RandomizedVolume = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  const [volume, setVolume] = useState(50);
  const [target, setTarget] = useState(Math.floor(Math.random() * 100));
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [swapped, setSwapped] = useState(false);
  const [flashSwap, setFlashSwap] = useState(false);
  const clickCountRef = useRef(0);

  useEffect(() => {
    recordAttempt();
  }, []);

  // Timer
  useEffect(() => {
    if (hasWon || isLost) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsLost(true);
          recordFailure();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [hasWon, isLost]);

  const handleButton = (type: 'up' | 'down') => {
    if (hasWon || isLost) return;
    
    clickCountRef.current += 1;
    const newClicks = clicks + 1;
    setClicks(newClicks);
    
    if (newClicks >= 25) {
      setIsLost(true);
      recordFailure();
      return;
    }

    // Swap buttons every 5 clicks
    if (clickCountRef.current % 5 === 0) {
      setSwapped(prev => !prev);
      setFlashSwap(true);
      setTimeout(() => setFlashSwap(false), 300);
    }

    // Determine actual direction (may be swapped)
    const actualType = swapped ? (type === 'up' ? 'down' : 'up') : type;
    
    let change: number;
    if (actualType === 'up') {
      // Tends to increase, but 20% chance of decrease
      change = Math.random() < 0.2 
        ? -(Math.floor(Math.random() * 11) + 5) 
        : (Math.floor(Math.random() * 30) + 1);
    } else {
      // Tends to decrease, but 20% chance of increase
      change = Math.random() < 0.2 
        ? (Math.floor(Math.random() * 11) + 5) 
        : -(Math.floor(Math.random() * 30) + 1);
    }
    
    // Wrapping volume
    let newVolume = volume + change;
    if (newVolume > 100) newVolume = newVolume - 100;
    if (newVolume < 0) newVolume = 100 + newVolume;
    newVolume = Math.max(0, Math.min(100, newVolume));
    
    setVolume(newVolume);
    
    // Must be EXACT
    if (newVolume === target) {
      setHasWon(true);
      completeGame('randomized-volume');
    }
  };

  const handleReset = () => {
    setVolume(50);
    setTarget(Math.floor(Math.random() * 100));
    setHasWon(false);
    setIsLost(false);
    setClicks(0);
    setTimeLeft(30);
    setSwapped(false);
    clickCountRef.current = 0;
  };

  const getStatusMessage = () => {
    if (hasWon) return "Miraculous! You matched the target volume.";
    if (isLost && clicks >= 25) return "You clicked too many times. Deafness achieved.";
    if (isLost) return "Time expired. Silence reigns.";
    return `Match EXACT volume. Clicks: ${clicks}/25 | Time: ${timeLeft}s`;
  };

  const upButton = (
    <button 
      onClick={() => handleButton('up')}
      disabled={hasWon || isLost}
      className={`w-24 h-24 rounded-full bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 flex items-center justify-center transition-transform active:scale-90 ${flashSwap ? 'ring-2 ring-yellow-500 animate-pulse' : ''}`}
    >
      <Volume2 size={32} />
    </button>
  );

  const downButton = (
    <button 
      onClick={() => handleButton('down')}
      disabled={hasWon || isLost}
      className={`w-24 h-24 rounded-full bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 flex items-center justify-center transition-transform active:scale-90 ${flashSwap ? 'ring-2 ring-yellow-500 animate-pulse' : ''}`}
    >
      <VolumeX size={32} />
    </button>
  );

  return (
    <GameLayout 
      gameId="randomized-volume"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="flex flex-col items-center justify-center py-12 w-full max-w-xl mx-auto text-center font-mono">
        <div className="flex w-full justify-between mb-8">
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded w-28">
            <div className="text-zinc-500 text-xs mb-1">TARGET</div>
            <div className="text-3xl text-green-400 font-bold">{target}%</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded w-28">
            <div className="text-zinc-500 text-xs mb-1">TIME</div>
            <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded w-28">
            <div className="text-zinc-500 text-xs mb-1">CURRENT</div>
            <div className="text-3xl text-white font-bold">{volume}%</div>
          </div>
        </div>

        <div className="w-full h-8 bg-zinc-900 rounded-full border border-zinc-700 overflow-hidden mb-8 relative">
          <div 
            className="h-full bg-white transition-all duration-200"
            style={{ width: `${volume}%` }}
          />
          <div 
            className="absolute top-0 bottom-0 w-1 bg-green-500 z-10 shadow-[0_0_8px_#22c55e]"
            style={{ left: `${target}%` }}
          />
        </div>

        <div className="flex gap-8">
          {swapped ? <>{upButton}{downButton}</> : <>{downButton}{upButton}</>}
        </div>
        
        {flashSwap && (
          <div className="mt-4 text-yellow-400 text-sm font-bold animate-bounce">BUTTONS SWAPPED!</div>
        )}
        
        <div className="mt-6 text-xs text-zinc-500">
          CLICKS: {clicks}/25 {swapped ? '| ⚠ CONTROLS REVERSED' : ''}
        </div>
      </div>
    </GameLayout>
  );
};
