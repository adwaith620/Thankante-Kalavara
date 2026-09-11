import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

export const EmojiEarCovering = () => {
  const { recordAttempt, completeGame, recordFailure } = useStore();
  const [targetVolume] = useState(Math.floor(Math.random() * 80) + 10);
  const [currentVolume, setCurrentVolume] = useState(100);
  const [hasWon, setHasWon] = useState(false);
  const [activeHand, setActiveHand] = useState<'left' | 'right' | null>(null);
  
  // Hand positions from 0 (ear covered) to 100 (far away)
  const [leftHandDist, setLeftHandDist] = useState(100);
  const [rightHandDist, setRightHandDist] = useState(100);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const [timeLeft, setTimeLeft] = useState(20);
  const [isLost, setIsLost] = useState(false);

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

  // Calculate volume based on hand distance
  useEffect(() => {
    if (hasWon || isLost) return;
    // Volume is average distance of hands from ears
    const newVol = Math.floor((leftHandDist + rightHandDist) / 2);
    setCurrentVolume(newVol);
    
    // Check win condition (must hold it for a tiny bit to be annoying but fair)
    if (Math.abs(newVol - targetVolume) <= 1) {
      setHasWon(true);
      completeGame('emoji-ear-covering');
    }
  }, [leftHandDist, rightHandDist, targetVolume, hasWon, isLost]);

  const handlePointerDown = (hand: 'left' | 'right') => (e: React.PointerEvent) => {
    e.preventDefault();
    if (hasWon || isLost) return;
    setActiveHand(hand);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeHand || hasWon || isLost || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const x = e.clientX - rect.left;
    
    if (activeHand === 'left') {
      const earX = centerX - 80;
      let dist = Math.abs(x - earX) * 1.5;
      if (dist > 100) dist = 100;
      if (dist < 0) dist = 0;
      setLeftHandDist(dist);
    } else {
      const earX = centerX + 80;
      let dist = Math.abs(x - earX) * 1.5;
      if (dist > 100) dist = 100;
      if (dist < 0) dist = 0;
      setRightHandDist(dist);
    }
  };

  const handlePointerUp = () => {
    setActiveHand(null);
  };

  const handleReset = () => {
    setLeftHandDist(100);
    setRightHandDist(100);
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(20);
  };

  const getStatusMessage = () => {
    if (hasWon) return "Perfect acoustic dampening achieved.";
    if (isLost) return "Time's up. The eardrums have shattered.";
    return `Cover its ears to lower the volume. Time remaining: ${timeLeft}s`;
  };

  // Face reaction based on volume
  const getFace = () => {
    if (hasWon) return "😌";
    if (isLost) return "💀";
    if (currentVolume > 80) return "😫";
    if (currentVolume > 50) return "😬";
    if (currentVolume > 20) return "😐";
    return "😴";
  };

  return (
    <GameLayout 
      gameId="emoji-ear-covering"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div 
        ref={containerRef}
        className="flex flex-col items-center py-8 w-full max-w-2xl mx-auto font-mono touch-none select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="flex w-full justify-between px-8 mb-16 text-center">
          <div>
            <div className="text-zinc-500 text-xs mb-1">TARGET VOL</div>
            <div className="text-3xl text-green-400 font-bold">{targetVolume}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs mb-1">CURRENT VOL</div>
            <div className="text-3xl text-white font-bold">{currentVolume}</div>
          </div>
        </div>

        {/* Emoji Area */}
        <div className="relative w-64 h-64 flex items-center justify-center bg-zinc-900 rounded-full border-4 border-zinc-700 shadow-2xl mb-8">
          <div className="text-9xl relative z-10 transition-transform duration-200" style={{ transform: `scale(${1 + currentVolume/200})` }}>
            {getFace()}
          </div>
          
          {/* Left Hand */}
          <div 
            onPointerDown={handlePointerDown('left')}
            className={`absolute top-1/2 -translate-y-1/2 w-20 h-24 bg-yellow-400 rounded-[40px] shadow-lg flex items-center justify-center text-4xl cursor-grab active:cursor-grabbing transition-transform ${activeHand === 'left' ? 'scale-110 rotate-12' : ''}`}
            style={{ 
              left: `${-50 - leftHandDist}px`,
              zIndex: 20
            }}
          >
            🖐️
          </div>

          {/* Right Hand */}
          <div 
            onPointerDown={handlePointerDown('right')}
            className={`absolute top-1/2 -translate-y-1/2 w-20 h-24 bg-yellow-400 rounded-[40px] shadow-lg flex items-center justify-center text-4xl cursor-grab active:cursor-grabbing transition-transform ${activeHand === 'right' ? 'scale-110 -rotate-12' : ''} scale-x-[-1]`}
            style={{ 
              right: `${-50 - rightHandDist}px`,
              zIndex: 20
            }}
          >
            🖐️
          </div>
        </div>
        
        <p className="text-xs text-zinc-500 mt-8 max-w-xs text-center">
          Drag the hands horizontally closer or further from the ears to adjust acoustic dampening.
        </p>
      </div>
    </GameLayout>
  );
};
