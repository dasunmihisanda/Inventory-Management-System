'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Truck,
  ShoppingCart,
  AlertOctagon,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Calculator,
  Layers,
  Activity,
  ArrowRightLeft,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { overallStats } = useInventory();
  const { user, logout } = useAuth();
  const [analysisOpen, setAnalysisOpen] = React.useState(
    pathname.startsWith('/analysis')
  );

  const navItems = [
    {
      name: 'Executive Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Inventory Balance',
      href: '/inventory',
      icon: Boxes,
      badge: overallStats.lowStockCount > 0 ? `${overallStats.lowStockCount} Low` : null,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
    },
    {
      name: 'Purchases & GRN',
      href: '/purchases',
      icon: Truck,
      badge: null,
    },
    {
      name: 'Sales Invoices',
      href: '/sales',
      icon: ShoppingCart,
      badge: null,
    },
    {
      name: 'Damaged Items',
      href: '/damaged-items',
      icon: AlertOctagon,
      badge: overallStats.totalDamagedUnits > 0 ? `${overallStats.totalDamagedUnits} Units` : null,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30',
      highlight: true,
    },
  ];

  const analysisItems = [
    {
      name: '1. Average Costing (AVCO)',
      href: '/analysis/average-costing',
      icon: Calculator,
    },
    {
      name: '2. Average Sales Velocity',
      href: '/analysis/average-sales',
      icon: Activity,
    },
    {
      name: '3. Inventory Valuation',
      href: '/analysis/inventory-valuation',
      icon: BarChart3,
    },
    {
      name: '4. FIFO Engine & Depletion',
      href: '/analysis/fifo',
      icon: Layers,
    },
    {
      name: '5. Fast/Slow/Non-Moving (IDF)',
      href: '/analysis/idf',
      icon: ArrowRightLeft,
    },
    {
      name: '6. Landed Costing Sheet',
      href: '/analysis/costing-sheet',
      icon: FileSpreadsheet,
    },
  ];

  const isAnalysisActive = pathname.startsWith('/analysis');

  return (
    <aside className="w-64 bg-white dark:bg-[#0d1322] border-r border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 h-screen sticky top-0 select-none z-30 transition-colors duration-200 shadow-xs dark:shadow-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 text-sm tracking-wider">
          ABC
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            ABC (PVT) LTD
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Inventory & Valuation</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Operations
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60',
                item.highlight && !isActive && 'text-rose-700 dark:text-rose-300/90 hover:bg-rose-50 dark:hover:text-rose-200'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300'
                      : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full border font-semibold',
                    isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Separated Analysis Section */}
        <div className="pt-4">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Intelligence & Valuation</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-md font-bold">6 Modules</span>
          </div>

          <button
            onClick={() => setAnalysisOpen(!analysisOpen)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all',
              isAnalysisActive
                ? 'bg-slate-100 text-blue-700 border border-slate-200 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
            )}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Analysis Portal</span>
            </div>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-slate-400 dark:text-slate-400 transition-transform duration-200',
                analysisOpen && 'rotate-180'
              )}
            />
          </button>

          {analysisOpen && (
            <div className="mt-1 ml-3 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-1">
              <Link
                href="/analysis"
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors',
                  pathname === '/analysis'
                    ? 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40'
                )}
              >
                <span>Analysis Overview Hub</span>
              </Link>
              {analysisItems.map((sub) => {
                const isSubActive = pathname === sub.href;
                const SubIcon = sub.icon;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors',
                      isSubActive
                        ? 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40'
                    )}
                  >
                    <SubIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{sub.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Administration */}
        <div className="pt-4">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Reports & Tools
          </div>
          <Link
            href="/reports"
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
              pathname === '/reports'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
            )}
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            <span>Audit & Print Reports</span>
          </Link>
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
              pathname === '/settings'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
            )}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Business Settings</span>
          </Link>
        </div>
      </nav>

      {/* Stock Health Footer Status */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-slate-500 dark:text-slate-400">Stock Availability</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            {overallStats.totalStockUnits > 0
              ? Math.round((overallStats.totalAvailableUnits / overallStats.totalStockUnits) * 100)
              : 0}
            %
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full"
            style={{
              width: `${
                overallStats.totalStockUnits > 0
                  ? (overallStats.totalAvailableUnits / overallStats.totalStockUnits) * 100
                  : 0
              }%`,
            }}
          />
        </div>
        {overallStats.totalDamagedUnits > 0 && (
          <p className="mt-2 text-[10px] text-rose-600 dark:text-rose-400/90 flex items-center gap-1 font-medium">
            <AlertOctagon className="w-3 h-3" />
            {overallStats.totalDamagedUnits} damaged items isolated
          </p>
        )}
      </div>

      {/* User Session & Sign Out Bar */}
      {user && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-[#0d1322]">
          <div className="flex items-center gap-2.5 min-w-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-none mt-0.5">
                {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0 cursor-pointer"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
