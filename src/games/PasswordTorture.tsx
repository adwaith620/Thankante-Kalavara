import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let pw = '';
  for (let i = 0; i < 10; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
};

export const PasswordTorture = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  const [targetPassword, setTargetPassword] = useState(generatePassword());
  const [input, setInput] = useState("");
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const targetRef = useRef(targetPassword);

  useEffect(() => {
    targetRef.current = targetPassword;
  }, [targetPassword]);

  useEffect(() => {
    recordAttempt();
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

  // Escalating hints every 10 seconds
  useEffect(() => {
    if (hasWon || isLost) return;
    const elapsed = 90 - timeLeft;
    const pw = targetRef.current;
    const newHints: string[] = [];

    if (elapsed >= 10) newHints.push(`The password has ${pw.length} characters`);
    if (elapsed >= 20) {
      const pos = (pw.charCodeAt(2) % pw.length);
      newHints.push(`Character #${pos + 1} is "${pw[pos]}"`);
    }
    if (elapsed >= 30) {
      const vowels = pw.split('').filter(c => 'aeiou'.includes(c)).length;
      newHints.push(`The password contains ${vowels} vowel${vowels !== 1 ? 's' : ''}`);
    }
    if (elapsed >= 40) {
      const p1 = 1, p2 = pw.length - 2;
      newHints.push(`Characters #${p1 + 1} and #${p2 + 1} are "${pw[p1]}" and "${pw[p2]}"`);
    }
    if (elapsed >= 50) {
      newHints.push(`Starts with "${pw.slice(0, 2)}"`);
    }
    if (elapsed >= 60) {
      newHints.push(`Ends with "${pw.slice(-2)}"`);
    }
    if (elapsed >= 70) {
      const masked = pw.split('').map((c, i) => i % 2 === 0 ? '_' : c).join('');
      newHints.push(`Pattern: ${masked}`);
    }
    if (elapsed >= 80) {
      const hide1 = 3, hide2 = 6;
      const revealed = pw.split('').map((c, i) => (i === hide1 || i === hide2) ? '_' : c).join('');
      newHints.push(`Almost there: ${revealed}`);
    }

    setHints(newHints);
  }, [timeLeft, hasWon, isLost]);

  const handleReset = () => {
    const newPw = generatePassword();
    setTargetPassword(newPw);
    targetRef.current = newPw;
    setInput("");
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(90);
    setWrongAttempts(0);
    setHints([]);
  };

  const handleSubmit = () => {
    if (hasWon || isLost) return;
    
    if (input === targetPassword) {
      setHasWon(true);
      completeGame('password-torture');
    } else {
      const next = wrongAttempts + 1;
      setWrongAttempts(next);
      recordFailure();
      if (next >= 10) {
        setIsLost(true);
      }
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const getStatusMessage = () => {
    if (hasWon) return "Congratulations. You have successfully leaked your own password.";
    if (isLost) return wrongAttempts >= 10 
      ? `Account locked after ${wrongAttempts} failed attempts. The password was: ${targetPassword}`
      : `Time expired. The password was: ${targetPassword}`;
    return `Enter your password to continue. Time: ${timeLeft}s | Attempts: ${wrongAttempts}/10`;
  };

  return (
    <GameLayout 
      gameId="password-torture"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="flex flex-col items-center justify-center py-8 w-full max-w-xl mx-auto">
        <div className="w-full mb-6 relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => { if (!hasWon && !isLost) setInput(e.target.value); }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-zinc-900 border border-zinc-700 p-4 text-2xl font-mono tracking-widest text-center focus:outline-none focus:border-green-500 rounded"
              placeholder="TYPE PASSWORD"
              maxLength={30}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              onClick={handleSubmit}
              disabled={hasWon || isLost || input.length === 0}
              className="px-6 bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 disabled:opacity-40 font-mono font-bold rounded transition-colors"
            >
              SUBMIT
            </button>
          </div>
          <div className="text-center font-mono text-xs text-zinc-600 mt-2">
            We take security extremely seriously. No hints will be provided.
          </div>
        </div>

        {/* Wrong attempt counter */}
        <div className="w-full flex justify-center gap-1 mb-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i}
              className={`w-6 h-6 rounded-full border-2 ${
                i < wrongAttempts 
                  ? 'border-red-500 bg-red-500/30' 
                  : 'border-zinc-700 bg-zinc-900'
              }`}
            />
          ))}
        </div>

        {/* Hints area */}
        {hints.length > 0 && !hasWon && (
          <div className="w-full space-y-2 mb-6">
            <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest text-center mb-2">
              SECURITY LEAKS DETECTED
            </div>
            {hints.map((hint, i) => (
              <div 
                key={i}
                className="bg-zinc-900/80 border border-zinc-800 p-3 rounded font-mono text-sm text-zinc-300 animate-in fade-in slide-in-from-left-2"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-yellow-500 mr-2">LEAK #{i + 1}:</span>
                {hint}
              </div>
            ))}
          </div>
        )}

        {!hasWon && !isLost && (
          <div className="text-center font-mono text-zinc-500 text-xs">
            Wait for security leaks to appear. They might help.
          </div>
        )}
      </div>
    </GameLayout>
  );
};
