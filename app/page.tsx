'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

interface Semester {
  semNumber: number;
  title: string;
  accentColor: string;
  badgeIcon: string;
  quickLinks: string[];
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDataAndPersonalize() {
      try {
        // 1. Fetch semesters from DB ordered by sem_number
        const { data: rawSemesters, error: semError } = await supabase
          .from('semesters')
          .select('*')
          .order('sem_number', { ascending: true });

        if (semError || !rawSemesters) {
          console.error('Error fetching semesters:', {
            message: semError?.message,
            details: semError?.details,
            hint: semError?.hint,
            code: semError?.code,
          });
          setLoading(false);
          return;
        }

        // 2. Map snake_case DB columns to React camelCase interface
        const dbSemesters: Semester[] = rawSemesters.map((row) => ({
          semNumber: row.sem_number,
          title: row.title,
          accentColor: row.accent_color,
          badgeIcon: row.badge_icon,
          quickLinks: row.quick_links || [],
        }));

        let finalSemesters: Semester[] = dbSemesters;

        // 3. Fetch User Auth State
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user ?? null);

        // 4. Personalize course ordering if user has >= 50 searches
        if (user) {
          const { count, error: countError } = await supabase
            .from('search_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          if (!countError && count && count >= 50) {
            const { data: history, error: historyError } = await supabase
              .from('search_history')
              .select('query')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(100);

            if (!historyError && history && history.length > 0) {
              const frequencyMap: Record<string, number> = {};
              history.forEach((h) => {
                const q = h.query.toLowerCase().trim();
                frequencyMap[q] = (frequencyMap[q] || 0) + 1;
              });

              finalSemesters = dbSemesters.map((sem) => {
                const sortedLinks = [...(sem.quickLinks || [])].sort((a, b) => {
                  const countA = Object.entries(frequencyMap).reduce(
                    (acc, [term, freq]) => (a.toLowerCase().includes(term) ? acc + freq : acc),
                    0
                  );
                  const countB = Object.entries(frequencyMap).reduce(
                    (acc, [term, freq]) => (b.toLowerCase().includes(term) ? acc + freq : acc),
                    0
                  );
                  return countB - countA;
                });

                return {
                  ...sem,
                  quickLinks: sortedLinks,
                };
              });
            }
          }
        }

        setSemesters(finalSemesters);
      } catch (err) {
        console.error('Failed to initialize homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDataAndPersonalize();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-slate-100 font-sans antialiased">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-[#0b141a]/80 backdrop-blur-md border-b border-zinc-800/80 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <svg 
              viewBox="0 0 240 160" 
              className="h-8 w-auto transition-transform group-hover:scale-105"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0" y="20" width="30" height="120" fill="#999E9F" />
              <rect x="40" y="20" width="30" height="120" fill="#888C8D" />
              <rect x="80" y="20" width="30" height="120" fill="#4D5051" />
              <rect x="105" y="20" width="20" height="30" fill="#4D5051" />
              <path 
                d="M135 20 C195 20 230 45 230 80 C230 115 195 140 135 140 V114 C175 114 200 100 200 80 C200 60 175 46 135 46 Z" 
                fill="#36B2A3" 
              />
            </svg>
          </Link>
          
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-400">
            {user ? (
              <Link 
                href="/profile" 
                className="w-9 h-9 rounded-full bg-teal-950/80 border border-teal-500/50 flex items-center justify-center text-teal-400 hover:bg-teal-500 hover:text-black transition-all shadow-sm group"
                title="View Profile"
              >
                <svg 
                  className="w-5 h-5 transition-transform group-hover:scale-110" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="bg-teal-500 hover:bg-teal-400 text-black px-4 py-2 rounded-xl shadow-md transition-all text-xs font-bold"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="text-center mt-2 mb-10 max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-950/60 text-teal-400 border border-teal-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            IIITD Open CourseWare
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight">
            Learn Anything, <br />
            <span className="text-teal-400">
              Completely Free.
            </span>
          </h1>
        </section>

        {/* Loading Skeleton Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div 
                key={n} 
                className="bg-[#111b21]/40 border border-zinc-800/80 rounded-2xl h-64 animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-6 w-1/2 bg-zinc-800/80 rounded-md"></div>
                  <div className="h-4 w-3/4 bg-zinc-800/50 rounded-md"></div>
                  <div className="h-4 w-2/3 bg-zinc-800/50 rounded-md"></div>
                </div>
                <div className="h-10 w-full bg-zinc-800/60 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Dynamic Semesters Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {semesters.map((sem) => (
              <Link
                key={sem.semNumber}
                href={`/semester/${sem.semNumber}`}
                className="bg-[#111b21]/80 backdrop-blur-md rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl hover:border-teal-500/50 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Header Banner */}
                  {/* Header Banner */}
<div 
  className="relative h-28 p-4 flex items-end justify-between transition-colors"
  style={{
    backgroundColor: sem.accentColor || '#0d9488',
  }}
>
  <h2 className="text-2xl font-black text-white drop-shadow-md tracking-tight">
    {sem.title}
  </h2>
  
  {/* Badge Icon */}
  <div className="w-12 h-12 rounded-2xl bg-[#111b21] border-2 border-zinc-700/80 flex items-center justify-center text-white font-black text-sm shadow-xl translate-y-3 transition-transform group-hover:scale-105">
    {sem.badgeIcon || `S${sem.semNumber}`}
  </div>
</div>
                  {/* Quick Links / Courses Preview */}
                  <ul className="p-5 pt-6 space-y-2.5">
                    {sem.quickLinks?.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-xs font-medium text-slate-300 group-hover:text-teal-300 transition-colors truncate"
                      >
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer Action */}
                <div className="p-5 pt-0">
                  <div className="w-full py-2.5 bg-zinc-900/80 border border-zinc-800 group-hover:bg-teal-950/80 group-hover:text-teal-300 group-hover:border-teal-800/60 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                    Explore Semester {sem.semNumber}
                    <span>&rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}