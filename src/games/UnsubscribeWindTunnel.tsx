import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

export const UnsubscribeWindTunnel = () => {
  const { recordAttempt, completeGame , recordFailure } = useStore();
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const [btnPos, setBtnPos] = useState({ x: 300, y: 200 });
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  
  const stateRef = useRef({
    currentX: 300,
    currentY: 200,
    vx: 0,
    vy: 0,
    windStrength: 0.05,
    dead: false
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const windActive = true;
  const windStrength = 1;

  useEffect(() => {
    recordAttempt();
  }, []);

  // 1.0 second timer for massive wind
  useEffect(() => {
    if (hasWon || isLost) return;
    
    timerRef.current = setTimeout(() => {
      // Massive wind blows it away
      stateRef.current.windStrength = 20;
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hasWon, isLost]);

  // Physics loop
  useEffect(() => {
    if (hasWon || isLost || !containerRef.current) return;
    
    let animationFrameId: number;
    const s = stateRef.current;

    const updatePhysics = () => {
      const container = containerRef.current;
      if (!container || s.dead) return;
      
      const rect = container.getBoundingClientRect();
      const height = rect.height;
      const width = rect.width;
      
      const fanX = 50;
      const fanY = height / 2;
      
      const distToFan = Math.sqrt(Math.pow(s.currentX - fanX, 2) + Math.pow(s.currentY - fanY, 2));
      
      s.vx += (1500 / (distToFan + 10)) * s.windStrength;
      s.vy += (Math.random() - 0.5) * 50 * s.windStrength;
      
      s.vx *= 0.95; // friction
      s.vy *= 0.95;
      
      s.currentX += s.vx;
      s.currentY += s.vy;
      
      // Left boundary (fan)
      if (s.currentX < 150) { 
        s.currentX = 150; 
        s.vx *= -0.5; 
      }
      // Top/Bottom bounce
      if (s.currentY < 20) { s.currentY = 20; s.vy *= -1; }
      if (s.currentY > height - 20) { s.currentY = height - 20; s.vy *= -1; }
      
      // Right boundary (escaped)
      if (s.currentX > width + 100) {
        setIsLost(true);
        recordFailure();
        s.dead = true;
        return;
      }
      
      setBtnPos({ x: s.currentX, y: s.currentY });
      
      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasWon, isLost, mousePos]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  const handleUnsubscribe = () => {
    if (hasWon || isLost) return;
    setHasWon(true);
    completeGame('unsubscribe-wind-tunnel');
  };

  const handleReset = () => {
    setHasWon(false);
    setIsLost(false);
    stateRef.current = {
      currentX: 300,
      currentY: 200,
      vx: 0,
      vy: 0,
      windStrength: 0.05,
      dead: false
    };
    setBtnPos({ x: 300, y: 200 });
    setMousePos({ x: -1000, y: -1000 });
  };

  const getStatusMessage = () => {
    if (isLost) return "You missed the window. Subscription locked permanently.";
    if (hasWon) return "You clicked it. You are finally free.";
    return "Click UNSUBSCRIBE before the wind blows it away!";
  };

  return (
    <GameLayout 
      gameId="unsubscribe-wind-tunnel"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="text-center font-mono mb-4">
        <p className="text-zinc-400">You are currently subscribed to 47 newsletters.</p>
        <p className="text-white">Would you like to unsubscribe?</p>
      </div>

      <div 
        ref={containerRef}
        className="w-full h-[500px] bg-zinc-950 border border-zinc-800 rounded relative overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Fan graphics */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-64 border-r border-zinc-700 bg-zinc-900 flex items-center justify-center z-10">
          <div className="relative w-24 h-24 rounded-full border-4 border-zinc-700 flex items-center justify-center">
            <div className="w-4 h-4 bg-zinc-500 rounded-full z-10" />
            <div 
              className="absolute w-20 h-20 origin-center transition-transform"
              style={{ 
                animation: windActive ? `spin ${0.5 / (windStrength || 0.1)}s linear infinite` : 'none' 
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-10 bg-zinc-600 rounded-t-full" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-10 bg-zinc-600 rounded-b-full" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-4 bg-zinc-600 rounded-l-full" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-4 bg-zinc-600 rounded-r-full" />
            </div>
            {windStrength > 0.5 && (
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex gap-2 opacity-50">
                <div className="w-8 h-px bg-white animate-pulse" />
                <div className="w-12 h-px bg-white animate-pulse delay-75" />
                <div className="w-6 h-px bg-white animate-pulse delay-150" />
              </div>
            )}
          </div>
        </div>

        {/* Particles */}
        {windActive && !hasWon && Array.from({ length: Math.floor(windStrength * 20) }).map((_, i) => (
          <div 
            key={i}
            className="absolute h-px bg-white/20 pointer-events-none"
            style={{
              width: Math.random() * 50 + 10 + 'px',
              left: Math.random() * 100 + 150 + 'px',
              top: Math.random() * 500 + 'px',
              animation: `windBlow ${Math.random() * 0.5 + 0.2}s linear infinite`
            }}
          />
        ))}

        {/* The Button */}
        <button
          ref={buttonRef}
          tabIndex={-1}
          onFocus={(e) => e.target.blur()}
          onMouseDown={handleUnsubscribe}
          onTouchStart={handleUnsubscribe}
          disabled={hasWon}
          className={`absolute w-[200px] h-[64px] text-xl font-mono font-bold rounded shadow-lg transition-colors ${
            hasWon ? 'bg-green-500 text-white cursor-default' : 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
          }`}
          style={{
            left: `${btnPos.x}px`,
            top: `${btnPos.y}px`,
            transform: hasWon ? 'scale(1.1)' : 'none'
          }}
        >
          {hasWon ? 'UNSUBSCRIBED' : 'UNSUBSCRIBE'}
        </button>

        {hasWon && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm animate-in fade-in">
            <div className="bg-zinc-900 border border-green-500 p-8 rounded text-center">
              <h3 className="text-2xl font-mono text-green-400 mb-2">FREEDOM ATTAINED</h3>
              <p className="text-zinc-400 font-mono">You managed to click it during the wind lull.</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes windBlow {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(500px); opacity: 0; }
        }
      `}</style>
    </GameLayout>
  );
};
