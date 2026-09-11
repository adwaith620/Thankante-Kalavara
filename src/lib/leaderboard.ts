// Cleanly separated data layer for the leaderboard.
// Currently uses localStorage as a local-only fallback.
// Ready to be replaced with Supabase or another backend.

export interface LeaderboardEntry {
  id: string;
  name: string;
  timeMs: number;
  dateStr: string; // YYYY-MM-DD
  timestamp: number;
}

const STORAGE_KEY = 'kalavara_leaderboard_local';

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const fetchDailyLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const entries: LeaderboardEntry[] = JSON.parse(data);
    const today = getTodayDateStr();
    
    // Filter for today and sort by fastest time
    return entries
      .filter(e => e.dateStr === today)
      .sort((a, b) => a.timeMs - b.timeMs);
  } catch (e) {
    console.error("Failed to fetch local leaderboard", e);
    return [];
  }
};

export const submitToLeaderboard = async (name: string, timeMs: number): Promise<{ rank: number }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    const entries: LeaderboardEntry[] = existingData ? JSON.parse(existingData) : [];
    
    const today = getTodayDateStr();
    
    const newEntry: LeaderboardEntry = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      timeMs,
      dateStr: today,
      timestamp: Date.now()
    };
    
    entries.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    // Calculate rank
    const todayEntries = entries
      .filter(e => e.dateStr === today)
      .sort((a, b) => a.timeMs - b.timeMs);
      
    const rank = todayEntries.findIndex(e => e.id === newEntry.id) + 1;
    
    return { rank };
  } catch (e) {
    console.error("Failed to submit to local leaderboard", e);
    throw new Error("Submission failed");
  }
};
