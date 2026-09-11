import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';
import Matter from 'matter-js';

export const DeleteAccountPachinko = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [result, setResult] = useState<'yes' | 'no' | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  useEffect(() => {
    recordAttempt();
    return () => {
      cleanupPhysics();
    };
  }, []);

  const cleanupPhysics = () => {
    if (renderRef.current) {
      Matter.Render.stop(renderRef.current);
      renderRef.current.canvas.remove();
    }
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
    }
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
    }
  };

  const handleReset = () => {
    cleanupPhysics();
    setGameState('idle');
    setResult(null);
  };

  const startGame = () => {
    setGameState('playing');
    
    if (!sceneRef.current) return;
    
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Events = Matter.Events;

    const engine = Engine.create();
    engineRef.current = engine;
    
    const width = sceneRef.current.clientWidth;
    const height = 500;
    
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent'
      }
    });
    renderRef.current = render;

    // Create Pegs
    const pegs = [];
    const rows = 8;
    const spacing = width / 10;
    
    for (let row = 0; row < rows; row++) {
      const isOffset = row % 2 === 1;
      const cols = isOffset ? 9 : 10;
      
      for (let col = 0; col < cols; col++) {
        const x = col * spacing + (isOffset ? spacing * 1.5 : spacing);
        const y = 100 + row * 40;
        pegs.push(Bodies.circle(x, y, 6, { 
          isStatic: true,
          render: { fillStyle: '#3f3f46' } // zinc-700
        }));
      }
    }

    // Create walls
    const wallOptions = { isStatic: true, render: { fillStyle: '#3f3f46' } };
    const leftWall = Bodies.rectangle(0, height / 2, 20, height, wallOptions);
    const rightWall = Bodies.rectangle(width, height / 2, 20, height, wallOptions);
    
    // Create bins
    const binSeparator = Bodies.rectangle(width / 2, height - 40, 10, 80, wallOptions);
    
    const yesZone = Bodies.rectangle(width / 4, height - 10, width / 2, 20, { 
      isStatic: true, 
      isSensor: true,
      label: 'yesZone',
      render: { fillStyle: 'rgba(239, 68, 68, 0.2)' } // red-500
    });
    
    const noZone = Bodies.rectangle((width / 4) * 3, height - 10, width / 2, 20, { 
      isStatic: true, 
      isSensor: true,
      label: 'noZone',
      render: { fillStyle: 'rgba(34, 197, 94, 0.2)' } // green-500
    });

    const startX = width * 0.5 + (Math.random() * 20 - 10);
    const ball = Bodies.circle(startX, 20, 12, {
      restitution: 0.6,
      friction: 0.05,
      density: 0.04,
      render: {
        fillStyle: '#10b981', // emerald-500
        strokeStyle: '#047857',
        lineWidth: 2
      }
    });

    Composite.add(engine.world, [
      ...pegs, leftWall, rightWall, binSeparator, yesZone, noZone, ball
    ]);

    // Handle collisions with the bottom zones
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        if (bodyA === ball || bodyB === ball) {
          const other = bodyA === ball ? bodyB : bodyA;
          
          if (other.label === 'yesZone') {
            setResult('yes');
            handleEnd('yes');
          } else if (other.label === 'noZone') {
            setResult('no');
            handleEnd('no');
          }
        }
      });
    });

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);
  };

  const handleEnd = (res: 'yes' | 'no') => {
    setGameState('result');
    if (runnerRef.current) {
      setTimeout(() => {
        if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      }, 1000);
    }
    
    if (res === 'yes') {
      recordFailure();
    } else {
      completeGame('delete-account-pachinko');
    }
  };

  const getStatusMessage = () => {
    if (gameState === 'idle') return "Please confirm your action.";
    if (gameState === 'playing') return "Your choice is being processed by physics.";
    if (result === 'yes') return "Your account has been deleted. Probably.";
    if (result === 'no') return "Your account survived. For now.";
  };

  const getStatusType = () => {
    if (gameState === 'idle') return 'info';
    if (gameState === 'playing') return 'warning';
    return result === 'no' ? 'success' : 'error';
  };

  return (
    <GameLayout 
      gameId="delete-account-pachinko"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={getStatusType()}
    >
      <div className="flex flex-col items-center w-full">
        {gameState === 'idle' && (
          <div className="py-20 text-center w-full max-w-md mx-auto animate-in fade-in zoom-in">
            <h2 className="text-xl font-bold mb-8 font-mono">Would you like to delete your account?</h2>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={startGame}
                className="w-full px-6 py-4 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 rounded font-mono transition-colors flex items-center gap-3"
              >
                <div className="w-5 h-5 border border-zinc-500 rounded flex-shrink-0" />
                YES, DELETE MY ACCOUNT
              </button>
              
              <button 
                onClick={startGame}
                className="w-full px-6 py-4 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 rounded font-mono transition-colors flex items-center gap-3"
              >
                <div className="w-5 h-5 border border-green-500 rounded flex-shrink-0 bg-green-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                </div>
                NO, KEEP MY ACCOUNT
              </button>
            </div>
          </div>
        )}

        {/* Physics Canvas Area */}
        <div 
          className={`w-full max-w-2xl mx-auto rounded-lg overflow-hidden relative transition-opacity duration-1000 ${gameState !== 'idle' ? 'opacity-100 h-[500px]' : 'opacity-0 h-0'}`}
        >
          {gameState !== 'idle' && (
            <div className="absolute bottom-0 w-full flex text-center font-mono text-xl font-bold z-10 pointer-events-none">
              <div className={`w-1/2 py-4 ${result === 'yes' ? 'bg-red-500/40 text-white' : 'bg-red-500/20 text-red-500/50'}`}>
                YES
              </div>
              <div className={`w-1/2 py-4 ${result === 'no' ? 'bg-green-500/40 text-white' : 'bg-green-500/20 text-green-500/50'}`}>
                NO
              </div>
            </div>
          )}
          <div ref={sceneRef} className="w-full h-full bg-zinc-950" />
        </div>
      </div>
    </GameLayout>
  );
};
