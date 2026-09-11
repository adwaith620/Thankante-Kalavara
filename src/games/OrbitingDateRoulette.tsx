import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface OrbitNode {
  id: string;
  label: string;
  angle: number; // 0 to 2PI
  isTarget: boolean;
  type: 'month' | 'day';
}

export const OrbitingDateRoulette = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  
  const [targetMonth] = useState(MONTHS[Math.floor(Math.random() * 12)]);
  const [targetDay] = useState(Math.floor(Math.random() * 28) + 1);
  
  const [stage, setStage] = useState<'month' | 'day'>('month');
  
  // Node state
  const [monthNodes, setMonthNodes] = useState<OrbitNode[]>([]);
  const [dayNodes, setDayNodes] = useState<OrbitNode[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const speedRef = useRef({ monthSpeed: 0.005, daySpeed: -0.008 });

  useEffect(() => {
    recordAttempt();
    
    // Init month nodes
    const mNodes: OrbitNode[] = [];
    MONTHS.forEach((m, i) => {
      mNodes.push({
        id: `m-${i}`,
        label: m,
        angle: (i / 12) * Math.PI * 2,
        isTarget: m === targetMonth,
        type: 'month'
      });
    });
    setMonthNodes(mNodes);

    // Init day nodes (just 1 to 31)
    const dNodes: OrbitNode[] = [];
    for (let i = 1; i <= 31; i++) {
      dNodes.push({
        id: `d-${i}`,
        label: i.toString(),
        angle: (i / 31) * Math.PI * 2,
        isTarget: i === targetDay,
        type: 'day'
      });
    }
    setDayNodes(dNodes);
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

  // Physics loop
  useEffect(() => {
    if (hasWon || isLost) return;

    const gameLoop = () => {
      setMonthNodes(prev => prev.map(n => ({
        ...n,
        angle: n.angle + speedRef.current.monthSpeed
      })));
      
      setDayNodes(prev => prev.map(n => ({
        ...n,
        angle: n.angle + speedRef.current.daySpeed
      })));

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [hasWon, isLost]);

  const handleNodeClick = (node: OrbitNode) => {
    if (hasWon || isLost) return;
    
    if (node.type !== stage) return; // ignore clicking days when in month stage
    
    if (node.isTarget) {
      if (stage === 'month') {
        setStage('day');
        // Increase speed for days to make it harder
        speedRef.current.daySpeed = -0.015;
        speedRef.current.monthSpeed = 0.01;
      } else {
        setHasWon(true);
        completeGame('orbiting-date-roulette');
      }
    } else {
      setIsLost(true);
      recordFailure();
    }
  };

  const handleReset = () => {
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(30);
    setStage('month');
    speedRef.current = { monthSpeed: 0.005, daySpeed: -0.008 };
  };

  const getStatusMessage = () => {
    if (isLost) return "You clicked the wrong target or ran out of time.";
    if (hasWon) return "Incredible accuracy. Date locked.";
    return `Click the correct ${stage}. Time remaining: ${timeLeft}s`;
  };

  return (
    <GameLayout 
      gameId="orbiting-date-roulette"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="flex flex-col items-center py-4 w-full max-w-2xl mx-auto font-mono select-none">
        
        <div className="flex w-full justify-center mb-8 px-4 text-center">
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded min-w-[200px]">
            <div className="text-zinc-500 text-xs mb-1">TARGET DATE</div>
            <div className="text-xl text-green-400 font-bold">{targetMonth} {targetDay}</div>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="relative w-full aspect-square max-w-[500px] bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden flex items-center justify-center touch-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"
        >
          {/* Month Orbit Ring */}
          <div className="absolute w-[60%] h-[60%] border-2 border-zinc-700/50 rounded-full pointer-events-none" />
          
          {/* Day Orbit Ring */}
          <div className="absolute w-[90%] h-[90%] border-2 border-zinc-700/50 rounded-full pointer-events-none" />

          {/* Center */}
          <div className="absolute w-12 h-12 bg-zinc-800 border-2 border-zinc-600 rounded-full flex items-center justify-center pointer-events-none z-10 shadow-lg">
            <div className={`w-4 h-4 rounded-full ${stage === 'month' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
          </div>

          {/* Month Nodes */}
          {monthNodes.map(node => {
            const radius = 30; // 60% / 2
            const left = 50 + Math.cos(node.angle) * radius;
            const top = 50 + Math.sin(node.angle) * radius;
            return (
              <button
                key={node.id}
                onClick={() => handleNodeClick(node)}
                disabled={hasWon || isLost || stage !== 'month'}
                className={`absolute w-10 h-10 md:w-12 md:h-12 -ml-5 -mt-5 md:-ml-6 md:-mt-6 rounded-full border-2 flex items-center justify-center text-xs md:text-sm font-bold shadow-lg transition-transform active:scale-90 ${stage === 'month' ? 'border-blue-500 bg-blue-900/80 hover:bg-blue-600 text-white cursor-pointer z-20' : 'border-zinc-700 bg-zinc-800 text-zinc-600 cursor-default opacity-30 z-0'}`}
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                {node.label}
              </button>
            );
          })}

          {/* Day Nodes */}
          {dayNodes.map(node => {
            const radius = 45; // 90% / 2
            const left = 50 + Math.cos(node.angle) * radius;
            const top = 50 + Math.sin(node.angle) * radius;
            return (
              <button
                key={node.id}
                onClick={() => handleNodeClick(node)}
                disabled={hasWon || isLost || stage !== 'day'}
                className={`absolute w-8 h-8 md:w-10 md:h-10 -ml-4 -mt-4 md:-ml-5 md:-mt-5 rounded-full border border-zinc-500 flex items-center justify-center text-xs md:text-sm shadow-md transition-transform active:scale-90 ${stage === 'day' ? 'border-green-500 bg-green-900/80 hover:bg-green-600 text-white cursor-pointer z-20' : 'border-zinc-700 bg-zinc-800 text-zinc-600 cursor-default opacity-30 z-0'}`}
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                {node.label}
              </button>
            );
          })}

        </div>
        
      </div>
    </GameLayout>
  );
};
