'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  AlertOctagon,
  Search,
  Download,
  Plus,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Undo2,
  DollarSign,
  PackageX,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { LogDamagedModal } from '@/components/modals/LogDamagedModal';
import * as XLSX from 'xlsx';

export default function DamagedItemsPage() {
  const { damagedItems, items, formatCurrency } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [isDamagedOpen, setIsDamagedOpen] = useState(false);

  // Filter damaged items
  const filteredDamaged = damagedItems.filter((d) => {
    const matchesSearch =
      d.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.loggedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.notes && d.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (actionFilter !== 'all' && d.action !== actionFilter) return false;
    return true;
  });

  const totalDamagedQty = damagedItems.reduce((acc, d) => acc + d.qtyDamaged, 0);
  const totalGrossCost = damagedItems.reduce((acc, d) => acc + d.qtyDamaged * d.unitCostAtDamage, 0);
  const totalSalvage = damagedItems.reduce((acc, d) => acc + d.salvageValueRecovered, 0);
  const totalNetLoss = damagedItems.reduce((acc, d) => acc + d.netLoss, 0);

  const handleExportToExcel = () => {
    const exportData = damagedItems.map((d) => ({
      'Log ID': d.id,
      'Date': d.date,
      'Item Code': d.itemCode,
      'Damaged Qty': d.qtyDamaged,
      'Damage Reason': d.reason,
      'Disposition Action': d.action,
      'Batch Reference': d.batchRef || 'Earliest Lot',
      'Unit Cost at Damage': d.unitCostAtDamage,
      'Gross Damage Cost': d.qtyDamaged * d.unitCostAtDamage,
      'Salvage Recovered': d.salvageValueRecovered,
      'Net Write-Off Loss': d.netLoss,
      'Inspector / Logged By': d.loggedBy,
      'Inspection Notes': d.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Damaged & Quarantined Items');
    XLSX.writeFile(wb, `ABC_Damaged_Items_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining Damaged Item Isolation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-50 via-red-50/50 to-white dark:from-rose-950/40 dark:via-red-950/20 dark:to-slate-900/40 border border-rose-200 dark:border-rose-900/40 p-6 shadow-xs dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold mb-2">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              Stock Isolation & Quarantine Protocol
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Damaged Stock & Quarantine Ledger
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Damaged items are segregated immediately upon discovery and subtracted from Available Inventory. This prevents defective units from being sold, while tracking scrap write-offs and salvage recovery.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={handleExportToExcel}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Export Loss Report (.xlsx)
            </button>
            <button
              onClick={() => setIsDamagedOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 dark:shadow-rose-900/40 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Log & Quarantine Damaged Stock
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Defective Units Removed</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{totalDamagedQty.toLocaleString()} Units</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Permanently deducted from available stock</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gross Inventory Cost of Defect</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalGrossCost)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">At acquisition AVCO unit cost</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Salvage Value Recovered</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalSalvage)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Through outlet or scrap disposal</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Net Write-Off Financial Loss</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{formatCurrency(totalNetLoss)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Book loss charged against operating income</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, defect reason, inspector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {['all', 'Written Off / Scrapped', 'Quarantined for Review', 'Returned to Vendor', 'Salvage Sale'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActionFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                actionFilter === tab
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'all' ? `All Records (${damagedItems.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Damaged Stock Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Date Logged</th>
                <th>Item Code</th>
                <th className="text-right text-rose-600 dark:text-rose-400">Damaged Qty</th>
                <th>Reason for Defect</th>
                <th>Disposition Action</th>
                <th>Batch Ref</th>
                <th className="text-right">Cost at Damage</th>
                <th className="text-right">Salvage Value</th>
                <th className="text-right text-rose-600 dark:text-rose-400">Net Loss</th>
                <th>Inspector</th>
              </tr>
            </thead>
            <tbody>
              {filteredDamaged.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {damagedItems.length === 0 ? 'No Damaged Items in Quarantine' : 'No damaged stock records found matching filter'}
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      {damagedItems.length === 0
                        ? '100% of available inventory is in prime sellable condition. Defective stock logged here is automatically isolated from sale.'
                        : 'Try adjusting your search query or action filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDamaged.map((d) => {
                  const item = items.find((i) => i.code === d.itemCode);
                  return (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{d.id}</td>
                      <td className="whitespace-nowrap text-slate-700 dark:text-slate-300">{d.date}</td>
                      <td>
                        <span className="font-semibold text-slate-900 dark:text-white">{d.itemCode}</span>
                        {item && <span className="block text-[11px] text-slate-500 dark:text-slate-400">{item.name}</span>}
                      </td>
                      <td className="text-right font-bold text-rose-600 dark:text-rose-400">{d.qtyDamaged} units</td>
                      <td>
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-[11px] font-medium">
                          {d.reason}
                        </span>
                      </td>
                      <td>
                        <Badge
                          variant={
                            d.action === 'Written Off / Scrapped'
                              ? 'danger'
                              : d.action === 'Quarantined for Review'
                              ? 'warning'
                              : d.action === 'Salvage Sale'
                              ? 'info'
                              : 'purple'
                          }
                        >
                          {d.action}
                        </Badge>
                      </td>
                      <td className="text-slate-500 dark:text-slate-400 text-xs font-mono">{d.batchRef || 'Earliest Lot'}</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(d.unitCostAtDamage)}</td>
                      <td className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(d.salvageValueRecovered)}
                      </td>
                      <td className="text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(d.netLoss)}
                      </td>
                      <td>
                        <p className="text-slate-800 dark:text-slate-200 text-xs font-medium">{d.loggedBy}</p>
                        {d.notes && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic max-w-xs truncate" title={d.notes}>
                            {d.notes}
                          </p>
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

      <LogDamagedModal isOpen={isDamagedOpen} onClose={() => setIsDamagedOpen(false)} />
    </div>
  );
}
