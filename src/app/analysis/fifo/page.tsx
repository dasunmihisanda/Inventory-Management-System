'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  Layers,
  ArrowDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function FifoAnalysisPage() {
  const { items, purchases, sales, formatCurrency } = useInventory();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-12 text-center">
        <Layers className="w-12 h-12 mx-auto mb-3 text-sky-500 opacity-40" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No FIFO Lots Active</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          The FIFO engine manages chronological purchase layers and exhaustion. Register product SKUs and purchase batches to begin tracking FIFO depletion.
        </p>
      </div>
    );
  }

  const [selectedItemCode, setSelectedItemCode] = useState(items[0]?.code ?? '');

  const selectedItem = items.find((i) => i.code === selectedItemCode) || items[0];

  // Batches for selected item sorted chronologically
  const itemBatches = purchases
    .filter((p) => p.itemCode === selectedItemCode)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // FIFO Aging Calculation (reference date 2025-02-15)
  const refDate = new Date('2025-02-15').getTime();

  let tier0_30 = 0;
  let tier31_60 = 0;
  let tier61_90 = 0;
  let tier90Plus = 0;

  purchases
    .filter((p) => p.status === 'active' && p.remainingQty > 0)
    .forEach((p) => {
      const days = Math.floor((refDate - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24));
      const val = p.remainingQty * p.unitValue;
      if (days <= 30) tier0_30 += val;
      else if (days <= 60) tier31_60 += val;
      else if (days <= 90) tier61_90 += val;
      else tier90Plus += val;
    });

  const totalAgingVal = tier0_30 + tier31_60 + tier61_90 + tier90Plus;

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            4. FIFO Engine & Batch Layer Depletion
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            First-In, First-Out ledger tracking purchase lot consumption, remaining unit cost layers, and inventory age profiling.
          </p>
        </div>
      </div>

      {/* Stock Aging Tiers Row */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Inventory Age Profiling (FIFO Buckets)</h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Active Batches Capital: {formatCurrency(totalAgingVal)}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">0 – 30 Days (Fresh Stock)</p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(tier0_30)}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {totalAgingVal > 0 ? Math.round((tier0_30 / totalAgingVal) * 100) : 0}% of inventory
            </p>
          </div>

          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40">
            <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">31 – 60 Days (Optimal)</p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(tier31_60)}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {totalAgingVal > 0 ? Math.round((tier31_60 / totalAgingVal) * 100) : 0}% of inventory
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">61 – 90 Days (Aging)</p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(tier61_90)}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {totalAgingVal > 0 ? Math.round((tier61_90 / totalAgingVal) * 100) : 0}% of inventory
            </p>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
            <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">&gt; 90 Days (Slow / Stale)</p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(tier90Plus)}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {totalAgingVal > 0 ? Math.round((tier90Plus / totalAgingVal) * 100) : 0}% of inventory
            </p>
          </div>
        </div>
      </div>

      {/* SKU Selector & Layer Stack */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">FIFO Lot Layer Stack</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Visual chronological queue of purchase batches and remaining units</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Select Item:</label>
            <select
              value={selectedItemCode}
              onChange={(e) => setSelectedItemCode(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {items.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.code} — {i.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected SKU Overview Card */}
        {selectedItem && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Selected Product: </span>
              <span className="font-bold text-slate-900 dark:text-white">{selectedItem.code} ({selectedItem.name})</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Available in FIFO Stack: </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedItem.availableQty} {selectedItem.unit}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Current FIFO Lot Valuation: </span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(selectedItem.fifoValuation)}</span>
            </div>
          </div>
        )}

        {/* Batch Queue Cards */}
        <div className="space-y-3 pt-2">
          {itemBatches.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No purchase lots recorded for this item.</p>
          ) : (
            itemBatches.map((batch, index) => {
              const percentRemaining = batch.qty > 0 ? (batch.remainingQty / batch.qty) * 100 : 0;
              const isDepleted = batch.status === 'depleted' || batch.remainingQty === 0;

              return (
                <div
                  key={batch.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isDepleted
                      ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/60 opacity-60'
                      : 'bg-white dark:bg-slate-850/60 border-sky-200 dark:border-sky-900/50 shadow-xs dark:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                            Batch #{batch.invoiceNo}
                          </span>
                          <Badge variant={isDepleted ? 'default' : 'success'}>
                            {isDepleted ? 'Exhausted' : 'Active FIFO Layer'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>Received: {batch.date}</span>
                          <span>•</span>
                          <span>Supplier: {batch.supplier}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs sm:text-right">
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Unit Lot Cost</p>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(batch.unitValue)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Remaining / Initial</p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          <span className={isDepleted ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-600 dark:text-emerald-400'}>
                            {batch.remainingQty}
                          </span>{' '}
                          / {batch.qty} units
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Layer Value</p>
                        <p className="font-mono font-bold text-sky-600 dark:text-sky-400">
                          {formatCurrency(batch.remainingQty * batch.unitValue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Visual Depletion Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                      <span>Consumed: {batch.qty - batch.remainingQty} units</span>
                      <span>Remaining: {percentRemaining.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isDepleted ? 'bg-slate-400 dark:bg-slate-600' : 'bg-sky-500'
                        }`}
                        style={{ width: `${percentRemaining}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sale Invoices FIFO Depletion Audit Log */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Historical Sales FIFO Consumption Audit</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Full audit trail of purchase batches consumed by each customer invoice</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Sale Date</th>
                <th>Item Code</th>
                <th>Units Sold</th>
                <th>FIFO Batches Consumed</th>
                <th className="text-right">FIFO COGS</th>
                <th className="text-right">Sales Revenue</th>
                <th className="text-right">Realized Margin</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="font-mono font-bold text-blue-600 dark:text-blue-400">#{s.invoiceNo}</td>
                  <td className="whitespace-nowrap text-slate-700 dark:text-slate-300">{s.date}</td>
                  <td className="font-semibold text-slate-900 dark:text-white">{s.itemCode}</td>
                  <td className="font-medium text-slate-700 dark:text-slate-200">{s.qty.toLocaleString()}</td>
                  <td>
                    {s.consumedLayers && s.consumedLayers.length > 0 ? (
                      <div className="space-y-1">
                        {s.consumedLayers.map((c, idx) => (
                          <div key={idx} className="text-[11px] font-mono text-sky-700 dark:text-sky-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            <span>
                              Batch #{c.batchInvoiceNo}: {c.qtyConsumed} units @ {formatCurrency(c.unitCost)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400">Single Lot</span>
                    )}
                  </td>
                  <td className="text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(s.fifoCogs)}</td>
                  <td className="text-right font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(s.totalValue)}</td>
                  <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(s.grossProfitFifo)} ({s.marginPercentFifo}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
