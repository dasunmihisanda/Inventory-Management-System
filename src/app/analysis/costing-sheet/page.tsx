'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  FileSpreadsheet,
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Package,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function CostingSheetPage() {
  const { items, costingParams, updateCostingParams, getLandedCostBreakdown, formatCurrency } =
    useInventory();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-12 text-center">
        <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-rose-500 opacity-40" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Products for Costing Sheet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Landed costing breakdown calculates customs tariffs, freight, and markup per SKU. Register a product to configure landed costing parameters.
        </p>
      </div>
    );
  }

  const [selectedItemCode, setSelectedItemCode] = useState(items[0]?.code ?? '');

  const selectedParams = costingParams[selectedItemCode] || {
    itemCode: selectedItemCode,
    basePurchaseCost: 1000,
    freightPerUnit: 50,
    customsDutyPercent: 12,
    insuranceAndHandling: 25,
    targetMarkupPercent: 35,
    actualSellingPrice: 1500,
  };

  const breakdown = getLandedCostBreakdown(selectedItemCode);

  const handleParamChange = (field: string, val: number) => {
    updateCostingParams(selectedItemCode, { [field]: val });
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            6. Landed Costing Sheet & Margin Analysis
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Compute true landed unit cost by factoring in inbound cargo freight, customs tariffs, port clearing, and insurance.
          </p>
        </div>
      </div>

      {/* Interactive Landed Cost Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Cost Controls (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Landed Cost Parameter Engine</h3>
            </div>
            <select
              value={selectedItemCode}
              onChange={(e) => setSelectedItemCode(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white"
            >
              {items.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.code}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Base FOB / Ex-Factory Purchase Cost
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={selectedParams.basePurchaseCost}
                onChange={(e) => handleParamChange('basePurchaseCost', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Inbound Freight / Unit
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={selectedParams.freightPerUnit}
                  onChange={(e) => handleParamChange('freightPerUnit', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Customs Tariff / Duty %
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={selectedParams.customsDutyPercent}
                  onChange={(e) =>
                    handleParamChange('customsDutyPercent', parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Insurance & Port Handling
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={selectedParams.insuranceAndHandling}
                  onChange={(e) =>
                    handleParamChange('insuranceAndHandling', parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Commercial Markup %
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={selectedParams.targetMarkupPercent}
                  onChange={(e) =>
                    handleParamChange('targetMarkupPercent', parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Actual Realized Selling Price
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={selectedParams.actualSellingPrice}
                onChange={(e) => handleParamChange('actualSellingPrice', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Right: Landed Cost Waterfall & Economics (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Unit Landed Cost Waterfall Breakdown</h3>

            {breakdown && (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">1. Base FOB Purchase Price:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(breakdown.baseCost)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">+ 2. Inbound Shipping & Cargo Freight:</span>
                  <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                    +{formatCurrency(breakdown.freightCost)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">
                    + 3. Customs Duty ({selectedParams.customsDutyPercent}% on base):
                  </span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                    +{formatCurrency(breakdown.customsDuty)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">+ 4. Port Handling & Insurance:</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    +{formatCurrency(breakdown.insuranceHandling)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between font-bold text-sm">
                  <span className="text-slate-900 dark:text-white">= Total Unit Landed Cost:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 text-base">
                    {formatCurrency(breakdown.totalLandedCost)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Margin Summary Cards */}
          {breakdown && (
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold">Target Price</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(breakdown.targetSellingPrice)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">At {selectedParams.targetMarkupPercent}% markup</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold">Gross Margin / Unit</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatCurrency(breakdown.grossProfitMargin)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {breakdown.actualSellingPrice > 0
                    ? ((breakdown.grossProfitMargin / breakdown.actualSellingPrice) * 100).toFixed(1)
                    : 0}
                  % margin
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold">Break-Even Units</p>
                <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">{breakdown.breakEvenUnits} Units</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">To cover overhead</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Product Costing Comparison Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Full Catalog Landed Costing Comparison</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Unit economics and margin parameters for all inventory items</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Base FOB</th>
                <th className="text-right">Freight</th>
                <th className="text-right">Duties</th>
                <th className="text-right">Handling</th>
                <th className="text-right text-blue-600 dark:text-blue-400 font-bold">Total Landed Cost</th>
                <th className="text-right">Actual Selling Price</th>
                <th className="text-right text-emerald-600 dark:text-emerald-400 font-bold">Unit Profit</th>
                <th className="text-right">Margin %</th>
                <th className="text-right">Break-Even Units</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const b = getLandedCostBreakdown(item.code);
                if (!b) return null;
                const marginPercent =
                  b.actualSellingPrice > 0 ? (b.grossProfitMargin / b.actualSellingPrice) * 100 : 0;

                return (
                  <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{item.code}</td>
                    <td className="font-mono text-slate-700 dark:text-slate-300">{formatCurrency(b.baseCost)}</td>
                    <td className="text-right font-mono text-slate-500 dark:text-slate-400">{formatCurrency(b.freightCost)}</td>
                    <td className="text-right font-mono text-slate-500 dark:text-slate-400">{formatCurrency(b.customsDuty)}</td>
                    <td className="text-right font-mono text-slate-500 dark:text-slate-400">{formatCurrency(b.insuranceHandling)}</td>
                    <td className="text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(b.totalLandedCost)}
                    </td>
                    <td className="text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(b.actualSellingPrice)}
                    </td>
                    <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(b.grossProfitMargin)}
                    </td>
                    <td className="text-right font-semibold">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${
                          marginPercent >= 30
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
                            : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {marginPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right font-mono text-purple-600 dark:text-purple-400 font-bold">{b.breakEvenUnits}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
