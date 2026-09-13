'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  Calculator,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function AverageCostingPage() {
  const { items, purchases, formatCurrency, theme } = useInventory();

  // What-If Simulator state
  const [simItemCode, setSimItemCode] = useState(items[0]?.code ?? '');
  const [simQty, setSimQty] = useState<number>(500);
  const [simPrice, setSimPrice] = useState<number>(1050);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-12 text-center">
        <Calculator className="w-12 h-12 mx-auto mb-3 text-blue-500 opacity-40" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Inventory Items Registered</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Weighted Average Costing (AVCO) calculates the rolling cost across purchase batches. Please register inventory SKUs and purchase batches to begin.
        </p>
      </div>
    );
  }

  const selectedItem = items.find((i) => i.code === simItemCode) || items[0];

  // Simulator calculation
  const currentPurchasedQty = selectedItem?.totalPurchasedQty || 0;
  const currentTotalValue = purchases
    .filter((p) => p.itemCode === selectedItem?.code)
    .reduce((acc, p) => acc + p.totalValue, 0);

  const newTotalQty = currentPurchasedQty + simQty;
  const newTotalValue = currentTotalValue + simQty * simPrice;
  const projectedAvco = newTotalQty > 0 ? newTotalValue / newTotalQty : 0;
  const avcoDiff = projectedAvco - (selectedItem?.avcoUnitCost || 0);
  const avcoPercentChange =
    (selectedItem?.avcoUnitCost || 0) > 0 ? (avcoDiff / selectedItem!.avcoUnitCost) * 100 : 0;

  // Chart data comparing Last Purchase Price vs Current AVCO
  const costComparisonData = items.map((item) => ({
    name: item.code.split(' - ')[0],
    fullName: item.name,
    avco: item.avcoUnitCost,
    lastCost: item.lastPurchasePrice,
  }));

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            1. Average Costing Analysis (Weighted AVCO)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Weighted Average Cost per unit smooths price fluctuations by dividing cumulative acquisition cost by total units received.
          </p>
        </div>
      </div>

      {/* Formula & Explanation Card */}
      <div className="rounded-2xl bg-blue-50/60 dark:bg-gradient-to-r dark:from-blue-950/30 dark:via-slate-900/40 dark:to-slate-900/60 border border-blue-200 dark:border-blue-900/40 p-5 shadow-xs dark:shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weighted Average Cost (AVCO) Methodology</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Under IFRS and standard managerial accounting, AVCO calculates unit cost by pooling all purchase batches:
            </p>
            <div className="p-3 bg-white dark:bg-slate-950/80 rounded-xl border border-blue-200 dark:border-slate-800 text-xs font-mono text-blue-700 dark:text-blue-300 inline-block shadow-xs">
              Unit AVCO = Total Purchase Value / Total Purchased Units
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              When new batches arrive at higher or lower prices, the inventory unit valuation adjusts proportionately, eliminating artificial spikes in Cost of Goods Sold.
            </p>
          </div>
        </div>
      </div>

      {/* AVCO Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weighted Average Cost by Product SKU</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Comparison of Weighted AVCO against latest supplier invoices</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Product Name</th>
                <th className="text-right">Total Acquired QTY</th>
                <th className="text-right">Total Incurred Cost</th>
                <th className="text-right text-blue-600 dark:text-blue-400 font-bold">Current AVCO</th>
                <th className="text-right">Last Batch Price</th>
                <th className="text-right">Cost Variance %</th>
                <th className="text-right font-bold text-emerald-600 dark:text-emerald-400">Total Stock AVCO Value</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const variance =
                  item.avcoUnitCost > 0
                    ? ((item.lastPurchasePrice - item.avcoUnitCost) / item.avcoUnitCost) * 100
                    : 0;
                return (
                  <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{item.code}</td>
                    <td className="text-slate-700 dark:text-slate-200">{item.name}</td>
                    <td className="text-right font-medium">{item.totalPurchasedQty.toLocaleString()}</td>
                    <td className="text-right font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrency(
                        purchases
                          .filter((p) => p.itemCode === item.code)
                          .reduce((acc, p) => acc + p.totalValue, 0)
                      )}
                    </td>
                    <td className="text-right font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {formatCurrency(item.avcoUnitCost)}
                    </td>
                    <td className="text-right font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.lastPurchasePrice)}
                    </td>
                    <td className="text-right font-semibold">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${
                          variance > 0
                            ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/40'
                            : variance < 0
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/40'
                            : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {variance > 0 ? '+' : ''}
                        {variance.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.avcoValuation)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart: AVCO vs Last Purchase Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs dark:shadow-lg">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">AVCO vs Last Purchase Invoice Cost</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Visualizing procurement inflation / deflation impact</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} />
                <YAxis stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} />
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
                <Bar dataKey="avco" name="Weighted AVCO" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastCost" name="Last Purchase Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive What-If Purchase Simulator */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs dark:shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live "What-If" Purchase Simulator</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Simulate proposed order quantities and supplier quotes to see exact impact on Weighted AVCO.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Select SKU</label>
                <select
                  value={simItemCode}
                  onChange={(e) => {
                    setSimItemCode(e.target.value);
                    const it = items.find((i) => i.code === e.target.value);
                    if (it) setSimPrice(it.lastPurchasePrice);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                >
                  {items.map((i) => (
                    <option key={i.code} value={i.code}>
                      {i.code} — {i.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Proposed Order Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={simQty}
                    onChange={(e) => setSimQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Quoted Supplier Unit Price
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={simPrice}
                    onChange={(e) => setSimPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="mt-4 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Current Unit AVCO:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(selectedItem?.avcoUnitCost || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">New Projected AVCO:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{formatCurrency(projectedAvco)}</span>
            </div>
            <div className="pt-2 border-t border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Weighted Cost Shift:</span>
              <span
                className={`font-semibold ${
                  avcoDiff > 0 ? 'text-rose-600 dark:text-rose-400' : avcoDiff < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {avcoDiff >= 0 ? '+' : ''}
                {formatCurrency(avcoDiff)} ({avcoPercentChange >= 0 ? '+' : ''}
                {avcoPercentChange.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
