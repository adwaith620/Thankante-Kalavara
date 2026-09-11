import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

const TEXTS = [
  "CATCH ME", "Too slow!", "Almost!", "Nope.", 
  "Try again.", "You wish.", "Not today.", "Skill issue."
];

export const CatchMeIfYouCan = () => {
  const { recordAttempt, completeGame, recordFailure } = useStore();
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [btnText, setBtnText] = useState(TEXTS[0]);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // percentage
  const [escapes, setEscapes] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const freezeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Rapid movement interval
  useEffect(() => {
    if (hasWon || isLost || isFrozen) return;

    const interval = setInterval(() => {
      // Extremely rapid, chaotic movement
      const newX = Math.floor(Math.random() * 80) + 10;
      const newY = Math.floor(Math.random() * 80) + 10;
      
      setPosition({ x: newX, y: newY });
      
      if (Math.random() < 0.2) {
        setBtnText(TEXTS[Math.floor(Math.random() * TEXTS.length)]);
      }

      setEscapes(prev => {
        const newEscapes = prev + 1;
        // Freeze logic
        if (newEscapes > 15 && Math.random() < 0.08) {
          setIsFrozen(true);
          setBtnText("..wait");
          
          // Clear any existing freeze timer
          if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
          
          // Failsafe unfreeze after 3 seconds if they just stare at it
          freezeTimerRef.current = setTimeout(() => {
            if (!hasWon) {
              setIsFrozen(false);
              setBtnText("Too slow again!");
            }
          }, 3000);
        }
        return newEscapes;
      });

    }, 150); // Updates extremely fast! (150ms)

    return () => clearInterval(interval);
  }, [hasWon, isLost, isFrozen]);

  const moveButton = () => {
    if (hasWon || isLost || isFrozen) return;
    
    // Extra teleport when hovered
    setPosition({ 
      x: Math.floor(Math.random() * 80) + 10, 
      y: Math.floor(Math.random() * 80) + 10 
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isFrozen || hasWon || isLost || !buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;
    
    const dist = Math.sqrt(Math.pow(e.clientX - btnCenterX, 2) + Math.pow(e.clientY - btnCenterY, 2));
    
    // Proximity threshold: if cursor is within ~100px
    if (dist < 60) {
      if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
      setIsFrozen(false);
      setBtnText("SIKEEE!");
      setPosition({ 
        x: Math.floor(Math.random() * 80) + 10, 
        y: Math.floor(Math.random() * 80) + 10 
      });
    }
  };

  const handleClick = () => {
    setHasWon(true);
    completeGame('catch-me');
    setBtnText("YOU CAUGHT ME.");
    if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
  };

  const handleReset = () => {
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(30);
    setBtnText(TEXTS[0]);
    setPosition({ x: 50, y: 50 });
    setEscapes(0);
    setIsFrozen(false);
    if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
  };

  const getStatusMessage = () => {
    if (isLost) return "It got away. You are too slow.";
    if (hasWon) return "Incredible reflexes.";
    return `Catch the button. Time remaining: ${timeLeft}s`;
  };

  return (
    <GameLayout 
      gameId="catch-me"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="flex flex-col items-center py-4 w-full max-w-2xl mx-auto font-mono select-none">
        <div 
          ref={containerRef}
          onPointerMove={handlePointerMove}
          className="relative w-full h-[400px] md:h-[500px] bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden touch-none"
        >
          <button
            ref={buttonRef}
            tabIndex={-1}
            onFocus={(e) => e.target.blur()}
            onMouseEnter={moveButton}
            onClick={handleClick}
            disabled={hasWon}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 font-mono font-bold rounded shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-colors active:scale-95 touch-none select-none ${
              hasWon ? 'bg-green-500 text-white cursor-default' : 
              isFrozen ? 'bg-orange-600 text-white shadow-[0_0_30px_#ea580c] scale-110' :
              'bg-red-600 text-white hover:bg-red-500'
            }`}
            style={{ 
              left: `${position.x}%`, 
              top: `${position.y}%`,
              transition: isFrozen ? 'all 0.1s ease-out' : 'none'
            }}
          >
            {btnText}
          </button>

          {hasWon && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-full h-full bg-green-500/10 animate-pulse" />
            </div>
          )}
        </div>
        
        <div className="mt-4 flex w-full justify-between font-mono text-xs text-zinc-600">
          <span>ESCAPES: {escapes}</span>
          <span>STATUS: {hasWon ? 'CAPTURED' : 'AT LARGE'}</span>
        </div>
      </div>
    </GameLayout>
  );
};
