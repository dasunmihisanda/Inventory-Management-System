'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useInventory } from '@/context/InventoryContext';
import { CheckCircle2, ShoppingBag, AlertCircle, PlusCircle, ListFilter } from 'lucide-react';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItemCode?: string;
}

export const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({
  isOpen,
  onClose,
  preselectedItemCode,
}) => {
  const { items, addPurchase, addNewItem, formatCurrency } = useInventory();

  const [invoiceNo, setInvoiceNo] = useState(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemCode, setItemCode] = useState(preselectedItemCode || (items[0]?.code ?? ''));
  const [supplier, setSupplier] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [unitValue, setUnitValue] = useState<number>(0);
  const [freightCost, setFreightCost] = useState<number>(0);
  const [customsDuty, setCustomsDuty] = useState<number>(0);
  const [handlingCost, setHandlingCost] = useState<number>(0);
  const [isNewSku, setIsNewSku] = useState(items.length === 0);
  const [newSkuCode, setNewSkuCode] = useState('');
  const [newSkuName, setNewSkuName] = useState('');
  const [newSkuCategory, setNewSkuCategory] = useState('General');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  React.useEffect(() => {
    if (items.length === 0) {
      setIsNewSku(true);
    }
  }, [items.length]);

  React.useEffect(() => {
    if (preselectedItemCode) {
      setItemCode(preselectedItemCode);
      setIsNewSku(false);
      const item = items.find((i) => i.code === preselectedItemCode);
      if (item) setUnitValue(item.lastPurchasePrice);
    } else if (items.length > 0 && !itemCode) {
      setItemCode(items[0].code);
      setUnitValue(items[0].lastPurchasePrice);
    }
  }, [preselectedItemCode, items, itemCode]);

  const subtotal = qty * unitValue;
  const totalLanded = subtotal + freightCost + customsDuty + handlingCost;
  const landedPerUnit = qty > 0 ? totalLanded / qty : unitValue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const finalItemCode = isNewSku ? newSkuCode.trim() : itemCode.trim();

    if (!finalItemCode) {
      setErrorMsg('Please select or enter a valid Item Code / SKU.');
      return;
    }

    if (qty <= 0) {
      setErrorMsg('Quantity received must be at least 1.');
      return;
    }

    if (unitValue <= 0) {
      setErrorMsg('Unit purchase value must be greater than 0.');
      return;
    }

    // If entering a new SKU that does not exist in master catalog yet, register it
    if (isNewSku) {
      const alreadyExists = items.some((i) => i.code.trim().toLowerCase() === finalItemCode.toLowerCase());
      if (!alreadyExists) {
        addNewItem({
          code: finalItemCode,
          name: newSkuName.trim() || finalItemCode,
          category: newSkuCategory.trim() || 'General',
          unit: 'Units',
          reorderLevel: 10,
          standardSellingPrice: Math.round(landedPerUnit * 1.3),
        });
      }
    }

    addPurchase({
      invoiceNo,
      date,
      itemCode: finalItemCode,
      supplier: supplier.trim() || 'General Supplier',
      qty,
      unitValue,
      freightCost,
      customsDuty,
      handlingCost,
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setErrorMsg('');
      if (isNewSku) {
        setNewSkuCode('');
        setNewSkuName('');
      }
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Purchase Order / GRN"
      description="Record incoming shipment with landed cost breakdown. Creates an active lot for FIFO and updates AVCO."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Purchase batch registered successfully! Added to FIFO queue and inventory balance.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Invoice / PO Number *
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
              Date of Purchase *
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

        {/* Item Selection / Creation Mode */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Product SKU / Item Code *
            </label>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setIsNewSku(!isNewSku)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {isNewSku ? (
                  <>
                    <ListFilter className="w-3 h-3" />
                    <span>Choose from existing SKUs</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3 h-3" />
                    <span>+ Enter new SKU</span>
                  </>
                )}
              </button>
            )}
          </div>

          {isNewSku ? (
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    New Item Code / SKU *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SKU-1001 or A01"
                    value={newSkuCode}
                    onChange={(e) => setNewSkuCode(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    required={isNewSku}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Product Description / Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Leather Shoe"
                    value={newSkuName}
                    onChange={(e) => setNewSkuName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                This item will be automatically registered into ABC (PVT) LTD master inventory.
              </p>
            </div>
          ) : (
            <select
              value={itemCode}
              onChange={(e) => {
                setItemCode(e.target.value);
                const item = items.find((i) => i.code === e.target.value);
                if (item) setUnitValue(item.lastPurchasePrice);
              }}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white"
              required={!isNewSku}
            >
              {items.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.code} — {i.name} (Current Available: {i.availableQty})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Supplier Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Acme Corp Ltd"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Quantity Received *
            </label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Unit Purchase Value *
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

        {/* Landed Cost Breakdown inputs */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
            Inbound Landed Cost Elements
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Freight / Cargo</label>
              <input
                type="number"
                min="0"
                value={freightCost}
                onChange={(e) => setFreightCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Customs Duties</label>
              <input
                type="number"
                min="0"
                value={customsDuty}
                onChange={(e) => setCustomsDuty(parseFloat(e.target.value) || 0)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Handling / Port</label>
              <input
                type="number"
                min="0"
                value={handlingCost}
                onChange={(e) => setHandlingCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Total Landed Investment: </span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalLanded)}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">True Landed Cost/Unit: </span>
              <span className="font-bold text-sky-600 dark:text-sky-400">{formatCurrency(landedPerUnit)}</span>
            </div>
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
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/30"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Receive Batch & Add to Stock
          </button>
        </div>
      </form>
    </Modal>
  );
};
