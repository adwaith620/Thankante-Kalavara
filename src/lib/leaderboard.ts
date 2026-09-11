// Cleanly separated data layer for the leaderboard.
// Currently uses localStorage as a local-only fallback.
// Ready to be replaced with Supabase or another backend.

export interface LeaderboardEntry {
  id: string; // The sessionId
  name: string;
  timeMs: number;
  trophies: number;
  dateStr: string; // YYYY-MM-DD
  timestamp: number;
}

const STORAGE_KEY = 'kalavara_leaderboard_local';

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const fetchDailyLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const entries: LeaderboardEntry[] = JSON.parse(data);
    const today = getTodayDateStr();
    
    return entries
      .filter(e => e.dateStr === today)
      .sort((a, b) => {
        if (b.trophies !== a.trophies) {
          return b.trophies - a.trophies; // Descending trophies
        }
        return a.timeMs - b.timeMs; // Ascending time
      });
  } catch (e) {
    console.error("Failed to fetch local leaderboard", e);
    return [];
  }
};

export const syncLeaderboard = async (sessionId: string, name: string, timeMs: number, trophies: number): Promise<{ rank: number }> => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    const entries: LeaderboardEntry[] = existingData ? JSON.parse(existingData) : [];
    
    const today = getTodayDateStr();
    
    const existingIndex = entries.findIndex(e => e.id === sessionId);
    if (existingIndex >= 0) {
      entries[existingIndex] = {
        ...entries[existingIndex],
        name,
        timeMs,
        trophies,
        timestamp: Date.now()
      };
    } else {
      const newEntry: LeaderboardEntry = {
        id: sessionId,
        name,
        timeMs,
        trophies,
        dateStr: today,
        timestamp: Date.now()
      };
      entries.push(newEntry);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    const todayEntries = entries
      .filter(e => e.dateStr === today)
      .sort((a, b) => {
        if (b.trophies !== a.trophies) {
          return b.trophies - a.trophies; // Descending trophies
        }
        return a.timeMs - b.timeMs; // Ascending time
      });
      
    const rank = todayEntries.findIndex(e => e.id === sessionId) + 1;
    
    return { rank };
  } catch (e) {
    console.error("Failed to sync leaderboard", e);
    throw new Error("Sync failed");
  }
};
