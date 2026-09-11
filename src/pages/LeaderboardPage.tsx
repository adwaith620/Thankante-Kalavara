import { useState, useEffect } from 'react';
import { fetchDailyLeaderboard, type LeaderboardEntry } from '../lib/leaderboard';
import { Trophy } from 'lucide-react';

export const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    fetchDailyLeaderboard().then(setLeaderboard);
  }, []);

  return (
    <div className="min-h-screen relative z-10 px-4 pt-24 pb-16 flex justify-center">
      <div className="w-full max-w-4xl border border-zinc-800 rounded bg-zinc-950 p-6 font-mono self-start">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="text-yellow-500" />
          <h2 className="text-xl font-bold text-white tracking-widest">GLOBAL DAILY LEADERBOARD</h2>
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
  );
};
