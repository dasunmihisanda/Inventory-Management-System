'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  Settings,
  Building2,
  DollarSign,
  RotateCcw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function SettingsPage() {
  const { currency, setCurrency, resetToDefaultData } = useInventory();
  const [companyName, setCompanyName] = useState('ABC (PVT) LTD');
  const [regNo, setRegNo] = useState('PV-102948/2023');
  const [warehouseLocation, setWarehouseLocation] = useState('Central Logistics Park, Orugodawatta, Colombo');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all inventory, purchases, sales, and damaged records? This will completely reset your system to a fresh, clean slate.'
      )
    ) {
      resetToDefaultData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          Business Profile & System Configuration
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Configure company parameters, currency symbols, and master data synchronization for ABC (PVT) LTD.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Business configuration saved successfully!</span>
        </div>
      )}

      {resetSuccess && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>All system data cleared! System reset to a completely fresh, empty state.</span>
        </div>
      )}

      {/* Business Details Form */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 shadow-xs dark:shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Company Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Registered Entity Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Company Registration No.
              </label>
              <input
                type="text"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Primary Central Warehouse & Delivery Address
            </label>
            <input
              type="text"
              value={warehouseLocation}
              onChange={(e) => setWarehouseLocation(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Currency & Financial Preferences */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 shadow-xs dark:shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Currency & Financial Defaults</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Display Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Rs.">Rs. — Sri Lankan Rupee (LKR)</option>
                <option value="$">$ — US Dollar (USD)</option>
                <option value="€">€ — Euro (EUR)</option>
                <option value="£">£ — British Pound (GBP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Financial Valuation Standard
              </label>
              <input
                type="text"
                disabled
                value="LKAS 2 / IAS 2 Weighted AVCO & FIFO Supported"
                className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>

      {/* Baseline Data Reset Section */}
      <div className="rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-6 shadow-xs dark:shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">Clear All Records & Reset to Clean Slate</h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Wipe all inventory balance levels, purchase orders, sales invoices, and damaged item records. Your system will reset to a completely fresh, empty state ready for live data entry.
        </p>
        <div className="pt-2">
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 dark:shadow-rose-950 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All Data & Reset to Clean Slate
          </button>
        </div>
      </div>
    </div>
  );
}
