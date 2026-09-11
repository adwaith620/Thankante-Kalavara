import { useState, useEffect } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

const GRID_SIZE = 21; // Standard QR version 1 size

const generateQrPattern = () => {
  const pattern = new Array(GRID_SIZE * GRID_SIZE).fill(0);
  
  // Random fill
  for (let i = 0; i < pattern.length; i++) {
    pattern[i] = Math.random() < 0.5 ? 1 : 0;
  }

  // Draw finder patterns (7x7 black with 5x5 white inner, 3x3 black core)
  const drawFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isBorder = x === 0 || x === 6 || y === 0 || y === 6;
        const isCore = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        pattern[(startY + y) * GRID_SIZE + (startX + x)] = (isBorder || isCore) ? 1 : 0;
      }
    }
    // Add white separator around finder
    for (let i = 0; i < 8; i++) {
      if (startX + i < GRID_SIZE && startY + 7 < GRID_SIZE) pattern[(startY + 7) * GRID_SIZE + (startX + i)] = 0; // Bottom
      if (startX + 7 < GRID_SIZE && startY + i < GRID_SIZE) pattern[(startY + i) * GRID_SIZE + (startX + 7)] = 0; // Right
    }
  };

  drawFinder(0, 0); // Top left
  drawFinder(GRID_SIZE - 7, 0); // Top right
  drawFinder(0, GRID_SIZE - 7); // Bottom left

  return pattern;
};

export const QrPixelPainter = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  const [targetPattern, setTargetPattern] = useState(generateQrPattern());
  const [grid, setGrid] = useState<number[]>(new Array(GRID_SIZE * GRID_SIZE).fill(0));
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [paintMode, setPaintMode] = useState(1);

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

  const checkWin = (currentGrid: number[]) => {
    for (let i = 0; i < targetPattern.length; i++) {
      if (currentGrid[i] !== targetPattern[i]) return false;
    }
    return true;
  };

  const handleCellDown = (index: number) => {
    if (hasWon || isLost) return;
    setIsMouseDown(true);
    const newMode = grid[index] === 1 ? 0 : 1;
    setPaintMode(newMode);
    
    const newGrid = [...grid];
    newGrid[index] = newMode;
    setGrid(newGrid);
    
    if (checkWin(newGrid)) {
      setHasWon(true);
      completeGame('qr-pixel-painter');
    }
  };

  const handleCellEnter = (index: number) => {
    if (!isMouseDown || hasWon) return;
    
    const newGrid = [...grid];
    newGrid[index] = paintMode;
    setGrid(newGrid);
    
    if (checkWin(newGrid)) {
      setHasWon(true);
      completeGame('qr-pixel-painter');
    }
  };

  const handleClear = () => {
    setGrid(new Array(GRID_SIZE * GRID_SIZE).fill(0));
    recordFailure();
  };

  const handleReset = () => {
    setGrid(new Array(GRID_SIZE * GRID_SIZE).fill(0));
    setTargetPattern(generateQrPattern());
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(600);
    setPaintMode(1);
  };

  const getProgress = () => {
    let correct = 0;
    for (let i = 0; i < targetPattern.length; i++) {
      if (grid[i] === targetPattern[i]) correct++;
    }
    return Math.floor((correct / targetPattern.length) * 100);
  };

  const getStatusMessage = () => {
    if (isLost) return "Timeout. Your QR session expired.";
    if (hasWon) return "QR Code Accepted.";
    return `Paint the pixels to match. Time remaining: ${timeLeft}s`;
  };

  return (
    <GameLayout 
      gameId="qr-pixel-painter"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div 
        className="flex flex-col items-center py-4 w-full mx-auto font-mono select-none"
        onMouseUp={() => setIsMouseDown(false)}
        onMouseLeave={() => setIsMouseDown(false)}
      >
        <div className="flex w-full justify-center gap-6 mb-8 flex-wrap">
          
          <div className="flex flex-col items-center">
            <div className="text-zinc-500 text-xs mb-2">TARGET REFERENCE</div>
            <div 
              className="grid gap-0 bg-zinc-700 p-px border border-zinc-600"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            >
              {targetPattern.map((val, i) => (
                <div key={`ref-${i}`} className={`w-2 h-2 ${val === 1 ? 'bg-black' : 'bg-white'}`} />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="text-zinc-500 text-xs mb-1">MATCH ACCURACY</div>
            <div className={`text-3xl font-bold ${hasWon ? 'text-green-400' : 'text-white'}`}>
              {getProgress()}%
            </div>
          </div>

        </div>

        <div className="bg-white p-2 rounded mb-6 max-w-full overflow-auto">
          <div 
            className="grid gap-0 border-2 border-black min-w-max" 
            style={{ 
              touchAction: 'none',
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
            }}
          >
            {grid.map((val, i) => (
              <div 
                key={`cell-${i}`}
                onPointerDown={() => handleCellDown(i)}
                onPointerEnter={() => handleCellEnter(i)}
                className={`w-5 h-5 sm:w-6 sm:h-6 border border-zinc-200 cursor-crosshair ${val === 1 ? 'bg-black' : 'bg-white'}`}
              />
            ))}
          </div>
        </div>

        <button 
          onClick={handleClear}
          disabled={hasWon}
          className="px-6 py-2 bg-zinc-900 border border-zinc-700 hover:border-red-500 hover:text-red-400 text-zinc-300 font-mono text-sm rounded transition-colors"
        >
          CLEAR GRID
        </button>
      </div>
    </GameLayout>
  );
};
