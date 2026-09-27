'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [searchCount, setSearchCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfileData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Fetch search history count
      const { count } = await supabase
        .from('search_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setSearchCount(count || 0);
      setLoading(false);
    }

    getProfileData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-zinc-400 flex items-center justify-center text-xs">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans antialiased flex flex-col justify-between">
      {/* Top Bar */}
      <nav className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <svg viewBox="0 0 240 160" className="h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="20" width="30" height="120" fill="#999E9F" />
              <rect x="40" y="20" width="30" height="120" fill="#888C8D" />
              <rect x="80" y="20" width="30" height="120" fill="#4D5051" />
              <rect x="105" y="20" width="20" height="30" fill="#4D5051" />
              <path d="M135 20 C195 20 230 45 230 80 C230 115 195 140 135 140 V114 C175 114 200 100 200 80 C200 60 175 46 135 46 Z" fill="#36B2A3" />
            </svg>
          </Link>
          <Link href="/" className="text-xs font-bold text-zinc-400 hover:text-white transition-all">
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      {/* Profile Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
            <div className="w-14 h-14 rounded-full bg-teal-950 border border-teal-500/50 flex items-center justify-center text-teal-400 font-black text-xl">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user?.email}</h1>
              <p className="text-xs text-zinc-400">Authenticated User</p>
            </div>
          </div>

          {/* Search Personalization Progress */}
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-zinc-300">Personalization Progress</span>
              <span className="text-xs font-mono text-teal-400 font-bold">{searchCount} / 50 Searches</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((searchCount / 50) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              {searchCount >= 50 
                ? ' Personalized search ordering is ACTIVE for your account.' 
                : ` Perform ${50 - searchCount} more searches to unlock personalized course ordering.`}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSignOut}
              className="px-5 py-2.5 bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-zinc-600 border-t border-zinc-900">
        IIIT Delhi Open CourseWare Repository
      </footer>
    </div>
  );
}