'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Lock,
  AlertOctagon,
} from 'lucide-react';

export default function LoginPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const {
    isAuthenticated,
    loginWithGoogleCredential,
    googleClientId,
    isLoading,
  } = useAuth();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // If already authenticated, redirect to returnUrl
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, returnUrl, router]);

  // Load Google Identity Services (GIS) script
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
              setErrorMessage(null);
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
          width: 340,
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
                Use your authorized Google account to access the ABC Enterprise Inventory System.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            {googleClientId ? (
              <div className="flex flex-col items-center justify-center space-y-4 pt-2">
                <div ref={googleBtnRef} className="min-h-[44px]" />

                {isSigningIn && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating with Google...</span>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 text-center">
                  Secured with Google OAuth 2.0 Single Sign-On
                </p>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-300 text-center space-y-1">
                <p className="font-semibold">Google Sign-In not configured</p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  Please set the <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded text-[10px]">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> environment variable.
                </p>
              </div>
            )}

            {/* Security note */}
            <div className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
              <p>Protected by ABC (PVT) LTD Enterprise Access Control.</p>
              <p className="mt-0.5 text-[10px]">Only authorized Google accounts can access this system.</p>
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
