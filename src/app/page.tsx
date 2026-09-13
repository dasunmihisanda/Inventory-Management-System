'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  DollarSign,
  TrendingUp,
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  ShoppingCart,
  Layers,
  BarChart3,
  PackageCheck,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { StatCard } from '@/components/ui/StatCard';
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
import { LogDamagedModal } from '@/components/modals/LogDamagedModal';
import { AddSaleModal } from '@/components/modals/AddSaleModal';
import { AddPurchaseModal } from '@/components/modals/AddPurchaseModal';
import { AddItemModal } from '@/components/modals/AddItemModal';

export default function DashboardPage() {
  const { items, sales, purchases, damagedItems, overallStats, formatCurrency, theme } = useInventory();
  const [isDamagedOpen, setIsDamagedOpen] = useState(false);
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Chart 1 data: Sales Revenue and Profit per SKU
  const salesBySku = items.map((item) => {
    const itemSales = sales.filter((s) => s.itemCode === item.code);
    const revenue = itemSales.reduce((acc, s) => acc + s.totalValue, 0);
    const profit = itemSales.reduce((acc, s) => acc + s.grossProfitFifo, 0);
    return {
      sku: item.code.split(' - ')[0],
      name: item.name,
      revenue,
      profit,
    };
  });

  // Chart 2 data: Inventory Valuation by SKU
  const valuationBySku = items.map((item) => ({
    name: item.code,
    value: item.avcoValuation,
  }));

  // Chart 3 data: Overall stock status
  const totalPurchased = items.reduce((acc, i) => acc + i.totalPurchasedQty, 0);
  const totalSold = items.reduce((acc, i) => acc + i.totalSoldQty, 0);
  const totalAvailable = overallStats.totalAvailableUnits;
  const totalDamaged = overallStats.totalDamagedUnits;

  const stockBreakdown = [
    { name: 'Available in Stock', value: totalAvailable, color: '#10b981' },
    { name: 'Sold to Customers', value: totalSold, color: '#3b82f6' },
    { name: 'Damaged / Removed', value: totalDamaged, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900/40 border border-blue-200/80 dark:border-blue-900/30 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              ABC (PVT) LTD — Live Inventory Tracking Active
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Enterprise Inventory & Valuation Dashboard
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time multi-batch FIFO tracking, Weighted Average Costing (AVCO), damaged stock isolation, and Item Demand Frequency (IDF) classification.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => setIsSaleOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" />
              New Sale Invoice
            </button>
            <button
              onClick={() => setIsPurchaseOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Receive PO / GRN
            </button>
            <button
              onClick={() => setIsDamagedOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/60 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Log Damaged Stock
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Undamaged Stock"
          value={`${overallStats.totalAvailableUnits} Units`}
          subtitle={`Across ${items.length} master product SKUs`}
          icon={Boxes}
          variant="blue"
          trend={{
            value: `${overallStats.totalDamagedUnits} Damaged`,
            isPositive: overallStats.totalDamagedUnits === 0,
            label: 'isolated from available stock',
          }}
        />

        <StatCard
          title="Inventory Asset Valuation"
          value={formatCurrency(overallStats.totalAvcoValuation)}
          subtitle={`FIFO Valuation: ${formatCurrency(overallStats.totalFifoValuation)}`}
          icon={DollarSign}
          variant="emerald"
          trend={{
            value: `Diff: ${formatCurrency(Math.abs(overallStats.totalFifoValuation - overallStats.totalAvcoValuation))}`,
            isPositive: overallStats.totalFifoValuation >= overallStats.totalAvcoValuation,
            label: 'FIFO vs AVCO variance',
          }}
        />

        <StatCard
          title="Gross Sales Revenue"
          value={formatCurrency(overallStats.totalRevenue)}
          subtitle={`Gross Profit: ${formatCurrency(overallStats.totalGrossProfit)}`}
          icon={TrendingUp}
          variant="purple"
          trend={{
            value: `${sales.length} Invoices`,
            isPositive: true,
            label: 'recorded to date',
          }}
        />

        <StatCard
          title="Damaged Stock Write-Off"
          value={formatCurrency(overallStats.totalDamagedLoss)}
          subtitle={`${overallStats.totalDamagedUnits} units quarantined / removed`}
          icon={AlertOctagon}
          variant="rose"
          trend={{
            value: `${formatCurrency(overallStats.totalDamagedSalvage)}`,
            isPositive: overallStats.totalDamagedSalvage > 0,
            label: 'salvaged recovery',
          }}
        />
      </div>

      {/* Critical Damaged Stock Alert Banner */}
      {overallStats.totalDamagedUnits > 0 && (
        <div className="rounded-xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Damaged Items Quarantined & Subtracted from Inventory
              </h4>
              <p className="text-[11px] text-rose-700 dark:text-rose-400/80 mt-0.5">
                {overallStats.totalDamagedUnits} damaged units are currently quarantined or written off. Available inventory has been automatically reduced so these cannot be sold.
              </p>
            </div>
          </div>
          <Link
            href="/damaged-items"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/70 border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <span>Review Damaged Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Revenue & Profit by Product */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs dark:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue vs Gross Profit by SKU</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total earnings realized per product code</p>
            </div>
            <Link
              href="/analysis/average-sales"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
            >
              <span>Detailed Sales Run-Rate</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-72 w-full">
            {salesBySku.length === 0 || sales.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <BarChart3 className="w-10 h-10 mb-2 opacity-30 text-blue-500" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Sales Data Recorded</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                  Issue customer sales invoices to generate real-time revenue and gross profit charts.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesBySku} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="sku" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                      color: theme === 'dark' ? '#ffffff' : '#0f172a',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="revenue" name="Total Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Gross Profit (FIFO)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stock Breakdown Donut */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs dark:shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Stock Allocation Status</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total units purchased ({totalPurchased}) distribution</p>
          </div>

          <div className="h-56 w-full my-2">
            {totalPurchased === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Boxes className="w-10 h-10 mb-2 opacity-30 text-emerald-500" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Inventory Stock Received</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                  Receive your first purchase shipment to visualize stock allocation breakdown.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stockBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} Units`, '']}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                      color: theme === 'dark' ? '#ffffff' : '#0f172a',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {stockBreakdown.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{s.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {s.value} ({totalPurchased > 0 ? Math.round((s.value / totalPurchased) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Modules Quick Jump */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dedicated Financial & Inventory Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Jump directly into specialized business calculation modules</p>
          </div>
          <Link
            href="/analysis"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
          >
            <span>View All Analysis</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              title: 'Average Costing',
              desc: 'Weighted Average AVCO',
              href: '/analysis/average-costing',
              icon: '📐',
            },
            {
              title: 'Average Sales',
              desc: 'Velocity & DSI Runway',
              href: '/analysis/average-sales',
              icon: '📈',
            },
            {
              title: 'Inventory Valuation',
              desc: 'FIFO vs AVCO Variance',
              href: '/analysis/inventory-valuation',
              icon: '💼',
            },
            {
              title: 'FIFO Engine',
              desc: 'Lot Layer Depletion',
              href: '/analysis/fifo',
              icon: '📦',
            },
            {
              title: 'IDF Classification',
              desc: 'Fast / Slow / Non-Moving',
              href: '/analysis/idf',
              icon: '⚡',
            },
            {
              title: 'Costing Sheet',
              desc: 'Landed Cost & Margins',
              href: '/analysis/costing-sheet',
              icon: '📊',
            },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-300 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:border-slate-700/60 dark:hover:border-blue-500/40 transition-all group shadow-2xs"
            >
              <span className="text-xl block mb-1">{card.icon}</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {card.title}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Current Product Inventory Snapshot */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs dark:shadow-lg overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Current Stock Position Summary</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Derived from initial Excel tracker & live transactions</p>
          </div>
          <Link
            href="/inventory"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
          >
            <span>Full Inventory Ledger</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Item Code / SKU</th>
                <th>Product Name</th>
                <th>Total Purchased</th>
                <th>Total Sold</th>
                <th>Damaged (Removed)</th>
                <th>Available QTY</th>
                <th>AVCO Cost</th>
                <th>Valuation (AVCO)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Boxes className="w-10 h-10 mx-auto mb-2.5 opacity-30 text-blue-500" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Inventory Items in System</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                      Start fresh by registering your business product SKUs and receiving purchase batches.
                    </p>
                    <button
                      onClick={() => setIsAddItemOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>+ Register First Product SKU</span>
                    </button>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLow = item.availableQty <= item.reorderLevel;
                  return (
                    <tr key={item.code} className="transition-colors">
                      <td className="font-bold text-slate-900 dark:text-white">{item.code}</td>
                      <td className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</td>
                      <td className="text-slate-700 dark:text-slate-300">{item.totalPurchasedQty.toLocaleString()}</td>
                      <td className="text-slate-700 dark:text-slate-300">{item.totalSoldQty.toLocaleString()}</td>
                      <td>
                        {item.damagedQty > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3" />
                            {item.damagedQty}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs ${
                            item.availableQty > 100
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                              : item.availableQty > 20
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                          }`}
                        >
                          {item.availableQty} {item.unit}
                        </span>
                      </td>
                      <td className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(item.avcoUnitCost)}</td>
                      <td className="font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                        {formatCurrency(item.avcoValuation)}
                      </td>
                      <td>
                        {isLow ? (
                          <Badge variant="warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">Normal</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <LogDamagedModal isOpen={isDamagedOpen} onClose={() => setIsDamagedOpen(false)} />
      <AddSaleModal isOpen={isSaleOpen} onClose={() => setIsSaleOpen(false)} />
      <AddPurchaseModal isOpen={isPurchaseOpen} onClose={() => setIsPurchaseOpen(false)} />
      <AddItemModal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} />
    </div>
  );
}
