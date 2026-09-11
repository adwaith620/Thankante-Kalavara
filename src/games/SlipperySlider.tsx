import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

export const SlipperySlider = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  const [targetVolume, setTargetVolume] = useState(Math.floor(Math.random() * 80) + 10);
  const [currentVolume, setCurrentVolume] = useState(50);
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  
  const [isDragging, setIsDragging] = useState(false);
  const [thumbPos, setThumbPos] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isFallen, setIsFallen] = useState(false);
  const [frozenTime, setFrozenTime] = useState(0);
  const [holdTime, setHoldTime] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    recordAttempt();
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
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

  // Hold timer: track how long we're at target
  useEffect(() => {
    if (hasWon || isLost) return;
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    
    if (currentVolume === targetVolume && isDragging && !isFallen) {
      holdTimerRef.current = setInterval(() => {
        setHoldTime(prev => {
          const next = prev + 100;
          if (next >= 1000) {
            setHasWon(true);
            setIsDragging(false);
            completeGame('slippery-slider');
          }
          return next;
        });
      }, 100);
    } else {
      setHoldTime(0);
    }
    
    return () => { if (holdTimerRef.current) clearInterval(holdTimerRef.current); };
  }, [currentVolume, targetVolume, isDragging, isFallen, hasWon, isLost]);

  // Set initial thumb x position
  useEffect(() => {
    if (trackRef.current && !isFallen) {
      const width = trackRef.current.clientWidth;
      setThumbPos(prev => ({ ...prev, x: width / 2 }));
    }
  }, []);

  // Physics loop
  useEffect(() => {
    if (hasWon || isLost || isFrozen()) return;

    const updatePhysics = () => {
      if (!isDragging && isFallen) {
        setThumbPos(prev => {
          let newY = prev.y + velocity.y;
          let newX = prev.x + velocity.x;
          let newVy = velocity.y + 0.5;
          let newVx = velocity.x * 0.99;

          if (newY > 300) {
            newY = 300;
            newVy *= -0.6;
            newVx *= 0.8;
          }

          setVelocity({ x: newVx, y: newVy });
          return { x: newX, y: newY };
        });
      } else if (!isDragging && !isFallen) {
        // Random drift even when idle
        setThumbPos(prev => {
          let newX = prev.x + (Math.random() - 0.5) * 3;
          if (trackRef.current) {
            const width = trackRef.current.clientWidth;
            if (newX < 0) newX = 0;
            if (newX > width) newX = width;
            const vol = Math.round((newX / width) * 100);
            if (vol !== currentVolume) setCurrentVolume(vol);
          }
          return { ...prev, x: newX };
        });
      } else if (isDragging && !isFallen) {
        // Random jumps while dragging
        if (Math.random() < 0.03) {
          setThumbPos(prev => {
            if (!trackRef.current) return prev;
            const width = trackRef.current.clientWidth;
            let newX = prev.x + (Math.random() - 0.5) * width * 0.06;
            newX = Math.max(0, Math.min(width, newX));
            const vol = Math.round((newX / width) * 100);
            setCurrentVolume(vol);
            return { ...prev, x: newX };
          });
        }
      }

      animationRef.current = requestAnimationFrame(updatePhysics);
    };

    animationRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [isDragging, isFallen, velocity, hasWon, isLost, frozenTime]);

  const isFrozen = () => Date.now() < frozenTime;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (hasWon || isLost) return;
    
    if (isFallen) {
      setIsFallen(false);
      setThumbPos(prev => ({ ...prev, y: 0 }));
      setFrozenTime(Date.now() + 800);
    } else {
      if (Math.random() < 0.3 && frozenTime < Date.now()) {
        setIsFallen(true);
        setVelocity({ x: (Math.random() - 0.5) * 10, y: -5 });
        recordFailure();
        return;
      }
    }
    
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateThumbPosFromEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || hasWon || isLost || isFallen) return;
    
    if (!isFrozen() && Math.random() < 0.05) {
      setIsDragging(false);
      setIsFallen(true);
      setVelocity({ x: (Math.random() - 0.5) * 15, y: -10 });
      recordFailure();
      return;
    }

    updateThumbPosFromEvent(e);
  };

  const updateThumbPosFromEvent = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    
    setThumbPos(prev => ({ ...prev, x }));
    const vol = Math.round((x / rect.width) * 100);
    setCurrentVolume(vol);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setIsFallen(false);
    setIsDragging(false);
    setVelocity({ x: 0, y: 0 });
    setHasWon(false);
    setIsLost(false);
    setFrozenTime(0);
    setTimeLeft(45);
    setHoldTime(0);
    setTargetVolume(Math.floor(Math.random() * 80) + 10);
    if (trackRef.current) {
      setThumbPos({ x: trackRef.current.clientWidth / 2, y: 0 });
      setCurrentVolume(50);
    }
  };

  const getStatusMessage = () => {
    if (hasWon) return "You successfully negotiated with the slider.";
    if (isLost) return "Time's up. The butter wins.";
    if (isFallen) return "Oops, it slipped. Click it for a 0.8s grip.";
    if (holdTime > 0) return `HOLDING... ${((1000 - holdTime) / 1000).toFixed(1)}s left`;
    return `Drag to target & HOLD for 1 second. Time: ${timeLeft}s`;
  };

  const holdPercent = Math.min(100, (holdTime / 1000) * 100);

  return (
    <GameLayout 
      gameId="slippery-slider"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : (isFallen ? 'warning' : 'info'))}
    >
      <div 
        className="flex flex-col items-center py-12 w-full max-w-2xl mx-auto font-mono touch-none h-[400px] relative"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="flex w-full justify-between px-8 mb-4 text-center">
          <div>
            <div className="text-zinc-500 text-xs mb-1">TARGET VOL</div>
            <div className="text-3xl text-green-400 font-bold">{targetVolume}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs mb-1">TIME</div>
            <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs mb-1">CURRENT VOL</div>
            <div className="text-3xl text-white font-bold">{currentVolume}</div>
          </div>
        </div>

        {/* Hold progress bar */}
        {holdTime > 0 && (
          <div className="w-full px-8 mb-4">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-100 rounded-full"
                style={{ width: `${holdPercent}%` }}
              />
            </div>
            <div className="text-green-400 text-xs text-center mt-1">HOLD IT STEADY!</div>
          </div>
        )}

        <div className="flex-1 flex items-center w-full px-8">
          {/* The Track */}
          <div 
            ref={trackRef}
            className="w-full h-4 bg-zinc-800 rounded-full relative shadow-inner border border-zinc-700"
          >
            {!isFallen && (
              <div 
                className="absolute top-0 left-0 h-full bg-white rounded-full pointer-events-none"
                style={{ width: `${currentVolume}%` }}
              />
            )}

            <div 
              className="absolute top-[-10px] bottom-[-10px] w-1 bg-green-500 z-0 opacity-50"
              style={{ left: `${targetVolume}%` }}
            />

            <div
              onPointerDown={handlePointerDown}
              className={`absolute w-8 h-8 -ml-4 -mt-2 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center shadow-lg transition-colors ${
                hasWon ? 'bg-green-500 z-10' : 
                isFrozen() ? 'bg-blue-400 z-20' : 
                'bg-zinc-200 hover:bg-white z-20'
              }`}
              style={{
                left: `${thumbPos.x}px`,
                top: `${thumbPos.y}px`,
                transform: isFallen ? `rotate(${velocity.x * 10}deg)` : 'none'
              }}
            >
              <div className="w-1 h-3 bg-zinc-400 rounded-full opacity-50" />
              <div className="w-1 h-3 bg-zinc-400 rounded-full opacity-50 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
};
