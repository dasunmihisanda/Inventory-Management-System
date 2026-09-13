'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Calendar, Sun, Moon } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme, isCloudConnected, syncStatus, syncWithCloud } = useInventory();
  const [currentDate, setCurrentDate] = useState<string>('');

  // Hydration-safe date formatting
  useEffect(() => {
    const formatted = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
    setCurrentDate(formatted);
  }, []);

  // Derive title from current route with Executive Dashboard as standard default
  const getPageTitle = () => {
    if (pathname === '/' || pathname === '/dashboard') return 'Executive Dashboard';
    if (pathname === '/inventory') return 'Inventory Balance';
    if (pathname === '/purchases') return 'Purchases & GRN';
    if (pathname === '/sales') return 'Sales Invoices';
    if (pathname === '/damaged-items') return 'Damaged Items';
    if (pathname === '/analysis') return 'Valuation & Intelligence';
    if (pathname === '/analysis/average-costing') return 'Average Costing (AVCO)';
    if (pathname === '/analysis/average-sales') return 'Average Sales Velocity';
    if (pathname === '/analysis/inventory-valuation') return 'Inventory Valuation (AVCO vs FIFO)';
    if (pathname === '/analysis/fifo') return 'FIFO Engine & Depletion';
    if (pathname === '/analysis/idf') return 'Fast/Slow/Non-Moving (IDF)';
    if (pathname === '/analysis/costing-sheet') return 'Landed Costing Sheet';
    if (pathname === '/reports') return 'Audit & Valuation Reports';
    if (pathname === '/settings') return 'Business Profile & Settings';
    return 'Executive Dashboard';
  };

  return (
    <header className="h-18 bg-white/80 dark:bg-[#0b0f17]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      {/* Left: Executive Dashboard & Enterprise System Subtitle */}
      <div className="flex flex-col justify-center py-1">
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          {getPageTitle()}
        </h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          ABC (PVT) LTD Enterprise System
        </p>
      </div>

      {/* Right: Date, Cloud Status, Theme Toggle */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Date Display */}
        {currentDate && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{currentDate}</span>
          </div>
        )}

        {/* Cloud Status (Connected / Syncing) */}
        {isCloudConnected ? (
          <button
            onClick={() => syncWithCloud()}
            title={
              syncStatus === 'syncing'
                ? 'Syncing with Supabase Cloud...'
                : 'Cloud database connected. Click to refresh sync.'
            }
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 text-xs font-medium shadow-2xs hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${
                  syncStatus === 'syncing' ? 'animate-spin' : 'animate-ping'
                }`}
              />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold tracking-wide">
              {syncStatus === 'syncing' ? 'Syncing...' : 'Connected'}
            </span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/60 text-xs font-medium shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="font-medium tracking-wide">Local</span>
          </div>
        )}

        {/* Subtle Divider */}
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Dark/Light Mode Switch */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 transition-transform duration-200 hover:-rotate-12" />
          )}
        </button>
      </div>
    </header>
  );
};
