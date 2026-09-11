import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

export const OrchestraConductor = () => {
  const { recordAttempt, completeGame, recordFailure } = useStore();
  const [currentVolume, setCurrentVolume] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [holdProgress, setHoldProgress] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const targetPhaseRef = useRef({ x: Math.random() * 100, y: Math.random() * 100 });
  const mousePosRef = useRef({ x: 150, y: 150 });
  const batonTipRef = useRef({ x: 150, y: 50 });
  const batonVelRef = useRef({ x: 0, y: 0 });
  const targetPosRef = useRef({ x: 150, y: 150 });
  const holdStartRef = useRef<number | null>(null);

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

  // Physics loop - uses refs only, no state deps that cause RAF teardown
  useEffect(() => {
    if (hasWon || isLost) return;

    const updatePhysics = () => {
      // Faster target movement
      targetPhaseRef.current.x += 0.075 + Math.random() * 0.075;
      targetPhaseRef.current.y += 0.045 + Math.random() * 0.1;
      
      const containerWidth = containerRef.current?.clientWidth || 300;
      const containerHeight = containerRef.current?.clientHeight || 300;
      
      const newTargetX = (containerWidth / 2) + Math.sin(targetPhaseRef.current.x) * (containerWidth * 0.3) + Math.cos(targetPhaseRef.current.x * 2.1) * (containerWidth * 0.1);
      const newTargetY = (containerHeight / 2) + Math.cos(targetPhaseRef.current.y) * (containerHeight * 0.3) + Math.sin(targetPhaseRef.current.y * 1.7) * (containerHeight * 0.1);
      
      targetPosRef.current = { x: newTargetX, y: newTargetY };

      // Spring physics - more sluggish (0.75 damping)
      const dx = mousePosRef.current.x - batonTipRef.current.x;
      const dy = (mousePosRef.current.y - 100) - batonTipRef.current.y;
      
      batonVelRef.current.x += dx * 0.05;
      batonVelRef.current.y += dy * 0.05;
      
      batonVelRef.current.x *= 0.75;
      batonVelRef.current.y *= 0.75;
      
      batonTipRef.current.x += batonVelRef.current.x;
      batonTipRef.current.y += batonVelRef.current.y;

      // Calculate distance from tip to target
      const dist = Math.sqrt(
        Math.pow(batonTipRef.current.x - newTargetX, 2) + 
        Math.pow(batonTipRef.current.y - newTargetY, 2)
      );
      const accuracy = Math.max(0, 100 - dist);
      
      // Hold requirement: accuracy must stay > 85 for 2 full seconds
      if (accuracy > 85) {
        if (!holdStartRef.current) {
          holdStartRef.current = Date.now();
        }
        const held = Date.now() - holdStartRef.current;
        setHoldProgress(Math.min(100, (held / 2000) * 100));
        if (held >= 2000) {
          setHasWon(true);
          completeGame('orchestra-conductor');
          cancelAnimationFrame(animationRef.current);
          return;
        }
      } else {
        holdStartRef.current = null;
        setHoldProgress(0);
      }

      setCurrentVolume(Math.floor(accuracy));

      animationRef.current = requestAnimationFrame(updatePhysics);
    };

    animationRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationRef.current);
  }, [hasWon, isLost]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (hasWon || isLost || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleReset = () => {
    setCurrentVolume(0);
    mousePosRef.current = { x: 150, y: 150 };
    batonTipRef.current = { x: 150, y: 50 };
    batonVelRef.current = { x: 0, y: 0 };
    targetPosRef.current = { x: 150, y: 150 };
    holdStartRef.current = null;
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(30);
    setHoldProgress(0);
  };

  const getStatusMessage = () => {
    if (isLost) return "Time is up. The orchestra left.";
    if (hasWon) return "Perfect conducting. Standing ovation.";
    return `Keep the baton tip on the moving target for 2 seconds. Time: ${timeLeft}s`;
  };

  return (
    <GameLayout 
      gameId="orchestra-conductor"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="flex flex-col items-center py-4 w-full max-w-2xl mx-auto font-mono select-none">
        
        <div className="flex w-full justify-between mb-4 px-4 text-center">
          <div>
            <div className="text-zinc-500 text-xs mb-1">ACCURACY</div>
            <div className={`text-2xl font-bold ${currentVolume > 85 ? 'text-green-400' : 'text-white'}`}>{currentVolume}%</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs mb-1">TIME</div>
            <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</div>
          </div>
        </div>

        {/* Hold progress bar */}
        {holdProgress > 0 && (
          <div className="w-full px-4 mb-4">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-75 rounded-full"
                style={{ width: `${holdProgress}%` }}
              />
            </div>
            <div className="text-green-400 text-xs text-center mt-1">HOLD STEADY!</div>
          </div>
        )}

        {/* Stage */}
        <div 
          ref={containerRef}
          onPointerMove={handlePointerMove}
          className="relative w-full h-[400px] bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden touch-none cursor-none"
        >
          {/* Target spot */}
          <div 
            className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-red-500/30 border-2 border-red-500 animate-pulse pointer-events-none"
            style={{ left: targetPosRef.current.x, top: targetPosRef.current.y }}
          />

          {/* Baton */}
          <div className="absolute pointer-events-none" style={{ left: mousePosRef.current.x, top: mousePosRef.current.y }}>
            <svg width="200" height="200" className="overflow-visible" style={{ position: 'absolute', left: -100, top: -100 }}>
              <line 
                x1="100" y1="100"
                x2={100 + (batonTipRef.current.x - mousePosRef.current.x)} 
                y2={100 + (batonTipRef.current.y - mousePosRef.current.y)}
                stroke="white" strokeWidth="3" strokeLinecap="round"
              />
              <circle 
                cx={100 + (batonTipRef.current.x - mousePosRef.current.x)} 
                cy={100 + (batonTipRef.current.y - mousePosRef.current.y)} 
                r="4" fill={currentVolume > 85 ? "#22c55e" : "white"} 
              />
            </svg>
          </div>

          {/* Orchestra (background decoration) */}
          <div className="absolute bottom-0 w-full flex justify-center gap-4 pb-4 opacity-30 pointer-events-none">
            {['🎻', '🎺', '🥁', '🎷', '🎻', '🎺', '🥁'].map((emoji, i) => (
              <div key={i} className="text-3xl">{emoji}</div>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
};
