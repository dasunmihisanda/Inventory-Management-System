'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  Boxes,
  Search,
  Download,
  AlertOctagon,
  Plus,
  Truck,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { LogDamagedModal } from '@/components/modals/LogDamagedModal';
import { AddPurchaseModal } from '@/components/modals/AddPurchaseModal';
import { AddSaleModal } from '@/components/modals/AddSaleModal';
import { AddItemModal } from '@/components/modals/AddItemModal';
import * as XLSX from 'xlsx';

export default function InventoryPage() {
  const { items, overallStats, formatCurrency } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'damaged' | 'normal'>('all');

  // Modal states with selected item
  const [selectedItemCode, setSelectedItemCode] = useState<string>('');
  const [isDamagedOpen, setIsDamagedOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'low') return item.availableQty <= item.reorderLevel;
    if (statusFilter === 'damaged') return item.damagedQty > 0;
    if (statusFilter === 'normal') return item.availableQty > item.reorderLevel;
    return true;
  });

  // Export to Excel function
  const handleExportToExcel = () => {
    const exportData = items.map((item) => ({
      'Item Code': item.code,
      'Product Name': item.name,
      'Category': item.category,
      'Unit of Measure': item.unit,
      'QTY - Purchased': item.totalPurchasedQty,
      'QTY - Sold': item.totalSoldQty,
      'Damaged / Quarantined QTY': item.damagedQty,
      'Available QTY': item.availableQty,
      'AVCO Unit Cost': item.avcoUnitCost,
      'FIFO Unit Cost': item.fifoUnitCost,
      'Total AVCO Valuation': item.avcoValuation,
      'Total FIFO Valuation': item.fifoValuation,
      'Reorder Level': item.reorderLevel,
      'Stock Status': item.availableQty <= item.reorderLevel ? 'Low Stock' : 'Adequate',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Position');
    XLSX.writeFile(wb, `ABC_Inventory_Position_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Current Inventory Position
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master stock ledger with real-time damaged item segregation, weighted average costing, and FIFO valuation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportToExcel}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Export Excel (.xlsx)
          </button>
          <button
            onClick={() => setIsAddItemOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New SKU
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Items in Catalog</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{items.length} SKUs</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Available Units</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {overallStats.totalAvailableUnits.toLocaleString()} Units
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Isolated Damaged Units</p>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
            {overallStats.totalDamagedUnits.toLocaleString()} Units
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Current Stock Asset Value</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(overallStats.totalAvcoValuation)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU code, name, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Products ({items.length})
          </button>
          <button
            onClick={() => setStatusFilter('normal')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'normal'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            In Stock
          </button>
          <button
            onClick={() => setStatusFilter('low')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'low'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Low Stock ({overallStats.lowStockCount})
          </button>
          <button
            onClick={() => setStatusFilter('damaged')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'damaged'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Damaged ({overallStats.totalDamagedUnits})
          </button>
        </div>
      </div>

      {/* Main Inventory Position Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>CODE / SKU</th>
                <th>Product Description</th>
                <th>Category</th>
                <th className="text-right">Purchased</th>
                <th className="text-right">Sold</th>
                <th className="text-right text-rose-600 dark:text-rose-400">Damaged</th>
                <th className="text-right font-bold text-emerald-600 dark:text-emerald-400">Available</th>
                <th className="text-right">AVCO Cost</th>
                <th className="text-right">Valuation</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <Boxes className="w-10 h-10 mx-auto mb-2 opacity-30 text-blue-500" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {items.length === 0 ? 'No Inventory Items in Database' : 'No records match your filter criteria'}
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-3">
                      {items.length === 0
                        ? 'Click below to register your first product code and start tracking stock.'
                        : 'Try adjusting your search query or status filter.'}
                    </p>
                    {items.length === 0 && (
                      <button
                        onClick={() => setIsAddItemOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add First SKU</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.availableQty <= item.reorderLevel;
                  return (
                    <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{item.code}</td>
                      <td>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Reorder Threshold: {item.reorderLevel} {item.unit}
                        </p>
                      </td>
                      <td>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="text-right font-medium text-slate-700 dark:text-slate-300">{item.totalPurchasedQty.toLocaleString()}</td>
                      <td className="text-right font-medium text-slate-700 dark:text-slate-300">
                        {item.totalSoldQty.toLocaleString()}
                      </td>
                      <td className="text-right">
                        {item.damagedQty > 0 ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            {item.damagedQty}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="text-right">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs inline-block ${
                            item.availableQty > 100
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                              : item.availableQty > 20
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {item.availableQty} {item.unit}
                        </span>
                      </td>
                      <td className="text-right font-mono text-slate-800 dark:text-slate-200">{formatCurrency(item.avcoUnitCost)}</td>
                      <td className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(item.avcoValuation)}
                      </td>
                      <td>
                        {isLow ? (
                          <Badge variant="warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">Normal</Badge>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Log Damaged Stock"
                            onClick={() => {
                              setSelectedItemCode(item.code);
                              setIsDamagedOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                          <button
                            title="Receive Purchase Batch"
                            onClick={() => {
                              setSelectedItemCode(item.code);
                              setIsPurchaseOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:text-sky-400 dark:hover:bg-sky-950/60 dark:hover:text-sky-300 border border-transparent hover:border-sky-200 dark:hover:border-sky-900 transition-colors"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                          <button
                            title="Record Sale"
                            onClick={() => {
                              setSelectedItemCode(item.code);
                              setIsSaleOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals with Selected Item Code */}
      <LogDamagedModal
        isOpen={isDamagedOpen}
        onClose={() => setIsDamagedOpen(false)}
        preselectedItemCode={selectedItemCode}
      />
      <AddPurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        preselectedItemCode={selectedItemCode}
      />
      <AddSaleModal
        isOpen={isSaleOpen}
        onClose={() => setIsSaleOpen(false)}
        preselectedItemCode={selectedItemCode}
      />
      <AddItemModal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} />
    </div>
  );
}
