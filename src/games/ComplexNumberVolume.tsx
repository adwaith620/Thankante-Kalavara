import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

export const ComplexNumberVolume = () => {
  const { recordAttempt, completeGame , recordFailure } = useStore();
  
  const [targetReal] = useState(Math.floor(Math.random() * 60) - 30);
  const [targetImag] = useState(Math.floor(Math.random() * 60) - 30);
  
  const [currentReal, setCurrentReal] = useState(0);
  const [currentImag, setCurrentImag] = useState(0);
  
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const planeRef = useRef<HTMLDivElement>(null);

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
    if (hasWon || isLost) return;
    if (currentReal === targetReal && currentImag === targetImag) {
      setHasWon(true);
      completeGame('complex-number-volume');
    }
  }, [currentReal, currentImag, targetReal, targetImag, hasWon]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (hasWon || isLost) return;
    setIsDragging(true);
    updateFromEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || hasWon) return;
    updateFromEvent(e);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const updateFromEvent = (e: React.PointerEvent) => {
    if (!planeRef.current) return;
    const rect = planeRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    if (y < 0) y = 0;
    if (y > rect.height) y = rect.height;

    // Map 0 -> width to -50 -> 50
    const real = Math.round(((x / rect.width) * 100) - 50);
    // Map 0 -> height to 50 -> -50 (y is inverted)
    const imag = Math.round((-(y / rect.height) * 100) + 50);

    setCurrentReal(real);
    setCurrentImag(imag);
  };

  const handleReset = () => {
    setCurrentReal(0);
    setCurrentImag(0);
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(45);
  };

  const formatComplex = (r: number, i: number) => {
    const sign = i < 0 ? '-' : '+';
    return `${r} ${sign} ${Math.abs(i)}i`;
  };

  const getStatusMessage = () => {
    if (isLost) return "Time is up. You failed.";
    if (hasWon) return "Mathematical perfection achieved.";
    return `Move the point to match the target. Time remaining: ${timeLeft}s`;
  };

  return (
    <GameLayout 
      gameId="complex-number-volume"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="flex flex-col items-center py-8 w-full max-w-2xl mx-auto font-mono touch-none">
        
        <div className="flex w-full justify-between px-8 mb-8 text-center gap-4">
          <div className="flex-1 bg-zinc-900 border border-zinc-700 p-4 rounded">
            <div className="text-zinc-500 text-xs mb-1 font-bold">TARGET</div>
            <div className="text-xl text-green-400 font-bold">
              z = {formatComplex(targetReal, targetImag)}
            </div>
          </div>
          <div className="flex-1 bg-zinc-900 border border-zinc-700 p-4 rounded">
            <div className="text-zinc-500 text-xs mb-1 font-bold">CURRENT VOLUME</div>
            <div className="text-xl text-white font-bold">{formatComplex(currentReal, currentImag)}</div>
          </div>
        </div>

        {/* Complex Plane */}
        <div 
          ref={planeRef}
          className="w-full max-w-[400px] aspect-square bg-zinc-950 border-2 border-zinc-700 relative overflow-hidden cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Grid lines */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-700/50" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-700/50" />
          
          <div className="absolute top-1/2 -mt-6 right-2 text-xs text-zinc-600">Re</div>
          <div className="absolute left-1/2 ml-2 top-2 text-xs text-zinc-600">Im</div>

          {/* Current point */}
          <div 
            className={`absolute w-4 h-4 rounded-full -ml-2 -mt-2 pointer-events-none transition-colors duration-150 ${hasWon ? 'bg-green-500 scale-150 shadow-[0_0_15px_#22c55e]' : 'bg-white'}`}
            style={{ 
              left: `${((currentReal + 50) / 100) * 100}%`,
              top: `${((50 - currentImag) / 100) * 100}%`
            }}
          />
        </div>
        
        <p className="text-xs text-zinc-500 mt-6 text-center">
          Real numbers control left speaker. Imaginary numbers control right speaker. Good luck.
        </p>
      </div>
    </GameLayout>
  );
};
