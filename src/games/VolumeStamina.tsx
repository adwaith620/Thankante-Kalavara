import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

export const VolumeStamina = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  const [volume, setVolume] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isActive, setIsActive] = useState(false);
  const [clicks, setClicks] = useState(0);
  
  const lastClickTime = useRef<number>(Date.now());
  const decayRate = useRef<number>(0.2);

  useEffect(() => {
    recordAttempt();
  }, []);

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


  useEffect(() => {
    if (hasWon || !isActive) return;

    const interval = setInterval(() => {
      setVolume(prev => {
        if (prev <= 0) return 0;
        
        // Decay gets stronger the higher the volume
        const decay = decayRate.current + (prev * 0.015);
        const next = Math.max(0, prev - decay);
        return Number(next.toFixed(2));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, hasWon]);

  const handleHit = () => {
    if (hasWon || isLost) return;
    if (!isActive) setIsActive(true);
    
    const newClicks = clicks + 1;
    setClicks(newClicks);
    
    const now = Date.now();
    const diff = now - lastClickTime.current;
    lastClickTime.current = now;
    
    // Reward fast clicks
    let boost = diff < 100 ? 3 : diff < 300 ? 2 : 1;
    
    // Diminishing returns after 100 clicks
    if (newClicks > 100) {
      boost *= 0.5;
    }
    if (newClicks > 200) {
      boost *= 0.3;
    }
    
    setVolume(prev => {
      const next = prev + boost;
      if (next >= 100) {
        setHasWon(true);
        setIsActive(false);
        completeGame('volume-stamina');
        return 100;
      }
      return next;
    });
  };

  const handleReset = () => {
    setVolume(0);
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(30);
    setIsActive(false);
    setClicks(0);
    decayRate.current = 0.2;
  };

  const getStatusMessage = () => {
    if (isLost) return "Time is up. You failed.";
    if (hasWon) return "Incredible stamina. Your speakers are now blown.";
    if (!isActive) return "Reach 100% volume. Don't stop clicking.";
    if (volume > 80) return "ALMOST THERE KEEP GOING!!";
    if (volume > 50) return "Halfway there... don't slow down!";
    return `The silence is fighting back. Time: ${timeLeft}s`;
  };

  return (
    <GameLayout 
      gameId="volume-stamina"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="flex flex-col items-center justify-center py-8 w-full max-w-xl mx-auto font-mono touch-none select-none">
        
        <div className="w-full text-center mb-12">
          <div className="text-zinc-500 text-sm mb-2">VOLUME THRESHOLD</div>
          <div className={`text-6xl font-black ${hasWon ? 'text-green-500' : 'text-white'}`}>
            {Math.floor(volume)}%
          </div>
        </div>

        {/* The Bar */}
        <div className="w-full h-8 bg-zinc-900 border border-zinc-700 rounded-full overflow-hidden mb-12 relative">
          <div 
            className={`h-full transition-all duration-75 ${hasWon ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${volume}%` }}
          />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white" />
        </div>

        <button
          onPointerDown={handleHit}
          className={`w-48 h-48 rounded-full border-4 font-black text-4xl transform transition-transform active:scale-90 ${
            hasWon 
              ? 'bg-zinc-800 border-green-500 text-green-500 pointer-events-none' 
              : 'bg-red-600 border-red-800 text-white hover:bg-red-500'
          }`}
        >
          {hasWon ? 'MAX' : 'HIT'}
        </button>
        
        <div className="mt-8 text-zinc-600 text-xs text-center">
          <div>TOTAL CLICKS: {clicks}</div>
          <div>WARNING: MAY CAUSE FATIGUE</div>
        </div>
      </div>
    </GameLayout>
  );
};
