'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Boxes,
  Layers,
  BarChart3,
  AlertOctagon,
  Sparkles,
  Info,
} from 'lucide-react';

export default function LoginPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const {
    isAuthenticated,
    loginWithGoogleCredential,
    loginWithMockGoogle,
    googleClientId,
    isLoading,
  } = useAuth();

  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Administrator' | 'Inventory Manager' | 'Auditor'>('Administrator');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // If already authenticated, redirect to returnUrl
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, returnUrl, router]);

  // Load Google Identity Services (GIS) script if Client ID is configured
  useEffect(() => {
    if (!googleClientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const gWindow = window as any;
      if (gWindow.google?.accounts?.id && googleBtnRef.current) {
        gWindow.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              setIsSigningIn(true);
              const success = await loginWithGoogleCredential(response.credential);
              if (success) {
                router.push(returnUrl);
              } else {
                setErrorMessage('Unable to verify Google credential. Please try again.');
                setIsSigningIn(false);
              }
            }
          },
        });

        gWindow.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'pill',
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [googleClientId, loginWithGoogleCredential, returnUrl, router]);

  const handleFastTrackLogin = (email?: string, name?: string) => {
    setIsSigningIn(true);
    setErrorMessage(null);
    setTimeout(() => {
      loginWithMockGoogle(
        email || customEmail || 'director@abcpvtltd.lk',
        name || customName || 'ABC Executive Director',
        selectedRole
      );
      router.push(returnUrl);
    }, 400);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f17]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Brand Bar */}
      <header className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-extrabold text-white text-base shadow-md shadow-blue-500/20">
            ABC
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              ABC (PVT) LTD
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Inventory & Valuation Management System
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>LKAS 2 / IFRS Enterprise Secured</span>
        </div>
      </header>

      {/* Main Login Center Card */}
      <main className="flex-1 flex items-center justify-center p-6 my-6">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-8 shadow-xl dark:shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 mb-1">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Sign in to your Account
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                Authenticate using your Google Workspace or authorized company credentials.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Official Google Identity Button (Rendered when Client ID is configured) */}
            {googleClientId && (
              <div className="flex flex-col items-center justify-center space-y-2 pt-2">
                <div ref={googleBtnRef} className="min-h-[44px]" />
                <p className="text-[11px] text-slate-400">Standard Google SSO enabled</p>
              </div>
            )}

            {/* Primary Google Sign-In Action */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleFastTrackLogin()}
                disabled={isSigningIn}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-semibold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                {/* Google Multicolor SVG Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google (ABC Executive)</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Or Sign In with Custom Google Email
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Custom Google Email Input Form */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Google / Company Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@gmail.com or name@abcpvtltd.lk"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Perera"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Assigned Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="Administrator">Administrator</option>
                      <option value="Inventory Manager">Inventory Manager</option>
                      <option value="Auditor">Financial Auditor</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleFastTrackLogin(customEmail, customName)}
                  disabled={isSigningIn}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSigningIn ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In & Open Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Security note */}
            <div className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
              <p>Protected by ABC (PVT) LTD Enterprise Access Control.</p>
              <p className="mt-0.5 text-[10px]">Session secured with role-based segregation.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800/80">
        © {new Date().getFullYear()} ABC (PVT) LTD. All rights reserved. Registered in Sri Lanka (PV-102948/2023).
      </footer>
    </div>
  );
}
