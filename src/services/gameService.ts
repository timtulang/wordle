// src/services/gameService.ts
import { supabase } from './supabase';

// Validate the guess against the backend RPC function
export async function submitGameAttempt(puzzleId: string, guessCount: number, isSolved: boolean) {
  const { data, error } = await supabase.rpc('submit_game_attempt', {
    p_puzzle_id: puzzleId,
    p_guess_count: guessCount,
    p_solved: isSolved
  });

  if (error) {
    console.error('Failed to save score:', error);
    throw error;
  }
  return data;
}

// Fetch the real, live leaderboard data
// src/services/gameService.ts

export async function getLiveLeaderboard() {
  const { data, error } = await supabase
    .from('player_stats')
    .select(`
      user_id,
      total_score,
      current_streak,
      profiles ( display_name )
    `)
    .order('total_score', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }

  // Use 'any' here to bypass the strict inferred array type, 
  // and handle both array and object formats safely.
  return (data as any[]).map((player, index) => {
    const profile = Array.isArray(player.profiles) ? player.profiles[0] : player.profiles;
    
    return {
      id: player.user_id,
      rank: index + 1,
      name: profile?.display_name || 'UNKNOWN',
      score: player.total_score,
      streak: player.current_streak
    };
  });
}

export async function getTodayPuzzle() {
  // Get the current local date in YYYY-MM-DD format
  const today = new Date().toLocaleDateString('en-CA'); 
  
  const { data, error } = await supabase
    .from('daily_puzzles')
    .select('*')
    .eq('puzzle_date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 just means no rows returned (e.g., no puzzle today)
    console.error("Error fetching today's puzzle:", error);
  }
  
  return data;
}

export async function getUnlockedFragments() {
  const today = new Date().toLocaleDateString('en-CA'); 
  
  const { data, error } = await supabase
    .from('daily_puzzles')
    .select('verse_fragment')
    .lte('puzzle_date', today)
    .order('puzzle_date', { ascending: true });

  if (error) {
    console.error("Error fetching fragments:", error);
    return [];
  }
  
  return data.map(d => d.verse_fragment);
}