import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

const TARGET_WORD = "crane";
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split('');

export const CraneClawsTyping = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  const [typedText, setTypedText] = useState("");
  const [hasWon, setHasWon] = useState(false);
  
  const [cranePos, setCranePos] = useState(0); // 0 to 100
  const [craneState, setCraneState] = useState<'moving' | 'dropping' | 'grabbing' | 'returning'>('moving');
  const [grabbedChar, setGrabbedChar] = useState<string | null>(null);
  const [craneDir, setCraneDir] = useState(1);
  
  const moveInterval = useRef<number>(0);

  // Shuffle alphabet for the grid
  const [grid] = useState(() => {
    const shuffled = [...ALPHABET].sort(() => Math.random() - 0.5);
    return shuffled;
  });

  useEffect(() => {
    recordAttempt();
  }, []);

  useEffect(() => {
    if (hasWon || craneState !== 'moving') {
      clearInterval(moveInterval.current);
      return;
    }

    moveInterval.current = window.setInterval(() => {
      setCranePos(prev => {
        let next = prev + craneDir * 1.5;
        if (next >= 100) {
          setCraneDir(-1);
          return 100;
        }
        if (next <= 0) {
          setCraneDir(1);
          return 0;
        }
        return next;
      });
    }, 20);

    return () => clearInterval(moveInterval.current);
  }, [craneState, craneDir, hasWon]);

  const handleGrab = () => {
    if (hasWon || craneState !== 'moving') return;
    setCraneState('dropping');
    
    // Animate drop
    setTimeout(() => {
      // Determine what was grabbed based on position
      // Grid has 26 items. Each is ~ 100/26 wide.
      const index = Math.floor((cranePos / 100) * 26);
      const char = grid[Math.min(25, Math.max(0, index))];
      
      setGrabbedChar(char);
      setCraneState('grabbing');
      
      setTimeout(() => {
        setCraneState('returning');
        
        setTimeout(() => {
          // Reached top
          const newText = typedText + char;
          setTypedText(newText);
          setGrabbedChar(null);
          
          if (newText === TARGET_WORD) {
            setHasWon(true);
            completeGame('crane-claws-typing');
          } else if (!TARGET_WORD.startsWith(newText)) {
            recordFailure();
          }
          
          setCraneState('moving');
        }, 500);
      }, 500);
    }, 500);
  };

  const handleReset = () => {
    setTypedText("");
    setHasWon(false);
    setCraneState('moving');
    setGrabbedChar(null);
    setCranePos(0);
  };

  const getStatusMessage = () => {
    if (hasWon) return "You got the toy! (And the word).";
    if (typedText && !TARGET_WORD.startsWith(typedText)) return "You dropped the wrong letter. Reset and insert coin.";
    return `Timing is everything. Current target: '${TARGET_WORD[typedText.length] || ''}'`;
  };

  return (
    <GameLayout 
      gameId="crane-claws-typing"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (typedText && !TARGET_WORD.startsWith(typedText) ? 'error' : 'info')}
    >
      <div className="flex flex-col items-center py-4 w-full max-w-3xl mx-auto font-mono select-none">
        
        <div className="flex w-full justify-between mb-8 text-center px-4">
          <div>
            <div className="text-zinc-500 text-xs mb-1">TARGET</div>
            <div className="text-xl text-green-400 font-bold tracking-widest">{TARGET_WORD}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs mb-1">TYPED</div>
            <div className="text-xl text-white font-bold tracking-widest min-h-[28px]">{typedText}</div>
          </div>
        </div>

        <div className="relative w-full h-64 bg-zinc-950 border-4 border-zinc-700 overflow-hidden mb-8">
          
          {/* Crane Rail */}
          <div className="absolute top-0 left-0 w-full h-4 bg-zinc-800 border-b border-zinc-600" />
          
          {/* Crane Assembly */}
          <div 
            className="absolute top-4 w-10 flex flex-col items-center z-10 transition-transform"
            style={{ 
              left: `calc(${cranePos}% - 20px)`,
              transform: `translateY(${craneState === 'dropping' || craneState === 'grabbing' ? '140px' : '0px'})`,
              transitionDuration: craneState === 'moving' ? '0s' : '0.5s',
              transitionTimingFunction: 'linear'
            }}
          >
            {/* Cable */}
            <div className="w-1 h-32 bg-zinc-500 -mt-32" />
            
            {/* Claw */}
            <div className="relative w-10 h-10">
              <div className="absolute top-0 w-full h-2 bg-zinc-400" />
              <div className={`absolute left-0 w-2 h-8 bg-zinc-400 origin-top transition-transform ${craneState === 'grabbing' || craneState === 'returning' ? 'rotate-12' : '-rotate-12'}`} />
              <div className={`absolute right-0 w-2 h-8 bg-zinc-400 origin-top transition-transform ${craneState === 'grabbing' || craneState === 'returning' ? '-rotate-12' : 'rotate-12'}`} />
              
              {/* Grabbed Item */}
              {grabbedChar && (
                <div className="absolute top-4 left-1 w-8 h-8 bg-green-500 flex items-center justify-center text-black font-bold border border-green-700">
                  {grabbedChar}
                </div>
              )}
            </div>
          </div>

          {/* Letter Grid */}
          <div className="absolute bottom-0 w-full flex">
            {grid.map((char, i) => (
              <div 
                key={i} 
                className="flex-1 h-12 bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold"
              >
                {char}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleGrab}
          disabled={craneState !== 'moving' || hasWon || (typedText.length > 0 && !TARGET_WORD.startsWith(typedText))}
          className="w-full max-w-xs py-4 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white font-bold tracking-widest rounded-full shadow-[0_4px_0_#854d0e] active:translate-y-1 active:shadow-none transition-all"
        >
          DROP CLAW
        </button>

      </div>
    </GameLayout>
  );
};
