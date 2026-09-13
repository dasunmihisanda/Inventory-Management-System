'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useInventory } from '@/context/InventoryContext';
import { PackagePlus, CheckCircle2 } from 'lucide-react';
import { handleNumericInput } from '@/lib/utils';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose }) => {
  const { addNewItem, items } = useInventory();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('Units');
  const [reorderLevel, setReorderLevel] = useState<number | string>(10);
  const [standardSellingPrice, setStandardSellingPrice] = useState<number | string>(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code.trim() || !name.trim()) {
      setErrorMsg('Item code and product name are required.');
      return;
    }

    if (items.some((i) => i.code.toLowerCase() === code.trim().toLowerCase())) {
      setErrorMsg(`Item code '${code}' already exists in inventory.`);
      return;
    }

    const numReorder = parseInt(String(reorderLevel)) || 0;
    const numSelling = parseFloat(String(standardSellingPrice)) || 0;

    addNewItem({
      code: code.trim(),
      name: name.trim(),
      category: category.trim(),
      unit: unit.trim(),
      reorderLevel: numReorder,
      standardSellingPrice: numSelling,
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setCode('');
      setName('');
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Inventory Product"
      description="Register a new SKU into ABC (PVT) LTD's master catalog."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Product added to inventory master catalog!</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Item Code / SKU *
          </label>
          <input
            type="text"
            placeholder="e.g. SKU-001 or PROD-A"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Product Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Standard Product Description"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Unit of Measure
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Min Reorder Level
            </label>
            <input
              type="number"
              min="0"
              value={reorderLevel}
              placeholder="0"
              onFocus={(e) => e.target.select()}
              onChange={(e) => setReorderLevel(handleNumericInput(e.target.value))}
              onBlur={() => {
                if (reorderLevel === '') setReorderLevel(0);
              }}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Target Selling Price
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={standardSellingPrice}
              placeholder="0"
              onFocus={(e) => e.target.select()}
              onChange={(e) => setStandardSellingPrice(handleNumericInput(e.target.value))}
              onBlur={() => {
                if (standardSellingPrice === '') setStandardSellingPrice(0);
              }}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
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
            <PackagePlus className="w-3.5 h-3.5" />
            Add SKU to Catalog
          </button>
        </div>
      </form>
    </Modal>
  );
};
