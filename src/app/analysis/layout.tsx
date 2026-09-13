'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calculator,
  Activity,
  BarChart3,
  Layers,
  ArrowRightLeft,
  FileSpreadsheet,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Overview Hub',
      href: '/analysis',
      icon: LayoutGrid,
      exact: true,
    },
    {
      name: '1. Average Costing',
      href: '/analysis/average-costing',
      icon: Calculator,
    },
    {
      name: '2. Average Sales',
      href: '/analysis/average-sales',
      icon: Activity,
    },
    {
      name: '3. Inventory Valuation',
      href: '/analysis/inventory-valuation',
      icon: BarChart3,
    },
    {
      name: '4. FIFO Engine',
      href: '/analysis/fifo',
      icon: Layers,
    },
    {
      name: '5. Fast/Slow/Non-Moving (IDF)',
      href: '/analysis/idf',
      icon: ArrowRightLeft,
    },
    {
      name: '6. Costing Sheet',
      href: '/analysis/costing-sheet',
      icon: FileSpreadsheet,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Analysis Navigation Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/90 p-2 shadow-xs dark:shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Tab Content */}
      <div>{children}</div>
    </div>
  );
}
