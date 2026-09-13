'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useInventory } from '@/context/InventoryContext';
import { CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

interface AddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItemCode?: string;
}

export const AddSaleModal: React.FC<AddSaleModalProps> = ({
  isOpen,
  onClose,
  preselectedItemCode,
}) => {
  const { items, recordSale, formatCurrency } = useInventory();

  const [invoiceNo, setInvoiceNo] = useState(`SAL-${Math.floor(2000 + Math.random() * 8000)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemCode, setItemCode] = useState(preselectedItemCode || (items[0]?.code ?? ''));
  const [customer, setCustomer] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [unitValue, setUnitValue] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    if (preselectedItemCode) {
      setItemCode(preselectedItemCode);
      const item = items.find((i) => i.code === preselectedItemCode);
      if (item) setUnitValue(item.standardSellingPrice);
    } else if (items.length > 0 && !itemCode) {
      setItemCode(items[0].code);
      setUnitValue(items[0].standardSellingPrice);
    }
  }, [preselectedItemCode, items, itemCode]);

  const selectedItem = items.find((i) => i.code === itemCode);
  const availableQty = selectedItem?.availableQty || 0;
  const unitCost = selectedItem?.avcoUnitCost || 0;

  const totalRevenue = qty * unitValue;
  const estimatedCost = qty * unitCost;
  const estimatedProfit = totalRevenue - estimatedCost;
  const estimatedMargin = totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (qty <= 0) {
      setFeedback({ type: 'error', message: 'Sales quantity must be greater than 0.' });
      return;
    }

    if (qty > availableQty) {
      setFeedback({
        type: 'error',
        message: `Insufficient stock! Only ${availableQty} units available (excluding damaged units).`,
      });
      return;
    }

    const res = recordSale({
      invoiceNo,
      date,
      itemCode,
      customer,
      qty,
      unitValue,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sales Invoice"
      description="Record customer invoice. Automatically consumes FIFO purchase lots sequentially and logs profit margins."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Invoice Number *
            </label>
            <input
              type="text"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Date of Sale *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Select Item Code *
            </label>
            {items.length === 0 ? (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs">
                No items in stock. Please add items and receive purchases first.
              </div>
            ) : (
              <select
                value={itemCode}
                onChange={(e) => {
                  setItemCode(e.target.value);
                  const item = items.find((i) => i.code === e.target.value);
                  if (item) setUnitValue(item.standardSellingPrice);
                }}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white"
                required
              >
                {items.map((i) => (
                  <option key={i.code} value={i.code}>
                    {i.code} — {i.name} (Stock: {i.availableQty})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Customer / Client Name *
            </label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </div>
        </div>

        {/* Real-time stock status badge */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Available Undamaged Stock: </span>
            <span
              className={`font-bold ${
                availableQty > 20
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : availableQty > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {availableQty} units
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Inventory Unit AVCO: </span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(unitCost)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Quantity Sold *
            </label>
            <input
              type="number"
              min="1"
              max={availableQty}
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Unit Selling Price *
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={unitValue}
              onChange={(e) => setUnitValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </div>
        </div>

        {/* Real-time margin preview */}
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center justify-between text-xs">
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Total Invoice Revenue</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Projected Margin</p>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              {formatCurrency(estimatedProfit)} ({estimatedMargin.toFixed(1)}%)
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={availableQty <= 0}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Issue Invoice & Deplete Stock
          </button>
        </div>
      </form>
    </Modal>
  );
};
