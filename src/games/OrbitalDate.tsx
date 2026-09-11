import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const getDateFromAngle = (angleRad: number) => {
  // Normalize angle to 0 - 2PI
  let normalized = angleRad % (Math.PI * 2);
  if (normalized < 0) normalized += Math.PI * 2;
  
  const dayOfYear = Math.floor((normalized / (Math.PI * 2)) * 365);
  
  let temp = dayOfYear;
  let m = 0;
  while (m < 12 && temp >= DAYS_IN_MONTH[m]) {
    temp -= DAYS_IN_MONTH[m];
    m++;
  }
  return { month: MONTHS[Math.min(m, 11)], day: temp + 1 };
};

export const OrbitalDate = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  
  const [targetDayOfYear] = useState(Math.floor(Math.random() * 365));
  const targetAngle = (targetDayOfYear / 365) * Math.PI * 2;
  
  let tempDay = targetDayOfYear;
  let tempM = 0;
  while (tempM < 12 && tempDay >= DAYS_IN_MONTH[tempM]) { tempDay -= DAYS_IN_MONTH[tempM]; tempM++; }
  const [targetDateStr] = useState(`${MONTHS[tempM]} ${tempDay + 1}`);

  const [currentDateStr, setCurrentDateStr] = useState("Jan 1");

  // Physics state
  const angleRef = useRef(0);
  const velRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMouseAngleRef = useRef(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  // Ellipse parameters
  const a = 140; // semi-major axis
  const b = 80;  // semi-minor axis

  useEffect(() => {
    recordAttempt();
  }, []);

  useEffect(() => {
    if (hasWon || isLost) return;

    const gameLoop = () => {
      if (!isDraggingRef.current) {
        // Apply inertia and friction
        angleRef.current += velRef.current;
        velRef.current *= 0.95; // friction
        
        // Stop condition check
        if (Math.abs(velRef.current) > 0 && Math.abs(velRef.current) < 0.001) {
          velRef.current = 0;
          checkWinCondition();
        }
      }

      // Update displayed date
      const date = getDateFromAngle(angleRef.current);
      setCurrentDateStr(`${date.month} ${date.day}`);

      // Update Earth DOM position directly to bypass React render cycle for 60fps
      const earth = document.getElementById('earth-planet');
      if (earth) {
        const ex = a * Math.cos(angleRef.current);
        const ey = b * Math.sin(angleRef.current);
        earth.style.transform = `translate(calc(-50% + ${ex}px), calc(-50% + ${ey}px))`;
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [hasWon, isLost, targetAngle]);

  const checkWinCondition = () => {
    let normalized = angleRef.current % (Math.PI * 2);
    if (normalized < 0) normalized += Math.PI * 2;

    const dist = Math.min(
      Math.abs(normalized - targetAngle),
      Math.abs(normalized - targetAngle + Math.PI * 2),
      Math.abs(normalized - targetAngle - Math.PI * 2)
    );

    // About 2 days margin of error (2/365 * 2PI = ~0.034)
    if (dist < 0.035) {
      setHasWon(true);
      completeGame('orbital-date');
    } else {
      setIsLost(true);
      recordFailure();
    }
  };

  const getAngleFromEvent = (e: React.PointerEvent) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // We want angle taking into account the ellipse shape
    // atan2(y/b, x/a) gives the parametric angle
    return Math.atan2((e.clientY - cy)/b, (e.clientX - cx)/a);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (hasWon || isLost) return;
    isDraggingRef.current = true;
    lastMouseAngleRef.current = getAngleFromEvent(e);
    velRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || hasWon || isLost) return;
    const newAngle = getAngleFromEvent(e);
    
    let delta = newAngle - lastMouseAngleRef.current;
    
    // Handle wrap around
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    
    angleRef.current += delta;
    velRef.current = delta; // track velocity for release
    lastMouseAngleRef.current = newAngle;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current || hasWon || isLost) return;
    isDraggingRef.current = false;
  };

  const handleReset = () => {
    angleRef.current = 0;
    velRef.current = 0;
    setHasWon(false);
    setIsLost(false);
  };

  const getStatusMessage = () => {
    if (isLost) return "Earth stopped in the wrong orbit. You are frozen/incinerated.";
    if (hasWon) return "Perfect orbital insertion. Target date reached.";
    return "Fling the Earth around the Sun. Let it naturally stop on the target date.";
  };

  return (
    <GameLayout 
      gameId="orbital-date"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="flex flex-col items-center py-4 w-full max-w-2xl mx-auto font-mono select-none">
        
        <div className="flex w-full justify-between mb-8 text-center px-4">
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded w-40">
            <div className="text-zinc-500 text-xs mb-1">TARGET DATE</div>
            <div className="text-xl text-green-400 font-bold">{targetDateStr}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded w-40">
            <div className="text-zinc-500 text-xs mb-1">CURRENT ORBIT</div>
            <div className="text-xl text-white font-bold">{currentDateStr}</div>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="relative w-full aspect-square max-w-[400px] bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden flex items-center justify-center touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Orbit Path */}
          <div 
            className="absolute border border-zinc-700/50 rounded-full pointer-events-none"
            style={{ width: `${a * 2}px`, height: `${b * 2}px` }}
          />

          {/* Sun */}
          <div className="absolute w-12 h-12 bg-yellow-500 rounded-full shadow-[0_0_40px_#eab308] pointer-events-none flex items-center justify-center">
            <div className="w-8 h-8 bg-yellow-300 rounded-full blur-sm" />
          </div>

          {/* Earth */}
          <div 
            id="earth-planet"
            className="absolute left-1/2 top-1/2 w-8 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6] border border-blue-300 flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ transform: `translate(calc(-50% + ${a}px), -50%)` }}
          >
            <div className="w-4 h-4 bg-green-500 rounded-full blur-[1px] opacity-70 translate-x-1 -translate-y-1" />
          </div>

        </div>
        
        <p className="mt-6 text-zinc-500 text-sm text-center px-4 max-w-sm">
          Warning: Planetary inertia is highly unforgiving. 
          Grab the Earth, spin it, and let go. If it stops on the wrong date, humanity perishes.
        </p>

      </div>
    </GameLayout>
  );
};
