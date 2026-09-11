import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

export const MilkGlassVolume = () => {
  const { recordAttempt, completeGame, recordFailure } = useStore();
  const [targetVolume, setTargetVolume] = useState(Math.floor(Math.random() * 40) + 40);
  const [milkLevel, setMilkLevel] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  
  const [holdTime, setHoldTime] = useState(0); // in ms
  const TARGET_HOLD_MS = 500;
  
  const pourRateRef = useRef(1.2);
  const lastUpdateRef = useRef<number>(performance.now());
  const reqRef = useRef<number>(0);

  useEffect(() => {
    recordAttempt();
    const rateInterval = window.setInterval(() => {
      pourRateRef.current = 0.5 + Math.random() * 1.5;
    }, 2000);
    return () => clearInterval(rateInterval);
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

  // Physics loop for pouring and leaking
  useEffect(() => {
    if (hasWon || isLost) return;

    const updateLoop = (time: number) => {
      const dt = time - lastUpdateRef.current;
      lastUpdateRef.current = time;

      setMilkLevel(prevLevel => {
        let newLevel = prevLevel;
        
        // Pouring increases level
        if (isPouring) {
          newLevel += pourRateRef.current * (dt / 16); // normalize to roughly 60fps
        }

        // Leakage based on proximity to target
        const diff = targetVolume - newLevel;
        if (diff < 15 && diff > -15) {
          // Aggressive leak when very close
          const leakSeverity = Math.max(0, 15 - Math.abs(diff));
          // leak rate up to 1.5 units per frame if exactly on target
          const leakRate = (leakSeverity / 15) * 1.5; 
          newLevel -= leakRate * (dt / 16);
        }

        // Overpour
        if (newLevel > targetVolume + 4) {
          // Just spill and reset, don't trigger loss
          return 0;
        }

        newLevel = Math.max(0, Math.min(100, newLevel));
        
        // Hold logic
        if (Math.abs(newLevel - targetVolume) <= 1.5) {
          setHoldTime(prev => {
            const next = prev + dt;
            if (next >= TARGET_HOLD_MS) {
              setHasWon(true);
              completeGame('milk-glass-volume');
            }
            return next;
          });
        } else {
          setHoldTime(0);
        }

        return newLevel;
      });

      reqRef.current = requestAnimationFrame(updateLoop);
    };

    lastUpdateRef.current = performance.now();
    reqRef.current = requestAnimationFrame(updateLoop);

    return () => cancelAnimationFrame(reqRef.current);
  }, [isPouring, targetVolume, hasWon, isLost]);

  const handlePointerDown = () => {
    if (hasWon || isLost) return;
    setIsPouring(true);
  };

  const handlePointerUp = () => {
    setIsPouring(false);
  };

  const handleReset = () => {
    setMilkLevel(0);
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(45);
    setIsPouring(false);
    setHoldTime(0);
    setTargetVolume(Math.floor(Math.random() * 40) + 40);
  };

  const getStatusMessage = () => {
    if (isLost && milkLevel > targetVolume + 4) return `OVERFLOW. Target was ${Math.round(targetVolume)}%, you reached ${Math.round(milkLevel)}%.`;
    if (isLost) return "Time limit exceeded. The milk has expired.";
    if (hasWon) return `Match confirmed: ${Math.round(milkLevel)}%. Perfect pour.`;
    
    if (holdTime > 0) return `HOLD IT! Leakage detected! ${Math.floor((holdTime / TARGET_HOLD_MS) * 100)}% analyzed`;
    
    const diff = Math.abs(milkLevel - targetVolume);
    if (diff < 15) return "Approaching critical level. Leakage increasing!";
    
    return `Hold POUR to add milk. Keep it at ${Math.round(targetVolume)}% for 0.5 seconds. Time: ${timeLeft}s`;
  };

  return (
    <GameLayout 
      gameId="milk-glass-volume"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : (holdTime > 0 ? 'warning' : 'info'))}
    >
      <div className="flex flex-col items-center py-6 w-full max-w-xl mx-auto font-mono select-none">
        
        <div className="flex w-full justify-between mb-4 px-4 text-center">
          <div className="bg-zinc-900 border border-zinc-700 p-2 rounded w-28">
            <div className="text-zinc-500 text-[10px] mb-1">TARGET</div>
            <div className="text-2xl text-green-400 font-bold">{targetVolume}%</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 p-2 rounded w-28 relative overflow-hidden">
            <div className="text-zinc-500 text-[10px] mb-1">STABILITY</div>
            <div className="text-2xl text-yellow-400 font-bold z-10 relative">{Math.floor((holdTime / TARGET_HOLD_MS) * 100)}%</div>
            <div className="absolute bottom-0 left-0 bg-yellow-500/20 w-full" style={{ height: `${(holdTime / TARGET_HOLD_MS) * 100}%` }} />
          </div>
          <div className="bg-zinc-900 border border-zinc-700 p-2 rounded w-28">
            <div className="text-zinc-500 text-[10px] mb-1">ANALYZED</div>
            <div className="text-2xl text-white font-bold">{isPouring ? '???' : `${Math.round(milkLevel)}%`}</div>
          </div>
        </div>

        <div className="relative w-full aspect-video bg-zinc-950 border border-zinc-700 rounded overflow-hidden mb-8">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')] pointer-events-none" />
          
          <div className="absolute top-2 left-2 text-[10px] text-green-500 bg-black/50 px-1">
            CAM_01 [SIMULATED] | AI_ANALYSIS_ACTIVE
          </div>
          
          <div className="absolute top-1/4 left-1/3 w-1/3 h-1/2 border-2 border-blue-500 flex flex-col justify-end p-1">
            <div className="absolute -top-5 left-0 bg-blue-500 text-black text-[10px] px-1 font-bold">
              Object: Glass (98%)
            </div>
            
            <div 
              className="w-full bg-white/80 border-t border-white relative"
              style={{ height: `${milkLevel}%` }}
            >
              {Math.abs(milkLevel - targetVolume) < 15 && milkLevel > 0 && (
                <>
                  {Array.from({ length: Math.floor(15 - Math.abs(milkLevel - targetVolume)) * 2 }).map((_, i) => (
                    <div 
                      key={i}
                      className="absolute bg-white/80 rounded-full w-2 h-2 animate-bounce"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        transform: `translate(${Math.random() * 300 - 150}px, ${Math.random() * 300 - 100}px)`,
                        animationDuration: `${Math.random() * 0.3 + 0.1}s`
                      }}
                    />
                  ))}
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-red-600 font-bold bg-white/50 px-1">LEAKING</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Target line */}
            <div className="absolute left-0 w-full border-t border-dashed border-green-500 z-20 pointer-events-none" style={{ bottom: `${targetVolume}%` }} />
          </div>

          {milkLevel > 0 && (
            <div 
              className="absolute left-1/3 w-1/3 border-2 border-red-500 pointer-events-none"
              style={{ bottom: '25%', height: `${milkLevel / 2}%` }}
            >
              <div className="absolute -top-5 right-0 bg-red-500 text-black text-[10px] px-1 font-bold">
                Liquid ({Math.floor(milkLevel)}%)
              </div>
            </div>
          )}

          {isPouring && (
            <div className="absolute top-0 left-[45%] w-4 bg-white/60 blur-sm" style={{ height: `${25 + (100 - milkLevel) * 0.5}%` }} />
          )}
        </div>

        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          disabled={hasWon}
          className={`px-12 py-4 text-xl font-bold rounded ${hasWon ? 'bg-green-500 text-white cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200 cursor-pointer'} active:scale-95 transition-transform touch-none`}
        >
          {hasWon ? 'ANALYSIS COMPLETE' : 'POUR MILK'}
        </button>

      </div>
    </GameLayout>
  );
};
