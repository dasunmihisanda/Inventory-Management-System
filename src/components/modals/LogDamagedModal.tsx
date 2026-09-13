'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useInventory } from '@/context/InventoryContext';
import { DamageReason, DamageAction } from '@/types/inventory';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { handleNumericInput } from '@/lib/utils';

interface LogDamagedModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItemCode?: string;
}

export const LogDamagedModal: React.FC<LogDamagedModalProps> = ({
  isOpen,
  onClose,
  preselectedItemCode,
}) => {
  const { items, purchases, logDamagedItem, formatCurrency } = useInventory();

  const [itemCode, setItemCode] = useState(preselectedItemCode || (items[0]?.code ?? ''));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [qtyDamaged, setQtyDamaged] = useState<number | string>(1);
  const [reason, setReason] = useState<DamageReason>('Transit Defect');
  const [action, setAction] = useState<DamageAction>('Written Off / Scrapped');
  const [batchRef, setBatchRef] = useState<string>('');
  const [salvageRecovered, setSalvageRecovered] = useState<number | string>(0);
  const [loggedBy, setLoggedBy] = useState('Quality Control Officer');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    if (preselectedItemCode) {
      setItemCode(preselectedItemCode);
    } else if (items.length > 0 && !itemCode) {
      setItemCode(items[0].code);
    }
  }, [preselectedItemCode, items, itemCode]);

  const selectedItem = items.find((i) => i.code === itemCode);
  const unitCost = selectedItem?.avcoUnitCost || 0;
  const availableQty = selectedItem?.availableQty || 0;

  const itemBatches = purchases.filter(
    (p) => p.itemCode === itemCode && p.status === 'active' && p.remainingQty > 0
  );

  const numQtyDamaged = parseInt(String(qtyDamaged)) || 0;
  const numSalvage = parseFloat(String(salvageRecovered)) || 0;

  const estimatedLoss = Math.max(0, numQtyDamaged * unitCost - numSalvage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (numQtyDamaged <= 0) {
      setFeedback({ type: 'error', message: 'Damaged quantity must be greater than zero.' });
      return;
    }

    if (numQtyDamaged > availableQty) {
      setFeedback({
        type: 'error',
        message: `Requested ${numQtyDamaged} units exceeds available undamaged inventory (${availableQty}).`,
      });
      return;
    }

    const res = logDamagedItem({
      itemCode,
      date,
      qtyDamaged: numQtyDamaged,
      reason,
      action,
      batchRef: batchRef || undefined,
      unitCostAtDamage: unitCost,
      salvageValueRecovered: numSalvage,
      loggedBy,
      notes,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Identify & Quarantine Damaged Stock"
      description="Quarantining or writing off damaged items permanently deducts them from available inventory to protect sales order fulfillment."
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
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Select Inventory Item *
            </label>
            {items.length === 0 ? (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs">
                No items in stock. Please add items and receive stock first.
              </div>
            ) : (
              <select
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
                required
              >
                {items.map((i) => (
                  <option key={i.code} value={i.code}>
                    {i.code} — {i.name} (Avail: {i.availableQty})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Discovery / Log Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
              required
            />
          </div>
        </div>

        {/* Current Available Stock Status Card */}
        {selectedItem && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Available Stock: </span>
              <span className="font-semibold text-slate-900 dark:text-white">{availableQty} {selectedItem.unit}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Current AVCO Cost: </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(unitCost)}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Already Damaged: </span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">{selectedItem.damagedQty} units</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Damaged Quantity to Remove *
            </label>
            <input
              type="number"
              min="1"
              max={availableQty}
              value={qtyDamaged}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setQtyDamaged(handleNumericInput(e.target.value))}
              onBlur={() => {
                if (qtyDamaged === '' || numQtyDamaged < 1) setQtyDamaged(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
              required
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Max removable: {availableQty} units
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Specific Batch / Lot Ref (Optional)
            </label>
            <select
              value={batchRef}
              onChange={(e) => setBatchRef(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
            >
              <option value="">Auto-deduct from earliest FIFO lot</option>
              {itemBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  Batch {b.invoiceNo} ({b.date}) — Rem: {b.remainingQty}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Damage Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as DamageReason)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
            >
              <option value="Transit Defect">Transit Defect</option>
              <option value="Handling Damage">Handling Damage</option>
              <option value="Water / Moisture">Water / Moisture</option>
              <option value="Manufacturing Flaw">Manufacturing Flaw</option>
              <option value="Deterioration / Age">Deterioration / Age</option>
              <option value="Customer Return - Damaged">Customer Return - Damaged</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Disposition / Removal Action *
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as DamageAction)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
            >
              <option value="Written Off / Scrapped">Written Off / Scrapped (Complete Loss)</option>
              <option value="Quarantined for Review">Quarantined for Inspection</option>
              <option value="Returned to Vendor">Return to Vendor (Credit Claim)</option>
              <option value="Salvage Sale">Salvage Sale (Discount Outlet)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Salvage Value Recovered ({formatCurrency(0).split(' ')[0]})
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={salvageRecovered}
              placeholder="0"
              onFocus={(e) => e.target.select()}
              onChange={(e) => setSalvageRecovered(handleNumericInput(e.target.value))}
              onBlur={() => {
                if (salvageRecovered === '') setSalvageRecovered(0);
              }}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Inspector / Logged By *
            </label>
            <input
              type="text"
              value={loggedBy}
              onChange={(e) => setLoggedBy(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Inspection Notes / Evidence
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
            placeholder="Describe defect location, container seal condition, or supplier claim ref..."
          />
        </div>

        {/* Live Loss Impact Card */}
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-rose-900 dark:text-rose-200">Financial Write-Off Impact</p>
              <p className="text-[11px] text-rose-700 dark:text-rose-400/80">
                Gross Cost: {formatCurrency(numQtyDamaged * unitCost)} - Salvage: {formatCurrency(numSalvage)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-rose-700 dark:text-rose-300">Net Stock Loss</p>
            <p className="text-base font-bold text-rose-600 dark:text-rose-400">{formatCurrency(estimatedLoss)}</p>
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
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/30"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Confirm Damage & Remove from Stock
          </button>
        </div>
      </form>
    </Modal>
  );
};
