import { useState, useEffect } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

const TARGET_NUMBER = 1353039;

export const PhoneNumberCalculator = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  const [current, setCurrent] = useState<number>(17);
  const [history, setHistory] = useState<number[]>([17]);
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isAdvanced, setIsAdvanced] = useState(false);

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


  const handleReset = () => {
    setCurrent(17);
    setHistory([17]);
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(45);
  };

  const undo = () => {
    if (history.length > 1 && !hasWon) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setCurrent(newHistory[newHistory.length - 1]);
    }
  };

  const applyOperation = (op: (n: number) => number) => {
    if (hasWon || isLost) return;
    const next = op(current);
    
    // Prevent Infinity or NaN
    if (!isFinite(next) || isNaN(next)) {
      recordFailure();
      return;
    }

    setCurrent(next);
    setHistory([...history, next]);

    if (next === TARGET_NUMBER) {
      setHasWon(true);
      completeGame('phone-number-calculator');
    }
  };

  const getStatusMessage = () => {
    if (isLost) return "Time is up. You failed.";
    if (!hasWon) return `Time remaining: ${timeLeft}s`;
    if (hasWon || isLost) return "Phone number successfully calculated.";
    if (isAdvanced) return "Advanced mode enabled. Your suffering has increased.";
    return "Your phone number is now a mathematical achievement.";
  };

  return (
    <GameLayout 
      gameId="phone-number-calculator"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
        
        <div className="w-full grid grid-cols-2 gap-4 mb-8 text-center font-mono">
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
            <div className="text-zinc-500 text-xs mb-1">TARGET PHONE NUMBER</div>
            <div className="text-2xl text-green-400 font-bold">{TARGET_NUMBER}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded relative overflow-hidden">
            <div className="text-zinc-500 text-xs mb-1">CURRENT NUMBER</div>
            <div className="text-2xl text-white font-bold">{current.toLocaleString('fullwide', {useGrouping:false})}</div>
          </div>
        </div>

        <div className="w-full bg-black border border-zinc-800 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button onClick={() => applyOperation(n => n * 3)} className="btn-op">× 3</button>
            <button onClick={() => applyOperation(n => n + 7)} className="btn-op">+ 7</button>
            <button onClick={() => applyOperation(n => n / 5)} className="btn-op">÷ 5</button>
            <button onClick={() => applyOperation(n => n - 2)} className="btn-op">− 2</button>
          </div>

          <div className="border-t border-zinc-800 pt-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-xs text-zinc-500">ADVANCED OPERATIONS</span>
              <button 
                onClick={() => setIsAdvanced(!isAdvanced)}
                className={`text-xs font-mono px-2 py-1 border rounded ${isAdvanced ? 'border-red-500 text-red-500 bg-red-900/20' : 'border-zinc-700 text-zinc-400'}`}
              >
                {isAdvanced ? 'DISABLE' : 'ENABLE'}
              </button>
            </div>
            
            {isAdvanced && (
              <div className="grid grid-cols-4 gap-2 animate-in fade-in zoom-in slide-in-from-top-2">
                <button onClick={() => applyOperation(n => Math.floor(n))} className="btn-op text-sm">FLOOR</button>
                <button onClick={() => applyOperation(n => Math.sqrt(n))} className="btn-op text-sm">√</button>
                <button onClick={() => applyOperation(n => Math.pow(n, 2))} className="btn-op text-sm">x²</button>
                <button onClick={() => applyOperation(n => Math.log10(n))} className="btn-op text-sm">LOG10</button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex justify-between">
          <button 
            onClick={undo}
            disabled={history.length <= 1 || hasWon}
            className="px-6 py-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 font-mono text-sm rounded transition-colors"
          >
            UNDO LAST
          </button>
          
          <div className="font-mono text-xs text-zinc-600 flex items-center">
            STEPS: {history.length - 1}
          </div>
        </div>

      </div>

      <style>{`
        .btn-op {
          background-color: #18181b; /* zinc-900 */
          border: 1px solid #3f3f46; /* zinc-700 */
          color: white;
          padding: 1rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 1.25rem;
          font-weight: bold;
          transition: all 0.2s;
        }
        .btn-op:hover {
          background-color: #27272a; /* zinc-800 */
          border-color: #22c55e; /* green-500 */
          color: #22c55e;
        }
        .btn-op:active {
          transform: scale(0.95);
        }
      `}</style>
    </GameLayout>
  );
};
