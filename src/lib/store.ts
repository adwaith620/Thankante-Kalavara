import { useState, useEffect } from 'react';

export interface GlobalStats {
  gamesCompleted: string[];
  totalFailures: number;
  totalAttempts: number;
  sessionStartTime: number | null;
  sessionEndTime: number | null;
}

const getInitialStats = (): GlobalStats => {
  const stored = localStorage.getItem('kalavara_stats');
  if (stored) {
    const parsed = JSON.parse(stored);
    return {
      gamesCompleted: parsed.gamesCompleted || [],
      totalFailures: parsed.totalFailures || 0,
      totalAttempts: parsed.totalAttempts || 0,
      sessionStartTime: parsed.sessionStartTime || null,
      sessionEndTime: parsed.sessionEndTime || null,
    };
  }
  return { gamesCompleted: [], totalFailures: 0, totalAttempts: 0, sessionStartTime: null, sessionEndTime: null };
};

export const useStore = () => {
  const [stats, setStats] = useState<GlobalStats>(getInitialStats);

  useEffect(() => {
    localStorage.setItem('kalavara_stats', JSON.stringify(stats));
  }, [stats]);

  const recordAttempt = () => {
    setStats(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));
  };

  const recordFailure = () => {
    setStats(prev => ({ ...prev, totalFailures: prev.totalFailures + 1 }));
  };

  const completeGame = (gameId: string) => {
    setStats(prev => {
      if (!prev.gamesCompleted.includes(gameId)) {
        return { ...prev, gamesCompleted: [...prev.gamesCompleted, gameId] };
      }
      return prev;
    });
  };

  const startSession = () => {
    setStats(prev => {
      if (prev.sessionStartTime === null) {
        return { ...prev, sessionStartTime: Date.now(), sessionEndTime: null };
      }
      return prev;
    });
  };

  const endSession = () => {
    setStats(prev => {
      if (prev.sessionEndTime === null) {
        return { ...prev, sessionEndTime: Date.now() };
      }
      return prev;
    });
  };

  const resetAll = () => {
    setStats({ gamesCompleted: [], totalFailures: 0, totalAttempts: 0, sessionStartTime: null, sessionEndTime: null });
  };

  return { stats, recordAttempt, recordFailure, completeGame, startSession, endSession, resetAll };
};
