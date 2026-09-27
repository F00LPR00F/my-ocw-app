'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Email/Password Login & Registration
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Account created! Check your email for verification if required.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Social OAuth Logins
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans antialiased flex flex-col justify-between">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 pl-4 pr-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <svg 
              viewBox="0 0 240 160" 
              className="h-9 w-auto transition-transform group-hover:scale-105"
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
          <Link 
            href="/" 
            className="text-xs font-bold text-zinc-400 hover:text-white transition-all"
          >
            &larr; Back to Home
          </Link>
        </div>
      </nav>
{/* Auth Form Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 bg-transparent">
        <div className="w-full max-w-md bg-[#111b21]/80 border border-zinc-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-950/60 text-teal-400 border border-teal-800/50 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
              IIITD OCW Portal
            </span>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isSignUp ? 'Sign up to track your learning journey' : 'Sign in to sync your search history & preferences'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@iiitd.ac.in"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-white bg-zinc-950/80 placeholder:text-zinc-600 transition-all text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-white bg-zinc-950/80 placeholder:text-zinc-600 transition-all text-xs font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-black font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <span className="relative bg-[#18181b] px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center gap-2 py-2 px-4 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl text-xs font-semibold text-zinc-200 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="flex items-center justify-center gap-2 py-2 px-4 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl text-xs font-semibold text-zinc-200 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </button>
          </div>

          {/* Toggle Sign In / Sign Up */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage(null);
              }}
              className="text-xs font-semibold text-zinc-400 hover:text-teal-400 transition-all"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create one"}
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