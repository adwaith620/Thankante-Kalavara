import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

const TARGET_WORD = "hello";
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

export const ArtilleryKeyboard = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  const [typedText, setTypedText] = useState("");
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [lives, setLives] = useState(3);
  const [wind, setWind] = useState(0);
  
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [gravity, setGravity] = useState(9.8);
  
  const [projectile, setProjectile] = useState<{ x: number, y: number, active: boolean } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    recordAttempt();
    setWind(Math.round((Math.random() * 10 - 5) * 10) / 10);
  }, []);

  // Timer
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

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Cannon
    ctx.fillStyle = '#52525b';
    ctx.beginPath();
    ctx.arc(30, canvas.height - 30, 20, Math.PI, 0);
    ctx.fill();
    
    ctx.save();
    ctx.translate(30, canvas.height - 30);
    ctx.rotate((-angle * Math.PI) / 180);
    ctx.fillStyle = '#71717a';
    ctx.fillRect(0, -10, 40, 20);
    ctx.restore();

    // Draw Alphabet Targets
    const targetWidth = (canvas.width - 60) / 26;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < 26; i++) {
      const x = 60 + i * targetWidth;
      const y = canvas.height - 20;
      
      // Highlight the next needed letter
      const neededChar = TARGET_WORD[typedText.length];
      if (ALPHABET[i] === neededChar) {
        ctx.fillStyle = '#14532d';
      } else {
        ctx.fillStyle = '#27272a';
      }
      ctx.fillRect(x, y, targetWidth - 2, 20);
      
      ctx.fillStyle = ALPHABET[i] === neededChar ? '#22c55e' : '#a1a1aa';
      ctx.fillText(ALPHABET[i], x + targetWidth / 2, y + 14);
    }

    // NO trajectory preview - removed for difficulty

    // Draw wind indicator
    ctx.fillStyle = '#3b82f6';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`WIND: ${wind > 0 ? '+' : ''}${wind}`, canvas.width - 10, 15);
    // Wind arrow
    const arrowX = canvas.width - 60;
    const arrowY = 10;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX + wind * 5, arrowY);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Projectile
    if (projectile && projectile.active) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    drawScene();
  }, [angle, power, gravity, projectile, typedText, wind]);

  const handleLaunch = () => {
    if (hasWon || isLost || (projectile && projectile.active)) return;
    
    const canvas = canvasRef.current!;
    const startX = 30;
    const startY = canvas.height - 30;
    const vx = Math.cos((angle * Math.PI) / 180) * power;
    const vy = -Math.sin((angle * Math.PI) / 180) * power;
    let t = 0;

    const updateFlight = () => {
      t += 0.15;
      const nextX = startX + vx * t + wind * t * 0.5;
      const nextY = startY + vy * t + 0.5 * gravity * t * t;
      
      if (nextY >= canvas.height - 20) {
        setProjectile({ x: nextX, y: nextY, active: false });
        
        const targetWidth = (canvas.width - 60) / 26;
        const index = Math.floor((nextX - 60) / targetWidth);
        
        if (index >= 0 && index < 26) {
          const char = ALPHABET[index];
          const neededChar = TARGET_WORD[typedText.length];
          
          if (char === neededChar) {
            const newText = typedText + char;
            setTypedText(newText);
            
            if (newText === TARGET_WORD) {
              setHasWon(true);
              completeGame('artillery-keyboard');
            }
          } else {
            // Wrong letter - costs a life
            setLives(prev => {
              const next = prev - 1;
              if (next <= 0) {
                setIsLost(true);
                recordFailure();
              }
              return next;
            });
          }
        } else {
          // Missed entirely - costs a life
          setLives(prev => {
            const next = prev - 1;
            if (next <= 0) {
              setIsLost(true);
              recordFailure();
            }
            return next;
          });
        }
        
        // New wind after each shot
        setWind(Math.round((Math.random() * 10 - 5) * 10) / 10);
        return;
      }

      setProjectile({ x: nextX, y: nextY, active: true });
      animationRef.current = requestAnimationFrame(updateFlight);
    };

    updateFlight();
  };

  const handleReset = () => {
    setTypedText("");
    setHasWon(false);
    setIsLost(false);
    setAngle(45);
    setPower(50);
    setGravity(9.8);
    setProjectile(null);
    setTimeLeft(120);
    setLives(3);
    setWind(Math.round((Math.random() * 10 - 5) * 10) / 10);
  };

  const getStatusMessage = () => {
    if (hasWon) return "Target destroyed. I mean, word typed.";
    if (isLost && lives <= 0) return "Out of lives. Artillery unit disbanded.";
    if (isLost) return "Time expired. Mission failed.";
    return `Next letter: '${TARGET_WORD[typedText.length] || ''}' | Lives: ${'❤️'.repeat(lives)} | Wind: ${wind > 0 ? '+' : ''}${wind} | Time: ${timeLeft}s`;
  };

  return (
    <GameLayout 
      gameId="artillery-keyboard"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="flex flex-col items-center py-4 w-full max-w-2xl mx-auto font-mono">
        
        <div className="flex w-full justify-between mb-6 text-center">
          <div className="bg-zinc-900 border border-zinc-700 p-3 rounded w-32">
            <div className="text-zinc-500 text-xs mb-1">TARGET</div>
            <div className="text-lg text-green-400 font-bold tracking-widest">{TARGET_WORD}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 p-3 rounded w-32">
            <div className="text-zinc-500 text-xs mb-1">TYPED</div>
            <div className="text-lg text-white font-bold tracking-widest min-h-[28px]">{typedText || '_'}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 p-3 rounded">
            <div className="text-zinc-500 text-xs mb-1">LIVES</div>
            <div className="text-lg font-bold">{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</div>
          </div>
        </div>

        <div className="w-full bg-zinc-950 border border-zinc-700 rounded mb-6 overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={200}
            className="w-full bg-gradient-to-b from-zinc-900 to-black"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">
          <div>
            <label className="flex justify-between text-xs text-zinc-400 mb-2">
              <span>ANGLE</span>
              <span>{angle}°</span>
            </label>
            <input type="range" min="0" max="90" value={angle} onChange={e => setAngle(Number(e.target.value))} disabled={!!projectile?.active || hasWon || isLost} className="w-full" />
          </div>
          <div>
            <label className="flex justify-between text-xs text-zinc-400 mb-2">
              <span>POWER</span>
              <span>{power}</span>
            </label>
            <input type="range" min="10" max="150" value={power} onChange={e => setPower(Number(e.target.value))} disabled={!!projectile?.active || hasWon || isLost} className="w-full" />
          </div>
          <div>
            <label className="flex justify-between text-xs text-zinc-400 mb-2">
              <span>GRAVITY</span>
              <span>{gravity}</span>
            </label>
            <input type="range" min="1" max="30" step="0.1" value={gravity} onChange={e => setGravity(Number(e.target.value))} disabled={!!projectile?.active || hasWon || isLost} className="w-full" />
          </div>
        </div>

        <button 
          onClick={handleLaunch}
          disabled={!!projectile?.active || hasWon || isLost}
          className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold tracking-widest rounded"
        >
          FIRE PROJECTILE
        </button>

      </div>
    </GameLayout>
  );
};
