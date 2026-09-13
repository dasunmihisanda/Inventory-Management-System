'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  ArrowRightLeft,
  Zap,
  Clock,
  AlertOctagon,
  TrendingDown,
  DollarSign,
  Boxes,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function IdfAnalysisPage() {
  const { getIdfMetrics, items, formatCurrency, theme } = useInventory();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-12 text-center">
        <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 text-amber-500 opacity-40" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Items to Classify</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Fast, Slow, and Non-Moving (IDF / FSN) classification categorizes inventory by velocity, turnover ratios, and capital stagnation. Add items and transactions to view velocity matrix.
        </p>
      </div>
    );
  }

  const idfList = getIdfMetrics();

  const fastItems = idfList.filter((i) => i.classification === 'Fast Moving');
  const slowItems = idfList.filter((i) => i.classification === 'Slow Moving');
  const nonItems = idfList.filter((i) => i.classification === 'Non Moving');

  const fastCapital = fastItems.reduce((acc, i) => acc + i.capitalTiedUp, 0);
  const slowCapital = slowItems.reduce((acc, i) => acc + i.capitalTiedUp, 0);
  const nonCapital = nonItems.reduce((acc, i) => acc + i.capitalTiedUp, 0);
  const totalTiedUp = fastCapital + slowCapital + nonCapital;

  const movementDonut = [
    { name: 'Fast Moving (High Velocity)', value: fastCapital, color: '#10b981' },
    { name: 'Slow Moving (Moderate)', value: slowCapital, color: '#f59e0b' },
    { name: 'Non Moving (Dead Stock Risk)', value: nonCapital, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            5. Fast, Slow & Non-Moving Analysis (IDF / FSN)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Item Demand Frequency (IDF) classification categorizes inventory by velocity, turnover ratios, and capital stagnation risks.
          </p>
        </div>
      </div>

      {/* Capital Tied-up KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Fast Moving Stock</span>
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(fastCapital)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {fastItems.length} SKUs ({totalTiedUp > 0 ? Math.round((fastCapital / totalTiedUp) * 100) : 0}% of capital)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Slow Moving Stock</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(slowCapital)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {slowItems.length} SKUs ({totalTiedUp > 0 ? Math.round((slowCapital / totalTiedUp) * 100) : 0}% of capital)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Non-Moving (Dead Stock)</span>
            <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(nonCapital)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {nonItems.length} SKUs ({totalTiedUp > 0 ? Math.round((nonCapital / totalTiedUp) * 100) : 0}% of capital)
          </p>
        </div>
      </div>

      {/* IDF Classification Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Item Demand Frequency (IDF) Classification Ledger</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Movement classification and algorithmic action recommendations
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Product Description</th>
                <th>Classification</th>
                <th className="text-right">Turnover Ratio</th>
                <th className="text-right">Runway (DSI)</th>
                <th className="text-right">Daily Velocity</th>
                <th className="text-right">Capital Tied Up</th>
                <th>Actionable Strategic Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {idfList.map((idf) => {
                const item = items.find((i) => i.code === idf.itemCode);
                return (
                  <tr key={idf.itemCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{idf.itemCode}</td>
                    <td className="text-slate-700 dark:text-slate-200">{item?.name}</td>
                    <td>
                      <Badge
                        variant={
                          idf.classification === 'Fast Moving'
                            ? 'success'
                            : idf.classification === 'Slow Moving'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {idf.classification}
                      </Badge>
                    </td>
                    <td className="text-right font-mono font-semibold text-slate-900 dark:text-white">{idf.turnoverRatio.toFixed(2)}x</td>
                    <td className="text-right font-mono text-slate-700 dark:text-slate-300">{idf.daysSalesOfInventory} Days</td>
                    <td className="text-right text-slate-700 dark:text-slate-300">{idf.salesVelocityPerDay} / day</td>
                    <td className="text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(idf.capitalTiedUp)}
                    </td>
                    <td className="max-w-xs">
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{idf.recommendation}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capital Stagnation Donut Chart */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs dark:shadow-lg">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Working Capital Distribution by Movement Velocity</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Portion of inventory investment locked in each movement tier</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={movementDonut}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {movementDonut.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val) || 0), '']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {movementDonut.map((m) => (
              <div
                key={m.name}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{m.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {totalTiedUp > 0 ? Math.round((m.value / totalTiedUp) * 100) : 0}% of Total Asset Capital
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {formatCurrency(m.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
