'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  Scale,
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
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function InventoryValuationPage() {
  const { items, overallStats, formatCurrency, theme } = useInventory();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-12 text-center">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-purple-500 opacity-40" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Inventory Valuation to Report</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Balance sheet comparison between Weighted AVCO and FIFO valuation requires at least one registered inventory SKU and purchase batch.
        </p>
      </div>
    );
  }

  const totalRetailValuation = items.reduce(
    (acc, i) => acc + i.availableQty * i.standardSellingPrice,
    0
  );

  const varianceValuation = overallStats.totalFifoValuation - overallStats.totalAvcoValuation;

  const chartData = items.map((item) => ({
    name: item.code.split(' - ')[0],
    fullName: item.name,
    avcoValue: item.avcoValuation,
    fifoValue: item.fifoValuation,
    retailValue: item.availableQty * item.standardSellingPrice,
  }));

  const pieData = items.map((item) => ({
    name: item.code,
    value: item.avcoValuation,
  }));

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            3. Inventory Asset Valuation (AVCO vs. FIFO)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Compare balance sheet inventory valuations under Weighted Average Costing and First-In, First-Out methods.
          </p>
        </div>
      </div>

      {/* Valuation KPI Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Weighted AVCO Valuation</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(overallStats.totalAvcoValuation)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Standard periodic weighted valuation</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">FIFO Inventory Valuation</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(overallStats.totalFifoValuation)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Current asset value in active lots</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Valuation Variance (FIFO - AVCO)</p>
          <p
            className={`text-xl font-bold mt-1 ${
              varianceValuation >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {varianceValuation >= 0 ? '+' : ''}
            {formatCurrency(varianceValuation)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {varianceValuation >= 0 ? 'FIFO yields higher asset value' : 'AVCO yields higher asset value'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gross Retail Revenue Potential</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{formatCurrency(totalRetailValuation)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Valuation at standard retail selling price</p>
        </div>
      </div>

      {/* Accounting Compliance Note */}
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 flex items-start gap-3 shadow-xs">
        <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">Managerial & Statutory Accounting Notes</p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Both AVCO and FIFO are permitted under LKAS 2 (Sri Lanka Accounting Standard 2 / IAS 2 - Inventories). In periods of rising supplier purchase prices, FIFO reports higher ending inventory asset values and lower Cost of Goods Sold, whereas AVCO provides smoother, more conservative margins.
          </p>
        </div>
      </div>

      {/* Detailed SKU Valuation Ledger */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">SKU Valuation & Variance Ledger</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Granular holding value comparisons for undamaged stock on hand</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Product Description</th>
                <th className="text-right">Available Units</th>
                <th className="text-right">AVCO Cost</th>
                <th className="text-right text-blue-600 dark:text-blue-400 font-bold">AVCO Value</th>
                <th className="text-right">FIFO Cost</th>
                <th className="text-right text-emerald-600 dark:text-emerald-400 font-bold">FIFO Value</th>
                <th className="text-right">Variance ($)</th>
                <th className="text-right font-bold text-purple-600 dark:text-purple-400">Retail Potential</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const diff = item.fifoValuation - item.avcoValuation;
                const retailPotential = item.availableQty * item.standardSellingPrice;
                return (
                  <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{item.code}</td>
                    <td className="text-slate-700 dark:text-slate-200">{item.name}</td>
                    <td className="text-right font-bold text-slate-900 dark:text-white">{item.availableQty} {item.unit}</td>
                    <td className="text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(item.avcoUnitCost)}</td>
                    <td className="text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(item.avcoValuation)}
                    </td>
                    <td className="text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(item.fifoUnitCost)}</td>
                    <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.fifoValuation)}
                    </td>
                    <td className="text-right font-mono">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold border ${
                          diff > 0
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
                            : diff < 0
                            ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
                            : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {diff >= 0 ? '+' : ''}
                        {formatCurrency(diff)}
                      </span>
                    </td>
                    <td className="text-right font-mono font-bold text-purple-600 dark:text-purple-300">
                      {formatCurrency(retailPotential)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Valuation Comparison Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs dark:shadow-lg">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Valuation by Methodology (AVCO vs FIFO)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Direct dollar asset comparison per SKU</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} />
                <YAxis
                  stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="avcoValue" name="AVCO Asset Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fifoValue" name="FIFO Asset Value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Valuation Share Donut */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs dark:shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Capital Weighting Share</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of tied up capital across inventory items</p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            {items.map((item, idx) => (
              <div key={item.code} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{item.code}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {overallStats.totalAvcoValuation > 0
                    ? Math.round((item.avcoValuation / overallStats.totalAvcoValuation) * 100)
                    : 0}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
