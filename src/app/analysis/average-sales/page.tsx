'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  Activity,
  TrendingUp,
  Clock,
  Calendar,
  AlertTriangle,
  Boxes,
  Zap,
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
} from 'recharts';

export default function AverageSalesPage() {
  const { items, sales, formatCurrency, theme } = useInventory();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-12 text-center">
        <Activity className="w-12 h-12 mx-auto mb-3 text-blue-500 opacity-40" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Sales Records Available</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Average sales velocity, run-rate, and Days Sales of Inventory (DSI) will compute automatically once sales invoices are recorded.
        </p>
      </div>
    );
  }

  // 30-day observation window metrics
  const observationDays = 30;

  const salesMetrics = items.map((item) => {
    const itemSales = sales.filter((s) => s.itemCode === item.code);
    const totalUnitsSold = itemSales.reduce((acc, s) => acc + s.qty, 0);
    const totalRevenue = itemSales.reduce((acc, s) => acc + s.totalValue, 0);

    const averageSellingPrice = totalUnitsSold > 0 ? totalRevenue / totalUnitsSold : item.standardSellingPrice;
    const dailyVelocity = totalUnitsSold / observationDays;
    const weeklyVelocity = dailyVelocity * 7;
    const monthlyVelocity = dailyVelocity * 30;

    const daysOfInventory = dailyVelocity > 0 ? Math.round(item.availableQty / dailyVelocity) : 999;

    return {
      code: item.code,
      name: item.name,
      totalUnitsSold,
      totalRevenue,
      averageSellingPrice,
      dailyVelocity: Math.round(dailyVelocity * 10) / 10,
      weeklyVelocity: Math.round(weeklyVelocity),
      monthlyVelocity: Math.round(monthlyVelocity),
      availableQty: item.availableQty,
      daysOfInventory,
    };
  });

  const chartData = salesMetrics.map((m) => ({
    name: m.code.split(' - ')[0],
    fullName: m.name,
    monthlySales: m.monthlyVelocity,
    availableStock: m.availableQty,
  }));

  const totalSoldAll = salesMetrics.reduce((acc, m) => acc + m.totalUnitsSold, 0);
  const avgDailyUnitsAll = Math.round((totalSoldAll / observationDays) * 10) / 10;
  const totalRevenueAll = salesMetrics.reduce((acc, m) => acc + m.totalRevenue, 0);
  const weightedAsp = totalSoldAll > 0 ? totalRevenueAll / totalSoldAll : 0;

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            2. Average Sales & Velocity Analysis
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Analyze daily, weekly, and monthly demand velocities, average realized selling price (ASP), and inventory runway (DSI).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Daily Sales (ADS)</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{avgDailyUnitsAll} Units / Day</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Combined velocity across portfolio</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Realized Price (ASP)</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(weightedAsp)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Weighted average price per unit sold</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Invoiced Sales</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{totalSoldAll.toLocaleString()} Units</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cumulative sales recorded</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monthly Revenue Run-Rate</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{formatCurrency(totalRevenueAll)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Gross commercial top-line</p>
        </div>
      </div>

      {/* Average Sales Metrics Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Product Sales Velocity & Stock Runway Ledger</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Demand run-rates compared against currently available undamaged inventory</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Product Description</th>
                <th className="text-right">Total Units Sold</th>
                <th className="text-right">Realized ASP</th>
                <th className="text-right">Daily Velocity</th>
                <th className="text-right">Weekly Velocity</th>
                <th className="text-right text-emerald-600 dark:text-emerald-400 font-bold">Monthly Run-Rate</th>
                <th className="text-right">Available Stock</th>
                <th className="text-right">Runway (DSI)</th>
                <th>Stock Risk Status</th>
              </tr>
            </thead>
            <tbody>
              {salesMetrics.map((m) => {
                const isCriticalRunway = m.daysOfInventory <= 10;
                const isHealthy = m.daysOfInventory > 10 && m.daysOfInventory <= 60;
                return (
                  <tr key={m.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{m.code}</td>
                    <td className="text-slate-700 dark:text-slate-200">{m.name}</td>
                    <td className="text-right font-medium">{m.totalUnitsSold.toLocaleString()}</td>
                    <td className="text-right font-mono font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(m.averageSellingPrice)}
                    </td>
                    <td className="text-right font-medium">{m.dailyVelocity} / day</td>
                    <td className="text-right text-slate-700 dark:text-slate-300">{m.weeklyVelocity} / wk</td>
                    <td className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {m.monthlyVelocity.toLocaleString()} units
                    </td>
                    <td className="text-right font-bold text-slate-900 dark:text-white">{m.availableQty}</td>
                    <td className="text-right font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          isCriticalRunway
                            ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : isHealthy
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {m.daysOfInventory} Days
                      </span>
                    </td>
                    <td>
                      {isCriticalRunway ? (
                        <Badge variant="danger">Stockout Risk</Badge>
                      ) : isHealthy ? (
                        <Badge variant="success">Optimal</Badge>
                      ) : (
                        <Badge variant="warning">Excess Stock</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Runway vs Stock Chart */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs dark:shadow-lg">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Monthly Sales Run-Rate vs Available Stock</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Comparing customer monthly demand against physical warehouse stock</p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
              <XAxis dataKey="name" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} />
              <YAxis stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [`${val} Units`, '']}
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
              <Bar dataKey="monthlySales" name="Monthly Demand Rate" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="availableStock" name="Current Stock on Hand" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
