import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { Download, Trophy } from 'lucide-react';
import { GAMES } from '../lib/constants';
import { fetchDailyLeaderboard, submitToLeaderboard, type LeaderboardEntry } from '../lib/leaderboard';

export const Certificate = () => {
  const { stats } = useStore();
  const [name, setName] = useState('');
  const [rank, setRank] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const isEligible = stats.gamesCompleted.length > 0;
  const allCompleted = stats.gamesCompleted.length >= GAMES.length;

  const sessionDuration = stats.sessionStartTime && stats.sessionEndTime 
    ? stats.sessionEndTime - stats.sessionStartTime 
    : null;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const loadLeaderboard = async () => {
    const data = await fetchDailyLeaderboard();
    setLeaderboard(data);
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const handleSubmitScore = async () => {
    if (!name || !sessionDuration || !allCompleted || submitted) return;
    setIsSubmitting(true);
    try {
      const res = await submitToLeaderboard(name, sessionDuration);
      setRank(res.rank);
      setSubmitted(true);
      loadLeaderboard();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isEligible) {
    return (
      <div className="min-h-screen relative z-10 px-4 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center font-mono text-zinc-400">
          <p className="mb-4">You have not survived any games yet.</p>
          <p>Come back when you have proven yourself.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 px-4 pt-24 pb-16">
      <div className="max-w-4xl mx-auto print:max-w-none">
        
        <div className="mb-8 font-mono text-sm print:hidden">
          <label className="block text-zinc-400 mb-2">ENTER YOUR NAME FOR THE RECORD:</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitted}
              placeholder="Anonymous Sufferer"
              className="flex-1 max-w-md bg-zinc-900 border border-zinc-700 p-3 rounded text-white focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
            />
            {allCompleted && sessionDuration && !submitted && (
              <button 
                onClick={handleSubmitScore}
                disabled={!name || isSubmitting}
                className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-500 px-6 py-3 rounded font-bold text-white transition-colors"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT TIME'}
              </button>
            )}
          </div>
          {allCompleted && !sessionDuration && (
            <p className="text-red-400 mt-2">Error: No session time recorded. Cannot submit to leaderboard.</p>
          )}
          {!allCompleted && (
            <p className="text-zinc-500 mt-2">Complete all {GAMES.length} games to submit your time to the leaderboard.</p>
          )}
        </div>

        <div className="bg-zinc-950/90 border-2 border-zinc-800 p-8 md:p-12 rounded-lg relative overflow-hidden backdrop-blur-md print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-600 via-emerald-400 to-green-600 print:bg-black" />
          
          <div className="text-center mb-12 relative z-10 print:mt-12">
            <h1 className="text-3xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-4 uppercase print:text-black print:bg-none">
              CERTIFIED THANKAN
            </h1>
            <p className="font-mono text-zinc-400 tracking-widest print:text-zinc-600">
              THANKANTE KALAVARA EXTREME USABILITY TESTING
            </p>
          </div>

          <div className="font-mono mb-12 relative z-10">
            <p className="text-lg text-zinc-300 leading-relaxed mb-6 text-center print:text-black">
              This certifies that <span className="text-green-400 font-bold border-b border-green-400/30 pb-1 px-2 print:text-black print:border-black">{name || 'Anonymous Sufferer'}</span> has willingly subjected themselves to intentionally terrible user interfaces and emerged partially intact.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-black/50 rounded border border-zinc-900 print:bg-transparent print:border-zinc-300">
              <div>
                <div className="text-zinc-500 text-xs mb-1 print:text-zinc-600">GAMES COMPLETED</div>
                <div className="text-2xl text-white print:text-black">{stats.gamesCompleted.length} / {GAMES.length}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-xs mb-1 print:text-zinc-600">TOTAL FAILURES</div>
                <div className="text-2xl text-red-400 print:text-black">{stats.totalFailures}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-xs mb-1 print:text-zinc-600">SESSION TIME</div>
                <div className="text-2xl text-white print:text-black">{sessionDuration ? formatTime(sessionDuration) : 'N/A'}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-xs mb-1 print:text-zinc-600">DAILY RANK</div>
                <div className="text-2xl text-green-400 print:text-black">{rank !== null ? `#${rank}` : 'UNRANKED'}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end relative z-10 mt-16 font-mono text-xs text-zinc-600 print:text-zinc-800">
            <div>
              DATE: {new Date().toLocaleDateString()}<br/>
              AUTHORIZED BY: SYSTEM ADMINISTRATOR
            </div>
            <div className="text-right">
              ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}<br/>
              SECURE HASH VERIFIED
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center print:hidden mb-16">
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-mono text-sm rounded transition-colors"
            onClick={() => window.print()}
          >
            <Download size={16} />
            PRINT / SAVE AS PDF
          </button>
        </div>

        {/* Daily Leaderboard */}
        <div className="print:hidden max-w-4xl mx-auto border border-zinc-800 rounded bg-zinc-950 p-6 font-mono">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-yellow-500" />
            <h2 className="text-xl font-bold text-white tracking-widest">DAILY LEADERBOARD</h2>
            <div className="ml-auto text-zinc-500 text-sm">
              {new Date().toLocaleDateString()}
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-zinc-500 text-center py-8">No entries yet today. Be the first to survive!</div>
          ) : (
            <div className="space-y-2">
              <div className="flex text-zinc-500 text-xs border-b border-zinc-800 pb-2 mb-4 px-4">
                <div className="w-16">RANK</div>
                <div className="flex-1">PLAYER</div>
                <div className="w-24 text-right">TIME</div>
              </div>
              {leaderboard.map((entry, idx) => (
                <div 
                  key={entry.id} 
                  className={`flex text-sm px-4 py-3 rounded ${idx === 0 ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400' : 'bg-zinc-900/50 text-zinc-300'}`}
                >
                  <div className="w-16 font-bold">#{idx + 1}</div>
                  <div className="flex-1 truncate">{entry.name}</div>
                  <div className="w-24 text-right">{formatTime(entry.timeMs)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
