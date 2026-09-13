'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  ShoppingCart,
  Search,
  Download,
  Plus,
  TrendingUp,
  DollarSign,
  Layers,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { AddSaleModal } from '@/components/modals/AddSaleModal';
import { Modal } from '@/components/ui/Modal';
import { SaleRecord } from '@/types/inventory';
import * as XLSX from 'xlsx';

export default function SalesPage() {
  const { sales, items, formatCurrency } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<SaleRecord | null>(null);

  const filteredSales = sales.filter((s) => {
    return (
      s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalValue, 0);
  const totalFifoCogs = sales.reduce((acc, s) => acc + s.fifoCogs, 0);
  const totalGrossProfit = totalRevenue - totalFifoCogs;
  const overallMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

  const handleExportToExcel = () => {
    const exportData = sales.map((s) => ({
      'Invoice No': s.invoiceNo,
      'Date of Sale': s.date,
      'Item Code': s.itemCode,
      'Customer': s.customer,
      'Quantity Sold': s.qty,
      'Unit Selling Value': s.unitValue,
      'Total Value (Revenue)': s.totalValue,
      'FIFO COGS': s.fifoCogs,
      'AVCO COGS': s.avcoCogs,
      'Gross Profit (FIFO)': s.grossProfitFifo,
      'Gross Margin % (FIFO)': s.marginPercentFifo,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Ledger');
    XLSX.writeFile(wb, `ABC_Sales_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Sales Orders & Invoicing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customer sales invoices with automated FIFO Cost of Goods Sold (COGS) attribution and profit margin analytics.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportToExcel}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Export Sales (.xlsx)
          </button>
          <button
            onClick={() => setIsSaleOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Issue Sales Invoice
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Invoiced Revenue</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across {sales.length} invoices</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">FIFO Cost of Goods Sold</p>
          <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">{formatCurrency(totalFifoCogs)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Allocated by batch receipt date</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Realized Gross Profit</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalGrossProfit)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Net revenue after FIFO inventory cost</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gross Margin Efficiency</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{overallMargin.toFixed(1)}%</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Average profitability across all SKUs</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, item code, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredSales.length} of {sales.length} invoices
        </span>
      </div>

      {/* Sales Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Date of Sale</th>
                <th>Item Code</th>
                <th>Customer / Client</th>
                <th className="text-right">Qty Sold</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Total Revenue</th>
                <th className="text-right">FIFO COGS</th>
                <th className="text-right">Gross Profit</th>
                <th className="text-right">Margin %</th>
                <th className="text-center">FIFO Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30 text-blue-500" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {sales.length === 0 ? 'No Sales Invoices Issued' : 'No sales invoices match your search'}
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-3">
                      {sales.length === 0
                        ? 'Issue customer invoices to record revenue, auto-consume FIFO inventory layers, and track gross margins.'
                        : 'Try searching with a different invoice number or customer name.'}
                    </p>
                    {sales.length === 0 && (
                      <button
                        onClick={() => setIsSaleOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Issue First Sales Invoice</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => {
                  const item = items.find((i) => i.code === s.itemCode);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="font-mono font-bold text-blue-700 dark:text-blue-400">#{s.invoiceNo}</td>
                      <td className="whitespace-nowrap text-slate-700 dark:text-slate-300">{s.date}</td>
                      <td>
                        <span className="font-semibold text-slate-900 dark:text-white">{s.itemCode}</span>
                        {item && <span className="block text-[11px] text-slate-500 dark:text-slate-400">{item.name}</span>}
                      </td>
                      <td className="text-slate-700 dark:text-slate-300 text-xs">{s.customer}</td>
                      <td className="text-right font-medium text-slate-700 dark:text-slate-300">{s.qty.toLocaleString()}</td>
                      <td className="text-right font-mono text-slate-800 dark:text-slate-200">{formatCurrency(s.unitValue)}</td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(s.totalValue)}
                      </td>
                      <td className="text-right font-mono text-slate-500 dark:text-slate-400">
                        {formatCurrency(s.fifoCogs)}
                      </td>
                      <td className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(s.grossProfitFifo)}
                      </td>
                      <td className="text-right font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            s.marginPercentFifo >= 30
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800/60'
                              : s.marginPercentFifo >= 15
                              ? 'text-sky-700 bg-sky-50 border border-sky-200 dark:text-sky-300 dark:bg-sky-950/60 dark:border-sky-800/60'
                              : 'text-amber-700 bg-amber-50 border border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800/60'
                          }`}
                        >
                          {s.marginPercentFifo.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => setViewingSale(s)}
                          className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-slate-300 dark:hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Lot Layers</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FIFO Lot Depletion Modal */}
      {viewingSale && (
        <Modal
          isOpen={true}
          onClose={() => setViewingSale(null)}
          title={`FIFO Layer Breakdown — Invoice #${viewingSale.invoiceNo}`}
          description={`Item: ${viewingSale.itemCode} | Total Units Sold: ${viewingSale.qty}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Invoice Revenue: </span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(viewingSale.totalValue)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Total FIFO COGS: </span>
                <span className="font-bold text-sky-600 dark:text-sky-400">{formatCurrency(viewingSale.fifoCogs)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Net Margin: </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(viewingSale.grossProfitFifo)} ({viewingSale.marginPercentFifo}%)
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left data-table text-xs">
                <thead>
                  <tr>
                    <th>Batch Lot Ref</th>
                    <th>Purchase Date</th>
                    <th className="text-right">Qty Drawn</th>
                    <th className="text-right">Unit Cost</th>
                    <th className="text-right">Layer Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingSale.consumedLayers && viewingSale.consumedLayers.length > 0 ? (
                    viewingSale.consumedLayers.map((layer, idx) => (
                      <tr key={idx}>
                        <td className="font-mono text-sky-700 dark:text-sky-400 font-semibold">#{layer.batchInvoiceNo}</td>
                        <td className="text-slate-700 dark:text-slate-300">{layer.batchDate}</td>
                        <td className="text-right font-semibold text-slate-900 dark:text-white">{layer.qtyConsumed} units</td>
                        <td className="text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(layer.unitCost)}</td>
                        <td className="text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(layer.qtyConsumed * layer.unitCost)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        Default single lot depletion applied.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingSale(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      <AddSaleModal isOpen={isSaleOpen} onClose={() => setIsSaleOpen(false)} />
    </div>
  );
}
