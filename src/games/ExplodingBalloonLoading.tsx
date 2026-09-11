import { useState, useEffect } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';
import { Wind } from 'lucide-react';

export const ExplodingBalloonLoading = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  
  const [progress, setProgress] = useState(0); // 0 to 100
  const [pressure, setPressure] = useState(0); // 0 to 100
  const [hasWon, setHasWon] = useState(false);
  const [isPopped, setIsPopped] = useState(false);
  const [isPumping, setIsPumping] = useState(false);
  const [airSpeed, setAirSpeed] = useState(1); // multiplier
  const [isReleasing, setIsReleasing] = useState(false);

  useEffect(() => {
    recordAttempt();
  }, []);

  // Randomize air speed continuously
  useEffect(() => {
    if (hasWon || isPopped) return;
    const interval = setInterval(() => {
      // Unpredictable air speed from very slow (0.1) to extremely fast (5.0)
      setAirSpeed(0.1 + Math.random() * 4.9);
    }, 1500 + Math.random() * 2000); // Change speed unpredictably
    return () => clearInterval(interval);
  }, [hasWon, isPopped]);

  // Main physics loop
  useEffect(() => {
    if (hasWon || isPopped) return;
    
    const interval = setInterval(() => {
      if (isPumping) {
        setProgress(p => {
          const next = p + (0.5 * airSpeed);
          if (next >= 100) {
            setHasWon(true);
            completeGame('exploding-balloon-loading');
            return 100;
          }
          return next;
        });
        
        setPressure(p => {
          const next = p + (0.8 * airSpeed);
          if (next >= 100) {
            setIsPopped(true);
            recordFailure();
            return 100;
          }
          return next;
        });
      } else if (isReleasing) {
        setPressure(p => Math.max(0, p - 3));
        setProgress(p => Math.max(0, p - 0.5)); // Lose progress when releasing
      } else {
        // Natural slow decay
        setPressure(p => Math.max(0, p - 0.1));
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [isPumping, isReleasing, airSpeed, hasWon, isPopped]);

  const handleReset = () => {
    setProgress(0);
    setPressure(0);
    setHasWon(false);
    setIsPopped(false);
    setIsPumping(false);
    setIsReleasing(false);
    setAirSpeed(1);
  };

  const getStatusMessage = () => {
    if (hasWon) return "Loading complete. Balloon intact.";
    if (isPopped) return "OVERPRESSURE. FATAL POP EXCEPTION.";
    if (pressure > 80) return `WARNING: CRITICAL PRESSURE! (Air Speed: ${airSpeed.toFixed(1)}x)`;
    return `Hold PUMP to load data. Air Speed fluctuates wildly: ${airSpeed.toFixed(1)}x`;
  };

  return (
    <GameLayout 
      gameId="exploding-balloon-loading"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isPopped ? 'error' : (pressure > 80 ? 'warning' : 'info'))}
    >
      <div className="flex flex-col items-center py-8 w-full max-w-2xl mx-auto font-mono select-none">
        
        <div className="w-full flex justify-between mb-8 px-4 text-center">
          <div>
            <div className="text-zinc-500 text-xs mb-1">DATA LOADED</div>
            <div className="text-3xl text-white font-bold">{progress}%</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs mb-1">INTERNAL PRESSURE</div>
            <div className={`text-3xl font-bold ${pressure > 80 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`}>
              {pressure}%
            </div>
          </div>
        </div>

        <div className="w-full h-2 bg-zinc-800 rounded-full mb-16 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${hasWon ? 'bg-green-500' : 'bg-white'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center mb-16">
          {!isPopped ? (
            <div 
              className={`rounded-full bg-red-500 border-4 border-red-700 flex items-center justify-center shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.3)] transition-all duration-200 ${pressure > 85 ? 'animate-shake' : ''}`}
              style={{ 
                width: `${100 + pressure * 1.5}px`,
                height: `${100 + pressure * 1.5}px`,
                transformOrigin: 'bottom center'
              }}
            >
              <div className="absolute top-4 left-4 w-1/4 h-1/4 bg-white rounded-full opacity-30 blur-sm" />
              {/* Balloon knot */}
              <div className="absolute -bottom-3 w-4 h-4 bg-red-600 rounded-sm" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center relative">
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-4 h-4 bg-red-500 rounded-sm"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-80px)`,
                    opacity: 0.5
                  }}
                />
              ))}
              <div className="text-6xl animate-ping">💥</div>
            </div>
          )}
        </div>

        <div className="flex gap-6 w-full justify-center">
          <button 
            onPointerDown={() => setIsReleasing(true)}
            onPointerUp={() => setIsReleasing(false)}
            onPointerLeave={() => setIsReleasing(false)}
            disabled={hasWon || isPopped}
            className="w-32 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-transform active:scale-95 flex flex-col items-center gap-2 select-none"
            style={{ touchAction: 'none' }}
          >
            <Wind size={24} />
            <span className="text-xs">RELEASE VALVE</span>
          </button>
          
          <button 
            onPointerDown={() => setIsPumping(true)}
            onPointerUp={() => setIsPumping(false)}
            onPointerLeave={() => setIsPumping(false)}
            disabled={hasWon || isPopped}
            className="w-48 py-4 bg-zinc-200 hover:bg-white text-black disabled:opacity-50 font-black rounded-lg transition-transform active:scale-95 text-xl select-none"
            style={{ touchAction: 'none' }}
          >
            HOLD TO PUMP
          </button>
        </div>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) scale(1.05); }
          25% { transform: translateX(-5px) scale(1.05); }
          50% { transform: translateX(5px) scale(1.05); }
          75% { transform: translateX(-5px) scale(1.05); }
        }
        .animate-shake {
          animation: shake 0.2s infinite;
        }
      `}</style>
    </GameLayout>
  );
};
