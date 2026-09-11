import { useState, useEffect } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';
import { Check, X } from 'lucide-react';

const PASSWORDS = [
  { text: "admin123", hint: "The default router login password followed by 123." },
  { text: "password123", hint: "The most common password in the world, followed by the three most common numbers." },
  { text: "qwertyuiop", hint: "Just slide your finger across the top row of your keyboard." },
  { text: "iloveyou", hint: "A phrase you rarely hear from your parents." },
  { text: "hunter2", hint: "A legendary meme password that shows up as *******." },
  { text: "12345678", hint: "Just count to 8." },
  { text: "letmein1", hint: "A polite request to enter, appended with a 1." },
  { text: "sunshine", hint: "That bright yellow thing in the sky you haven't seen in days." },
  { text: "monkey", hint: "Our evolutionary ancestor. Also a terrible password." },
  { text: "dragon", hint: "A mythical fire-breathing reptile." },
  { text: "football", hint: "A sport where you kick a ball with your foot." }
];

export const PasswordTorture = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  const [target, setTarget] = useState(() => PASSWORDS[Math.floor(Math.random() * PASSWORDS.length)]);
  const [input, setInput] = useState("");
  const [hasWon, setHasWon] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Enter your password to continue.");
  
  useEffect(() => {
    recordAttempt();
  }, []);

  const handleReset = () => {
    setTarget(PASSWORDS[Math.floor(Math.random() * PASSWORDS.length)]);
    setInput("");
    setHasWon(false);
    setStatusMessage("Enter your password to continue.");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasWon) return;
    const val = e.target.value;
    setInput(val);
    
    if (val === target.text) {
      setHasWon(true);
      completeGame('password-torture');
      setStatusMessage("Congratulations. You have successfully leaked your own password.");
    } else if (val.length >= target.text.length && val !== target.text) {
      recordFailure();
    }
  };

  // Generate validation array
  const validation = Array.from({ length: Math.max(input.length, target.text.length) }).map((_, i) => {
    if (i >= input.length) return null; // Not typed yet
    return input[i] === target.text[i];
  });

  const getAbsurdMessage = () => {
    if (input.length === 0) return "We take security extremely seriously.";
    if (input.length < 5) return "Your password is too weak. And mostly wrong.";
    if (input.length > target.text.length) return "Too many characters. We ran out of storage.";
    
    const correctCount = validation.filter(v => v === true).length;
    if (correctCount === 0) return "Incredible. Literally every character is wrong.";
    if (correctCount === target.text.length - 1) return "You are sweating right now, aren't you?";
    return `Security score: ${correctCount * 7.4}%`;
  };

  return (
    <GameLayout 
      gameId="password-torture"
      onReset={handleReset}
      statusMessage={statusMessage}
      statusType={hasWon ? 'success' : 'info'}
    >
      <div className="flex flex-col items-center justify-center py-12 w-full max-w-xl mx-auto">
        <div className="w-full mb-8 relative">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            className="w-full bg-zinc-900 border border-zinc-700 p-4 text-2xl font-mono tracking-widest text-center focus:outline-none focus:border-green-500 rounded"
            placeholder="TYPE HERE"
            maxLength={target.text.length + 5}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <div className="text-center font-mono text-xs text-zinc-500 mt-2">
            HINT: {target.hint}
          </div>
        </div>

        <div className="w-full">
          <div className="flex justify-center flex-wrap gap-2 mb-8">
            {validation.map((isCorrect, i) => (
              <div 
                key={i}
                className={`w-10 h-10 flex items-center justify-center border rounded ${
                  isCorrect === null 
                    ? 'border-zinc-800 bg-zinc-900/50 text-transparent' 
                    : isCorrect 
                      ? 'border-green-500 bg-green-500/20 text-green-500' 
                      : 'border-red-500 bg-red-500/20 text-red-500'
                }`}
              >
                {isCorrect === null ? '?' : isCorrect ? <Check size={20} /> : <X size={20} />}
              </div>
            ))}
          </div>

          {!hasWon && (
            <div className="text-center font-mono text-zinc-400 bg-zinc-900/50 p-4 rounded border border-zinc-800">
              {getAbsurdMessage()}
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
};
