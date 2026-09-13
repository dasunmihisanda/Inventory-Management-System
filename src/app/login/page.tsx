import React, { Suspense } from 'react';
import LoginPortal from '@/components/auth/LoginPortal';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-xl shadow-blue-500/30 text-lg tracking-wider animate-pulse">
              ABC
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>Loading ABC Authentication Portal...</span>
            </div>
          </div>
        </div>
      }
    >
      <LoginPortal />
    </Suspense>
  );
}
