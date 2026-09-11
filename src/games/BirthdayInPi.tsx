import React, { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';

export const BirthdayInPi = () => {
  const { recordAttempt, recordFailure, completeGame } = useStore();
  const [dateStr, setDateStr] = useState('');
  const [piString, setPiString] = useState('');
  const [searchIndex, setSearchIndex] = useState('');
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [targetIndex, setTargetIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(120);
  const [guessesLeft, setGuessesLeft] = useState(5);
  const [feedback, setFeedback] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    recordAttempt();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsLost(true);
          recordFailure();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDateStr('');
    setPiString('');
    setSearchIndex('');
    setHasWon(false);
    setIsLost(false);
    setErrorMsg('');
    setTargetIndex(-1);
    setTimeLeft(120);
    setGuessesLeft(5);
    setFeedback('');
  };

  const generatePi = (targetSequence: string) => {
    let fakePi = "141592653589793238462643383279";
    for (let i = 0; i < 20000; i++) {
      fakePi += Math.floor(Math.random() * 10).toString();
    }
    
    const insertionPoint = Math.floor(Math.random() * 10000) + 1000;
    const finalPi = fakePi.substring(0, insertionPoint) + targetSequence + fakePi.substring(insertionPoint + targetSequence.length);
    
    setPiString(finalPi);
    setTargetIndex(insertionPoint);
    startTimer();
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDate = dateStr.replace(/\D/g, '');
    
    if (cleanDate.length !== 8) {
      setErrorMsg("Please use exactly 8 digits (DDMMYYYY).");
      return;
    }
    
    setErrorMsg('');
    generatePi(cleanDate);
  };

  const handleIndexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!piString || hasWon || isLost) return;
    
    const guessedIndex = parseInt(searchIndex);
    
    if (isNaN(guessedIndex)) {
      setErrorMsg("Please enter a valid number.");
      return;
    }
    
    if (guessesLeft <= 0) {
      setIsLost(true);
      recordFailure();
      return;
    }

    setGuessesLeft(prev => prev - 1);
    
    const targetSeq = dateStr.replace(/\D/g, '');
    const actualSubstr = piString.substring(guessedIndex, guessedIndex + 8);
    
    if (actualSubstr === targetSeq) {
      setHasWon(true);
      if (timerRef.current) clearInterval(timerRef.current);
      completeGame('birthday-in-pi');
      setFeedback('');
    } else {
      recordFailure();
      // Give direction feedback
      if (guessedIndex < targetIndex) {
        setFeedback(`Index ${guessedIndex} is too LOW. Search higher.`);
      } else {
        setFeedback(`Index ${guessedIndex} is too HIGH. Search lower.`);
      }
      setErrorMsg(`Incorrect. Found "${actualSubstr}" at index ${guessedIndex}.`);
      setSearchIndex('');

      if (guessesLeft - 1 <= 0) {
        setIsLost(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  const getStatusMessage = () => {
    if (hasWon) return `Birthday found at index: ${targetIndex}. Mathematics has your personal information.`;
    if (isLost) return `Failed. The sequence was at index ${targetIndex}.`;
    if (piString) return `Find the index. Time: ${timeLeft}s | Guesses: ${guessesLeft}/5`;
    return "At what index of PI can we find your birthday?";
  };

  // Position markers every 500 chars
  const renderPiWithMarkers = () => {
    if (!piString) return null;
    const chunks: React.ReactNode[] = [];
    const chunkSize = 500;
    for (let i = 0; i < piString.length; i += chunkSize) {
      chunks.push(
        <span key={`m-${i}`} className="text-green-600 text-[9px] select-none">
          [{i}]
        </span>
      );
      chunks.push(
        <span key={`c-${i}`}>
          {piString.substring(i, i + chunkSize)}
        </span>
      );
    }
    return chunks;
  };

  return (
    <GameLayout 
      gameId="birthday-in-pi"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : (errorMsg ? 'warning' : 'info'))}
    >
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto h-full">
        
        {!piString ? (
          <div className="w-full max-w-sm mx-auto mt-20 text-center animate-in fade-in">
            <h3 className="font-mono text-xl mb-4">Enter your birthday</h3>
            <p className="font-mono text-zinc-500 text-sm mb-6">Format: DDMMYYYY (e.g. 25121990)</p>
            
            <form onSubmit={handleDateSubmit} className="flex flex-col gap-4">
              <input 
                type="text" 
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
                placeholder="DDMMYYYY"
                maxLength={8}
                className="bg-zinc-900 border border-zinc-700 p-4 font-mono text-center text-2xl tracking-widest rounded focus:border-green-500 outline-none"
              />
              <button 
                type="submit"
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-mono py-3 rounded transition-colors"
              >
                GENERATE UNIVERSE
              </button>
            </form>
            {errorMsg && <div className="text-red-400 font-mono mt-4 text-sm">{errorMsg}</div>}
          </div>
        ) : (
          <div className="w-full flex flex-col h-full animate-in fade-in zoom-in-95">
            
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded">
                <div className="text-zinc-500 font-mono text-xs mb-1">TARGET SEQUENCE</div>
                <div className="text-2xl font-mono text-white tracking-widest">{dateStr.replace(/\D/g, '')}</div>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 p-3 rounded text-center">
                <div className="text-zinc-500 font-mono text-xs mb-1">TIME</div>
                <div className={`text-2xl font-mono font-bold ${timeLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-3 rounded text-center">
                <div className="text-zinc-500 font-mono text-xs mb-1">GUESSES</div>
                <div className="text-2xl font-mono text-white font-bold">{guessesLeft}</div>
              </div>
              
              <div className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded">
                <form onSubmit={handleIndexSubmit} className="flex gap-2">
                  <div className="flex-1">
                    <div className="text-zinc-500 font-mono text-xs mb-1">ENTER INDEX</div>
                    <input 
                      type="number"
                      value={searchIndex}
                      onChange={e => setSearchIndex(e.target.value)}
                      disabled={hasWon || isLost}
                      className="w-full bg-black border border-zinc-700 p-2 font-mono text-white rounded focus:border-green-500 outline-none"
                      placeholder="e.g. 4021"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={hasWon || isLost}
                    className="mt-5 px-6 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-mono rounded transition-colors"
                  >
                    VERIFY
                  </button>
                </form>
              </div>
            </div>
            
            {errorMsg && <div className="text-red-400 font-mono mb-2 text-sm bg-red-900/20 p-2 border border-red-500/30 rounded">{errorMsg}</div>}
            {feedback && !hasWon && !isLost && <div className="text-yellow-400 font-mono mb-2 text-sm bg-yellow-900/20 p-2 border border-yellow-500/30 rounded">{feedback}</div>}

            <div className="flex-grow bg-black border border-zinc-800 rounded p-4 overflow-hidden relative group">
              <div className="absolute top-2 left-2 font-mono text-xs text-zinc-600 bg-black/80 px-2 rounded z-10">PI = 3.</div>
              
              <div className="w-full h-64 overflow-y-auto break-all font-mono text-zinc-400 leading-relaxed tracking-wider p-2 pt-6 custom-scrollbar text-xs">
                {renderPiWithMarkers()}
              </div>
              
              {hasWon && (
                <div className="absolute inset-0 bg-green-900/20 flex flex-col items-center justify-center backdrop-blur-sm z-10 animate-in fade-in">
                  <div className="bg-black border border-green-500 p-6 rounded text-center">
                    <h2 className="text-2xl font-mono text-green-400 mb-2">SEQUENCE VERIFIED</h2>
                    <p className="font-mono text-white mb-4">
                      Found {dateStr} at index {targetIndex}
                    </p>
                    <div className="font-mono text-zinc-400 text-sm break-all max-w-sm mx-auto">
                      ...{piString.substring(Math.max(0, targetIndex - 10), targetIndex)}
                      <span className="text-green-400 font-bold bg-green-900/30">{dateStr}</span>
                      {piString.substring(targetIndex + 8, targetIndex + 18)}...
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center mt-2 font-mono text-xs text-zinc-600">
              Scroll through the digits to find your sequence. Position markers shown every 500 digits.
            </div>

          </div>
        )}

      </div>
    </GameLayout>
  );
};
