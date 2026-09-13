'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Plus,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Calendar,
  DollarSign,
  PackagePlus,
  Sun,
  Moon,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { useAuth } from '@/context/AuthContext';
import { AddPurchaseModal } from '@/components/modals/AddPurchaseModal';
import { AddSaleModal } from '@/components/modals/AddSaleModal';
import { LogDamagedModal } from '@/components/modals/LogDamagedModal';
import { AddItemModal } from '@/components/modals/AddItemModal';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { currency, setCurrency, theme, toggleTheme, isCloudConnected, syncStatus, syncWithCloud } = useInventory();
  const { user, logout } = useAuth();

  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [isDamagedOpen, setIsDamagedOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derive human-readable title from pathname
  const getPageTitle = () => {
    if (pathname === '/' || pathname === '/dashboard') return 'Executive Dashboard';
    if (pathname === '/inventory') return 'Current Inventory Position';
    if (pathname === '/purchases') return 'Purchases & Goods Received (GRN)';
    if (pathname === '/sales') return 'Sales Orders & Invoicing';
    if (pathname === '/damaged-items') return 'Damaged Items & Quarantine Management';
    if (pathname === '/analysis') return 'Intelligence & Valuation Portal';
    if (pathname === '/analysis/average-costing') return '1. Average Costing (AVCO)';
    if (pathname === '/analysis/average-sales') return '2. Average Sales Velocity';
    if (pathname === '/analysis/inventory-valuation') return '3. Inventory Valuation (AVCO vs FIFO)';
    if (pathname === '/analysis/fifo') return '4. FIFO Engine & Layer Depletion';
    if (pathname === '/analysis/idf') return '5. Fast, Slow & Non-Moving Analysis (IDF)';
    if (pathname === '/analysis/costing-sheet') return '6. Landed Costing Sheet & Margins';
    if (pathname === '/reports') return 'Audit Reports & Financial Summary';
    if (pathname === '/settings') return 'Business Profile & Settings';
    return 'Inventory Management';
  };

  return (
    <>
      <header className="h-16 bg-white/90 dark:bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200 shadow-xs dark:shadow-none">
        {/* Left: Title & Breadcrumb */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{getPageTitle()}</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">ABC (PVT) LTD Enterprise System</p>
        </div>

        {/* Right: Quick Action Buttons & Switchers */}
        <div className="flex items-center gap-2">
          {/* Supabase Cloud Live Status */}
          {isCloudConnected && (
            <button
              onClick={() => syncWithCloud()}
              title={syncStatus === 'syncing' ? 'Syncing with Supabase Cloud...' : 'Supabase Cloud Connected (Click to re-sync)'}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium shadow-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`} />
              <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Supabase Live'}</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
            <DollarSign className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 mr-1" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Select Currency"
              className="bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="Rs." className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Rs. (LKR)</option>
              <option value="$" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">$ (USD)</option>
              <option value="€" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">€ (EUR)</option>
              <option value="£" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">£ (GBP)</option>
            </select>
          </div>

          {/* Quick Date Display */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Today: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          {/* New Item Modal Trigger */}
          <button
            onClick={() => setIsAddItemOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
          >
            <PackagePlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>+ SKU</span>
          </button>

          {/* Damage Quarantine Action Trigger */}
          <button
            onClick={() => setIsDamagedOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/50 transition-colors shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Log Damaged Stock</span>
          </button>

          {/* Purchase Order Trigger */}
          <button
            onClick={() => setIsPurchaseOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
          >
            <Truck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>+ Purchase</span>
          </button>

          {/* Sales Order Trigger */}
          <button
            onClick={() => setIsSaleOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Record Sale</span>
            <span className="sm:hidden">Sale</span>
          </button>

          {/* Authenticated User Profile & Dropdown */}
          {user && (
            <div className="relative ml-1" ref={profileRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 transition-all text-left group"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300 dark:ring-slate-600"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden xl:block">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[110px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none truncate max-w-[110px]">
                    {user.role}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Account Header */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3 mb-2">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">
                        <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        {user.role}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {user.authProvider === 'google' ? 'Google Auth' : 'ABC Access'}
                      </span>
                    </div>
                  </div>

                  {/* Account Meta */}
                  <div className="px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
                    <p>Last signed in:</p>
                    <p className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                      {new Date(user.lastLogin).toLocaleString('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>

                  {/* Sign Out Action */}
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from ABC Enterprise</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Global Modals */}
      <AddPurchaseModal isOpen={isPurchaseOpen} onClose={() => setIsPurchaseOpen(false)} />
      <AddSaleModal isOpen={isSaleOpen} onClose={() => setIsSaleOpen(false)} />
      <LogDamagedModal isOpen={isDamagedOpen} onClose={() => setIsDamagedOpen(false)} />
      <AddItemModal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} />
    </>
  );
};
