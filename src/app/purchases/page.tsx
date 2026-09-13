'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  Truck,
  Search,
  Download,
  Plus,
  Layers,
  Calendar,
  DollarSign,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { AddPurchaseModal } from '@/components/modals/AddPurchaseModal';
import * as XLSX from 'xlsx';

export default function PurchasesPage() {
  const { purchases, items, formatCurrency } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

  // Filter purchases
  const filteredPurchases = purchases.filter((p) => {
    return (
      p.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPurchaseValue = purchases.reduce((acc, p) => acc + p.totalValue, 0);
  const totalUnitsPurchased = purchases.reduce((acc, p) => acc + p.qty, 0);
  const totalLandedAddons = purchases.reduce(
    (acc, p) => acc + ((p.freightCost || 0) + (p.customsDuty || 0) + (p.handlingCost || 0)),
    0
  );

  const handleExportToExcel = () => {
    const exportData = purchases.map((p) => ({
      'Invoice No': p.invoiceNo,
      'Date of Purchase': p.date,
      'Item Code': p.itemCode,
      'Supplier': p.supplier,
      'Quantity': p.qty,
      'Unit Purchase Value': p.unitValue,
      'Total Value': p.totalValue,
      'Freight Cost': p.freightCost || 0,
      'Customs Duty': p.customsDuty || 0,
      'Handling Cost': p.handlingCost || 0,
      'Total Landed Cost': p.totalLandedCost || p.totalValue,
      'Landed Unit Cost': p.landedUnitCost || p.unitValue,
      'FIFO Remaining Qty': p.remainingQty,
      'Lot Status': p.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Purchases Ledger');
    XLSX.writeFile(wb, `ABC_Purchases_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Purchases & Goods Received (GRN)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track incoming supplier shipments, landed cost attribution (freight, duties), and individual FIFO lot creation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportToExcel}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Export Purchases (.xlsx)
          </button>
          <button
            onClick={() => setIsPurchaseOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Receive Purchase Batch
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Received Units</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{totalUnitsPurchased.toLocaleString()} Units</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across {purchases.length} total purchase batches</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cumulative Purchase Expenditure</p>
          <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">{formatCurrency(totalPurchaseValue)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Direct invoice purchase values</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Inbound Landed Cost Surcharges</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(totalLandedAddons)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Freight, customs tariffs & port handling</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, item code, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredPurchases.length} of {purchases.length} batches
        </span>
      </div>

      {/* Purchases Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Date of Purchase</th>
                <th>Item Code</th>
                <th>Supplier</th>
                <th className="text-right">Qty Received</th>
                <th className="text-right">Unit Value</th>
                <th className="text-right">Total Invoice</th>
                <th className="text-right">Landed Unit Cost</th>
                <th className="text-right">FIFO Remaining</th>
                <th>FIFO Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <Truck className="w-10 h-10 mx-auto mb-2 opacity-30 text-sky-500" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {purchases.length === 0 ? 'No Purchase Batches Recorded' : 'No purchase batches found matching your search'}
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-3">
                      {purchases.length === 0
                        ? 'Record incoming supplier shipments to initialize stock and landed cost layers.'
                        : 'Try searching with a different invoice number or supplier name.'}
                    </p>
                    {purchases.length === 0 && (
                      <button
                        onClick={() => setIsPurchaseOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Receive First Purchase Batch</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => {
                  const item = items.find((i) => i.code === p.itemCode);
                  const isDepleted = p.status === 'depleted' || p.remainingQty === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="font-mono font-bold text-sky-700 dark:text-sky-400">#{p.invoiceNo}</td>
                      <td className="whitespace-nowrap text-slate-700 dark:text-slate-300">{p.date}</td>
                      <td>
                        <span className="font-semibold text-slate-900 dark:text-white">{p.itemCode}</span>
                        {item && <span className="block text-[11px] text-slate-500 dark:text-slate-400">{item.name}</span>}
                      </td>
                      <td className="text-slate-700 dark:text-slate-300 text-xs">{p.supplier}</td>
                      <td className="text-right font-medium text-slate-700 dark:text-slate-300">{p.qty.toLocaleString()}</td>
                      <td className="text-right font-mono text-slate-800 dark:text-slate-200">{formatCurrency(p.unitValue)}</td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(p.totalValue)}
                      </td>
                      <td className="text-right font-mono text-sky-700 dark:text-sky-300">
                        {formatCurrency(p.landedUnitCost || p.unitValue)}
                      </td>
                      <td className="text-right font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            isDepleted
                              ? 'text-slate-500 bg-slate-100 dark:bg-slate-800/50'
                              : 'text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-800/60'
                          }`}
                        >
                          {p.remainingQty} / {p.qty}
                        </span>
                      </td>
                      <td>
                        {isDepleted ? (
                          <Badge variant="default">Depleted</Badge>
                        ) : (
                          <Badge variant="success">Active Lot</Badge>
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

      <AddPurchaseModal isOpen={isPurchaseOpen} onClose={() => setIsPurchaseOpen(false)} />
    </div>
  );
}
