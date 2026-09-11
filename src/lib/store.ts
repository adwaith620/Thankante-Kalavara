import { useState, useEffect } from 'react';

export interface GlobalStats {
  sessionId: string;
  playerName: string;
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
      sessionId: parsed.sessionId || Math.random().toString(36).substring(2, 10),
      playerName: parsed.playerName || 'Anonymous Sufferer',
      gamesCompleted: parsed.gamesCompleted || [],
      totalFailures: parsed.totalFailures || 0,
      totalAttempts: parsed.totalAttempts || 0,
      sessionStartTime: parsed.sessionStartTime || null,
      sessionEndTime: parsed.sessionEndTime || null,
    };
  }
  return { 
    sessionId: Math.random().toString(36).substring(2, 10),
    playerName: 'Anonymous Sufferer',
    gamesCompleted: [], 
    totalFailures: 0, 
    totalAttempts: 0, 
    sessionStartTime: null, 
    sessionEndTime: null 
  };
};

// Global state outside the hook
let globalStats = getInitialStats();
const listeners = new Set<(stats: GlobalStats) => void>();

const updateStats = (updater: (prev: GlobalStats) => GlobalStats) => {
  globalStats = updater(globalStats);
  localStorage.setItem('kalavara_stats', JSON.stringify(globalStats));
  listeners.forEach(l => l(globalStats));
};

export const useStore = () => {
  const [stats, setStats] = useState<GlobalStats>(globalStats);

  useEffect(() => {
    listeners.add(setStats);
    
    const handleStorage = () => {
      const fresh = getInitialStats();
      if (JSON.stringify(fresh) !== JSON.stringify(globalStats)) {
        globalStats = fresh;
        listeners.forEach(l => l(globalStats));
      }
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      listeners.delete(setStats);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const recordAttempt = () => {
    updateStats(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));
  };

  const recordFailure = () => {
    updateStats(prev => ({ ...prev, totalFailures: prev.totalFailures + 1 }));
  };

  const completeGame = (gameId: string) => {
    updateStats(prev => {
      if (!prev.gamesCompleted.includes(gameId)) {
        return { ...prev, gamesCompleted: [...prev.gamesCompleted, gameId] };
      }
      return prev;
    });
  };

  const startSession = () => {
    updateStats(prev => {
      if (prev.sessionStartTime === null) {
        return { ...prev, sessionStartTime: Date.now(), sessionEndTime: null };
      }
      return prev;
    });
  };

  const endSession = () => {
    updateStats(prev => {
      if (prev.sessionEndTime === null) {
        return { ...prev, sessionEndTime: Date.now() };
      }
      return prev;
    });
  };

  const updatePlayerName = (name: string) => {
    updateStats(prev => ({ ...prev, playerName: name }));
  };

  const resetAll = () => {
    updateStats(() => ({ 
      sessionId: Math.random().toString(36).substring(2, 10),
      playerName: 'Anonymous Sufferer',
      gamesCompleted: [], 
      totalFailures: 0, 
      totalAttempts: 0, 
      sessionStartTime: null, 
      sessionEndTime: null 
    }));
  };

  return { stats, recordAttempt, recordFailure, completeGame, startSession, endSession, updatePlayerName, resetAll };
};
