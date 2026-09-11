import { useState, useEffect } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';
import { Delete } from 'lucide-react';

const TARGET_WORD = "this is horrible";

// Standard keyboard layout definitions
const STANDARD_KEYS = [
  { id: 'Backquote', label: '`', type: 'char', width: 'w-10' },
  { id: 'Digit1', label: '1', type: 'char', width: 'w-10' },
  { id: 'Digit2', label: '2', type: 'char', width: 'w-10' },
  { id: 'Digit3', label: '3', type: 'char', width: 'w-10' },
  { id: 'Digit4', label: '4', type: 'char', width: 'w-10' },
  { id: 'Digit5', label: '5', type: 'char', width: 'w-10' },
  { id: 'Digit6', label: '6', type: 'char', width: 'w-10' },
  { id: 'Digit7', label: '7', type: 'char', width: 'w-10' },
  { id: 'Digit8', label: '8', type: 'char', width: 'w-10' },
  { id: 'Digit9', label: '9', type: 'char', width: 'w-10' },
  { id: 'Digit0', label: '0', type: 'char', width: 'w-10' },
  { id: 'Minus', label: '-', type: 'char', width: 'w-10' },
  { id: 'Equal', label: '=', type: 'char', width: 'w-10' },
  { id: 'Backspace', label: 'Backspace', type: 'action', width: 'w-20' },
  
  { id: 'Tab', label: 'Tab', type: 'action', width: 'w-16' },
  { id: 'KeyQ', label: 'q', type: 'char', width: 'w-10' },
  { id: 'KeyW', label: 'w', type: 'char', width: 'w-10' },
  { id: 'KeyE', label: 'e', type: 'char', width: 'w-10' },
  { id: 'KeyR', label: 'r', type: 'char', width: 'w-10' },
  { id: 'KeyT', label: 't', type: 'char', width: 'w-10' },
  { id: 'KeyY', label: 'y', type: 'char', width: 'w-10' },
  { id: 'KeyU', label: 'u', type: 'char', width: 'w-10' },
  { id: 'KeyI', label: 'i', type: 'char', width: 'w-10' },
  { id: 'KeyO', label: 'o', type: 'char', width: 'w-10' },
  { id: 'KeyP', label: 'p', type: 'char', width: 'w-10' },
  { id: 'BracketLeft', label: '[', type: 'char', width: 'w-10' },
  { id: 'BracketRight', label: ']', type: 'char', width: 'w-10' },
  { id: 'Backslash', label: '\\', type: 'char', width: 'w-14' },
  
  { id: 'Caps', label: 'Caps Lock', type: 'action', width: 'w-20' },
  { id: 'KeyA', label: 'a', type: 'char', width: 'w-10' },
  { id: 'KeyS', label: 's', type: 'char', width: 'w-10' },
  { id: 'KeyD', label: 'd', type: 'char', width: 'w-10' },
  { id: 'KeyF', label: 'f', type: 'char', width: 'w-10' },
  { id: 'KeyG', label: 'g', type: 'char', width: 'w-10' },
  { id: 'KeyH', label: 'h', type: 'char', width: 'w-10' },
  { id: 'KeyJ', label: 'j', type: 'char', width: 'w-10' },
  { id: 'KeyK', label: 'k', type: 'char', width: 'w-10' },
  { id: 'KeyL', label: 'l', type: 'char', width: 'w-10' },
  { id: 'Semicolon', label: ';', type: 'char', width: 'w-10' },
  { id: 'Quote', label: '\'', type: 'char', width: 'w-10' },
  { id: 'Enter', label: 'Enter', type: 'action', width: 'w-20' },
  
  { id: 'ShiftLeft', label: 'Shift', type: 'action', width: 'w-24' },
  { id: 'KeyZ', label: 'z', type: 'char', width: 'w-10' },
  { id: 'KeyX', label: 'x', type: 'char', width: 'w-10' },
  { id: 'KeyC', label: 'c', type: 'char', width: 'w-10' },
  { id: 'KeyV', label: 'v', type: 'char', width: 'w-10' },
  { id: 'KeyB', label: 'b', type: 'char', width: 'w-10' },
  { id: 'KeyN', label: 'n', type: 'char', width: 'w-10' },
  { id: 'KeyM', label: 'm', type: 'char', width: 'w-10' },
  { id: 'Comma', label: ',', type: 'char', width: 'w-10' },
  { id: 'Period', label: '.', type: 'char', width: 'w-10' },
  { id: 'Slash', label: '/', type: 'char', width: 'w-10' },
  { id: 'ShiftRight', label: 'Shift', type: 'action', width: 'w-24' },
  
  { id: 'CtrlLeft', label: 'Ctrl', type: 'action', width: 'w-16' },
  { id: 'WinLeft', label: 'Win', type: 'action', width: 'w-12' },
  { id: 'AltLeft', label: 'Alt', type: 'action', width: 'w-12' },
  { id: 'Space', label: 'Space', type: 'action', width: 'w-64 flex-grow' },
  { id: 'AltRight', label: 'Alt', type: 'action', width: 'w-12' },
  { id: 'WinRight', label: 'Win', type: 'action', width: 'w-12' },
  { id: 'CtrlRight', label: 'Ctrl', type: 'action', width: 'w-16' }
];

export const ShufflingKeyboard = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  
  const [typedText, setTypedText] = useState("");
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  
  // Maps physical slot index to logical key data
  const [keyMapping, setKeyMapping] = useState(() => {
    return [...STANDARD_KEYS];
  });

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

  useEffect(() => {
    if (hasWon || isLost) return;
    
    // Shuffle every 1 second
    const shuffleInterval = setInterval(() => {
      setKeyMapping(prev => {
        const shuffled = [...prev];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      });
    }, 1000);
    
    return () => clearInterval(shuffleInterval);
  }, [hasWon, isLost]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasWon || isLost) return;
      e.preventDefault(); // Prevent default browser actions
      
      // Find the physical key pressed, then look up its current logical mapping
      const physicalIndex = STANDARD_KEYS.findIndex(k => {
        if (e.code === k.id) return true;
        // fallback matching
        if (e.key === ' ' && k.id === 'Space') return true;
        return false;
      });
      
      if (physicalIndex !== -1) {
        const logicalKey = keyMapping[physicalIndex];
        handleLogicalKeyPress(logicalKey.label);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasWon, isLost, keyMapping, typedText]);

  const handleLogicalKeyPress = (label: string) => {
    if (hasWon || isLost) return;
    
    let newText = typedText;
    
    if (label === 'Backspace') {
      newText = newText.slice(0, -1);
    } else if (label === 'Space') {
      newText += ' ';
    } else if (['Tab', 'Caps Lock', 'Shift', 'Ctrl', 'Win', 'Alt', 'Enter'].includes(label)) {
      // ignore
      return;
    } else {
      newText += label;
    }
    
    setTypedText(newText);
    
    if (newText === TARGET_WORD) {
      setHasWon(true);
      completeGame('shuffling-keyboard');
    } else if (newText.length > 0 && !TARGET_WORD.startsWith(newText)) {
      recordFailure();
    }
  };

  const handleReset = () => {
    setTypedText("");
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(120);
    setKeyMapping([...STANDARD_KEYS]);
  };

  const getStatusMessage = () => {
    if (isLost) return "Time limit exceeded. You typed too slowly.";
    if (hasWon) return "Impressive typing skills. Carpal tunnel awaits.";
    if (typedText && !TARGET_WORD.startsWith(typedText)) return `Typo detected. Backspace to fix it! Time: ${timeLeft}s`;
    return `Type the target word using the scrambled layout. Time: ${timeLeft}s`;
  };

  return (
    <GameLayout 
      gameId="shuffling-keyboard"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : (typedText && !TARGET_WORD.startsWith(typedText) ? 'error' : 'info'))}
    >
      <div className="flex flex-col items-center py-4 w-full max-w-4xl mx-auto font-mono select-none">
        
        <div className="flex w-full justify-between mb-8 text-center px-4">
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded min-w-[200px]">
            <div className="text-zinc-500 text-xs mb-1">TARGET WORD</div>
            <div className="text-xl text-green-400 font-bold tracking-widest">{TARGET_WORD}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded min-w-[200px]">
            <div className="text-zinc-500 text-xs mb-1">TYPED TEXT</div>
            <div className="text-xl text-white font-bold tracking-widest min-h-[28px]">{typedText || '_'}</div>
          </div>
        </div>

        <div className="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-lg flex flex-wrap gap-2 justify-center max-w-[850px]">
          {STANDARD_KEYS.map((physicalKey, i) => {
            const logicalKey = keyMapping[i];
            return (
              <button
                key={physicalKey.id}
                onClick={() => handleLogicalKeyPress(logicalKey.label)}
                disabled={hasWon || isLost}
                className={`
                  flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 
                  active:bg-zinc-600 active:scale-95 border border-zinc-600 rounded 
                  font-bold transition-all shadow-md overflow-hidden text-ellipsis whitespace-nowrap
                  h-12 ${physicalKey.width}
                `}
                title={`Physical Key: ${physicalKey.label}`}
              >
                {logicalKey.label === 'Backspace' ? <Delete size={20} /> : logicalKey.label}
              </button>
            );
          })}
        </div>
      </div>
    </GameLayout>
  );
};
