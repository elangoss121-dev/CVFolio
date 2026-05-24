'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGoogleAuth } from './GoogleAuthContext';
import Logo from './Logo';

export default function Header() {
  const { user, renderGoogleButton, logout, mockLogin, loading } = useGoogleAuth();
  const [showMockLogin, setShowMockLogin] = useState(false);
  const [mockName, setMockName] = useState('');

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        renderGoogleButton('google-header-signin-btn');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, renderGoogleButton]);

  const handleMockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mockName.trim()) {
      await mockLogin(mockName.trim());
      setShowMockLogin(false);
      setMockName('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
          <Logo />
        </Link>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-100">{user.fullName}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName}
                  className="h-10 w-10 rounded-full border border-cyan-500/50 object-cover shadow-md shadow-cyan-950/20"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/50 bg-slate-800 text-sm font-bold text-cyan-400">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}

              <button
                onClick={logout}
                className="rounded-full border border-slate-700 bg-slate-900/50 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Dev/Mock Login Trigger */}
              {process.env.NODE_ENV !== 'production' && (
                <div className="relative">
                  {showMockLogin ? (
                    <form
                      onSubmit={handleMockSubmit}
                      className="absolute right-0 top-12 flex w-64 flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-slate-950/50 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <p className="text-xs font-semibold text-slate-400">Dev Login Bypass</p>
                      <input
                        type="text"
                        placeholder="Enter name (e.g. Sivakumar)"
                        value={mockName}
                        onChange={(e) => setMockName(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                        required
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowMockLogin(false)}
                          className="rounded-lg px-2.5 py-1.5 text-xxs font-medium text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xxs font-bold text-slate-950 hover:bg-cyan-400"
                        >
                          Login
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowMockLogin(true)}
                      className="rounded-full border border-dashed border-slate-800 bg-slate-950/30 px-3.5 py-2 text-xxs font-semibold text-slate-400 transition hover:border-slate-700 hover:text-slate-300"
                    >
                      Dev Bypass
                    </button>
                  )}
                </div>
              )}

              {/* Official Google Login Button Container */}
              <div id="google-header-signin-btn" className="h-10 min-w-[120px] overflow-hidden rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
