'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  Building2,
  AlertOctagon,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const { items, purchases, sales, damagedItems, overallStats, formatCurrency, currency } =
    useInventory();

  const [activeReport, setActiveReport] = useState<'valuation' | 'damage' | 'sales' | 'purchases'>(
    'valuation'
  );

  const printDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  // Multi-tab Excel export
  const handleExportFullAuditWorkbook = () => {
    const wb = XLSX.utils.book_new();

    // 1. Inventory Position
    const invData = items.map((i) => ({
      'Item Code': i.code,
      'Product Name': i.name,
      'Category': i.category,
      'Total Purchased': i.totalPurchasedQty,
      'Total Sold': i.totalSoldQty,
      'Damaged (Quarantined)': i.damagedQty,
      'Available Units': i.availableQty,
      'AVCO Unit Cost': i.avcoUnitCost,
      'Total AVCO Valuation': i.avcoValuation,
      'FIFO Valuation': i.fifoValuation,
      'Reorder Level': i.reorderLevel,
    }));
    const wsInv = XLSX.utils.json_to_sheet(invData);
    XLSX.utils.book_append_sheet(wb, wsInv, 'Inventory Balance');

    // 2. Purchases
    const poData = purchases.map((p) => ({
      'Invoice No': p.invoiceNo,
      'Date': p.date,
      'Item Code': p.itemCode,
      'Supplier': p.supplier,
      'Qty': p.qty,
      'Unit Cost': p.unitValue,
      'Total Invoiced': p.totalValue,
      'Total Landed Cost': p.totalLandedCost || p.totalValue,
      'FIFO Remaining': p.remainingQty,
      'Status': p.status,
    }));
    const wsPo = XLSX.utils.json_to_sheet(poData);
    XLSX.utils.book_append_sheet(wb, wsPo, 'Purchases & GRN');

    // 3. Sales
    const soData = sales.map((s) => ({
      'Invoice No': s.invoiceNo,
      'Date': s.date,
      'Item Code': s.itemCode,
      'Customer': s.customer,
      'Qty': s.qty,
      'Unit Price': s.unitValue,
      'Total Revenue': s.totalValue,
      'FIFO COGS': s.fifoCogs,
      'Gross Profit': s.grossProfitFifo,
      'Margin %': s.marginPercentFifo,
    }));
    const wsSo = XLSX.utils.json_to_sheet(soData);
    XLSX.utils.book_append_sheet(wb, wsSo, 'Sales Invoices');

    // 4. Damaged Items
    const dmgData = damagedItems.map((d) => ({
      'Log ID': d.id,
      'Date': d.date,
      'Item Code': d.itemCode,
      'Damaged Qty': d.qtyDamaged,
      'Reason': d.reason,
      'Action': d.action,
      'Unit Cost': d.unitCostAtDamage,
      'Gross Cost': d.qtyDamaged * d.unitCostAtDamage,
      'Salvage Recovered': d.salvageValueRecovered,
      'Net Write-Off Loss': d.netLoss,
      'Inspector': d.loggedBy,
      'Notes': d.notes || '',
    }));
    const wsDmg = XLSX.utils.json_to_sheet(dmgData);
    XLSX.utils.book_append_sheet(wb, wsDmg, 'Damaged Stock Ledger');

    XLSX.writeFile(wb, `ABC_PVT_LTD_Full_Audit_Workbook_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Audit Reports & Statement Generator
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Print-ready official audit statements and multi-tab master Excel export for ABC (PVT) LTD.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportFullAuditWorkbook}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Export Master Workbook (.xlsx)
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Statement / Save PDF
          </button>
        </div>
      </div>

      {/* Report Selector Tabs (Hidden on Print) */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto no-print shadow-xs">
        {[
          { id: 'valuation', label: '1. Inventory Valuation & Position Statement' },
          { id: 'damage', label: '2. Damaged Stock & Write-Off Audit' },
          { id: 'sales', label: '3. Sales & Profitability Statement' },
          { id: 'purchases', label: '4. Purchases & GRN Ledger' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeReport === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable Report Canvas Document */}
      <div className="card rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-8 shadow-md dark:shadow-2xl space-y-6 text-slate-800 dark:text-slate-200">
        {/* Document Corporate Letterhead */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                ABC
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">ABC (PVT) LTD</h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Enterprise Inventory & Warehouse Management</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Head Office & Central Storage Depot, Colombo, Sri Lanka</p>
          </div>

          <div className="text-right text-xs">
            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {activeReport === 'valuation' && 'Inventory Valuation Statement'}
              {activeReport === 'damage' && 'Damaged Stock Quarantine & Write-Off Audit'}
              {activeReport === 'sales' && 'Commercial Sales Profitability Statement'}
              {activeReport === 'purchases' && 'Inbound Procurement & GRN Statement'}
            </p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Date of Statement: {printDate}</p>
            <p className="text-slate-500 dark:text-slate-400">Currency: {currency} (LKR Standard)</p>
          </div>
        </div>

        {/* Executive Summary Metrics within Report */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Total Available Units:</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {overallStats.totalAvailableUnits.toLocaleString()} Units
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Isolated Damaged Units:</span>
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              {overallStats.totalDamagedUnits.toLocaleString()} Units
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">AVCO Asset Valuation:</span>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {formatCurrency(overallStats.totalAvcoValuation)}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Net Damaged Write-Off:</span>
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              {formatCurrency(overallStats.totalDamagedLoss)}
            </p>
          </div>
        </div>

        {/* Dynamic Table based on Active Report Tab */}
        {activeReport === 'valuation' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left data-table text-xs">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Product Description</th>
                  <th>Category</th>
                  <th className="text-right">Purchased</th>
                  <th className="text-right">Sold</th>
                  <th className="text-right text-rose-600 dark:text-rose-400">Damaged</th>
                  <th className="text-right font-bold text-emerald-600 dark:text-emerald-400">Available</th>
                  <th className="text-right">AVCO Cost</th>
                  <th className="text-right">FIFO Cost</th>
                  <th className="text-right font-bold text-slate-900 dark:text-white">AVCO Valuation</th>
                  <th className="text-right font-bold text-emerald-600 dark:text-emerald-400">FIFO Valuation</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      No inventory records to display in statement.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="font-bold text-slate-900 dark:text-white">{item.code}</td>
                      <td className="text-slate-700 dark:text-slate-200">{item.name}</td>
                      <td className="text-slate-600 dark:text-slate-300">{item.category}</td>
                      <td className="text-right">{item.totalPurchasedQty.toLocaleString()}</td>
                      <td className="text-right">{item.totalSoldQty.toLocaleString()}</td>
                      <td className="text-right font-semibold text-rose-600 dark:text-rose-400">{item.damagedQty}</td>
                      <td className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {item.availableQty} {item.unit}
                      </td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(item.avcoUnitCost)}</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(item.fifoUnitCost)}</td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.avcoValuation)}
                      </td>
                      <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.fifoValuation)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-slate-100 dark:bg-slate-900/80 border-t border-slate-300 dark:border-slate-700">
                  <td colSpan={6} className="text-right uppercase text-slate-700 dark:text-slate-300">Portfolio Total Valuation:</td>
                  <td className="text-right text-emerald-600 dark:text-emerald-400">{overallStats.totalAvailableUnits} Units</td>
                  <td colSpan={2} />
                  <td className="text-right font-mono text-slate-900 dark:text-white">{formatCurrency(overallStats.totalAvcoValuation)}</td>
                  <td className="text-right font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(overallStats.totalFifoValuation)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {activeReport === 'damage' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left data-table text-xs">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Date</th>
                  <th>Item Code</th>
                  <th className="text-right text-rose-600 dark:text-rose-400">Damaged Qty</th>
                  <th>Damage Reason</th>
                  <th>Disposition Action</th>
                  <th className="text-right">Unit Cost</th>
                  <th className="text-right">Gross Loss</th>
                  <th className="text-right">Salvage Value</th>
                  <th className="text-right text-rose-600 dark:text-rose-400 font-bold">Net Write-Off</th>
                  <th>Inspector</th>
                </tr>
              </thead>
              <tbody>
                {damagedItems.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      No damaged stock incidents on record.
                    </td>
                  </tr>
                ) : (
                  damagedItems.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{d.id}</td>
                    <td className="text-slate-700 dark:text-slate-300">{d.date}</td>
                    <td className="font-semibold text-slate-900 dark:text-white">{d.itemCode}</td>
                    <td className="text-right font-bold text-rose-600 dark:text-rose-400">{d.qtyDamaged}</td>
                    <td className="text-slate-700 dark:text-slate-200">{d.reason}</td>
                    <td>{d.action}</td>
                    <td className="text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(d.unitCostAtDamage)}</td>
                    <td className="text-right font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrency(d.qtyDamaged * d.unitCostAtDamage)}
                    </td>
                    <td className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(d.salvageValueRecovered)}
                    </td>
                    <td className="text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(d.netLoss)}
                    </td>
                    <td className="text-slate-700 dark:text-slate-300">{d.loggedBy}</td>
                  </tr>
                )))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-slate-100 dark:bg-slate-900/80 border-t border-slate-300 dark:border-slate-700">
                  <td colSpan={3} className="text-right uppercase text-slate-700 dark:text-slate-300">Cumulative Damage Losses:</td>
                  <td className="text-right text-rose-600 dark:text-rose-400">{overallStats.totalDamagedUnits} Units</td>
                  <td colSpan={4} />
                  <td className="text-right font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(overallStats.totalDamagedSalvage)}</td>
                  <td className="text-right font-mono text-rose-600 dark:text-rose-400">{formatCurrency(overallStats.totalDamagedLoss)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {activeReport === 'sales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left data-table text-xs">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Item Code</th>
                  <th>Customer</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Selling Price</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">FIFO COGS</th>
                  <th className="text-right font-bold text-emerald-600 dark:text-emerald-400">Gross Profit</th>
                  <th className="text-right">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No commercial sales invoices on record.
                    </td>
                  </tr>
                ) : (
                  sales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="font-mono font-bold text-blue-600 dark:text-blue-400">#{s.invoiceNo}</td>
                      <td className="text-slate-700 dark:text-slate-300">{s.date}</td>
                      <td className="font-semibold text-slate-900 dark:text-white">{s.itemCode}</td>
                      <td className="text-slate-700 dark:text-slate-200">{s.customer}</td>
                      <td className="text-right font-medium">{s.qty.toLocaleString()}</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(s.unitValue)}</td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(s.totalValue)}
                      </td>
                      <td className="text-right font-mono text-slate-500 dark:text-slate-400">{formatCurrency(s.fifoCogs)}</td>
                      <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(s.grossProfitFifo)}
                      </td>
                      <td className="text-right font-semibold text-slate-700 dark:text-slate-300">{s.marginPercentFifo}%</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-slate-100 dark:bg-slate-900/80 border-t border-slate-300 dark:border-slate-700">
                  <td colSpan={6} className="text-right uppercase text-slate-700 dark:text-slate-300">Total Financial Results:</td>
                  <td className="text-right font-mono text-slate-900 dark:text-white">{formatCurrency(overallStats.totalRevenue)}</td>
                  <td className="text-right font-mono text-slate-600 dark:text-slate-300">{formatCurrency(overallStats.totalFifoCogs)}</td>
                  <td className="text-right font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(overallStats.totalGrossProfit)}</td>
                  <td className="text-right">
                    {((overallStats.totalGrossProfit / (overallStats.totalRevenue || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {activeReport === 'purchases' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left data-table text-xs">
              <thead>
                <tr>
                  <th>PO Invoice #</th>
                  <th>Date</th>
                  <th>Item Code</th>
                  <th>Supplier</th>
                  <th className="text-right">Qty Received</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right font-bold text-slate-900 dark:text-white">Total Value</th>
                  <th className="text-right">Landed Unit Cost</th>
                  <th className="text-right">FIFO Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No inbound purchase batches on record.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="font-mono font-bold text-sky-600 dark:text-sky-400">#{p.invoiceNo}</td>
                      <td className="text-slate-700 dark:text-slate-300">{p.date}</td>
                      <td className="font-semibold text-slate-900 dark:text-white">{p.itemCode}</td>
                      <td className="text-slate-700 dark:text-slate-200">{p.supplier}</td>
                      <td className="text-right font-medium">{p.qty.toLocaleString()}</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(p.unitValue)}</td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(p.totalValue)}
                      </td>
                      <td className="text-right font-mono text-sky-700 dark:text-sky-300">
                        {formatCurrency(p.landedUnitCost || p.unitValue)}
                      </td>
                      <td className="text-right font-bold text-slate-900 dark:text-white">{p.remainingQty} units</td>
                      <td>
                        <Badge variant={p.status === 'active' ? 'success' : 'default'}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Signatory Block for Audit */}
        <div className="pt-10 grid grid-cols-3 gap-8 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
          <div>
            <div className="border-b border-slate-300 dark:border-slate-700 h-8 mb-1" />
            <p className="font-semibold text-slate-800 dark:text-slate-200">Prepared By: Warehouse Lead</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Inventory Controller / Stores</p>
          </div>
          <div>
            <div className="border-b border-slate-300 dark:border-slate-700 h-8 mb-1" />
            <p className="font-semibold text-slate-800 dark:text-slate-200">Inspected By: Quality Auditor</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Damaged Quarantine Section</p>
          </div>
          <div>
            <div className="border-b border-slate-300 dark:border-slate-700 h-8 mb-1" />
            <p className="font-semibold text-slate-800 dark:text-slate-200">Approved By: Finance Director</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">ABC (PVT) LTD Management</p>
          </div>
        </div>
      </div>
    </div>
  );
}
