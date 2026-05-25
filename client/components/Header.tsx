'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGoogleAuth } from './GoogleAuthContext';
import Logo from './Logo';

export default function Header() {
  const { user, renderGoogleButton, logout, mockLogin, loading, googleClientId, updateClientId, hasClientId, loginError } = useGoogleAuth();
  const [showMockLogin, setShowMockLogin] = useState(false);
  const [mockName, setMockName] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [inputClientId, setInputClientId] = useState('');
  const [errorDismissed, setErrorDismissed] = useState(false);

  useEffect(() => {
    if (googleClientId) {
      setInputClientId(googleClientId);
    }
  }, [googleClientId]);

  useEffect(() => {
    if (loginError) {
      setErrorDismissed(false);
    }
  }, [loginError]);

  useEffect(() => {
    if (!user && hasClientId) {
      const timer = setTimeout(() => {
        renderGoogleButton('google-header-signin-btn');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, renderGoogleButton, googleClientId, hasClientId]);

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
              {/* Google OAuth Configuration Settings Cog */}
              <button
                onClick={() => setShowConfigModal(true)}
                title="Configure Google OAuth Client ID"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-950/30 text-slate-400 transition hover:border-slate-700 hover:bg-slate-900/50 hover:text-cyan-400"
              >
                <svg className="h-5 w-5 transition duration-500 group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {/* Visual glow indicator if a custom client ID is NOT configured yet */}
                {!googleClientId && (
                  <span className="absolute right-0 top-0 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
                  </span>
                )}
              </button>

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

              {/* Official Google Login or Simulated Button */}
              {hasClientId ? (
                <div id="google-header-signin-btn" className="h-10 min-w-[120px] overflow-hidden rounded-full"></div>
              ) : (
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="flex h-10 items-center gap-2 rounded-full border border-slate-700 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-md hover:bg-slate-100 transition active:scale-95 duration-150"
                  title="Configure Google OAuth Client ID to login"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.9 3.02c.92-2.78 3.52-4.54 6.71-4.54z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.92c2.2-2.03 3.67-5.01 3.67-8.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.29 14.42c-.25-.74-.39-1.53-.39-2.35s.14-1.61.39-2.35L1.39 6.7C.5 8.49 0 10.49 0 12.5s.5 4.01 1.39 5.8l3.9-3.08z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.92c-1.08.72-2.46 1.16-4.2 1.16-3.19 0-5.79-1.76-6.71-4.54l-3.9 3.08C3.37 20.33 7.35 23 12 23z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Authentication Error Toast / Alert Banner */}
      {loginError && !errorDismissed && (
        <div className="border-t border-red-500/20 bg-red-500/10 px-6 py-2">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs text-red-400 font-medium animate-in slide-in-from-top-1 duration-200">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Google Auth Error: {loginError}
            </span>
            <button
              onClick={() => setErrorDismissed(true)}
              className="text-red-400/80 hover:text-red-300 hover:bg-red-500/10 rounded p-1 transition animate-hover-pulse"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl animate-in zoom-in-95 duration-200">
            {/* Glow Decorative Background Accent */}
            <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"></div>
            <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 3m0-3a2 2 0 110 3m-3.793-2.207l-1.414-1.414m1.414 1.414a2 2 0 112.828 2.828m-2.828-2.828a2 2 0 012.828 2.828m6.364-3.536l1.414-1.414m-1.414 1.414a2 2 0 11-2.828-2.828m2.828 2.828a2 2 0 01-2.828-2.828M12 14v2m0-2a2 2 0 100 3m0-3a2 2 0 110 3m-3.793 2.207l-1.414 1.414m1.414-1.414a2 2 0 112.828-2.828m-2.828 2.828a2 2 0 012.828-2.828m6.364 3.536l1.414 1.414m-1.414-1.414a2 2 0 11-2.828 2.828m2.828-2.828a2 2 0 01-2.828 2.828" />
                  </svg>
                  Google Sign-In Configuration
                </h3>
                <p className="mt-1 text-xs text-slate-400">Configure your personal Google OAuth Client ID to resolve login errors.</p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Setup Instructions */}
            <div className="my-5 max-h-[260px] overflow-y-auto pr-1 space-y-4 text-xs text-slate-300 scrollbar-thin scrollbar-thumb-slate-800">
              <div>
                <span className="font-semibold text-cyan-400">Quick 60-Second Setup Guide:</span>
                <ol className="mt-2 list-decimal pl-4 space-y-2 text-slate-400">
                  <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">Google Cloud Console</a>.</li>
                  <li>Select your project, then open **APIs & Services &gt; Credentials**.</li>
                  <li>Click **Create Credentials &gt; OAuth client ID**.</li>
                  <li>Set the Application Type to **Web application**.</li>
                  <li>Add this exact URL under **Authorized JavaScript Origins**:
                    <div className="my-1 rounded-lg bg-slate-950 p-2 font-mono text-[10px] text-slate-300 select-all space-y-1">
                      <div>http://localhost:3000</div>
                      <div>{typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app'}</div>
                    </div>
                  </li>
                  <li>Click **Create**, then copy your generated **Client ID** (ends with `.apps.googleusercontent.com`).</li>
                </ol>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                <p className="font-medium text-slate-300 mb-1">💡 What does this do?</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Pasting your Client ID here saves it securely in your browser&apos;s local storage. The system will use it instantly to display the correct Google Sign-In portal and login securely.
                </p>
              </div>
            </div>

            {/* Input Form */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Google OAuth Client ID</label>
              <input
                type="text"
                placeholder="Pasted client ID ending in .apps.googleusercontent.com"
                value={inputClientId}
                onChange={(e) => setInputClientId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none transition focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40"
              />
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-between gap-2 border-t border-slate-800/80 pt-4">
              <button
                onClick={() => {
                  updateClientId(null);
                  setInputClientId('');
                  setShowConfigModal(false);
                }}
                className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2.5 text-xs font-semibold text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition"
              >
                Reset
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateClientId(inputClientId);
                    setShowConfigModal(false);
                  }}
                  className="rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/10"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
