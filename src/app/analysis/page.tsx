'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calculator,
  Activity,
  BarChart3,
  Layers,
  ArrowRightLeft,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Boxes,
  Percent,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';

export default function AnalysisHubPage() {
  const { items, overallStats, getIdfMetrics, formatCurrency } = useInventory();
  const idfList = getIdfMetrics();

  const fastCount = idfList.filter((i) => i.classification === 'Fast Moving').length;
  const slowCount = idfList.filter((i) => i.classification === 'Slow Moving').length;
  const nonCount = idfList.filter((i) => i.classification === 'Non Moving').length;

  const valuationDiff = overallStats.totalFifoValuation - overallStats.totalAvcoValuation;

  const modules = [
    {
      num: '01',
      title: 'Average Costing (AVCO)',
      desc: 'Weighted Average Cost computation per SKU across all purchase lots with live what-if order simulation.',
      statLabel: 'Avg Stock Unit Cost',
      statVal: formatCurrency(
        overallStats.totalAvailableUnits > 0
          ? overallStats.totalAvcoValuation / overallStats.totalAvailableUnits
          : 0
      ),
      href: '/analysis/average-costing',
      icon: Calculator,
      color: 'bg-blue-50/70 dark:bg-slate-900/40 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      num: '02',
      title: 'Average Sales Velocity',
      desc: 'Average Daily Sales (ADS), monthly revenue run-rate, and Days Sales of Inventory (DSI / stock runway).',
      statLabel: 'Total Invoiced Units',
      statVal: `${items.reduce((acc, i) => acc + i.totalSoldQty, 0).toLocaleString()} Units`,
      href: '/analysis/average-sales',
      icon: Activity,
      color: 'bg-emerald-50/70 dark:bg-slate-900/40 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      num: '03',
      title: 'Inventory Valuation',
      desc: 'Comprehensive Balance Sheet asset appraisal comparing AVCO vs FIFO valuations with variance analysis.',
      statLabel: 'FIFO vs AVCO Diff',
      statVal: `${valuationDiff >= 0 ? '+' : ''}${formatCurrency(valuationDiff)}`,
      href: '/analysis/inventory-valuation',
      icon: BarChart3,
      color: 'bg-purple-50/70 dark:bg-slate-900/40 border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400',
    },
    {
      num: '04',
      title: 'FIFO Engine & Depletion',
      desc: 'Granular First-In, First-Out lot layer tracking, sale-by-sale COGS attribution, and inventory age profiling.',
      statLabel: 'Active Batches',
      statVal: `${items.length} Tracked Batches`,
      href: '/analysis/fifo',
      icon: Layers,
      color: 'bg-sky-50/70 dark:bg-slate-900/40 border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400',
    },
    {
      num: '05',
      title: 'Fast / Slow / Non-Moving (IDF)',
      desc: 'Item Demand Frequency (IDF) scoring, turnover velocity classification, dead-stock alerts, and capital tied up.',
      statLabel: 'IDF Breakdown',
      statVal: `${fastCount} Fast | ${slowCount} Slow | ${nonCount} Non`,
      href: '/analysis/idf',
      icon: ArrowRightLeft,
      color: 'bg-amber-50/70 dark:bg-slate-900/40 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400',
    },
    {
      num: '06',
      title: 'Landed Costing Sheet',
      desc: 'Complete product unit landed cost breakdown (freight, duties, handling), target markups, and break-even units.',
      statLabel: 'Average Margin',
      statVal: `${((overallStats.totalGrossProfit / (overallStats.totalRevenue || 1)) * 100).toFixed(1)}%`,
      href: '/analysis/costing-sheet',
      icon: FileSpreadsheet,
      color: 'bg-rose-50/70 dark:bg-slate-900/40 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Executive Inventory & Financial Analysis Portal
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
          ABC (PVT) LTD’s 6 core analytical pillars for cost control, working capital management, stock velocity, and profitability. Select any module below for detailed calculations and interactive tools.
        </p>
      </div>

      {/* 6 Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.title}
              href={m.href}
              className={`rounded-2xl p-5 border ${m.color} hover:shadow-md transition-all duration-200 flex flex-col justify-between group shadow-xs dark:shadow-lg`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{m.num}</span>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{m.desc}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    {m.statLabel}
                  </p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{m.statVal}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
