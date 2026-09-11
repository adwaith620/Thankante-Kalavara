import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

const ERROR_MESSAGES = [
  "ERROR 404",
  "PAGE NOT FOUND",
  "SYSTEM PANIC",
  "CRITICAL FAILURE",
  "KERNEL PANIC",
  "MEMORY CORRUPTION DETECTED",
  "SYSTEM HALTED"
];

const ERROR_TITLES = [
  "Error 404", "Warning", "Fatal Error", "System Panic"
];

interface Popup {
  id: number;
  x: number;
  y: number;
  title: string;
  message: string;
  width: number;
}

export const SuccessExe = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  const [popups, setPopups] = useState<Popup[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const popupIdCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track spawn rate
  const spawnRateRef = useRef(1000);
  const maxWindows = 50; // Cap to prevent browser crash, and define "filled"

  useEffect(() => {
    recordAttempt();
  }, []);

  useEffect(() => {
    if (hasWon || isLost) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // If they survive for 45 seconds, they win
          setHasWon(true);
          completeGame('success-exe');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [hasWon, isLost]);

  useEffect(() => {
    if (hasWon || isLost) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const spawnWindow = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      const width = 200 + Math.random() * 150;
      const x = Math.max(0, Math.random() * (rect.width - width));
      const y = Math.max(0, Math.random() * (rect.height - 150));

      const newPopup: Popup = {
        id: popupIdCounter.current++,
        x,
        y,
        width,
        title: ERROR_TITLES[Math.floor(Math.random() * ERROR_TITLES.length)],
        message: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]
      };

      setPopups(prev => {
        const next = [...prev, newPopup];
        
        // If filled
        if (next.length >= maxWindows) {
          setIsLost(true);
          recordFailure();
        }
        
        return next;
      });

      // Increase spawn rate
      spawnRateRef.current = Math.max(50, spawnRateRef.current * 0.9);
      timeoutId = setTimeout(spawnWindow, spawnRateRef.current);
    };

    timeoutId = setTimeout(spawnWindow, spawnRateRef.current);

    return () => clearTimeout(timeoutId);
  }, [hasWon, isLost]);

  const closePopup = (id: number) => {
    if (hasWon || isLost) return;
    setPopups(prev => prev.filter(p => p.id !== id));
  };

  const handleReset = () => {
    setHasWon(false);
    setIsLost(false);
    setPopups([]);
    setTimeLeft(45);
    popupIdCounter.current = 0;
    spawnRateRef.current = 1000;
  };

  const getStatusMessage = () => {
    if (isLost) return "SYSTEM OVERLOAD. Play area filled.";
    if (hasWon) return "You survived the system panic.";
    return `Close the errors before they fill the screen. Time remaining: ${timeLeft}s`;
  };

  return (
    <GameLayout 
      gameId="success-exe"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div 
        ref={containerRef}
        className="relative w-full h-[500px] bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden touch-none"
      >
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
        
        {popups.map(popup => (
          <div
            key={popup.id}
            className="absolute bg-zinc-300 border-2 border-white border-b-zinc-500 border-r-zinc-500 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] select-none"
            style={{ 
              left: `${popup.x}px`, 
              top: `${popup.y}px`, 
              width: `${popup.width}px` 
            }}
          >
            {/* Title bar */}
            <div className="bg-blue-800 text-white px-2 py-1 flex justify-between items-center cursor-default">
              <span className="font-bold text-xs">{popup.title}</span>
              <button 
                onClick={() => closePopup(popup.id)}
                className="w-5 h-5 bg-zinc-300 border border-white border-b-zinc-500 border-r-zinc-500 text-black flex items-center justify-center text-xs font-bold hover:bg-zinc-200 active:border-zinc-500 active:border-b-white active:border-r-white"
              >
                X
              </button>
            </div>
            {/* Content */}
            <div className="p-4 flex gap-4 items-center bg-zinc-200">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shrink-0 border-2 border-white border-b-zinc-500 border-r-zinc-500">
                X
              </div>
              <p className="text-black text-sm">{popup.message}</p>
            </div>
            <div className="p-2 flex justify-center bg-zinc-200 border-t border-zinc-300">
              <button 
                onClick={() => closePopup(popup.id)}
                className="px-6 py-1 bg-zinc-300 border border-white border-b-zinc-500 border-r-zinc-500 text-black text-sm hover:bg-zinc-200 active:border-zinc-500 active:border-b-white active:border-r-white"
              >
                OK
              </button>
            </div>
          </div>
        ))}
        
        {isLost && (
          <div className="absolute inset-0 bg-blue-900 flex flex-col items-center justify-center p-8 z-50">
            <div className="text-white font-mono text-xl md:text-3xl font-bold mb-4 text-center">
              *** STOP: 0x000000404 (SYSTEM_OVERLOAD_EXCEPTION)
            </div>
            <div className="text-white font-mono text-sm md:text-base max-w-2xl text-center">
              A problem has been detected and Windows has been shut down to prevent damage to your computer.
              <br/><br/>
              The system was overwhelmed by 404 fake windows.
              <br/><br/>
              Press reset to try again.
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
};
