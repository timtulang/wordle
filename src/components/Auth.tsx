// src/components/Auth.tsx
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

export function Auth() {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = displayName.trim().toUpperCase();
    
    if (cleanName.length < 3) {
      setError("Name must be at least 3 letters.");
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Create the persistent anonymous session
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

    if (authError || !authData.user) {
      setError(authError?.message || "Authentication failed.");
      setLoading(false);
      return;
    }

    // 2. Register their Display Name in our profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { id: authData.user.id, display_name: cleanName }
      ]);

    if (profileError) {
      // If the display_name is UNIQUE in your DB and someone took it
      if (profileError.code === '23505') { 
        setError("That name is already taken. Try another.");
      } else {
        setError(profileError.message);
      }
      
      // Sign them out so they can try again if it failed
      await supabase.auth.signOut();
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center font-['Inter',_sans-serif]">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#064E3B 1px, transparent 1px)', backgroundSize: '4px 4px' }}>
      </div>

      <h1 className="font-['Anton',_sans-serif] text-5xl text-[#064E3B] uppercase mb-8 z-10 leading-none">
        Identify<br/>Yourself
      </h1>

      <div className="bg-white p-8 border-4 border-[#064E3B] shadow-[8px_8px_0px_0px_#064E3B] w-full max-w-sm z-10">
        {error && (
          <div className="mb-4 p-2 bg-[#FB923C] text-[#064E3B] font-bold text-sm uppercase tracking-widest border-2 border-[#064E3B]">
            {error}
          </div>
        )}

        <form onSubmit={handleStart} className="flex flex-col gap-4">
          <p className="text-[#57534E] font-medium text-sm text-left">
            Choose a display name for the leaderboard.
          </p>
          <input
            type="text"
            placeholder="DISPLAY NAME"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={12}
            className="w-full p-3 border-4 border-[#064E3B] font-bold text-center text-xl uppercase tracking-widest outline-none focus:border-[#FB923C] transition-colors"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-[#064E3B] text-white font-['Anton',_sans-serif] text-2xl tracking-widest uppercase border-4 border-[#064E3B] shadow-[4px_4px_0px_0px_#FB923C] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'LOADING...' : 'START GAME'}
          </button>
        </form>
      </div>
    </div>
  );
}