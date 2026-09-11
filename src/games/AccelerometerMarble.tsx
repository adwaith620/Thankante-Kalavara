import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export const AccelerometerMarble = () => {
  const { recordAttempt, completeGame , recordFailure } = useStore();
  const [targetVolume] = useState(Math.floor(Math.random() * 80) + 10);
  const [currentVolume, setCurrentVolume] = useState(50);
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  
  // Physics
  const [pos, setPos] = useState({ x: 50, y: 50 }); // percentage
  const velocity = useRef({ x: 0, y: 0 });
  const tilt = useRef({ x: 0, y: 0 }); // tilt angles
  
  const [permissionGranted, setPermissionGranted] = useState(false);

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


  // Main physics loop
  useEffect(() => {
    if (hasWon || isLost) return;

    let animationFrameId: number;

    const updatePhysics = () => {
      // Apply tilt to velocity
      velocity.current.x += tilt.current.x * 0.05;
      velocity.current.y += tilt.current.y * 0.05;

      // Friction
      velocity.current.x *= 0.95;
      velocity.current.y *= 0.95;

      setPos(prev => {
        let newX = prev.x + velocity.current.x;
        let newY = prev.y + velocity.current.y;

        // Boundaries (0 to 100)
        if (newX < 0) { newX = 0; velocity.current.x *= -0.5; }
        if (newX > 100) { newX = 100; velocity.current.x *= -0.5; }
        if (newY < 0) { newY = 0; velocity.current.y *= -0.5; }
        if (newY > 100) { newY = 100; velocity.current.y *= -0.5; }

        // Volume is based on X position
        const newVol = Math.round(newX);
        if (newVol !== currentVolume) {
          setCurrentVolume(newVol);
        }

        return { x: newX, y: newY };
      });

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasWon, isLost]);

  // Win condition check
  useEffect(() => {
    if (hasWon || isLost) return;
    if (currentVolume === targetVolume && Math.abs(velocity.current.x) < 0.1 && Math.abs(velocity.current.y) < 0.1) {
      // Need to hold it relatively still
      setHasWon(true);
      completeGame('accelerometer-marble');
    }
  }, [currentVolume, targetVolume, hasWon]);

  // Device orientation
  useEffect(() => {
    if (!permissionGranted) return;
    
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma || 0; // Left/Right tilt
      const beta = e.beta || 0; // Front/Back tilt
      
      // Clamp values
      tilt.current.x = Math.max(-45, Math.min(45, gamma)) / 45; // -1 to 1
      tilt.current.y = Math.max(-45, Math.min(45, beta)) / 45; // -1 to 1
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [permissionGranted]);

  const requestPermission = () => {
    // @ts-ignore
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // @ts-ignore
      DeviceOrientationEvent.requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            setPermissionGranted(true);
          }
        })
        .catch(console.error);
    } else {
      setPermissionGranted(true);
    }
  };

  // Fallback keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasWon || isLost) return;
      const speed = 2;
      switch(e.key) {
        case 'ArrowUp': tilt.current.y = -speed; break;
        case 'ArrowDown': tilt.current.y = speed; break;
        case 'ArrowLeft': tilt.current.x = -speed; break;
        case 'ArrowRight': tilt.current.x = speed; break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp': 
        case 'ArrowDown': tilt.current.y = 0; break;
        case 'ArrowLeft': 
        case 'ArrowRight': tilt.current.x = 0; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hasWon]);

  const handleArrowTouch = (dx: number, dy: number) => {
    tilt.current.x = dx;
    tilt.current.y = dy;
  };
  const handleArrowRelease = () => {
    tilt.current.x = 0;
    tilt.current.y = 0;
  };

  const handleReset = () => {
    setPos({ x: 50, y: 50 });
    velocity.current = { x: 0, y: 0 };
    tilt.current = { x: 0, y: 0 };
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(35);
    setCurrentVolume(50);
  };

  const getStatusMessage = () => {
    if (isLost) return "Time is up. Marble lost.";
    if (hasWon) return "Marble stabilized at target volume.";
    return `Tilt device or use arrows to roll the marble. Time: ${timeLeft}s`;
  };

  return (
    <GameLayout 
      gameId="accelerometer-marble"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="flex flex-col items-center py-4 w-full max-w-xl mx-auto font-mono select-none">
        
        <div className="flex w-full justify-between mb-8 px-4 text-center">
          <div>
            <div className="text-zinc-500 text-xs mb-1">TARGET VOL</div>
            <div className="text-2xl text-green-400 font-bold">{targetVolume}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs mb-1">CURRENT VOL</div>
            <div className="text-2xl text-white font-bold">{currentVolume}</div>
          </div>
        </div>

        {!permissionGranted && (
          <button 
            onClick={requestPermission}
            className="mb-6 px-4 py-2 border border-zinc-700 bg-zinc-900 rounded text-xs text-zinc-400 hover:text-white transition-colors"
          >
            ENABLE SENSOR TILT (OPTIONAL)
          </button>
        )}

        {/* The Tray */}
        <div 
          className="relative w-64 h-64 bg-zinc-900 border-4 border-zinc-700 rounded-xl shadow-inner overflow-hidden mb-8"
          style={{
            transform: `perspective(500px) rotateX(${-tilt.current.y * 10}deg) rotateY(${tilt.current.x * 10}deg)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          {/* Target Zone */}
          <div 
            className="absolute top-0 bottom-0 w-8 bg-green-500/20 border-x border-green-500/50"
            style={{ left: `calc(${targetVolume}% - 16px)` }}
          />

          {/* The Marble */}
          <div 
            className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5),2px_2px_4px_rgba(0,0,0,0.5)] ${hasWon ? 'bg-green-400' : 'bg-white'}`}
            style={{ 
              left: `${pos.x}%`, 
              top: `${pos.y}%`,
            }}
          >
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-60 blur-[1px]" />
          </div>
        </div>

        {/* Fallback On-Screen Controls */}
        <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
          <div />
          <button 
            className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center active:bg-zinc-700"
            onPointerDown={() => handleArrowTouch(0, -2)}
            onPointerUp={handleArrowRelease}
            onPointerLeave={handleArrowRelease}
          ><ArrowUp size={20} /></button>
          <div />
          <button 
            className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center active:bg-zinc-700"
            onPointerDown={() => handleArrowTouch(-2, 0)}
            onPointerUp={handleArrowRelease}
            onPointerLeave={handleArrowRelease}
          ><ArrowLeft size={20} /></button>
          <button 
            className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center active:bg-zinc-700"
            onPointerDown={() => handleArrowTouch(0, 2)}
            onPointerUp={handleArrowRelease}
            onPointerLeave={handleArrowRelease}
          ><ArrowDown size={20} /></button>
          <button 
            className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center active:bg-zinc-700"
            onPointerDown={() => handleArrowTouch(2, 0)}
            onPointerUp={handleArrowRelease}
            onPointerLeave={handleArrowRelease}
          ><ArrowRight size={20} /></button>
        </div>
        
      </div>
    </GameLayout>
  );
};
